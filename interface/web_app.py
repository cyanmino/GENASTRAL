# web_app.py

from flask import Flask, render_template, request, send_file
from datetime import datetime
from time_conversion import local_to_utc
from planet_positions import get_planet_positions
from house_calculator import calculate_houses
from chart_logic import assign_planets_to_houses, calculate_aspects
from chart_drawer import draw_chart

app = Flask(__name__)

@app.route("/generate_chart", methods=["POST"])
def generate_chart():
    data = request.json
    birth_date = data["date"]
    birth_time = data["time"]
    location = data["location"]

    local_dt = datetime.strptime(f"{birth_date} {birth_time}", "%Y-%m-%d %H:%M")
    latitude, longitude = get_location_coordinates(location)
    utc_dt = convert_to_utc(local_dt, latitude, longitude)

    planets = get_planet_positions(utc_dt, latitude, longitude)
    houses = calculate_houses(utc_dt, latitude, longitude)

    chart_svg = draw_chart(planets, houses)  # si tenés un módulo de dibujo

    return jsonify({
        "planets": planets,
        "houses": houses,
        "svg": chart_svg
    })

