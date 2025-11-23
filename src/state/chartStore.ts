import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { DateTime } from "luxon";
import tzlookup from "tz-lookup";
import type {
  AnnualPeriod,
  ChartData,
  ChartInput,
  CelestialBody,
  SolarReturnData,
  SolarViewMode
} from "../types/astro";
import { BODY_CONFIG, BODY_LABELS, LAYER_DEFAULTS } from "../lib/config";
import { buildChart } from "../lib/astro/chartBuilder";
import { loadLastInput, loadProfiles, saveLastInput, saveProfiles, SavedProfile } from "../lib/storage";
import { buildSolarReturnData, upsertPeriod } from "../lib/solarReturn";

export type CustomShape = "sphere" | "cube" | "octahedron" | "pyramid";

export interface CustomPointDef {
  id: string;
  label: string;
  house: number;
  degrees: number;
  minutes: number;
  shape: CustomShape;
  color: string;
}

type LayerState = typeof LAYER_DEFAULTS;

interface ChartStore {
  input: ChartInput;
  chart?: ChartData;
  layers: LayerState;
  visibleBodies: Record<string, boolean>;
  profiles: SavedProfile[];
  loading: boolean;
  error?: string;
  activeProfileId?: string;
  showTransits: boolean;
  fullscreen: boolean;
  customPoints: CustomPointDef[];
  rightTab: "info" | "custom" | "synastry" | "forecast" | "solar";
  solarYear: number;
  solarReturn?: SolarReturnData;
  solarView: SolarViewMode;
  solarError?: string;
  annualPeriods: Record<number, AnnualPeriod[]>;
  setInput: (partial: Partial<ChartInput>) => void;
  toggleLayer: (layer: keyof LayerState) => void;
  toggleBodyVisibility: (id: string) => void;
  computeChart: () => void;
  saveProfile: (name: string) => void;
  loadProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  toggleShowTransits: () => void;
  toggleFullscreen: () => void;
  addCustomPoint: (def: Omit<CustomPointDef, "id">) => void;
  removeCustomPoint: (id: string) => void;
  clearActiveProfile: () => void;
  startNewProfile: () => void;
  setRightTab: (tab: "info" | "custom" | "synastry" | "forecast" | "solar") => void;
  setSolarYear: (year: number) => void;
  computeSolarReturn: (year?: number) => void;
  setSolarView: (mode: SolarViewMode) => void;
  addAnnualPeriod: (period: Omit<AnnualPeriod, "id">) => void;
  removeAnnualPeriod: (year: number, id: string) => void;
}

