import * as Astronomy from "astronomy-engine";
import type { CelestialBody } from "../../types/astro";
import { degInSign, degToSignIndex, normalizeDeg, DEG2RAD } from "./math";
import { TimePayload } from "./time";

const decorate = (id: string, label: string, longitude: number): CelestialBody => {
  const signIndex = degToSignIndex(longitude);
  const degreeInSign = degInSign(longitude);
  const minuteInSign = (degreeInSign - Math.floor(degreeInSign)) * 60;
  const dodecatemoriaDegree = (degreeInSign % 2.5) * 12;
  const dodecatemoriaSign = (signIndex * 12 + Math.floor(degreeInSign / 2.5)) % 12;

  return {
    id,
    label,
    category: "point",
    longitude,
    latitude: 0,
    distanceAu: 0,
    signIndex,
    degreeInSign: Math.floor(degreeInSign),
    minuteInSign: Math.round(minuteInSign),
    dodecatemoriaSign,
    dodecatemoriaDegree,
    house: 0
  };
};

const computeMeanLunarNodes = (julianDay: number) => {
  const T = (julianDay - 2451545.0) / 36525;
  const omega =
    125.04455501 -
    1934.1361849 * T +
    0.0020762 * T * T +
    (T * T * T) / 467410 -
    (T * T * T * T) / 60606000;
  const north = normalizeDeg(omega);
  return {
    north,
    south: normalizeDeg(omega + 180)
  };
};

export interface PointOptions {
  time: TimePayload;
  latitude: number;
  longitude: number;
  ascendant: number;
  midheaven: number;
  sunLongitude: number;
  moonLongitude: number;
}

const isDayChart = (opts: PointOptions): boolean => {
  const time = new Astronomy.AstroTime(opts.time.utc);
  const lstHours =
    (Astronomy.SiderealTime(time) + opts.longitude / 15 + 24) % 24;
  const sunEq = Astronomy.SunPosition(time);

  const hourAngleHours = (lstHours - sunEq.ra + 24) % 24;
  const hourAngleRad = hourAngleHours * 15 * DEG2RAD;
  const phi = opts.latitude * DEG2RAD;
  const dec = sunEq.dec * DEG2RAD;

  const altitude = Math.asin(
    Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(hourAngleRad)
  );
  return altitude > 0;
};

export const computePoints = (opts: PointOptions): CelestialBody[] => {
  const dayChart = isDayChart(opts);
  const fortuna = dayChart
    ? normalizeDeg(opts.ascendant + opts.moonLongitude - opts.sunLongitude)
    : normalizeDeg(opts.ascendant - opts.sunLongitude + opts.moonLongitude);
  const lilith = normalizeDeg(opts.moonLongitude + 180);
  const vertex = normalizeDeg(opts.ascendant + 90);
  const descendant = normalizeDeg(opts.ascendant + 180);
  const imumCoeli = normalizeDeg(opts.midheaven + 180);
  const nodes = computeMeanLunarNodes(opts.time.julianDay);

  return [
    decorate("Fortuna", "Fortuna", fortuna),
    decorate("Lilith", "Lilith", lilith),
    decorate("Vertex", "Vertice", vertex),
    decorate("NorthNode", "Nodo Norte", nodes.north),
    decorate("SouthNode", "Nodo Sur", nodes.south),
    decorate("Ascendente", "Ascendente", opts.ascendant),
    decorate("Descendente", "Descendente", descendant),
    decorate("Medio Cielo", "Medio Cielo", opts.midheaven),
    decorate("Fondo del Cielo", "Fondo del Cielo", imumCoeli)
  ];
};
