/* =================================================================
   motion.mjs
   Matematica de movimiento COMPARTIDA entre:
     - el runtime continuo (navegador, <script type="module">, rAF);
     - el exportador de frames opcional (Node, export-frames mode).
   Sin dependencias de Node ni del DOM: funciona identica en los dos
   lados, asi el preview interactivo y cualquier export de QA usan
   EXACTAMENTE la misma formula (una sola fuente de verdad).

   No hay "cantidad de frames" en esta matematica: computeTransform()
   acepta cualquier progreso p en [0,1] (numero real), no un indice
   discreto. El navegador la evalua a su propia frecuencia de refresco.
   ================================================================= */

export const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
export const easeInCubic = (t) => t * t * t;
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const clamp01 = (t) => Math.max(0, Math.min(1, t));

function bezier2(p0, p1, p2, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y
  };
}

/* =================================================================
   Narrativa (motion.entryEnd/heroArrival/spinEnd/heroEnd), en progreso
   p del acto completo, 0..1:

   0        .32       .42      .62        .76               1
   |--entrada--|-llegada-|--vuelta--|--presentacion--|----salida----|
     curva              360deg      practicamente      curva de
     amplia,            en el       fija (micro-       salida,
     rot=0               hero       drift casi          rot fija,
                       (easeInOut)  imperceptible)       zoom -> base

   Posicion en % del canvas, rotacion en grados, escala como ratio
   absoluto (ya multiplicado por motion.base — 1.0 = tamano base).

   Nota de diseno: entrada (0-32%) y llegada (32-42%) se tratan como UNA
   sola curva con easeOutQuint sobre todo [0,heroArrival] — ya "se
   siente" como recorrido amplio al principio + freno elegante al final,
   sin forzar una costura en entryEnd (evita un kink de velocidad ahi).
   entryEnd queda expuesto en el config como referencia/hook (p.ej. para
   disparar otros efectos mas adelante), no participa en esta formula.
   ================================================================= */
export function computeTransform(p, motion) {
  p = clamp01(p);
  const {
    entryEnd, heroArrival, spinEnd, heroEnd, exitEnd,
    spinDegrees, entryRotation, exitRotation,
    base, heroZoom, presentationDriftPct,
    trajectory
  } = motion;
  const { entry, entryControl, heroTarget, exitControl, exit } = trajectory;
  // exitEnd es nuevo (fase de "liberacion del sticky"); si no esta en el
  // config, cae a 1 y se comporta igual que antes (compatibilidad).
  const exitEndSafe = exitEnd === undefined ? 1 : exitEnd;

  let pos, rotationDeg, scale;

  // --- POSICION ---
  if (p <= heroArrival) {
    const localT = heroArrival > 0 ? p / heroArrival : 1;
    pos = bezier2(entry, entryControl, heroTarget, easeOutQuint(localT));
  } else if (p <= spinEnd) {
    // Vuelta en el hero: practicamente en el mismo punto (sin desplazamiento).
    pos = { x: heroTarget.x, y: heroTarget.y };
  } else if (p <= heroEnd) {
    // Presentacion: microdesplazamiento casi imperceptible (signo de vida
    // sutil, no narrativa) mientras se mantiene el protagonismo visual.
    const localT = (p - spinEnd) / (heroEnd - spinEnd || 1);
    const drift = easeInOutCubic(localT) * (presentationDriftPct || 0);
    pos = { x: heroTarget.x + drift * 0.6, y: heroTarget.y + drift * 0.4 };
  } else if (p <= exitEndSafe) {
    const localT = (p - heroEnd) / (exitEndSafe - heroEnd || 1);
    const driftFull = presentationDriftPct || 0;
    const start = { x: heroTarget.x + driftFull * 0.6, y: heroTarget.y + driftFull * 0.4 };
    pos = bezier2(start, exitControl, exit, easeInCubic(localT));
  } else {
    // Liberacion del sticky (p > exitEnd): ya esta completamente afuera,
    // no se mueve mas — nada que "responda" aca a proposito, el scroll
    // sigue de largo hacia la proxima seccion.
    pos = { x: exit.x, y: exit.y };
  }

  // --- ROTACION --- (0 fija en entrada/llegada; UNA sola interpolacion
  // 0 -> spinDegrees durante el giro; DESPUES se mantiene ese valor final
  // resuelto para siempre — presentacion, salida y liberacion incluidas.
  // exitRotation por defecto es 0, asi que nunca "vuelve" hacia 0/360: si
  // volviera, se veria como un segundo giro y sumaria una vuelta completa
  // visual junto con el giro del hero. No hay acumulacion entre fases:
  // cada rama calcula el angulo final desde cero, no suma sobre el valor
  // previo de un frame anterior. */
  if (p <= heroArrival) {
    rotationDeg = entryRotation;
  } else if (p <= spinEnd) {
    const localT = (p - heroArrival) / (spinEnd - heroArrival || 1);
    rotationDeg = entryRotation + easeInOutCubic(localT) * spinDegrees;
  } else if (p <= heroEnd) {
    rotationDeg = entryRotation + spinDegrees;
  } else if (p <= exitEndSafe) {
    const localT = (p - heroEnd) / (exitEndSafe - heroEnd || 1);
    rotationDeg = entryRotation + spinDegrees + easeInOutCubic(localT) * exitRotation;
  } else {
    rotationDeg = entryRotation + spinDegrees + exitRotation;
  }

  // --- ESCALA --- (base estable -> zoom hero -> base, siempre easeInOutCubic)
  const heroScale = base * heroZoom;
  if (p <= heroArrival) {
    scale = base;
  } else if (p <= spinEnd) {
    const localT = (p - heroArrival) / (spinEnd - heroArrival || 1);
    scale = base + (heroScale - base) * easeInOutCubic(localT);
  } else if (p <= heroEnd) {
    scale = heroScale;
  } else if (p <= exitEndSafe) {
    const localT = (p - heroEnd) / (exitEndSafe - heroEnd || 1);
    scale = heroScale - (heroScale - base) * easeInOutCubic(localT);
  } else {
    scale = base;
  }

  return { x: pos.x, y: pos.y, rotationDeg, scale };
}

/* Nombre de la sub-fase para un progreso p (util para UI de debug/preview,
   o para saber cuando "reservar" el espacio del copy en produccion). */
export function phaseFor(p, motion) {
  const exitEndSafe = motion.exitEnd === undefined ? 1 : motion.exitEnd;
  if (p <= motion.heroArrival) return p <= motion.entryEnd ? "entrada" : "llegada";
  if (p <= motion.spinEnd) return "giro";
  if (p <= motion.heroEnd) return "presentacion";
  if (p <= exitEndSafe) return "salida";
  return "liberacion-sticky";
}
