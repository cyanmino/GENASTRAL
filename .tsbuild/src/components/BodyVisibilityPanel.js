"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodyVisibilityPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const config_1 = require("../lib/config");
const chartStore_1 = require("../state/chartStore");
const Section = ({ title, ids }) => {
    const visibleBodies = (0, chartStore_1.useChartStore)((state) => state.visibleBodies);
    const toggleBody = (0, chartStore_1.useChartStore)((state) => state.toggleBodyVisibility);
    return ((0, jsx_runtime_1.jsxs)("section", { style: { marginBottom: "0.5rem" }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { fontSize: "0.9rem", marginBottom: "0.25rem" }, children: title }), (0, jsx_runtime_1.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: "0.2rem" }, children: ids.map((id) => ((0, jsx_runtime_1.jsxs)("label", { style: { display: "flex", gap: "0.35rem", alignItems: "center" }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: visibleBodies[id] ?? true, onChange: () => toggleBody(id) }), config_1.BODY_LABELS[id] ?? id] }, id))) })] }));
};
const BodyVisibilityPanel = () => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "panel", style: { marginTop: "1rem" }, children: [(0, jsx_runtime_1.jsx)("h2", { children: "Filtrar cuerpos" }), (0, jsx_runtime_1.jsx)(Section, { title: "Planetas", ids: config_1.BODY_CONFIG.planets }), (0, jsx_runtime_1.jsx)(Section, { title: "Asteroides", ids: config_1.BODY_CONFIG.asteroids }), (0, jsx_runtime_1.jsx)(Section, { title: "Puntos", ids: config_1.BODY_CONFIG.points })] }));
};
exports.BodyVisibilityPanel = BodyVisibilityPanel;
