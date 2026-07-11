/* =================================================================
   layered-renderer.js
   Renderer "layered": fondo + producto (imagen con alfa) que se
   mueve/rota/escala con el scroll vía computeTransform — reusado tal
   cual desde js/lemon-motion.js, sin duplicar la matemática. Soporta
   opcionalmente una segunda vista (perspectiveView) con crossfade
   entre ambas, y "gadgets" (capas transparentes con idle sutil por
   CSS, no por rAF — ver css/product-story.css).
   ================================================================= */

import { computeTransform } from "../lemon-motion.js";

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function textStateFor(progress, narrative, fade) {
  for (const beat of narrative) {
    if (progress >= beat.start && progress < beat.end) {
      const inT = Math.min(1, (progress - beat.start) / fade);
      const outT = Math.min(1, (beat.end - progress) / fade);
      return {
        beat,
        opacity: Math.min(easeInOutCubic(inT), easeInOutCubic(outT)),
        offsetY: 8 * (1 - easeInOutCubic(inT))
      };
    }
  }
  return null;
}

function applyBeat(dom, beat) {
  dom.eyebrow.textContent = beat.eyebrow;
  if (beat.cta) {
    dom.title.style.display = "none";
    dom.cta.textContent = beat.cta.label;
    dom.cta.href = beat.cta.href;
    dom.cta.style.display = "inline-block";
  } else {
    dom.title.textContent = beat.title;
    dom.title.style.display = "";
    dom.cta.style.display = "none";
  }
}

export function buildLayeredDOM(config, reducedMotion) {
  const { slug, theme, section, layers } = config;

  const root = document.createElement("section");
  root.className = "story story--layered";
  root.dataset.story = slug;
  root.id = `story-${slug}`;
  root.style.setProperty("--story-height", `${section.heightVh}vh`);
  root.style.setProperty("--story-height-desktop", `${section.heightVhDesktop || section.heightVh}vh`);
  if (theme && theme.accent) root.style.setProperty("--story-accent", theme.accent);

  const sticky = document.createElement("div");
  sticky.className = "story__sticky";

  const bg = document.createElement("div");
  bg.className = "story__layer story__layer--bg";
  if (layers.background && layers.background.src) {
    bg.style.setProperty("--story-bg-image", `url("${layers.background.src}")`);
  }

  const product = document.createElement("div");
  product.className = "story__product";

  const topImg = document.createElement("img");
  topImg.className = "story__product-view story__product-view--top";
  topImg.alt = (layers.topView && layers.topView.alt) || "";
  if (layers.topView && layers.topView.src) topImg.src = layers.topView.src;
  product.appendChild(topImg);

  // El crossfade a vista en perspectiva SOLO se activa si el asset
  // existe Y está marcado como aprobado — nunca "porque el campo no es
  // null". Evita inventar una transición sin foto real.
  const hasPerspective = !!(
    layers.perspectiveView &&
    layers.perspectiveView.src &&
    layers.perspectiveView.approved
  );
  let perspectiveImg = null;
  if (hasPerspective) {
    perspectiveImg = document.createElement("img");
    perspectiveImg.className = "story__product-view story__product-view--perspective";
    perspectiveImg.alt = layers.perspectiveView.alt || "";
    perspectiveImg.src = layers.perspectiveView.src;
    perspectiveImg.style.opacity = "0";
    product.appendChild(perspectiveImg);
  }

  const gadgetEls = (layers.gadgets || []).map((gadget) => {
    const g = document.createElement("img");
    g.className = "story__gadget";
    g.alt = "";
    g.src = gadget.src;
    g.style.setProperty("--gadget-x", `${gadget.offset.x}%`);
    g.style.setProperty("--gadget-y", `${gadget.offset.y}%`);
    g.style.setProperty("--gadget-scale", gadget.scale);
    g.style.setProperty("--gadget-rot", `${gadget.rotationDeg}deg`);
    g.style.setProperty("--gadget-idle-t-x", `${gadget.idle.translateAmp.x}%`);
    g.style.setProperty("--gadget-idle-t-y", `${gadget.idle.translateAmp.y}%`);
    g.style.setProperty("--gadget-idle-r", `${gadget.idle.rotateAmp}deg`);
    g.style.setProperty("--gadget-idle-s", gadget.idle.scaleAmp);
    g.style.setProperty("--gadget-idle-duration", `${gadget.idle.periodMs}ms`);
    g.style.setProperty("--gadget-idle-delay", `${-(gadget.idle.phaseOffset * gadget.idle.periodMs)}ms`);
    g.style.zIndex = String(gadget.depth || 0);
    return g;
  });

  const copy = document.createElement("div");
  copy.className = "story__copy";
  const eyebrow = document.createElement("p");
  eyebrow.className = "story__eyebrow";
  const title = document.createElement("h2");
  title.className = "story__title";
  const cta = document.createElement("a");
  cta.className = "story__cta js-instagram-link";
  cta.style.display = "none";
  cta.rel = "noopener";
  cta.target = "_blank";
  copy.append(eyebrow, title, cta);

  sticky.append(bg, product, ...gadgetEls, copy);
  root.appendChild(sticky);

  const dom = { root, sticky, product, topImg, perspectiveImg, copy, eyebrow, title, cta, hasPerspective, activeBeatStart: null };

  if (reducedMotion) {
    const finalT = computeTransform(1, config.motion);
    dom.product.style.transform =
      `translate3d(${(finalT.x - 50).toFixed(3)}%, ${(finalT.y - 50).toFixed(3)}%, 0) ` +
      `rotate(${finalT.rotationDeg.toFixed(2)}deg) scale(${finalT.scale.toFixed(4)})`;
    if (dom.hasPerspective) dom.perspectiveImg.style.opacity = "1";
    const last = config.narrative[config.narrative.length - 1];
    applyBeat(dom, last);
    dom.copy.style.opacity = "1";
    dom.copy.classList.add("is-static");
  }

  return dom;
}

export function renderLayeredFrame(dom, config, progress) {
  const t = computeTransform(progress, config.motion);

  dom.product.style.transform =
    `translate3d(${(t.x - 50).toFixed(3)}%, ${(t.y - 50).toFixed(3)}%, 0) ` +
    `rotate(${t.rotationDeg.toFixed(2)}deg) scale(${t.scale.toFixed(4)})`;

  if (dom.hasPerspective) {
    const { start, end } = config.layers.crossfade;
    const localT = Math.max(0, Math.min(1, (progress - start) / (end - start || 1)));
    dom.topImg.style.opacity = String(1 - localT);
    dom.perspectiveImg.style.opacity = String(localT);
  }

  const state = textStateFor(progress, config.narrative, config.narrativeFade || 0.03);
  if (!state) {
    dom.copy.style.opacity = "0";
    return;
  }
  if (dom.activeBeatStart !== state.beat.start) {
    dom.activeBeatStart = state.beat.start;
    applyBeat(dom, state.beat);
  }
  dom.copy.style.opacity = state.opacity.toFixed(3);
  dom.copy.style.transform = `translateY(${state.offsetY.toFixed(2)}px)`;
}
