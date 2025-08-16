# cli.py

import argparse
from datetime import datetime
from time_conversion import local_to_utc
from planet_positions import get_planet_positions
from house_calculator import calculate_houses
from chart_logic import assign_planets_to_houses, calculate_aspects
from chart_drawer import draw_chart

def main():
    parser = argparse.ArgumentParser(description="Generador de carta natal")
    parser.add_argument("--date", required=True, help="Fecha de nacimiento (YYYY-MM-DD)")
    parser.add_argument("--time", required=True, help="Hora local (HH:MM)")
    parser.add_argument("--city", required=True, help="Ciudad de nacimiento")
    parser.add_argument("--system", default="P", help="Sistema de casas (P, W, K, etc.)")
    parser.add_argument("--output", default="natal_chart.svg", help="Archivo de salida SVG")

    args = parser.parse_args()

    # Convertir a UTC
    local_dt = datetime.strptime(f"{args.date} {args.time}", "%Y-%m-%d %H:%M")
    conversion = local_to_utc(local_dt, args.city)
    utc_dt = conversion["utc_datetime"]
    lat = conversion["latitude"]
    lon = conversion["longitude"]

    # Calcular posiciones
    planets = get_planet_positions(utc_dt)
    houses = calculate_houses(utc_dt, lat, lon, house_system=args.system)
    planet_houses = assign_planets_to_houses(planets, houses["cusps"])
    aspects = calculate_aspects(planets)

    # Mostrar resumen
    print(f"\nCarta natal para {args.city} ({args.date} {args.time} local)")
    print(f"UTC: {utc_dt.isoformat()} | Lat: {lat:.4f} | Lon: {lon:.4f}")
    print("\nPosiciones planetarias:")
    for planet, data in planets.items():
        sign = int(data["longitude"] // 30)
        deg = data["longitude"] % 30
        house = planet_houses.get(planet, "?")
        retro = "(R)" if data["retrograde"] else ""
        print(f"  {planet}: {deg:.2f}° en signo {sign} | Casa {house} {retro}")

    print("\nAspectos:")
    for asp in aspects:
        print(f"  {asp['planet1']} {asp['aspect']} {asp['planet2']} (orb: {asp['orb']:.2f}°)")

    # Dibujar carta
    draw_chart(planets, houses, filename=args.output)
    print(f"\nCarta guardada en: {args.output}")

if __name__ == "__main__":
    main()