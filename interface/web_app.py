"""Minimal Flask interface for GENASTRAL."""

from datetime import datetime
from io import BytesIO

from flask import Flask, jsonify, request, send_file

from core.chart_service import build_natal_chart
from visualization.chart_drawer import draw_chart

app = Flask(__name__)


@app.route("/", methods=["GET"])
def index():
    return jsonify(
        {
            "message": "Usa POST /chart con date, time y location para generar una carta.",
            "example_payload": {"date": "1990-05-12", "time": "14:30", "location": "Buenos Aires, Argentina"},
        }
    )


@app.route("/chart", methods=["POST"])
def generate_chart():
    payload = request.get_json(force=True)
    try:
        birth_date = payload["date"]
        birth_time = payload["time"]
        location = payload["location"]
    except KeyError as exc:
        return jsonify({"error": f"Campo faltante: {exc.args[0]}"}), 400

    local_dt = datetime.strptime(f"{birth_date} {birth_time}", "%Y-%m-%d %H:%M")
    chart = build_natal_chart(local_dt, location)
    svg_markup = draw_chart(chart["planets"], chart["houses"])

    return jsonify(
        {
            "planets": chart["planets"],
            "houses": chart["houses"],
            "aspects": chart["aspects"],
            "metadata": {
                "location": chart["metadata"]["location"],
                "timezone": chart["metadata"]["timezone"],
                "utc_datetime": chart["metadata"]["utc_datetime"].isoformat(),
            },
            "svg": svg_markup,
        }
    )


@app.route("/chart.svg", methods=["POST"])
def generate_chart_file():
    payload = request.get_json(force=True)
    local_dt = datetime.strptime(f"{payload['date']} {payload['time']}", "%Y-%m-%d %H:%M")
    chart = build_natal_chart(local_dt, payload["location"])
    svg_markup = draw_chart(chart["planets"], chart["houses"])
    buffer = BytesIO(svg_markup.encode("utf-8"))
    buffer.seek(0)
    return send_file(
        buffer,
        mimetype="image/svg+xml",
        as_attachment=True,
        download_name="natal_chart.svg",
    )


if __name__ == "__main__":
    app.run(debug=True)
