import * as Astronomy from "astronomy-engine";
import type { CelestialBody, HouseSystem } from "../../types/astro";
import { normalizeDeg, DEG2RAD, RAD2DEG } from "./math";
import { TimePayload } from "./time";

export interface HousesResult {
  cusps: number[];
  ascendant: number;
  midheaven: number;
}

const computeSiderealDeg = (time: TimePayload, longitude: number): number => {
  const astro = new Astronomy.AstroTime(time.utc);
  const gst = Astronomy.SiderealTime(astro); // hours
  const lstHours = (gst + longitude / 15 + 24) % 24;
  return lstHours * 15;
};

const estimateAscendant = (lstDeg: number, latitude: number, epsilonRad: number): number => {
  const lst = lstDeg * DEG2RAD;
  const phi = latitude * DEG2RAD;
  const sinE = Math.sin(epsilonRad);
  const cosE = Math.cos(epsilonRad);
  const numerator = -Math.cos(lst);
  const denominator = Math.sin(lst) * cosE - Math.tan(phi) * sinE;
  return normalizeDeg(Math.atan2(numerator, denominator) * RAD2DEG);
};

const estimateMC = (lstDeg: number, epsilonRad: number): number => {
  const lst = lstDeg * DEG2RAD;
  const mc =
    Math.atan2(Math.sin(lst), Math.cos(lst)) + Math.atan2(Math.tan(lst) * Math.sin(epsilonRad), 1);
  return normalizeDeg(mc * RAD2DEG);
};

const normalizeRad = (value: number): number => {
  const tau = Math.PI * 2;
  let angle = value % tau;
  if (angle > Math.PI) angle -= tau;
  if (angle < -Math.PI) angle += tau;
  return angle;
};

const lonToEquatorial = (lambda: number, epsilon: number) => {
  const sinLambda = Math.sin(lambda);
  const cosLambda = Math.cos(lambda);
  const sinDelta = Math.sin(epsilon) * sinLambda;
  const delta = Math.asin(sinDelta);
  let alpha = Math.atan2(sinLambda * Math.cos(epsilon), cosLambda);
  if (alpha < 0) {
    alpha += Math.PI * 2;
  }
  return { alpha, delta };
};

const solveCuspBySecant = (
  initialDeg: number,
  evaluate: (lambdaRad: number) => number,
  maxIter = 60
): number => {
  let x0 = initialDeg * DEG2RAD;
  let x1 = (initialDeg + 1) * DEG2RAD;
  let f0 = evaluate(x0);
  let f1 = evaluate(x1);

  for (let iter = 0; iter < maxIter; iter += 1) {
    if (Math.abs(f1) < 1e-12) {
      return normalizeDeg(x1 * RAD2DEG);
    }
    const denom = f1 - f0;
    if (Math.abs(denom) < 1e-12) {
      x1 += 1e-3;
      f1 = evaluate(x1);
      continue;
    }
    const x2 = x1 - (f1 * (x1 - x0)) / denom;
    x0 = x1;
    f0 = f1;
    x1 = x2;
    f1 = evaluate(x1);
  }

  throw new Error("No convergence computing house cusp");
};

interface HouseComputationContext {
  lstDeg: number;
  lstRad: number;
  latitude: number;
  latitudeRad: number;
  epsilonRad: number;
  ascendant: number;
  midheaven: number;
}

const computePlacidusCusps = (context: HouseComputationContext): number[] => {
  const { ascendant, midheaven, latitudeRad, epsilonRad, lstRad } = context;
  const descendant = normalizeDeg(ascendant + 180);

  const placidusEvaluator = (fraction: number, sign: 1 | -1) => (lambdaRad: number) => {
    const { alpha, delta } = lonToEquatorial(lambdaRad, epsilonRad);
    const hourAngle = normalizeRad(lstRad - alpha);
    let value = -Math.tan(latitudeRad) * Math.tan(delta);
    if (value > 1) value = 1;
    if (value < -1) value = -1;
    const semiArc = Math.acos(value);
    const target = sign * fraction * semiArc;
    return normalizeRad(hourAngle - target);
  };

  const accurateAsc = ascendant;
  const accurateMC = midheaven;
  const accurateDesc = normalizeDeg(accurateAsc + 180);
  const accurateIC = normalizeDeg(accurateMC + 180);

  const cusp12 = solveCuspBySecant(
    normalizeDeg(accurateAsc - 30),
    placidusEvaluator(2 / 3, -1)
  );
  const cusp11 = solveCuspBySecant(
    normalizeDeg(accurateAsc - 60),
    placidusEvaluator(1 / 3, -1)
  );
  const cusp8 = solveCuspBySecant(
    normalizeDeg(accurateDesc + 25),
    placidusEvaluator(2 / 3, 1)
  );
  const cusp9 = solveCuspBySecant(
    normalizeDeg(accurateDesc + 50),
    placidusEvaluator(1 / 3, 1)
  );

  const cusps = new Array<number>(12);
  cusps[0] = accurateAsc;
  cusps[1] = normalizeDeg(cusp8 + 180);
  cusps[2] = normalizeDeg(cusp9 + 180);
  cusps[3] = accurateIC;
  cusps[4] = normalizeDeg(cusp11 + 180);
  cusps[5] = normalizeDeg(cusp12 + 180);
  cusps[6] = accurateDesc;
  cusps[7] = cusp8;
  cusps[8] = cusp9;
  cusps[9] = accurateMC;
  cusps[10] = cusp11;
  cusps[11] = cusp12;
  return cusps;
};

