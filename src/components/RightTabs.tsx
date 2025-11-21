import { InfoPanel } from "./InfoPanel";
import { CustomPointPanel } from "./CustomPointPanel";
import { SynastryPanel } from "./SynastryPanel";
import { useChartStore } from "../state/chartStore";

type TabKey = "info" | "custom" | "synastry" | "forecast";

const TabButton = ({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      padding: "0.45rem 0.6rem",
      borderRadius: "12px",
      border: active ? "1px solid #60a5fa" : "1px solid rgba(148,163,184,0.3)",
      background: active ? "rgba(59,130,246,0.18)" : "rgba(15,23,42,0.65)",
      color: active ? "#e0f2fe" : "#e2e8f0",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "0.9rem",
      lineHeight: "1.2",
      textAlign: "center",
      whiteSpace: "normal",
      width: "100%",
      minHeight: "2.5rem"
    }}
  >
    {label}
  </button>
);

export const RightTabs = () => {
  const activeTab = useChartStore((state) => state.rightTab as TabKey);
  const setActiveTab = useChartStore((state) => state.setRightTab);

  return (
    <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", height: "100%" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "0.5rem"
        }}
      >
        <TabButton label="Datos actuales" active={activeTab === "info"} onClick={() => setActiveTab("info")} />
        <TabButton label="Puntos personalizados" active={activeTab === "custom"} onClick={() => setActiveTab("custom")} />
        <TabButton label="Sinastría" active={activeTab === "synastry"} onClick={() => setActiveTab("synastry")} />
        <TabButton label="Pronóstico" active={activeTab === "forecast"} onClick={() => setActiveTab("forecast")} />
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        {activeTab === "info" && <InfoPanel />}
        {activeTab === "custom" && <CustomPointPanel />}
        {activeTab === "synastry" && <SynastryPanel />}
        {activeTab === "forecast" && null}
      </div>
    </div>
  );
};

