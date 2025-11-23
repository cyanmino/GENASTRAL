import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useChartStore } from "../state/chartStore";
import { CelestialBody, ChartData } from "../types/astro";
import { BODY_LABELS, ASPECTS } from "../lib/config";

const DEG2RAD = Math.PI / 180;
const PLANET_COLORS: Record<string, number> = {
  Sun: 0xfde68a,
  Moon: 0x94a3b8,
  Mercury: 0x60a5fa,
  Venus: 0xfbbf24,
  Mars: 0xef4444,
  Jupiter: 0x34d399,
  Saturn: 0xfcd34d,
  Uranus: 0x2dd4bf,
  Neptune: 0x1e3a8a,
  Pluto: 0xeab676
};

const ASPECT_COLOR_MAP: Record<string, string> = ASPECTS.reduce((acc, aspect) => {
  acc[aspect.label] = aspect.color;
  return acc;
}, {} as Record<string, string>);

const SIGN_LABELS = [
  "Aries",
  "Tauro",
  "G\u00e9minis",
  "C\u00e1ncer",
  "Leo",
  "Virgo",
  "Libra",
  "Escorpio",
  "Sagitario",
  "Capricornio",
  "Acuario",
  "Piscis"
];

const SIGN_ELEMENTS = [
  "fire",
  "earth",
  "air",
  "water",
  "fire",
  "earth",
  "air",
  "water",
  "fire",
  "earth",
  "air",
  "water"
] as const;

const ELEMENT_COLORS: Record<(typeof SIGN_ELEMENTS)[number], number> = {
  fire: 0xef4444,
  earth: 0x34d399,
  air: 0xfacc15,
  water: 0x38bdf8
};

const SIGN_MODES = [
  "cardinal",
  "fixed",
  "mutable",
  "cardinal",
  "fixed",
  "mutable",
  "cardinal",
  "fixed",
  "mutable",
  "cardinal",
  "fixed",
  "mutable"
] as const;

const MODE_COLORS: Record<(typeof SIGN_MODES)[number], number> = {
  cardinal: 0xf97316,
  fixed: 0x8b5cf6,
  mutable: 0x14b8a6
};

const VIEW_FLIPPED = true;

const placeY = (height: number) => (VIEW_FLIPPED ? -height : height);

const LAYER_HEIGHTS = {
  base: -2.6,
  signs: -2.3,
  elements: -2.1,
  modes: -1.9,
  dode: -1.7,
  houses: -1.4,
  cusps: -1.2
};

const normalizeAngle = (value: number) => {
  const mod = value % 360;
  return mod < 0 ? mod + 360 : mod;
};

const createSkyDome = () => {
  const geometry = new THREE.SphereGeometry(3000, 64, 64);
  const material = new THREE.MeshBasicMaterial({
    color: 0x010409,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    depthTest: false
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -20;
  return mesh;
};

const createStarField = () => {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  for (let i = 0; i < 4000; i += 1) {
    const radius = 2200 + Math.random() * 800;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    positions.push(x, y, z);
    const intensity = 0.65 + Math.random() * 0.35;
    colors.push(intensity, intensity, intensity);
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    vertexColors: true,
    size: 1.4,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false
  });
  const stars = new THREE.Points(geometry, material);
  stars.frustumCulled = false;
  stars.renderOrder = -18;
  return stars;
};

const getBaseId = (id: string) => id.replace(/^transit-/, "");

const getDisplayName = (body: CelestialBody) => {
  const baseId = getBaseId(body.id);
  const baseLabel = BODY_LABELS[baseId] ?? body.label;
  return body.isTransit ? `Tr\u00e1nsito ${baseLabel}` : baseLabel;
};

const colorForBody = (body: CelestialBody): THREE.ColorRepresentation => {
  if (body.customColor) {
    return body.customColor;
  }
  if (body.isTransit) {
    return 0xc084fc;
  }
  if (body.category === "planet") {
    return PLANET_COLORS[body.id] ?? 0x93c5fd;
  }
  if (body.category === "asteroid") return 0x94a3b8;
  return 0xf472b6;
};

const makeBodyMaterial = (body: CelestialBody) => {
  const baseColor = new THREE.Color(colorForBody(body));
  const linearColor = baseColor.clone().convertSRGBToLinear();
  const emissive = linearColor.clone();
  return new THREE.MeshStandardMaterial({
    color: linearColor,
    emissive,
    emissiveIntensity: body.isTransit ? 1.4 : 1.1,
    metalness: 0,
    roughness: 0.35,
    transparent: false,
    depthWrite: true,
    depthTest: true,
    side: THREE.DoubleSide,
    toneMapped: false
  });
};

const shiftLongitude = (longitude: number, offset: number) =>
  normalizeAngle(longitude - offset);

const polarAngle = (displayLongitude: number) =>
  normalizeAngle(displayLongitude + 90) * DEG2RAD;

const positionFromDisplay = (displayLongitude: number, radius: number) => {
  const angle = polarAngle(displayLongitude);
  return new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
};

const angleToPosition = (longitude: number, radius: number, offset: number) => {
  const display = shiftLongitude(longitude, offset);
  return positionFromDisplay(display, radius);
};

const disposeChartGroup = (group: THREE.Object3D) => {
  const textures: THREE.Texture[] = Array.isArray(group.userData?.textures) ? group.userData.textures : [];
  group.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    const material = (mesh as THREE.Mesh).material;
    if (Array.isArray(material)) {
      material.forEach((mat) => mat && (mat as THREE.Material).dispose());
    } else if (material) {
      (material as THREE.Material).dispose();
    }
  });
  textures.forEach((texture) => texture.dispose());
  group.userData.textures = [];
};

