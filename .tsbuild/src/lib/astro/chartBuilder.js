"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildChart = void 0;
const aspects_1 = require("./aspects");
const houses_1 = require("./houses");
const minorBodies_1 = require("./minorBodies");
const points_1 = require("./points");
const planets_1 = require("./planets");
const time_1 = require("./time");
const buildChart = (input) => {
    const time = (0, time_1.buildTime)(input.date, input.time, input.timezoneOffset);
    const planetBodies = (0, planets_1.computePlanets)(time).map(planets_1.decorateBody);
    const houses = (0, houses_1.computeHouses)(time, input.latitude, input.longitude, input.houseSystem);
    const minorBodies = (0, minorBodies_1.computeMinorBodies)(time);
    const sun = planetBodies.find((b) => b.id === "Sun");
    const moon = planetBodies.find((b) => b.id === "Moon");
    if (!sun || !moon) {
        throw new Error("No se pudieron calcular Sol o Luna.");
    }
    const points = (0, points_1.computePoints)({
        time,
        latitude: input.latitude,
        longitude: input.longitude,
        ascendant: houses.ascendant,
        midheaven: houses.midheaven,
        sunLongitude: sun.longitude,
        moonLongitude: moon.longitude
    });
    const bodies = (0, houses_1.assignHouses)([...planetBodies, ...minorBodies, ...points], houses.cusps);
    const aspects = (0, aspects_1.computeAspects)(bodies.filter((b) => b.category !== "point"));
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
exports.buildChart = buildChart;
