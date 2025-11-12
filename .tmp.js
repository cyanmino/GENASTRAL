const Astro = require('astronomy-engine');
const date = new Date('1993-10-25T15:25:00Z');
const lib = Astro.Libration(date);
console.log(lib);
