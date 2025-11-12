"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisplayControls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const config_1 = require("../lib/config");
const chartStore_1 = require("../state/chartStore");
const layerLabels = {
    planets: "Planetas",
    asteroids: "Asteroides",
    points: "Puntos",
    houses: "Casas",
    aspects: "Aspectos",
    dodecatemoria: "Dodecatemorias",
    labels: "Etiquetas"
};
const groupDefinitions = [
    { title: "Planetas", ids: config_1.BODY_CONFIG.planets },
    { title: "Asteroides", ids: config_1.BODY_CONFIG.asteroids },
    { title: "Puntos", ids: config_1.BODY_CONFIG.points.concat(["Ascendente", "Descendente", "Medio Cielo", "Fondo del Cielo"]) }
];
const DisplayControls = () => {
    const layers = (0, chartStore_1.useChartStore)((state) => state.layers);
    const toggleLayer = (0, chartStore_1.useChartStore)((state) => state.toggleLayer);
    const visibleBodies = (0, chartStore_1.useChartStore)((state) => state.visibleBodies);
    const toggleBodyVisibility = (0, chartStore_1.useChartStore)((state) => state.toggleBodyVisibility);
    const showTransits = (0, chartStore_1.useChartStore)((state) => state.showTransits);
    const toggleShowTransits = (0, chartStore_1.useChartStore)((state) => state.toggleShowTransits);
    const fullscreen = (0, chartStore_1.useChartStore)((state) => state.fullscreen);
    const toggleFullscreen = (0, chartStore_1.useChartStore)((state) => state.toggleFullscreen);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "panel", style: { marginTop: "1rem" }, children: [(0, jsx_runtime_1.jsx)("h2", { children: "Visualizaci\u00F3n" }), (0, jsx_runtime_1.jsxs)("div", { className: "controls-grid", children: [Object.entries(layers).map(([key, enabled]) => ((0, jsx_runtime_1.jsxs)("label", { className: "control-pill", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: enabled, onChange: () => toggleLayer(key) }), layerLabels[key] ?? key] }, key))), (0, jsx_runtime_1.jsxs)("label", { className: "control-pill", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: showTransits, onChange: toggleShowTransits }), "Mostrar tr\u00E1nsitos"] }), (0, jsx_runtime_1.jsxs)("label", { className: "control-pill", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: fullscreen, onChange: toggleFullscreen }), "Pantalla completa"] })] }), (0, jsx_runtime_1.jsx)("h3", { style: { marginTop: "1rem", fontSize: "0.9rem" }, children: "Cuerpos individuales" }), groupDefinitions.map((group) => ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: "0.5rem" }, children: [(0, jsx_runtime_1.jsx)("strong", { children: group.title }), (0, jsx_runtime_1.jsx)("div", { className: "controls-grid", children: group.ids.map((id) => ((0, jsx_runtime_1.jsxs)("label", { className: "control-pill", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: visibleBodies[id] ?? true, onChange: () => toggleBodyVisibility(id) }), config_1.BODY_LABELS[id] ?? id] }, id))) })] }, group.title)))] }));
};
exports.DisplayControls = DisplayControls;
