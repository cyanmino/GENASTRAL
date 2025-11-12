import { useMemo, useState } from "react";
import { useChartStore } from "../state/chartStore";
import { ASPECTS, BODY_LABELS, ZODIAC_SIGNS } from "../lib/config";
import { CelestialBody } from "../types/astro";

const CATEGORY_LABELS: Record<string, string> = {
  planet: "Planetas",
  asteroid: "Asteroides",
  point: "Puntos",
  transit: "Tránsitos"
};

const CATEGORY_COLORS: Record<string, string> = {
  planet: "#fde68a",
  asteroid: "#94a3b8",
  point: "#f472b6",
  transit: "#c084fc"
};

const ASPECT_COLOR_MAP: Record<string, string> = ASPECTS.reduce(
  (acc, aspect) => {
    acc[aspect.label] = aspect.color;
    return acc;
  },
  {} as Record<string, string>
);

const getBaseId = (id: string) => id.replace(/^transit-/, "");

const getBodyDisplayName = (body: CelestialBody) => {
  const baseId = getBaseId(body.id);
  const baseLabel = BODY_LABELS[baseId] ?? body.label;
  return body.isTransit ? `Tránsito ${baseLabel}` : baseLabel;
};

const getCategoryKey = (body: CelestialBody) => (body.isTransit ? "transit" : body.category);

export const InfoPanel = () => {
  const chart = useChartStore((state) => state.chart);
  const error = useChartStore((state) => state.error);
  const [aspectTypeFilter, setAspectTypeFilter] = useState<string>("Todos");
  const [aspectBodyFilter, setAspectBodyFilter] = useState<string>("Todos");
  const [aspectViewMode, setAspectViewMode] = useState<"aspecto" | "cuerpo">("aspecto");

  const groupedBodies = useMemo(() => {
    if (!chart) return {};
    const groups: Record<string, CelestialBody[]> = {};
    const collect = (body: CelestialBody) => {
      const key = getCategoryKey(body);
      if (!groups[key]) groups[key] = [];
      groups[key].push(body);
    };
    chart.bodies.forEach(collect);
    (chart.transits ?? []).forEach(collect);
    return groups;
  }, [chart]);

  const bodyOptions = useMemo(() => {
    if (!chart) return [];
    const ids = new Set<string>();
    chart.bodies.forEach((body) => ids.add(body.id));
    (chart.transits ?? []).forEach((body) => ids.add(body.id));
    return Array.from(ids);
  }, [chart]);

  const filteredAspects = useMemo(() => {
    if (!chart) return [];
    return chart.aspects.filter((aspect) => {
      if (aspectTypeFilter !== "Todos" && aspect.label !== aspectTypeFilter) {
        return false;
      }
      if (
        aspectBodyFilter !== "Todos" &&
        aspect.bodyA !== aspectBodyFilter &&
        aspect.bodyB !== aspectBodyFilter
      ) {
        return false;
      }
      return true;
    });
  }, [chart, aspectTypeFilter, aspectBodyFilter]);

  const groupedAspects = useMemo(() => {
    if (aspectViewMode === "aspecto") {
      return filteredAspects.reduce<Record<string, typeof filteredAspects>>((acc, aspect) => {
        if (!acc[aspect.label]) acc[aspect.label] = [];
        acc[aspect.label].push(aspect);
        return acc;
      }, {});
    }
    const map: Record<string, typeof filteredAspects> = {};
    filteredAspects.forEach((aspect) => {
      if (!map[aspect.bodyA]) map[aspect.bodyA] = [];
      map[aspect.bodyA].push(aspect);
      if (!map[aspect.bodyB]) map[aspect.bodyB] = [];
      map[aspect.bodyB].push(aspect);
    });
    return map;
  }, [filteredAspects, aspectViewMode]);

  if (error) {
    return (
      <div className="panel">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!chart) {
    return (
      <div className="panel">
        <h2>Resultados</h2>
        <p>Aún no se calculó ninguna carta.</p>
      </div>
    );
  }

  return (
    <div className="panel" style={{ overflowY: "auto", maxHeight: "80vh" }}>
      <h2>Datos actuales</h2>
      {Object.entries(groupedBodies).map(([category, bodies]) => (
        <section key={category}>
          <h3 style={{ marginBottom: "0.25rem", color: CATEGORY_COLORS[category] ?? "#e2e8f0" }}>
            {CATEGORY_LABELS[category] ?? category}
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {bodies.map((body) => (
              <li key={body.id} style={{ marginBottom: "0.2rem" }}>
                <strong style={{ color: CATEGORY_COLORS[getCategoryKey(body)] ?? "#e2e8f0" }}>
                  {getBodyDisplayName(body)}
                </strong>{" "}
                · {ZODIAC_SIGNS[body.signIndex]} {body.degreeInSign}°
                {body.minuteInSign.toString().padStart(2, "0")}′ · Casa {body.house}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section style={{ marginTop: "1rem" }}>
        <h3>Aspectos</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "0.5rem" }}>
          <label>
            Filtrar por aspecto:
            <select value={aspectTypeFilter} onChange={(e) => setAspectTypeFilter(e.target.value)}>
              <option value="Todos">Todos</option>
              {ASPECTS.map((aspect) => (
                <option key={aspect.label} value={aspect.label}>
                  {aspect.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Filtrar por astro/punto:
            <select value={aspectBodyFilter} onChange={(e) => setAspectBodyFilter(e.target.value)}>
              <option value="Todos">Todos</option>
              {bodyOptions.map((id) => (
                <option key={id} value={id}>
                  {BODY_LABELS[getBaseId(id)] ?? id}
                </option>
              ))}
            </select>
          </label>
          <label>
            Agrupar por:
            <select value={aspectViewMode} onChange={(e) => setAspectViewMode(e.target.value as "aspecto" | "cuerpo")}>
              <option value="aspecto">Tipo de aspecto</option>
              <option value="cuerpo">Astro/Punto</option>
            </select>
          </label>
        </div>

        {Object.keys(groupedAspects).length === 0 && <p>No hay aspectos con el filtro seleccionado.</p>}

        {Object.entries(groupedAspects).map(([groupKey, aspects]) => (
          <div key={groupKey} style={{ marginBottom: "0.75rem" }}>
            <strong>
              {aspectViewMode === "aspecto" ? groupKey : BODY_LABELS[getBaseId(groupKey)] ?? groupKey}
            </strong>
            <ul style={{ listStyle: "none", padding: 0, margin: "0.25rem 0 0 0" }}>
              {aspects.map((aspect) => (
                <li
                  key={`${groupKey}-${aspect.id}-${aspect.bodyA}-${aspect.bodyB}`}
                  style={{ color: ASPECT_COLOR_MAP[aspect.label] ?? "#e2e8f0" }}
                >
                  {aspect.bodyA} {aspect.label} {aspect.bodyB} · orb {aspect.orb.toFixed(2)}°
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
};
