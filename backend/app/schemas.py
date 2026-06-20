from pydantic import BaseModel
from typing import Optional

class PropertyCreate(BaseModel):
    name: str
    address: str
    property_type: str

class PropertyResponse(BaseModel):
    id: int
    name: str
    address: str
    property_type: str
    owner_id: int

    class Config:
        from_attributes = True