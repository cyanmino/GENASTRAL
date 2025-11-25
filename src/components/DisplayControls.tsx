import { BODY_CONFIG, BODY_LABELS, LAYER_DEFAULTS } from "../lib/config";
import { useChartStore } from "../state/chartStore";

const layerLabels: Record<keyof typeof LAYER_DEFAULTS, string> = {
  planets: "Planetas",
  asteroids: "Asteroides",
  points: "Puntos",
  houses: "Casas",
  aspects: "Aspectos",
  dodecatemoria: "Dodecatemorias",
  labels: "Etiquetas",
  signs: "Signos",
  signElements: "Elementos",
  signModes: "Modalidades"
};

const groupDefinitions = [
  { title: "Planetas", ids: BODY_CONFIG.planets },
  { title: "Asteroides", ids: BODY_CONFIG.asteroids },
  {
    title: "Puntos",
    ids: BODY_CONFIG.points.concat(["Ascendente", "Descendente", "Medio Cielo", "Fondo del Cielo"])
  }
];

const MODE_LEGEND = [
  { key: "cardinal", label: "Cardinal", color: "#f97316" },
  { key: "fixed", label: "Fijo", color: "#8b5cf6" },
  { key: "mutable", label: "Mutable", color: "#14b8a6" }
];

export const DisplayControls = () => {
  const layers = useChartStore((state) => state.layers);
  const toggleLayer = useChartStore((state) => state.toggleLayer);
  const visibleBodies = useChartStore((state) => state.visibleBodies);
  const toggleBodyVisibility = useChartStore((state) => state.toggleBodyVisibility);
  const showTransits = useChartStore((state) => state.showTransits);
  const toggleShowTransits = useChartStore((state) => state.toggleShowTransits);

  return (
    <div className="panel" style={{ marginTop: "1rem" }}>
      <h2>Visualización</h2>
      <div className="controls-grid">
        {Object.entries(layers).map(([key, enabled]) => (
          <button
            key={key}
            type="button"
            className={`control-toggle ${enabled ? "control-toggle--active" : ""}`}
            onClick={() => toggleLayer(key as keyof typeof layers)}
          >
            {layerLabels[key as keyof typeof layers] ?? key}
          </button>
        ))}
        <button
          type="button"
          className={`control-toggle ${showTransits ? "control-toggle--active" : ""}`}
          onClick={toggleShowTransits}
        >
          Mostrar tránsitos
        </button>
      </div>

      {layers.signModes && (
        <div className="mode-legend">
          {MODE_LEGEND.map((entry) => (
            <span key={entry.key} className="mode-legend__item">
              <span className="mode-legend__swatch" style={{ background: entry.color }} />
              {entry.label}
            </span>
          ))}
        </div>
      )}

      <h3 style={{ marginTop: "1rem", fontSize: "0.9rem" }}>Cuerpos individuales</h3>
      {groupDefinitions.map((group) => (
        <div key={group.title} style={{ marginBottom: "0.5rem" }}>
          <strong>{group.title}</strong>
          <div className="controls-grid">
            {group.ids.map((id) => (
              <button
                key={id}
                type="button"
                className={`control-toggle ${visibleBodies[id] ?? true ? "control-toggle--active" : ""}`}
                onClick={() => toggleBodyVisibility(id)}
              >
                {BODY_LABELS[id] ?? id}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
