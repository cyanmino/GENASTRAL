"""Convert local datetimes into UTC based on geographic coordinates."""

from datetime import datetime
from typing import Dict

import pytz
from timezonefinder import TimezoneFinder

from core.geo_lookup import get_location_coordinates

_TZ_FINDER = TimezoneFinder()


def _get_timezone(lat: float, lon: float):
    tz_name = _TZ_FINDER.timezone_at(lat=lat, lng=lon)
    if not tz_name:
        raise ValueError("Zona horaria no encontrada para las coordenadas dadas.")
    return pytz.timezone(tz_name)


def convert_to_utc(local_dt: datetime, latitude: float, longitude: float) -> Dict[str, datetime]:
    """Return UTC datetime plus metadata for a localized datetime."""
    timezone = _get_timezone(latitude, longitude)
    localized = timezone.localize(local_dt)
    utc_dt = localized.astimezone(pytz.utc)
    return {
        "utc_datetime": utc_dt,
        "timezone": timezone.zone,
        "localized_datetime": localized,
    }


def local_to_utc(local_dt: datetime, city_name: str) -> Dict[str, datetime]:
    """Same as convert_to_utc but performing the coordinate lookup."""
    latitude, longitude = get_location_coordinates(city_name)
    result = convert_to_utc(local_dt, latitude, longitude)
    result.update({"latitude": latitude, "longitude": longitude})
    return result


if __name__ == "__main__":
    birth_dt = datetime(1990, 5, 12, 14, 30)
    city = "Buenos Aires, Argentina"
    result = local_to_utc(birth_dt, city)
    print(result)
