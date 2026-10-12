// Projects: titles, years and case copy are placeholders until the real content is in.
const IMG = "https://framerusercontent.com/images/";
const PROJECTS = [
  { title: "[Project name]", tag: "Logo Design", year: "[Year]", img: IMG + "Yug0qg1kXZLYklyE7xgmGZ5zI.jpg" },
  { title: "[Project name]", tag: "Logo Design", year: "[Year]", img: IMG + "6gfXX9n8xPboN2uQqLt03BcWTqU.jpg" },
  { title: "[Project name]", tag: "Brand Design", year: "[Year]", img: IMG + "Zp4QicrEX3jVZ35a6PKEq1fKQo.jpg" },
  { title: "[Project name]", tag: "Logo Design", year: "[Year]", img: IMG + "mxxv5nH0NdN0F5gKr34umF2srk.jpg" },
];

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
    <a class="case reveal" href="case.html?p=${i + 1}">
      <div class="case-media"><img src="${p.img}" alt="${p.title}, ${p.tag}" loading="lazy"></div>
      <div class="case-meta">
        <span class="case-num">${String(i + 1).padStart(2, "0")}</span>
        <span class="case-title">${p.title}</span>
        <span class="case-tag">${p.tag}, ${p.year}</span>
      </div>
    </a>`).join("");
}

// ---------- Case page ----------
const casePage = document.querySelector("[data-case]");
if (casePage) {
  const n = Math.min(Math.max(parseInt(new URLSearchParams(location.search).get("p"), 10) || 1, 1), PROJECTS.length);
  const p = PROJECTS[n - 1];
  const next = PROJECTS[n % PROJECTS.length];
  document.title = `${p.title} | Danée Roseval`;
  casePage.querySelector("[data-title]").textContent = p.title;
  casePage.querySelector("[data-tag]").textContent = p.tag;
  casePage.querySelector("[data-year]").textContent = p.year;
  casePage.querySelector("[data-cover]").src = p.img;
  casePage.querySelector("[data-cover]").alt = `${p.title}, ${p.tag}`;
  const nextLink = casePage.querySelector("[data-next]");
  nextLink.href = `case.html?p=${(n % PROJECTS.length) + 1}`;
  nextLink.querySelector(".case-h1").textContent = next.title;
}

// ---------- Reveal on scroll ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  });
}, { rootMargin: "0px 0px -10% 0px" });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ---------- Footer year ----------
document.querySelectorAll("[data-year-now]").forEach((el) => { el.textContent = new Date().getFullYear(); });

requestAnimationFrame(() => document.body.classList.add("is-loaded"));
