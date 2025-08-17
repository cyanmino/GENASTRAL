# planet_positions.py
from skyfield.api import load, Topos
from datetime import datetime

def get_planet_positions(utc_datetime, latitude=0.0, longitude=0.0):
    ts = load.timescale()
    t = ts.utc(utc_datetime.year, utc_datetime.month, utc_datetime.day,
               utc_datetime.hour, utc_datetime.minute)

    planets = load('de421.bsp')  # Se descarga automáticamente si no existe
    observer = planets['earth'].topos(latitude_degrees=latitude, longitude_degrees=longitude)

    planet_keys = {
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

    positions = {}
    for name, key in planet_keys.items():
        astrometric = observer.observe(planets[key]).apparent()
        ecliptic = astrometric.ecliptic_latlon()
        lon = ecliptic[1].degrees
        positions[name] = {
            "longitude": lon,
            "sign": int(lon // 30),
            "degree": lon % 30
        }

    return positions