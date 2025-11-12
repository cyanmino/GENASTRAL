"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileManager = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const chartStore_1 = require("../state/chartStore");
const ProfileManager = () => {
    const profiles = (0, chartStore_1.useChartStore)((state) => state.profiles);
    const saveProfile = (0, chartStore_1.useChartStore)((state) => state.saveProfile);
    const loadProfile = (0, chartStore_1.useChartStore)((state) => state.loadProfile);
    const deleteProfile = (0, chartStore_1.useChartStore)((state) => state.deleteProfile);
    const activeProfileId = (0, chartStore_1.useChartStore)((state) => state.activeProfileId);
    const [name, setName] = (0, react_1.useState)("");
    return ((0, jsx_runtime_1.jsxs)("div", { className: "panel", style: { marginTop: "1rem" }, children: [(0, jsx_runtime_1.jsx)("h2", { children: "Perfiles guardados" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", gap: "0.5rem" }, children: [(0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Nombre del perfil", value: name, onChange: (e) => setName(e.target.value) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => { if (name) {
                            saveProfile(name);
                            setName("");
                        } }, children: "Guardar" })] }), (0, jsx_runtime_1.jsxs)("ul", { style: { listStyle: "none", padding: 0, marginTop: "0.75rem" }, children: [profiles.length === 0 && (0, jsx_runtime_1.jsx)("li", { children: "No hay perfiles." }), profiles.map((profile) => ((0, jsx_runtime_1.jsxs)("li", { style: {
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "0.35rem",
                            fontWeight: profile.id === activeProfileId ? 600 : 400,
                            color: profile.id === activeProfileId ? "#facc15" : undefined
                        }, children: [(0, jsx_runtime_1.jsx)("span", { children: profile.name }), (0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", gap: "0.35rem" }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => loadProfile(profile.id), children: "Cargar" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => deleteProfile(profile.id), children: "Borrar" })] })] }, profile.id)))] })] }));
};
exports.ProfileManager = ProfileManager;
