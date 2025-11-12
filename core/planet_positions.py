from datetime import datetime, timezone
from pathlib import Path
from typing import Dict

from skyfield.api import Loader, Topos

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
    "Pluto": "pluto barycenter",
}

_BASE_PATH = Path(__file__).resolve().parent
_LOADER = Loader(str(_BASE_PATH))
_TIMESCALE = _LOADER.timescale()
_EPHEMERIS = _LOADER("de421.bsp")


def get_planet_positions(utc_datetime: datetime, latitude: float = 0.0, longitude: float = 0.0) -> Dict[str, Dict[str, float]]:
    """Compute ecliptic longitudes for the main planets."""
    dt = utc_datetime
    if dt.tzinfo:
        dt = dt.astimezone(timezone.utc)
    t = _TIMESCALE.utc(dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second)

    observer = _EPHEMERIS["earth"] + Topos(latitude_degrees=latitude, longitude_degrees=longitude)

    positions = {}
    for name, key in PLANET_KEYS.items():
        body = _EPHEMERIS[key]
        lon = observer.at(t).observe(body).ecliptic_latlon()[1].degrees
        lon = lon % 360
        positions[name] = {
            "longitude": lon,
            "sign": int(lon // 30),
            "degree": lon % 30,
        }
    return positions
