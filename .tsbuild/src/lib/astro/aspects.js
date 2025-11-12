"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAspects = void 0;
const config_1 = require("../config");
const math_1 = require("./math");
const computeAspects = (bodies) => {
    const results = [];
    for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            const a = bodies[i];
            const b = bodies[j];
            const diff = Math.abs((0, math_1.normalizeDeg)(a.longitude - b.longitude));
            const delta = Math.min(diff, 360 - diff);
            for (const aspect of config_1.ASPECTS) {
                const orb = Math.abs(delta - aspect.angle);
                if (orb <= aspect.orb) {
                    results.push({
                        id: `${a.id}-${b.id}-${aspect.label}`,
                        bodyA: a.id,
                        bodyB: b.id,
                        angle: delta,
                        exactAngle: aspect.angle,
                        orb,
                        label: aspect.label
                    });
                }
            }
        }
    }
    return results;
};
exports.computeAspects = computeAspects;
