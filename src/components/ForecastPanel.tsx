import { useMemo, useState } from "react";
import { DateTime } from "luxon";
import tzlookup from "tz-lookup";
import { useChartStore } from "../state/chartStore";
import { ASPECTS } from "../lib/config";

type ForecastVisual = { src: string; alt: string };
type ForecastItem = { title: string; window: string; text: string; visuals: ForecastVisual[] };

const aspectDistance = (a: number, b: number) => {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
};

const aspectIcon = (label: string) => {
  const norm = label.toLowerCase();
  if (norm.includes("conj")) return "/assets/forecast/aspects/conjunction.png";
  if (norm.includes("opos") || norm.includes("opp")) return "/assets/forecast/aspects/opposition.png";
  if (norm.includes("trig") || norm.includes("tri")) return "/assets/forecast/aspects/trine.png";
  if (norm.includes("cuad") || norm.includes("square")) return "/assets/forecast/aspects/quadrature.png";
  if (norm.includes("sext")) return "/assets/forecast/aspects/sextile.png";
  if (norm.includes("quin")) return "/assets/forecast/aspects/quincunx.png";
  return "/assets/forecast/aspects/sextile.png";
};

const buildTodayItems = (now: DateTime): ForecastItem[] => {
  const startLabel = now.setLocale("es").toFormat("dd 'de' LLLL yyyy");
  const endLabel = now.plus({ days: 6 }).setLocale("es").toFormat("dd 'de' LLLL yyyy");
  return [
    {
      title: "Clima de hoy",
      window: `${startLabel} · Próximos 7 días hasta ${endLabel}`,
      text: "Clima base; se actualiza automáticamente y muestra la semana siguiente.",
      visuals: [
        { src: "/assets/forecast/planets/sun.png", alt: "Sol" },
        { src: "/assets/forecast/planets/moon.png", alt: "Luna" },
        { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio" }
      ]
    }
  ];
};

const MARIANO_ASPECTS: ForecastItem[] = [
  {
    title: "Sol trígono Luna",
    window: "1 nov 05:58",
    text: "Sol tránsito trígono Luna natal (Escorpio 9°04' · Casa 10).",
    visuals: [
      { src: "/assets/forecast/planets/sun.png", alt: "Sol" },
      { src: "/assets/forecast/aspects/trine.png", alt: "Trígono" },
      { src: "/assets/forecast/planets/moon.png", alt: "Luna" }
    ]
  },
  {
    title: "Venus trígono Saturno",
    window: "1 nov 20:38",
    text: "Venus tránsito trígono Saturno natal (Libra 23°38' · Casa 9).",
    visuals: [
      { src: "/assets/forecast/planets/venus.png", alt: "Venus" },
      { src: "/assets/forecast/aspects/trine.png", alt: "Trígono" },
      { src: "/assets/forecast/planets/saturn.png", alt: "Saturno" }
    ]
  },
  {
    title: "Venus conjunción Júpiter",
    window: "4 nov 05:53",
    text: "Venus tránsito conjunción Júpiter natal (Libra 26°37' · Casa 9).",
    visuals: [
      { src: "/assets/forecast/planets/venus.png", alt: "Venus" },
      { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjunción" },
      { src: "/assets/forecast/planets/jupiter.png", alt: "Júpiter" }
    ]
  },
  {
    title: "Venus conjunción Sol",
    window: "8 nov 17:28",
    text: "Venus tránsito conjunción Sol natal (Escorpio 2°14' · Casa 10).",
    visuals: [
      { src: "/assets/forecast/planets/venus.png", alt: "Venus" },
      { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjunción" },
      { src: "/assets/forecast/planets/sun.png", alt: "Sol" }
    ]
  },
  {
    title: "Sol sextil Neptuno / Urano",
    window: "10 nov 17:04",
    text: "Sol tránsito sextil Neptuno y Urano natales (Escorpio 18°33' · Casa 10).",
    visuals: [
      { src: "/assets/forecast/planets/sun.png", alt: "Sol" },
      { src: "/assets/forecast/aspects/sextile.png", alt: "Sextil" },
      { src: "/assets/forecast/planets/neptune.png", alt: "Neptuno" },
      { src: "/assets/forecast/planets/uranus.png", alt: "Urano" }
    ]
  },
  {
    title: "Sol conjunción Marte",
    window: "11 nov 19:14",
    text: "Sol tránsito conjunción Marte natal (Escorpio 19°39' · Casa 10).",
    visuals: [
      { src: "/assets/forecast/planets/sun.png", alt: "Sol" },
      { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjunción" },
      { src: "/assets/forecast/planets/mars.png", alt: "Marte" }
    ]
  },
  {
    title: "Venus trígono Luna",
    window: "14 nov 04:21",
    text: "Venus tránsito trígono Luna natal (Escorpio 9°04' · Casa 10).",
    visuals: [
      { src: "/assets/forecast/planets/venus.png", alt: "Venus" },
      { src: "/assets/forecast/aspects/trine.png", alt: "Trígono" },
      { src: "/assets/forecast/planets/moon.png", alt: "Luna" }
    ]
  },
  {
    title: "Sol conjunción Mercurio",
    window: "14 nov 15:18",
    text: "Sol tránsito conjunción Mercurio natal (Escorpio 22°30' · Casa 10).",
    visuals: [
      { src: "/assets/forecast/planets/sun.png", alt: "Sol" },
      { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjunción" },
      { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio" }
    ]
  },
  {
    title: "Sol cuadratura Saturno",
    window: "15 nov 18:18",
    text: "Sol tránsito cuadratura Saturno natal (Escorpio 23°38' · Casa 10).",
    visuals: [
      { src: "/assets/forecast/planets/sun.png", alt: "Sol" },
      { src: "/assets/forecast/aspects/quadrature.png", alt: "Cuadratura" },
      { src: "/assets/forecast/planets/saturn.png", alt: "Saturno" }
    ]
  },
  {
    title: "Sol conjunción Plutón",
    window: "16 nov 15:15",
    text: "Sol tránsito conjunción Plutón natal (Escorpio 24°31' · Casa 10).",
    visuals: [
      { src: "/assets/forecast/planets/sun.png", alt: "Sol" },
      { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjunción" },
      { src: "/assets/forecast/planets/pluto.png", alt: "Plutón" }
    ]
  },
  {
    title: "Marte cuadratura Luna",
    window: "17 nov 02:19",
    text: "Marte tránsito cuadratura Luna natal (Sagitario 9°04' · Casa 11).",
    visuals: [
      { src: "/assets/forecast/planets/mars.png", alt: "Marte" },
      { src: "/assets/forecast/aspects/quadrature.png", alt: "Cuadratura" },
      { src: "/assets/forecast/planets/moon.png", alt: "Luna" }
    ]
  },
  {
    title: "Marte sextil Venus",
    window: "21 nov 01:25",
    text: "Marte tránsito sextil Venus natal (Sagitario 11°57' · Casa 11).",
    visuals: [
      { src: "/assets/forecast/planets/mars.png", alt: "Marte" },
      { src: "/assets/forecast/aspects/sextile.png", alt: "Sextil" },
      { src: "/assets/forecast/planets/venus.png", alt: "Venus" }
    ]
  },
  {
    title: "Venus sextil Neptuno / Urano",
    window: "21 nov 17:41",
    text: "Venus tránsito sextil Neptuno y Urano natales (Escorpio 18°33' · Casa 10).",
    visuals: [
      { src: "/assets/forecast/planets/venus.png", alt: "Venus" },
      { src: "/assets/forecast/aspects/sextile.png", alt: "Sextil" },
      { src: "/assets/forecast/planets/neptune.png", alt: "Neptuno" },
      { src: "/assets/forecast/planets/uranus.png", alt: "Urano" }
    ]
  },
  {
    title: "Venus conjunción Marte",
    window: "22 nov 14:37",
    text: "Venus tránsito conjunción Marte natal (Escorpio 19°39' · Casa 10).",
    visuals: [
      { src: "/assets/forecast/planets/venus.png", alt: "Venus" },
      { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjunción" },
      { src: "/assets/forecast/planets/mars.png", alt: "Marte" }
    ]
  },
  {
    title: "Mercurio conjunción Plutón (R)",
    window: "23 nov 08:15",
    text: "Mercurio tránsito conjunción Plutón natal (Escorpio 24°31' · Casa 10).",
    visuals: [
      { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio" },
      { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjunción" },
      { src: "/assets/forecast/planets/pluto.png", alt: "Plutón" }
    ]
  },
  {
    title: "Mercurio cuadratura Saturno (R)",
    window: "24 nov 03:37",
    text: "Mercurio tránsito cuadratura Saturno natal (Escorpio 23°38' · Casa 10).",
    visuals: [
      { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio" },
      { src: "/assets/forecast/aspects/quadrature.png", alt: "Cuadratura" },
      { src: "/assets/forecast/planets/saturn.png", alt: "Saturno" }
    ]
  },
  {
    title: "Venus conjunción Mercurio",
    window: "24 nov 21:08",
    text: "Venus tránsito conjunción Mercurio natal (Escorpio 22°30' · Casa 10).",
    visuals: [
      { src: "/assets/forecast/planets/venus.png", alt: "Venus" },
      { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjunción" },
      { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio" }
    ]
  },
  {
    title: "Mercurio conjunción Mercurio (R)",
    window: "25 nov 08:49",
    text: "Mercurio tránsito conjunción Mercurio natal (Escorpio 22°30' · Casa 10).",
    visuals: [
      { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio" },
      { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjunción" },
      { src: "/assets/forecast/planets/mercury.png", alt: "Mercurio natal" }
    ]
  },
  {
    title: "Venus cuadratura Saturno",
    window: "25 nov 18:47",
    text: "Venus tránsito cuadratura Saturno natal (Escorpio 23°38' · Casa 10).",
    visuals: [
      { src: "/assets/forecast/planets/venus.png", alt: "Venus" },
      { src: "/assets/forecast/aspects/quadrature.png", alt: "Cuadratura" },
      { src: "/assets/forecast/planets/saturn.png", alt: "Saturno" }
    ]
  },
  {
    title: "Venus conjunción Plutón",
    window: "26 nov 11:35",
    text: "Venus tránsito conjunción Plutón natal (Escorpio 24°31' · Casa 10).",
    visuals: [
      { src: "/assets/forecast/planets/venus.png", alt: "Venus" },
      { src: "/assets/forecast/aspects/conjunction.png", alt: "Conjunción" },
      { src: "/assets/forecast/planets/pluto.png", alt: "Plutón" }
    ]
  }
];

export const ForecastPanel = () => {
  const chart = useChartStore((state) => state.chart);
  const profiles = useChartStore((state) => state.profiles);
  const activeProfileId = useChartStore((state) => state.activeProfileId);
  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const [showGeneric, setShowGeneric] = useState(false);

  const personalizedCards = useMemo(() => {
    if (!chart || showGeneric) return [];
    if (activeProfile && activeProfile.name?.toLowerCase().includes("mariano")) {
      return MARIANO_ASPECTS;
    }

    const zone = chart.metadata?.timezoneId ?? tzlookup(chart.metadata?.latitude ?? 0, chart.metadata?.longitude ?? 0);
    const now = DateTime.now().setZone(zone);
    const transits = (chart.transits ?? []).filter((b) => b.category === "planet");
    const natal = chart.bodies.filter((b) => b.category === "planet");
    const cards: ForecastItem[] = [];

    transits.forEach((t) => {
      natal.forEach((n) => {
        const dist = aspectDistance(t.longitude, n.longitude);
        ASPECTS.forEach((asp) => {
          const orb = Math.abs(dist - asp.angle);
          if (orb <= asp.orb) {
            cards.push({
              title: `${t.label ?? t.id} ${asp.label} ${n.label ?? n.id}`,
              window: now.toFormat("dd 'de' LLLL yyyy"),
              text: `Aspecto tránsito/natal con orb ${orb.toFixed(1)}°. Observa cómo se expresa en tu carta.`,
              visuals: [
                { src: `/assets/forecast/planets/${t.id.toLowerCase()}.png`, alt: t.label ?? t.id },
                { src: aspectIcon(asp.label), alt: asp.label },
                { src: `/assets/forecast/planets/${n.id.toLowerCase()}.png`, alt: n.label ?? n.id }
              ]
            });
          }
        });
      });
    });

    return cards.slice(0, 12);
  }, [chart, showGeneric, activeProfile]);

  const items = useMemo(() => {
    const now = DateTime.now();
    const base = buildTodayItems(now);
    if (!chart) return base;
    if (showGeneric) return base;
    return [...base, ...personalizedCards];
  }, [chart, personalizedCards, showGeneric]);

  const todayLabel = DateTime.now().setLocale("es").toFormat("dd 'de' LLLL yyyy");

  return (
    <div className="panel" style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.75rem", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>Pronóstico</h2>
          <span style={{ color: "#22d3ee" }}>Tránsito actual ({todayLabel})</span>
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
