import { computeTransform, easeInOutCubic } from './lemon-motion.js';

const motion = {
  entryEnd: 0.24,
  heroArrival: 0.30,
  spinEnd: 0.36,
  heroEnd: 0.82,
  exitEnd: 1,
  spinDegrees: 180,
  entryRotation: 0,
  exitRotation: 0,
  base: 0.62,
  heroZoom: 1.30,
  presentationDriftPct: 0.8,
  trajectory: {
    entry: { x: 220, y: 58 },
    entryControl: { x: 60, y: 20 },
    heroTarget: { x: 50, y: 44 },
    exitControl: { x: 8, y: 58 },
    exit: { x: -28, y: 70 }
  }
};

const textBlocks = [
  { start: 0.36, end: 0.48, eyebrow: 'A pedido', title: 'Lemon pie', cta: false },
  { start: 0.48, end: 0.60, eyebrow: 'Crema de limón', title: 'Intensa y equilibrada', cta: false },
  { start: 0.60, end: 0.72, eyebrow: 'Merengue tostado', title: 'Suave por dentro', cta: false },
  { start: 0.72, end: 0.82, eyebrow: 'Hecho artesanalmente en CABA', title: '', cta: true }
];

const fade = 0.03;
const clamp01 = (value) => Math.max(0, Math.min(1, value));

function initLemonStory() {
  const act = document.getElementById('acto-lemon');
  const product = document.getElementById('lemonProduct');
  const copy = document.getElementById('lemonCopy');
  const eyebrow = document.getElementById('lemonEyebrow');
  const title = document.getElementById('lemonTitle');
  const cta = document.getElementById('lemonCta');

  if (!act || !product || !copy || !eyebrow || !title || !cta) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    eyebrow.textContent = 'A pedido';
    title.textContent = 'Lemon pie';
    title.style.display = '';
    cta.style.display = 'none';
    copy.style.opacity = '1';
    return;
  }

  let activeStart = null;
  let scheduled = false;

  function textState(progress) {
    for (const block of textBlocks) {
      if (progress >= block.start && progress < block.end) {
        const inT = Math.min(1, (progress - block.start) / fade);
        const outT = Math.min(1, (block.end - progress) / fade);
        return {
          block,
          opacity: Math.min(easeInOutCubic(inT), easeInOutCubic(outT)),
          offsetY: 8 * (1 - easeInOutCubic(inT))
        };
      }
    }
    return null;
  }

  function updateCopy(progress) {
    const state = textState(progress);
    if (!state) {
      copy.style.opacity = '0';
      return;
    }

    const { block, opacity, offsetY } = state;
    if (activeStart !== block.start) {
      activeStart = block.start;
      eyebrow.textContent = block.eyebrow;
      if (block.cta) {
        title.style.display = 'none';
        cta.style.display = 'inline-block';
      } else {
        title.textContent = block.title;
        title.style.display = '';
        cta.style.display = 'none';
      }
    }

    copy.style.opacity = opacity.toFixed(3);
    copy.style.transform = `translateY(${offsetY.toFixed(2)}px)`;
  }

  function progressForAct() {
    const rect = act.getBoundingClientRect();
    const distance = act.offsetHeight - window.innerHeight;
    if (distance <= 0) return 0;
    return clamp01(-rect.top / distance);
  }

  function render() {
    const progress = progressForAct();
    const transform = computeTransform(progress, motion);

    product.style.transform =
      `translate3d(${(transform.x - 50).toFixed(3)}%, ${(transform.y - 50).toFixed(3)}%, 0) ` +
      `rotate(${transform.rotationDeg.toFixed(2)}deg) scale(${transform.scale.toFixed(4)})`;

    updateCopy(progress);
    scheduled = false;
  }

  function scheduleRender() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(render);
  }

  window.addEventListener('scroll', scheduleRender, { passive: true });
  window.addEventListener('resize', scheduleRender, { passive: true });
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLemonStory, { once: true });
} else {
  initLemonStory();
}
