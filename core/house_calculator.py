"""Calculate astrological houses using flatlib."""

from typing import Dict

from flatlib import const
from flatlib.chart import Chart
from flatlib.datetime import Datetime
from flatlib.geopos import GeoPos

from utils.config import HOUSE_SYSTEM

HOUSE_SYSTEM_ALIASES = {
    "P": const.HOUSES_PLACIDUS,
    "PLACIDUS": const.HOUSES_PLACIDUS,
    "PL": const.HOUSES_PLACIDUS,
    "W": const.HOUSES_WHOLE_SIGN,
    "WHOLE_SIGN": const.HOUSES_WHOLE_SIGN,
    "WHOLE": const.HOUSES_WHOLE_SIGN,
    "K": const.HOUSES_KOCH,
    "KOCH": const.HOUSES_KOCH,
    "EQUAL": const.HOUSES_EQUAL,
    "E": const.HOUSES_EQUAL,
    "REGIOMONTANUS": const.HOUSES_REGIOMONTANUS,
    "R": const.HOUSES_REGIOMONTANUS,
}


def _normalize_house_system(value: str) -> str:
    token = (value or "").strip().replace("-", "_").upper()
    if not token:
        return const.HOUSES_PLACIDUS
    return HOUSE_SYSTEM_ALIASES.get(token, const.HOUSES_PLACIDUS)


def _format_coordinate(value: float, positive_suffix: str, negative_suffix: str) -> str:
    degrees = abs(value)
    deg = int(degrees)
    minutes = int(round((degrees - deg) * 60))
    if minutes == 60:
        deg += 1
        minutes = 0
    direction = positive_suffix if value >= 0 else negative_suffix
    return f"{deg}{direction}{minutes:02d}"


def calculate_houses(
    utc_datetime,
    latitude: float,
    longitude: float,
    house_system: str = HOUSE_SYSTEM,
) -> Dict[str, object]:
    """Return cusps, ascendant, and MC for the given moment."""
    date_str = utc_datetime.strftime("%Y/%m/%d")
    time_str = utc_datetime.strftime("%H:%M")
    lat_str = _format_coordinate(latitude, "n", "s")
    lon_str = _format_coordinate(longitude, "e", "w")
    pos = GeoPos(lat_str, lon_str)
    dt = Datetime(date_str, time_str, "+00:00")
    hsys = _normalize_house_system(house_system)
    chart = Chart(dt, pos, hsys=hsys)

    cusps = [float(chart.get(f"House{i}").lon) for i in range(1, 13)]
    return {
        "cusps": cusps,
        "ascendant": float(chart.get(const.ASC).lon),
        "mc": float(chart.get(const.MC).lon),
    }
