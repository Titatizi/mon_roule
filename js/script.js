/* =================================================================
   MON ROULE — script.js
   Todo el JavaScript del sitio vive en este único archivo, dividido
   en bloques. Cada bloque hace una sola cosa y está comentado.
   ================================================================= */


/* =================================================================
   0) CONFIGURACIÓN GENERAL
   ================================================================= */

// CAMBIAR LINK DE INSTAGRAM ACÁ. Se usa en todos los botones del sitio.
const INSTAGRAM_URL = "https://www.instagram.com/mon_roule/";


/* =================================================================
   1) DATOS DE LOS PRODUCTOS
   Para agregar un producto nuevo, copiá un bloque { ... } de acá
   abajo y cambiá los datos. No hace falta tocar el HTML ni el CSS.

   categoria: "actual" -> aparece en "Nuestros productos", con precio
   categoria: "pedido" -> aparece en "A pedido", sin precio y con
                          la etiqueta "A pedido"
   ================================================================= */
const productos = [
  {
    nombre: "Roll de canela",
    precio: 6000,
    descripcion: "Enrollado a mano, relleno de canela y un glaseado suave por encima.",
    imagen: "img/placeholders/roll-canela.svg", // CAMBIAR IMAGEN ACÁ cuando tengan la foto real
    categoria: "actual"
  },
  {
    nombre: "Budín de banana",
    precio: 4500,
    descripcion: "Húmedo y aromático, hecho con bananas bien maduras.",
    imagen: "img/placeholders/budin-banana.svg",
    categoria: "actual"
  },
  {
    nombre: "Budín de zanahoria",
    precio: 3500,
    descripcion: "Esponjoso y delicado, con un toque de especias.",
    imagen: "img/placeholders/budin-zanahoria.svg",
    categoria: "actual"
  },
  {
    nombre: "Cheesecake",
    precio: null, // los productos "a pedido" no muestran precio
    descripcion: "Cremoso, con base de galletas. Se prepara especialmente para tu pedido.",
    imagen: "img/placeholders/cheesecake.svg",
    categoria: "pedido"
  },
  {
    nombre: "Lemon Pie",
    precio: null,
    descripcion: "Equilibrio justo entre el limón y el merengue.",
    imagen: "img/placeholders/lemon-pie.svg",
    categoria: "pedido"
  },
  {
    nombre: "Crumble de manzana",
    precio: null,
    descripcion: "Manzanas tibias bajo una capa crocante de manteca y avena.",
    imagen: "img/placeholders/crumble-manzana.svg",
    categoria: "pedido"
  },
  {
    nombre: "Cookies",
    precio: null,
    descripcion: "Crocantes por fuera y tiernas por dentro. Se preparan por encargo.",
    imagen: "img/placeholders/cookies.svg",
    categoria: "pedido"
  }
];


/* =================================================================
   2) CREAR EL HTML DE UNA TARJETA DE PRODUCTO
   Recibe un producto del array de arriba y devuelve el HTML de su
   tarjeta. La misma función sirve para productos "actuales" y para
   productos "a pedido".
   ================================================================= */
function crearTarjetaProducto(producto) {
  const esAPedido = producto.categoria === "pedido";

  // Si es "a pedido" no mostramos precio
  const precioHTML = esAPedido
    ? ""
    : `<p class="product-card__price">$${producto.precio.toLocaleString("es-AR")} <span>por porción</span></p>`;

  const badgeHTML = esAPedido
    ? `<span class="badge">A pedido</span>`
    : "";

  const textoBoton = esAPedido ? "Consultar por Instagram" : "Pedir por Instagram";
  const claseExtra = esAPedido ? "product-card--on-request" : "";

  return `
    <article class="product-card ${claseExtra} reveal">
      ${badgeHTML}
      <div class="product-card__image">
        <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
      </div>
      <h3 class="product-card__name">${producto.nombre}</h3>
      ${precioHTML}
      <p class="product-card__description">${producto.descripcion}</p>
      <a href="${INSTAGRAM_URL}" target="_blank" rel="noopener" class="product-card__link">${textoBoton}</a>
    </article>
  `;
}


/* =================================================================
   3) RENDERIZAR LOS PRODUCTOS EN EL HTML
   Busca los contenedores vacíos que están en index.html
   (#catalogo-actual y #catalogo-pedido) y los llena con las
   tarjetas generadas a partir de "productos".
   ================================================================= */
function renderizarProductos() {
  const contenedorActuales = document.getElementById("catalogo-actual");
  const contenedorPedido = document.getElementById("catalogo-pedido");

  const productosActuales = productos.filter((producto) => producto.categoria === "actual");
  const productosAPedido = productos.filter((producto) => producto.categoria === "pedido");

  contenedorActuales.innerHTML = productosActuales.map(crearTarjetaProducto).join("");
  contenedorPedido.innerHTML = productosAPedido.map(crearTarjetaProducto).join("");
}


/* =================================================================
   4) ACTUALIZAR TODOS LOS LINKS DE INSTAGRAM
   Cualquier link con la clase "js-instagram-link" (en el hero, en
   la sección Instagram y en el footer) recibe automáticamente el
   link definido en INSTAGRAM_URL. Así, si cambia el link, solo hay
   que tocarlo en un lugar (arriba del todo en este archivo).
   ================================================================= */
