/** HERRAJES NEFFER — ecommerce front */
const STORE_WHATSAPP = '573138945337';
const DISCOUNT_THRESHOLD = 50000;
const DISCOUNT_RATE = 0.05;
const POINTS_PER_COP = 1000;

const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];

const navbar = $('#navbar');
const hamburger = $('#hamburger');
const navLinks = $('#nav-links');

window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// Menú móvil profesional: botón de cerrar, overlay, bloqueo de scroll y cierre con ESC.
let navBackdrop = null;
let mobileCloseBtn = null;

function ensureMobileMenuHelpers() {
  if (!navBackdrop) {
    navBackdrop = document.createElement('button');
    navBackdrop.className = 'nav-backdrop';
    navBackdrop.type = 'button';
    navBackdrop.setAttribute('aria-label', 'Cerrar menú');
    document.body.appendChild(navBackdrop);
    navBackdrop.addEventListener('click', closeMobileMenu);
  }
  if (navLinks && !mobileCloseBtn) {
    mobileCloseBtn = document.createElement('button');
    mobileCloseBtn.className = 'mobile-menu-close';
    mobileCloseBtn.type = 'button';
    mobileCloseBtn.setAttribute('aria-label', 'Cerrar menú');
    mobileCloseBtn.innerHTML = '<span>Menú</span><strong aria-hidden="true">×</strong>';
    navLinks.prepend(mobileCloseBtn);
    mobileCloseBtn.addEventListener('click', closeMobileMenu);
  }
}
function openMobileMenu() {
  ensureMobileMenuHelpers();
  hamburger?.classList.add('open');
  navLinks?.classList.add('open');
  navBackdrop?.classList.add('show');
  document.body.classList.add('menu-open');
  hamburger?.setAttribute('aria-expanded', 'true');
}
function closeMobileMenu() {
  hamburger?.classList.remove('open');
  navLinks?.classList.remove('open');
  navBackdrop?.classList.remove('show');
  document.body.classList.remove('menu-open');
  hamburger?.setAttribute('aria-expanded', 'false');
}

if (hamburger && navLinks) {
  hamburger.setAttribute('aria-controls', 'nav-links');
  hamburger.setAttribute('aria-expanded', 'false');
  ensureMobileMenuHelpers();
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    navLinks.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
  });
  $$('.nav-link, .nav-cta').forEach(link => link.addEventListener('click', closeMobileMenu));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
      closeCart();
    }
  });
}

function formatCOP(value) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value || 0);
}
function parsePrice(text) {
  const match = String(text || '').replace(/\./g, '').match(/\$?\s*([\d]+)/);
  return match ? Number(match[1]) : 0;
}
function normalize(text) {
  return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

// Contadores
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10) || 0;
  const duration = 1400;
  const step = Math.max(1, target / (duration / 16));
  let current = 0;
  const tick = () => {
    current += step;
    if (current < target) {
      el.textContent = Math.floor(current).toLocaleString('es-CO');
      requestAnimationFrame(tick);
    } else {
      el.textContent = target.toLocaleString('es-CO');
    }
  };
  tick();
}
const stats = $$('.stat-num');
let countersStarted = false;
const statsStrip = $('.stats-strip');
if (statsStrip) {
  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        stats.forEach(animateCounter);
      }
    });
  }, { threshold: 0.4 }).observe(statsStrip);
}

// Reveal
const revealElements = $$('.product-card, .service-card, .section-header, .contact-link, .stat, .category-card, .offer-card');
revealElements.forEach(el => el.classList.add('reveal'));
if (revealElements.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), (i % 6) * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  revealElements.forEach(el => observer.observe(el));
}

// Catálogo: filtros + búsqueda + query param
const filterBtns = $$('.filter-btn');
const productCards = $$('.product-card');
const searchInputs = $$('.product-search-input');
const searchInput = $('#product-search') || searchInputs[0];
const catalogCount = $('#catalog-count');
let activeFilter = 'all';

function applyCatalogFilters() {
  const query = normalize(searchInputs[0]?.value || searchInput?.value || '');
  let visible = 0;
  productCards.forEach(card => {
    const category = card.dataset.category || '';
    const haystack = normalize(`${card.dataset.name || ''} ${$('.product-tag', card)?.textContent || ''} ${$('p', card)?.textContent || ''}`);
    const okFilter = activeFilter === 'all' || category === activeFilter;
    const okSearch = !query || haystack.includes(query);
    const show = okFilter && okSearch;
    card.classList.toggle('hidden', !show);
    if (show) visible += 1;
  });
  if (catalogCount) catalogCount.textContent = `${visible} producto${visible === 1 ? '' : 's'} visibles`;
}
filterBtns.forEach(btn => btn.addEventListener('click', () => {
  filterBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeFilter = btn.dataset.filter || 'all';
  applyCatalogFilters();
}));
searchInputs.forEach(input => input.addEventListener('input', () => {
  searchInputs.forEach(other => { if (other !== input) other.value = input.value; });
  applyCatalogFilters();
}));

