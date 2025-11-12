"""Command line interface for GENASTRAL."""

import argparse
from datetime import datetime

from core.chart_service import build_natal_chart
from visualization.chart_drawer import ZODIAC_SIGNS, draw_chart


def _ensure_value(value: str, prompt: str) -> str:
    if value:
        return value
    return input(prompt).strip()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generador de cartas natales GENASTRAL")
    parser.add_argument("--date", help="Fecha de nacimiento (YYYY-MM-DD)")
    parser.add_argument("--time", help="Hora de nacimiento (HH:MM, 24h)")
    parser.add_argument("--location", help="Lugar de nacimiento (Ciudad, País)")
    parser.add_argument(
        "--output",
        help="Ruta del archivo SVG a generar (opcional)",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    date_str = _ensure_value(args.date, "Fecha de nacimiento (YYYY-MM-DD): ")
    time_str = _ensure_value(args.time, "Hora de nacimiento (HH:MM): ")
    location = _ensure_value(args.location, "Lugar de nacimiento: ")

    local_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    chart = build_natal_chart(local_dt, location)

    print("\nPlanetas:")
    for planet, data in chart["planets"].items():
        sign_name = ZODIAC_SIGNS[data["sign"]]
        print(f" - {planet:8s}: {data['degree']:.2f}° {sign_name}")

    print("\nCasas:")
    for idx, cusp in enumerate(chart["houses"]["cusps"], start=1):
        print(f" - Casa {idx:02d}: {cusp:.2f}°")

    print(f"\nAscendente: {chart['houses']['ascendant']:.2f}°")
    print(f"Medio Cielo: {chart['houses']['mc']:.2f}°")

    print("\nAspectos:")
    if chart["aspects"]:
        for aspect in chart["aspects"]:
            print(
                f" - {aspect['planet1']} {aspect['aspect']} {aspect['planet2']} "
                f"(orb {aspect['orb']:.2f}°)"
            )
    else:
        print(" - No se detectaron aspectos dentro de los orbes definidos.")

    if args.output:
        draw_chart(chart["planets"], chart["houses"], filename=args.output)
        print(f"\nCarta SVG guardada en: {args.output}")


if __name__ == "__main__":
    main()
