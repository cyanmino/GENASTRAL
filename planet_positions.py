# planet_positions.py

import swisseph as swe
from datetime import datetime

# Configuración inicial
swe.set_ephe_path('.')  # Ruta donde están los archivos de efemérides (puede ser vacío si usas los integrados)

# Lista de planetas principales
PLANETS = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mercury": swe.MERCURY,
    "Venus": swe.VENUS,
    "Mars": swe.MARS,
    "Jupiter": swe.JUPITER,
    "Saturn": swe.SATURN,
    "Uranus": swe.URANUS,
    "Neptune": swe.NEPTUNE,
    "Pluto": swe.PLUTO,
    "True Node": swe.TRUE_NODE
}

def get_julian_day(utc_datetime):
    return swe.julday(utc_datetime.year, utc_datetime.month, utc_datetime.day,
                      utc_datetime.hour + utc_datetime.minute / 60.0)

def get_planet_positions(utc_datetime):
    jd = get_julian_day(utc_datetime)
    positions = {}

    for name, planet_id in PLANETS.items():
        lon, lat, dist = swe.calc_ut(jd, planet_id)[0:3]
        sign = int(lon // 30)
        degree_in_sign = lon % 30
        positions[name] = {
            "longitude": lon,
            "sign": sign,
            "degree": degree_in_sign,
            "retrograde": swe.calc_ut(jd, planet_id, flag=swe.FLG_SPEED)[3] < 0
        }

    return positions

# Ejemplo de uso
if __name__ == "__main__":
    dt = datetime(1990, 5, 12, 17, 30)  # UTC
    planet_data = get_planet_positions(dt)
    for planet, data in planet_data.items():
        print(f"{planet}: {data['degree']:.2f}° en signo {data['sign']} {'(R)' if data['retrograde'] else ''}")