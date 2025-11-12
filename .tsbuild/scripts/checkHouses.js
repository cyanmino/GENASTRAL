"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chartBuilder_1 = require("../src/lib/astro/chartBuilder");
const input = {
    date: "1993-10-25",
    time: "12:25",
    timezoneOffset: -180,
    timezoneId: "America/Argentina/Buenos_Aires",
    latitude: -34.587,
    longitude: -58.407,
    locationLabel: "Buenos Aires, Argentina",
    houseSystem: "placidus",
    zodiacType: "tropical"
};
const chart = (0, chartBuilder_1.buildChart)(input);
console.log("Cusps", chart.houses);
console.table(chart.bodies
    .filter((body) => [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
    "Lilith",
    "Fortuna",
    "Vertex"
].includes(body.id))
    .map((body) => ({
    id: body.id,
    longitude: body.longitude.toFixed(3),
    house: body.house
})));
