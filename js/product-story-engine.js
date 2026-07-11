/* =================================================================
   product-story-engine.js
   Orquestador genérico de "product stories". Lee data/product-stories.js,
   genera el DOM de cada story activa (renderer.build), y en cada tick
   de scroll llama al render por-frame que corresponda (renderer.render).
   No hay lógica de ningún producto puntual acá — todo lo que varía por
   producto vive en data/product-stories.js.
   ================================================================= */

import { PRODUCT_STORIES } from "../data/product-stories.js";
import { buildLayeredDOM, renderLayeredFrame } from "./renderers/layered-renderer.js";
import { buildImageSequenceDOM, renderImageSequenceFrame } from "./renderers/image-sequence-renderer.js";

const RENDERERS = {
  layered: { build: buildLayeredDOM, render: renderLayeredFrame },
  "image-sequence": { build: buildImageSequenceDOM, render: renderImageSequenceFrame }
};

function progressFor(sectionEl) {
  const rect = sectionEl.getBoundingClientRect();
  const distance = sectionEl.offsetHeight - window.innerHeight;
  if (distance <= 0) return 0;
  return Math.max(0, Math.min(1, -rect.top / distance));
}

function initProductStories() {
  const container = document.getElementById("product-stories");
  if (!container) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const activeConfigs = PRODUCT_STORIES.filter((s) => !s.disabled);

  const instances = activeConfigs
    .map((config) => {
      const renderer = RENDERERS[config.renderer];
      if (!renderer) {
        console.warn(`product-story-engine: renderer desconocido "${config.renderer}" para "${config.slug}"`);
        return null;
      }
      const dom = renderer.build(config, reducedMotion);
      if (!dom) return null;
      container.appendChild(dom.root);
      return { config, dom, renderer };
    })
    .filter(Boolean);

  // Con reduced-motion, build() ya dejó el estado final estático fijo
  // (ver layered-renderer.js) — no hace falta ningún loop de scroll.
  if (reducedMotion || instances.length === 0) return;

  // Pausa el trabajo de cada story mientras está fuera de viewport (y
  // controla animation-play-state de los gadgets idle vía CSS, sin
  // sumarlos al rAF compartido).
  const visible = new Set();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const inst = instances.find((i) => i.dom.root === entry.target);
        if (!inst) return;
        if (entry.isIntersecting) visible.add(inst);
        else visible.delete(inst);
        inst.dom.root.classList.toggle("is-in-view", entry.isIntersecting);
      });
    },
    { rootMargin: "20% 0px 20% 0px" }
  );
  instances.forEach((inst) => io.observe(inst.dom.root));

  let scheduled = false;
  function renderAll() {
    visible.forEach((inst) => {
      const progress = progressFor(inst.dom.root);
      inst.renderer.render(inst.dom, inst.config, progress);
    });
    scheduled = false;
  }
  function scheduleRender() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(renderAll);
  }

  window.addEventListener("scroll", scheduleRender, { passive: true });
  window.addEventListener("resize", scheduleRender, { passive: true });
  scheduleRender();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProductStories, { once: true });
} else {
  initProductStories();
}
