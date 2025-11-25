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

    const sun = chart?.bodies.find((b) => b.id === "Sun");
    const moon = chart?.bodies.find((b) => b.id === "Moon");
    const asc = chart?.bodies.find((b) => b.id === "Ascendente");
    const mercury = chart?.bodies.find((b) => b.id === "Mercury");
    const saturn = chart?.bodies.find((b) => b.id === "Saturn");
    const uranus = chart?.bodies.find((b) => b.id === "Uranus");
    const signLabel = (body?: { signIndex: number }) =>
      body ? ZODIAC_SIGNS[body.signIndex] ?? "" : "";

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
        title: "Aspectos de Mercurio con planetas lentos",
        window: commonWindow,
        text: "Sextiles y contactos a planetas lentos facilitan investigar y ver capas ocultas. Ideal para auditar información.",
        visuals: [
          { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio" },
          { src: "/assets/forecast/aspects/sextile.png", alt: "Sextil" },
          { src: "/assets/forecast/planets/pluto.png", alt: "Plutón" }
        ]
      },
      {
        title: "Saturno retrógrado",
        window: commonWindow,
        text: "Revisión de límites y responsabilidades emocionales. Cierra pendientes, ordena rutinas y compromisos.",
        visuals: [
          { src: "/assets/forecast/planets/saturn.png", alt: "Saturno" },
          { src: "/assets/forecast/aspects/trine.png", alt: "Flujo / revisión" }
        ]
      },
      {
        title: "Urano retrógrado",
        window: commonWindow,
        text: "Cambios en valores, recursos y estabilidad. Ajusta presupuestos y evita decisiones bruscas en economía.",
        visuals: [
          { src: "/assets/forecast/planets/uranus.png", alt: "Urano" },
          { src: "/assets/forecast/aspects/quincunx.png", alt: "Ajustes" }
        ]
      },
      {
        title: "Luna recorriendo la semana",
        window: `${fmt(weekStart)} · ${fmt(weekEnd)}`,
        text:
          "Luna cambia rápido de signo: oscila entre momentos sociales y de introspección. Observa tu energía diaria y ajusta agenda.",
        visuals: [
          { src: "/assets/forecast/planets/moon.png", alt: "Luna" },
          { src: "/assets/forecast/aspects/trine.png", alt: "Flujo" }
        ]
      },
      {
        title: "Sol en tránsito",
        window: commonWindow,
        text: `Enfoque semanal en propósito y visibilidad. Úsalo para clarificar metas y narrativa personal.`,
        visuals: [
          { src: "/assets/forecast/planets/sun.png", alt: "Sol" },
          { src: "/assets/forecast/aspects/sextile.png", alt: "Impulso" }
        ]
      }
    ];

    if (!chart || showGeneric) {
      return baseItems;
    }

    const personalized: ForecastItem[] = [
      {
        title: `Mercurio retrógrado en ${signLabel(mercury) || "tu carta"}`,
        window: commonWindow,
        text: `Revisa comunicaciones y acuerdos en claves ${signLabel(mercury)}. Observa mensajes, mails y conversaciones que necesiten revisión.`,
        visuals: [
          { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio" },
          { src: "/assets/forecast/aspects/quadrature.png", alt: "Retrógrado / revisión" }
        ]
      },
      {
        title: "Mercurio y planetas lentos",
        window: commonWindow,
        text: "Contacto con planetas lentos favorece investigación: ideal para auditar datos, terapias o estudios.",
        visuals: [
          { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio" },
          { src: "/assets/forecast/aspects/sextile.png", alt: "Sextil" },
          { src: "/assets/forecast/planets/pluto.png", alt: "Plutón" }
        ]
      },
      {
        title: `Saturno retrógrado en ${signLabel(saturn) || "tu carta"}`,
        window: commonWindow,
        text: `Replantea límites y estructura en áreas ${signLabel(saturn)}. Buen momento para regularizar pendientes.`,
        visuals: [
          { src: "/assets/forecast/planets/saturn.png", alt: "Saturno" },
          { src: "/assets/forecast/aspects/trine.png", alt: "Flujo / revisión" }
        ]
      },
      {
        title: `Urano retrógrado en ${signLabel(uranus) || "tu carta"}`,
        window: commonWindow,
        text: `Revisión de cambios en valores/recursos. Ajusta presupuestos y evita saltos bruscos en economía.`,
        visuals: [
          { src: "/assets/forecast/planets/uranus.png", alt: "Urano" },
          { src: "/assets/forecast/aspects/quincunx.png", alt: "Ajustes" }
        ]
      },
      {
        title: `Luna semanal (observa tu Luna en ${signLabel(moon) || "tu signo"})`,
        window: `${fmt(weekStart)} · ${fmt(weekEnd)}`,
        text: "Oscila entre sociabilidad e introspección; cuida descansos y agua. Ajusta agenda según tu energía diaria.",
        visuals: [
          { src: "/assets/forecast/planets/moon.png", alt: "Luna" },
          { src: "/assets/forecast/aspects/trine.png", alt: "Flujo" }
        ]
      },
      {
        title: `Sol en tránsito — foco en tu ${sunLabel || "Sol"}`,
        window: commonWindow,
        text: `Visibilidad y propósito: organiza agenda para priorizar tus metas clave según tu Sol en ${signLabel(sun)} y Asc en ${signLabel(asc)}.`,
        visuals: [
          { src: "/assets/forecast/planets/sun.png", alt: "Sol" },
          { src: "/assets/forecast/aspects/sextile.png", alt: "Impulso" }
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
