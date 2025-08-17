from astro.asc_mc import calculate_asc_mc

asc, mc = calculate_asc_mc(
    year=1990, month=5, day=15,
    hour=14, minute=30,
    lat_deg=-34.6, lon_deg=-58.4,
    tz_offset=-3
)

print(f"Ascendente: {asc}°")
print(f"Medio Cielo: {mc}°")

