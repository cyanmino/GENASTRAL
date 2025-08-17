# test_ephemeris.py
import swisseph as swe

# Paso 1: Establecer el path donde está el archivo
swe.set_ephe_path("data/ephemeris")

# Paso 2: Forzar uso de efemérides externas
swe.set_ephe_mode(swe.SEFLG_SWIEPH)

# Paso 3: Convertir fecha a Julian Day
jd = swe.julday(2000, 1, 1, 12.0)  # 1 de enero de 2000 a las 12:00 UTC

# Paso 4: Calcular posición del Sol
try:
    sun_pos = swe.calc(jd, swe.SUN)
    print(f"✅ Longitud eclíptica del Sol el 01/01/2000: {sun_pos[0]:.6f}°")
except swe.SwissephException as e:
    print("❌ Error al calcular posición:", e)