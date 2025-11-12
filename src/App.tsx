import { InputPanel } from "./components/InputPanel";
import { ChartCanvas } from "./components/ChartCanvas";
import { InfoPanel } from "./components/InfoPanel";
import { ProfileManager } from "./components/ProfileManager";
import { DisplayControls } from "./components/DisplayControls";
import { CustomPointPanel } from "./components/CustomPointPanel";
import { useChartStore } from "./state/chartStore";

const App = () => {
  const fullscreen = useChartStore((state) => state.fullscreen);

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
      <div className="app-column">
        <ChartCanvas />
        <DisplayControls />
      </div>
      <div className="app-column">
        <InfoPanel />
        <CustomPointPanel />
      </div>
    </div>
  );
};

export default App;
