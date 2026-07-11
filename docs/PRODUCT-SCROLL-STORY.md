# Sistema de scroll de producto - Lemon Pie

## Estado

- Publicado y aprobado (valores de esta página siguen siendo la referencia aprobada).
- URL: https://titatizi.github.io/mon_roule/
- Commit visual estable: 1736181
- Tag: lemon-scroll-v1
- **Migración en curso (rama `product-story-engine`, sin commitear):** Lemon
  ahora es una entrada de config en `data/product-stories.js`, generada por
  el motor genérico `js/product-story-engine.js`. Los valores de
  movimiento/narrativa de más abajo son los mismos, solo cambió dónde
  viven. `js/lemon-scroll.js` y `js/lemon-motion.js` quedan intactos en
  disco como recurso de rollback hasta confirmar paridad completa — no
  están referenciados desde `index.html` mientras el motor nuevo esté activo.

## Archivos activos (motor nuevo)

- index.html (contenedor `#product-stories`, generado por JS)
- css/style.css + css/product-story.css
- data/product-stories.js (config declarativa, incluye Lemon + placeholders `disabled:true` de frutos-rojos y chocolate)
- js/product-story-engine.js
- js/renderers/layered-renderer.js (importa `computeTransform`/`phaseFor` de js/lemon-motion.js, sin duplicar)
- js/renderers/image-sequence-renderer.js (stub, sin consumidor real)

## Archivos de rollback (no tocar, no eliminar)

- js/lemon-scroll.js
- js/lemon-motion.js
- img/lemon-pie-continuous/cutout-alpha.webp
- img_master/lemon-background.webp

## Configuracion aprobada

- Seccion total: 400vh
- Contenedor sticky: 100svh
- Fallback: 100vh
- Entrada horizontal: 220px
- Rotacion principal: 180 grados
- Tamano aproximado del producto: 79.8vw
- Color dorado: #D4A017
- Mobile-first
- Compatible con prefers-reduced-motion
- Compatible con safe area de iPhone

## Narrativa

- 36-48%: A pedido / Lemon Pie
- 48-60%: Crema de limon / Intensa y equilibrada
- 60-72%: Merengue tostado / Suave por dentro
- 72-82%: Hecho artesanalmente en CABA / CTA

## Flujo obligatorio para futuras integraciones

1. Crear una copia completa del proyecto.
2. Levantarla en otro puerto.
3. Integrar solamente en la copia.
4. Revisar la landing completa en PC y celular.
5. Verificar CSS, JavaScript e imagenes.
6. Aplicar un parche minimo al proyecto original.
7. Crear un commit local.
8. Volver a probar.
9. Hacer push.

## Rollback

Checkpoint estable: 1736181

Para revertir una integracion futura usar git revert sobre el commit problematico.