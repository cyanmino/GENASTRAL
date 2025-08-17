from datetime import datetime
from planet_positions import get_planet_positions

# Ejemplo: 17 agosto 2025, 09:44 AM, Buenos Aires
dt = datetime(2025, 8, 17, 9, 44)
latitude = -34.6037
longitude = -58.3816

positions = get_planet_positions(dt, latitude, longitude)
for planet, data in positions.items():
    print(f"{planet}: {data['degree']:.2f}° signo {data['sign']}")

