"""High level service that composes the different core utilities."""

from datetime import datetime
from typing import Dict

from core.chart_logic import assign_planets_to_houses, calculate_aspects
from core.geo_lookup import get_location_coordinates
from core.house_calculator import calculate_houses
from core.planet_positions import get_planet_positions
from core.time_conversion import convert_to_utc


def build_natal_chart(local_datetime: datetime, location_name: str) -> Dict[str, object]:
    """Return all the structures required to render a natal chart."""
    latitude, longitude = get_location_coordinates(location_name)
    time_info = convert_to_utc(local_datetime, latitude, longitude)
    utc_dt = time_info["utc_datetime"]

    planets = get_planet_positions(utc_dt, latitude, longitude)
    houses = calculate_houses(utc_dt, latitude, longitude)
    assignments = assign_planets_to_houses(planets, houses["cusps"])
    aspects = calculate_aspects(planets)

    return {
        "planets": planets,
        "houses": houses,
        "assignments": assignments,
        "aspects": aspects,
        "metadata": {
            "location": location_name,
            "latitude": latitude,
            "longitude": longitude,
            "timezone": time_info["timezone"],
            "local_datetime": time_info["localized_datetime"],
            "utc_datetime": utc_dt,
        },
    }
