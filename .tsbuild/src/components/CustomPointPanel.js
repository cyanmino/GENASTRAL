"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomPointPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const chartStore_1 = require("../state/chartStore");
const CustomPointPanel = () => {
    const customPoints = (0, chartStore_1.useChartStore)((state) => state.customPoints);
    const addCustomPoint = (0, chartStore_1.useChartStore)((state) => state.addCustomPoint);
    const removeCustomPoint = (0, chartStore_1.useChartStore)((state) => state.removeCustomPoint);
    const [label, setLabel] = (0, react_1.useState)("");
    const [house, setHouse] = (0, react_1.useState)(1);
    const [degrees, setDegrees] = (0, react_1.useState)(0);
    const [minutes, setMinutes] = (0, react_1.useState)(0);
    const [shape, setShape] = (0, react_1.useState)("sphere");
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!label.trim())
            return;
        addCustomPoint({ label, house, degrees, minutes, shape });
        setLabel("");
        setDegrees(0);
        setMinutes(0);
        setHouse(1);
        setShape("sphere");
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "panel", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Puntos personalizados" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "0.5rem" }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { children: "Nombre" }), (0, jsx_runtime_1.jsx)("input", { value: label, onChange: (e) => setLabel(e.target.value), placeholder: "Ej. Parte ar\u00E1biga" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { children: "Casa" }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: 1, max: 12, value: house, onChange: (e) => setHouse(Math.min(12, Math.max(1, Number(e.target.value)))) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { children: "Grados" }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: 0, max: 29, value: degrees, onChange: (e) => setDegrees(Math.min(29, Math.max(0, Number(e.target.value)))) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { children: "Minutos" }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: 0, max: 59, value: minutes, onChange: (e) => setMinutes(Math.min(59, Math.max(0, Number(e.target.value)))) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { children: "Forma" }), (0, jsx_runtime_1.jsxs)("select", { value: shape, onChange: (e) => setShape(e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "sphere", children: "Esfera" }), (0, jsx_runtime_1.jsx)("option", { value: "cube", children: "Cubo" }), (0, jsx_runtime_1.jsx)("option", { value: "octahedron", children: "Octaedro" }), (0, jsx_runtime_1.jsx)("option", { value: "pyramid", children: "Pir\u00E1mide" })] })] }), (0, jsx_runtime_1.jsx)("div", { style: { alignSelf: "end" }, children: (0, jsx_runtime_1.jsx)("button", { type: "submit", children: "Agregar" }) })] }), customPoints.length > 0 && ((0, jsx_runtime_1.jsx)("ul", { style: { listStyle: "none", padding: 0, marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem" }, children: customPoints.map((point) => ((0, jsx_runtime_1.jsxs)("li", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [(0, jsx_runtime_1.jsxs)("span", { children: [point.label, " \u00B7 Casa ", point.house, " \u00B7 ", point.degrees, "\u00B0", point.minutes.toString().padStart(2, "0"), "\u2032 \u00B7 ", point.shape] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => removeCustomPoint(point.id), children: "Quitar" })] }, point.id))) }))] }));
};
exports.CustomPointPanel = CustomPointPanel;
