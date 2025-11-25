import { useEffect, useMemo, useRef, useState } from "react";
import { DateTime } from "luxon";
import tzlookup from "tz-lookup";
import { useChartStore } from "../state/chartStore";
import { ASPECTS, BODY_LABELS, ZODIAC_SIGNS } from "../lib/config";
import { buildChart } from "../lib/astro/chartBuilder";

type ForecastVisual = { src: string; alt: string };
type ForecastItem = { title: string; window: string; text: string; visuals: ForecastVisual[] };

const formatDate = (dt: DateTime) => dt.toFormat("dd 'de' LLLL yyyy");

const aspectDistance = (a: number, b: number) => {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
};

const planetImage = (id: string) => `/assets/forecast/planets/${id.toLowerCase()}.png`;

const aspectImage = (label: string) => {
  const normalized = label.toLowerCase();
  if (normalized.includes("conj")) return "/assets/forecast/aspects/conjunction.png";
  if (normalized.includes("opos") || normalized.includes("oppos")) return "/assets/forecast/aspects/opposition.png";
  if (normalized.includes("trig") || normalized.includes("tri")) return "/assets/forecast/aspects/trine.png";
  if (normalized.includes("cuad") || normalized.includes("square")) return "/assets/forecast/aspects/quadrature.png";
  if (normalized.includes("sext")) return "/assets/forecast/aspects/sextile.png";
  if (normalized.includes("quin") || normalized.includes("quinc")) return "/assets/forecast/aspects/quincunx.png";
  return "/assets/forecast/aspects/sextile.png";
};

