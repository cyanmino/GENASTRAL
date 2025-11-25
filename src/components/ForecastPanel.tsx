import { useEffect, useMemo, useRef, useState } from "react";
import { DateTime } from "luxon";
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
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isPortrait, setIsPortrait] = useState(() => window.innerHeight > window.innerWidth);

  useEffect(() => {
    setShowGeneric(false);
  }, [chart?.metadata?.utcDateTime]);

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const items = useMemo(() => {
    const now = DateTime.local().setLocale("es");
    const formatDate = (dt: DateTime) => dt.toFormat("dd 'de' LLLL yyyy");
    const dayName = (offset: number, dt: DateTime) => {
      if (offset === 0) return "Hoy";
      const raw = dt.toFormat("cccc");
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    };

    if (!chart || showGeneric) {
      return GENERIC_ITEMS.map((base, index) => {
        const date = now.plus({ days: index });
        return {
          ...base,
          day: dayName(index, date),
          window: `${formatDate(date.startOf("day"))} · ${formatDate(date.endOf("day"))}`
        };
      });
    }

    const sun = chart.bodies.find((b) => b.id === "Sun");
    const sunLabel = sun ? sun.label ?? "Sol" : "Sol";

    return [0, 1, 2].map((offset) => {
      const date = now.plus({ days: offset });
      const baseDay = dayName(offset, date);
      const window = `${formatDate(date.startOf("day"))} · ${formatDate(date.endOf("day"))}`;

      if (offset === 0) {
        return {
          day: baseDay,
          window,
          text: `Tránsito del día: potencia tu ${sunLabel} con foco en visibilidad y propósito.`,
          visuals: [{ src: "/assets/forecast/planets/sun.png", alt: "Sol" }]
        };
      }

      if (offset === 1) {
        return {
          day: baseDay,
          window,
          text: "Impulso marciano: canaliza la acción con claridad y evita la impulsividad.",
          visuals: [{ src: "/assets/forecast/planets/mars.png", alt: "Marte" }]
        };
      }

      return {
        day: baseDay,
        window,
        text: "Fase lunar activa: buen momento para ajustar logística y autocuidado.",
        visuals: [
          { src: "/assets/forecast/planets/moon.png", alt: "Luna" },
          { src: "/assets/forecast/aspects/trine.png", alt: "Aspecto trigono" }
        ]
      };
    });
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

      <div
        style={{
          position: "relative",
          flex: isPortrait ? "none" : 1,
          minHeight: isPortrait ? "auto" : 0,
          overflow: isPortrait ? "visible" : "hidden",
          paddingBottom: isPortrait ? 0 : "2.5rem"
        }}
      >
        <div
          ref={trackRef}
          style={{
            display: "flex",
            flexDirection: isPortrait ? "column" : "row",
            gap: "0.75rem",
            height: isPortrait ? "auto" : "100%",
            overflowX: isPortrait ? "visible" : "auto",
            overflowY: isPortrait ? "visible" : "hidden",
            scrollBehavior: "smooth",
            paddingBottom: isPortrait ? "0" : "0.5rem"
          }}
        >
        {items.map((item) => (
          <div
            key={item.day}
            style={{
              background: "rgba(15,23,42,0.65)",
              border: "1px solid rgba(148,163,184,0.3)",
              borderRadius: "0.75rem",
              padding: "0.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              flex: 1,
              minWidth: isPortrait ? "100%" : "240px",
              maxWidth: isPortrait ? "100%" : "260px",
              boxSizing: "border-box",
              overflow: "hidden"
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
                padding: "0.5rem",
                overflow: "hidden",
                width: "100%"
              }}
            >
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
                {item.visuals.map((visual) => (
                  <img
                    key={visual.src}
                    src={visual.src}
                    alt={visual.alt}
                    style={{ maxWidth: "100px", maxHeight: "120px", objectFit: "contain", display: "block" }}
                  />
                ))}
              </div>
            </div>
            <div
              style={{
                color: "#e2e8f0",
                marginTop: "auto",
                fontSize: "0.95rem",
                lineHeight: 1.4,
                background: "rgba(15,23,42,0.4)",
                borderRadius: "0.5rem",
                padding: "0.5rem"
              }}
            >
              {item.text}
            </div>
          </div>
        ))}
        </div>
        {!isPortrait && (
          <div
            style={{
              position: "absolute",
              bottom: "0.25rem",
              right: "0.5rem",
              display: "flex",
              gap: "0.35rem",
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(148,163,184,0.3)",
              borderRadius: "999px",
              padding: "0.25rem 0.4rem"
            }}
          >
            <button
              type="button"
              onClick={() => {
                const el = trackRef.current;
                if (el) el.scrollLeft -= 240;
              }}
              style={{ background: "transparent", border: "none", color: "#e2e8f0", cursor: "pointer", fontWeight: 700 }}
              aria-label="Desplazar a la izquierda"
            >
              ◀
            </button>
            <button
              type="button"
              onClick={() => {
                const el = trackRef.current;
                if (el) el.scrollLeft += 240;
              }}
              style={{ background: "transparent", border: "none", color: "#e2e8f0", cursor: "pointer", fontWeight: 700 }}
              aria-label="Desplazar a la derecha"
            >
              ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
