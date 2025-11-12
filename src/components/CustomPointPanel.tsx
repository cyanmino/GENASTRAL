import { useState } from "react";
import { CustomShape, useChartStore } from "../state/chartStore";

export const CustomPointPanel = () => {
  const customPoints = useChartStore((state) => state.customPoints);
  const addCustomPoint = useChartStore((state) => state.addCustomPoint);
  const removeCustomPoint = useChartStore((state) => state.removeCustomPoint);
  const [label, setLabel] = useState("");
  const [house, setHouse] = useState(1);
  const [degrees, setDegrees] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [shape, setShape] = useState<CustomShape>("sphere");
  const [color, setColor] = useState("#f472b6");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!label.trim()) return;
    addCustomPoint({ label, house, degrees, minutes, shape, color });
    setLabel("");
    setDegrees(0);
    setMinutes(0);
    setHouse(1);
    setShape("sphere");
    setColor("#f472b6");
  };

  return (
    <div className="panel">
      <h2>Puntos personalizados</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "0.5rem" }}
      >
        <div>
          <label>Nombre</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ej. Parte arábiga" />
        </div>
        <div>
          <label>Casa</label>
          <input
            type="number"
            min={1}
            max={12}
            value={house}
            onChange={(e) => setHouse(Math.min(12, Math.max(1, Number(e.target.value))))}
          />
        </div>
        <div>
          <label>Grados</label>
          <input
            type="number"
            min={0}
            max={29}
            value={degrees}
            onChange={(e) => setDegrees(Math.min(29, Math.max(0, Number(e.target.value))))}
          />
        </div>
        <div>
          <label>Minutos</label>
          <input
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={(e) => setMinutes(Math.min(59, Math.max(0, Number(e.target.value))))}
          />
        </div>
        <div>
          <label>Forma</label>
          <select value={shape} onChange={(e) => setShape(e.target.value as CustomShape)}>
            <option value="sphere">Esfera</option>
            <option value="cube">Cubo</option>
            <option value="octahedron">Octaedro</option>
            <option value="pyramid">Pirámide</option>
          </select>
        </div>
        <div>
          <label>Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: "100%", height: "2.5rem", padding: 0, border: "none", background: "transparent" }}
          />
        </div>
        <div style={{ alignSelf: "end" }}>
          <button type="submit">Agregar</button>
        </div>
      </form>

      {customPoints.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            marginTop: "0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem"
          }}
        >
          {customPoints.map((point) => (
            <li key={point.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span
                  style={{
                    width: "0.85rem",
                    height: "0.85rem",
                    borderRadius: "999px",
                    background: point.color ?? "#f472b6",
                    boxShadow: "0 0 6px rgba(255,255,255,0.4)"
                  }}
                />
                {point.label} · Casa {point.house} · {point.degrees}°{point.minutes.toString().padStart(2, "0")}′ · {point.shape}
              </span>
              <button type="button" onClick={() => removeCustomPoint(point.id)}>
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
