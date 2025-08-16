# GENASTRAL
Herramienta astrológica que traduce coordenadas celestes en arquetipos simbólicos. 

astro_chart_generator/
│
├── data/
│   └── ephemeris/              # Tablas astronómicas si no usas librerías externas
│
├── core/
│   ├── time_conversion.py      # Convierte hora local a UTC
│   ├── geo_lookup.py           # Obtiene latitud/longitud del lugar
│   ├── planet_positions.py     # Calcula posiciones planetarias
│   ├── house_calculator.py     # Calcula casas astrológicas
│   └── chart_logic.py          # Asigna signos, aspectos, dignidades
│
├── visualization/
│   └── chart_drawer.py         # Dibuja la carta natal (SVG, PNG, etc.)
│
├── interface/
│   ├── cli.py                  # Interfaz por consola
│   └── web_app.py              # Interfaz web (Flask o Streamlit)
│
└── utils/
    └── config.py               # Parámetros como sistema de casas, tipo de zodíaco
