"""Utilities to resolve locations into coordinates."""

from functools import lru_cache
from typing import Dict, Tuple

from geopy.geocoders import Nominatim

_GEOCODER = Nominatim(user_agent="genastral")


@lru_cache(maxsize=128)
def get_location_data(place_name: str) -> Dict[str, float]:
    """Return latitude, longitude and metadata for a place."""
    place = place_name.strip()
    if not place:
        raise ValueError("El nombre del lugar está vacío.")

    location = _GEOCODER.geocode(place)
    if not location:
        raise ValueError(f"No se pudo encontrar la ubicación: {place_name}")

    return {
        "latitude": location.latitude,
        "longitude": location.longitude,
        "address": location.address,
    }


def get_location_coordinates(place_name: str) -> Tuple[float, float]:
    """Return only the latitude/longitude pair for a place."""
    data = get_location_data(place_name)
    return data["latitude"], data["longitude"]


if __name__ == "__main__":
    city = "Kyoto, Japan"
    lat, lon = get_location_coordinates(city)
    print(f"Latitud: {lat}, Longitud: {lon}")
