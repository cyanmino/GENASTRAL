# geo_lookup.py

from geopy.geocoders import Nominatim

def get_location_data(place_name):
    geolocator = Nominatim(user_agent="astro_chart")
    location = geolocator.geocode(place_name)
    
    if location:
        return {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "address": location.address,
            "raw": location.raw  # Incluye país, ciudad, etc.
        }
    else:
        raise ValueError(f"No se pudo encontrar la ubicación: {place_name}")

# Ejemplo de uso
if __name__ == "__main__":
    city = "Kyoto, Japan"
    data = get_location_data(city)
    print(f"Latitud: {data['latitude']}, Longitud: {data['longitude']}")
    print(f"Dirección completa: {data['address']}")