const params = new URLSearchParams(window.location.search);
const catFromUrl = params.get('cat');
if (catFromUrl) {
  const btn = $(`.filter-btn[data-filter="${catFromUrl}"]`);
  if (btn) btn.click();
} else {
  applyCatalogFilters();
}

// Carrito
const cartDrawer = $('#cart-drawer');
const openCartBtn = $('#open-cart');
const openCartFloat = $('#open-cart-float');
const closeCartBtn = $('#close-cart');
const cartItemsEl = $('#cart-items');
const cartCountEl = $('#cart-count');
const cartSubtotalEl = $('#cart-subtotal');
const cartDiscountEl = $('#cart-discount');
const cartTotalEl = $('#cart-total');
const cartPointsEl = $('#cart-points');
const checkoutForm = $('#checkout-form');
let cart = JSON.parse(localStorage.getItem('neffer_cart') || '[]');

function saveCart() { localStorage.setItem('neffer_cart', JSON.stringify(cart)); }
function totals() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = subtotal >= DISCOUNT_THRESHOLD ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  const total = subtotal - discount;
  const points = Math.floor(total / POINTS_PER_COP);
  return { subtotal, discount, total, points };
}
function openCart() { if (cartDrawer) { cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden','false'); document.body.classList.add('cart-open'); } }
function closeCart() { if (cartDrawer) { cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden','true'); document.body.classList.remove('cart-open'); } }
function toast(message) {
  let t = $('#cart-toast');
  if (!t) { t = document.createElement('div'); t.id = 'cart-toast'; t.className = 'cart-toast'; document.body.appendChild(t); }
  t.textContent = message;
  t.classList.add('show');
  clearTimeout(window.nefferToastTimer);
  window.nefferToastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}
function addToCart(product) {
  const found = cart.find(item => item.name === product.name);
  if (found) found.qty += 1; else cart.push({ ...product, qty: 1 });
  saveCart(); renderCart(); toast(`✅ ${product.name} agregado`);
}
function updateQty(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.name !== name);
  saveCart(); renderCart();
}
function removeItem(name) { cart = cart.filter(i => i.name !== name); saveCart(); renderCart(); }
function renderCart() {
  if (cartItemsEl) {
    cartItemsEl.innerHTML = cart.length ? cart.map(item => `
      <article class="cart-item"><div><h4>${item.name}</h4><small>${item.category} · ${formatCOP(item.price)} c/u</small><div class="cart-item-controls"><button class="qty-btn" data-action="decrease" data-name="${item.name}" type="button">−</button><strong>${item.qty}</strong><button class="qty-btn" data-action="increase" data-name="${item.name}" type="button">+</button><button class="remove-item" data-action="remove" data-name="${item.name}" type="button">×</button></div></div><strong>${formatCOP(item.price * item.qty)}</strong></article>
    `).join('') : '<p class="empty-cart">Tu carrito está vacío. Agrega productos del catálogo.</p>';
  }
  const t = totals();
  const qty = cart.reduce((sum, item) => sum + item.qty, 0);
  if (cartCountEl) cartCountEl.textContent = qty;
  if (cartSubtotalEl) cartSubtotalEl.textContent = formatCOP(t.subtotal);
  if (cartDiscountEl) cartDiscountEl.textContent = '-' + formatCOP(t.discount);
  if (cartTotalEl) cartTotalEl.textContent = formatCOP(t.total);
  if (cartPointsEl) cartPointsEl.textContent = `${t.points} pts`;
}

$$('.btn-card').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const card = btn.closest('.product-card');
    if (!card) return;
    const name = $('h3', card)?.textContent.trim();
    const category = $('.product-tag', card)?.textContent.trim();
    const price = parsePrice($('.price', card)?.textContent);
    if (!price) return;
    addToCart({ name, category, price });
  });
});
if (openCartBtn) openCartBtn.addEventListener('click', openCart);
if (openCartFloat) openCartFloat.addEventListener('click', openCart);
if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
if (cartDrawer) cartDrawer.addEventListener('click', e => { if (e.target === cartDrawer) closeCart(); });
if (cartItemsEl) cartItemsEl.addEventListener('click', e => {
  const target = e.target.closest('button[data-action]');
  if (!target) return;
  const { action, name } = target.dataset;
  if (action === 'increase') updateQty(name, 1);
  if (action === 'decrease') updateQty(name, -1);
  if (action === 'remove') removeItem(name);
});
if (checkoutForm) checkoutForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!cart.length) { alert('Agrega al menos un producto al carrito.'); return; }
  const buyerName = $('#buyer-name').value.trim();
  const buyerPhone = $('#buyer-phone').value.trim();
  const buyerCity = $('#buyer-city').value.trim();
  const buyerAddress = $('#buyer-address').value.trim();
  const shippingType = $('#shipping-type').value;
  const paymentMethod = $('#payment-method').value;
  const notes = $('#order-notes').value.trim();
  const t = totals();
  const productLines = cart.map(i => `• ${i.name} x${i.qty} — ${formatCOP(i.price * i.qty)}`).join('%0A');
  const message = `Hola Herrajes Neffer! Quiero hacer este pedido:%0A%0A*Productos*%0A${productLines}%0A%0A*Subtotal:* ${formatCOP(t.subtotal)}%0A*Descuento:* -${formatCOP(t.discount)}%0A*Total estimado:* ${formatCOP(t.total)}%0A*Puntos estimados:* ${t.points} pts%0A%0A*Datos del comprador*%0ANombre: ${encodeURIComponent(buyerName)}%0AWhatsApp: ${encodeURIComponent(buyerPhone)}%0ACiudad: ${encodeURIComponent(buyerCity)}%0ADirección: ${encodeURIComponent(buyerAddress)}%0ATipo de envío: ${encodeURIComponent(shippingType)}%0AMétodo de pago: ${encodeURIComponent(paymentMethod)}%0A${notes ? 'Notas: ' + encodeURIComponent(notes) + '%0A' : ''}`;
  window.open(`https://wa.me/${STORE_WHATSAPP}?text=${message}`, '_blank');
});

