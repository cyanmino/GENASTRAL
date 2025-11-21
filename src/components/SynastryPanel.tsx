import { useMemo, useState } from "react";
import { buildChart } from "../lib/astro/chartBuilder";
import { ASPECTS, ZODIAC_SIGNS } from "../lib/config";
import { useChartStore } from "../state/chartStore";
import type { CelestialBody } from "../types/astro";

const pickBody = (chartBodies: CelestialBody[], id: string) =>
  chartBodies.find((b) => b.id === id);

const SIGN_ELEMENTS: ("fire" | "earth" | "air" | "water")[] = [
  "fire",
  "earth",
  "air",
  "water",
  "fire",
  "earth",
  "air",
  "water",
  "fire",
  "earth",
  "air",
  "water"
];

const elementLabel: Record<(typeof SIGN_ELEMENTS)[number], string> = {
  fire: "Fuego",
  earth: "Tierra",
  air: "Aire",
  water: "Agua"
};

const describeElementMix = (signA?: number, signB?: number) => {
  if (signA == null || signB == null) return "Sin datos suficientes para comparar elementos.";
  const elA = SIGN_ELEMENTS[signA];
  const elB = SIGN_ELEMENTS[signB];
  if (elA === elB) return `Compatibilidad natural de elemento ${elementLabel[elA]}.`;
  const pair = [elA, elB].sort().join("-");
  if (pair === "air-fire") return "Aire/Fuego: dinámica, motivadora pero puede ser acelerada.";
  if (pair === "earth-water") return "Tierra/Agua: complementarios, estables y sensibles.";
  if (pair === "air-water") return "Aire/Agua: emociones y mente, requiere empatía.";
  if (pair === "earth-fire") return "Tierra/Fuego: mezcla de impulso y realismo, necesita equilibrio.";
  if (pair === "air-earth") return "Aire/Tierra: ideas con pragmatismo, puede sentirse frío.";
  if (pair === "fire-water") return "Fuego/Agua: pasión con intensidad emocional, a veces volátil.";
  return "";
};

const orbMatch = (angle: number, target: number, orb: number) => {
  const diff = Math.abs(target - angle);
  return diff <= orb;
};

const crossAspects = (aBodies: CelestialBody[], bBodies: CelestialBody[]) => {
  const relevant = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Ascendente"];
  const aspects: { from: string; to: string; label: string }[] = [];
  relevant.forEach((idA) => {
    const bodyA = pickBody(aBodies, idA);
    if (!bodyA) return;
    relevant.forEach((idB) => {
      const bodyB = pickBody(bBodies, idB);
      if (!bodyB) return;
      const angle = Math.abs(bodyA.longitude - bodyB.longitude) % 360;
      const smallest = angle > 180 ? 360 - angle : angle;
      const match = ASPECTS.find((a) => orbMatch(smallest, a.angle, a.orb));
      if (match) {
        aspects.push({ from: idA, to: idB, label: match.label });
      }
    });
  });
  return aspects;
};

const describeBullets = (
  sunA?: CelestialBody,
  moonA?: CelestialBody,
  ascA?: CelestialBody,
  sunB?: CelestialBody,
  moonB?: CelestialBody,
  ascB?: CelestialBody
) => {
  const bullets: string[] = [];
  if (sunA && sunB) {
    bullets.push(
      `Sol: ${ZODIAC_SIGNS[sunA.signIndex]} vs ${ZODIAC_SIGNS[sunB.signIndex]} (${describeElementMix(sunA.signIndex, sunB.signIndex)})`
    );
  }
  if (moonA && moonB) {
    bullets.push(
      `Luna: ${ZODIAC_SIGNS[moonA.signIndex]} vs ${ZODIAC_SIGNS[moonB.signIndex]} (${describeElementMix(moonA.signIndex, moonB.signIndex)})`
    );
  }
  if (ascA && ascB) {
    bullets.push(
      `Ascendente: ${ZODIAC_SIGNS[ascA.signIndex]} vs ${ZODIAC_SIGNS[ascB.signIndex]} (${describeElementMix(ascA.signIndex, ascB.signIndex)})`
    );
  }
  if (sunA && moonB) {
    bullets.push(
      `Sol A en casa ${sunA.house} de A vs Luna B en casa ${moonB.house} de B: dinámica consciente vs emocional, revisar necesidades vs expresión.`
    );
  }
  return bullets;
};

