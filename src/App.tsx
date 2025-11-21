import { InputPanel } from "./components/InputPanel";
import { ChartCanvas } from "./components/ChartCanvas";
import { RightTabs } from "./components/RightTabs";
import { ProfileManager } from "./components/ProfileManager";
import { DisplayControls } from "./components/DisplayControls";
import { ForecastPanel } from "./components/ForecastPanel";
import { useChartStore } from "./state/chartStore";

const App = () => {
  const fullscreen = useChartStore((state) => state.fullscreen);
  const rightTab = useChartStore((state) => state.rightTab);

  if (fullscreen) {
    return (
      <div className="fullscreen-shell">
        <ChartCanvas />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-column">
        <ProfileManager />
        <InputPanel />
      </div>
      <div className="app-column" style={{ height: "100vh" }}>
        {rightTab === "forecast" ? (
          <ForecastPanel />
        ) : (
          <>
            <ChartCanvas />
            <DisplayControls />
          </>
        )}
      </div>
      <div className="app-column">
        <RightTabs />
      </div>
    </div>
  );
};

export default App;
