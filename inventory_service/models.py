from pydantic import BaseModel
from typing import Optional


class StockUpdate(BaseModel):
    sku: str
    location: str
    quantity: int


class ReservationRequest(BaseModel):
    reservation_id: str
    sku: str
    location: str
    quantity: int


class ReservationResponse(BaseModel):
    reservation_id: str
    success: bool
    message: Optional[str] = None
