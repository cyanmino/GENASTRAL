# chart_drawer.py

import svgwrite
import math

ZODIAC_SIGNS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"]

def deg_to_rad(deg):
    return math.radians(deg - 90)  # Ajuste para que Aries empiece arriba

def polar_to_cartesian(center, radius, angle_deg):
    angle_rad = deg_to_rad(angle_deg)
    x = center[0] + radius * math.cos(angle_rad)
    y = center[1] + radius * math.sin(angle_rad)
    return (x, y)

def draw_chart(planet_positions, house_data, filename="natal_chart.svg"):
    size = 600
    center = (size / 2, size / 2)
    radius = 250
    dwg = svgwrite.Drawing(filename, size=(size, size))

    # Círculo base
    dwg.add(dwg.circle(center=center, r=radius, stroke="black", fill="white"))

    # Dividir en 12 signos
    for i in range(12):
        angle = i * 30
        start = polar_to_cartesian(center, radius, angle)
        dwg.add(dwg.line(start=start, end=center, stroke="gray"))
        label_pos = polar_to_cartesian(center, radius + 20, angle + 15)
        dwg.add(dwg.text(ZODIAC_SIGNS[i], insert=label_pos, font_size="16px", text_anchor="middle"))

    # Casas
    for i, cusp in enumerate(house_data["cusps"]):
        pos = polar_to_cartesian(center, radius - 20, cusp)
        dwg.add(dwg.line(start=pos, end=center, stroke="blue"))

    # Planetas
    for planet, data in planet_positions.items():
        pos = polar_to_cartesian(center, radius - 40, data["longitude"])
        dwg.add(dwg.circle(center=pos, r=5, fill="red"))
        dwg.add(dwg.text(planet[0], insert=(pos[0], pos[1] - 10), font_size="12px", text_anchor="middle"))

    dwg.save()