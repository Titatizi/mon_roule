/* =================================================================
   product-stories.js
   Configuración declarativa de cada "product story". Agregar un
   producto nuevo = agregar un objeto a este array — el motor
   (js/product-story-engine.js) no tiene ninguna lógica específica de
   producto adentro.

   Campos: slug, renderer ("layered"|"image-sequence"), disabled,
   theme.accent, section.heightVh(+heightVhDesktop opcional), layers
   (background/topView/perspectiveView/crossfade/gadgets) para
   "layered", sequence para "image-sequence" (ver
   js/renderers/image-sequence-renderer.js — todavía stub), motion
   (mismo shape que ya usaba js/lemon-motion.js), narrativeFade +
   narrative[] (momentos de copy con eyebrow/title/cta).
   ================================================================= */

const INSTAGRAM_URL = "https://www.instagram.com/mon_roule/";

// Valores de trayectoria/movimiento aprobados para Lemon (ver
// docs/PRODUCT-SCROLL-STORY.md). Se reutilizan como base para los
// productos preparados-pero-no-activos, para que al activarlos algún
// día solo haga falta cambiar posiciones puntuales si hace falta.
const BASE_MOTION = {
  entryEnd: 0.24, heroArrival: 0.30, spinEnd: 0.36, heroEnd: 0.82, exitEnd: 1,
  spinDegrees: 180, entryRotation: 0, exitRotation: 0,
  base: 0.62, heroZoom: 1.30, presentationDriftPct: 0.8,
  trajectory: {
    entry: { x: 220, y: 58 },
    entryControl: { x: 60, y: 20 },
    heroTarget: { x: 50, y: 44 },
    exitControl: { x: 8, y: 58 },
    exit: { x: -28, y: 70 }
  }
};

export const PRODUCT_STORIES = [
  {
    slug: "lemon",
    renderer: "layered",
    disabled: false,

    theme: { accent: "#D4A017" },
    section: { heightVh: 400, heightVhDesktop: 320 },

    layers: {
      background: { src: "img_master/lemon-background.webp", alt: "" },
      topView: { src: "img/lemon-pie-continuous/cutout-alpha.webp", alt: "" },
      // No existe vista en perspectiva todavía — el crossfade queda
      // inactivo hasta que haya un asset aprobado (ver layered-renderer.js).
      perspectiveView: null,
      crossfade: { start: 0.30, end: 0.36 },
      gadgets: []
    },

    sequence: null,

    motion: BASE_MOTION,

    narrativeFade: 0.03,
    narrative: [
      { start: 0.36, end: 0.48, eyebrow: "A pedido", title: "Lemon pie", cta: null },
      { start: 0.48, end: 0.60, eyebrow: "Crema de limón", title: "Intensa y equilibrada", cta: null },
      { start: 0.60, end: 0.72, eyebrow: "Merengue tostado", title: "Suave por dentro", cta: null },
      { start: 0.72, end: 0.82, eyebrow: "Hecho artesanalmente en CABA", title: null, cta: { label: "Consultar por Instagram", href: INSTAGRAM_URL } }
    ]
  },

  {
    slug: "frutos-rojos",
    renderer: "layered",
    // Preparado, NO activo: falta vista en perspectiva aprobada y
    // gadgets propios. No activar solo porque el cutout tenga alfa
    // válido — así lo pidió el usuario explícitamente.
    disabled: true,

    theme: { accent: "#8C1F3B" },
    section: { heightVh: 400, heightVhDesktop: 320 },

    layers: {
      background: { src: "img_master/torta-frutos-rojos-background.webp", alt: "" },
      topView: { src: "img/torta-frutos-rojos-continuous/cutout-alpha.png", alt: "" },
      // FALTA: vista final en perspectiva. Nombre/formato esperado:
      //   img/torta-frutos-rojos-continuous/perspective-alpha.webp
      perspectiveView: null,
      crossfade: { start: 0.30, end: 0.36 },
      // FALTAN: gadgets como capas PNG/WebP transparentes propias (ej.
      // una frutilla o una hoja suelta) — ninguno existe hoy.
      gadgets: []
    },

    sequence: null,

    motion: BASE_MOTION,

    narrativeFade: 0.03,
    narrative: [
      { start: 0.36, end: 0.48, eyebrow: "A pedido", title: "Frutos rojos", cta: null },
      { start: 0.72, end: 0.82, eyebrow: "Hecho artesanalmente en CABA", title: null, cta: { label: "Consultar por Instagram", href: INSTAGRAM_URL } }
    ]
  },

  {
    slug: "chocolate",
    renderer: "layered",
    // Preparado, NO activo: no hay ningún asset todavía.
    disabled: true,

    theme: { accent: "#4A2C1D" },
    section: { heightVh: 400, heightVhDesktop: 320 },

    layers: {
      // FALTAN todos los assets. Convención esperada (misma que
      // lemon/frutos-rojos):
      //   fondo:  img_master/chocolate-background.webp
      //   cutout: img/chocolate-continuous/cutout-alpha.webp (con canal alfa real)
      background: { src: null, alt: "" },
      topView: { src: null, alt: "" },
      perspectiveView: null,
      crossfade: { start: 0.30, end: 0.36 },
      gadgets: []
    },

    sequence: null,

    motion: BASE_MOTION,

    narrativeFade: 0.03,
    narrative: [
      { start: 0.36, end: 0.48, eyebrow: "A pedido", title: "Chocolate", cta: null },
      { start: 0.72, end: 0.82, eyebrow: "Hecho artesanalmente en CABA", title: null, cta: { label: "Consultar por Instagram", href: INSTAGRAM_URL } }
    ]
  }
];
