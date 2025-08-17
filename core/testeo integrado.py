from datetime import datetime
from geo_lookup import get_location_coordinates
from time_conversion import convert_to_utc
from planet_positions import get_planet_positions
from house_calculator import calculate_houses

# Datos de prueba
birth_date = "2025-08-17"
birth_time = "09:44"
location = "Buenos Aires, Argentina"

local_dt = datetime.strptime(f"{birth_date} {birth_time}", "%Y-%m-%d %H:%M")
latitude, longitude = get_location_coordinates(location)
utc_dt = convert_to_utc(local_dt, latitude, longitude)

planets = get_planet_positions(utc_dt, latitude, longitude)
houses = calculate_houses(utc_dt, latitude, longitude)

print("\n🌌 Planetas:")
for planet, data in planets.items():
    print(f"{planet}: {data['degree']:.2f}° signo {data['sign']}")

print("\n🏠 Casas:")
for i, cusp in enumerate(houses['cusps'], start=1):
    print(f"Cusp {i}: {cusp:.2f}°")

print(f"\nAscendente: {houses['ascendant']:.2f}°")
print(f"Medio Cielo: {houses['mc']:.2f}°")
