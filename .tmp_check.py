from flatlib.chart import Chart
from flatlib.const import HOUSES_PLACIDUS
from flatlib.datetime import Datetime
from flatlib.geopos import GeoPos

calc_date = "1993/10/25"
calc_time = "12:25"
pos = GeoPos("-34.587", "-58.407")
dt = Datetime(calc_date, calc_time, "-03:00")
chart = Chart(dt, pos, hsys=HOUSES_PLACIDUS)
print("Asc", chart.Ascendant.lon)
print([house.lon for house in chart.houses])
for obj in chart.objects:
    if obj.id in ("Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"):
        print(obj.id, float(obj.lon), obj.house)
