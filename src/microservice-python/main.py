import os
import time
from datetime import datetime
from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Table, MetaData
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import threading
import random

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://urbanpulse:admin@localhost:5432/urbanpulse_db")
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

# Ensure tables exist (in docker-compose the init script will run; this is safe)
metadata.create_all(engine)

app = FastAPI(title="UrbanPulse - Weather/Quality Service")

class AirQualityOut(BaseModel):
    id: int
    city: str
    zone: str
    pollutant: str
    value: float
    unit: str
    timestamp: datetime

# Polling thread to insert mock data periodically (simulates fetching from OpenAQ/AEMET)
def poll_external_air():
    while True:
        try:
            session = SessionLocal()
            sample = {
                "city": "MiCiudad",
                "zone": random.choice(["Centro", "Norte", "Sur"]),
                "pollutant": random.choice(["PM10", "NO2", "O3"]),
                "value": round(10 + random.random() * 60, 1),
                "unit": "µg/m3",
                "timestamp": datetime.utcnow()
            }
            ins = air_quality.insert().values(**sample)
            session.execute(ins)
            session.commit()
            session.close()
            print("Inserted air quality sample", sample)
        except Exception as e:
            print("Error inserting air sample:", e)
        time.sleep(POLL_INTERVAL)

threading.Thread(target=poll_external_air, daemon=True).start()

@app.get("/", tags=["root"])
def read_root():
    return {"service": "weather", "version": "1.0"}

@app.get("/realtime", response_model=List[AirQualityOut])
def get_realtime():
    # return latest row per zone
    session = SessionLocal()
    try:
        # Simple approach: get latest per zone
        rows = session.execute(
            "SELECT DISTINCT ON (zone) id, city, zone, pollutant, value, unit, timestamp FROM air_quality ORDER BY zone, timestamp DESC"
        ).fetchall()
        result = [dict(r) for r in rows]
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()

@app.get("/forecast")
def get_forecast():
    # Mock forecast data
    forecast = [
        {"zone": "Centro", "temp": 22.3, "precip_prob": 0.1},
        {"zone": "Norte", "temp": 20.1, "precip_prob": 0.2}
    ]
    return {"forecast": forecast}
