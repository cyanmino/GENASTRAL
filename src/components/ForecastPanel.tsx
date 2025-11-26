import { useMemo, useState } from "react";
import { DateTime } from "luxon";
import tzlookup from "tz-lookup";
import { useChartStore } from "../state/chartStore";
import { ASPECTS } from "../lib/config";

type ForecastVisual = { src: string; alt: string };
type ForecastItem = { title: string; window: string; text: string; visuals: ForecastVisual[] };

const TODAY_ITEMS: ForecastItem[] = [
  {
    title: "Clima de hoy",
    window: "25 de noviembre 2025",
    text:
      "Sol 3° Sagitario: expansión y búsqueda de verdad. Mercurio 22° Escorpio retrógrado: revisión profunda de motivaciones. Venus 23° Escorpio: intensidad en vínculos y finanzas.",
    visuals: [
      { src: "/assets/forecast/planets/sun.png", alt: "Sol" },
      { src: "/assets/forecast/signs/sagitario.png", alt: "Sagitario" },
      { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio" },
      { src: "/assets/forecast/signs/escorpio.png", alt: "Escorpio" }
    ]
  },
  {
    title: "Mercurio Rx ☐ Neptuno",
    window: "Exacto 25 nov · 09:23 TU",
    text: "Tendencia a confusión y lapsos. Revisa datos, evita suposiciones y pausa antes de firmar o enviar mensajes sensibles.",
    visuals: [
      { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio" },
      { src: "/assets/forecast/aspects/quadrature.png", alt: "Cuadratura" },
      { src: "/assets/forecast/planets/neptune.png", alt: "Neptuno" }
    ]
  },
  {
    title: "Venus △ Júpiter Rx",
    window: "Trígono de agua (Escorpio–Cáncer)",
    text: "Alineación favorable: armonía y oportunidades en relaciones y recursos, especialmente para signos de agua.",
    visuals: [
      { src: "/assets/forecast/planets/venus.png", alt: "Venus" },
      { src: "/assets/forecast/aspects/trine.png", alt: "Trígono" },
      { src: "/assets/forecast/planets/jupiter.png", alt: "Júpiter" },
      { src: "/assets/forecast/signs/cancer.png", alt: "Cáncer" }
    ]
  },
  {
    title: "Luna creciente",
    window: "Hacia Cuarto Creciente (28 nov)",
    text: "Momento para avanzar lo iniciado en Luna Nueva; acciones graduales y ajustes prácticos.",
    visuals: [
      { src: "/assets/forecast/planets/moon.png", alt: "Luna" },
      { src: "/assets/forecast/aspects/sextile.png", alt: "Creciente" }
    ]
  }
];

export const ForecastPanel = () => {
  const chart = useChartStore((state) => state.chart);
  const [showGeneric, setShowGeneric] = useState(false);

  // Devuelve órbita mínima en grados
  const aspectDistance = (a: number, b: number) => {
    const diff = Math.abs(a - b) % 360;
    return diff > 180 ? 360 - diff : diff;
  };

  const computedAspects = useMemo(() => {
    if (!chart || !chart.transits?.length) return [];
    const results: ForecastItem[] = [];
    const transits = chart.transits.filter((b) => b.category === "planet");
    const natal = chart.bodies.filter((b) => b.category === "planet");
    transits.forEach((t) => {
      natal.forEach((n) => {
        const dist = aspectDistance(t.longitude, n.longitude);
        ASPECTS.forEach((asp) => {
          const orb = Math.abs(dist - asp.angle);
          if (orb <= asp.orb) {
            results.push({
              title: `${t.label ?? t.id} ${asp.label} ${n.label ?? n.id}`,
              window: DateTime.local().toFormat("dd 'de' LLLL yyyy"),
              text: `Aspecto tránsito/natal con orb ${orb.toFixed(1)}°. Revisa cómo se expresa en tu carta.`,
              visuals: [
                { src: `/assets/forecast/planets/${t.id.toLowerCase()}.png`, alt: t.label ?? t.id },
                { src: `/assets/forecast/aspects/${asp.label.toLowerCase()}.png`, alt: asp.label },
                { src: `/assets/forecast/planets/${n.id.toLowerCase()}.png`, alt: n.label ?? n.id }
              ]
            });
          }
        });
      });
    });
    // limitar a primeros 8
    return results.slice(0, 8);
  }, [chart]);

  const items = useMemo(() => {
    const base = TODAY_ITEMS;
    if (!chart) return base;
    // si hay aspectos tránsito/natal, los añadimos debajo
    return [...base, ...computedAspects];
  }, [chart, computedAspects]);

  return (
    <div className="panel" style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.75rem", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>Pronóstico</h2>
          <span style={{ color: "#22d3ee" }}>Tránsito actual (25 nov 2025)</span>
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
            Tránsito actual
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "stretch", flex: 1, minHeight: 0 }}>
        {items.map((item) => (
          <div
            key={item.title}
            style={{
              background: "rgba(15,23,42,0.65)",
              border: "1px solid rgba(148,163,184,0.3)",
              borderRadius: "0.75rem",
              padding: "0.75rem",
              width: "240px",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              minHeight: "320px",
              boxSizing: "border-box",
              flex: "1 1 220px"
            }}
          >
            <strong style={{ display: "block", fontSize: "1.25rem", color: "#bfdbfe", lineHeight: 1.1 }}>{item.title}</strong>
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
                padding: "0.5rem"
              }}
            >
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
                {item.visuals.map((v) => (
                  <img
                    key={v.src}
                    src={v.src}
                    alt={v.alt}
                    style={{ width: "64px", height: "64px", objectFit: "contain", filter: "drop-shadow(0 0 6px #94a3b844)" }}
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
