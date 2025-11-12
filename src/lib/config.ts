export const BODY_CONFIG = {
  planets: [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto"
  ],
  asteroids: ["Ceres", "Pallas", "Juno", "Vesta", "Chiron", "Pholus", "Fama", "Aura", "Rockefellia"],
  points: ["Lilith", "Fortuna", "Vertex", "NorthNode", "SouthNode"]
};

export const ZODIAC_SIGNS = [
  "Aries",
  "Tauro",
  "Géminis",
  "Cáncer",
  "Leo",
  "Virgo",
  "Libra",
  "Escorpio",
  "Sagitario",
  "Capricornio",
  "Acuario",
  "Piscis"
];

export const ASPECTS = [
  { label: "Conjunción", angle: 0, orb: 8, color: "#ffffff" },
  { label: "Oposición", angle: 180, orb: 8, color: "#fb923c" },
  { label: "Trígono", angle: 120, orb: 6, color: "#34d399" },
  { label: "Cuadratura", angle: 90, orb: 6, color: "#ef4444" },
  { label: "Sextil", angle: 60, orb: 4, color: "#b4f0ca" },
  { label: "Quincuncio", angle: 150, orb: 3, color: "#facc15" }
];

export const LAYER_DEFAULTS = {
  planets: true,
  asteroids: true,
  points: true,
  houses: true,
  aspects: true,
  dodecatemoria: false,
  labels: true,
  signs: true,
  signElements: false,
  signModes: false
};

export const BODY_LABELS: Record<string, string> = {
  Sun: "Sol",
  Moon: "Luna",
  Mercury: "Mercurio",
  Venus: "Venus",
  Mars: "Marte",
  Jupiter: "Júpiter",
  Saturn: "Saturno",
  Uranus: "Urano",
  Neptune: "Neptuno",
  Pluto: "Plutón",
  Ceres: "Ceres",
  Pallas: "Palas",
  Juno: "Juno",
  Vesta: "Vesta",
  Chiron: "Quirón",
  Pholus: "Folo",
  Fama: "Fama",
  Aura: "Aura",
  Rockefellia: "Rockefellia",
  Lilith: "Lilith",
  Fortuna: "Fortuna",
  Vertex: "Vértice",
  NorthNode: "Nodo Norte",
  SouthNode: "Nodo Sur",
  Ascendente: "Ascendente",
  "Medio Cielo": "Medio Cielo",
  Descendente: "Descendente",
  "Fondo del Cielo": "Fondo del Cielo"
};

