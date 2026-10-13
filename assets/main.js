// Projects. Titles/tags/years are either literal text or an i18n key (see assets/i18n.js).
const IMG = "https://framerusercontent.com/images/";
const PROJECTS = [
  { title: "Friteur", tag: "tag.identity", year: "2024", img: "assets/friteur/logo-animation-16x9-poster.jpg",
    video: "assets/friteur/logo-animation-16x9.mp4", ratio: "16 / 9", thumb: "assets/previews/friteur-more.jpg", href: "friteur.html" },
  { title: "NOVO", tag: "tag.identity", year: "2022", img: "assets/novo/novo-card-poster.jpg",
    video: "assets/novo/novo-card.mp4", thumb: "assets/previews/novo-more.jpg", href: "novo.html" },
  { title: "Chubby Buns", tag: "tag.identity", year: "2024", img: "assets/previews/chubby-card43.jpg", thumb: "assets/previews/chubby-more.jpg", href: "chubby-buns.html" },
  { title: "Sybotanica", tag: "tag.app", year: "2024", img: "assets/previews/sybotanica-card-v2.jpg", thumb: "assets/previews/sybotanica-more-v2.jpg", href: "sybotanica.html" },
  { title: "Safari", tag: "tag.identity", year: "2023", img: "assets/previews/safari-card.jpg", thumb: "assets/previews/safari-more.jpg", href: "safari.html" },
];
const T = (v) => (window.I18N && /^[a-z]+\.[a-z.]+$/.test(v) ? I18N.t(v) : v);
const tx = (v) => (/^[a-z]+\.[a-z.]+$/.test(v) ? `<span data-i18n="${v}">${T(v)}</span>` : v);

const root = document.documentElement;

// ---------- Theme ----------
function storedTheme() {
  try { return localStorage.getItem("theme"); } catch (e) { return null; }
}
const saved = storedTheme();
if (saved) root.dataset.theme = saved;

document.querySelectorAll(".theme-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const isDark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = isDark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });
});

// ---------- Clock (Velp) ----------
const clock = document.querySelector(".clock");
if (clock) {
  const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" });
  const tick = () => { clock.textContent = "Velp, NL " + fmt.format(new Date()); };
  tick();
  setInterval(tick, 30000);
}

// ---------- Header on scroll ----------
const header = document.querySelector(".site-header");
let lastY = 0;
addEventListener("scroll", () => {
  const y = scrollY;
  header.classList.toggle("is-scrolled", y > 40);
  header.classList.toggle("is-hidden", y > 400 && y > lastY);
  lastY = y;
}, { passive: true });

// ---------- Work grid (home) ----------
const grid = document.querySelector("[data-work]");
if (grid) {
  grid.innerHTML = PROJECTS.map((p, i) => `
    <a class="case reveal" href="${p.href || `case.html?p=${i + 1}`}">
      <div class="case-media"${p.ratio ? ` style="aspect-ratio:${p.ratio}"` : ""}>${p.video
        ? `<video src="${p.video}" poster="${p.img}" autoplay muted loop playsinline aria-label="${T(p.title)}"></video>`
        : `<img src="${p.img}" alt="${T(p.title)}" loading="lazy">`}
        <span class="case-arrow" aria-hidden="true">↗</span>
      </div>
      <div class="case-meta">
        <span class="case-num">${String(i + 1).padStart(2, "0")}</span>
        <span class="case-title">${tx(p.title)}</span>
        <span class="case-tag">${tx(p.tag)}, ${tx(p.year)}</span>
      </div>
    </a>`).join("");
}

// ---------- Hero reel: all cases drifting past, one in the spotlight ----------
const reel = document.querySelector("[data-reel]");
if (reel) {
  const CASES = ["friteur", "novo", "chubby", "sybotanica", "safari"];
  const COUNT = { friteur: 5, novo: 5, chubby: 5, sybotanica: 5, safari: 4 };
  const tiles = [];
  for (let i = 0; i < 5; i++) CASES.forEach((c) => { if (i < COUNT[c]) tiles.push({ c, src: `assets/reel/${c}-${i + 1}.jpg` }); });
  const cols = innerWidth > 900 ? 6 : 3;
  const per = Array.from({ length: cols }, () => []);
  tiles.forEach((t, i) => per[i % cols].push(t));
  reel.innerHTML = per.map((col, k) => {
    const html = col.map((t) => `<img src="${t.src}" alt="" data-c="${t.c}" decoding="async">`).join("");
    return `<div class="reel-col" style="--dur:${48 + (k % 3) * 14}s">${html}${html}${html}</div>`;
  }).join("");
  const now = document.querySelector("[data-now]");
  let a = 0;
  const show = () => {
    const c = CASES[a], p = PROJECTS.find((x) => x.href && x.href.startsWith(c === "chubby" ? "chubby" : c));
    reel.querySelectorAll("img").forEach((im) => im.classList.toggle("on", im.dataset.c === c));
    if (now && p) { now.href = p.href; now.querySelector("[data-now-n]").textContent = String(PROJECTS.indexOf(p) + 1).padStart(2, "0"); now.querySelector("[data-now-t]").textContent = T(p.title); }
    a = (a + 1) % CASES.length;
  };
  show();
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(show, 2800);
}


