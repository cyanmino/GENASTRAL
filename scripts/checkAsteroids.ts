import { buildChart } from "../src/lib/astro/chartBuilder";
import { ChartInput } from "../src/types/astro";

const input: ChartInput = {
  date: "1993-10-25",
  time: "12:25",
  timezoneOffset: -180,
  timezoneId: "America/Argentina/Buenos_Aires",
  latitude: -34.587,
  longitude: -58.407,
  locationLabel: "Buenos Aires",
  houseSystem: "placidus",
  zodiacType: "tropical"
};

const chart = buildChart(input);
const asteroids = chart.bodies.filter((body) => body.category === "asteroid");
for (const body of asteroids) {
  console.log(`${body.label}: ${body.signIndex} ${body.degreeInSign}°${body.minuteInSign.toString().padStart(2, "0")}′ · Casa ${body.house}`);
}
