import * as Astronomy from "astronomy-engine";
import type { RotationMatrix, Vector } from "astronomy-engine";
import type { CelestialBody } from "../../types/astro";
import { degInSign, degToSignIndex, normalizeDeg, RAD2DEG, DEG2RAD } from "./math";
import { TimePayload } from "./time";

interface MinorBodyElement {
  id: string;
  label: string;
  category: "asteroid" | "point";
  a: number; // semi-major axis (AU)
  e: number;
  i: number; // degrees
  ascendingNode: number; // Ω degrees
  argPerihelion: number; // ω degrees
  meanAnomaly: number; // M0 degrees @ epoch
  meanMotion: number; // deg per day
  epochJulian: number;
}

const MINOR_BODIES: MinorBodyElement[] = [
  {
    id: "Ceres",
    label: "Ceres",
    category: "asteroid",
    epochJulian: 2461000.5,
    a: 2.7656157,
    e: 0.0795763,
    i: 10.58789,
    ascendingNode: 80.24963,
    argPerihelion: 73.29974,
    meanAnomaly: 231.53975,
    meanMotion: 0.21429712
  },
  {
    id: "Pallas",
    label: "Pallas",
    category: "asteroid",
    epochJulian: 2461000.5,
    a: 2.7699258,
    e: 0.230643,
    i: 34.92833,
    ascendingNode: 172.88859,
    argPerihelion: 310.9334,
    meanAnomaly: 211.52977,
    meanMotion: 0.21379713
  },
  {
    id: "Juno",
    label: "Juno",
    category: "asteroid",
    epochJulian: 2461000.5,
    a: 2.6708791,
    e: 0.2558258,
    i: 12.98604,
    ascendingNode: 169.81989,
    argPerihelion: 247.88367,
    meanAnomaly: 217.59095,
    meanMotion: 0.22579938
  },
  {
    id: "Vesta",
    label: "Vesta",
    category: "asteroid",
    epochJulian: 2461000.5,
    a: 2.3615413,
    e: 0.0901676,
    i: 7.14406,
    ascendingNode: 103.70232,
    argPerihelion: 151.53712,
    meanAnomaly: 26.80968,
    meanMotion: 0.27158812
  },
  {
    id: "Chiron",
    label: "Chirón",
    category: "asteroid",
    epochJulian: 2461000.5,
    a: 13.6921991,
    e: 0.3789792,
    i: 6.92601,
    ascendingNode: 209.29852,
    argPerihelion: 339.25364,
    meanAnomaly: 212.83977,
    meanMotion: 0.01945334
  },
  {
    id: "Pholus",
    label: "Folo",
    category: "asteroid",
    epochJulian: 2461000.5,
    a: 20.28342,
    e: 0.5747451,
    i: 24.75701,
    ascendingNode: 119.28966,
    argPerihelion: 354.73004,
    meanAnomaly: 134.47031,
    meanMotion: 0.01078928
  },
  {
    id: "Fama",
    label: "Fama",
    category: "asteroid",
    epochJulian: 2461000.5,
    a: 3.1645953,
    e: 0.1468631,
    i: 9.0899,
    ascendingNode: 297.0861,
    argPerihelion: 108.96987,
    meanAnomaly: 23.6945,
    meanMotion: 0.17507607
  },
  {
    id: "Aura",
    label: "Aura",
    category: "asteroid",
    epochJulian: 2461000.5,
    a: 3.0421668,
    e: 0.1136653,
    i: 10.55336,
    ascendingNode: 354.23289,
    argPerihelion: 115.18428,
    meanAnomaly: 148.8272,
    meanMotion: 0.1857503
  },
  {
    id: "Rockefellia",
    label: "Rockefellia",
    category: "asteroid",
    epochJulian: 2461000.5,
    a: 2.9950495,
    e: 0.0850659,
    i: 15.18026,
    ascendingNode: 197.77792,
    argPerihelion: 254.46851,
    meanAnomaly: 195.70087,
    meanMotion: 0.19015076
  }
];

