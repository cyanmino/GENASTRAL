import type { ChartData, ChartInput } from "../../types/astro";
import { computeAspects } from "./aspects";
import { assignHouses, computeHouses } from "./houses";
import { computeMinorBodies } from "./minorBodies";
import { computePoints } from "./points";
import { computePlanets, decorateBody } from "./planets";
import { buildTime } from "./time";

export const buildChart = (input: ChartInput): ChartData => {
  const time = buildTime(input.date, input.time, input.timezoneOffset);
  const planetBodies = computePlanets(time).map(decorateBody);
  const houses = computeHouses(time, input.latitude, input.longitude, input.houseSystem);
  const minorBodies = computeMinorBodies(time);
  const sun = planetBodies.find((b) => b.id === "Sun");
  const moon = planetBodies.find((b) => b.id === "Moon");

  if (!sun || !moon) {
    throw new Error("No se pudieron calcular Sol o Luna.");
  }

  const points = computePoints({
    time,
    latitude: input.latitude,
    longitude: input.longitude,
    ascendant: houses.ascendant,
    midheaven: houses.midheaven,
    sunLongitude: sun.longitude,
    moonLongitude: moon.longitude
  });

  const bodies = assignHouses([...planetBodies, ...minorBodies, ...points], houses.cusps);

  const aspects = computeAspects(bodies.filter((b) => b.category !== "point"));

  return {
    bodies,
    houses: houses.cusps,
    aspects,
    metadata: {
      localDateTime: time.local.toISOString(),
      utcDateTime: time.utc.toISOString(),
      locationLabel: input.locationLabel,
      timezoneOffset: input.timezoneOffset
    }
  };
};
