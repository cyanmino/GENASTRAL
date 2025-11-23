import { useEffect, useMemo } from "react";
import { ZODIAC_SIGNS, BODY_LABELS } from "../lib/config";
import { useChartStore } from "../state/chartStore";
import type { CelestialBody } from "../types/astro";

const formatPosition = (body: CelestialBody) => {
  const minutes = body.minuteInSign.toString().padStart(2, "0");
  return `${ZODIAC_SIGNS[body.signIndex]} ${body.degreeInSign}°${minutes}'`;
};

export const SolarReturnPanel = () => {
  const solarYear = useChartStore((state) => state.solarYear);
  const setSolarYear = useChartStore((state) => state.setSolarYear);
  const solarReturn = useChartStore((state) => state.solarReturn);
  const computeSolarReturn = useChartStore((state) => state.computeSolarReturn);
  const solarError = useChartStore((state) => state.solarError);
  const activeProfileId = useChartStore((state) => state.activeProfileId);
  const chart = useChartStore((state) => state.chart);

  useEffect(() => {
    if (activeProfileId && !solarReturn) {
      computeSolarReturn(solarYear);
    }
  }, [activeProfileId, computeSolarReturn, solarReturn, solarYear]);

  const byHouse = useMemo(() => {
    if (!solarReturn) return [];
    const planets = solarReturn.chart.bodies.filter((body) => body.category === "planet");
    const grouped: Record<number, CelestialBody[]> = {};
    planets.forEach((body) => {
      const key = body.house || 0;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(body);
    });
    return Object.entries(grouped)
      .map(([house, bodies]) => ({ house: Number(house), bodies }))
      .sort((a, b) => a.house - b.house);
  }, [solarReturn]);

  return (
    <div className="panel" style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.75rem", height: "100%", overflow: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
        <h2 style={{ margin: 0 }}>Revolución solar</h2>
        <input
          type="number"
          value={solarYear}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (Number.isFinite(value)) {
              setSolarYear(value);
              computeSolarReturn(value);
            }
          }}
          style={{ width: "7rem" }}
          aria-label="Seleccionar año de revolución solar"
        />
      </div>
      <small style={{ color: "#94a3b8" }}>
        Usa el perfil cargado como base. Sustituye aquí el cálculo preciso de revolución solar cuando esté disponible.
      </small>

      {!activeProfileId && !chart && (
        <div style={{ color: "#fbbf24", fontSize: "0.95rem" }}>
          Carga o calcula un perfil para habilitar la revolución solar.
        </div>
      )}

      {solarError && <div style={{ color: "#f87171" }}>{solarError}</div>}

      {solarReturn && (
        <>
          <section>
            <h3 style={{ marginBottom: "0.35rem" }}>Posiciones planetarias</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {solarReturn.chart.bodies
                .filter((body) => body.category === "planet")
                .map((body) => (
                  <li key={body.id} style={{ marginBottom: "0.25rem" }}>
                    <strong>{BODY_LABELS[body.id] ?? body.label}</strong> — {formatPosition(body)} — Casa {body.house}
                  </li>
                ))}
            </ul>
          </section>

          <section>
            <h3 style={{ marginBottom: "0.35rem" }}>Planetas por casas (Placidus)</h3>
            {byHouse.length === 0 && <p>No hay datos disponibles.</p>}
            {byHouse.map((entry) => (
              <div key={entry.house} style={{ marginBottom: "0.35rem" }}>
                <strong>Casa {entry.house}</strong>:{" "}
                {entry.bodies.map((body) => BODY_LABELS[body.id] ?? body.label).join(", ")}
              </div>
            ))}
          </section>

          <section>
            <h3 style={{ marginBottom: "0.35rem" }}>Puntos medios</h3>
            {solarReturn.midpoints.length === 0 && <p>Calcula o importa puntos medios desde el motor real.</p>}
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {solarReturn.midpoints.map((midpoint) => (
                <li key={midpoint.label} style={{ marginBottom: "0.25rem" }}>
                  <strong>{midpoint.label}</strong> — {ZODIAC_SIGNS[midpoint.signIndex]} {midpoint.degreeInSign}°
                  {midpoint.minuteInSign.toString().padStart(2, "0")}'
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 style={{ marginBottom: "0.35rem" }}>Aspectos RS vs. natal</h3>
            {solarReturn.natalAspects.length === 0 && (
              <p>Integra aquí la tabla completa de aspectos entre RS y natal.</p>
            )}
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {solarReturn.natalAspects.map((aspect) => (
                <li key={`${aspect.solarBody}-${aspect.natalBody}-${aspect.aspect}`} style={{ marginBottom: "0.25rem" }}>
                  {aspect.solarBody} — {aspect.aspect} — {aspect.natalBody} (orb {aspect.orb}°)
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
};
