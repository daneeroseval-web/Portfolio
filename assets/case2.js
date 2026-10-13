// Builds an image-led case page from <script type="application/json" id="case-data">.
// Load order: i18n.js, case2.js, main.js (main.js applies translations and wires the reveal + "more works").
(() => {
  const host = document.querySelector("[data-c2]");
  const cfg = JSON.parse(document.getElementById("case-data").textContent);
  const esc = (s) => String(s).replace(/"/g, "&quot;");
  const i18n = (key, tag = "span", cls = "") => key ? `<${tag}${cls ? ` class="${cls}"` : ""} data-i18n="${key}"></${tag}>` : "";

  if (cfg.theme) {
    document.body.style.setProperty("--c2-bg", cfg.theme.bg);
    document.body.style.setProperty("--c2-fg", cfg.theme.fg);
  }

  // a media item: "path.jpg" | { src, video, poster, fit, caption, bg, ratio }
  const media = (m, extra = "") => {
    if (typeof m === "string") m = { src: m };
    const style = [m.ratio ? `aspect-ratio:${m.ratio}` : "", m.bg ? `background:${m.bg}` : ""].filter(Boolean).join(";");
    const inner = m.video
      ? `<video src="${m.video}" poster="${m.poster || ""}" autoplay muted loop playsinline preload="metadata"></video>`
      : `<img src="${m.src}" alt="" loading="lazy">`;
    const cap = m.caption ? `<figcaption data-i18n="${m.caption}"></figcaption>` : "";
    return `<figure class="c2-media clip ${m.fit === "contain" ? "contain" : ""} ${extra}" ${style ? `style="${style}"` : ""}>${inner}${cap}</figure>`;
  };

  const blocks = {
    full: (b) => `<div class="c2-row b-full">${media(b.item, "par")}</div>`,
    split: (b) => `<div class="c2-row b-split" style="--a:${b.a || 7};--b:${b.b || 5};--drop:${b.drop || 0}">${media(b.items[0])}${media(b.items[1])}</div>`,
    offset: (b) => `<div class="c2-row b-offset" style="--from:${b.from || 5};--span:${b.span || 8}">${media(b.item)}</div>`,
    duo: (b) => `<div class="c2-row b-duo">${b.items.map((m) => media(m)).join("")}</div>`,
    trio: (b) => `<div class="c2-row b-trio">${b.items.map((m) => media(m)).join("")}</div>`,
    quad: (b) => `<div class="c2-row b-quad">${b.items.map((m) => media(m)).join("")}</div>`,
    text: (b) => `<div class="c2-row b-text reveal">${b.label ? i18n(b.label, "span", "label") : ""}${i18n(b.key, "p")}</div>`,
    panel: (b) => `<div class="b-panel"${b.bg ? ` style="--c2-bg:${b.bg};--c2-fg:${b.fg || "#fff"}"` : ""}>
        ${b.title ? `<h2 class="panel-title reveal" data-i18n="${b.title}"></h2>` : ""}
        <div class="c2-row b-${b.layout || "duo"}">${b.items.map((m) => media(m)).join("")}</div></div>`,
    band: (b) => {
      const one = `<span>${esc(b.word)}${b.icon ? `<img src="${b.icon}" alt="">` : ""}</span>`;
      return `<div class="b-band" aria-hidden="true"${b.bg ? ` style="--c2-bg:${b.bg};--c2-fg:${b.fg || "#fff"}"` : ""}><div class="track">${one.repeat(8)}</div></div>`;
    },
    rail: (b) => `<div class="b-rail"><div class="rail" data-rail>${b.items.map((m) => media(m)).join("")}</div></div>`,
  };

  const info = (cfg.info || []).map((row, i) => `
    <details${i === 0 ? " open" : ""}><summary><span data-i18n="${row.t}"></span><i>+</i></summary>${
      row.list ? `<ul>${row.list.map((k) => `<li data-i18n="${k}"></li>`).join("")}</ul>` : `<p data-i18n="${row.p}"></p>`}</details>`).join("");

  host.innerHTML = `
    <section class="c2-hero wrap">
      <a class="cs-back" href="index.html#work" data-i18n-attr="aria-label:aria.back" aria-label="Back to all work">←</a>
      <h1 class="c2-title"><span>${esc(cfg.title)}</span></h1>
      <div class="c2-meta label">${i18n(cfg.tag)}<span>${esc(cfg.year)}</span><span class="cs-scroll"><i class="wheel"></i>${i18n("scroll.explore")}</span></div>
      ${media(cfg.hero, "par")}
    </section>
    <section class="section wrap">
      <div class="c2-intro">
        <h2 class="reveal" data-i18n-html="${cfg.intro}"></h2>
        <div class="info reveal"><span class="dot-label label" data-i18n="info.title"></span>${info}</div>
      </div>
    </section>
    <section class="wrap c2-blocks">${cfg.blocks.map((b) => blocks[b.type](b)).join("")}</section>
    <section class="section wrap">
      <div class="rail-head reveal"><h2 data-i18n="more.title"></h2></div>
      <div class="more-grid" data-more="${esc(cfg.title)}"></div>
    </section>
    <section class="talk wrap">
      <span class="label" data-i18n="talk.label"></span>
      <a href="mailto:info@daneeroseval.com"><span data-i18n="talk.cta"></span> <i>↗</i></a>
    </section>
    <div class="wrap">
      <footer class="site-footer" style="margin-top:0">
        <span>© <span data-year-now></span> Danée Roseval</span>
        <span data-i18n="footer.place"></span>
        <a href="#top" onclick="scrollTo({top:0,behavior:'smooth'});return false" data-i18n="footer.top"></a>
      </footer>
      <div style="height:48px"></div>
    </div>`;

  // reveal frames as they enter, then a light parallax on the big ones
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".c2-media.clip").forEach((el) => io.observe(el));

  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const pars = [...document.querySelectorAll(".c2-media.par")];
    const tick = () => {
      const h = innerHeight;
      pars.forEach((f) => {
        const r = f.getBoundingClientRect();
        if (r.bottom < 0 || r.top > h || !f.classList.contains("is-in")) return;
        const p = (r.top + r.height / 2 - h / 2) / h; // -1..1 around the centre
        const img = f.firstElementChild;
        img.style.transform = `scale(1.1) translateY(${(-p * 4).toFixed(2)}%)`;
      });
    };
    addEventListener("scroll", () => requestAnimationFrame(tick), { passive: true });
  }
})();