// Contacto por WhatsApp
const form = $('#contact-form');
const success = $('#form-success');
function setError(fieldId, message) {
  const field = $('#' + fieldId);
  const err = $('#error-' + fieldId);
  if (field) field.classList.toggle('error', !!message);
  if (err) err.textContent = message || '';
}
if (form) {
  ['nombre','telefono','mensaje'].forEach(id => $('#' + id)?.addEventListener('input', () => setError(id, '')));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nombre = $('#nombre').value.trim();
    const telefono = $('#telefono').value.trim();
    const mensaje = $('#mensaje').value.trim();
    let ok = true;
    setError('nombre', nombre.length < 2 ? 'Por favor ingresa tu nombre completo.' : ''); ok = ok && nombre.length >= 2;
    setError('telefono', /^[\d\s\+\-\(\)]{7,15}$/.test(telefono) ? '' : 'Ingresa un número válido.'); ok = ok && /^[\d\s\+\-\(\)]{7,15}$/.test(telefono);
    setError('mensaje', mensaje.length < 10 ? 'El mensaje debe tener al menos 10 caracteres.' : ''); ok = ok && mensaje.length >= 10;
    if (!ok) return;
    const wa = `Hola Herrajes Neffer! 👋%0A%0A*Nombre:* ${encodeURIComponent(nombre)}%0A*Teléfono:* ${encodeURIComponent(telefono)}%0A%0A*Mensaje:*%0A${encodeURIComponent(mensaje)}`;
    if (success) success.style.display = 'block';
    form.reset();
    window.open(`https://wa.me/${STORE_WHATSAPP}?text=${wa}`, '_blank');
    setTimeout(() => { if (success) success.style.display = 'none'; }, 2000);
  });
}


// Marca el enlace activo según página/sección visible.
const navAnchors = $$('.nav-link');
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  if (path.includes('catalogo')) {
    navAnchors.forEach(a => a.classList.toggle('active-link', a.getAttribute('href')?.includes('catalogo')));
    return;
  }
  const sections = ['inicio','ofertas','servicios','contacto'];
  const current = sections.findLast?.(id => {
    const el = document.getElementById(id);
    return el && el.getBoundingClientRect().top <= 120;
  }) || 'inicio';
  navAnchors.forEach(a => a.classList.toggle('active-link', a.getAttribute('href') === `#${current}`));
}
window.addEventListener('scroll', setActiveNav, { passive: true });
setActiveNav();

renderCart();
console.log('%c⚙ Herrajes Neffer ecommerce listo', 'color:#c9a84c;font-size:18px;font-weight:bold;');
