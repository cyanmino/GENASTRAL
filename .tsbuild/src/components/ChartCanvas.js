"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartCanvas = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const THREE = __importStar(require("three"));
const OrbitControls_1 = require("three/examples/jsm/controls/OrbitControls");
const chartStore_1 = require("../state/chartStore");
const config_1 = require("../lib/config");
const DEG2RAD = Math.PI / 180;
const PLANET_COLORS = {
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
const ASPECT_COLOR_MAP = config_1.ASPECTS.reduce((acc, aspect) => {
    acc[aspect.label] = aspect.color;
    return acc;
}, {});
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
const normalizeAngle = (value) => {
    const mod = value % 360;
    return mod < 0 ? mod + 360 : mod;
};
const positiveSpan = (start, end) => {
    let span = normalizeAngle(end - start);
    if (span <= 0)
        span += 360;
    return span;
};
const getBaseId = (id) => id.replace(/^transit-/, "");
const getDisplayName = (body) => {
    const baseId = getBaseId(body.id);
    const baseLabel = config_1.BODY_LABELS[baseId] ?? body.label;
    return body.isTransit ? `Tr\u00e1nsito ${baseLabel}` : baseLabel;
};
const colorForBody = (body) => {
    if (body.isTransit) {
        return 0xc084fc;
    }
    if (body.category === "planet") {
        return PLANET_COLORS[body.id] ?? 0x93c5fd;
    }
    if (body.category === "asteroid")
        return 0x94a3b8;
    return 0xf472b6;
};
const shiftLongitude = (longitude, offset) => normalizeAngle(longitude - offset);
const polarAngle = (displayLongitude) => (90 - displayLongitude) * DEG2RAD;
const positionFromDisplay = (displayLongitude, radius) => {
    const angle = polarAngle(displayLongitude);
    return new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
};
const angleToPosition = (longitude, radius, offset) => {
    const display = shiftLongitude(longitude, offset);
    return positionFromDisplay(display, radius);
};
const disposeChartGroup = (group) => {
    const textures = Array.isArray(group.userData?.textures) ? group.userData.textures : [];
    group.traverse((child) => {
        const mesh = child;
        if (mesh.geometry) {
            mesh.geometry.dispose();
        }
        const material = mesh.material;
        if (Array.isArray(material)) {
            material.forEach((mat) => mat && mat.dispose());
        }
        else if (material) {
            material.dispose();
        }
    });
    textures.forEach((texture) => texture.dispose());
    group.userData.textures = [];
};
const expandCusps = (cusps) => {
    if (!cusps.length)
        return [];
    const expanded = new Array(cusps.length);
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
const makeTextSprite = (text, fontSize = 28, color = "#e2e8f0", registerTexture) => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
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
const makeFlatLabel = (text, registerTexture) => {
    const canvas = document.createElement("canvas");
    canvas.width = 192;
    canvas.height = 192;
    const ctx = canvas.getContext("2d");
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
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(15, 15), material);
    plane.rotation.x = -Math.PI / 2;
    return plane;
};
const getGeometryForBody = (body) => {
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
const layerAllows = (body, layers, visibleBodies) => {
    const baseId = getBaseId(body.id);
    if (visibleBodies[baseId] === false)
        return false;
    if (body.category === "planet")
        return layers.planets;
    if (body.category === "asteroid")
        return layers.asteroids;
    return layers.points;
};
const createChartGroup = (chart, layers, visibleBodies) => {
    const group = new THREE.Group();
    const positions = new Map();
    const rotating = [];
    const textures = [];
    const registerTexture = (texture) => {
        textures.push(texture);
        return texture;
    };
    const planetRadius = 110;
    const asteroidRadius = 120;
    const pointRadius = 95;
    const transitRadius = planetRadius + 25;
    const baseRadius = 140;
    const ascendant = chart.houses[0] ?? 0;
    const offset = normalizeAngle(ascendant - 270);
    const baseRing = new THREE.Mesh(new THREE.RingGeometry(baseRadius - 5, baseRadius, 128), new THREE.MeshBasicMaterial({
        color: 0x1d4ed8,
        side: THREE.DoubleSide,
        opacity: 0.25,
        transparent: true
    }));
    baseRing.rotation.x = Math.PI / 2;
    group.add(baseRing);
    // sign segments
    const signRing = new THREE.Group();
    const signBoundaries = new THREE.Group();
    for (let i = 0; i < 12; i++) {
        const startLon = i * 30;
        const startDisplay = shiftLongitude(startLon, offset);
        const wedge = new THREE.Mesh(new THREE.RingGeometry(baseRadius - 12, baseRadius - 4, 64, 1, polarAngle(startDisplay), 30 * DEG2RAD), new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? 0x14213d : 0x0b1120,
            opacity: 0.35,
            transparent: true,
            side: THREE.DoubleSide
        }));
        wedge.rotation.x = Math.PI / 2;
        signRing.add(wedge);
        const inner = positionFromDisplay(startDisplay, baseRadius - 12);
        const outer = positionFromDisplay(startDisplay, baseRadius - 4);
        const geom = new THREE.BufferGeometry().setFromPoints([inner, outer]);
        const divider = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.8 }));
        signBoundaries.add(divider);
    }
    group.add(signRing);
    group.add(signBoundaries);
    const expandedCusps = expandCusps(chart.houses);
    const houseRing = new THREE.Group();
    const houseSegments = expandedCusps.map((start, index) => {
        const endIndex = index === expandedCusps.length - 1 ? 0 : index + 1;
        const end = expandedCusps[endIndex] + (endIndex === 0 ? 360 : 0);
        return { index, start, end, span: end - start };
    });
    houseSegments.forEach((segment) => {
        const startDisplayAbs = segment.start - offset;
        const wedgeStart = normalizeAngle(startDisplayAbs);
        const wedge = new THREE.Mesh(new THREE.RingGeometry(baseRadius - 18, baseRadius - 12, 64, 1, polarAngle(wedgeStart), segment.span * DEG2RAD), new THREE.MeshBasicMaterial({
            color: segment.index % 2 === 0 ? 0x475569 : 0x1f2937,
            opacity: 0.14,
            transparent: true,
            side: THREE.DoubleSide
        }));
        wedge.rotation.x = Math.PI / 2;
        houseRing.add(wedge);
    });
    group.add(houseRing);
    const addBody = (body, radius, elevate = 2) => {
        if (!layerAllows(body, layers, visibleBodies))
            return;
        const position = angleToPosition(body.longitude, radius, offset);
        positions.set(body.id, position);
        const geometry = getGeometryForBody(body);
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
            color: colorForBody(body),
            emissive: body.isTransit ? 0x4c1d95 : 0x111111
        }));
        mesh.position.copy(position);
        mesh.position.y = elevate;
        if (body.isTransit || body.category !== "planet") {
            rotating.push(mesh);
        }
        group.add(mesh);
        if (body.id === "Saturn") {
            const ring = new THREE.Mesh(new THREE.RingGeometry(6, 9, 32), new THREE.MeshStandardMaterial({
                color: 0xfcd34d,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7
            }));
            ring.rotation.x = Math.PI / 2.8;
            mesh.add(ring);
        }
        if (layers.labels) {
            const label = makeTextSprite(`${getDisplayName(body)} ${body.degreeInSign}\u00B0`, 28, "#e2e8f0", registerTexture);
            label.position.copy(position.clone().setY(mesh.position.y + 15));
            group.add(label);
        }
    };
    chart.bodies.forEach((body) => {
        const radius = body.category === "planet"
            ? planetRadius
            : body.category === "asteroid"
                ? asteroidRadius
                : pointRadius;
        addBody(body, radius, body.category === "point" ? 6 : 2);
    });
    (chart.transits ?? []).forEach((body) => {
        addBody(body, transitRadius, 8);
    });
    houseSegments.forEach((segment) => {
        const startDisplayAbs = segment.start - offset;
        const startDisplay = normalizeAngle(startDisplayAbs);
        const endVec = positionFromDisplay(startDisplay, baseRadius);
        const geom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), endVec]);
        group.add(new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.4 })));
        const midDisplay = normalizeAngle(startDisplayAbs + segment.span / 2);
        const numberSprite = makeFlatLabel(`${segment.index + 1}`, registerTexture);
        const numberPos = positionFromDisplay(midDisplay, baseRadius - 24);
        numberSprite.position.copy(numberPos.clone().setY(0.5));
        group.add(numberSprite);
    });
    for (let signIndex = 0; signIndex < 12; signIndex++) {
        const angle = signIndex * 30 + 15;
        const signSprite = makeTextSprite(SIGN_LABELS[signIndex], 26, "#cbd5f5", registerTexture);
        const signPos = positionFromDisplay(shiftLongitude(angle, offset), baseRadius + 32);
        signSprite.position.copy(signPos.clone().setY(4));
        group.add(signSprite);
    }
    chart.aspects.forEach((aspect) => {
        const from = positions.get(aspect.bodyA);
        const to = positions.get(aspect.bodyB);
        if (!from || !to)
            return;
        const geom = new THREE.BufferGeometry().setFromPoints([from, to]);
        const material = new THREE.LineDashedMaterial({
            color: ASPECT_COLOR_MAP[aspect.label] ?? 0x38bdf8,
            dashSize: 4,
            gapSize: 2
        });
        const line = new THREE.Line(geom, material);
        line.computeLineDistances();
        group.add(line);
    });
    group.userData.textures = textures;
    return { group, positions, rotating };
};
const ChartCanvas = () => {
    const mountRef = (0, react_1.useRef)(null);
    const rendererRef = (0, react_1.useRef)();
    const sceneRef = (0, react_1.useRef)();
    const controlsRef = (0, react_1.useRef)();
    const cameraRef = (0, react_1.useRef)();
    const rotatingRef = (0, react_1.useRef)([]);
    const chart = (0, chartStore_1.useChartStore)((state) => state.chart);
    const layers = (0, chartStore_1.useChartStore)((state) => state.layers);
    const visibleBodies = (0, chartStore_1.useChartStore)((state) => state.visibleBodies);
    const fullscreen = (0, chartStore_1.useChartStore)((state) => state.fullscreen);
    const toggleFullscreen = (0, chartStore_1.useChartStore)((state) => state.toggleFullscreen);
    (0, react_1.useEffect)(() => {
        document.body.style.overflow = fullscreen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [fullscreen]);
    (0, react_1.useEffect)(() => {
        if (!mountRef.current)
            return;
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }
        const fallbackWidth = fullscreen ? window.innerWidth : mountRef.current.clientWidth || 640;
        const fallbackHeight = fullscreen ? window.innerHeight : mountRef.current.clientHeight || 480;
        const width = fallbackWidth;
        const height = fallbackHeight;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x030712);
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 160, 260);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;
        const controls = new OrbitControls_1.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.minDistance = 120;
        controls.maxDistance = 400;
        controls.maxPolarAngle = Math.PI / 1.8;
        controls.target.set(0, 0, 0);
        controls.update();
        controlsRef.current = controls;
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(0, 200, 100);
        scene.add(ambient, dir);
        sceneRef.current = scene;
        const handleResize = () => {
            if (!rendererRef.current || !cameraRef.current || !mountRef.current)
                return;
            const w = fullscreen ? window.innerWidth : mountRef.current.clientWidth || 640;
            const h = fullscreen ? window.innerHeight : mountRef.current.clientHeight || 480;
            rendererRef.current.setSize(w, h);
            cameraRef.current.aspect = w / h;
            cameraRef.current.updateProjectionMatrix();
        };
        window.addEventListener("resize", handleResize);
        const animate = () => {
            requestAnimationFrame(animate);
            rotatingRef.current.forEach((mesh) => {
                mesh.rotation.y += 0.01;
            });
            controls.update();
            renderer.render(scene, camera);
        };
        animate();
        return () => {
            window.removeEventListener("resize", handleResize);
            if (mountRef.current && renderer.domElement.parentElement === mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            controls.dispose();
        };
    }, [fullscreen]);
    (0, react_1.useEffect)(() => {
        if (!sceneRef.current)
            return;
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
        }
        else {
            rotatingRef.current = [];
        }
    }, [chart, layers, visibleBodies]);
    const exportImage = () => {
        if (!rendererRef.current)
            return;
        const dataUrl = rendererRef.current.domElement.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "genastral-chart.png";
        link.click();
    };
    const resetView = () => {
        if (!controlsRef.current || !cameraRef.current)
            return;
        cameraRef.current.position.set(0, 160, 260);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
    };
    const zoomCamera = (direction) => {
        const controls = controlsRef.current;
        if (!controls)
            return;
        if (direction === "in") {
            controls.dollyIn?.(1.1);
        }
        else {
            controls.dollyOut?.(1.1);
        }
        controls.update();
    };
    const rotateCamera = (az, el) => {
        const controls = controlsRef.current;
        if (!controls)
            return;
        if (az !== 0)
            controls.rotateLeft(az);
        if (el !== 0)
            controls.rotateUp(el);
        controls.update();
    };
    const panCamera = (xDir, yDir) => {
        const controls = controlsRef.current;
        if (!controls)
            return;
        const step = 5;
        controls.panLeft?.(xDir * step);
        controls.panUp?.(yDir * step);
        controls.update();
    };
    const containerStyle = fullscreen
        ? { position: "fixed", inset: 0, zIndex: 50, padding: "1rem", background: "#020617" }
        : { position: "relative", minHeight: "500px" };
    if (!chart) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "panel", style: containerStyle, children: (0, jsx_runtime_1.jsx)("div", { style: {
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                    textAlign: "center",
                    fontSize: "1rem"
                }, children: "Selecciona o crea un perfil para visualizar el mandala." }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "panel", style: containerStyle, children: [(0, jsx_runtime_1.jsx)("div", { style: { position: "absolute", top: "1rem", left: "1rem", zIndex: 3, display: "flex", gap: "0.5rem" }, children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: toggleFullscreen, children: fullscreen ? "Cerrar pantalla completa" : "Pantalla completa" }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: exportImage, style: { position: "absolute", right: "1rem", top: "1rem", zIndex: 3 }, children: "Exportar PNG" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: resetView, style: { position: "absolute", left: "1rem", bottom: "1rem", zIndex: 3 }, children: "Restablecer vista" }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    position: "absolute",
                    right: "1rem",
                    bottom: "1rem",
                    zIndex: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem"
                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", gap: "0.35rem" }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => zoomCamera("in"), children: "Zoom +" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => zoomCamera("out"), children: "Zoom -" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", gap: "0.35rem" }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => rotateCamera(0.15, 0), children: "Rotar \u21BA" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => rotateCamera(-0.15, 0), children: "Rotar \u21BB" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", gap: "0.35rem", alignItems: "center" }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => panCamera(1, 0), children: "\u2190" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: "0.35rem" }, children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => panCamera(0, -1), children: "\u2191" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => panCamera(0, 1), children: "\u2193" })] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => panCamera(-1, 0), children: "\u2192" })] })] }), (0, jsx_runtime_1.jsx)("div", { ref: mountRef, style: { width: "100%", height: "100%" } })] }));
};
exports.ChartCanvas = ChartCanvas;
