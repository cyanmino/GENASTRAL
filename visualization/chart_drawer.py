"""Simple SVG natal chart renderer."""

import math
from typing import Dict, Optional

import svgwrite

from utils.config import CHART_STYLE

ZODIAC_SIGNS = [
    "Aries",
    "Tauro",
    "Géminis",
    "Cáncer",
    "Leo",
    "Virgo",
    "Libra",
    "Escorpio",
    "Sagitario",
    "Capricornio",
    "Acuario",
    "Piscis",
]


def deg_to_rad(deg: float) -> float:
    return math.radians(deg - 90)


def polar_to_cartesian(center, radius, angle_deg):
    angle_rad = deg_to_rad(angle_deg)
    x = center[0] + radius * math.cos(angle_rad)
    y = center[1] + radius * math.sin(angle_rad)
    return (x, y)


def draw_chart(
    planet_positions: Dict[str, Dict[str, float]],
    house_data: Dict[str, object],
    filename: Optional[str] = None,
) -> str:
    """Draw a simple SVG natal chart and optionally save it to disk."""
    size = 600
    center = (size / 2, size / 2)
    radius = 250
    dwg = svgwrite.Drawing(filename or "natal_chart.svg", size=(size, size))

    dwg.add(
        dwg.circle(
            center=center,
            r=radius,
            stroke=CHART_STYLE.get("house_line_color", "black"),
            fill=CHART_STYLE.get("background_color", "white"),
            stroke_width=2,
        )
    )

    for i in range(12):
        angle = i * 30
        start = polar_to_cartesian(center, radius, angle)
        dwg.add(dwg.line(start=start, end=center, stroke="lightgray"))
        label_pos = polar_to_cartesian(center, radius + 20, angle + 15)
        dwg.add(
            dwg.text(
                ZODIAC_SIGNS[i],
                insert=label_pos,
                font_size="12px",
                text_anchor="middle",
                fill=CHART_STYLE.get("planet_color", "black"),
            )
        )

    for cusp in house_data["cusps"]:
        pos = polar_to_cartesian(center, radius - 20, cusp)
        dwg.add(
            dwg.line(
                start=pos,
                end=center,
                stroke=CHART_STYLE.get("house_line_color", "blue"),
                stroke_dasharray="4,4",
            )
        )

    for planet, data in planet_positions.items():
        pos = polar_to_cartesian(center, radius - 40, data["longitude"])
        dwg.add(dwg.circle(center=pos, r=5, fill=CHART_STYLE.get("planet_color", "red")))
        dwg.add(
            dwg.text(
                planet[0],
                insert=(pos[0], pos[1] - 10),
                font_size="12px",
                text_anchor="middle",
                fill=CHART_STYLE.get("planet_color", "red"),
            )
        )

    if filename:
        dwg.saveas(filename)
    return dwg.tostring()
