from datetime import datetime
from house_calculator import calculate_houses

dt = datetime(2025, 8, 17, 9, 44)
latitude = -34.6037
longitude = -58.3816

houses = calculate_houses(dt, latitude, longitude)
print("Ascendente:", houses["ascendant"])
print("Medio Cielo:", houses["mc"])
print("Cusps:")
for i, cusp in enumerate(houses["cusps"], start=1):
    print(f"Cusp {i}: {cusp:.2f}°")

