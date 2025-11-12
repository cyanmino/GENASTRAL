# GENASTRAL 3D (PWA)

Aplicación web offline para generar y visualizar cartas astrales en un mandala 3D interactivo. Todo el flujo (cálculo de planetas, casas, aspectos y render) ocurre en el navegador y puede instalarse como PWA para usar sin conexión.

## Características

- **Formularios** para definir fecha, hora, zona horaria y coordenadas manuales (se evita depender de geocodificación online).
- **Motor astrológico en TypeScript**: usa `astronomy-engine` para planetas tradicionales y un solver kepleriano ligero para asteroides/puntos adicionales (Ceres, Pallas, Juno, Vesta, Quirón, Folo, Fama, Aura y Rockefellia). Se calculan dodecatemorias, casas (modelo igualado/whole sign) y aspectos mayores configurables.
- **Puntos matemáticos**: Lilith (aprox. media), Parte de la Fortuna (día/noche) y Vértice.
- **Visualización 3D con Three.js**: rueda zodiacal, divisiones de casas, capas conmutables para planetas/asteroides/puntos/aspectos/etiquetas y exportación directa a PNG.
- **Gestor de perfiles offline**: guarda múltiples cartas en `localStorage`, con carga/borrado inmediato.
- **PWA lista para instalar** gracias a `vite-plugin-pwa` y manifiesto incluido.

> ⚠️ **Limitaciones actuales**
>
> - El cálculo de casas Placidus/Koch aún emplea una aproximación igualada (igual-spaced). La estructura está lista para mejorar este módulo con algoritmos precisos.
> - Las efemérides de asteroides secundarios usan elementos orbitales simplificados; para máxima precisión sustituye los valores en `src/lib/astro/minorBodies.ts` con elementos actualizados.
> - Lilith y Vértice se calculan con aproximaciones estándar (media/opuesta y asc + 90°). Puedes reemplazar el módulo en `src/lib/astro/points.ts` si necesitas versiones “oscilantes” o vertex más estricto.

## Requisitos

- Node.js 18+ y npm

## Instalación

```bash
npm install
npm run dev    # abre http://localhost:5173
```

Para compilar la PWA y servirla como estático:

```bash
npm run build
npm run preview
```

## Uso

1. Ingresa tus datos natales en el panel izquierdo (latitud/longitud expresadas en grados decimales).  
2. Selecciona el sistema de casas (actualmente se aproxima como equal/whole sign).  
3. Pulsa **“Generar carta”** para recomputar planetas, casas, puntos y aspectos.  
4. Usa los toggles de capas para mostrar/ocultar planetas, asteroides, puntos, aspectos, etiquetas y dodecatemorias.  
5. Interactúa con el mandala 3D (zoom y rotación con OrbitControls).  
6. Guarda el perfil si quieres recuperarlo sin volver a escribir los datos.  
7. Exporta el render como PNG desde el botón del canvas.  
8. Instala la PWA desde el navegador para uso completamente offline (primer cargada requerirá red para descargar los assets).  

## Estructura del código

```
src/
├── App.tsx                     # Layout principal
├── components/                 # UI (formularios, toggles, canvas 3D, etc.)
├── lib/
│   ├── astro/                  # Módulo de cálculo astrológico
│   │   ├── chartBuilder.ts     # Orquestador de cálculo
│   │   ├── planets.ts          # Planetas mayores (astronomy-engine)
│   │   ├── minorBodies.ts      # Solver kepleriano para asteroides/puntos extra
│   │   ├── houses.ts           # Cálculo de casas (equal/whole sign)
│   │   ├── aspects.ts          # Aspectos mayores
│   │   ├── points.ts           # Lilith, Fortuna, Vértice
│   │   └── time.ts             # Conversión local→UTC→JD
│   ├── config.ts               # Signos, aspectos y capas por defecto
│   └── storage.ts              # Utilidades de perfiles offline
├── state/chartStore.ts         # Zustand store (inputs, resultados, capas)
├── styles/index.css            # Estilos globales
└── types/astro.ts              # Tipos compartidos
```

## Próximos pasos sugeridos

1. Sustituir `houses.ts` por un algoritmo Placidus/Koch de alta fidelidad (semiares, Swiss Ephemeris WASM, etc.).  
2. Ajustar los elementos orbitales de `minorBodies.ts` con datos MPC/JPL actualizados o enlazar un módulo WASM oficial.  
3. Añadir cálculo de zodíaco sideral real (ayanamsa configurable).  
4. Integrar tooltips/hover avanzados con interpretación y leyendas.  
5. Añadir localización multi idioma e incrementar accesibilidad (modo alto contraste, soporte teclado).  

## Licencia

MIT. Usa y adapta el código libremente, mencionando la autoría cuando corresponda. Contributions welcome.*** End Patch
