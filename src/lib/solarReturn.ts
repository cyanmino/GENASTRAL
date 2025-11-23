import { DateTime } from "luxon";
import { ASPECTS, BODY_LABELS } from "./config";
import { buildChart } from "./astro/chartBuilder";
import type {
  AnnualPeriod,
  ChartData,
  ChartInput,
  CelestialBody,
  SolarAspectComparison,
  SolarMidpoint,
  SolarReturnData
} from "../types/astro";

const normalizeDeg = (value: number) => {
  let deg = value % 360;
  if (deg < 0) deg += 360;
  return deg;
};

const angleDistance = (a: number, b: number) => {
  const diff = Math.abs(normalizeDeg(a) - normalizeDeg(b));
  return diff > 180 ? 360 - diff : diff;
};

const safeDateForYear = (birthDate: string, targetYear: number): string => {
  const parsed = DateTime.fromISO(birthDate);
  if (!parsed.isValid) return `${targetYear}-01-01`;
  const candidate = parsed.set({ year: targetYear });
  if (candidate.isValid) {
    return candidate.toISODate() ?? `${targetYear}-01-01`;
  }
  const lastDay = DateTime.fromObject({ year: targetYear, month: parsed.month }).daysInMonth ?? parsed.day;
  const fallback = parsed.set({ year: targetYear, day: Math.min(parsed.day, lastDay) });
  return fallback.toISODate() ?? `${targetYear}-01-01`;
};

const midpointBetween = (a: CelestialBody, b: CelestialBody): SolarMidpoint => {
  const diff = normalizeDeg(b.longitude - a.longitude);
  const midpoint = normalizeDeg(a.longitude + diff / 2);
  const signIndex = Math.floor(midpoint / 30);
  const degreeInSign = midpoint % 30;
  return {
    label: `${BODY_LABELS[a.id] ?? a.label ?? a.id} / ${BODY_LABELS[b.id] ?? b.label ?? b.id}`,
    longitude: midpoint,
    signIndex,
    degreeInSign: Math.floor(degreeInSign),
    minuteInSign: Math.round((degreeInSign - Math.floor(degreeInSign)) * 60)
  };
};

const pickBody = (bodies: CelestialBody[], id: string) => bodies.find((b) => b.id === id);

const computeMidpoints = (bodies: CelestialBody[]): SolarMidpoint[] => {
  const pairs: [string, string][] = [
    ["Sun", "Moon"],
    ["Sun", "Ascendente"],
    ["Sun", "Medio Cielo"],
    ["Moon", "Ascendente"],
    ["Venus", "Mars"],
    ["Jupiter", "Saturn"]
  ];
  const results: SolarMidpoint[] = [];
  pairs.forEach(([aId, bId]) => {
    const a = pickBody(bodies, aId);
    const b = pickBody(bodies, bId);
    if (a && b) {
      results.push(midpointBetween(a, b));
    }
  });
  return results;
};

const computeSolarToNatalAspects = (
  solarBodies: CelestialBody[],
  natalBodies: CelestialBody[]
): SolarAspectComparison[] => {
  const matches: SolarAspectComparison[] = [];

  solarBodies.forEach((solar) => {
    natalBodies.forEach((natal) => {
      const separation = angleDistance(solar.longitude, natal.longitude);
      const aspect = ASPECTS.find((entry) => Math.abs(separation - entry.angle) <= entry.orb);
      if (aspect) {
        matches.push({
          solarBody: BODY_LABELS[solar.id] ?? solar.label ?? solar.id,
          natalBody: BODY_LABELS[natal.id] ?? natal.label ?? natal.id,
          aspect: aspect.label,
          orb: Number(Math.abs(separation - aspect.angle).toFixed(2))
        });
      }
    });
  });

  return matches.sort((a, b) => a.orb - b.orb).slice(0, 32);
};

export const buildSolarReturnData = (
  input: ChartInput,
  targetYear: number,
  natalChart: ChartData
): SolarReturnData => {
  const safeDate = safeDateForYear(input.date, targetYear);
  const timezoneOffset = input.timezoneId
    ? DateTime.fromISO(`${safeDate}T${input.time}`, { zone: input.timezoneId }).offset
    : input.timezoneOffset;
  const solarInput: ChartInput = {
    ...input,
    date: safeDate,
    timezoneOffset
  };

  // TODO: reemplazar por el cálculo real de la revolución solar usando el perfil activo.
  const solarChart = buildChart(solarInput);

  return {
    year: targetYear,
    chart: solarChart,
    midpoints: computeMidpoints(solarChart.bodies),
    natalAspects: computeSolarToNatalAspects(solarChart.bodies, natalChart.bodies)
  };
};

export const upsertPeriod = (
  periods: Record<number, AnnualPeriod[]>,
  year: number,
  period: AnnualPeriod
): Record<number, AnnualPeriod[]> => {
  const list = periods[year] ?? [];
  return { ...periods, [year]: [...list.filter((item) => item.id !== period.id), period] };
};
