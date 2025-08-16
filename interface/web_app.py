# web_app.py

from flask import Flask, render_template, request, send_file
from datetime import datetime
from time_conversion import local_to_utc
from planet_positions import get_planet_positions
from house_calculator import calculate_houses
from chart_logic import assign_planets_to_houses, calculate_aspects
from chart_drawer import draw_chart

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        date = request.form["date"]
        time = request.form["time"]
        city = request.form["city"]
        system = request.form.get("system", "P")

        try:
            local_dt = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
            conversion = local_to_utc(local_dt, city)
            utc_dt = conversion["utc_datetime"]
            lat = conversion["latitude"]
            lon = conversion["longitude"]

            planets = get_planet_positions(utc_dt)
            houses = calculate_houses(utc_dt, lat, lon, house_system=system)
            planet_houses = assign_planets_to_houses(planets, houses["cusps"])
            aspects = calculate_aspects(planets)

            chart_file = "static/natal_chart.svg"
            draw_chart(planets, houses, filename=chart_file)

            return render_template("result.html",
                                   planets=planets,
                                   houses=houses,
                                   planet_houses=planet_houses,
                                   aspects=aspects,
                                   chart_file=chart_file,
                                   city=city,
                                   date=date,
                                   time=time)
        except Exception as e:
            return render_template("index.html", error=str(e))

    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)