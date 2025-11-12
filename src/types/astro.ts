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
