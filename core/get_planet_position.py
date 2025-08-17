from datetime import datetime
from planet_positions import get_planet_positions

dt = datetime(1993, 10, 25, 12, 25)  # UTC año, mes, dia, hora, minuto
latitude = -34.5872
longitude = -58.4076

positions = get_planet_positions(dt, latitude, longitude)
for planet, data in positions.items():
    print(f"{planet}: {data['degree']:.2f}° signo {data['sign']}")

