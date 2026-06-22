from sqlalchemy import Column, Integer, String, Float, Date, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    properties = relationship("Property", back_populates="owner")


class Property(Base):
    __tablename__ = "properties"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    address = Column(String)
    property_type = Column(String)
    meter_number = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="properties")
    bills = relationship("Bill", back_populates="property")
    meters = relationship("MeterReading", back_populates="property")
    leases = relationship("Lease", back_populates="property")

class Bill(Base):
    __tablename__ = "bills"
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    bill_type = Column(String)      # electricity, gas, water, tax
    amount = Column(Float)
    due_date = Column(Date)
    paid = Column(Boolean, default=False)
    paid_date = Column(Date, nullable=True)
    notes = Column(String, nullable=True)
    property = relationship("Property", back_populates="bills")

class MeterReading(Base):
    __tablename__ = "meter_readings"
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    meter_type = Column(String)     # electricity, gas, water
    reading_value = Column(Float)
    reading_date = Column(Date)
    notes = Column(String, nullable=True)
    property = relationship("Property", back_populates="meters")

class Tenant(Base):
    __tablename__ = "tenants"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    phone = Column(String, nullable=True)
    nid_number = Column(String, nullable=True)
    leases = relationship("Lease", back_populates="tenant")

class RentPayment(Base):
    __tablename__ = "rent_payments"
    id = Column(Integer, primary_key=True, index=True)
    lease_id = Column(Integer, ForeignKey("leases.id"))
    month = Column(String)
    amount_paid = Column(Float, default=0)
    paid_date = Column(Date, nullable=True)
    is_paid = Column(Boolean, default=False)
    receipt_number = Column(String, nullable=True)   
    lease = relationship("Lease", back_populates="rent_payments")

class Lease(Base):
    __tablename__ = "leases"
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    start_date = Column(Date)
    end_date = Column(Date, nullable=True)   # null = currently active lease
    monthly_rent = Column(Float)

    property = relationship("Property", back_populates="leases")
    tenant = relationship("Tenant", back_populates="leases")
    rent_payments = relationship("RentPayment", back_populates="lease")