const solveKepler = (meanAnomalyRad: number, eccentricity: number): number => {
  let E = meanAnomalyRad;
  for (let i = 0; i < 6; i++) {
    E = E - (E - eccentricity * Math.sin(E) - meanAnomalyRad) / (1 - eccentricity * Math.cos(E));
  }
  return E;
};

const toRadians = (deg: number) => deg * Math.PI / 180;

const OBLIQUITY = 23.43929111 * DEG2RAD;

const rotateToEcliptic = (vector: Vector): Vector => ({
  x: vector.x,
  y: vector.y * Math.cos(OBLIQUITY) - vector.z * Math.sin(OBLIQUITY),
  z: vector.y * Math.sin(OBLIQUITY) + vector.z * Math.cos(OBLIQUITY)
});

const buildGeocentric = (minor: Vector, earth: Vector): Vector => ({
  x: minor.x - earth.x,
  y: minor.y - earth.y,
  z: minor.z - earth.z
});

export const computeMinorBodies = (time: TimePayload): CelestialBody[] => {
  const astroTime = new Astronomy.AstroTime(time.utc);
  const earth = rotateToEcliptic(Astronomy.HelioVector(Astronomy.Body.Earth, astroTime));

  const results: CelestialBody[] = [];

  MINOR_BODIES.forEach((body) => {
    const days = time.julianDay - body.epochJulian;
    const M = normalizeDeg(body.meanAnomaly + body.meanMotion * days);
    const mr = toRadians(M);
    const er = solveKepler(mr, body.e);
    const v =
      2 *
      Math.atan2(
        Math.sqrt(1 + body.e) * Math.sin(er / 2),
        Math.sqrt(1 - body.e) * Math.cos(er / 2)
      );
    const r = body.a * (1 - body.e * Math.cos(er));

    const omega = toRadians(body.argPerihelion);
    const Omega = toRadians(body.ascendingNode);
    const inc = toRadians(body.i);
    const lon = v + omega;

    const cosLon = Math.cos(lon);
    const sinLon = Math.sin(lon);
    const cosOmega = Math.cos(Omega);
    const sinOmega = Math.sin(Omega);
    const cosInc = Math.cos(inc);
    const sinInc = Math.sin(inc);

    const x =
      r * (cosOmega * cosLon - sinOmega * sinLon * cosInc);
    const y =
      r * (sinOmega * cosLon + cosOmega * sinLon * cosInc);
    const z = r * (sinLon * sinInc);

    const geocentric = buildGeocentric({ x, y, z }, earth);
    const lonEclRaw = Math.atan2(geocentric.y, geocentric.x) * RAD2DEG;
    const latEclRaw = Math.atan2(
      geocentric.z,
      Math.sqrt(geocentric.x ** 2 + geocentric.y ** 2)
    ) * RAD2DEG;
    if (!Number.isFinite(lonEclRaw) || !Number.isFinite(latEclRaw)) {
      console.warn(`No se pudo calcular ${body.id}, se omitirá del gráfico.`);
      return;
    }
    const lonEcl = normalizeDeg(lonEclRaw);
    const latEcl = latEclRaw;
    const distanceAu = Math.sqrt(
      geocentric.x ** 2 + geocentric.y ** 2 + geocentric.z ** 2
    );

    const signIndex = degToSignIndex(lonEcl);
    const degreeInSign = degInSign(lonEcl);
    const dodecatemoriaDegree = (degreeInSign % 2.5) * 12;
    const dodecatemoriaSign = (signIndex * 12 + Math.floor(degreeInSign / 2.5)) % 12;

    results.push({
      id: body.id,
      label: body.label,
      category: body.category,
      longitude: lonEcl,
      latitude: latEcl,
      distanceAu,
      signIndex,
      degreeInSign: Math.floor(degreeInSign),
      minuteInSign: Math.round((degreeInSign - Math.floor(degreeInSign)) * 60),
      dodecatemoriaSign,
      dodecatemoriaDegree,
      house: 0
    });
  });

  return results;
};
