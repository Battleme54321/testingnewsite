// The Six Aquatics — redesign test.
// Reads the same content/settings.json and content/stock.json that Sveltia CMS edits,
// so every field (sold out, coming soon, stock text, green dot) keeps working.
// buildPage() returns plain HTML so it can also be used by the CMS live preview.

function buildPage(S, K, opts) {
  opts = opts || {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const img = (p, w) => (opts.raw || local || !p) ? p : '/.netlify/images?url=' + encodeURIComponent(p) + '&w=' + w + '&fm=webp&q=78';
  const mail = (subj, body) => 'mailto:' + S.email + (subj ? '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body) : '');

  const I = {
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 8.5h-1.5c-.6 0-1 .5-1 1.1V11H15l-.3 2.2h-2.2V21h-2.4v-7.8H8.5V11h1.6V9.3c0-2 1.2-3.3 3.2-3.3H15v2.5Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16 16 3l5 5L8 21z"/><path d="m7 12 2 2M10 9l2 2M13 6l2 2"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    plane: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 13.5 3 11l1.5-1.5 8 .5 4.5-4.5a2 2 0 0 1 3 3L15.5 13l.5 8L14.5 22.5 12 15l-3 3v2.5L7.5 22 6 18l-4-1.5L3.5 15H6z"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15"/><path d="M5 19 13 11"/></svg>',
    gmail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v11h4v-7l5 4 5-4v7h4V7l-9 6.5z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>'
  };

  // "Cardinal Tetra (Paracheirodon axelrodi)" -> common + scientific name
  const split = n => { const m = String(n || '').match(/^(.*?)\s*\((.+)\)\s*$/); return m ? [m[1], m[2]] : [String(n || ''), '']; };

  const used = {};
  const cats = (K.categories || []).map(c => {
    let base = String(c.title || 'section').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
    let id = base, k = 2;
    while (used[id]) id = base + '-' + k++;
    used[id] = true;
    return Object.assign({}, c, { id: id, items: c.items || [] });
  });
  // Stock date: today's date (Toronto time) unless the CMS switch is turned off.
  const stockDate = K.stock_date_auto !== false
    ? new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Toronto' })
    : (K.stock_date || '');
  const all = cats.reduce((a, c) => a.concat(c.items), []);

  // Headline: last two words get the italic teal accent.
  const words = String(S.hero_title || '').trim().split(/\s+/);
  const tail = words.length > 3 ? words.splice(-2).join(' ') : '';
  const title = esc(words.join(' ')) + (tail ? ' <i>' + esc(tail) + '</i>' : '');

  const card = i => {
    const so = !!i.sold_out, cs = !so && !!i.coming_soon;
    const [common, sci] = split(i.name);
    return '<article class="card' + (so ? ' is-sold' : '') + (cs ? ' is-soon' : '') + '" data-q="' + esc(String(i.name || '').toLowerCase()) + '"' + (so || cs ? ' data-out' : '') + '>' +
      '<button type="button" class="card-media" data-full="' + esc(i.image) + '" data-name="' + esc(common) + '" data-sci="' + esc(sci) + '" aria-label="View photo of ' + esc(common) + '">' +
        (i.image ? '<img src="' + esc(img(i.image, 520)) + '" alt="' + esc(i.name) + '" loading="lazy">' : '') +
        (so ? '<span class="badge badge-sold">Sold out</span>' : '') +
        (cs ? '<span class="badge badge-soon">Coming soon</span>' : '') +
      '</button>' +
      '<div class="card-body"><h4>' + esc(common) + '</h4>' + (sci ? '<div class="sci">' + esc(sci) + '</div>' : '') +
        (i.size ? '<span class="size">' + I.ruler + esc(i.size) + '</span>' : '') +
        '<div class="card-foot"><div class="price-wrap"><span class="price">' + esc(i.price) + '</span>' +
          (i.stock_text ? '<span class="stock-txt">' + (i.show_dot !== false ? '<span class="live"></span>' : '') + esc(i.stock_text) + '</span>' : '') +
        '</div>' +
      '</div></div></article>';
  };

  const infoIcons = [I.truck, I.plane, I.leaf];

  return (
    '<header class="hdr"><div class="wrap">' +
      '<a href="#top" class="brand">' + (S.logo_image ? '<img src="' + esc(img(S.logo_image, 96)) + '" alt="">' : '') +
        '<span>' + esc(S.brand_first) + ' <em>' + esc(S.brand_second) + '</em></span></a>' +
      '<nav><a href="#stock">Current stock</a><a href="#delivery">Delivery</a><a href="#contact">Contact</a></nav>' +
      '<div class="hdr-right">' +
        '<a class="icon-btn" href="' + esc(S.instagram) + '" target="_blank" rel="noreferrer" aria-label="Instagram">' + I.ig + '</a>' +
        '<a class="icon-btn" href="' + esc(S.facebook) + '" target="_blank" rel="noreferrer" aria-label="Facebook">' + I.fb + '</a>' +
        '<a class="btn btn-primary btn-sm" href="#contact">Order now</a>' +
      '</div></div></header>' +

    '<section class="hero"><div class="wrap">' +
      '<div class="eyebrow rv"><span class="live"></span><b>' + esc(S.hero_eyebrow) + '</b>' + (stockDate ? '<span class="sep"></span><span class="upd">Stock updated ' + esc(stockDate) + '</span>' : '') + '</div>' +
      '<h1 class="rv">' + title + '</h1>' +
      '<p class="lead rv">' + esc(S.hero_text) + '</p>' +
      '<div class="ctas rv"><a class="btn btn-primary" href="#stock">Browse current stock ' + I.down + '</a><a class="btn btn-ghost" href="#contact">Place an order</a></div>' +
    '</div>' +
    '<div class="tank rv"><div class="tank-frame"><img src="' + esc(img(S.hero_image, 1800)) + '" alt="Planted aquarium with a school of tetras" fetchpriority="high"><div class="caustics"></div>' +
    '</div></div></section>' +

    '<section class="info" id="delivery"><div class="wrap"><div class="info-grid">' +
      (S.info_cards || []).map((c, n) => '<div class="info-card rv"><div class="info-icon">' + infoIcons[n % infoIcons.length] + '</div><div><h3>' + esc(c.title) + '</h3><p>' + esc(c.text) + '</p></div></div>').join('') +
    '</div></div></section>' +

    '<section class="stock" id="stock"><div class="wrap">' +
      '<div class="sec-head rv"><div>' + (stockDate ? '<div class="kicker">Updated ' + esc(stockDate) + '</div>' : '') + '<h2>Current stock</h2></div><p>' + esc(S.stock_note) + '</p></div>' +
      '<div class="toolbar"><div class="tool-row">' +
        '<label class="search">' + I.search + '<input type="search" placeholder="Search fish…" aria-label="Search fish" data-search></label>' +
        '<div class="chips" role="tablist" aria-label="Categories">' +
          '<button type="button" class="chip on" data-cat="all">All <small>' + all.length + '</small></button>' +
          cats.map(c => '<button type="button" class="chip" data-cat="' + esc(c.id) + '">' + esc(c.nav_label || c.title) + ' <small>' + c.items.length + '</small></button>').join('') +
        '</div>' +
        '<label class="toggle"><input type="checkbox" data-instock><span class="sw"></span>In stock only</label>' +
      '</div></div>' +
      cats.map(c =>
        '<div class="cat" id="' + esc(c.id) + '" data-cat-id="' + esc(c.id) + '">' +
          '<div class="cat-head"><h3>' + esc(c.title) + '</h3><span class="count" data-count>' + c.items.length + ' items</span>' + (c.description ? '<p>' + esc(c.description) + '</p>' : '') + '</div>' +
          '<div class="grid">' + c.items.map(card).join('') + '</div></div>').join('') +
      '<div class="empty" data-empty hidden><strong>No fish match that.</strong>Try a different name, or clear the filters.</div>' +
    '</div></section>' +

    '<section class="contact" id="contact"><div class="wrap"><div class="contact-panel rv"><div class="caustics"></div>' +
      (S.logo_image ? '<img class="logo" src="' + esc(img(S.logo_image, 200)) + '" alt="">' : '') +
      '<h2>' + esc(S.contact_title) + '</h2>' +
      '<p>' + esc(S.contact_text).split(esc(S.email)).join('<a href="' + esc(mail()) + '">' + esc(S.email) + '</a>') + '</p>' +
      '<div class="ctas"><div class="email-wrap"><button type="button" class="btn btn-primary" data-email-btn aria-expanded="false">' + I.mail + 'Email us</button>' +
        '<div class="email-menu" data-email-menu hidden>' +
          '<div class="email-addr">' + esc(S.email) + '</div>' +
          '<a href="' + esc(mail('Order inquiry', '')) + '">' + I.mail + 'Open my email app</a>' +
          '<a href="' + esc('https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(S.email) + '&su=' + encodeURIComponent('Order inquiry')) + '" target="_blank" rel="noreferrer">' + I.gmail + 'Write in Gmail</a>' +
          '<button type="button" data-copy="' + esc(S.email) + '">' + I.copy + '<span>Copy email address</span></button>' +
        '</div></div>' +
        '<a class="btn btn-ghost" href="' + esc(S.instagram) + '" target="_blank" rel="noreferrer">' + I.ig + 'Instagram</a>' +
        '<a class="btn btn-ghost" href="' + esc(S.facebook) + '" target="_blank" rel="noreferrer">' + I.fb + 'Facebook</a></div>' +
    '</div></div></section>' +

    '<footer><div class="wrap"><span>&copy; ' + new Date().getFullYear() + ' ' + esc(S.footer) + '</span><a href="#top">Back to top ↑</a></div></footer>' +

    '<div class="lb" data-lb aria-hidden="true"><button type="button" class="lb-close" data-lb-close aria-label="Close">' + I.close + '</button><figure><img alt=""><figcaption></figcaption></figure></div>'
  );
}

window.buildPage = buildPage;

// ---------- Interactions (live site only) ----------
function initPage(root) {
  const $ = (s, el) => (el || root).querySelector(s);
  const $$ = (s, el) => Array.from((el || root).querySelectorAll(s));

  // Header / toolbar borders on scroll
  const hdr = $('.hdr'), bar = $('.toolbar');
  const onScroll = () => {
    hdr.classList.toggle('scrolled', scrollY > 8);
    if (bar) bar.classList.toggle('stuck', bar.getBoundingClientRect().top <= hdr.offsetHeight + 1);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Filters
  const state = { cat: 'all', q: '', inStock: false };
  const apply = () => {
    let shown = 0;
    $$('.cat').forEach(sec => {
      let n = 0;
      $$('.card', sec).forEach(card => {
        const ok = (!state.q || card.dataset.q.indexOf(state.q) > -1) && (!state.inStock || !card.hasAttribute('data-out'));
        card.hidden = !ok; if (ok) n++;
      });
      const vis = n > 0 && (state.cat === 'all' || state.cat === sec.dataset.catId);
      sec.hidden = !vis; if (vis) shown += n;
      $('[data-count]', sec).textContent = n + (n === 1 ? ' item' : ' items');
    });
    $('[data-empty]').hidden = shown > 0;
  };
  const toStock = () => { const t = $('#stock .toolbar'); if (t && t.getBoundingClientRect().top > hdr.offsetHeight + 2) $('#stock').scrollIntoView({ behavior: 'smooth' }); };
  $$('.chip').forEach(ch => ch.addEventListener('click', () => {
    $$('.chip').forEach(c => c.classList.toggle('on', c === ch));
    state.cat = ch.dataset.cat; apply(); toStock();
  }));
  $('[data-search]').addEventListener('input', e => { state.q = e.target.value.trim().toLowerCase(); apply(); });
  $('[data-instock]').addEventListener('change', e => { state.inStock = e.target.checked; apply(); });

  // Lightbox
  const lb = $('[data-lb]'), lbImg = $('img', lb), lbCap = $('figcaption', lb);
  const close = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); lb._token = (lb._token || 0) + 1; setTimeout(() => { if (!lb.classList.contains('open')) lbImg.removeAttribute('src'); }, 260); };
  root.addEventListener('click', e => {
    const m = e.target.closest('.card-media');
    if (m && m.dataset.full) {
      // Show the card's already-loaded photo instantly, then swap in the full-size one when it's ready
      // (stops the previously opened fish from flashing up first).
      const thumb = m.querySelector('img'), full = m.dataset.full, token = (lb._token = (lb._token || 0) + 1);
      lbImg.src = thumb && thumb.currentSrc ? thumb.currentSrc : full; lbImg.alt = m.dataset.name;
      if (lbImg.src !== new URL(full, location.href).href) {
        const pre = new Image();
        pre.onload = () => { if (lb._token === token) lbImg.src = full; };
        pre.src = full;
      }
      lbCap.innerHTML = ''; lbCap.append(m.dataset.name);
      if (m.dataset.sci) { const i = document.createElement('i'); i.textContent = m.dataset.sci; lbCap.append(i); }
      lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    }
    if (e.target === lb || e.target.closest('[data-lb-close]')) close();
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') { close(); closeMenu(); } });

  // "Email us" menu: email app, Gmail, or copy the address
  const eBtn = $('[data-email-btn]'), eMenu = $('[data-email-menu]');
  const closeMenu = () => { if (eMenu) { eMenu.hidden = true; eBtn.setAttribute('aria-expanded', 'false'); } };
  if (eBtn) {
    eBtn.addEventListener('click', e => { e.stopPropagation(); eMenu.hidden = !eMenu.hidden; eBtn.setAttribute('aria-expanded', String(!eMenu.hidden)); });
    document.addEventListener('click', e => { if (!e.target.closest('.email-wrap')) closeMenu(); });
    const cp = $('[data-copy]', eMenu);
    cp.addEventListener('click', () => {
      const done = () => { $('span', cp).textContent = 'Copied!'; setTimeout(() => { $('span', cp).textContent = 'Copy email address'; }, 1800); };
      const fallback = () => { const t = document.createElement('textarea'); t.value = cp.dataset.copy; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (x) {} t.remove(); done(); };
      navigator.clipboard ? navigator.clipboard.writeText(cp.dataset.copy).then(done, fallback) : fallback();
    });
  }

  // Reveal on scroll
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js-rv');
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.rv').forEach((el, n) => { el.style.transitionDelay = (el.closest('.hero') ? n * 80 : 0) + 'ms'; io.observe(el); });
  }
}

if (document.getElementById('app')) {
  Promise.all([
    fetch('/content/settings.json').then(r => r.json()),
    fetch('/content/stock.json').then(r => r.json())
  ]).then(d => {
    const app = document.getElementById('app');
    app.innerHTML = buildPage(d[0], d[1]);
    initPage(app);
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); t && t.scrollIntoView(); }
  });
}

// If Netlify image resizing isn't available, fall back to the original file.
document.addEventListener('error', e => {
  const t = e.target;
  if (t.tagName === 'IMG' && t.src.indexOf('/.netlify/images') > -1) t.src = decodeURIComponent(new URL(t.src).searchParams.get('url'));
}, true);
