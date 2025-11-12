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
exports.decorateBody = exports.computePlanets = void 0;
const Astronomy = __importStar(require("astronomy-engine"));
const astronomy_engine_1 = require("astronomy-engine");
const math_1 = require("./math");
const BODY_MAP = {
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
const toDegrees = (value) => value * math_1.RAD2DEG;
const computeEcliptic = (vector) => {
    const ecl = Astronomy.Ecliptic(vector);
    return {
        lon: (0, math_1.normalizeDeg)(ecl.elon),
        lat: ecl.elat
    };
};
const buildBody = (id, vector) => {
    const { lon, lat } = computeEcliptic(vector);
    return {
        id,
        longitude: lon,
        latitude: lat,
        distanceAu: Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2)
    };
};
const computePlanets = (time) => {
    const astroTime = new astronomy_engine_1.AstroTime(time.utc);
    return Object.entries(BODY_MAP).map(([name, body]) => {
        const vector = Astronomy.GeoVector(body, astroTime, true);
        return buildBody(name, vector);
    });
};
exports.computePlanets = computePlanets;
const decorateBody = (raw) => {
    const signIndex = (0, math_1.degToSignIndex)(raw.longitude);
    const degreeInSign = (0, math_1.degInSign)(raw.longitude);
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
exports.decorateBody = decorateBody;
