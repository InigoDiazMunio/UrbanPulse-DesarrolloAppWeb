import os
import time
from datetime import datetime
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Table, MetaData, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import threading
import random

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://urbanpulse:admin@postgres:5432/urbanpulse_db")
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL_SECONDS", "60"))

engine = create_engine(DATABASE_URL)
metadata = MetaData()

air_quality = Table(
    'air_quality', metadata,
    Column('id', Integer, primary_key=True),
    Column('city', String),
    Column('zone', String),
    Column('pollutant', String),
    Column('value', Float),
    Column('unit', String),
    Column('timestamp', DateTime)
)

SessionLocal = sessionmaker(bind=engine)

try:
    metadata.create_all(engine)
    print("✅ Tables created/verified")
except Exception as e:
    print(f"❌ Error creating tables: {e}")

app = FastAPI(title="UrbanPulse - Weather/Quality Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AirQualityOut(BaseModel):
    id: int
    city: str
    zone: str
    pollutant: str
    value: float
    unit: str
    timestamp: datetime

def poll_external_air():
    time.sleep(5)
    while True:
        try:
            session = SessionLocal()
            sample = {
                "city": "MiCiudad",
                "zone": random.choice(["Centro", "Norte", "Sur"]),
                "pollutant": random.choice(["PM10", "NO2", "O3"]),
                "value": round(10 + random.random() * 60, 1),
                "unit": "µg/m³",
                "timestamp": datetime.utcnow()
            }
            ins = air_quality.insert().values(**sample)
            session.execute(ins)
            session.commit()
            print(f"✅ Inserted: {sample['zone']} - {sample['pollutant']}: {sample['value']}")
            session.close()
        except Exception as e:
            print(f"❌ Error inserting: {e}")
        time.sleep(POLL_INTERVAL)

threading.Thread(target=poll_external_air, daemon=True).start()

@app.get("/")
def read_root():
    return {"service": "weather", "version": "1.0", "status": "running"}

@app.get("/health")
def health():
    try:
        session = SessionLocal()
        session.execute(text("SELECT 1"))
        session.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.get("/realtime")
def get_realtime():
    session = SessionLocal()
    try:
        # Query simple con text()
        query = text("""
            SELECT id, city, zone, pollutant, value, unit, timestamp 
            FROM air_quality 
            ORDER BY timestamp DESC 
            LIMIT 10
        """)
        
        result = session.execute(query)
        rows = result.fetchall()
        
        data = []
        for row in rows:
            data.append({
                "id": row[0],
                "city": row[1],
                "zone": row[2],
                "pollutant": row[3],
                "value": row[4],
                "unit": row[5],
                "timestamp": row[6].isoformat() if row[6] else None
            })
        
        print(f"✅ Returning {len(data)} air quality records")
        return data
        
    except Exception as e:
        print(f"❌ Error in /realtime: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()

@app.get("/forecast")
def get_forecast():
    forecast = [
        {"zone": "Centro", "temp": 22.3, "precip_prob": 0.1},
        {"zone": "Norte", "temp": 20.1, "precip_prob": 0.2}
    ]
    return {"forecast": forecast}