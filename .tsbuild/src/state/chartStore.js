"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChartStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
const luxon_1 = require("luxon");
const tz_lookup_1 = __importDefault(require("tz-lookup"));
const config_1 = require("../lib/config");
const chartBuilder_1 = require("../lib/astro/chartBuilder");
const storage_1 = require("../lib/storage");
const defaultInput = {
    date: "1990-05-12",
    time: "14:30",
    timezoneOffset: -180,
    timezoneId: "America/Argentina/Buenos_Aires",
    latitude: -34.6037,
    longitude: -58.3816,
    locationLabel: "Buenos Aires, Argentina",
    houseSystem: "placidus",
    zodiacType: "tropical"
};
const initInput = () => (0, storage_1.loadLastInput)() ?? defaultInput;
const BODY_IDS = [
    ...config_1.BODY_CONFIG.planets,
    ...config_1.BODY_CONFIG.asteroids,
    ...config_1.BODY_CONFIG.points,
    "Ascendente",
    "Descendente",
    "Medio Cielo",
    "Fondo del Cielo"
];
const DEFAULT_VISIBILITY = BODY_IDS.reduce((acc, id) => {
    acc[id] = true;
    return acc;
}, {});
const normalizeDegrees = (value) => {
    let deg = value % 360;
    if (deg < 0)
        deg += 360;
    return deg;
};
const addCustomBodiesToChart = (chart, defs) => {
    if (!defs.length)
        return chart;
    const additions = defs.map((def) => {
        const cusp = chart.houses[(def.house - 1 + 12) % 12];
        const longitude = normalizeDegrees(cusp + def.degrees + def.minutes / 60);
        const signIndex = Math.floor(longitude / 30);
        const degreeInSign = longitude % 30;
        const minuteInSign = Math.round((degreeInSign - Math.floor(degreeInSign)) * 60);
        return {
            id: `custom-${def.id}`,
            label: def.label,
            category: "point",
            customShape: def.shape,
            longitude,
            latitude: 0,
            distanceAu: 0,
            signIndex,
            degreeInSign: Math.floor(degreeInSign),
            minuteInSign,
            dodecatemoriaSign: (signIndex * 12 + Math.floor(degreeInSign / 2.5)) % 12,
            dodecatemoriaDegree: (degreeInSign % 2.5) * 12,
            house: def.house
        };
    });
    chart.bodies = [...chart.bodies, ...additions];
    return chart;
};
const computeTransitBodies = (input) => {
    try {
        const zone = input.timezoneId ?? (0, tz_lookup_1.default)(input.latitude, input.longitude);
        const now = luxon_1.DateTime.now().setZone(zone);
        const transitInput = {
            ...input,
            date: now.toISODate() ?? input.date,
            time: now.toFormat("HH:mm"),
            timezoneOffset: now.offset,
            timezoneId: zone
        };
        const transitChart = (0, chartBuilder_1.buildChart)(transitInput);
        return transitChart.bodies.map((body) => ({
            ...body,
            id: `transit-${body.id}`,
            label: `Tránsito ${config_1.BODY_LABELS[body.id] ?? body.label}`,
            isTransit: true
        }));
    }
    catch {
        return [];
    }
};
const recalcTimezoneOffset = (input, timezoneId) => {
    const zone = timezoneId ?? input.timezoneId;
    if (!zone)
        return input;
    try {
        const dt = luxon_1.DateTime.fromISO(`${input.date}T${input.time}`, { zone });
        if (!dt.isValid)
            return { ...input, timezoneId: zone };
        return { ...input, timezoneId: zone, timezoneOffset: dt.offset };
    }
    catch {
        return input;
    }
};
exports.useChartStore = (0, zustand_1.create)()((0, middleware_1.devtools)((set, get) => ({
    input: initInput(),
    layers: { ...config_1.LAYER_DEFAULTS },
    visibleBodies: { ...DEFAULT_VISIBILITY },
    profiles: (0, storage_1.loadProfiles)(),
    loading: false,
    error: undefined,
    activeProfileId: undefined,
    showTransits: false,
    fullscreen: false,
    customPoints: [],
    setInput: (partial) => set((state) => {
        const merged = { ...state.input, ...partial };
        const shouldRecalc = !Object.prototype.hasOwnProperty.call(partial, "timezoneOffset");
        const next = shouldRecalc && (partial.timezoneId || merged.timezoneId)
            ? recalcTimezoneOffset(merged, partial.timezoneId ?? merged.timezoneId)
            : merged;
        (0, storage_1.saveLastInput)(next);
        return { input: next };
    }),
    toggleLayer: (layer) => set((state) => ({
        layers: { ...state.layers, [layer]: !state.layers[layer] }
    })),
    toggleBodyVisibility: (id) => set((state) => ({
        visibleBodies: { ...state.visibleBodies, [id]: !state.visibleBodies[id] }
    })),
    computeChart: () => {
        const { input, customPoints, showTransits } = get();
        set({ loading: true, error: undefined });
        try {
            let chart = (0, chartBuilder_1.buildChart)(input);
            chart = addCustomBodiesToChart(chart, customPoints);
            if (showTransits) {
                chart.transits = computeTransitBodies(input);
            }
            set({ chart, loading: false });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("Error al calcular la carta:", error);
            set({ loading: false, error: message, chart: undefined });
        }
    },
    saveProfile: (name) => {
        const { input, profiles } = get();
        const profile = {
            id: crypto.randomUUID(),
            name,
            input,
            savedAt: new Date().toISOString()
        };
        const next = [...profiles, profile];
        (0, storage_1.saveProfiles)(next);
        set({ profiles: next, activeProfileId: profile.id });
    },
    loadProfile: (id) => {
        const profile = get().profiles.find((p) => p.id === id);
        if (!profile)
            return;
        set({ input: profile.input, activeProfileId: id }, false, "chart/loadProfile");
        (0, storage_1.saveLastInput)(profile.input);
        get().computeChart();
    },
    deleteProfile: (id) => {
        const next = get().profiles.filter((p) => p.id !== id);
        (0, storage_1.saveProfiles)(next);
        set((state) => ({
            profiles: next,
            activeProfileId: state.activeProfileId === id ? undefined : state.activeProfileId
        }));
    },
    toggleShowTransits: () => {
        set((state) => ({ showTransits: !state.showTransits }));
        get().computeChart();
    },
    toggleFullscreen: () => set((state) => ({ fullscreen: !state.fullscreen })),
    addCustomPoint: (def) => {
        set((state) => ({
            customPoints: [...state.customPoints, { ...def, id: crypto.randomUUID() }]
        }));
        get().computeChart();
    },
    removeCustomPoint: (id) => {
        set((state) => ({
            customPoints: state.customPoints.filter((point) => point.id !== id)
        }));
        get().computeChart();
    }
})));
