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
exports.computePoints = void 0;
const Astronomy = __importStar(require("astronomy-engine"));
const astronomy_engine_1 = require("astronomy-engine");
const math_1 = require("./math");
const decorate = (id, label, longitude) => {
    const signIndex = (0, math_1.degToSignIndex)(longitude);
    const degreeInSign = (0, math_1.degInSign)(longitude);
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
const isDayChart = (opts) => {
    const time = new astronomy_engine_1.AstroTime(opts.time.utc);
    const lstHours = (Astronomy.SiderealTime(time) + opts.longitude / 15 + 24) % 24;
    const sunEq = Astronomy.SunPosition(time);
    const hourAngleHours = (lstHours - sunEq.ra + 24) % 24;
    const hourAngleRad = hourAngleHours * 15 * math_1.DEG2RAD;
    const phi = opts.latitude * math_1.DEG2RAD;
    const dec = sunEq.dec * math_1.DEG2RAD;
    const altitude = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(hourAngleRad));
    return altitude > 0;
};
const computePoints = (opts) => {
    const dayChart = isDayChart(opts);
    const fortuna = dayChart
        ? (0, math_1.normalizeDeg)(opts.ascendant + opts.moonLongitude - opts.sunLongitude)
        : (0, math_1.normalizeDeg)(opts.ascendant - opts.sunLongitude + opts.moonLongitude);
    const lilith = (0, math_1.normalizeDeg)(opts.moonLongitude + 180);
    const vertex = (0, math_1.normalizeDeg)(opts.ascendant + 90);
    const descendant = (0, math_1.normalizeDeg)(opts.ascendant + 180);
    const imumCoeli = (0, math_1.normalizeDeg)(opts.midheaven + 180);
    return [
        decorate("Fortuna", "Fortuna", fortuna),
        decorate("Lilith", "Lilith", lilith),
        decorate("Vertex", "Vertice", vertex),
        decorate("Ascendente", "Ascendente", opts.ascendant),
        decorate("Descendente", "Descendente", descendant),
        decorate("Medio Cielo", "Medio Cielo", opts.midheaven),
        decorate("Fondo del Cielo", "Fondo del Cielo", imumCoeli)
    ];
};
exports.computePoints = computePoints;
