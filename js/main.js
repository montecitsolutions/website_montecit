/* ===== AOS INIT ===== */
AOS.init({
  duration: 650,
  easing: 'ease-out-cubic',
  once: true,
  offset: 60,
});

/* ===== PARTICLE CANVAS ===== */
(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [], animId;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r = Math.random() * 1.5 + 0.4;
      this.o = Math.random() * 0.45 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56,189,248,${this.o})`;
      ctx.fill();
    }
  }

  function drawConnections() {
    const maxD = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxD) {
          const o = (1 - d / maxD) * 0.14;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(56,189,248,${o})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animId = requestAnimationFrame(loop);
  }

  function init() {
    resize();
    const count = Math.min(75, Math.floor((canvas.width * canvas.height) / 11000));
    particles = Array.from({ length: count }, () => new Particle());
    loop();
  }

  const resizeObs = new ResizeObserver(() => {
    cancelAnimationFrame(animId);
    init();
  });
  resizeObs.observe(canvas.parentElement);

  init();
})();

/* ===== TYPING EFFECT ===== */
(function () {
  const el = document.getElementById('typing-text');
  if (!el) return;
  const words = ['Desarrollo de Sistemas', 'Redes Empresariales', 'Servidores Linux', 'Aplicaciones Web', 'Soporte IT Integral'];
  let wi = 0, ci = 0, del = false;

  function tick() {
    const word = words[wi];
    if (!del) {
      el.textContent = word.slice(0, ci + 1);
      ci++;
      if (ci === word.length) { del = true; setTimeout(tick, 1800); return; }
    } else {
      el.textContent = word.slice(0, ci - 1);
      ci--;
      if (ci === 0) { del = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(tick, del ? 45 : 80);
  }
  tick();
})();

/* ===== COUNTER ANIMATION ===== */
(function () {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting || e.target.dataset.done) return;
      e.target.dataset.done = '1';
      const target = +e.target.dataset.count;
      const suffix = e.target.dataset.suffix || '+';
      const dur = 1400;
      const step = target / (dur / 16);
      let cur = 0;
      const t = setInterval(() => {
        cur += step;
        if (cur >= target) { e.target.textContent = target + suffix; clearInterval(t); }
        else { e.target.textContent = Math.floor(cur) + suffix; }
      }, 16);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
})();

/* ===== CONTACT FORM ===== */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.innerHTML;

    if (form.action.includes('YOUR_FORM_ID')) {
      e.preventDefault();
      const d = new FormData(form);
      const sub = encodeURIComponent(`Consulta Montec - ${d.get('service') || 'General'}`);
      const body = encodeURIComponent(
        `Nombre: ${d.get('name')}\nEmail: ${d.get('email')}\nEmpresa: ${d.get('company') || '-'}\nServicio: ${d.get('service')}\n\nMensaje:\n${d.get('message')}`
      );
      window.location.href = `mailto:contacto@montec.pe?subject=${sub}&body=${body}`;
      return;
    }

    e.preventDefault();
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        btn.innerHTML = '<i class="fas fa-check mr-2"></i>¡Enviado con éxito!';
        btn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
        form.reset();
        setTimeout(() => {
          btn.innerHTML = original;
          btn.style.background = '';
          btn.disabled = false;
        }, 4500);
      } else {
        throw new Error();
      }
    } catch {
      btn.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>Error, inténtalo de nuevo';
      btn.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }
  });
})();

/* ===== SMOOTH SCROLL (offset for fixed nav) ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ===== SCROLL TO TOP BUTTON ===== */
(function () {
  const btn = document.getElementById('scrolltop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