const computeEqualCusps = (ascendant: number): number[] =>
  Array.from({ length: 12 }, (_, index) => normalizeDeg(ascendant + index * 30));

const computeWholeSignCusps = (ascendant: number): number[] => {
  const base = Math.floor(ascendant / 30) * 30;
  return Array.from({ length: 12 }, (_, index) => normalizeDeg(base + index * 30));
};

const computeCuspsBySystem = (context: HouseComputationContext, system: HouseSystem): number[] => {
  if (system === "whole-sign") {
    return computeWholeSignCusps(context.ascendant);
  }
  if (system === "equal") {
    return computeEqualCusps(context.ascendant);
  }
  // For now treat Koch same as Placidus until a dedicated implementation is added.
  return computePlacidusCusps(context);
};

export const computeHouses = (
  time: TimePayload,
  latitude: number,
  longitude: number,
  system: HouseSystem
): HousesResult => {
  const lst = computeSiderealDeg(time, longitude);
  const epsilon = Astronomy.e_tilt(new Astronomy.AstroTime(time.utc)).tobl * DEG2RAD;
  const lstRad = lst * DEG2RAD;
  const latitudeRad = latitude * DEG2RAD;

  const altitudeEvaluator = (lambdaRad: number) => {
    const { alpha, delta } = lonToEquatorial(lambdaRad, epsilon);
    const hourAngle = normalizeRad(lstRad - alpha);
    return (
      Math.sin(latitudeRad) * Math.sin(delta) +
      Math.cos(latitudeRad) * Math.cos(delta) * Math.cos(hourAngle)
    );
  };

  const hourAngleOf = (lambdaDeg: number) => {
    const { alpha } = lonToEquatorial(lambdaDeg * DEG2RAD, epsilon);
    return normalizeRad(lstRad - alpha);
  };

  const hourAngleEvaluatorFactory = (target: number) => (lambdaRad: number) => {
    const { alpha } = lonToEquatorial(lambdaRad, epsilon);
    const hourAngle = normalizeRad(lstRad - alpha);
    return normalizeRad(hourAngle - target);
  };

  const ascApprox = estimateAscendant(lst, latitude, epsilon);
  const mcApprox = estimateMC(lst, epsilon);
  let ascendant = solveCuspBySecant(ascApprox, altitudeEvaluator);
  if (hourAngleOf(ascendant) > 0) {
    ascendant = normalizeDeg(ascendant + 180);
  }
  const midheaven = solveCuspBySecant(mcApprox, hourAngleEvaluatorFactory(0));

  const context: HouseComputationContext = {
    lstDeg: lst,
    lstRad,
    latitude,
    latitudeRad,
    epsilonRad: epsilon,
    ascendant,
    midheaven
  };

  const cusps = computeCuspsBySystem(context, system);
  return { ascendant, midheaven, cusps };
};

const expandCuspsAscending = (cusps: number[]): number[] => {
  if (!cusps.length) return [];
  const expanded = new Array<number>(cusps.length);
  expanded[0] = normalizeDeg(cusps[0]);
  for (let i = 1; i < cusps.length; i += 1) {
    let value = normalizeDeg(cusps[i]);
    while (value <= expanded[i - 1]) {
      value += 360;
    }
    expanded[i] = value;
  }
  return expanded;
};

export const assignHouses = (bodies: CelestialBody[], cusps: number[]): CelestialBody[] => {
  const expandedCusps = expandCuspsAscending(cusps);
  if (!expandedCusps.length) return bodies;
  const start = expandedCusps[0];
  const boundaries = [...expandedCusps, start + 360];

  return bodies.map((body) => {
    let lon = normalizeDeg(body.longitude);
    while (lon < start) lon += 360;
    while (lon >= start + 360) lon -= 360;
    let house = 12;
    for (let i = 0; i < 12; i += 1) {
      const begin = boundaries[i];
      const end = boundaries[i + 1];
      if (lon >= begin && lon < end) {
        house = i + 1;
        break;
      }
    }
    return { ...body, house };
  });
};
