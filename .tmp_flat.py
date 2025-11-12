from flatlib.chart import Chart
from flatlib.const import HOUSES_PLACIDUS
from flatlib.datetime import Datetime
from flatlib.geopos import GeoPos

def dec_to_dms_str(value):
    sign = '-' if value < 0 else ''
    value = abs(value)
    deg = int(value)
    min_float = (value - deg) * 60
    minute = int(min_float)
    second = (min_float - minute) * 60
    return f"{sign}{deg}:{minute}:{second:.0f}"

calc_date = "1993/10/25"
calc_time = "12:25"
pos = GeoPos(dec_to_dms_str(-34.587), dec_to_dms_str(-58.407))
dt = Datetime(calc_date, calc_time, "-03:00")
chart = Chart(dt, pos, hsys=HOUSES_PLACIDUS)
print('Houses:')
for house in chart.houses:
    print(house.id, float(house.lon))
print('Objects:')
for obj in chart.objects:
    if obj.id in ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','LILITH']:
        print(obj.id, float(obj.lon), obj.house)
