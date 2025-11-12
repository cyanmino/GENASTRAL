"""Global configuration values for GENASTRAL."""

ZODIAC_TYPE = "tropical"  # "tropical" o "sidereal"
HOUSE_SYSTEM = "P"  # P = Placidus, W = Whole Sign, K = Koch

ASPECT_ANGLES = {
    "Conjunction": 0,
    "Opposition": 180,
    "Trine": 120,
    "Square": 90,
    "Sextile": 60,
}

ASPECT_ORBS = {
    "Conjunction": 8,
    "Opposition": 8,
    "Trine": 6,
    "Square": 6,
    "Sextile": 4,
}

ASPECTS_ENABLED = {
    "Conjunction": True,
    "Opposition": True,
    "Trine": True,
    "Square": True,
    "Sextile": True,
}

DIGNITIES = {
    "Sun": {"domicile": "Leo", "exaltation": "Aries"},
    "Moon": {"domicile": "Cancer", "exaltation": "Taurus"},
    "Mercury": {"domicile": ["Gemini", "Virgo"], "exaltation": "Virgo"},
    "Venus": {"domicile": ["Taurus", "Libra"], "exaltation": "Pisces"},
    "Mars": {"domicile": "Aries", "exaltation": "Capricorn"},
    "Jupiter": {"domicile": "Sagittarius", "exaltation": "Cancer"},
    "Saturn": {"domicile": "Capricorn", "exaltation": "Libra"},
}

CHART_STYLE = {
    "planet_color": "red",
    "house_line_color": "blue",
    "aspect_line_color": "gray",
    "background_color": "white",
}
