from fastapi import FastAPI, HTTPException
from inventory_service.models import StockUpdate, ReservationRequest, ReservationResponse
from inventory_service.service import InventoryService

app = FastAPI(title="Inventory Core Service")
svc = InventoryService()


@app.post("/stock/add")
def add_stock(u: StockUpdate):
    svc.add_stock(u.sku, u.location, u.quantity)
    return {"ok": True, "on_hand": svc.get_on_hand(u.sku, u.location)}


@app.get("/stock/{sku}/{location}")
def get_stock(sku: str, location: str):
    return {
        "sku": sku,
        "location": location,
        "on_hand": svc.get_on_hand(sku, location),
        "reserved": svc.get_reserved(sku, location),
        "available": svc.get_available(sku, location),
    }


@app.post("/reserve", response_model=ReservationResponse)
def reserve(r: ReservationRequest):
    success, msg = svc.reserve(r.reservation_id, r.sku, r.location, r.quantity)
    if success:
        return ReservationResponse(reservation_id=r.reservation_id, success=True, message=msg)
    raise HTTPException(status_code=400, detail=msg)


@app.post("/commit/{reservation_id}")
def commit_reservation(reservation_id: str):
    success, msg = svc.commit(reservation_id)
    if success:
        return {"ok": True, "message": msg}
    raise HTTPException(status_code=400, detail=msg)


@app.post("/release/{reservation_id}")
def release_reservation(reservation_id: str):
    success, msg = svc.release(reservation_id)
    if success:
        return {"ok": True, "message": msg}
    raise HTTPException(status_code=400, detail=msg)
