from pydantic import BaseModel
from typing import Optional
from datetime import date

class PropertyCreate(BaseModel):
    name: str
    address: str
    property_type: str
    meter_number: Optional[str] = None

class PropertyResponse(BaseModel):
    id: int
    name: str
    address: str
    property_type: str
    meter_number: Optional[str]
    owner_id: int

    class Config:
        from_attributes = True


class TenantCreate(BaseModel):
    full_name: str
    phone: Optional[str] = None
    nid_number: Optional[str] = None

class TenantResponse(BaseModel):
    id: int
    full_name: str
    phone: Optional[str]
    nid_number: Optional[str]

    class Config:
        from_attributes = True



class LeaseCreate(BaseModel):
    property_id: int
    tenant_id: int
    start_date: date
    monthly_rent: float

class LeaseResponse(BaseModel):
    id: int
    property_id: int
    tenant_id: int
    start_date: date
    end_date: Optional[date]
    monthly_rent: float
    tenant: TenantResponse

    class Config:
        from_attributes = True

class PropertyBasic(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class LeaseWithPropertyResponse(BaseModel):
    id: int
    property_id: int
    tenant_id: int
    start_date: date
    end_date: Optional[date]
    monthly_rent: float
    tenant: TenantResponse
    property: PropertyBasic

    class Config:
        from_attributes = True



class RentPaymentCreate(BaseModel):
    lease_id: int
    month: str


class RentPaymentUpdate(BaseModel):
    amount_paid: float
    paid_date: date
    receipt_number: str
    is_paid: bool = True

class RentPaymentResponse(BaseModel):
    id: int
    lease_id: int
    month: str
    amount_paid: float
    paid_date: Optional[date]
    receipt_number: Optional[str]
    is_paid: bool

    class Config:
        from_attributes = True


class BillCreate(BaseModel):
    property_id: int
    bill_type: str
    amount: float
    due_date: date
    notes: Optional[str] = None

class BillUpdate(BaseModel):
    amount: Optional[float] = None
    paid: bool
    paid_date: Optional[date] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None

class BillResponse(BaseModel):
    id: int
    property_id: int
    bill_type: str
    amount: float
    due_date: date
    paid: bool
    paid_date: Optional[date]
    reference_number: Optional[str]
    notes: Optional[str]

    class Config:
        from_attributes = True

class BillWithPropertyResponse(BaseModel):
    id: int
    property_id: int
    bill_type: str
    amount: float
    due_date: date
    paid: bool
    paid_date: Optional[date]
    reference_number: Optional[str]
    notes: Optional[str]
    property: PropertyBasic

    class Config:
        from_attributes = True