"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const chartStore_1 = require("../state/chartStore");
const config_1 = require("../lib/config");
const CATEGORY_LABELS = {
    planet: "Planetas",
    asteroid: "Asteroides",
    point: "Puntos",
    transit: "Tránsitos"
};
const CATEGORY_COLORS = {
    planet: "#fde68a",
    asteroid: "#94a3b8",
    point: "#f472b6",
    transit: "#c084fc"
};
const ASPECT_COLOR_MAP = config_1.ASPECTS.reduce((acc, aspect) => {
    acc[aspect.label] = aspect.color;
    return acc;
}, {});
const getBaseId = (id) => id.replace(/^transit-/, "");
const getBodyDisplayName = (body) => {
    const baseId = getBaseId(body.id);
    const baseLabel = config_1.BODY_LABELS[baseId] ?? body.label;
    return body.isTransit ? `Tránsito ${baseLabel}` : baseLabel;
};
const getCategoryKey = (body) => (body.isTransit ? "transit" : body.category);
const InfoPanel = () => {
    const chart = (0, chartStore_1.useChartStore)((state) => state.chart);
    const error = (0, chartStore_1.useChartStore)((state) => state.error);
    const [aspectTypeFilter, setAspectTypeFilter] = (0, react_1.useState)("Todos");
    const [aspectBodyFilter, setAspectBodyFilter] = (0, react_1.useState)("Todos");
    const [aspectViewMode, setAspectViewMode] = (0, react_1.useState)("aspecto");
    const groupedBodies = (0, react_1.useMemo)(() => {
        if (!chart)
            return {};
        const groups = {};
        const collect = (body) => {
            const key = getCategoryKey(body);
            if (!groups[key])
                groups[key] = [];
            groups[key].push(body);
        };
        chart.bodies.forEach(collect);
        (chart.transits ?? []).forEach(collect);
        return groups;
    }, [chart]);
    const bodyOptions = (0, react_1.useMemo)(() => {
        if (!chart)
            return [];
        const ids = new Set();
        chart.bodies.forEach((body) => ids.add(body.id));
        (chart.transits ?? []).forEach((body) => ids.add(body.id));
        return Array.from(ids);
    }, [chart]);
    const filteredAspects = (0, react_1.useMemo)(() => {
        if (!chart)
            return [];
        return chart.aspects.filter((aspect) => {
            if (aspectTypeFilter !== "Todos" && aspect.label !== aspectTypeFilter) {
                return false;
            }
            if (aspectBodyFilter !== "Todos" &&
                aspect.bodyA !== aspectBodyFilter &&
                aspect.bodyB !== aspectBodyFilter) {
                return false;
            }
            return true;
        });
    }, [chart, aspectTypeFilter, aspectBodyFilter]);
    const groupedAspects = (0, react_1.useMemo)(() => {
        if (aspectViewMode === "aspecto") {
            return filteredAspects.reduce((acc, aspect) => {
                if (!acc[aspect.label])
                    acc[aspect.label] = [];
                acc[aspect.label].push(aspect);
                return acc;
            }, {});
        }
        const map = {};
        filteredAspects.forEach((aspect) => {
            if (!map[aspect.bodyA])
                map[aspect.bodyA] = [];
            map[aspect.bodyA].push(aspect);
            if (!map[aspect.bodyB])
                map[aspect.bodyB] = [];
            map[aspect.bodyB].push(aspect);
        });
        return map;
    }, [filteredAspects, aspectViewMode]);
    if (error) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "panel", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Error" }), (0, jsx_runtime_1.jsx)("p", { children: error })] }));
    }
    if (!chart) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "panel", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Resultados" }), (0, jsx_runtime_1.jsx)("p", { children: "A\u00FAn no se calcul\u00F3 ninguna carta." })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "panel", style: { overflowY: "auto", maxHeight: "80vh" }, children: [(0, jsx_runtime_1.jsx)("h2", { children: "Datos actuales" }), Object.entries(groupedBodies).map(([category, bodies]) => ((0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)("h3", { style: { marginBottom: "0.25rem", color: CATEGORY_COLORS[category] ?? "#e2e8f0" }, children: CATEGORY_LABELS[category] ?? category }), (0, jsx_runtime_1.jsx)("ul", { style: { listStyle: "none", padding: 0, margin: 0 }, children: bodies.map((body) => ((0, jsx_runtime_1.jsxs)("li", { style: { marginBottom: "0.2rem" }, children: [(0, jsx_runtime_1.jsx)("strong", { style: { color: CATEGORY_COLORS[getCategoryKey(body)] ?? "#e2e8f0" }, children: getBodyDisplayName(body) }), " ", "\u00B7 ", config_1.ZODIAC_SIGNS[body.signIndex], " ", body.degreeInSign, "\u00B0", body.minuteInSign.toString().padStart(2, "0"), "\u2032 \u00B7 Casa ", body.house] }, body.id))) })] }, category))), (0, jsx_runtime_1.jsxs)("section", { style: { marginTop: "1rem" }, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Aspectos" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "0.5rem" }, children: [(0, jsx_runtime_1.jsxs)("label", { children: ["Filtrar por aspecto:", (0, jsx_runtime_1.jsxs)("select", { value: aspectTypeFilter, onChange: (e) => setAspectTypeFilter(e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "Todos", children: "Todos" }), config_1.ASPECTS.map((aspect) => ((0, jsx_runtime_1.jsx)("option", { value: aspect.label, children: aspect.label }, aspect.label)))] })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Filtrar por astro/punto:", (0, jsx_runtime_1.jsxs)("select", { value: aspectBodyFilter, onChange: (e) => setAspectBodyFilter(e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "Todos", children: "Todos" }), bodyOptions.map((id) => ((0, jsx_runtime_1.jsx)("option", { value: id, children: config_1.BODY_LABELS[getBaseId(id)] ?? id }, id)))] })] }), (0, jsx_runtime_1.jsxs)("label", { children: ["Agrupar por:", (0, jsx_runtime_1.jsxs)("select", { value: aspectViewMode, onChange: (e) => setAspectViewMode(e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "aspecto", children: "Tipo de aspecto" }), (0, jsx_runtime_1.jsx)("option", { value: "cuerpo", children: "Astro/Punto" })] })] })] }), Object.keys(groupedAspects).length === 0 && (0, jsx_runtime_1.jsx)("p", { children: "No hay aspectos con el filtro seleccionado." }), Object.entries(groupedAspects).map(([groupKey, aspects]) => ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: "0.75rem" }, children: [(0, jsx_runtime_1.jsx)("strong", { children: aspectViewMode === "aspecto" ? groupKey : config_1.BODY_LABELS[getBaseId(groupKey)] ?? groupKey }), (0, jsx_runtime_1.jsx)("ul", { style: { listStyle: "none", padding: 0, margin: "0.25rem 0 0 0" }, children: aspects.map((aspect) => ((0, jsx_runtime_1.jsxs)("li", { style: { color: ASPECT_COLOR_MAP[aspect.label] ?? "#e2e8f0" }, children: [aspect.bodyA, " ", aspect.label, " ", aspect.bodyB, " \u00B7 orb ", aspect.orb.toFixed(2), "\u00B0"] }, `${groupKey}-${aspect.id}-${aspect.bodyA}-${aspect.bodyB}`))) })] }, groupKey)))] })] }));
};
exports.InfoPanel = InfoPanel;
