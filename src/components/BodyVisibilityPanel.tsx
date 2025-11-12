import { BODY_CONFIG, BODY_LABELS } from "../lib/config";
import { useChartStore } from "../state/chartStore";

const Section = ({
  title,
  ids
}: {
  title: string;
  ids: string[];
}) => {
  const visibleBodies = useChartStore((state) => state.visibleBodies);
  const toggleBody = useChartStore((state) => state.toggleBodyVisibility);

  return (
    <section style={{ marginBottom: "0.5rem" }}>
      <h3 style={{ fontSize: "0.9rem", marginBottom: "0.25rem" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        {ids.map((id) => (
          <label key={id} style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={visibleBodies[id] ?? true}
              onChange={() => toggleBody(id)}
            />
            {BODY_LABELS[id] ?? id}
          </label>
        ))}
      </div>
    </section>
  );
};

export const BodyVisibilityPanel = () => {
  return (
    <div className="panel" style={{ marginTop: "1rem" }}>
      <h2>Filtrar cuerpos</h2>
      <Section title="Planetas" ids={BODY_CONFIG.planets} />
      <Section title="Asteroides" ids={BODY_CONFIG.asteroids} />
      <Section title="Puntos" ids={BODY_CONFIG.points} />
    </div>
  );
};
