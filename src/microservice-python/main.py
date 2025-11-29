import os
import random
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from apscheduler.schedulers.background import BackgroundScheduler
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="UrbanPulse Weather Service - Euskadi")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://urbanpulse:urbanpulse@postgres:5432/urbanpulse_db")
engine = create_engine(DATABASE_URL)

scheduler = BackgroundScheduler()

REAL_STATIONS = {
    "Bizkaia": [
        {"name": "Bilbao", "city": "Bilbao", "pm10": (25, 45), "no2": (30, 50), "pm25": (15, 30), "o3": (40, 80), "so2": (5, 15), "co": (0.3, 0.7)},
        {"name": "Barakaldo", "city": "Barakaldo", "pm10": (30, 55), "no2": (35, 60), "pm25": (18, 35), "o3": (35, 75), "so2": (6, 18), "co": (0.4, 0.9)},
        {"name": "Getxo", "city": "Getxo", "pm10": (20, 35), "no2": (25, 40), "pm25": (12, 25), "o3": (45, 85), "so2": (4, 12), "co": (0.2, 0.5)},
        {"name": "Santurtzi", "city": "Santurtzi", "pm10": (28, 48), "no2": (32, 52), "pm25": (16, 32), "o3": (38, 78), "so2": (5, 16), "co": (0.3, 0.7)},
        {"name": "Basauri", "city": "Basauri", "pm10": (26, 42), "no2": (30, 48), "pm25": (15, 28), "o3": (40, 80), "so2": (5, 14), "co": (0.3, 0.6)},
        {"name": "Durango", "city": "Durango", "pm10": (22, 38), "no2": (26, 42), "pm25": (13, 26), "o3": (42, 82), "so2": (4, 13), "co": (0.2, 0.5)},
        {"name": "Sestao", "city": "Sestao", "pm10": (32, 52), "no2": (38, 58), "pm25": (19, 35), "o3": (33, 73), "so2": (7, 19), "co": (0.4, 0.9)},
        {"name": "Portugalete", "city": "Portugalete", "pm10": (27, 44), "no2": (31, 49), "pm25": (16, 30), "o3": (39, 79), "so2": (5, 15), "co": (0.3, 0.7)},
        {"name": "Leioa", "city": "Leioa", "pm10": (24, 40), "no2": (28, 44), "pm25": (14, 27), "o3": (41, 81), "so2": (4, 13), "co": (0.3, 0.6)},
    ],
    "Gipuzkoa": [
        {"name": "Donostia-San Sebastián", "city": "Donostia-San Sebastián", "pm10": (18, 32), "no2": (22, 38), "pm25": (11, 22), "o3": (48, 88), "so2": (3, 10), "co": (0.2, 0.4)},
        {"name": "Irun", "city": "Irun", "pm10": (20, 36), "no2": (24, 40), "pm25": (12, 24), "o3": (46, 86), "so2": (4, 11), "co": (0.2, 0.5)},
        {"name": "Eibar", "city": "Eibar", "pm10": (24, 40), "no2": (28, 44), "pm25": (14, 27), "o3": (41, 81), "so2": (4, 13), "co": (0.3, 0.6)},
        {"name": "Errenteria", "city": "Errenteria", "pm10": (22, 38), "no2": (26, 42), "pm25": (13, 26), "o3": (43, 83), "so2": (4, 12), "co": (0.2, 0.5)},
        {"name": "Zarautz", "city": "Zarautz", "pm10": (16, 28), "no2": (20, 34), "pm25": (10, 20), "o3": (50, 90), "so2": (3, 9), "co": (0.1, 0.4)},
    ],
    "Araba": [
        {"name": "Vitoria-Gasteiz", "city": "Vitoria-Gasteiz", "pm10": (20, 38), "no2": (24, 42), "pm25": (12, 25), "o3": (45, 85), "so2": (4, 12), "co": (0.2, 0.5)},
        {"name": "Llodio", "city": "Llodio", "pm10": (24, 42), "no2": (28, 46), "pm25": (14, 28), "o3": (40, 80), "so2": (5, 14), "co": (0.3, 0.6)},
    ]
}
def generate_realistic_data():
    """Genera datos realistas basados en estaciones reales"""
    results = []
    
    for province, stations in REAL_STATIONS.items():
        for station in stations:
            # PM10
            pm10_min, pm10_max = station["pm10"]
            pm10_value = random.uniform(pm10_min, pm10_max)
            
            # NO2
            no2_min, no2_max = station["no2"]
            no2_value = random.uniform(no2_min, no2_max)
            
            # PM2.5 (aproximadamente 60% del PM10)
            pm25_value = pm10_value * random.uniform(0.55, 0.65)
            
            # O3 (varía inversamente con NO2)
            o3_value = random.uniform(40, 80) - (no2_value * 0.3)
            
            # SO2
            so2_value = random.uniform(2, 8)
            
            # CO
            co_value = random.uniform(0.2, 0.6)
            
            pollutants = {
                "PM10": pm10_value,
                "PM25": pm25_value,
                "NO2": no2_value,
                "O3": max(0, o3_value),
                "SO2": so2_value,
                "CO": co_value
            }
            
            for pollutant, value in pollutants.items():
                results.append({
                    "city": station["city"],
                    "zone": station["name"],
                    "pollutant": pollutant,
                    "value": round(value, 1),
                    "unit": "µg/m³" if pollutant != "CO" else "mg/m³",
                    "timestamp": datetime.now()
                })
            
            logger.info(f"✅ {station['name']} ({station['city']}) - PM10: {pm10_value:.1f}")
    
    logger.info(f"✅ Total: {len(results)} mediciones de {len([s for stations in REAL_STATIONS.values() for s in stations])} estaciones")
    return results

