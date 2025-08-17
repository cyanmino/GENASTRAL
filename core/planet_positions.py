from skyfield.api import load, Topos
from datetime import datetime

# Diccionario de planetas con sus claves en Skyfield
PLANET_KEYS = {
    "Sun": "sun",
    "Moon": "moon",
    "Mercury": "mercury",
    "Venus": "venus",
    "Mars": "mars",
    "Jupiter": "jupiter barycenter",
    "Saturn": "saturn barycenter",
    "Uranus": "uranus barycenter",
    "Neptune": "neptune barycenter",
    "Pluto": "pluto barycenter"
}

def get_planet_positions(utc_datetime, latitude=0.0, longitude=0.0):
    """
    Calcula las posiciones eclípticas de los planetas usando Skyfield.
    
    Args:
        utc_datetime (datetime): Fecha y hora en UTC.
        latitude (float): Latitud geográfica del observador.
        longitude (float): Longitud geográfica del observador.
    
    Returns:
        dict: Diccionario con posiciones planetarias.
    """
    ts = load.timescale()
    t = ts.utc(utc_datetime.year, utc_datetime.month, utc_datetime.day,
               utc_datetime.hour, utc_datetime.minute)

    # Cargar efemérides JPL
    planets = load('de421.bsp')  # Se descarga automáticamente si no existe

    # Crear observador geográfico
    observer = planets['earth']

    positions = {}
    for name, key in PLANET_KEYS.items():
        body = planets[key]
        astrometric = observer.at(t).observe(body).apparent()
        ecliptic = astrometric.ecliptic_latlon()
        lon = ecliptic[1].degrees


        positions[name] = {
            "longitude": lon,                     # 0–360°
            "sign": int(lon // 30),               # 0 = Aries, 1 = Tauro, ..., 11 = Piscis
            "degree": lon % 30                    # Grado dentro del signo
        }

    return positions

