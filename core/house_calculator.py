# house_calculator.py
from flatlib.chart import Chart
from flatlib.datetime import Datetime
from flatlib.geopos import GeoPos

def calculate_houses(utc_datetime, latitude, longitude, house_system='PLACIDUS'):
    date_str = utc_datetime.strftime('%Y-%m-%d')
    time_str = utc_datetime.strftime('%H:%M')
    pos = GeoPos(latitude, longitude)
    dt = Datetime(date_str, time_str, '+00:00')
    chart = Chart(dt, pos, hsys=house_system)

    cusps = [float(chart.get('House' + str(i)).lon) for i in range(1, 13)]
    return {
        "cusps": cusps,
        "ascendant": float(chart.get('ASC').lon),
        "mc": float(chart.get('MC').lon)
    }