@scheduler.scheduled_job("interval", seconds=600)  # Cada 10 minutos
def save_real_air_data():
    """Guarda datos realistas de todas las estaciones"""
    logger.info("🔄 Generando datos de calidad del aire de Euskadi...")
    
    data = generate_realistic_data()
    
    try:
        with engine.connect() as conn:
            for item in data:
                conn.execute(text("""
                    INSERT INTO air_quality (city, zone, pollutant, value, unit, timestamp)
                    VALUES (:city, :zone, :pollutant, :value, :unit, :timestamp)
                """), item)
                conn.commit()
        
        logger.info(f"✅ Guardados {len(data)} registros en BD")
    except Exception as e:
        logger.error(f"❌ Error guardando en BD: {e}")

@app.on_event("startup")
def startup_event():
    logger.info("🚀 Iniciando servicio - Datos realistas de Euskadi")
    save_real_air_data()
    scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

@app.get("/health")
def health_check():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(DISTINCT zone) FROM air_quality"))
            station_count = result.fetchone()[0]
        return {
            "status": "healthy",
            "database": "connected",
            "source": "Datos realistas - Estaciones de Euskadi",
            "total_stations": station_count
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.get("/realtime")
def get_realtime():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                WITH ranked_data AS (
                    SELECT *,
                           ROW_NUMBER() OVER (
                               PARTITION BY city, zone, pollutant 
                               ORDER BY timestamp DESC
                           ) as rn
                    FROM air_quality
                )
                SELECT id, city, zone, pollutant, value, unit, timestamp
                FROM ranked_data
                WHERE rn = 1
                ORDER BY city, zone, pollutant
            """))
            
            data = []
            for row in result:
                data.append({
                    "id": row[0],
                    "city": row[1],
                    "zone": row[2],
                    "pollutant": row[3],
                    "value": float(row[4]),
                    "unit": row[5],
                    "timestamp": row[6].isoformat() if row[6] else None
                })
            
            return data
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stations")
def get_stations():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT DISTINCT city, zone
                FROM air_quality
                ORDER BY city, zone
            """))
            
            stations = []
            for row in result:
                stations.append({
                    "city": row[0],
                    "zone": row[1]
                })
            
            return stations
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/forecast")
def get_forecast():
    return {"message": "Forecast endpoint - próximamente"}