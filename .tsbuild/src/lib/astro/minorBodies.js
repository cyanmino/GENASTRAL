"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeMinorBodies = void 0;
const Astronomy = __importStar(require("astronomy-engine"));
const astronomy_engine_1 = require("astronomy-engine");
const math_1 = require("./math");
const EPOCH_JD = 2451545.0;
const MINOR_BODIES = [
    {
        id: "Ceres",
        label: "Ceres",
        category: "asteroid",
        a: 2.767,
        e: 0.076,
        i: 10.6,
        ascendingNode: 80.3,
        argPerihelion: 73.6,
        meanAnomaly: 96.0,
        meanMotion: 0.214
    },
    {
        id: "Pallas",
        label: "Pallas",
        category: "asteroid",
        a: 2.773,
        e: 0.231,
        i: 34.8,
        ascendingNode: 173.1,
        argPerihelion: 310.0,
        meanAnomaly: 33.0,
        meanMotion: 0.213
    },
    {
        id: "Juno",
        label: "Juno",
        category: "asteroid",
        a: 2.670,
        e: 0.258,
        i: 13.0,
        ascendingNode: 169.8,
        argPerihelion: 248.7,
        meanAnomaly: 208.7,
        meanMotion: 0.229
    },
    {
        id: "Vesta",
        label: "Vesta",
        category: "asteroid",
        a: 2.361,
        e: 0.089,
        i: 7.1,
        ascendingNode: 103.8,
        argPerihelion: 150.5,
        meanAnomaly: 151.2,
        meanMotion: 0.271
    },
    {
        id: "Chiron",
        label: "Chirón",
        category: "asteroid",
        a: 13.7,
        e: 0.379,
        i: 6.9,
        ascendingNode: 209.4,
        argPerihelion: 339.6,
        meanAnomaly: 144.0,
        meanMotion: 0.018
    },
    {
        id: "Pholus",
        label: "Folo",
        category: "asteroid",
        a: 20.3,
        e: 0.571,
        i: 24.5,
        ascendingNode: 119.4,
        argPerihelion: 113.7,
        meanAnomaly: 159.6,
        meanMotion: 0.010
    },
    {
        id: "Fama",
        label: "Fama",
        category: "asteroid",
        a: 2.734,
        e: 0.062,
        i: 6.5,
        ascendingNode: 287.1,
        argPerihelion: 60.0,
        meanAnomaly: 45.0,
        meanMotion: 0.220
    },
    {
        id: "Aura",
        label: "Aura",
        category: "asteroid",
        a: 2.238,
        e: 0.137,
        i: 2.4,
        ascendingNode: 187.4,
        argPerihelion: 140.6,
        meanAnomaly: 12.0,
        meanMotion: 0.293
    },
    {
        id: "Rockefellia",
        label: "Rockefellia",
        category: "asteroid",
        a: 3.011,
        e: 0.102,
        i: 9.0,
        ascendingNode: 267.0,
        argPerihelion: 112.0,
        meanAnomaly: 300.0,
        meanMotion: 0.189
    }
];
const solveKepler = (meanAnomalyRad, eccentricity) => {
    let E = meanAnomalyRad;
    for (let i = 0; i < 6; i++) {
        E = E - (E - eccentricity * Math.sin(E) - meanAnomalyRad) / (1 - eccentricity * Math.cos(E));
    }
    return E;
};
const toRadians = (deg) => deg * Math.PI / 180;
const rotationEqjToEcl = Astronomy.Rotation_EQJ_ECL();
const rotateToEcliptic = (vector) => Astronomy.RotateVector(rotationEqjToEcl, vector);
const buildGeocentric = (minor, earth) => ({
    x: minor.x - earth.x,
    y: minor.y - earth.y,
    z: minor.z - earth.z
});
const computeMinorBodies = (time) => {
    const astroTime = new astronomy_engine_1.AstroTime(time.utc);
    const earth = rotateToEcliptic(Astronomy.HelioVector(astronomy_engine_1.Body.Earth, astroTime));
    const results = [];
    MINOR_BODIES.forEach((body) => {
        const days = time.julianDay - EPOCH_JD;
        const M = (0, math_1.normalizeDeg)(body.meanAnomaly + body.meanMotion * days);
        const mr = toRadians(M);
        const er = solveKepler(mr, body.e);
        const v = 2 *
            Math.atan2(Math.sqrt(1 + body.e) * Math.sin(er / 2), Math.sqrt(1 - body.e) * Math.cos(er / 2));
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
        const x = r * (cosOmega * cosLon - sinOmega * sinLon * cosInc);
        const y = r * (sinOmega * cosLon + cosOmega * sinLon * cosInc);
        const z = r * (sinLon * sinInc);
        const geocentric = buildGeocentric({ x, y, z }, earth);
        const lonEclRaw = Math.atan2(geocentric.y, geocentric.x) * math_1.RAD2DEG;
        const latEclRaw = Math.atan2(geocentric.z, Math.sqrt(geocentric.x ** 2 + geocentric.y ** 2)) * math_1.RAD2DEG;
        if (!Number.isFinite(lonEclRaw) || !Number.isFinite(latEclRaw)) {
            console.warn(`No se pudo calcular ${body.id}, se omitirá del gráfico.`);
            return;
        }
        const lonEcl = (0, math_1.normalizeDeg)(lonEclRaw);
        const latEcl = latEclRaw;
        const distanceAu = Math.sqrt(geocentric.x ** 2 + geocentric.y ** 2 + geocentric.z ** 2);
        const signIndex = (0, math_1.degToSignIndex)(lonEcl);
        const degreeInSign = (0, math_1.degInSign)(lonEcl);
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
exports.computeMinorBodies = computeMinorBodies;
