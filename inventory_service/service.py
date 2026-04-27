import threading
from typing import Dict, Tuple


class InventoryService:
    """Simple in-memory inventory core.

    Tracks on-hand stock per (sku, location) and reservations by id.
    Provides idempotent reserve/commit/release operations.
    """

    def __init__(self):
        self._lock = threading.Lock()
        # stock: (sku, location) -> int
        self._stock: Dict[Tuple[str, str], int] = {}
        # reservations: reservation_id -> {sku, location, qty, status}
        self._reservations: Dict[str, Dict] = {}

    def add_stock(self, sku: str, location: str, quantity: int):
        key = (sku, location)
        with self._lock:
            self._stock[key] = self._stock.get(key, 0) + max(0, quantity)

    def get_on_hand(self, sku: str, location: str) -> int:
        return self._stock.get((sku, location), 0)

    def get_reserved(self, sku: str, location: str) -> int:
        total = 0
        with self._lock:
            for r in self._reservations.values():
                if r["sku"] == sku and r["location"] == location and r["status"] == "reserved":
                    total += r["quantity"]
        return total

    def get_available(self, sku: str, location: str) -> int:
        return self.get_on_hand(sku, location) - self.get_reserved(sku, location)

    def reserve(self, reservation_id: str, sku: str, location: str, quantity: int) -> Tuple[bool, str]:
        if quantity <= 0:
            return False, "quantity must be positive"

        with self._lock:
            # idempotency: if reservation exists, return its current state
            if reservation_id in self._reservations:
                r = self._reservations[reservation_id]
                if r["status"] == "reserved":
                    return True, "already reserved"
                else:
                    return False, f"reservation exists with status {r['status']}"

            avail = self.get_available(sku, location)
            if avail >= quantity:
                # create reservation
                self._reservations[reservation_id] = {
                    "sku": sku,
                    "location": location,
                    "quantity": quantity,
                    "status": "reserved",
                }
                return True, "reserved"
            else:
                return False, f"insufficient available stock ({avail})"

    def commit(self, reservation_id: str) -> Tuple[bool, str]:
        with self._lock:
            r = self._reservations.get(reservation_id)
            if not r:
                return False, "reservation not found"
            if r["status"] != "reserved":
                return False, f"reservation not in reserved state ({r['status']})"

            key = (r["sku"], r["location"])
            on_hand = self._stock.get(key, 0)
            if on_hand >= r["quantity"]:
                self._stock[key] = on_hand - r["quantity"]
                r["status"] = "committed"
                return True, "committed"
            else:
                # This should be rare if reservations were honored, but handle gracefully
                r["status"] = "failed"
                return False, "insufficient stock at commit"

    def release(self, reservation_id: str) -> Tuple[bool, str]:
        with self._lock:
            r = self._reservations.get(reservation_id)
            if not r:
                return False, "reservation not found"
            if r["status"] != "reserved":
                return False, f"reservation not in reserved state ({r['status']})"
            r["status"] = "released"
            return True, "released"
