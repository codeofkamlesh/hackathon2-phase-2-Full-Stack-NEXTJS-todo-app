from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import create_db_and_tables, test_connection
# NOTE: Agar apke pas routes/auth.py aur routes/tasks.py nahi hain to in lines ko comment kar dein
# from routes import auth, tasks
import os
from dotenv import load_dotenv

load_dotenv()

# Lifespan context manager for startup events
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n" + "="*50)
    print("🚀 Starting Todo API - Phase II")

    # Test Connection
    if test_connection():
        print("✅ Database connection verified")
        # Create Tables
        create_db_and_tables()
    else:
        print("❌ Database connection failed!")

    print("="*50 + "\n")
    yield

app = FastAPI(
    title="Todo API - Phase II",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration - Fixed for Frontend Access
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Specific origins are safer/better than "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers include karein (Make sure files exist)
# app.include_router(auth.router)
# app.include_router(tasks.router)

@app.get("/")
def read_root():
    return {"status": "healthy", "message": "FastAPI Backend is Running"}

@app.get("/health")
def health_check():
    return {"status": "ok", "database": "connected"}