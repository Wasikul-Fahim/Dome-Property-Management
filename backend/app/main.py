from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app import models
from app.routers import users, properties, bills, meters

models.Base.metadata.create_all(bind=engine)  # creates tables

app = FastAPI(title="Property Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your React dev URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(properties.router, prefix="/api/properties", tags=["properties"])
app.include_router(bills.router, prefix="/api/bills", tags=["bills"])
app.include_router(meters.router, prefix="/api/meters", tags=["meters"])

@app.get("/")
def root():
    return {"status": "Property Manager API running"}