export const SynastryPanel = () => {
  const profiles = useChartStore((state) => state.profiles);
  const activeProfileId = useChartStore((state) => state.activeProfileId);
  const activeChart = useChartStore((state) => state.chart);
  const [otherId, setOtherId] = useState<string>("");

  const otherProfile = useMemo(() => profiles.find((p) => p.id === otherId), [profiles, otherId]);

  const otherChart = useMemo(() => {
    try {
      if (!otherProfile) return undefined;
      return buildChart(otherProfile.input);
    } catch {
      return undefined;
    }
  }, [otherProfile]);

  const sunA = activeChart ? pickBody(activeChart.bodies, "Sun") : undefined;
  const moonA = activeChart ? pickBody(activeChart.bodies, "Moon") : undefined;
  const ascA = activeChart ? pickBody(activeChart.bodies, "Ascendente") : undefined;

  const sunB = otherChart ? pickBody(otherChart.bodies, "Sun") : undefined;
  const moonB = otherChart ? pickBody(otherChart.bodies, "Moon") : undefined;
  const ascB = otherChart ? pickBody(otherChart.bodies, "Ascendente") : undefined;

  const profileOptions = profiles.filter((p) => p.id !== activeProfileId);

  const renderBodyLine = (
    label: string,
    a?: { signIndex: number; house: number },
    b?: { signIndex: number; house: number }
  ) => (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
      <span style={{ color: "#cbd5f5" }}>{label}</span>
      <span>
        {a ? `${ZODIAC_SIGNS[a.signIndex] ?? "-"} - Casa ${a.house || "-"}` : "-"}
        {"  |  "}
        {b ? `${ZODIAC_SIGNS[b.signIndex] ?? "-"} - Casa ${b.house || "-"}` : "-"}
      </span>
    </div>
  );

  const aspectList = activeChart && otherChart ? crossAspects(activeChart.bodies, otherChart.bodies) : [];

  return (
    <div className="panel" style={{ height: "100%", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <h2 style={{ margin: 0 }}>Sinastría</h2>

      <label style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        Selecciona segundo perfil
        <select
          value={otherId}
          onChange={(e) => setOtherId(e.target.value)}
          style={{
            padding: "0.55rem",
            borderRadius: "0.5rem",
            background: "#0b1224",
            color: "#e2e8f0",
            border: "1px solid rgba(148,163,184,0.35)"
          }}
        >
          <option value="">-- Elige perfil --</option>
          {profileOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      {!activeChart && <p style={{ color: "#94a3b8" }}>Carga o genera una carta base para ver la sinastría.</p>}
      {activeChart && !otherId && <p style={{ color: "#94a3b8" }}>Selecciona otro perfil para comparar.</p>}
      {otherId && !otherProfile && <p style={{ color: "#f87171" }}>No se encontró el perfil seleccionado.</p>}
      {otherProfile && !otherChart && <p style={{ color: "#f87171" }}>No se pudo calcular la carta del perfil seleccionado.</p>}

      {activeChart && otherChart && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1, minHeight: 0 }}>
          <div
            style={{
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: "0.75rem",
              padding: "0.75rem"
            }}
          >
            <strong style={{ color: "#bfdbfe" }}>Comparativa rápida</strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginTop: "0.35rem" }}>
              {renderBodyLine("Sol", sunA, sunB)}
              {renderBodyLine("Luna", moonA, moonB)}
              {renderBodyLine("Ascendente", ascA, ascB)}
            </div>
          </div>

          <div
            style={{
              background: "rgba(15,23,42,0.6)",
              borderRadius: "0.75rem",
              padding: "0.75rem",
              border: "1px solid rgba(148,163,184,0.25)",
              color: "#e2e8f0",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
              flex: 1,
              minHeight: 0,
              overflow: "auto"
            }}
          >
            <strong style={{ color: "#fbbf24" }}>Análisis textual</strong>
            <ul
              style={{
                margin: 0,
                paddingLeft: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem"
              }}
            >
              {describeBullets(sunA, moonA, ascA, sunB, moonB, ascB).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div
              style={{
                background: "rgba(59,130,246,0.08)",
                borderRadius: "0.5rem",
                padding: "0.5rem",
                border: "1px solid rgba(59,130,246,0.25)"
              }}
            >
              <strong style={{ color: "#bfdbfe" }}>Aspectos entre cartas</strong>
              {aspectList.length === 0 && <p style={{ margin: "0.35rem 0 0 0" }}>Sin aspectos mayores dentro del orbe configurado.</p>}
              {aspectList.slice(0, 8).map((asp, idx) => (
                <div key={`${asp.from}-${asp.to}-${idx}`} style={{ fontSize: "0.95rem", marginTop: "0.25rem" }}>
                  {asp.from} {asp.label} {asp.to}
                </div>
              ))}
              {aspectList.length > 8 && (
                <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                  (+{aspectList.length - 8} más)
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
