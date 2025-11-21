import { useChartStore } from "../state/chartStore";

export const SynastryPanel = () => {
  const profiles = useChartStore((state) => state.profiles);
  const activeProfileId = useChartStore((state) => state.activeProfileId);

  return (
    <div className="panel" style={{ width: "100%" }}>
      <h2>Sinastría</h2>
      {profiles.length < 2 && <p>Guarda al menos dos perfiles para comparar.</p>}
      {profiles.length >= 2 && !activeProfileId && <p>Selecciona un perfil base y otro para comparar.</p>}
      {profiles.length >= 2 && activeProfileId && (
        <p>
          Sinastría básica: selecciona otro perfil en la lista de perfiles para ver comparativa. (Vista placeholder hasta que
          agreguemos análisis completo.)
        </p>
      )}
    </div>
  );
};
