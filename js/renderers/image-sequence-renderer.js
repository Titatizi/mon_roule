/* =================================================================
   image-sequence-renderer.js
   INTERFAZ / STUB — sin implementación real todavía.
   Ningún producto en data/product-stories.js usa renderer:
   "image-sequence" por ahora. Cuando exista una secuencia real para
   probar, implementar acá: canvas responsive, preload progresivo con
   prioridad a frames cercanos al progreso actual, cache con límite de
   memoria (LRU), fallback si falta un frame ("hold-last"), resize
   seguro (solo redimensiona canvas + redibuja desde cache, no
   recarga), reduced-motion (dibujar directo el último frame sin
   precargar el resto), y no arrancar ninguna carga hasta que la
   sección esté cerca del viewport (mismo IntersectionObserver que ya
   usa el motor para pausar trabajo).

   Shape esperado de config.sequence (documentado, no implementado):
   {
     framePathTemplate: "img/<slug>-seq/frame-{n}.webp", // {n} con padding
     frameCount, frameStart,
     canvas: { width, height, aspectRatio },
     preload: { eager, windowRadius, maxCachedFrames },
     fallback: { onMissingFrame: "hold-last" | "hide" }
   }
   ================================================================= */

export function buildImageSequenceDOM(config) {
  const { sequence, slug, section } = config;
  if (!sequence || !sequence.framePathTemplate || !sequence.frameCount || !sequence.canvas) {
    console.warn(`product-story-engine: config.sequence inválida o incompleta para "${slug}" — story omitida.`);
    return null;
  }

  const root = document.createElement("section");
  root.className = "story story--image-sequence";
  root.dataset.story = slug;
  root.style.setProperty("--story-height", `${section.heightVh}vh`);
  root.style.setProperty("--story-height-desktop", `${section.heightVhDesktop || section.heightVh}vh`);

  const sticky = document.createElement("div");
  sticky.className = "story__sticky";

  const canvas = document.createElement("canvas");
  canvas.className = "story__sequence-canvas";
  canvas.width = sequence.canvas.width;
  canvas.height = sequence.canvas.height;

  const copy = document.createElement("div");
  copy.className = "story__copy";

  sticky.append(canvas, copy);
  root.appendChild(sticky);

  console.warn(
    `product-story-engine: renderer "image-sequence" para "${slug}" es un stub sin implementar ` +
    `(preload/canvas/LRU pendientes) — la sección se genera pero no anima frames todavía.`
  );

  return { root, sticky, canvas, copy };
}

export function renderImageSequenceFrame(_dom, _config, _progress) {
  // No-op a propósito: implementar cuando haya una secuencia real que probar.
}
