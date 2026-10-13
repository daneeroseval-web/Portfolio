// Sybotanica case: builds the app screens from <template>s, scales them into phones and runs the motion.
(() => {
  const W = 390, H = 844;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const TABS = [["a.tab.rem", "cal"], ["a.tab.shop", "bag"], ["a.tab.add", "plus"], ["a.tab.com", "chat"], ["a.tab.acc", "user"]];
  const t = (k) => (window.I18N ? I18N.t(k) : k);
  const GRID = Array.from({ length: 18 }, (_, i) => `assets/sybotanica/img/g${String(i + 1).padStart(2, "0")}.jpg`);

  function build(id) {
    const scr = $("#" + id).content.firstElementChild.cloneNode(true);
    $$("[data-sb]", scr).forEach((slot) => {
      const sb = $("#sb").content.firstElementChild.cloneNode(true);
      if (slot.dataset.sb === "light") sb.classList.add("light");
      slot.replaceWith(sb);
    });
    $$("[data-tabbar]", scr).forEach((slot) => {
      const on = +slot.dataset.tabbar;
      const bar = document.createElement("nav");
      bar.className = "tabbar";
      bar.innerHTML = TABS.map(([label, ic], i) => ic === "plus"
        ? `<a class="add" data-i18n-attr="aria-label:${label}"><span class="plus"><svg class="i"><use href="#i-plus"/></svg></span></a>`
        : `<a class="${i === on ? "on" : ""}"><svg class="i"><use href="#i-${ic}"/></svg><span data-i18n="${label}"></span></a>`).join("");
      slot.replaceWith(bar);
    });
    $$("[data-grid]", scr).forEach((g) => {
      g.innerHTML = GRID.map((src, i) => `<div style="transition-delay:${i * 45}ms"><img src="${src}" alt="" loading="lazy"></div>`).join("");
    });
    if (window.I18N) I18N.apply(scr);
    return scr;
  }

  // fill phones
  $$("[data-screen]").forEach((host) => host.prepend(build(host.dataset.screen)));
  $$("[data-screen-inline]").forEach((slot) => slot.replaceWith(build(slot.dataset.screenInline)));

  // wall of screens (doubled for a seamless loop)
  $$("[data-wall]").forEach((row) => {
    const ids = row.dataset.wall.split(" ");
    [...ids, ...ids].forEach((id) => {
      const phone = document.createElement("div");
      phone.className = "phone";
      phone.innerHTML = `<div class="phone-screen"></div>`;
      phone.firstChild.append(build(id));
      row.append(phone);
    });
  });

  // static states: everything switched on where the screen is not animated
  $$(".phone-screen:not([data-flow]) [data-tgl]").forEach((t) => t.classList.add("on"));
  $$(".phone-screen:not([data-flow]) [data-type]").forEach((s) => { s.textContent = s.dataset.type; });
  $$(".wall .pgrid, [data-screen='t-friend'] .pgrid").forEach((g) => { if (g.closest(".wall")) g.classList.add("show"); });

  // scale screens to their phone
  const ro = new ResizeObserver((entries) => entries.forEach((e) => {
    e.target.style.setProperty("--k", e.contentRect.width / W);
  }));
  $$(".phone-screen").forEach((ps) => ro.observe(ps));

  // ---------- add-a-plant flow ----------
  const flow = $("[data-flow]");
  if (flow) {
    const screens = $$(":scope > .scr", flow);
    const steps = $$(".fstep");
    const dots = $$(".flow-progress i");
    let current = -1, token = 0;

    const run = {
      async scan(scr, t) {
        const found = $(".scan-found", scr);
        found.classList.remove("show");
        await wait(1700); if (t !== token) return;
        found.classList.add("show");
      },
      async name(scr, t) {
        const out = $("[data-type]", scr), word = out.dataset.type;
        out.textContent = "";
        await wait(500);
        for (const ch of word) { if (t !== token) return; out.textContent += ch; await wait(140); }
      },
      async pot(scr, tok) {
        const r = $("[data-range]", scr), o = $("[data-range-out]", scr);
        const states = [["5%", "22%", "a.r1"], ["22%", "48%", "a.r2"], ["5%", "22%", "a.r1"]];
        for (const [a, b, key] of states) {
          if (tok !== token) return;
          r.style.setProperty("--a", a); r.style.setProperty("--b", b); o.dataset.i18n = key; o.textContent = t(key);
          await wait(1400);
        }
      },
      async rem(scr, t) {
        const tg = $$("[data-tgl]", scr);
        tg.forEach((x) => x.classList.remove("on"));
        await wait(400);
        for (const x of tg) { if (t !== token) return; x.classList.add("on"); await wait(320); }
      },
      async done() {},
    };

    function activate(i) {
      if (i === current) return;
      current = i; const t = ++token;
      screens.forEach((s, k) => s.classList.toggle("is-active", k === i));
      steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
      dots.forEach((d, k) => d.classList.toggle("on", k === i));
      const scr = screens[i];
      if (!reduce) run[scr.dataset.name]?.(scr, t);
      else { $$("[data-tgl]", scr).forEach((x) => x.classList.add("on")); $$("[data-type]", scr).forEach((s) => (s.textContent = s.dataset.type)); $(".scan-found", scr)?.classList.add("show"); }
    }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) activate(+e.target.dataset.step); }),
      { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach((s) => io.observe(s));
    activate(0);
  }

  // ---------- hero: scan loop + gentle autoscroll of the plant page ----------
  $$(".stage .scan-found").forEach((f) => setInterval(() => f.classList.toggle("show"), 2600));
  // scroll a tall screen by y (screen px) while its status bar and top buttons stay put
  function scrollTall(scr, y) {
    const k = parseFloat(getComputedStyle(scr.parentElement).getPropertyValue("--k")) || 0.6;
    scr.style.translate = `0 ${-y * k}px`;
    $$(":scope > .sb, :scope > .top", scr).forEach((el) => { el.style.translate = `0 ${y}px`; });
    $(":scope > .sb", scr)?.classList.toggle("solid", y > 380);
  }
  const maxScroll = (scr) => Math.max(0, scr.offsetHeight - H);

  const auto = $("[data-autoscroll] .scr.tall");
  if (auto && !reduce) {
    const tick = (now) => {
      const p = (Math.sin(now / 3200 - Math.PI / 2) + 1) / 2;
      scrollTall(auto, p * maxScroll(auto) * 0.62);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ---------- my plant: page scroll drives the phone scroll ----------
  const linked = $("[data-scrolllink] .scr.tall");
  const sect = $("#plant");
  if (linked && sect) {
    const onScroll = () => {
      const r = sect.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      scrollTall(linked, p * maxScroll(linked));
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    onScroll();
  }

  // ---------- in-view helpers ----------
  const onView = (el, fn, opts = { threshold: 0.35 }) => {
    const o = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { fn(e.target); o.unobserve(e.target); } }), opts);
    o.observe(el);
  };

  // reminder notifications + tick off
  $$("[data-notes]").forEach((notes) => onView(notes, async () => {
    const items = $$(".note", notes);
    const btn = $("[data-done]", notes.parentElement);
    for (const [i, n] of items.entries()) {
      await wait(i === 0 ? 300 : 900);
      n.classList.add("show");
      if (i === 2 && btn) btn.classList.add("on");
    }
  }));

  // friend grid cascade
  $$(".duo .pgrid").forEach((g) => onView(g, () => g.classList.add("show"), { threshold: 0.1 }));

  // feed likes with a little burst
  $$(".phone-screen [data-like]").forEach((like) => {
    const burst = $(".burst", like), count = $("[data-count]", like);
    burst.innerHTML = Array.from({ length: 8 }, (_, i) => `<i style="--r:${i * 45}deg"></i>`).join("");
    if (reduce) return;
    setInterval(() => {
      const on = like.classList.toggle("liked");
      count.textContent = on ? 2 : 1;
      if (on) { burst.classList.remove("go"); void burst.offsetWidth; burst.classList.add("go"); }
    }, 2800);
  });

  // component demo toggle
  $$("[data-tgl-demo]").forEach((t) => !reduce && setInterval(() => t.classList.toggle("on"), 1600));

  // before / after compare
  $$("[data-cmp]").forEach((c) => {
    const range = $(".cmp-range", c), screen = $(".phone-screen", c);
    const set = () => screen.style.setProperty("--x", range.value + "%");
    range.addEventListener("input", set); set();
    // a small hint sweep the first time it comes into view
    onView(c, async () => {
      if (reduce) return;
      for (const v of [50, 22, 78, 50]) { range.value = v; set(); await wait(650); }
    });
    screen.style.transition = "none";
  });
})();
