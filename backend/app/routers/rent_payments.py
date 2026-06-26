from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from dateutil.relativedelta import relativedelta

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter()


def _get_or_create_months(db: Session, lease: models.Lease) -> list[models.RentPayment]:
    existing = db.query(models.RentPayment).filter(
        models.RentPayment.lease_id == lease.id
    ).all()
    existing_months = {p.month for p in existing}

    end_point = lease.end_date or date.today()
    cursor = date(lease.start_date.year, lease.start_date.month, 1)
    end_marker = date(end_point.year, end_point.month, 1)

    created_any = False
    while cursor <= end_marker:
        month_str = cursor.strftime("%Y-%m")
        if month_str not in existing_months:
            db.add(models.RentPayment(lease_id=lease.id, month=month_str))
            existing_months.add(month_str)
            created_any = True
        cursor += relativedelta(months=1)

    if created_any:
        db.commit()

    return db.query(models.RentPayment).filter(
        models.RentPayment.lease_id == lease.id
    ).order_by(models.RentPayment.month.desc()).all()


@router.get("/lease/{lease_id}", response_model=List[schemas.RentPaymentResponse])
def get_payments_for_lease(
    lease_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    lease = db.query(models.Lease).join(models.Property).filter(
        models.Lease.id == lease_id,
        models.Property.owner_id == current_user.id
    ).first()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")

    return _get_or_create_months(db, lease)


@router.post("/", response_model=schemas.RentPaymentResponse)
def create_rent_record(
    data: schemas.RentPaymentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    lease = db.query(models.Lease).join(models.Property).filter(
        models.Lease.id == data.lease_id,
        models.Property.owner_id == current_user.id
    ).first()
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")

    existing = db.query(models.RentPayment).filter(
        models.RentPayment.lease_id == data.lease_id,
        models.RentPayment.month == data.month
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Rent record already exists for this month")

    payment = models.RentPayment(lease_id=data.lease_id, month=data.month)
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.put("/{payment_id}", response_model=schemas.RentPaymentResponse)
def update_rent_payment(
    payment_id: int,
    data: schemas.RentPaymentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    payment = db.query(models.RentPayment).join(models.Lease).join(models.Property).filter(
        models.RentPayment.id == payment_id,
        models.Property.owner_id == current_user.id
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    payment.amount_paid = data.amount_paid
    payment.paid_date = data.paid_date
    payment.receipt_number = data.receipt_number
    payment.is_paid = data.is_paid
    db.commit()
    db.refresh(payment)
    return payment