# time_conversion.py

from datetime import datetime
import pytz
from timezonefinder import TimezoneFinder
from geopy.geocoders import Nominatim

def get_coordinates(city_name):
    geolocator = Nominatim(user_agent="astro_chart")
    location = geolocator.geocode(city_name)
    if location:
        return (location.latitude, location.longitude)
    else:
        raise ValueError("Ciudad no encontrada")

def get_timezone(lat, lon):
    tf = TimezoneFinder()
    tz_name = tf.timezone_at(lat=lat, lng=lon)
    if tz_name:
        return pytz.timezone(tz_name)
    else:
        raise ValueError("Zona horaria no encontrada")

def local_to_utc(local_dt, city_name):
    lat, lon = get_coordinates(city_name)
    local_tz = get_timezone(lat, lon)
    localized_dt = local_tz.localize(local_dt)
    utc_dt = localized_dt.astimezone(pytz.utc)
    return {
        "utc_datetime": utc_dt,
        "latitude": lat,
        "longitude": lon,
        "timezone": local_tz.zone
    }

# Ejemplo de uso
if __name__ == "__main__":
    birth_dt = datetime(1990, 5, 12, 14, 30)  # 12 de mayo de 1990, 14:30 hora local
    city = "Buenos Aires, Argentina"
    result = local_to_utc(birth_dt, city)
    print(result)