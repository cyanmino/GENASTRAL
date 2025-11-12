"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationSearch = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const luxon_1 = require("luxon");
const tz_lookup_1 = __importDefault(require("tz-lookup"));
const chartStore_1 = require("../state/chartStore");
const LocationSearch = () => {
    const input = (0, chartStore_1.useChartStore)((state) => state.input);
    const setInput = (0, chartStore_1.useChartStore)((state) => state.setInput);
    const [query, setQuery] = (0, react_1.useState)(input.locationLabel);
    const [results, setResults] = (0, react_1.useState)([]);
    const [error, setError] = (0, react_1.useState)(undefined);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const dropdownRef = (0, react_1.useRef)(null);
    const abortRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        setQuery(input.locationLabel);
    }, [input.locationLabel]);
    (0, react_1.useEffect)(() => {
        if (query.trim().length < 3) {
            setResults([]);
            return;
        }
        setLoading(true);
        setError(undefined);
        if (abortRef.current) {
            abortRef.current.abort();
        }
        const controller = new AbortController();
        abortRef.current = controller;
        const handler = setTimeout(async () => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`, {
                    headers: {
                        "Accept-Language": "es",
                        "User-Agent": "GENASTRAL/1.0 (contact: info@example.com)"
                    },
                    signal: controller.signal
                });
                if (!response.ok) {
                    throw new Error("No se pudo obtener sugerencias");
                }
                const data = await response.json();
                setResults(data);
            }
            catch (err) {
                if (err.name !== "AbortError") {
                    setError("No se pudieron cargar sugerencias");
                }
            }
            finally {
                setLoading(false);
            }
        }, 500);
        return () => {
            clearTimeout(handler);
            controller.abort();
        };
    }, [query]);
    const handleSelect = (suggestion) => {
        const latitude = parseFloat(suggestion.lat);
        const longitude = parseFloat(suggestion.lon);
        const timezoneId = (0, tz_lookup_1.default)(latitude, longitude);
        const dt = luxon_1.DateTime.fromISO(`${input.date}T${input.time}`, { zone: timezoneId });
        const offset = dt.isValid ? dt.offset : luxon_1.DateTime.now().setZone(timezoneId).offset;
        setInput({
            latitude,
            longitude,
            locationLabel: suggestion.display_name,
            timezoneId,
            timezoneOffset: offset
        });
        setQuery(suggestion.display_name);
        setResults([]);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { position: "relative" }, children: [(0, jsx_runtime_1.jsx)("label", { style: { fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(148,163,184,0.9)" }, children: "Buscar ubicaci\u00F3n" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Ej. Calle, ciudad o pa\u00EDs" }), loading && (0, jsx_runtime_1.jsx)("div", { style: { fontSize: "0.75rem", color: "#94a3b8" }, children: "Buscando..." }), error && (0, jsx_runtime_1.jsx)("div", { style: { fontSize: "0.75rem", color: "#f87171" }, children: error }), results.length > 0 && ((0, jsx_runtime_1.jsx)("ul", { ref: dropdownRef, style: {
                    position: "absolute",
                    zIndex: 10,
                    background: "#0f172a",
                    border: "1px solid rgba(148,163,184,0.4)",
                    borderRadius: "8px",
                    marginTop: "0.25rem",
                    padding: "0.25rem 0",
                    maxHeight: "220px",
                    overflowY: "auto",
                    width: "100%"
                }, children: results.map((suggestion) => ((0, jsx_runtime_1.jsx)("li", { style: {
                        listStyle: "none",
                        padding: "0.35rem 0.75rem",
                        cursor: "pointer"
                    }, onClick: () => handleSelect(suggestion), children: suggestion.display_name }, `${suggestion.lat}-${suggestion.lon}`))) }))] }));
};
exports.LocationSearch = LocationSearch;
