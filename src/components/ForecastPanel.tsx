import { useEffect, useMemo, useState } from "react";
import { useChartStore } from "../state/chartStore";

type ForecastItem = { day: string; window: string; text: string };

const GENERIC_ITEMS: ForecastItem[] = [
  { day: "Martes", window: "3 al 5 de noviembre", text: "Pronóstico genérico: Venus en sextil favorece acuerdos y creatividad." },
  { day: "Miércoles", window: "6 de noviembre", text: "Marte activo: evita impulsividad, enfoca la acción con claridad." },
  { day: "Jueves", window: "7 de noviembre", text: "Luna creciente: avanza en proyectos personales y logística." }
];

export const ForecastPanel = () => {
  const chart = useChartStore((state) => state.chart);
  const [showGeneric, setShowGeneric] = useState(false);

  useEffect(() => {
    setShowGeneric(false);
  }, [chart?.metadata?.utcDateTime]);

  const items = useMemo(() => {
    if (!chart || showGeneric) return GENERIC_ITEMS;
    const sun = chart.bodies.find((b) => b.id === "Sun");
    const sunLabel = sun ? sun.label ?? "Sol" : "Sol";
    return [
      {
        day: "Martes",
        window: "3 al 5 de noviembre",
        text: `Para tu ${sunLabel}, foco en crecimiento personal y visibilidad.`
      },
      GENERIC_ITEMS[1],
      GENERIC_ITEMS[2]
    ];
  }, [chart, showGeneric]);

  return (
    <div className="panel" style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>Pronóstico</h2>
          {!chart && <span style={{ color: "#94a3b8" }}>Vista genérica</span>}
          {chart && !showGeneric && <span style={{ color: "#22d3ee" }}>Adaptado a la carta cargada</span>}
          {chart && showGeneric && <span style={{ color: "#94a3b8" }}>Tránsito actual</span>}
        </div>
        {chart && (
          <button
            type: "button"
            onClick={() => setShowGeneric(true)}
            style={{
              padding: "0.45rem 0.75rem",
              borderRadius: "10px",
              border: "1px solid rgba(148,163,184,0.5)",
              background: "rgba(15,23,42,0.65)",
              color: "#e2e8f0",
              cursor: "pointer",
              fontWeight: 600,
              minWidth: "150px"
            }}
          >
            Tránsito actual
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "stretch" }}>
        {items.map((item) => (
          <div
            key={item.day}
            style={{
              background: "rgba(15,23,42,0.65)",
              border: "1px solid rgba(148,163,184,0.3)",
              borderRadius: "0.75rem",
              padding: "0.75rem",
              width: "220px",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              minHeight: "320px"
            }}
          >
            <strong style={{ display: "block", fontSize: "1.25rem", color: "#bfdbfe", lineHeight: 1.1 }}>{item.day}</strong>
            <div style={{ color: "#94a3b8" }}>{item.window}</div>
            <div
              style={{
                flex: 1,
                minHeight: "160px",
                background: "radial-gradient(circle at 50% 40%, rgba(148,163,184,0.25), rgba(15,23,42,0))",
                border: "1px dashed rgba(148,163,184,0.35)",
                borderRadius: "0.65rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#cbd5f5",
                fontSize: "0.9rem",
                textAlign: "center",
                padding: "0.5rem"
              }}
            >
              Espacio para la forma 3D / aspecto del día
            </div>
            <div style={{ color: "#e2e8f0", marginTop: "auto", fontSize: "0.95rem", lineHeight: 1.4 }}>{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