const expandCusps = (cusps: number[]) => {
  if (!cusps.length) return [];
  const expanded = new Array<number>(cusps.length);
  expanded[0] = normalizeAngle(cusps[0]);
  for (let i = 1; i < cusps.length; i += 1) {
    let value = normalizeAngle(cusps[i]);
    while (value <= expanded[i - 1]) {
      value += 360;
    }
    expanded[i] = value;
  }
  return expanded;
};

const makeTextSprite = (
  text: string,
  fontSize = 28,
  color = "#e2e8f0",
  registerTexture?: (texture: THREE.Texture) => void
) => {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px Inter`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  registerTexture?.(texture);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(32, 16, 1);
  return sprite;
};

const makeFlatLabel = (text: string, registerTexture?: (texture: THREE.Texture) => void) => {
  const canvas = document.createElement("canvas");
  canvas.width = 192;
  canvas.height = 192;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 72px Inter";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  registerTexture?.(texture);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(15, 15), material);
  plane.rotation.x = VIEW_FLIPPED ? Math.PI / 2 : -Math.PI / 2;
  plane.rotation.y = VIEW_FLIPPED ? Math.PI : 0;
  if (VIEW_FLIPPED) {
    plane.scale.x = -1;
  }
  return plane;
};

const getGeometryForBody = (body: CelestialBody) => {
  if (body.customShape) {
    switch (body.customShape) {
      case "cube":
        return new THREE.BoxGeometry(6, 6, 6);
      case "octahedron":
        return new THREE.OctahedronGeometry(4);
      case "pyramid":
        return new THREE.ConeGeometry(4, 8, 4);
      case "sphere":
      default:
        return new THREE.SphereGeometry(4, 16, 16);
    }
  }

  if (body.category === "point") {
    return new THREE.BoxGeometry(6, 6, 6);
  }

  if (body.category === "asteroid") {
    return new THREE.OctahedronGeometry(3);
  }

  return new THREE.SphereGeometry(body.category === "planet" ? 4 : 3, 16, 16);
};

const layerAllows = (
  body: CelestialBody,
  layers: ReturnType<typeof useChartStore.getState>["layers"],
  visibleBodies: Record<string, boolean>
) => {
  const baseId = getBaseId(body.id);
  if (visibleBodies[baseId] === false) return false;
  if (body.category === "planet") return layers.planets;
  if (body.category === "asteroid") return layers.asteroids;
  return layers.points;
};

const createChartGroup = (
  chart: ChartData,
  layers: ReturnType<typeof useChartStore.getState>["layers"],
  visibleBodies: Record<string, boolean>
) => {
  const group = new THREE.Group();
  const positions = new Map<string, THREE.Vector3>();
  const longitudeStacks = new Map<string, number>();
  const getBucketKey = (longitude: number, radius: number) =>
    `${Math.round(normalizeAngle(longitude) * 10) / 10}-${radius}`;
  const rotating: THREE.Object3D[] = [];
  const textures: THREE.Texture[] = [];
  const registerTexture = (texture: THREE.Texture) => {
    textures.push(texture);
    return texture;
  };
  const planetRadius = 110;
  const asteroidRadius = 120;
  const pointRadius = 95;
  const transitRadius = planetRadius + 25;
  const baseRadius = 140;
  const showHouses = layers.houses;
  const showDode = layers.dodecatemoria;
  const showAspects = layers.aspects;
  const showSigns = layers.signs;
  const showElementRing = layers.signElements;
  const showModeRing = layers.signModes;
  const ascendant = chart.houses[0] ?? 0;
  const offset = normalizeAngle(ascendant - 90);
  const baseRing = new THREE.Mesh(
    new THREE.RingGeometry(baseRadius - 5, baseRadius, 128),
    new THREE.MeshBasicMaterial({
      color: 0x1d4ed8,
      side: THREE.DoubleSide,
      opacity: 0.25,
      transparent: true,
      depthWrite: false,
      depthTest: false
    })
  );
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = placeY(LAYER_HEIGHTS.base);
  group.add(baseRing);

  // sign segments
  if (showSigns) {
    const signRing = new THREE.Group();
    const signBoundaries = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const startLon = i * 30;
      const startDisplay = shiftLongitude(startLon, offset);
      const wedge = new THREE.Mesh(
        new THREE.RingGeometry(
          baseRadius - 12,
          baseRadius - 4,
          64,
          1,
          polarAngle(startDisplay),
          30 * DEG2RAD
        ),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0x14213d : 0x0b1120,
          opacity: 0.35,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
          depthTest: false
        })
      );
      wedge.rotation.x = Math.PI / 2;
      wedge.renderOrder = 4;
      wedge.position.y = placeY(LAYER_HEIGHTS.signs);
      signRing.add(wedge);

      const inner = positionFromDisplay(startDisplay, baseRadius - 12);
      const outer = positionFromDisplay(startDisplay, baseRadius - 4);
      const geom = new THREE.BufferGeometry().setFromPoints([inner, outer]);
      const dividerMat = new THREE.LineBasicMaterial({
        color: 0x1e293b,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        depthTest: false
      });
      const divider = new THREE.Line(geom, dividerMat);
      divider.position.y = placeY(LAYER_HEIGHTS.signs);
      divider.renderOrder = 5;
      signBoundaries.add(divider);
    }

    signRing.position.y = placeY(LAYER_HEIGHTS.signs);
    signBoundaries.position.y = placeY(LAYER_HEIGHTS.signs);
    group.add(signRing);
    group.add(signBoundaries);
  }

  if (showElementRing) {
    const elementRing = new THREE.Group();
    const inner = baseRadius + 2;
    const outer = baseRadius + 8;
    for (let i = 0; i < 12; i++) {
      const startLon = i * 30;
      const startDisplay = shiftLongitude(startLon, offset);
      const element = SIGN_ELEMENTS[i];
      const material = new THREE.MeshBasicMaterial({
        color: ELEMENT_COLORS[element],
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false
      });
      const wedge = new THREE.Mesh(
        new THREE.RingGeometry(inner, outer, 48, 1, polarAngle(startDisplay), 30 * DEG2RAD),
        material
      );
      wedge.rotation.x = Math.PI / 2;
      wedge.position.y = placeY(LAYER_HEIGHTS.elements);
      wedge.renderOrder = 6;
      elementRing.add(wedge);
    }
    group.add(elementRing);
  }

  if (showModeRing) {
    const modeRing = new THREE.Group();
    const inner = baseRadius + 10;
    const outer = baseRadius + 16;
    for (let i = 0; i < 12; i++) {
      const startLon = i * 30;
      const startDisplay = shiftLongitude(startLon, offset);
      const mode = SIGN_MODES[i];
      const material = new THREE.MeshBasicMaterial({
        color: MODE_COLORS[mode],
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false
      });
      const wedge = new THREE.Mesh(
        new THREE.RingGeometry(inner, outer, 48, 1, polarAngle(startDisplay), 30 * DEG2RAD),
        material
      );
      wedge.rotation.x = Math.PI / 2;
      wedge.position.y = placeY(LAYER_HEIGHTS.modes);
      wedge.renderOrder = 7;
      modeRing.add(wedge);
    }
    group.add(modeRing);
  }

  if (showDode) {
    const dodeRing = new THREE.Group();
    const inner = baseRadius - 19;
    const outer = baseRadius - 17;
    for (let i = 0; i < 144; i += 1) {
      const lon = i * 2.5;
      const startDisplay = shiftLongitude(lon, offset);
      const innerPoint = positionFromDisplay(startDisplay, inner).setY(placeY(LAYER_HEIGHTS.dode));
      const outerPoint = positionFromDisplay(startDisplay, outer).setY(placeY(LAYER_HEIGHTS.dode));
      const geom = new THREE.BufferGeometry().setFromPoints([innerPoint, outerPoint]);
      const line = new THREE.Line(
        geom,
        new THREE.LineBasicMaterial({
          color: 0xfef9c3,
          transparent: true,
          opacity: 0.45,
          depthWrite: false,
          depthTest: false
        })
      );
      dodeRing.add(line);
    }
    group.add(dodeRing);
  }

  let houseSegments: { index: number; start: number; end: number; span: number }[] = [];
  if (showHouses) {
    const expandedCusps = expandCusps(chart.houses);
    const houseRing = new THREE.Group();
    houseSegments = expandedCusps.map((start, index) => {
      const endIndex = index === expandedCusps.length - 1 ? 0 : index + 1;
      const end = expandedCusps[endIndex] + (endIndex === 0 ? 360 : 0);
      return { index, start, end, span: end - start };
    });
    houseSegments.forEach((segment) => {
      const startDisplayAbs = segment.start - offset;
      const wedgeStart = normalizeAngle(startDisplayAbs);
      const wedge = new THREE.Mesh(
        new THREE.RingGeometry(
          baseRadius - 18,
          baseRadius - 12,
          64,
          1,
          polarAngle(wedgeStart),
          segment.span * DEG2RAD
        ),
        new THREE.MeshBasicMaterial({
          color: segment.index % 2 === 0 ? 0x475569 : 0x1f2937,
          opacity: 0.14,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
          depthTest: false
        })
      );
      wedge.rotation.x = Math.PI / 2;
      wedge.position.y = placeY(LAYER_HEIGHTS.houses);
      houseRing.add(wedge);
    });
    group.add(houseRing);
  }

  const addBody = (body: CelestialBody, radius: number, elevate = 2) => {
    if (!layerAllows(body, layers, visibleBodies)) return;
    const bucketKey = getBucketKey(body.longitude, radius);
    const stackIndex = longitudeStacks.get(bucketKey) ?? 0;
    longitudeStacks.set(bucketKey, stackIndex + 1);
    const basePosition = angleToPosition(body.longitude, radius, offset);
    const geometry = getGeometryForBody(body);
    const material = makeBodyMaterial(body);
    material.opacity = 1;
    material.transparent = true;
    material.depthWrite = true;
    material.depthTest = true;
    material.blending = THREE.NoBlending;
    material.needsUpdate = true;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 1000;
    mesh.position.copy(basePosition);
    mesh.position.y = placeY(elevate);
    if (stackIndex > 0) {
      const outward = basePosition.clone().setY(0).normalize();
      mesh.position.addScaledVector(outward, -stackIndex * 4);
    }
    if (body.isTransit || body.category !== "planet" || body.id === "Saturn") {
      rotating.push(mesh);
    }
    group.add(mesh);
    positions.set(body.id, mesh.position.clone());

    if (body.id === "Saturn") {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(6, 9, 32),
        new THREE.MeshStandardMaterial({
          color: 0xfcd34d,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7
        })
      );
      ring.rotation.x = Math.PI / 2.8;
      mesh.add(ring);
    }

    if (layers.labels) {
      const label = makeTextSprite(
        `${getDisplayName(body)} ${body.degreeInSign}\u00B0`,
        28,
        "#e2e8f0",
        registerTexture
      );
      const labelHeight = VIEW_FLIPPED ? -12 : 12;
      label.position.copy(mesh.position.clone().setY(mesh.position.y + labelHeight));
      group.add(label);
    }
  };

  chart.bodies.forEach((body) => {
    const radius =
      body.category === "planet"
        ? planetRadius
        : body.category === "asteroid"
          ? asteroidRadius
          : pointRadius;
    addBody(body, radius, body.category === "point" ? 6 : 2);
  });

  (chart.transits ?? []).forEach((body) => {
    addBody(body, transitRadius, 8);
  });

  if (showHouses) {
    houseSegments.forEach((segment) => {
      const startDisplayAbs = segment.start - offset;
      const startDisplay = normalizeAngle(startDisplayAbs);
      const cuspHeight = LAYER_HEIGHTS.cusps;
      const start = new THREE.Vector3(0, placeY(cuspHeight), 0);
      const endVec = positionFromDisplay(startDisplay, baseRadius).setY(placeY(cuspHeight));
      const geom = new THREE.BufferGeometry().setFromPoints([start, endVec]);
      const material = new THREE.LineBasicMaterial({
        color: 0xbcd4ff,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false
      });
      const cuspLine = new THREE.Line(geom, material);
      cuspLine.renderOrder = 8;
      group.add(cuspLine);

      const midDisplay = normalizeAngle(startDisplayAbs + segment.span / 2);
      const numberSprite = makeFlatLabel(`${segment.index + 1}`, registerTexture);
      const numberPos = positionFromDisplay(midDisplay, baseRadius - 24);
      numberSprite.position.copy(numberPos.clone().setY(placeY(0.6)));
      group.add(numberSprite);
    });
  }

  if (showSigns) {
    for (let signIndex = 0; signIndex < 12; signIndex++) {
      const angle = signIndex * 30 + 15;
      const signSprite = makeTextSprite(SIGN_LABELS[signIndex], 26, "#cbd5f5", registerTexture);
      signSprite.renderOrder = 15;
      (signSprite.material as THREE.SpriteMaterial).depthWrite = false;
      const signPos = positionFromDisplay(shiftLongitude(angle, offset), baseRadius + 32);
      signSprite.position.copy(signPos.clone().setY(placeY(4)));
      group.add(signSprite);
    }
  }

  if (showAspects) {
    chart.aspects.forEach((aspect) => {
      const from = positions.get(aspect.bodyA);
      const to = positions.get(aspect.bodyB);
      if (!from || !to) return;
      const geom = new THREE.BufferGeometry().setFromPoints([from, to]);
      const material = new THREE.LineDashedMaterial({
        color: ASPECT_COLOR_MAP[aspect.label] ?? 0x38bdf8,
        dashSize: 4,
        gapSize: 2,
        transparent: true,
        opacity: 0.9
      });
      material.depthTest = true;
      material.depthWrite = false;
      const line = new THREE.Line(geom, material);
      line.computeLineDistances();
      line.renderOrder = 9;
      group.add(line);
    });
  }

  if (VIEW_FLIPPED) {
    group.rotation.x = Math.PI;
  }
  group.userData.textures = textures;
  return { group, positions, rotating };
};

export const ChartCanvas = ({ chartOverride }: { chartOverride?: ChartData }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();
  const controlsRef = useRef<OrbitControls>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rotatingRef = useRef<THREE.Object3D[]>([]);
  const starFieldRef = useRef<THREE.Points | null>(null);
  const skyDomeRef = useRef<THREE.Mesh | null>(null);
  const resizeObserverRef = useRef<ResizeObserver>();
  const [rendererReady, setRendererReady] = useState(false);
  const storeChart = useChartStore((state) => state.chart);
  const chart = chartOverride ?? storeChart;
  const layers = useChartStore((state) => state.layers);
  const visibleBodies = useChartStore((state) => state.visibleBodies);
  const fullscreen = useChartStore((state) => state.fullscreen);
  const toggleFullscreen = useChartStore((state) => state.toggleFullscreen);
  const profiles = useChartStore((state) => state.profiles);
  const activeProfileId = useChartStore((state) => state.activeProfileId);
  const clearActiveProfile = useChartStore((state) => state.clearActiveProfile);
  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.id === activeProfileId),
    [profiles, activeProfileId]
  );

  useEffect(() => {
    document.body.style.overflow = fullscreen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  useEffect(() => {
    setRendererReady(false);
    if (!mountRef.current) return;
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    const getDimensions = () => {
      if (fullscreen) {
        return { width: window.innerWidth, height: window.innerHeight };
      }
      const bounds = mountRef.current?.getBoundingClientRect();
      if (bounds && bounds.width > 0 && bounds.height > 0) {
        return { width: bounds.width, height: bounds.height };
      }
      return { width: window.innerWidth * 0.6, height: 520 };
    };

    const { width, height } = getDimensions();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const skyDome = createSkyDome();
    const starField = createStarField();

    scene.add(skyDome, starField);
    skyDomeRef.current = skyDome;
    starFieldRef.current = starField;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000);
    camera.position.set(0, 160, 260);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.physicallyCorrectLights = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(width, height, false);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    setRendererReady(true);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 120;
    controls.maxDistance = 400;
    controls.maxPolarAngle = Math.PI / 1.8;
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    const lightFlip = VIEW_FLIPPED ? -1 : 1;
    const ambient = new THREE.AmbientLight(0xffffff, VIEW_FLIPPED ? 1.2 : 1);
    const dir = new THREE.DirectionalLight(0xffffff, 2);
    dir.position.set(0, 260 * lightFlip, 160);
    dir.target.position.set(0, 0, 0);
    scene.add(dir.target);
    const fill = new THREE.DirectionalLight(0xc4d0ff, 1.2);
    fill.position.set(-180, -200 * lightFlip, -140);
    fill.target.position.set(0, 0, 0);
    scene.add(fill.target);
    const rim = new THREE.PointLight(0x9ee0ff, 1.1, 1200);
    rim.position.set(260 * lightFlip, 110, -220);
    const glow = new THREE.PointLight(0xfff7c2, 0.95, 900);
    glow.position.set(-240 * lightFlip, 180, 240);
    const hemi = new THREE.HemisphereLight(0xddeeff, 0x0b0b11, 0.9);
    scene.add(ambient, dir, fill, rim, glow, hemi);
    sceneRef.current = scene;

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current || !mountRef.current) return;
      const w = fullscreen ? window.innerWidth : mountRef.current.clientWidth || 640;
      const h = fullscreen ? window.innerHeight : mountRef.current.clientHeight || 480;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);
    const attachObserver = () => {
      if (!mountRef.current) return;
      const observer = new ResizeObserver(() => {
        if (!rendererRef.current || !cameraRef.current || !mountRef.current) return;
        if (fullscreen) {
          rendererRef.current.setSize(window.innerWidth, window.innerHeight, false);
          cameraRef.current.aspect = window.innerWidth / window.innerHeight;
          cameraRef.current.updateProjectionMatrix();
          return;
        }
        const bounds = mountRef.current.getBoundingClientRect();
        const w = bounds.width > 0 ? bounds.width : window.innerWidth * 0.6;
        const h = bounds.height > 0 ? bounds.height : 520;
        rendererRef.current.setSize(w, h, false);
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
      });
      observer.observe(mountRef.current);
      resizeObserverRef.current = observer;
    };
    handleResize();
    attachObserver();

    const animate = () => {
      requestAnimationFrame(animate);
      rotatingRef.current.forEach((mesh) => {
        mesh.rotation.y += 0.01;
      });
      if (starFieldRef.current) {
        starFieldRef.current.rotation.y += 0.0002;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = undefined;
      scene.remove(skyDome);
      scene.remove(starField);
      skyDome.geometry.dispose();
      (skyDome.material as THREE.Material).dispose();
      starField.geometry.dispose();
      (starField.material as THREE.Material).dispose();
      skyDomeRef.current = null;
      starFieldRef.current = null;
      setRendererReady(false);
      if (mountRef.current && renderer.domElement.parentElement === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, [fullscreen]);

  useEffect(() => {
    if (!sceneRef.current) return;
    const existing = sceneRef.current.getObjectByName("chart");
    if (existing) {
      disposeChartGroup(existing);
      sceneRef.current.remove(existing);
    }
    if (chart) {
      const { group, rotating } = createChartGroup(chart, layers, visibleBodies);
      group.name = "chart";
      sceneRef.current.add(group);
      rotatingRef.current = rotating;
      // ensure renderer updates size after new chart
      if (rendererRef.current && cameraRef.current && mountRef.current && !fullscreen) {
        const bounds = mountRef.current.getBoundingClientRect();
        const w = bounds.width > 0 ? bounds.width : window.innerWidth * 0.6;
        const h = bounds.height > 0 ? bounds.height : 520;
        rendererRef.current.setSize(w, h, false);
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
      }
    } else {
      rotatingRef.current = [];
    }
  }, [chart, layers, visibleBodies, fullscreen]);

  const exportImage = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "genastral-chart.png";
    link.click();
  };

  const resetView = () => {
    if (!controlsRef.current || !cameraRef.current) return;
    cameraRef.current.position.set(0, 160, 260);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  const zoomCamera = (direction: "in" | "out") => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const target = controls.target.clone();
    const offset = camera.position.clone().sub(target);
    const scale = direction === "in" ? 0.9 : 1.1;
    offset.multiplyScalar(scale);
    camera.position.copy(target).add(offset);
    controls.update();
  };

  const rotateCamera = (azimuthDelta: number, polarDelta: number) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const target = controls.target.clone();
    const offset = camera.position.clone().sub(target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    spherical.theta += azimuthDelta;
    spherical.phi = Math.min(Math.max(0.1, spherical.phi + polarDelta), Math.PI - 0.1);
    offset.setFromSpherical(spherical);
    camera.position.copy(target).add(offset);
    camera.lookAt(target);
    controls.target.copy(target);
    controls.update();
  };

  const panCamera = (xDir: number, yDir: number) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const panSpeed = 4;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
    const up = new THREE.Vector3().crossVectors(right, forward).normalize();
    const move = new THREE.Vector3()
      .addScaledVector(right, -xDir * panSpeed)
      .addScaledVector(up, yDir * panSpeed);
    camera.position.add(move);
    controls.target.add(move);
    controls.update();
  };

  const containerStyle = fullscreen
    ? { position: "fixed", inset: 0, zIndex: 50, padding: "1rem", background: "#020617", display: "flex", flexDirection: "column" as const }
    : { position: "relative", minHeight: "520px", flex: 1, display: "flex", flexDirection: "column" as const };

  return (
    <div className="panel" style={containerStyle}>
      <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 3, display: "flex", gap: "0.5rem", alignItems: "center" }}>
        {activeProfile && (
          <div className="profile-tab">
            <span>{activeProfile.name}</span>
            <button type="button" onClick={clearActiveProfile} aria-label="Cerrar carta activa">
              ×
            </button>
          </div>
        )}
        <button type="button" onClick={toggleFullscreen}>
          {fullscreen ? "Cerrar pantalla completa" : "Pantalla completa"}
        </button>
      </div>
      <button
        type="button"
        onClick={exportImage}
        style={{ position: "absolute", right: "1rem", top: "1rem", zIndex: 3 }}
      >
        Exportar PNG
      </button>
      <button
        type="button"
        onClick={resetView}
        style={{ position: "absolute", left: "1rem", bottom: "1rem", zIndex: 3 }}
      >
        Restablecer vista
      </button>
      {(!chart || !rendererReady) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            textAlign: "center",
            fontSize: "1rem",
            zIndex: 2,
            pointerEvents: "none",
            background: chart ? "transparent" : "rgba(2,6,23,0.75)"
          }}
        >
          {chart ? "Iniciando mandala..." : "Selecciona o crea un perfil para visualizar el mandala."}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          right: "1rem",
          bottom: "1rem",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem"
        }}
      >
        <div style={{ display: "flex", gap: "0.35rem" }}>
          <button type="button" onClick={() => zoomCamera("in")}>Zoom +</button>
          <button type="button" onClick={() => zoomCamera("out")}>Zoom -</button>
        </div>
        <div style={{ display: "flex", gap: "0.35rem" }}>
          <button type="button" onClick={() => rotateCamera(0.15, 0)}>Rotar ↺</button>
          <button type="button" onClick={() => rotateCamera(-0.15, 0)}>Rotar ↻</button>
        </div>
        <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
          <button type="button" onClick={() => panCamera(1, 0)}>←</button>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <button type="button" onClick={() => panCamera(0, -1)}>↑</button>
            <button type="button" onClick={() => panCamera(0, 1)}>↓</button>
          </div>
          <button type="button" onClick={() => panCamera(-1, 0)}>→</button>
        </div>
      </div>

      <div ref={mountRef} style={{ width: "100%", height: "100%", flex: 1, minHeight: "480px" }} />
    </div>
  );
};
