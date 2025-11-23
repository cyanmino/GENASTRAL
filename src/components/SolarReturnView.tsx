import { useEffect } from "react";
import { useChartStore } from "../state/chartStore";
import { ChartCanvas } from "./ChartCanvas";
import { DisplayControls } from "./DisplayControls";
import { SolarAnnualCalendar } from "./SolarAnnualCalendar";

export const SolarReturnView = () => {
  const solarReturn = useChartStore((state) => state.solarReturn);
  const solarYear = useChartStore((state) => state.solarYear);
  const solarView = useChartStore((state) => state.solarView);
  const setSolarView = useChartStore((state) => state.setSolarView);
  const computeSolarReturn = useChartStore((state) => state.computeSolarReturn);
  const activeProfileId = useChartStore((state) => state.activeProfileId);
  const annualPeriods = useChartStore((state) => state.annualPeriods);
  const addAnnualPeriod = useChartStore((state) => state.addAnnualPeriod);
  const updateAnnualPeriod = useChartStore((state) => state.updateAnnualPeriod);
  const removeAnnualPeriod = useChartStore((state) => state.removeAnnualPeriod);

  useEffect(() => {
    if (activeProfileId) {
      computeSolarReturn(solarYear);
    }
  }, [activeProfileId, computeSolarReturn, solarYear]);

  const periodsForYear = annualPeriods[solarYear] ?? [];
  const buttonLabel = solarView === "calendar" ? "Volver" : "Gráfico anual";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", height: "100%", minHeight: 0 }}>
      <div className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 700 }}>Revolución solar {solarYear}</div>
          <small style={{ color: "#94a3b8" }}>Muestra el mandala o el gráfico anual del año seleccionado.</small>
        </div>
        <button type="button" onClick={() => setSolarView(solarView === "mandala" ? "calendar" : "mandala")}>
          {buttonLabel}
        </button>
      </div>

      {solarView === "mandala" ? (
        <ChartCanvas chartOverride={solarReturn?.chart} />
      ) : (
        <SolarAnnualCalendar
          year={solarYear}
          periods={periodsForYear}
          onAddPeriod={addAnnualPeriod}
          onUpdatePeriod={updateAnnualPeriod}
          onRemovePeriod={removeAnnualPeriod}
        />
      )}

      {solarView === "mandala" && <DisplayControls />}
    </div>
  );
};
