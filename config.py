# config.py

# Zodíaco
ZODIAC_TYPE = "tropical"  # Opciones: "tropical", "sidereal"

# Sistema de casas
HOUSE_SYSTEM = "P"  # P = Placidus, W = Whole Sign, K = Koch, etc.

# Orbes para aspectos
ASPECT_ORBS = {
    "Conjunction": 8,
    "Opposition": 8,
    "Trine": 6,
    "Square": 6,
    "Sextile": 4
}

# Aspectos considerados
ASPECTS_ENABLED = {
    "Conjunction": True,
    "Opposition": True,
    "Trine": True,
    "Square": True,
    "Sextile": True
}

# Dignidades planetarias (simplificadas)
DIGNITIES = {
    "Sun": {"domicile": "Leo", "exaltation": "Aries"},
    "Moon": {"domicile": "Cancer", "exaltation": "Taurus"},
    "Mercury": {"domicile": ["Gemini", "Virgo"], "exaltation": "Virgo"},
    "Venus": {"domicile": ["Taurus", "Libra"], "exaltation": "Pisces"},
    "Mars": {"domicile": "Aries", "exaltation": "Capricorn"},
    "Jupiter": {"domicile": "Sagittarius", "exaltation": "Cancer"},
    "Saturn": {"domicile": "Capricorn", "exaltation": "Libra"},
    # Puedes añadir Urano, Neptuno, Plutón si lo deseas
}

# Visualización
CHART_STYLE = {
    "planet_color": "red",
    "house_line_color": "blue",
    "aspect_line_color": "gray",
    "background_color": "white"
}