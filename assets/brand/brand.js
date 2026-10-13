// Brand case behaviour: hero parallax, pinned logo story, colour copy, horizontal poster run.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // hero parallax
  const cards = $$(".bc-card");
  const stage = $(".bc-stage");
  if (stage && !reduce) {
    const k = [-0.05, 0.03, -0.08];
    addEventListener("scroll", () => requestAnimationFrame(() => {
      const r = stage.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = (r.top + r.height / 2 - innerHeight / 2);
      cards.forEach((c, i) => { c.style.marginTop = (p * k[i]).toFixed(1) + "px"; });
    }), { passive: true });
  }

  // pinned logo story
  const lg = $(".bc-logo");
  if (lg) {
    const imgs = $$(".bc-logo-stage img", lg), steps = $$(".bc-step", lg), dots = $$(".bc-logo-dots i", lg), st = $(".bc-logo-stage", lg);
    const set = (i) => {
      imgs.forEach((im, n) => im.classList.toggle("on", n === i));
      steps.forEach((s, n) => s.classList.toggle("on", n === i));
      dots.forEach((d, n) => d.classList.toggle("on", n === i));
      st.style.setProperty("--lbg", steps[i].dataset.bg);
    };
    set(0);
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) set(steps.indexOf(e.target)); }), { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach((s) => io.observe(s));
  }

  // colour copy
  const toast = document.createElement("div"); toast.className = "bc-toast"; document.body.appendChild(toast);
  $$(".bc-col").forEach((b) => b.addEventListener("click", () => {
    try { navigator.clipboard.writeText(b.dataset.hex); } catch (e) {}
    b.classList.add("copied"); toast.textContent = b.dataset.hex; toast.classList.add("on");
    setTimeout(() => { b.classList.remove("copied"); toast.classList.remove("on"); }, 1400);
  }));

  // horizontal poster run
  const run = $(".bc-run");
  if (run) {
    const pin = $(".bc-run-pin", run), track = $(".bc-run-track", run), count = $(".bc-run-count", run);
    const n = track.children.length;
    const size = () => {
      if (matchMedia("(max-width: 900px)").matches) { run.style.height = ""; return; }
      const dist = Math.max(0, track.scrollWidth - innerWidth + 2 * parseFloat(getComputedStyle(track).paddingLeft));
      run.style.height = (innerHeight + dist) + "px"; run._dist = dist;
    };
    const tick = () => {
      if (matchMedia("(max-width: 900px)").matches) return;
      const r = run.getBoundingClientRect(), dist = run._dist || 0;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
      if (count) count.textContent = String(Math.min(n, Math.floor(p * n) + 1)).padStart(2, "0") + " / " + String(n).padStart(2, "0");
    };
    addEventListener("resize", () => { size(); tick(); });
    addEventListener("load", () => { size(); tick(); });
    addEventListener("scroll", () => requestAnimationFrame(tick), { passive: true });
    size(); tick();
    $$("img", track).forEach((im) => im.addEventListener("load", () => { size(); tick(); }));
  }
})();

// story: scroll progress var + chapter highlight, friteur menu dish preview
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const story = document.querySelector(".bc-story");
  if (story) {
    const chaps = $$(".bc-chap", story);
    addEventListener("scroll", () => requestAnimationFrame(() => {
      const r = story.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.5 - r.top) / Math.max(1, r.height)));
      story.style.setProperty("--p", p.toFixed(4));
    }), { passive: true });
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("on", e.isIntersecting)), { rootMargin: "-40% 0px -40% 0px" });
    chaps.forEach((c) => io.observe(c));
  }
  const menu = document.querySelector(".bc-menu");
  if (menu) {
    const dish = document.querySelector(".bc-dish");
    $$("li", menu).forEach((li) => {
      li.addEventListener("mouseenter", () => { dish.src = li.dataset.img; dish.classList.add("on"); });
      li.addEventListener("mouseleave", () => dish.classList.remove("on"));
      li.addEventListener("mousemove", (e) => { dish.style.left = e.clientX + "px"; dish.style.top = (e.clientY - 40) + "px"; });
    });
  }
})();
