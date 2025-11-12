import * as Astronomy from "astronomy-engine";
import type { Vector } from "astronomy-engine";
import type { CelestialBody } from "../../types/astro";
import { degInSign, degToSignIndex, normalizeDeg, RAD2DEG } from "./math";
import { TimePayload } from "./time";

const BODY_MAP: Record<string, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto
};

interface RawBody {
  id: string;
  longitude: number;
  latitude: number;
  distanceAu: number;
}

const toDegrees = (value: number) => value * RAD2DEG;

const computeEcliptic = (vector: Vector): { lon: number; lat: number } => {
  const ecl = Astronomy.Ecliptic(vector);
  return {
    lon: normalizeDeg(ecl.elon),
    lat: ecl.elat
  };
};

const buildBody = (id: string, vector: Vector): RawBody => {
  const { lon, lat } = computeEcliptic(vector);
  return {
    id,
    longitude: lon,
    latitude: lat,
    distanceAu: Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2)
  };
};

export const computePlanets = (time: TimePayload): RawBody[] => {
  const astroTime = new Astronomy.AstroTime(time.utc);
  return Object.entries(BODY_MAP).map(([name, body]) => {
    const vector = Astronomy.GeoVector(body, astroTime, true);
    return buildBody(name, vector);
  });
};

export const decorateBody = (raw: RawBody): CelestialBody => {
  const signIndex = degToSignIndex(raw.longitude);
  const degreeInSign = degInSign(raw.longitude);
  const minuteInSign = (degreeInSign - Math.floor(degreeInSign)) * 60;
  const dodecatemoriaDegree = (degreeInSign % 2.5) * 12;
  const dodecatemoriaSign = (signIndex * 12 + Math.floor(degreeInSign / 2.5)) % 12;

  return {
    id: raw.id,
    label: raw.id,
    category: "planet",
    longitude: raw.longitude,
    latitude: raw.latitude,
    distanceAu: raw.distanceAu,
    signIndex,
    degreeInSign: Math.floor(degreeInSign),
    minuteInSign: Math.round(minuteInSign),
    dodecatemoriaSign,
    dodecatemoriaDegree,
    house: 0
  };
};
