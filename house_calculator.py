# house_calculator.py

import swisseph as swe

def get_julian_day(utc_datetime):
    return swe.julday(utc_datetime.year, utc_datetime.month, utc_datetime.day,
                      utc_datetime.hour + utc_datetime.minute / 60.0)

def calculate_houses(utc_datetime, latitude, longitude, house_system='P'):
    """
    house_system:
        'P' = Placidus
        'W' = Whole Sign
        'K' = Koch
        'R' = Regiomontanus
        'C' = Campanus
        'B' = Porphyry
    """
    jd = get_julian_day(utc_datetime)
    flags = swe.FLG_SWIEPH

    # Calcular casas
    cusps, ascmc = swe.houses(jd, latitude, longitude, house_system)

    return {
        "cusps": cusps,       # Cúspides de las casas 1–12
        "ascendant": ascmc[0],# Ascendente (Casa 1)
        "mc": ascmc[1],       # Medio Cielo (Casa 10)
        "vertex": ascmc[2],   # Punto de destino (opcional)
        "house_system": house_system
    }

# Ejemplo de uso
if __name__ == "__main__":
    from datetime import datetime
    dt = datetime(1990, 5, 12, 17, 30)  # UTC
    lat, lon = -34.6037, -58.3816      # Buenos Aires
    houses = calculate_houses(dt, lat, lon, house_system='P')
    
    for i, cusp in enumerate(houses["cusps"], start=1):
        print(f"Casa {i}: {cusp:.2f}°")
    print(f"Ascendente: {houses['ascendant']:.2f}°")
    print(f"Medio Cielo: {houses['mc']:.2f}°")