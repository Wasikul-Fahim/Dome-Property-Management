from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.LeaseResponse)
def create_lease(
    data: schemas.LeaseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify the property belongs to this user
    prop = db.query(models.Property).filter(
        models.Property.id == data.property_id,
        models.Property.owner_id == current_user.id
    ).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    # Auto-close any existing active lease on this property
    active_lease = db.query(models.Lease).filter(
        models.Lease.property_id == data.property_id,
        models.Lease.end_date.is_(None)
    ).first()
    if active_lease:
        active_lease.end_date = data.start_date

    lease = models.Lease(
        property_id=data.property_id,
        tenant_id=data.tenant_id,
        start_date=data.start_date,
        monthly_rent=data.monthly_rent,
    )
    db.add(lease)
    db.commit()
    db.refresh(lease)
    return lease

@router.get("/property/{property_id}", response_model=List[schemas.LeaseResponse])
def get_leases_for_property(
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

    return db.query(models.Lease).filter(
        models.Lease.property_id == property_id
    ).order_by(models.Lease.start_date.desc()).all()

@router.post("/{lease_id}/end")
def end_lease(
    lease_id: int,
    end_date: date,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    lease = db.query(models.Lease).join(models.Property).filter(
        models.Lease.id == lease_id,
        models.Property.owner_id == current_user.id
    ).first()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    lease.end_date = end_date
    db.commit()
    return {"message": "Lease ended"}


@router.get("/all", response_model=List[schemas.LeaseWithPropertyResponse])
def get_all_leases(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Lease).join(models.Property).filter(
        models.Property.owner_id == current_user.id
    ).order_by(models.Lease.end_date.is_(None).desc(), models.Lease.start_date.desc()).all()