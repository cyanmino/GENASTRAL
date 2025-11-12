from flatlib import const
from flatlib.chart import Chart
from flatlib.datetime import Datetime
from flatlib.geopos import GeoPos

def dec_to_dms(value):
    sign = '-' if value < 0 else ''
    value = abs(value)
    deg = int(value)
    minute = int((value - deg) * 60)
    second = int(round(((value - deg) * 60 - minute) * 60))
    return f"{sign}{deg}:{minute}:{second}"

dt = Datetime("1993/10/25", "12:25", "-03:00")
pos = GeoPos(dec_to_dms(-34.587), dec_to_dms(-58.407))
chart = Chart(dt, pos, hsys=const.HOUSES_PLACIDUS)
lilith = chart.get(const.LILITH)
print(float(lilith.lon))
