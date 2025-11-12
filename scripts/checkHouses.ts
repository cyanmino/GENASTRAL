import { buildChart } from "../src/lib/astro/chartBuilder";
import { ChartInput } from "../src/types/astro";

const input: ChartInput = {
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

const chart = buildChart(input);
console.log("Cusps", chart.houses);
console.table(
  chart.bodies
    .filter((body) =>
      [
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
      ].includes(body.id)
    )
    .map((body) => ({
      id: body.id,
      longitude: body.longitude.toFixed(3),
      house: body.house
    }))
);
