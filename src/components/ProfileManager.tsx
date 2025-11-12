import { useState } from "react";
import { useChartStore } from "../state/chartStore";

export const ProfileManager = () => {
  const profiles = useChartStore((state) => state.profiles);
  const saveProfile = useChartStore((state) => state.saveProfile);
  const loadProfile = useChartStore((state) => state.loadProfile);
  const deleteProfile = useChartStore((state) => state.deleteProfile);
  const startNewProfile = useChartStore((state) => state.startNewProfile);
  const activeProfileId = useChartStore((state) => state.activeProfileId);
  const [name, setName] = useState("");

  return (
    <div className="panel" style={{ marginTop: "1rem" }}>
      <h2>Perfiles guardados</h2>
      <button type="button" onClick={startNewProfile} style={{ marginBottom: "0.5rem" }}>
        Nuevo perfil
      </button>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          placeholder="Nombre del perfil"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="button" onClick={() => { if (name) { saveProfile(name); setName(""); } }}>
          Guardar
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0, marginTop: "0.75rem" }}>
        {profiles.length === 0 && <li>No hay perfiles.</li>}
        {profiles.map((profile) => (
          <li
            key={profile.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.35rem",
              fontWeight: profile.id === activeProfileId ? 600 : 400,
              color: profile.id === activeProfileId ? "#facc15" : undefined
            }}
          >
            <span>{profile.name}</span>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              <button type="button" onClick={() => loadProfile(profile.id)}>
                Cargar
              </button>
              <button type="button" onClick={() => deleteProfile(profile.id)}>
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
