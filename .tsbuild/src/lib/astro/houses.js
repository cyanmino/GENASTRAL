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
exports.assignHouses = exports.computeHouses = void 0;
const Astronomy = __importStar(require("astronomy-engine"));
const astronomy_engine_1 = require("astronomy-engine");
const math_1 = require("./math");
const computeSiderealDeg = (time, longitude) => {
    const astro = new astronomy_engine_1.AstroTime(time.utc);
    const gst = Astronomy.SiderealTime(astro); // hours
    const lstHours = (gst + longitude / 15 + 24) % 24;
    return lstHours * 15;
};
const computeAscendant = (lstDeg, latitude, epsilonRad) => {
    const lst = lstDeg * math_1.DEG2RAD;
    const phi = latitude * math_1.DEG2RAD;
    const sinE = Math.sin(epsilonRad);
    const cosE = Math.cos(epsilonRad);
    const numerator = -Math.cos(lst);
    const denominator = Math.sin(lst) * cosE - Math.tan(phi) * sinE;
    return (0, math_1.normalizeDeg)(Math.atan2(numerator, denominator) * math_1.RAD2DEG);
};
const computeMC = (lstDeg, epsilonRad) => {
    const lst = lstDeg * math_1.DEG2RAD;
    const mc = Math.atan2(Math.sin(lst), Math.cos(lst)) + Math.atan2(Math.tan(lst) * Math.sin(epsilonRad), 1);
    return (0, math_1.normalizeDeg)(mc * math_1.RAD2DEG);
};
const normalizeRad = (value) => {
    const tau = Math.PI * 2;
    let angle = value % tau;
    if (angle > Math.PI)
        angle -= tau;
    if (angle < -Math.PI)
        angle += tau;
    return angle;
};
const lonToEquatorial = (lambda, epsilon) => {
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
const solvePlacidusCusp = (lst, latitudeRad, epsilonRad, ratio, initialDeg) => {
    let lambda = initialDeg * math_1.DEG2RAD;
    for (let iter = 0; iter < 80; iter += 1) {
        const { alpha, delta } = lonToEquatorial(lambda, epsilonRad);
        let hourAngle = normalizeRad(lst - alpha);
        let value = -Math.tan(latitudeRad) * Math.tan(delta);
        if (value > 1)
            value = 1;
        if (value < -1)
            value = -1;
        const semiArc = Math.acos(value);
        const fn = hourAngle - ratio * semiArc;
        if (Math.abs(fn) < 1e-10) {
            break;
        }
        const step = 1e-5;
        const { alpha: alpha2, delta: delta2 } = lonToEquatorial(lambda + step, epsilonRad);
        let hourAngle2 = normalizeRad(lst - alpha2);
        let value2 = -Math.tan(latitudeRad) * Math.tan(delta2);
        if (value2 > 1)
            value2 = 1;
        if (value2 < -1)
            value2 = -1;
        const semiArc2 = Math.acos(value2);
        const fn2 = hourAngle2 - ratio * semiArc2;
        const derivative = (fn2 - fn) / step;
        if (!Number.isFinite(derivative) || derivative === 0) {
            lambda += step;
            continue;
        }
        lambda -= fn / derivative;
    }
    let deg = (lambda * math_1.RAD2DEG) % 360;
    if (deg < 0)
        deg += 360;
    return (0, math_1.normalizeDeg)(deg);
};
const computePlacidusCusps = (lstDeg, latitude, epsilonRad, ascendant, midheaven) => {
    const lstRad = lstDeg * math_1.DEG2RAD;
    const latitudeRad = latitude * math_1.DEG2RAD;
    const descendant = (0, math_1.normalizeDeg)(ascendant + 180);
    const cusp12 = solvePlacidusCusp(lstRad, latitudeRad, epsilonRad, -2 / 3, (0, math_1.normalizeDeg)(ascendant - 60));
    const cusp11 = solvePlacidusCusp(lstRad, latitudeRad, epsilonRad, -1 / 3, (0, math_1.normalizeDeg)(ascendant - 30));
    const cusp9 = solvePlacidusCusp(lstRad, latitudeRad, epsilonRad, 1 / 3, (0, math_1.normalizeDeg)(descendant + 30));
    const cusp8 = solvePlacidusCusp(lstRad, latitudeRad, epsilonRad, 2 / 3, (0, math_1.normalizeDeg)(descendant + 60));
    const cusps = new Array(12);
    cusps[0] = ascendant;
    cusps[1] = (0, math_1.normalizeDeg)(cusp8 + 180);
    cusps[2] = (0, math_1.normalizeDeg)(cusp9 + 180);
    cusps[3] = (0, math_1.normalizeDeg)(midheaven + 180);
    cusps[4] = (0, math_1.normalizeDeg)(cusp11 + 180);
    cusps[5] = (0, math_1.normalizeDeg)(cusp12 + 180);
    cusps[6] = descendant;
    cusps[7] = cusp8;
    cusps[8] = cusp9;
    cusps[9] = midheaven;
    cusps[10] = cusp11;
    cusps[11] = cusp12;
    return cusps;
};
const computeEqualCusps = (ascendant) => Array.from({ length: 12 }, (_, index) => (0, math_1.normalizeDeg)(ascendant + index * 30));
const computeWholeSignCusps = (ascendant) => {
    const base = Math.floor(ascendant / 30) * 30;
    return Array.from({ length: 12 }, (_, index) => (0, math_1.normalizeDeg)(base + index * 30));
};
const computeCuspsBySystem = (lstDeg, latitude, epsilonRad, ascendant, midheaven, system) => {
    if (system === "whole-sign") {
        return computeWholeSignCusps(ascendant);
    }
    if (system === "equal") {
        return computeEqualCusps(ascendant);
    }
    // For now treat Koch same as Placidus until a dedicated implementation is added.
    return computePlacidusCusps(lstDeg, latitude, epsilonRad, ascendant, midheaven);
};
const computeHouses = (time, latitude, longitude, system) => {
    const lst = computeSiderealDeg(time, longitude);
    const epsilon = Astronomy.e_tilt(new astronomy_engine_1.AstroTime(time.utc)).tobl * math_1.DEG2RAD;
    const ascendant = computeAscendant(lst, latitude, epsilon);
    const midheaven = computeMC(lst, epsilon);
    const cusps = computeCuspsBySystem(lst, latitude, epsilon, ascendant, midheaven, system);
    return { ascendant, midheaven, cusps };
};
exports.computeHouses = computeHouses;
const expandCuspsAscending = (cusps) => {
    if (!cusps.length)
        return [];
    const expanded = new Array(cusps.length);
    expanded[0] = (0, math_1.normalizeDeg)(cusps[0]);
    for (let i = 1; i < cusps.length; i += 1) {
        let value = (0, math_1.normalizeDeg)(cusps[i]);
        while (value <= expanded[i - 1]) {
            value += 360;
        }
        expanded[i] = value;
    }
    return expanded;
};
const assignHouses = (bodies, cusps) => {
    const expandedCusps = expandCuspsAscending(cusps);
    if (!expandedCusps.length)
        return bodies;
    const start = expandedCusps[0];
    const boundaries = [...expandedCusps, start + 360];
    return bodies.map((body) => {
        let lon = (0, math_1.normalizeDeg)(body.longitude);
        while (lon < start)
            lon += 360;
        while (lon >= start + 360)
            lon -= 360;
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
exports.assignHouses = assignHouses;
