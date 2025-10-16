
/* assets/app.js
   Interactions : menu mobile, on-scroll animations, gallery filter, lightbox, forms
*/
document.addEventListener('DOMContentLoaded', () => {
  // ---- mobile menus (support multiple headers) ----
  [['burger','mobileMenu'], ['burger2','mobileMenu2'], ['burger3','mobileMenu3'], ['burger4','mobileMenu4'], ['burger5','mobileMenu5']].forEach(pair => {
    const [bId,mId] = pair;
    const b = document.getElementById(bId);
    const m = document.getElementById(mId);
    if (!b || !m) return;
    b.addEventListener('click', () => {
      const open = m.hidden;
      m.hidden = !open;
      b.setAttribute('aria-expanded', String(open));
    });
  });

  // ---- year in footer for index (if present) ----
  const y = new Date().getFullYear();
  document.querySelectorAll('[id^="year"]').forEach(el => el.textContent = y);

  // ---- simple page transition: fade out on link click (internal) ----
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (href && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('http')) {
      a.addEventListener('click', (e) => {
        // allow anchor scroll to same page
        if (href.startsWith('#')) return;
        e.preventDefault();
        document.body.style.transition = 'opacity .28s';
        document.body.style.opacity = '0';
        setTimeout(() => { window.location = href; }, 280);
      });
    }
  });

  // ---- on-scroll animation using IntersectionObserver ----
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const delay = el.getAttribute('data-delay') || 0;
        setTimeout(() => el.classList.add('show'), Number(delay));
        io.unobserve(el);
      }
    });
  }, {threshold: 0.12});

  document.querySelectorAll('.appear').forEach(el => io.observe(el));

  // ---- projects gallery filter (realisations.html) ----
  const filters = document.querySelectorAll('.filter');
  const gallery = document.getElementById('gallery');
  if (filters && gallery) {
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        document.querySelectorAll('.gallery-item').forEach(item => {
          if (f === 'all' || item.dataset.cat === f) {
            item.style.display = '';
            item.classList.add('appear');
            io.observe(item);
          } else {
            item.style.display = 'none';
          }
        });
      });
    });

    // delegate click -> open lightbox
    gallery.addEventListener('click', (ev) => {
      const fig = ev.target.closest('.gallery-item');
      if (!fig) return;
      const img = fig.querySelector('img');
      openLightbox(img.src, fig.querySelector('figcaption')?.innerText || '');
    });
  }

  // ---- lightbox (shared) ----
  function openLightbox(src, caption){
    // support both lightbox ids used in index/realisations
    const lb = document.getElementById('lightbox') || document.getElementById('lb') || document.getElementById('lb');
    const img = document.getElementById('lightboxImage') || document.getElementById('lbImg') || document.getElementById('lbImg');
    const cap = document.getElementById('lbCaption');
    if (!lb || !img) {
      // fallback: open image in new tab
      window.open(src, '_blank');
      return;
    }
    img.src = src;
    if (cap) cap.textContent = caption || '';
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  // close lightbox
  const lbClose = document.getElementById('lbClose') || document.getElementById('closeLb') || document.getElementById('closeLb');
  if (lbClose) {
    lbClose.addEventListener('click', () => {
      const lb = document.getElementById('lightbox') || document.getElementById('lb');
      if (lb) { lb.hidden = true; document.body.style.overflow = ''; }
    });
  }
  // clicking outside image closes
  document.querySelectorAll('.lightbox').forEach(lb => {
    lb.addEventListener('click', (e) => {
      if (e.target === lb) { lb.hidden = true; document.body.style.overflow = ''; }
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.lightbox').forEach(lb => lb.hidden = true);
      document.body.style.overflow = '';
    }
  });

  // ---- simple contact form handlers (simulate sending) ----
  const forms = document.querySelectorAll('form');
  forms.forEach(f => {
    f.addEventListener('submit', (ev) => {
      // if it's a simulated form (no action) we prevent default and simulate
      if (!f.action) {
        ev.preventDefault();
        const status = f.querySelector('#formStatus') || f.querySelector('#cstatus') || f.querySelector('#formStatus') || document.getElementById('formStatus');
        // find required fields
        const reqs = f.querySelectorAll('[required]');
        for (let r of reqs) {
          if (!r.value || r.value.trim() === '') {
            if (status) { status.style.color = '#b91c1c'; status.textContent = 'Merci de remplir les champs obligatoires.'; }
            return;
          }
        }
        if (status) { status.style.color = '#374151'; status.textContent = 'Envoi en cours…'; }
        setTimeout(() => {
          if (status) { status.style.color = '#065f46'; status.textContent = 'Merci — votre message a bien été reçu. Nous vous contacterons sous 24h.'; }
          f.reset();
        }, 900);
      }
    });
  });

  // ---- gallery items open if clicked on index/project previews (delegation) ----
  document.querySelectorAll('.project').forEach(p => {
    p.addEventListener('click', (e) => {
      e.preventDefault();
      const img = p.querySelector('img');
      if (img) openLightbox(img.src, p.querySelector('.project-meta h4')?.innerText || '');
    });
  });

  // expose openLightbox for inline onclick on gallery on single-file pages
  window.openLightbox = function(src, alt){ openLightbox(src, alt); };
});

