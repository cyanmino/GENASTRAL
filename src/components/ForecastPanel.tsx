import { useMemo, useState } from "react";
import { useChartStore } from "../state/chartStore";
import { ZODIAC_SIGNS } from "../lib/config";

type ForecastItem = {
  day: string;
  summary: string;
  window: string;
};

const GENERIC_FORECAST: ForecastItem[] = [
  { day: "Martes", summary: "Venus en sextil arm\u00f3nico favorece acuerdos y creatividad.", window: "3 al 5 de noviembre" },
  { day: "Mi\u00e9rcoles", summary: "Marte activa la acci\u00f3n r\u00e1pida: evita impulsividad.", window: "6 de noviembre" },
  { day: "Jueves", summary: "Luna creciente impulsa avances en proyectos personales.", window: "7 de noviembre" },
  { day: "Viernes", summary: "Sol en tr\u00edgono a J\u00fapiter: expansi\u00f3n y oportunidades.", window: "8 al 9 de noviembre" },
  { day: "S\u00e1bado", summary: "Mercurio inspira claridad mental y comunicaci\u00f3n fluida.", window: "10 de noviembre" }
];

export const ForecastPanel = () => {
  const chart = useChartStore((state) => state.chart);
  const activeProfile = useChartStore((state) =>
    state.profiles.find((p) => p.id === state.activeProfileId)
  );
  const [showGeneric, setShowGeneric] = useState(false);

  const personalized = useMemo(() => {
    if (!chart) return undefined;
    const sun = chart.bodies.find((b) => b.id === "Sun");
    const moon = chart.bodies.find((b) => b.id === "Moon");
    const asc = chart.bodies.find((b) => b.id === "Ascendente");
    const sunSign = sun ? ZODIAC_SIGNS[sun.signIndex] : undefined;
    const moonSign = moon ? ZODIAC_SIGNS[moon.signIndex] : undefined;
    const ascSign = asc ? ZODIAC_SIGNS[asc.signIndex] : undefined;

    return GENERIC_FORECAST.map((item, idx) => {
      if (idx === 0 && sunSign) {
        return { ...item, summary: `Para tu Sol en ${sunSign}, foco en crecimiento personal y visibilidad.` };
      }
      if (idx === 1 && moonSign) {
        return { ...item, summary: `Con Luna en ${moonSign}, prioriza equilibrio emocional y cuidados.` };
      }
      if (idx === 2 && ascSign) {
        return { ...item, summary: `Ascendente en ${ascSign}: mueve el cuerpo, ajusta rutina y bienestar.` };
      }
      return item;
    });
  }, [chart]);

  const list = showGeneric ? GENERIC_FORECAST : personalized ?? GENERIC_FORECAST;

  return (
    <div
      className="panel"
      style={{ display: "flex", flexDirection: "column", gap: "0.75rem", height: "100%" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <h2 style={{ margin: 0 }}>Pron\u00f3stico</h2>
          {chart && activeProfile && !showGeneric && (
            <p style={{ color: "#a5f3fc", margin: 0, fontSize: "0.85rem" }}>
              Pron\u00f3stico adaptado para {activeProfile.name}. Ajusta casas/elementos para afinar el detalle.
            </p>
          )}
          {(!chart || showGeneric) && (
            <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.85rem" }}>
              Pron\u00f3stico gen\u00e9rico mostrado.
            </p>
          )}
        </div>
        {chart && (
          <button
            type="button"
            onClick={() => setShowGeneric(true)}
            style={{
              padding: "0.45rem 0.75rem",
              borderRadius: "10px",
              border: "1px solid rgba(148,163,184,0.5)",
              background: showGeneric ? "rgba(59,130,246,0.15)" : "rgba(15,23,42,0.65)",
              color: "#e2e8f0",
              cursor: "pointer",
              fontWeight: 600,
              minWidth: "140px",
              textAlign: "center"
            }}
          >
            Tr\u00e1nsito actual
          </button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "0.75rem",
          flex: 1,
          minHeight: 0
        }}
      >
        {list.map((item) => (
          <div
            key={item.day}
            style={{
              background: "rgba(15,23,42,0.65)",
              border: "1px solid rgba(148,163,184,0.25)",
              borderRadius: "0.75rem",
              padding: "0.75rem",
              minHeight: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <strong style={{ color: "#bfdbfe", fontSize: "1.3rem", lineHeight: 1.1 }}>{item.day}</strong>
              <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>{item.window}</span>
            </div>
            <div
              style={{
                flex: 1,
                minHeight: "140px",
                background: "radial-gradient(circle at 30% 30%, rgba(96,165,250,0.3), rgba(15,23,42,0))",
                border: "1px dashed rgba(148,163,184,0.35)",
                borderRadius: "0.75rem"
              }}
            />
            <p
              style={{
                margin: 0,
                color: "#e2e8f0",
                fontSize: "0.95rem",
                lineHeight: 1.4,
                marginTop: "auto"
              }}
            >
              {item.summary}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
