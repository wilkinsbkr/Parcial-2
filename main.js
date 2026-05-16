/**
 * HERRAJES NEFFER — main.js
 * JavaScript para interactividad y animaciones
 */

// ==========================================
// 1. NAVBAR — scroll effect & hamburger
// ==========================================
const navbar   = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

// Scroll effect
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Hamburger toggle (menú móvil)
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }
});


// ==========================================
// 2. FILTRO DE PRODUCTOS (Catálogo)
// ==========================================
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Activar botón
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    productCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.classList.remove('hidden');
        // Animación de aparición
        card.style.animation = 'none';
        card.offsetHeight; // Reflow
        card.style.animation = 'fadeUp 0.4s ease forwards';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});


// ==========================================
// 3. CONTADOR ANIMADO (Stats strip)
// ==========================================
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800; // ms
  const step     = target / (duration / 16);
  let current    = 0;

  const update = () => {
    current += step;
    if (current < target) {
      el.textContent = Math.floor(current).toLocaleString('es-CO');
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toLocaleString('es-CO');
    }
  };
  update();
}

// Activar contadores cuando sean visibles
const statNums = document.querySelectorAll('.stat-num');
let countersStarted = false;

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !countersStarted) {
      countersStarted = true;
      statNums.forEach(num => animateCounter(num));
    }
  });
}, { threshold: 0.5 });

const statsStrip = document.querySelector('.stats-strip');
if (statsStrip) statsObserver.observe(statsStrip);


// ==========================================
// 4. REVEAL ON SCROLL (Animaciones al scrollear)
// ==========================================
const revealElements = document.querySelectorAll(
  '.product-card, .service-card, .section-header, .contact-link, .stat'
);

revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Delay escalonado
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, (i % 6) * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));


// ==========================================
// 5. FORMULARIO DE CONTACTO (Validación + envío por WhatsApp)
// ==========================================
const form     = document.getElementById('contact-form');
const success  = document.getElementById('form-success');

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById('error-' + fieldId);
  field.classList.add('error');
  if (error) error.textContent = message;
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById('error-' + fieldId);
  field.classList.remove('error');
  if (error) error.textContent = '';
}

function validateForm() {
  let isValid = true;

  const nombre   = document.getElementById('nombre').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const mensaje  = document.getElementById('mensaje').value.trim();

  // Validar nombre
  clearError('nombre');
  if (nombre.length < 2) {
    showError('nombre', 'Por favor ingresa tu nombre completo.');
    isValid = false;
  }

  // Validar teléfono
  clearError('telefono');
  const phoneRegex = /^[\d\s\+\-\(\)]{7,15}$/;
  if (!phoneRegex.test(telefono)) {
    showError('telefono', 'Ingresa un número de teléfono válido.');
    isValid = false;
  }

  // Validar mensaje
  clearError('mensaje');
  if (mensaje.length < 10) {
    showError('mensaje', 'El mensaje debe tener al menos 10 caracteres.');
    isValid = false;
  }

  return isValid;
}

// Limpiar errores al escribir
['nombre', 'telefono', 'mensaje'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => clearError(id));
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const nombre   = document.getElementById('nombre').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const mensaje  = document.getElementById('mensaje').value.trim();

  // Armar mensaje para WhatsApp
  const waMessage =
    `Hola Herrajes Neffer! 👋%0A%0A` +
    `*Nombre:* ${encodeURIComponent(nombre)}%0A` +
    `*Teléfono:* ${encodeURIComponent(telefono)}%0A%0A` +
    `*Mensaje:*%0A${encodeURIComponent(mensaje)}`;

  // Mostrar mensaje de éxito
  success.style.display = 'block';
  form.reset();

  // Redirigir a WhatsApp después de 1.5 s
  setTimeout(() => {
    window.open(`https://wa.me/573138945337?text=${waMessage}`, '_blank');
    success.style.display = 'none';
  }, 1500);
});


// ==========================================
// 6. SMOOTH SCROLL para anclas (#)
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = 80; // Altura de la navbar
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


// ==========================================
// 7. HIGHLIGHT activo del nav-link al scroll
// ==========================================
const sections    = document.querySelectorAll('section[id]');
const navLinkEls  = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinkEls.forEach(link => {
    link.classList.remove('active-link');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active-link');
    }
  });
});


// ==========================================
// 8. EFECTO PARALLAX SUTIL en el Hero
// ==========================================
const hero = document.querySelector('.hero');
window.addEventListener('scroll', () => {
  if (hero) {
    const scrollY = window.scrollY;
    hero.style.backgroundPositionY = `${scrollY * 0.3}px`;
  }
});


// ==========================================
// 9. TOOLTIP en botones flotantes (accesibilidad)
// ==========================================
document.querySelectorAll('.float-btn').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'scale(1.18)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'scale(1)';
  });
});


// ==========================================
// 10. Mensaje de consola (firma del proyecto)
// ==========================================
console.log(
  '%c⚙ Herrajes Neffer%c\nDesarrollado con HTML5 · CSS3 · JavaScript\nRepositorio: GitHub | Deploy: GitHub Pages',
  'color: #c9a84c; font-size: 18px; font-weight: bold;',
  'color: #888; font-size: 12px;'
);
