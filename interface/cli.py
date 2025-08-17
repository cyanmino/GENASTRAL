# cli.py

import argparse
from datetime import datetime
from geo_lookup import get_location_coordinates
from time_conversion import convert_to_utc
from planet_positions import get_planet_positions
from house_calculator import calculate_houses
from chart_logic import assign_planets_to_houses, calculate_aspects
from chart_drawer import draw_chart

def main():
    birth_date = input("Fecha de nacimiento (YYYY-MM-DD): ")
    birth_time = input("Hora de nacimiento (HH:MM): ")
    location = input("Lugar de nacimiento: ")

    local_dt = datetime.strptime(f"{birth_date} {birth_time}", "%Y-%m-%d %H:%M")
    latitude, longitude = get_location_coordinates(location)
    utc_dt = convert_to_utc(local_dt, latitude, longitude)

    planets = get_planet_positions(utc_dt, latitude, longitude)
    houses = calculate_houses(utc_dt, latitude, longitude)

    print("\n🌌 Posiciones planetarias:")
    for planet, data in planets.items():
        print(f"{planet}: {data['degree']:.2f}° {['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][data['sign']]}")

    print("\n🏠 Casas:")
    for i, cusp in enumerate(houses['cusps'], start=1):
        print(f"Cusp {i}: {cusp:.2f}°")

    print(f"\nAscendente: {houses['ascendant']:.2f}°")
    print(f"Medio Cielo: {houses['mc']:.2f}°")

if __name__ == "__main__":
    main()

