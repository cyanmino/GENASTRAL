"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const InputPanel_1 = require("./components/InputPanel");
const ChartCanvas_1 = require("./components/ChartCanvas");
const InfoPanel_1 = require("./components/InfoPanel");
const ProfileManager_1 = require("./components/ProfileManager");
const DisplayControls_1 = require("./components/DisplayControls");
const CustomPointPanel_1 = require("./components/CustomPointPanel");
const chartStore_1 = require("./state/chartStore");
const App = () => {
    const fullscreen = (0, chartStore_1.useChartStore)((state) => state.fullscreen);
    if (fullscreen) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "fullscreen-shell", children: (0, jsx_runtime_1.jsx)(ChartCanvas_1.ChartCanvas, {}) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "app-shell", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(ProfileManager_1.ProfileManager, {}), (0, jsx_runtime_1.jsx)(InputPanel_1.InputPanel, {})] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(ChartCanvas_1.ChartCanvas, {}), (0, jsx_runtime_1.jsx)(DisplayControls_1.DisplayControls, {})] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: "1rem" }, children: [(0, jsx_runtime_1.jsx)(InfoPanel_1.InfoPanel, {}), (0, jsx_runtime_1.jsx)(CustomPointPanel_1.CustomPointPanel, {})] })] }));
};
exports.default = App;
