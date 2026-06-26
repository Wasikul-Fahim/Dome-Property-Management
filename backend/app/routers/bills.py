from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.BillResponse)
def create_bill(
    data: schemas.BillCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    prop = db.query(models.Property).filter(
        models.Property.id == data.property_id,
        models.Property.owner_id == current_user.id
    ).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    bill = models.Bill(**data.dict())
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill

@router.get("/property/{property_id}", response_model=List[schemas.BillResponse])
def get_bills_for_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    prop = db.query(models.Property).filter(
        models.Property.id == property_id,
        models.Property.owner_id == current_user.id
    ).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    return db.query(models.Bill).filter(
        models.Bill.property_id == property_id
    ).order_by(models.Bill.due_date.desc()).all()

@router.put("/{bill_id}", response_model=schemas.BillResponse)
def update_bill(
    bill_id: int,
    data: schemas.BillUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    bill = db.query(models.Bill).join(models.Property).filter(
        models.Bill.id == bill_id,
        models.Property.owner_id == current_user.id
    ).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    bill.paid = data.paid
    if data.amount is not None:
        bill.amount = data.amount
    bill.paid_date = data.paid_date
    bill.reference_number = data.reference_number
    bill.notes = data.notes
    db.commit()
    db.refresh(bill)
    return bill

@router.delete("/{bill_id}")
def delete_bill(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    bill = db.query(models.Bill).join(models.Property).filter(
        models.Bill.id == bill_id,
        models.Property.owner_id == current_user.id
    ).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    db.delete(bill)
    db.commit()
    return {"message": "Bill deleted"}


@router.get("/all", response_model=List[schemas.BillWithPropertyResponse])
def get_all_bills(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """All bills across all of the user's properties — used for the dashboard."""
    return db.query(models.Bill).join(models.Property).filter(
        models.Property.owner_id == current_user.id
    ).order_by(models.Bill.due_date.asc()).all()