export const ForecastPanel = () => {
  const chart = useChartStore((state) => state.chart);
  const input = useChartStore((state) => state.input);
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

  const computeTransitAspects = () => {
    try {
      const zone = input.timezoneId ?? tzlookup(input.latitude, input.longitude);
      const now = DateTime.now().setZone(zone);
      const transitInput = {
        ...input,
        date: now.toISODate() ?? input.date,
        time: now.toFormat("HH:mm"),
        timezoneOffset: now.offset,
        timezoneId: zone
      };
      const transitChart = buildChart(transitInput);
      if (!chart) return [];
      const transitBodies = transitChart.bodies.filter((b) => b.category === "planet");
      const natalBodies = chart.bodies.filter((b) => b.category === "planet");
      const getName = (id: string, fallback?: string) => BODY_LABELS[id] ?? fallback ?? id;

      const results: { transit: string; natal: string; label: string; orb: number; transitId: string; natalId: string }[] = [];
      transitBodies.forEach((t) => {
        natalBodies.forEach((n) => {
          const dist = aspectDistance(t.longitude, n.longitude);
          ASPECTS.forEach((asp) => {
            const orb = Math.abs(dist - asp.angle);
            if (orb <= asp.orb) {
              results.push({
                transit: getName(t.id, t.label),
                natal: getName(n.id, n.label),
                label: asp.label,
                orb: Number(orb.toFixed(2)),
                transitId: t.id,
                natalId: n.id
              });
            }
          });
        });
      });
      return results.sort((a, b) => a.orb - b.orb);
    } catch {
      return [];
    }
  };

  const items = useMemo(() => {
    const now = DateTime.local().setLocale("es");
    const weekStart = now.set({ weekday: 1 }).startOf("day");
    const weekEnd = weekStart.plus({ days: 6 }).endOf("day");
    const commonWindow = `${formatDate(weekStart)} · ${formatDate(weekEnd)}`;

    const baseItems: ForecastItem[] = [
      {
        title: "Mercurio retrogrado",
        window: commonWindow,
        text: "Revision e introspeccion: ajustes en comunicacion y motivaciones profundas. Evita lanzamientos finales hasta pasar el retrogrado.",
        visuals: [
          { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio" },
          { src: "/assets/forecast/aspects/quadrature.png", alt: "Retrogrado / revision" }
        ]
      },
      {
        title: "Saturno retrogrado",
        window: commonWindow,
        text: "Revisa limites y responsabilidades. Cierra pendientes y ordena rutinas.",
        visuals: [
          { src: "/assets/forecast/planets/saturn.png", alt: "Saturno" },
          { src: "/assets/forecast/aspects/trine.png", alt: "Flujo / revision" }
        ]
      },
      {
        title: "Urano retrogrado",
        window: commonWindow,
        text: "Cambios en valores y estabilidad. Ajusta presupuestos y evita saltos bruscos.",
        visuals: [
          { src: "/assets/forecast/planets/uranus.png", alt: "Urano" },
          { src: "/assets/forecast/aspects/quincunx.png", alt: "Ajustes" }
        ]
      }
    ];

    if (!chart || showGeneric) {
      return baseItems;
    }

    const transitAspects = computeTransitAspects();
    const listed = transitAspects.slice(0, 45);
    const remaining = Math.max(transitAspects.length - listed.length, 0);
    const aspectsText = listed
      .map((a) => `${a.transit} ${a.label} ${a.natal} (orb ${a.orb.toFixed(1)}°)`)
      .join(" · ")
      .concat(remaining > 0 ? ` · +${remaining} aspectos mas` : "");

    const personalized: ForecastItem[] = [
      {
        title: "Venus transito · conjuncion · Marte natal",
        window: "Hasta domingo",
        text: "Atraccion y accion guiada por el deseo. Canaliza en proyectos creativos o vinculos.",
        visuals: [
          { src: "/assets/forecast/planets/venus.png", alt: "Venus" },
          { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjuncion" },
          { src: "/assets/forecast/planets/mars.png", alt: "Marte natal" }
        ]
      },
      {
        title: "Venus transito · conjuncion · Mercurio natal",
        window: "Hasta 2 de diciembre",
        text: "Comunicacion afectiva y acuerdos. Negocia con empatia.",
        visuals: [
          { src: "/assets/forecast/planets/venus.png", alt: "Venus" },
          { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjuncion" },
          { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio natal" }
        ]
      },
      {
        title: "Mercurio transito · conjuncion · Mercurio natal",
        window: "Hasta 13 de diciembre",
        text: "Revisiones de ideas y contratos. Ajusta detalles y firma solo lo necesario.",
        visuals: [
          { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio transito" },
          { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjuncion" },
          { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio natal" }
        ]
      },
      {
        title: "Mercurio transito · conjuncion · Marte natal",
        window: "Hasta 11 de diciembre",
        text: "Palabras con fuerza: cuida la impulsividad al hablar, usa la energia para avanzar tareas.",
        visuals: [
          { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio transito" },
          { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjuncion" },
          { src: "/assets/forecast/planets/mars.png", alt: "Marte natal" }
        ]
      },
      {
        title: "Venus transito · conjuncion · Pluton natal",
        window: "Hasta 4 de diciembre",
        text: "Intensidad emocional y vinculos. Profundiza con honestidad y evita manipulacion.",
        visuals: [
          { src: "/assets/forecast/planets/venus.png", alt: "Venus transito" },
          { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjuncion" },
          { src: "/assets/forecast/planets/pluto.png", alt: "Pluton natal" }
        ]
      },
    ];

    const aspectCards: ForecastItem[] = listed.map((a) => ({
      title: `${a.transit} ${a.label} ${a.natal}`,
      window: `${formatDate(now.startOf("day"))} · ${formatDate(now.endOf("day"))}`,
      text: `Orb ${a.orb.toFixed(1)}°. Cruce tránsito/natal.`,
      visuals: [
        { src: planetImage(a.transitId), alt: a.transit },
        { src: aspectImage(a.label), alt: a.label },
        { src: planetImage(a.natalId), alt: a.natal }
      ]
    }));

    if (remaining > 0) {
      aspectCards.push({
        title: `+${remaining} aspectos adicionales`,
        window: `${formatDate(now.startOf("day"))} · ${formatDate(now.endOf("day"))}`,
        text: "Hay más aspectos activos; revisa el detalle completo en la carta para priorizar.",
        visuals: [
          { src: "/assets/forecast/aspects/trine.png", alt: "Aspectos" },
          { src: "/assets/forecast/aspects/sextile.png", alt: "Aspectos" }
        ]
      });
    }

    return [...personalized, ...aspectCards];
  }, [chart, showGeneric, input]);

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
