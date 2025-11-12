"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const chartStore_1 = require("../state/chartStore");
const LocationSearch_1 = require("./LocationSearch");
const fieldWrap = {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem"
};
const labelStyle = {
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "rgba(148, 163, 184, 0.9)"
};
const InputPanel = () => {
    const input = (0, chartStore_1.useChartStore)((state) => state.input);
    const setInput = (0, chartStore_1.useChartStore)((state) => state.setInput);
    const computeChart = (0, chartStore_1.useChartStore)((state) => state.computeChart);
    const loading = (0, chartStore_1.useChartStore)((state) => state.loading);
    const profiles = (0, chartStore_1.useChartStore)((state) => state.profiles);
    const activeProfileId = (0, chartStore_1.useChartStore)((state) => state.activeProfileId);
    const activeProfile = (0, react_1.useMemo)(() => profiles.find((profile) => profile.id === activeProfileId), [profiles, activeProfileId]);
    const hasUnsavedChanges = (0, react_1.useMemo)(() => {
        if (!activeProfile)
            return false;
        return JSON.stringify(activeProfile.input) !== JSON.stringify(input);
    }, [activeProfile, input]);
    const timezoneHours = (input.timezoneOffset ?? 0) / 60;
    const handleSubmit = (event) => {
        event.preventDefault();
        computeChart();
    };
    return ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "panel", style: { display: "flex", flexDirection: "column", gap: "0.75rem" }, children: [(0, jsx_runtime_1.jsx)("h2", { children: "Datos natales" }), hasUnsavedChanges && ((0, jsx_runtime_1.jsx)("div", { style: { fontSize: "0.8rem", color: "#facc15" }, children: "Cambios sin guardar para el perfil activo." })), (0, jsx_runtime_1.jsx)(LocationSearch_1.LocationSearch, {}), (0, jsx_runtime_1.jsxs)("div", { style: fieldWrap, children: [(0, jsx_runtime_1.jsx)("label", { style: labelStyle, children: "Fecha" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: input.date, onChange: (e) => setInput({ date: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("div", { style: fieldWrap, children: [(0, jsx_runtime_1.jsx)("label", { style: labelStyle, children: "Hora" }), (0, jsx_runtime_1.jsx)("input", { type: "time", value: input.time, onChange: (e) => setInput({ time: e.target.value }) })] }), (0, jsx_runtime_1.jsxs)("div", { style: fieldWrap, children: [(0, jsx_runtime_1.jsx)("label", { style: labelStyle, children: "Huso horario (UTC \u00B1 horas)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", value: timezoneHours, step: 0.5, onChange: (e) => {
                            const hours = Number(e.target.value);
                            if (!Number.isNaN(hours)) {
                                setInput({ timezoneOffset: Math.round(hours * 60) });
                            }
                        } }), input.timezoneId && ((0, jsx_runtime_1.jsxs)("small", { style: { color: "#94a3b8" }, children: ["Zona detectada: ", input.timezoneId] }))] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", gap: "0.75rem" }, children: [(0, jsx_runtime_1.jsxs)("div", { style: fieldWrap, children: [(0, jsx_runtime_1.jsx)("label", { style: labelStyle, children: "Latitud" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: input.latitude.toFixed(4), readOnly: true })] }), (0, jsx_runtime_1.jsxs)("div", { style: fieldWrap, children: [(0, jsx_runtime_1.jsx)("label", { style: labelStyle, children: "Longitud" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: input.longitude.toFixed(4), readOnly: true })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: fieldWrap, children: [(0, jsx_runtime_1.jsx)("label", { style: labelStyle, children: "Sistema de casas" }), (0, jsx_runtime_1.jsxs)("select", { value: input.houseSystem, onChange: (e) => setInput({ houseSystem: e.target.value }), children: [(0, jsx_runtime_1.jsx)("option", { value: "placidus", children: "Placidus (igualado)" }), (0, jsx_runtime_1.jsx)("option", { value: "whole-sign", children: "Whole Sign" }), (0, jsx_runtime_1.jsx)("option", { value: "equal", children: "Equal" }), (0, jsx_runtime_1.jsx)("option", { value: "koch", children: "Koch (igualado)" })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: fieldWrap, children: [(0, jsx_runtime_1.jsx)("label", { style: labelStyle, children: "Zod\u00EDaco" }), (0, jsx_runtime_1.jsxs)("select", { value: input.zodiacType, onChange: (e) => setInput({ zodiacType: e.target.value }), children: [(0, jsx_runtime_1.jsx)("option", { value: "tropical", children: "Tropical" }), (0, jsx_runtime_1.jsx)("option", { value: "sidereal", children: "Sideral (placeholder)" })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: fieldWrap, children: [(0, jsx_runtime_1.jsx)("label", { style: labelStyle, children: "Lugar seleccionado" }), (0, jsx_runtime_1.jsx)("textarea", { value: input.locationLabel, readOnly: true, rows: 2 })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading, style: { marginTop: "0.5rem" }, children: loading ? "Calculando..." : "Generar carta" })] }));
};
exports.InputPanel = InputPanel;