// ---------- Home depth: reel parallax, layered hero, card tilt ----------
if (document.body.classList.contains("home") && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const cols = document.querySelector(".reel-cols"), hero = document.querySelector(".hero");
  addEventListener("mousemove", (e) => {
    if (!cols) return;
    const x = (e.clientX / innerWidth - 0.5), y = (e.clientY / innerHeight - 0.5);
    cols.style.setProperty("--mx", (-x * 40).toFixed(1) + "px"); cols.style.setProperty("--my", (-y * 30).toFixed(1) + "px");
  }, { passive: true });
  const cards = [...document.querySelectorAll(".work-grid .case")];
  const tick = () => {
    const sy = scrollY;
    if (cols && sy < innerHeight * 1.2) { cols.style.setProperty("--sy", (sy * 0.35).toFixed(1) + "px"); hero.style.setProperty("--ny", (sy * -0.18).toFixed(1) + "px"); hero.style.setProperty("--fy", (sy * -0.08).toFixed(1) + "px"); }
    cards.forEach((c, i) => {
      const r = c.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      c.style.setProperty("--py", (p * -4).toFixed(2) + "%");
    });
  };
  addEventListener("scroll", () => requestAnimationFrame(tick), { passive: true }); tick();
  cards.forEach((c) => {
    const m = c.querySelector(".case-media");
    c.addEventListener("mousemove", (e) => { const r = m.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; m.style.setProperty("--ry", (x * 6).toFixed(2) + "deg"); m.style.setProperty("--rx", (-y * 6).toFixed(2) + "deg"); });
    c.addEventListener("mouseleave", () => { m.style.setProperty("--ry", "0deg"); m.style.setProperty("--rx", "0deg"); });
  });
}

// ---------- Case page ----------
const casePage = document.querySelector("[data-case]");
if (casePage) {
  const n = Math.min(Math.max(parseInt(new URLSearchParams(location.search).get("p"), 10) || 1, 1), PROJECTS.length);
  const p = PROJECTS[n - 1];
  const next = PROJECTS[n % PROJECTS.length];
  document.title = `${T(p.title)} | Danée Roseval`;
  casePage.querySelector("[data-title]").innerHTML = tx(p.title);
  casePage.querySelector("[data-tag]").innerHTML = tx(p.tag);
  casePage.querySelector("[data-year]").innerHTML = tx(p.year);
  casePage.querySelector("[data-cover]").src = p.img;
  casePage.querySelector("[data-cover]").alt = T(p.title);
  const nextLink = casePage.querySelector("[data-next]");
  nextLink.href = next.href || `case.html?p=${(n % PROJECTS.length) + 1}`;
  nextLink.querySelector(".case-h1").innerHTML = tx(next.title);
}

// ---------- More works (case pages) ----------
const more = document.querySelector("[data-more]");
if (more) {
  const skip = more.dataset.more;
  more.innerHTML = PROJECTS.map((p, i) => ({ p, i })).filter(({ p }) => p.title !== skip).slice(0, 2).map(({ p, i }) => `
    <a class="more-card reveal" href="${p.href || `case.html?p=${i + 1}`}">
      <img src="${p.thumb || p.img}" alt="${T(p.title)}" loading="lazy">
      <span class="more-meta"><span><b>${tx(p.title)}</b><small>${tx(p.tag)}</small></span><i>↗</i></span>
    </a>`).join("");
}

// ---------- Drag to scroll (poster rail) ----------
document.querySelectorAll("[data-rail]").forEach((rail) => {
  let down = false, startX = 0, startLeft = 0;
  rail.addEventListener("pointerdown", (e) => { down = true; startX = e.clientX; startLeft = rail.scrollLeft; rail.classList.add("is-drag"); });
  addEventListener("pointerup", () => { down = false; rail.classList.remove("is-drag"); });
  rail.addEventListener("pointermove", (e) => { if (down) rail.scrollLeft = startLeft - (e.clientX - startX); });
});

// ---------- Reveal on scroll ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  });
}, { rootMargin: "0px 0px -10% 0px" });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ---------- Language ----------
if (window.I18N) {
  I18N.apply();
  document.addEventListener("langchange", () => {
    const c = document.querySelector("[data-case] [data-title]");
    if (c) document.title = `${c.textContent} | Danée Roseval`;
  });
}

// ---------- Footer year ----------
document.querySelectorAll("[data-year-now]").forEach((el) => { el.textContent = new Date().getFullYear(); });

requestAnimationFrame(() => document.body.classList.add("is-loaded"));