function actualizarLinksInstagram() {
  const links = document.querySelectorAll(".js-instagram-link");
  links.forEach((link) => {
    link.setAttribute("href", INSTAGRAM_URL);
  });
}


/* =================================================================
   5) ANIMACIÓN DE APARICIÓN AL HACER SCROLL ("reveal")
   Usamos IntersectionObserver: el navegador nos avisa cuando un
   elemento entra en pantalla, sin tener que escuchar el evento
   "scroll" todo el tiempo (más liviano para el celular).
   ================================================================= */
function iniciarAnimacionesScroll() {
  const elementosAAnimar = document.querySelectorAll(".reveal");

  // Si la persona prefiere menos movimiento, mostramos todo directo
  const prefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefiereMenosMovimiento) {
    elementosAAnimar.forEach((elemento) => elemento.classList.add("is-visible"));
    return;
  }

  const observador = new IntersectionObserver(
    (elementosObservados) => {
      elementosObservados.forEach((elementoObservado) => {
        if (elementoObservado.isIntersecting) {
          elementoObservado.target.classList.add("is-visible");
          // Ya apareció: dejamos de observarlo para no gastar recursos
          observador.unobserve(elementoObservado.target);
        }
      });
    },
    { threshold: 0.15 } // se activa cuando se ve un 15% del elemento
  );

  elementosAAnimar.forEach((elemento) => observador.observe(elemento));
}


/* =================================================================
   6) PARALLAX SUTIL EN EL HERO
   Mueve el ornamento del hero unos pocos píxeles al hacer scroll,
   para dar una sensación de profundidad muy suave (nada exagerado).
   ================================================================= */
function iniciarParallaxHero() {
  const ornamentoHero = document.querySelector(".hero__ornament");
  if (!ornamentoHero) return;

  const prefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefiereMenosMovimiento) return;

  window.addEventListener("scroll", () => {
    // requestAnimationFrame evita que el navegador haga este cálculo
    // más veces de las necesarias (mejor rendimiento)
    requestAnimationFrame(() => {
      const desplazamiento = window.scrollY;
      const movimiento = Math.min(desplazamiento * 0.15, 40); // tope de 40px: sutil
      ornamentoHero.style.transform = `translateY(${movimiento}px)`;
    });
  });
}


/* =================================================================
   6.1) EXPERIENCIA INMERSIVA — SECCIÓN "ROLLS DE CANELA"
   Mientras se hace scroll por los 4 pasos (masa, canela, horneado,
   glaseado), el que pasa por el centro de la pantalla se marca como
   "activo" (clase ".is-active") y le avisamos a la imagen grande de
   la izquierda cuál es, para que cambie sutilmente de escala/brillo.
   ================================================================= */
function iniciarExperienciaDestacado() {
  const pasos = document.querySelectorAll(".featured__step");
  const imagenGrande = document.querySelector(".featured__visual");

  if (pasos.length === 0 || !imagenGrande) return;

  const prefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefiereMenosMovimiento) {
    // Sin animación: mostramos todos los pasos activos directamente
    pasos.forEach((paso) => paso.classList.add("is-active"));
    return;
  }

  const observador = new IntersectionObserver(
    (pasosObservados) => {
      pasosObservados.forEach((pasoObservado) => {
        // "isIntersecting" acá significa "está en la franja central
        // de la pantalla" gracias al rootMargin que usamos más abajo
        pasoObservado.target.classList.toggle("is-active", pasoObservado.isIntersecting);

        if (pasoObservado.isIntersecting) {
          // Le contamos a la imagen grande qué paso está activo ahora
          const numeroDePaso = pasoObservado.target.dataset.step;
          imagenGrande.setAttribute("data-active-step", numeroDePaso);
        }
      });
    },
    {
      // Reducimos el área de detección a la franja central de la
      // pantalla (-30% arriba y -30% abajo), así un paso se activa
      // cuando llega al medio, no apenas aparece por abajo
      rootMargin: "-30% 0px -30% 0px",
      threshold: 0
    }
  );

  pasos.forEach((paso) => observador.observe(paso));
}


/* =================================================================
   7) ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ)
   Al hacer click en una pregunta, se abre su respuesta. Si había
   otra pregunta abierta, se cierra (solo una abierta a la vez).
   ================================================================= */
function iniciarFAQ() {
  const botonesPregunta = document.querySelectorAll(".faq-item__question");

  botonesPregunta.forEach((boton) => {
    boton.addEventListener("click", () => {
      const itemClickeado = boton.closest(".faq-item");
      const yaEstabaAbierto = itemClickeado.classList.contains("is-open");

      // Cerramos cualquier pregunta que haya quedado abierta
      document.querySelectorAll(".faq-item.is-open").forEach((itemAbierto) => {
        itemAbierto.classList.remove("is-open");
        itemAbierto.querySelector(".faq-item__question").setAttribute("aria-expanded", "false");
      });

      // Si la pregunta clickeada estaba cerrada, la abrimos
      if (!yaEstabaAbierto) {
        itemClickeado.classList.add("is-open");
        boton.setAttribute("aria-expanded", "true");
      }
    });
  });
}


/* =================================================================
   8) PUNTO DE ENTRADA
   Esperamos a que el HTML esté completamente cargado antes de
   ejecutar todo lo demás.
   ================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  renderizarProductos();
  actualizarLinksInstagram();
  iniciarAnimacionesScroll();
  iniciarParallaxHero();
  iniciarExperienciaDestacado();
  iniciarFAQ();
});
