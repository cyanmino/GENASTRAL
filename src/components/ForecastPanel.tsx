import { useEffect, useMemo, useRef, useState } from "react";
import { DateTime } from "luxon";
import { useChartStore } from "../state/chartStore";
import { ZODIAC_SIGNS } from "../lib/config";

type ForecastVisual = { src: string; alt: string };
type ForecastItem = { title: string; window: string; text: string; visuals: ForecastVisual[] };

export const ForecastPanel = () => {
  const chart = useChartStore((state) => state.chart);
  const [showGeneric, setShowGeneric] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    setShowGeneric(false);
  }, [chart?.metadata?.utcDateTime]);

  useEffect(() => {
    const measure = () => {
      if (typeof window !== "undefined") {
        setIsPortrait(window.innerHeight > window.innerWidth);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const items = useMemo(() => {
    const now = DateTime.local().setLocale("es");
    const weekStart = now.set({ weekday: 1 }).startOf("day");
    const weekEnd = weekStart.plus({ days: 6 }).endOf("day");
    const fmt = (dt: DateTime) => dt.toFormat("dd 'de' LLLL yyyy");
    const commonWindow = `${fmt(weekStart)} · ${fmt(weekEnd)}`;

    // Base general
    const baseItems: ForecastItem[] = [
      {
        title: "Mercurio retrógrado",
        window: commonWindow,
        text:
          "Semana de revisión e introspección: ajustes en comunicación, contratos y motivaciones profundas. Evita lanzamientos finales hasta pasar el retrógrado.",
        visuals: [
          { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio" },
          { src: "/assets/forecast/aspects/quadrature.png", alt: "Retrógrado / revisión" }
        ]
      },
      {
        title: "Saturno retrógrado",
        window: commonWindow,
        text: "Revisión de límites y responsabilidades. Cierra pendientes y ordena rutinas.",
        visuals: [
          { src: "/assets/forecast/planets/saturn.png", alt: "Saturno" },
          { src: "/assets/forecast/aspects/trine.png", alt: "Flujo / revisión" }
        ]
      },
      {
        title: "Urano retrógrado",
        window: commonWindow,
        text: "Cambios en valores, recursos y estabilidad. Ajusta presupuestos y evita saltos bruscos.",
        visuals: [
          { src: "/assets/forecast/planets/uranus.png", alt: "Urano" },
          { src: "/assets/forecast/aspects/quincunx.png", alt: "Ajustes" }
        ]
      }
    ];

    // Si no hay carta o se pide genérico, devolver base
    if (!chart || showGeneric) {
      return baseItems;
    }

    // Personalizado con la carta cargada: lista de aspectos solicitados
    const personalized: ForecastItem[] = [
      {
        title: "Venus tránsito · conjunción · Marte natal",
        window: "Hasta domingo",
        text: "Atracción, magnetismo y acciones guiadas por el deseo. Canaliza en proyectos creativos o vínculos.",
        visuals: [
          { src: "/assets/forecast/planets/venus.png", alt: "Venus" },
          { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjunción" },
          { src: "/assets/forecast/planets/mars.png", alt: "Marte natal" }
        ]
      },
      {
        title: "Venus tránsito · conjunción · Mercurio natal",
        window: "Hasta 2 de diciembre",
        text: "Comunicación afectiva, acuerdos y diplomacia. Buen momento para negociar con empatía.",
        visuals: [
          { src: "/assets/forecast/planets/venus.png", alt: "Venus" },
          { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjunción" },
          { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio natal" }
        ]
      },
      {
        title: "Mercurio tránsito · conjunción · Mercurio natal",
        window: "Hasta 13 de diciembre",
        text: "Revisión profunda de ideas y contratos. Ajusta detalles y firma sólo lo necesario.",
        visuals: [
          { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio tránsito" },
          { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjunción" },
          { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio natal" }
        ]
      },
      {
        title: "Mercurio tránsito · conjunción · Marte natal",
        window: "Hasta 11 de diciembre",
        text: "Palabras con fuerza: cuida la impulsividad al hablar, usa la energía para avanzar tareas.",
        visuals: [
          { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio tránsito" },
          { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjunción" },
          { src: "/assets/forecast/planets/mars.png", alt: "Marte natal" }
        ]
      },
      {
        title: "Venus tránsito · conjunción · Plutón natal",
        window: "Hasta 4 de diciembre",
        text: "Intensidad emocional y vínculos. Profundiza con honestidad y evita manipulación.",
        visuals: [
          { src: "/assets/forecast/planets/venus.png", alt: "Venus tránsito" },
          { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjunción" },
          { src: "/assets/forecast/planets/pluto.png", alt: "Plutón natal" }
        ]
      },
      {
        title: "+45 aspectos adicionales",
        window: "En ventana vigente",
        text: "Más aspectos están activos; revisa el detalle completo en la carta para priorizar.",
        visuals: [
          { src: "/assets/forecast/aspects/trine.png", alt: "Aspectos" },
          { src: "/assets/forecast/aspects/sextile.png", alt: "Aspectos" }
        ]
      }
    ];

    return personalized;
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
        {items.map((item, idx) => (
          <div
            key={`${item.title}-${idx}`}
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
            <strong style={{ display: "block", fontSize: "1.05rem", color: "#bfdbfe", lineHeight: 1.2 }}>{item.title}</strong>
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
