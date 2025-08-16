# chart_logic.py

ASPECTS = {
    "Conjunction": 0,
    "Opposition": 180,
    "Trine": 120,
    "Square": 90,
    "Sextile": 60
}

ORBS = {
    "Conjunction": 8,
    "Opposition": 8,
    "Trine": 6,
    "Square": 6,
    "Sextile": 4
}

def assign_planets_to_houses(planet_positions, house_cusps):
    assignments = {}
    for planet, data in planet_positions.items():
        lon = data["longitude"]
        for i in range(12):
            start = house_cusps[i]
            end = house_cusps[(i + 1) % 12]
            if start < end:
                if start <= lon < end:
                    assignments[planet] = i + 1
                    break
            else:  # Casa cruza 360° → 0°
                if lon >= start or lon < end:
                    assignments[planet] = i + 1
                    break
    return assignments

def calculate_aspects(planet_positions):
    aspects_found = []
    planets = list(planet_positions.keys())
    for i in range(len(planets)):
        for j in range(i + 1, len(planets)):
            p1, p2 = planets[i], planets[j]
            lon1 = planet_positions[p1]["longitude"]
            lon2 = planet_positions[p2]["longitude"]
            diff = abs(lon1 - lon2)
            diff = min(diff, 360 - diff)  # Aspectos circulares

            for aspect, angle in ASPECTS.items():
                if abs(diff - angle) <= ORBS[aspect]:
                    aspects_found.append({
                        "planet1": p1,
                        "planet2": p2,
                        "aspect": aspect,
                        "orb": abs(diff - angle)
                    })
    return aspects_found