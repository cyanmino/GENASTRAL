import type { CelestialBody, Aspect } from "../../types/astro";
import { ASPECTS } from "../config";
import { normalizeDeg } from "./math";

export const computeAspects = (bodies: CelestialBody[]): Aspect[] => {
  const results: Aspect[] = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i];
      const b = bodies[j];
      const diff = Math.abs(normalizeDeg(a.longitude - b.longitude));
      const delta = Math.min(diff, 360 - diff);
      for (const aspect of ASPECTS) {
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
