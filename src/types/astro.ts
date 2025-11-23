export type ZodiacType = "tropical" | "sidereal";

export type HouseSystem =
  | "placidus"
  | "whole-sign"
  | "koch"
  | "equal"
  | "campanus";

export type BodyCategory = "planet" | "asteroid" | "point";

export interface ChartInput {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  timezoneOffset: number; // minutes
  timezoneId?: string;
  latitude: number;
  longitude: number;
  locationLabel: string;
  houseSystem: HouseSystem;
  zodiacType: ZodiacType;
}

export interface CelestialBody {
  id: string;
  label: string;
  category: BodyCategory;
  isTransit?: boolean;
  customShape?: "sphere" | "cube" | "octahedron" | "pyramid";
  customColor?: string;
  longitude: number;
  latitude: number;
  distanceAu: number;
  signIndex: number;
  degreeInSign: number;
  minuteInSign: number;
  dodecatemoriaSign: number;
  dodecatemoriaDegree: number;
  house: number;
}

export interface Aspect {
  id: string;
  bodyA: string;
  bodyB: string;
  angle: number;
  exactAngle: number;
  orb: number;
  label: string;
}

export interface ChartMetadata {
  localDateTime: string;
  utcDateTime: string;
  locationLabel: string;
  timezoneOffset: number;
}

export interface ChartData {
  bodies: CelestialBody[];
  transits?: CelestialBody[];
  houses: number[];
  aspects: Aspect[];
  metadata: ChartMetadata;
}

export type SolarViewMode = "mandala" | "calendar";

export type AnnualPeriodCategory =
  | "economy-positive"
  | "economy-negative"
  | "love-positive"
  | "love-negative"
  | "work-positive"
  | "work-negative"
  | "health-positive"
  | "health-negative"
  | "aspect-strong"
  | "spiritual-positive"
  | "spiritual-negative";

export interface AnnualPeriod {
  id: string;
  year: number;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  colorKey: AnnualPeriodCategory;
  note?: string;
}

export interface SolarMidpoint {
  label: string;
  longitude: number;
  signIndex: number;
  degreeInSign: number;
  minuteInSign: number;
}

export interface SolarAspectComparison {
  solarBody: string;
  natalBody: string;
  aspect: string;
  orb: number;
}

export interface SolarReturnData {
  year: number;
  chart: ChartData;
  midpoints: SolarMidpoint[];
  natalAspects: SolarAspectComparison[];
}