const defaultInput: ChartInput = {
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

const cloneInput = (input: ChartInput): ChartInput => ({ ...input });

const initInput = () => loadLastInput() ?? cloneInput(defaultInput);

const BODY_IDS = [
  ...BODY_CONFIG.planets,
  ...BODY_CONFIG.asteroids,
  ...BODY_CONFIG.points,
  "Ascendente",
  "Descendente",
  "Medio Cielo",
  "Fondo del Cielo"
];

const DEFAULT_VISIBILITY = BODY_IDS.reduce<Record<string, boolean>>((acc, id) => {
  acc[id] = true;
  return acc;
}, {});

const normalizeDegrees = (value: number) => {
  let deg = value % 360;
  if (deg < 0) deg += 360;
  return deg;
};

const addCustomBodiesToChart = (chart: ChartData, defs: CustomPointDef[]): ChartData => {
  if (!defs.length) return chart;
  const additions: CelestialBody[] = defs.map((def) => {
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
      customColor: def.color,
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

const computeTransitBodies = (input: ChartInput): CelestialBody[] => {
  try {
    const zone = input.timezoneId ?? tzlookup(input.latitude, input.longitude);
    const now = DateTime.now().setZone(zone);
    const transitInput: ChartInput = {
      ...input,
      date: now.toISODate() ?? input.date,
      time: now.toFormat("HH:mm"),
      timezoneOffset: now.offset,
      timezoneId: zone
    };
    const transitChart = buildChart(transitInput);
    return transitChart.bodies.map((body) => ({
      ...body,
      id: `transit-${body.id}`,
      label: `Tránsito ${BODY_LABELS[body.id] ?? body.label}`,
      isTransit: true
    }));
  } catch {
    return [];
  }
};

const recalcTimezoneOffset = (input: ChartInput, timezoneId?: string): ChartInput => {
  const zone = timezoneId ?? input.timezoneId;
  if (!zone) return input;
  try {
    const dt = DateTime.fromISO(`${input.date}T${input.time}`, { zone });
    if (!dt.isValid) return { ...input, timezoneId: zone };
    return { ...input, timezoneId: zone, timezoneOffset: dt.offset };
  } catch {
    return input;
  }
};

export const useChartStore = create<ChartStore>()(
  devtools((set, get) => ({
    input: initInput(),
    layers: { ...LAYER_DEFAULTS },
    visibleBodies: { ...DEFAULT_VISIBILITY },
    profiles: loadProfiles(),
    loading: false,
    error: undefined,
    activeProfileId: undefined,
    showTransits: false,
    fullscreen: false,
    customPoints: [],
    rightTab: "info",
    solarYear: new Date().getFullYear(),
    solarReturn: undefined,
    solarView: "mandala",
    solarError: undefined,
    annualPeriods: {},
    setInput: (partial) =>
      set((state) => {
        const merged = { ...state.input, ...partial };
        const shouldRecalc = !Object.prototype.hasOwnProperty.call(partial, "timezoneOffset");
        const next =
          shouldRecalc && (partial.timezoneId || merged.timezoneId)
            ? recalcTimezoneOffset(merged, partial.timezoneId ?? merged.timezoneId)
            : merged;
        saveLastInput(next);
        return { input: next };
      }),
    toggleLayer: (layer) =>
      set((state) => ({
        layers: { ...state.layers, [layer]: !state.layers[layer] }
      })),
    toggleBodyVisibility: (id) =>
      set((state) => ({
        visibleBodies: { ...state.visibleBodies, [id]: !state.visibleBodies[id] }
      })),
    computeChart: () => {
      const { input, customPoints, showTransits } = get();
      set({ loading: true, error: undefined });
      try {
        let chart = buildChart(input);
        chart = addCustomBodiesToChart(chart, customPoints);
        if (showTransits) {
          chart.transits = computeTransitBodies(input);
        }
        set({ chart, loading: false });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error al calcular la carta:", error);
        set({ loading: false, error: message, chart: undefined });
      }
    },
    saveProfile: (name) => {
      const { input, profiles } = get();
      const profile: SavedProfile = {
        id: crypto.randomUUID(),
        name,
        input,
        savedAt: new Date().toISOString()
      };
      const next = [...profiles, profile];
      saveProfiles(next);
      set({ profiles: next, activeProfileId: profile.id });
    },
    loadProfile: (id) => {
      const profile = get().profiles.find((p) => p.id === id);
      if (!profile) return;
      set({ input: profile.input, activeProfileId: id }, false, "chart/loadProfile");
      saveLastInput(profile.input);
      get().computeChart();
    },
    deleteProfile: (id) => {
      const next = get().profiles.filter((p) => p.id !== id);
      saveProfiles(next);
      set((state) => ({
        profiles: next,
        activeProfileId: state.activeProfileId === id ? undefined : state.activeProfileId
      }));
    },
    toggleShowTransits: () => {
      set((state) => ({ showTransits: !state.showTransits }));
      get().computeChart();
    },
    toggleFullscreen: () =>
      set((state) => ({ fullscreen: !state.fullscreen })),
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
    },
    clearActiveProfile: () =>
      set(
        {
          activeProfileId: undefined,
          chart: undefined
        },
        false,
        "chart/clearActiveProfile"
      ),
    startNewProfile: () => {
      const fresh = cloneInput(defaultInput);
      saveLastInput(fresh);
      set(
        {
          input: fresh,
          activeProfileId: undefined,
          chart: undefined
        },
        false,
        "chart/startNewProfile"
      );
    },
    setRightTab: (tab) => set({ rightTab: tab }),
    setSolarYear: (year) => set({ solarYear: year, solarError: undefined }),
    computeSolarReturn: (year) => {
      const targetYear = year ?? get().solarYear;
      const baseInput = get().input;
      try {
        const natalChart = get().chart ?? buildChart(baseInput);
        const solarReturn = buildSolarReturnData(baseInput, targetYear, natalChart);
        set({
          solarYear: targetYear,
          solarReturn,
          solarError: undefined,
          solarView: "mandala"
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error al calcular la revolución solar:", error);
        set({ solarError: message, solarReturn: undefined });
      }
    },
    setSolarView: (mode) => set({ solarView: mode }),
    addAnnualPeriod: (period) =>
      set((state) => {
        const targetYear = period.year;
        const withId: AnnualPeriod = { ...period, id: crypto.randomUUID() };
        return { annualPeriods: upsertPeriod(state.annualPeriods, targetYear, withId) };
      }),
    removeAnnualPeriod: (year, id) =>
      set((state) => ({
        annualPeriods: {
          ...state.annualPeriods,
          [year]: (state.annualPeriods[year] ?? []).filter((entry) => entry.id !== id)
        }
      }))
  }))
);
