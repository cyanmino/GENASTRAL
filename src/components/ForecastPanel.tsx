import { useEffect, useMemo, useState } from "react";
import { useChartStore } from "../state/chartStore";

type ForecastVisual = { src: string; alt: string };
type ForecastItem = { day: string; window: string; text: string; visuals: ForecastVisual[] };

const GENERIC_ITEMS: ForecastItem[] = [
  {
    day: "Martes",
    window: "3 al 5 de noviembre",
    text: "Pronostico generico: Venus en sextil favorece acuerdos y creatividad.",
    visuals: [
      { src: "/assets/forecast/planets/venus.png", alt: "Venus" },
      { src: "/assets/forecast/aspects/sextile.png", alt: "Aspecto sextil" }
    ]
  },
  {
    day: "Miercoles",
    window: "6 de noviembre",
    text: "Marte activo: evita impulsividad, enfoca la accion con claridad.",
    visuals: [{ src: "/assets/forecast/planets/mars.png", alt: "Marte" }]
  },
  {
    day: "Jueves",
    window: "7 de noviembre",
    text: "Luna creciente: avanza en proyectos personales y logistica.",
    visuals: [{ src: "/assets/forecast/planets/moon.png", alt: "Luna" }]
  }
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
        text: `Para tu ${sunLabel}, foco en crecimiento personal y visibilidad.`,
        visuals: [{ src: "/assets/forecast/planets/sun.png", alt: "Sol" }]
      },
      GENERIC_ITEMS[1],
      {
        ...GENERIC_ITEMS[2],
        visuals: [
          { src: "/assets/forecast/planets/moon.png", alt: "Luna" },
          { src: "/assets/forecast/aspects/trine.png", alt: "Aspecto trigono" }
        ]
      }
    ];
  }, [chart, showGeneric]);

  return (
    <div className="panel" style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.75rem", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>Pronostico</h2>
          {!chart && <span style={{ color: "#94a3b8" }}>Vista generica</span>}
          {chart && !showGeneric && <span style={{ color: "#22d3ee" }}>Adaptado a la carta cargada</span>}
          {chart && showGeneric && <span style={{ color: "#94a3b8" }}>Transito actual</span>}
        </div>
        {chart && (
          <button
            type="button"
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
            Transito actual
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "stretch", flex: 1, minHeight: 0 }}>
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
              flex: 1,
              minHeight: "100%"
            }}
          >
            <strong style={{ display: "block", fontSize: "1.25rem", color: "#bfdbfe", lineHeight: 1.1 }}>{item.day}</strong>
            <div style={{ color: "#94a3b8" }}>{item.window}</div>
            <div
              style={{
                flex: 1,
                minHeight: "160px",
                background: "radial-gradient(circle at 50% 40%, rgba(148,163,184,0.12), rgba(15,23,42,0))",
                border: "1px dashed rgba(148,163,184,0.35)",
                borderRadius: "0.65rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.5rem"
              }}
            >
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
                {item.visuals.map((visual) => (
                  <img
                    key={visual.src}
                    src={visual.src}
                    alt={visual.alt}
                    style={{ maxWidth: "100px", maxHeight: "120px", objectFit: "contain" }}
                  />
                ))}
              </div>
            </div>
            <div style={{ color: "#e2e8f0", marginTop: "auto", fontSize: "0.95rem", lineHeight: 1.4 }}>{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
