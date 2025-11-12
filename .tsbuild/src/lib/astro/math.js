"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.degInSign = exports.degToSignIndex = exports.clamp = exports.normalizeDeg = exports.RAD2DEG = exports.DEG2RAD = void 0;
exports.DEG2RAD = Math.PI / 180;
exports.RAD2DEG = 180 / Math.PI;
const normalizeDeg = (value) => {
    let v = value % 360;
    if (v < 0)
        v += 360;
    return v;
};
exports.normalizeDeg = normalizeDeg;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
exports.clamp = clamp;
const degToSignIndex = (longitude) => Math.floor((0, exports.normalizeDeg)(longitude) / 30) % 12;
exports.degToSignIndex = degToSignIndex;
const degInSign = (longitude) => (0, exports.normalizeDeg)(longitude) % 30;
exports.degInSign = degInSign;
