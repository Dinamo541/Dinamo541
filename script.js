/* =========================================================================
   Dominique Castro · Dinamo541 — lógica del portafolio (v2)
   Iconos y logos 100% inline (sin CDNs de iconos). Consume la API de GitHub.
   ========================================================================= */
const USERNAME = "Dinamo541";
const API = "https://api.github.com";
const URLS = {
  profile: `${API}/users/${USERNAME}`,
  repos: `${API}/users/${USERNAME}/repos?sort=updated&per_page=100`,
  events: `${API}/users/${USERNAME}/events/public?per_page=30`,
};
const EMAIL = "dominiquecastro81@gmail.com";
const MAVEN_NS = "https://central.sonatype.com/namespace/io.github.dinamo541";

let LANG = document.documentElement.dataset.lang === "en" ? "en" : "es";
let user = null, repos = [], events = [], langTimer = null;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const nf = () => new Intl.NumberFormat(LANG === "en" ? "en-US" : "es-ES");

/* ===================================================== Iconos (UI) ====== */
const ui = (p) => `<svg class="ui" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const uf = (p) => `<svg class="ui-fill" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const UI = {
  "arrow-right": ui('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  "arrow-up-right": ui('<path d="M7 17 17 7M8 7h9v9"/>'),
  sort: ui('<path d="M7.5 5v14M4 8l3.5-3.5L11 8"/><path d="M16.5 19V5M20 16l-3.5 3.5L13 16"/>'),
  search: ui('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>'),
  code: ui('<path d="m8 6-6 6 6 6M16 6l6 6-6 6"/>'),
  copy: ui('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2"/>'),
  check: ui('<path d="M20 6 9 17l-5-5"/>'),
  eye: ui('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'),
  "eye-off": ui('<path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c7 0 10 7 10 7a13.4 13.4 0 0 1-2.2 3.2M6.6 6.6A13.3 13.3 0 0 0 2 12s3 7 10 7a10.9 10.9 0 0 0 3.4-.6"/><path d="m2 2 20 20"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
  mail: ui('<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="m3.5 7 8.5 5.5L20.5 7"/>'),
  package: ui('<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>'),
  "map-pin": ui('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
  building: ui('<path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M3 21h18M9.5 7h0M14.5 7h0M9.5 11h0M14.5 11h0M10 21v-4h4v4"/>'),
  compass: ui('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5Z"/>'),
  layers: ui('<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 12 9 5 9-5M3 16.5l9 5 9-5"/>'),
  palette: ui('<path d="M12 3a9 9 0 1 0 0 18 2 2 0 0 0 1.7-3 2 2 0 0 1 1.6-3.2H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z"/><circle cx="7.5" cy="11.5" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="15" cy="7.5" r="1"/>'),
  languages: ui('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
  wrench: ui('<path d="M14.5 5.5a4.5 4.5 0 0 0-5.9 5.9l-5 5a2 2 0 1 0 2.8 2.8l5-5a4.5 4.5 0 0 0 5.9-5.9l-2.5 2.5-2.3-.6-.6-2.3Z"/>'),
  database: ui('<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6M4 11.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>'),
  "book-open": ui('<path d="M12 6c-1.7-1.3-4.2-2-7-2v14c2.8 0 5.3.7 7 2 1.7-1.3 4.2-2 7-2V4c-2.8 0-5.3.7-7 2Z"/><path d="M12 6v14"/>'),
  "graduation-cap": ui('<path d="m12 4 10 5-10 5L2 9l10-5Z"/><path d="M6 11v5c0 1.3 2.7 3 6 3s6-1.7 6-3v-5"/><path d="M22 9v5"/>'),
  "shield-check": ui('<path d="M12 3 4 6v5.5c0 4.5 3.4 7.8 8 9.5 4.6-1.7 8-5 8-9.5V6Z"/><path d="m9 12 2 2 4-4"/>'),
  sprout: ui('<path d="M7 20h10M12 20v-9"/><path d="M12 11.5C12 8 9.5 5.5 5.5 5.5 5.5 9 8 11.5 12 11.5Z"/><path d="M12 13c0-3 2.3-5 6-5 0 3.2-2.5 5-6 5Z"/>'),
  lifelong: ui('<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/><path d="m12 8.3-4 1.8 4 1.8 4-1.8Z"/><path d="M9.8 11v1.8c0 .7 1 1.3 2.2 1.3s2.2-.6 2.2-1.3V11"/>'),
  star: uf('<path d="m12 3 2.7 5.8 6.3.6-4.8 4.2 1.5 6.2L12 17.3 6.3 20l1.5-6.2L3 9.6l6.3-.6Z"/>'),
  "git-fork": ui('<circle cx="6" cy="5" r="2.5"/><circle cx="18" cy="5" r="2.5"/><circle cx="12" cy="19" r="2.5"/><path d="M6 7.5v1A2.5 2.5 0 0 0 8.5 11h7A2.5 2.5 0 0 0 18 8.5v-1M12 11v5.5"/>'),
  scale: ui('<path d="M12 3v18M7 6h10M5 6l-3 7a3.5 3.5 0 0 0 7 0ZM19 6l-3 7a3.5 3.5 0 0 0 7 0ZM7 21h10"/>'),
  clock: ui('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  "book-marked": ui('<path d="M6 4a2 2 0 0 1 2-2h11v17H8a2 2 0 0 0-2 2Z"/><path d="M11 2v7l2.5-1.8L16 9V2"/><path d="M6 19a2 2 0 0 0 2 2h11"/>'),
  users: ui('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.4 2.9-5.5 6.5-5.5s6.5 2.1 6.5 5.5"/><path d="M16.5 4.6a3.5 3.5 0 0 1 0 6.8M21.5 20c0-2.6-1.7-4.5-4.3-5.2"/>'),
  calendar: ui('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 3v4M16 3v4"/>'),
};

/* ===================================================== Logos (marca) ==== */
/* Logos oficiales inline definidos en logos.js (Devicon / Apache / Wikimedia). */
const LOGOS = BRAND_LOGOS;
const MONO = new Set(["github"]);

function mountStatic(root = document) {
  $$("[data-ico]", root).forEach((el) => { if (!el.dataset.m) { el.innerHTML = UI[el.dataset.ico] || ""; el.dataset.m = "1"; } });
  $$("[data-logo]", root).forEach((el) => { if (!el.dataset.m) { el.classList.add("brand-logo"); el.innerHTML = LOGOS[el.dataset.logo] || ""; el.dataset.m = "1"; } });
}

/* =========================================================== i18n ======= */
const DICT = {
  es: {
    "nav.numbers": "Resumen", "nav.about": "Sobre mí", "nav.tech": "Tecnologías", "nav.project": "Proyecto", "nav.repos": "Repositorios", "nav.activity": "Actividad", "nav.contact": "Contacto",
    "hero.eyebrow": "Estudiante de programación · @Dinamo541",
    "hero.tagline": "Construyo aplicaciones y herramientas con <em>C</em>, <em>C++</em>, <em>Java</em> y <em>Python</em>.",
    "hero.showProfile": "Mostrar foto de perfil", "hero.hideProfile": "Ocultar foto de perfil", "hero.exploreCore": "Conoce CoreFx",
    "numbers.title": "GitHub en números", "numbers.sub": "Datos públicos en vivo desde la API de GitHub.",
    "about.title": "Sobre mí", "about.sub": "Tomo el trabajo repetitivo y lo convierto en herramientas reutilizables, limpias y bien probadas.",
    "about.f1.t": "Estudiante de programación", "about.f1.d": "Estudiante en la <strong>Universidad Nacional de Costa Rica</strong>, aplicando lo aprendido a diario en proyectos reales y de código abierto.",
    "about.f2.t": "Java &amp; JavaFX", "about.f2.d": "Mi terreno principal: apps de escritorio, motores de navegación y utilidades de UI.",
    "about.f3.t": "Publicado en Maven Central", "about.f3.d": "Autor de <strong>CoreFx</strong>, una librería sin dependencias disponible para cualquier proyecto.",
    "about.f4.t": "Código limpio y testeado", "about.f4.d": "Clases <code>final</code>, null-safe por contrato y cubiertas con pruebas unitarias.",
    "about.f5.t": "C / C++ y Python", "about.f5.d": "Exploro la programación de sistemas con C/C++ y la automatización con Python.",
    "about.f6.t": "Aprendizaje continuo", "about.f6.d": "Afinando diseño de software, testing y buenas prácticas de open source.",
    "tech.title": "Tecnologías", "tech.sub": "Las herramientas con las que trabajo y aprendo cada día.",
    "tech.cat.lang": "Lenguajes", "tech.cat.web": "Web", "tech.cat.frameworks": "Frameworks & librerías", "tech.cat.tools": "Herramientas",
    "project.title": "Proyecto destacado", "project.sub": "La pieza central en la que estoy invirtiendo más cariño ahora mismo.",
    "project.kicker": "Librería · Java + JavaFX", "project.lead": "La capa de fundación para aplicaciones JavaFX.",
    "project.desc": "Toda aplicación JavaFX reimplementa la misma fontanería: navegar entre pantallas, guardar el usuario, armar tablas, theming y validación. <strong>CoreFx es esa fontanería, hecha una vez y bien hecha.</strong>",
    "project.m1t": "Navegación", "project.m1d": "Un <code>FlowController</code> para cargar vistas FXML, cambiar escenas y abrir modales.",
    "project.m2t": "Estado compartido", "project.m2d": "Un <code>AppContext</code> thread-safe, desacoplado de tus pantallas.",
    "project.m3t": "Theming en vivo", "project.m3d": "Un <code>ThemeManager</code> que aplica temas CSS al vuelo.",
    "project.m4t": "i18n", "project.m4d": "Inyecta un <code>ResourceBundle</code> y cambia de idioma en runtime.",
    "project.m5t": "Utilidades", "project.m5d": "<code>Validator</code> null-safe, <code>TableUtils</code> tipado y más.",
    "project.m6t": "Persistencia", "project.m6d": "Un <code>EntityManagerHelper</code> agnóstico al proveedor.",
    "project.viewGithub": "Ver en GitHub", "project.docs": "Documentación", "project.addDep": "Añade la dependencia", "project.copy": "Copiar", "project.copied": "¡Copiado!",
    "pstat.tests": "Pruebas", "pstat.modules": "Módulos", "pstat.java": "Java", "pstat.deps": "Independiente",
    "repos.title": "Repositorios", "repos.sub": "Una selección de proyectos. Busca, filtra por lenguaje y ordénalos.",
    "repos.search": "Buscar repositorio…", "repos.allLangs": "Todos los lenguajes",
    "repos.sort.score": "Más relevantes", "repos.sort.updated": "Recientes", "repos.sort.stars": "Más estrellas", "repos.sort.forks": "Más forks", "repos.sort.name": "Nombre (A-Z)",
    "activity.title": "Actividad reciente", "activity.sub": "Últimos eventos públicos visibles en GitHub.",
    "contact.title": "Contacto", "contact.sub": "¿Trabajamos juntos o quieres saludar? Estos son mis canales.",
    "footer.quote": "«Toda solución comienza por comprender el problema.»", "footer.built": "Hecho con HTML, CSS y la API de GitHub.",
    "stat.followers": "Seguidores", "stat.following": "Siguiendo", "stat.repos": "Repos", "stat.stars": "Estrellas",
    "stat.totalRepos": "Repositorios", "stat.totalStars": "Estrellas totales", "stat.totalForks": "Forks totales", "stat.topLang": "Lenguaje principal", "stat.since": "En GitHub desde",
    "meta.email": "Email", "meta.maven": "Maven Central",
    "repo.public": "Público", "repo.fork": "Fork", "repo.archived": "Archivado", "repo.updated": "act.", "repo.noDesc": "Proyecto sin descripción todavía.", "repo.noLang": "Sin lenguaje",
    "bio.fallback": "Estudiante de programación construyendo proyectos y aprendiendo cada día.",
    "loading.activity": "cargando actividad…", "empty.repos": "No hay repositorios que coincidan con tu búsqueda.", "empty.activity": "No hay actividad pública reciente para mostrar.",
    "err.profile": "No se pudo cargar el perfil. GitHub puede estar limitando las peticiones; intenta de nuevo en un minuto.", "err.repos": "No se pudieron cargar los repositorios en este momento.",
  },
  en: {
    "nav.numbers": "Overview", "nav.about": "About", "nav.tech": "Tech", "nav.project": "Project", "nav.repos": "Repositories", "nav.activity": "Activity", "nav.contact": "Contact",
    "hero.eyebrow": "Programming student · @Dinamo541",
    "hero.tagline": "I build applications and tools with <em>C</em>, <em>C++</em>, <em>Java</em> and <em>Python</em>.",
    "hero.showProfile": "Show profile photo", "hero.hideProfile": "Hide profile photo", "hero.exploreCore": "Explore CoreFx",
    "numbers.title": "GitHub in numbers", "numbers.sub": "Live public data from the GitHub API.",
    "about.title": "About me", "about.sub": "I take repetitive work and turn it into reusable, clean and well-tested tools.",
    "about.f1.t": "Programming student", "about.f1.d": "Student at the <strong>National University of Costa Rica</strong>, applying what I learn every day in real-world and open-source projects.",
    "about.f2.t": "Java &amp; JavaFX", "about.f2.d": "My main turf: desktop apps, navigation engines and UI utilities.",
    "about.f3.t": "Published on Maven Central", "about.f3.d": "Author of <strong>CoreFx</strong>, a dependency-free library available to any project.",
    "about.f4.t": "Clean, tested code", "about.f4.d": "<code>final</code> classes, null-safe by contract and covered by unit tests.",
    "about.f5.t": "C / C++ and Python", "about.f5.d": "I explore systems programming with C/C++ and automation with Python.",
    "about.f6.t": "Always learning", "about.f6.d": "Sharpening software design, testing and open-source best practices.",
    "tech.title": "Technologies", "tech.sub": "The tools I work and learn with every day.",
    "tech.cat.lang": "Languages", "tech.cat.web": "Web", "tech.cat.frameworks": "Frameworks & libraries", "tech.cat.tools": "Tools",
    "project.title": "Featured project", "project.sub": "The centerpiece I'm pouring the most care into right now.",
    "project.kicker": "Library · Java + JavaFX", "project.lead": "The foundation layer for JavaFX applications.",
    "project.desc": "Every JavaFX app re-implements the same plumbing: switching screens, stashing the user, wiring tables, theming and validation. <strong>CoreFx is that plumbing, done once and done well.</strong>",
    "project.m1t": "Navigation", "project.m1d": "One <code>FlowController</code> to load FXML views, swap scenes and open modals.",
    "project.m2t": "Shared state", "project.m2d": "A thread-safe <code>AppContext</code>, decoupled from your screens.",
    "project.m3t": "Live theming", "project.m3d": "A <code>ThemeManager</code> that applies CSS themes on the fly.",
    "project.m4t": "i18n", "project.m4d": "Inject a <code>ResourceBundle</code> and switch locale at runtime.",
    "project.m5t": "Utilities", "project.m5d": "Null-safe <code>Validator</code>, typed <code>TableUtils</code> and more.",
    "project.m6t": "Persistence", "project.m6d": "A provider-agnostic <code>EntityManagerHelper</code>.",
    "project.viewGithub": "View on GitHub", "project.docs": "Documentation", "project.addDep": "Add the dependency", "project.copy": "Copy", "project.copied": "Copied!",
    "pstat.tests": "Tests", "pstat.modules": "Modules", "pstat.java": "Java", "pstat.deps": "Independent",
    "repos.title": "Repositories", "repos.sub": "A selection of projects. Search, filter by language and sort them.",
    "repos.search": "Search repository…", "repos.allLangs": "All languages",
    "repos.sort.score": "Most relevant", "repos.sort.updated": "Recent", "repos.sort.stars": "Most stars", "repos.sort.forks": "Most forks", "repos.sort.name": "Name (A-Z)",
    "activity.title": "Recent activity", "activity.sub": "Latest public events visible on GitHub.",
    "contact.title": "Contact", "contact.sub": "Want to work together or just say hi? These are my channels.",
    "footer.quote": "“Every solution begins with understanding the problem.”", "footer.built": "Built with HTML, CSS and the GitHub API.",
    "stat.followers": "Followers", "stat.following": "Following", "stat.repos": "Repos", "stat.stars": "Stars",
    "stat.totalRepos": "Repositories", "stat.totalStars": "Total stars", "stat.totalForks": "Total forks", "stat.topLang": "Top language", "stat.since": "On GitHub since",
    "meta.email": "Email", "meta.maven": "Maven Central",
    "repo.public": "Public", "repo.fork": "Fork", "repo.archived": "Archived", "repo.updated": "upd.", "repo.noDesc": "No description yet.", "repo.noLang": "No language",
    "bio.fallback": "Programming student building projects and learning every day.",
    "loading.activity": "loading activity…", "empty.repos": "No repositories match your search.", "empty.activity": "No recent public activity to show.",
    "err.profile": "Could not load the profile. GitHub may be rate-limiting requests; try again in a minute.", "err.repos": "Could not load the repositories right now.",
  },
};
const T = (k) => (DICT[LANG] && DICT[LANG][k]) || DICT.es[k] || k;

function applyI18n() {
  document.title = "Dominique Castro · Dinamo541";
  $$("[data-i18n]").forEach((el) => (el.textContent = T(el.dataset.i18n)));
  $$("[data-i18n-html]").forEach((el) => (el.innerHTML = T(el.dataset.i18nHtml)));
  $$("[data-i18n-attr]").forEach((el) => { const [a, k] = el.dataset.i18nAttr.split(":"); if (a && k) el.setAttribute(a, T(k)); });
}

/* ======================================================== Helpers ======= */
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
function animateCount(el, end, { duration = 1700, format = (v) => nf().format(v) } = {}) {
  if (el.dataset.counting === "1") return;
  el.dataset.counting = "1";
  const start = performance.now();
  (function step(now) {
    const p = Math.min(1, (now - start) / duration);
    el.textContent = format(Math.round(easeOutCubic(p) * end));
    if (p < 1) requestAnimationFrame(step);
    else { el.textContent = format(end); el.dataset.counting = "0"; }
  })(performance.now());
}
function inViewOnce(el, cb, threshold = 0.3) {
  if (!("IntersectionObserver" in window)) { cb(); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { cb(); io.disconnect(); } }), { threshold });
  io.observe(el);
}
function timeAgo(date) {
  const diff = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  const u = LANG === "en"
    ? [["y", 31536000], ["mo", 2592000], ["d", 86400], ["h", 3600], ["m", 60], ["s", 1]]
    : [["a", 31536000], ["mes", 2592000], ["d", 86400], ["h", 3600], ["m", 60], ["s", 1]];
  for (const [l, s] of u) { const n = Math.floor(diff / s); if (n >= 1) return LANG === "en" ? `${n}${l} ago` : `hace ${n}${l}`; }
  return LANG === "en" ? "now" : "ahora";
}
function termTime(date) {
  return new Intl.DateTimeFormat(LANG === "en" ? "en-US" : "es-ES", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(date));
}
const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const stripEmoji = (s) => String(s || "").replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{200D}\u{20E3}]/gu, "").replace(/\s{2,}/g, " ").trim();

/* logo de un lenguaje */
const LANG_LOGO = { Java: "java", C: "c", "C++": "cpp", Python: "python", JavaScript: "javascript", HTML: "html5", CSS: "css3" };
const LANG_COLOR = { TypeScript: "#3178c6", Kotlin: "#A97BFF", Shell: "#89e051", Makefile: "#427819", Batchfile: "#C1F12E", "C#": "#178600" };
function langGlyph(lang) {
  if (lang && LANG_LOGO[lang]) return `<span class="brand-logo">${LOGOS[LANG_LOGO[lang]]}</span>`;
  const c = (lang && LANG_COLOR[lang]) || "#8b95b5";
  return `<span style="width:9px;height:9px;border-radius:50%;background:${c}"></span>`;
}

/* ===================================================== Tech ============== */
const TECH = {
  "tech.cat.lang": [["C", "c"], ["C++", "cpp"], ["Java", "java"], ["Python", "python"]],
  "tech.cat.web": [["HTML5", "html5"], ["CSS3", "css3"], ["JavaScript", "javascript"]],
  "tech.cat.frameworks": [["JavaFX", "javafx"], ["SFML", "sfml"], ["JUnit 5", "junit"]],
  "tech.cat.tools": [["Maven", "maven"], ["Git", "git"], ["GitHub", "github"], ["VS Code", "vscode"], ["NetBeans", "netbeans"], ["Visual Studio", "visualstudio"]],
};
function renderTech() {
  let d = 0;
  $("#tech-wall").innerHTML = Object.entries(TECH).map(([cat, items]) => `
    <div class="tech-cat"><h4>${T(cat)}</h4><div class="tech-items">
      ${items.map(([name, logo]) => `<div class="tech-logo ${MONO.has(logo) ? "mono" : ""}" data-name="${name}" style="--d:${d++}"><span class="brand-logo">${LOGOS[logo]}</span></div>`).join("")}
    </div></div>`).join("");
}

/* ===================================================== About ============= */
const ABOUT = [
  { logo: "una", t: "about.f1.t", d: "about.f1.d", wide: true },
  { logo: "java", t: "about.f2.t", d: "about.f2.d" },
  { logo: "maven", t: "about.f3.t", d: "about.f3.d" },
  { logo: "junit", t: "about.f4.t", d: "about.f4.d" },
  { logo: "cpp", t: "about.f5.t", d: "about.f5.d", wide: true },
  { ico: "lifelong", t: "about.f6.t", d: "about.f6.d" },
];
function renderAbout() {
  $("#about-grid").innerHTML = ABOUT.map((a, i) => {
    const glyph = a.logo
      ? `<span class="brand-logo ${MONO.has(a.logo) ? "mono" : ""}">${LOGOS[a.logo]}</span>`
      : `<span class="i">${UI[a.ico]}</span>`;
    return `<article class="about-cell ${a.wide ? "wide" : ""}" data-spotlight style="--d:${i}">
      <div class="about-ico">${glyph}</div>
      <h3 data-i18n="${a.t}">${T(a.t)}</h3>
      <p data-i18n-html="${a.d}">${T(a.d)}</p>
    </article>`;
  }).join("");
}

/* ===================================================== Perfil =========== */
function renderProfile() {
  $("#name").textContent = user.name || `@${user.login}`;
  decorateName();
  $("#avatar").src = user.avatar_url;
  $("#avatar").alt = `Foto de perfil de ${user.name || user.login}`;
  $("#bio").textContent = stripEmoji(user.bio) || T("bio.fallback");
  const meta = [];
  if (user.location) meta.push({ ico: "map-pin", label: stripEmoji(user.location) });
  if (user.company) meta.push({ ico: "building", label: stripEmoji(user.company) });
  meta.push({ ico: "mail", label: T("meta.email"), href: `mailto:${EMAIL}` });
  meta.push({ ico: "package", label: T("meta.maven"), href: MAVEN_NS });
  $("#hero-meta").innerHTML = meta.map((m) => {
    const tag = m.href ? "a" : "span";
    const at = m.href ? `href="${m.href}" ${m.href.startsWith("http") ? 'target="_blank" rel="noopener noreferrer"' : ""}` : "";
    return `<${tag} class="meta-pill" ${at}><span class="i" data-ico="${m.ico}"></span>${escapeHtml(m.label)}</${tag}>`;
  }).join("");
}
function renderHeroStats(animate) {
  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const items = [["stat.followers", user.followers], ["stat.following", user.following], ["stat.repos", user.public_repos], ["stat.stars", totalStars]];
  $("#hero-stats").innerHTML = items.map(([k, v]) => `<div class="hero-stat"><div class="num" data-countup="${v}">${animate ? "0" : nf().format(v)}</div><div class="lbl">${T(k)}</div></div>`).join("");
  if (animate) $$("#hero-stats .num").forEach((el) => inViewOnce(el, () => animateCount(el, +el.dataset.countup)));
}

/* ===================================================== Números ========== */
function topLanguage() {
  const c = {};
  repos.filter((r) => !r.fork && r.language).forEach((r) => (c[r.language] = (c[r.language] || 0) + 1));
  const s = Object.entries(c).sort((a, b) => b[1] - a[1]);
  const total = s.reduce((a, [, n]) => a + n, 0) || 1;
  return { name: s[0] ? s[0][0] : "—", pct: s[0] ? s[0][1] / total : 0 };
}
function renderNumbers(animate) {
  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);
  const tl = topLanguage();
  const years = Math.max(1, new Date().getFullYear() - new Date(user.created_at).getFullYear());
  const numeric = [
    { ico: "book-marked", label: "stat.totalRepos", value: user.public_repos },
    { ico: "star", label: "stat.totalStars", value: totalStars },
    { ico: "git-fork", label: "stat.totalForks", value: totalForks },
    { ico: "users", label: "stat.followers", value: user.followers },
  ];
  const max = Math.max(1, ...numeric.map((n) => n.value));
  const cards = numeric.map((n) => ({ ...n, frac: n.value / max, text: nf().format(n.value), count: true }));
  cards.push({ ico: "code", label: "stat.topLang", text: tl.name, frac: Math.max(0.18, tl.pct), count: false });
  cards.push({ ico: "calendar", label: "stat.since", text: String(new Date(user.created_at).getFullYear()), frac: Math.min(1, years / 8), count: false });

  $("#stat-grid").innerHTML = cards.map((c) => `
    <div class="stat-card" data-spotlight style="--pct:${Math.round(c.frac * 100)}%">
      <div class="stat-card-top"><span class="stat-ico i" data-ico="${c.ico}"></span></div>
      <div class="stat-value" data-countup="${c.count ? c.value : ""}">${c.count && animate ? "0" : c.text}</div>
      <p class="stat-label">${T(c.label)}</p>
      <div class="stat-bar"><span></span></div>
    </div>`).join("");
  $$(".stat-card").forEach((card) => inViewOnce(card, () => {
    card.classList.add("in");
    const n = $(".stat-value", card);
    if (animate && n.dataset.countup) animateCount(n, +n.dataset.countup);
  }));
}

/* ===================================================== Project stats ===== */
const PSTATS = [{ n: 47, k: "pstat.tests" }, { n: 6, k: "pstat.modules" }, { n: 25, k: "pstat.java" }, { n: 100, suffix: "%", k: "pstat.deps" }];
function renderProjectStats(animate) {
  $("#project-stats").innerHTML = PSTATS.map((s) => `<div class="pstat"><div class="n" data-countup="${s.n}" data-suffix="${s.suffix || ""}">${animate ? "0" : s.n + (s.suffix || "")}</div><div class="l">${T(s.k)}</div></div>`).join("");
  if (animate) $$("#project-stats .n").forEach((el) => inViewOnce(el, () => animateCount(el, +el.dataset.countup, { format: (v) => nf().format(v) + (el.dataset.suffix || "") })));
}

/* ===================================================== Dependencias ====== */
const DEPS = [
  `<dependency>\n  <groupId>io.github.dinamo541</groupId>\n  <artifactId>corefx</artifactId>\n  <version>1.2.1</version>\n</dependency>`,
  `dependencies {\n    implementation("io.github.dinamo541:corefx:1.2.1")\n}`,
  `dependencies {\n    implementation 'io.github.dinamo541:corefx:1.2.1'\n}`,
];
let depActive = 0;
function renderDeps() {
  $("#dep-track").innerHTML = DEPS.map((d) => `<pre class="dep-panel"><code>${escapeHtml(d)}</code></pre>`).join("");
  setDep(depActive, false);
}
function setDep(i, animate) {
  depActive = i;
  const track = $("#dep-track");
  if (!animate) track.style.transition = "none";
  track.style.transform = `translateX(-${i * 100}%)`;
  if (!animate) requestAnimationFrame(() => (track.style.transition = ""));
  $$("#dep-tabs button").forEach((b, k) => b.classList.toggle("active", k === i));
  $(".dep-tab-thumb").style.transform = `translateX(${i * 100}%)`;
}
function setupDepTabs() {
  $$("#dep-tabs button").forEach((b, i) => b.addEventListener("click", () => setDep(i, true)));
}
function updateCopyLabel(copied) {
  const l = $("#copy-btn .copy-label");
  if (l) l.textContent = copied ? T("project.copied") : T("project.copy");
}
function setupCopy() {
  const btn = $("#copy-btn");
  btn.addEventListener("click", async () => {
    const text = DEPS[depActive];
    try { await navigator.clipboard.writeText(text); }
    catch (e) { const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (_) {} ta.remove(); }
    btn.classList.add("copied"); updateCopyLabel(true);
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { btn.classList.remove("copied"); updateCopyLabel(false); }, 1700);
  });
}

/* ===================================================== Repos ============= */
const repoScore = (r) => r.stargazers_count * 3 + r.forks_count * 2 + r.open_issues_count - (r.fork ? 5 : 0);
const COMP = {
  score: (a, b) => repoScore(b) - repoScore(a) || new Date(b.updated_at) - new Date(a.updated_at),
  updated: (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
  stars: (a, b) => b.stargazers_count - a.stargazers_count,
  forks: (a, b) => b.forks_count - a.forks_count,
  name: (a, b) => a.name.localeCompare(b.name),
};
function buildRepoControls() {
  const langs = [...new Set(repos.map((r) => r.language).filter(Boolean))].sort();
  $("#repo-language").innerHTML = `<option value="all">${T("repos.allLangs")}</option>` + langs.map((l) => `<option value="${l}">${l}</option>`).join("");
  $("#repo-sort").innerHTML = ["score", "updated", "stars", "forks", "name"].map((v) => `<option value="${v}">${T("repos.sort." + v)}</option>`).join("");
}
function syncRepoControls() {
  if ($("#repo-language").options[0]) $("#repo-language").options[0].textContent = T("repos.allLangs");
  $$("#repo-sort option").forEach((o) => (o.textContent = T("repos.sort." + o.value)));
}
function visibleRepos() {
  const q = ($("#repo-search").value || "").trim().toLowerCase();
  const lang = $("#repo-language").value || "all";
  const sort = $("#repo-sort").value || "score";
  let list = repos.slice();
  if (q) list = list.filter((r) => `${r.name} ${r.description || ""}`.toLowerCase().includes(q));
  if (lang !== "all") list = list.filter((r) => r.language === lang);
  return list.sort(COMP[sort] || COMP.score);
}
const repoFlag = (r) => (r.fork ? T("repo.fork") : r.archived ? T("repo.archived") : T("repo.public"));
function renderRepos() {
  const list = visibleRepos();
  const wrap = $("#repos-list");
  if (!list.length) { wrap.innerHTML = `<p class="state-msg empty">${T("empty.repos")}</p>`; return; }
  wrap.innerHTML = list.map((r) => {
    const lic = r.license && r.license.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : null;
    const big = r.language && LANG_LOGO[r.language] ? `<span class="brand-logo">${LOGOS[LANG_LOGO[r.language]]}</span>` : `<span class="i" data-ico="code"></span>`;
    return `<a class="repo-row" href="${r.html_url}" target="_blank" rel="noopener noreferrer">
      <span class="repo-logo">${big}</span>
      <span class="repo-body">
        <span class="repo-head"><span class="repo-name">${escapeHtml(r.name)}</span><span class="repo-flag">${repoFlag(r)}</span></span>
        <span class="repo-desc">${escapeHtml(r.description || T("repo.noDesc"))}</span>
        <span class="repo-tags">
          <span class="repo-tag">${langGlyph(r.language)} ${r.language || T("repo.noLang")}</span>
          <span class="repo-tag"><span class="i" data-ico="star"></span>${nf().format(r.stargazers_count)}</span>
          <span class="repo-tag"><span class="i" data-ico="git-fork"></span>${nf().format(r.forks_count)}</span>
          ${lic ? `<span class="repo-tag"><span class="i" data-ico="scale"></span>${lic}</span>` : ""}
          <span class="repo-tag"><span class="i" data-ico="clock"></span>${T("repo.updated")} ${timeAgo(r.updated_at)}</span>
        </span>
      </span>
      <span class="repo-go"><span class="i" data-ico="arrow-up-right"></span></span>
    </a>`;
  }).join("");
  mountStatic(wrap);
}

/* ===================================================== Actividad ======== */
function describeEvent(ev) {
  const p = ev.payload || {}, en = LANG === "en";
  switch (ev.type) {
    case "PushEvent": { const n = (p.commits && p.commits.length) || p.size || 1; return en ? `pushed ${n} commit${n === 1 ? "" : "s"} to` : `subió ${n} commit${n === 1 ? "" : "s"} a`; }
    case "CreateEvent": return en ? `created ${p.ref_type === "repository" ? "repo" : p.ref_type} in` : `creó ${p.ref_type === "repository" ? "el repo" : p.ref_type} en`;
    case "DeleteEvent": return en ? `deleted ${p.ref_type} in` : `eliminó ${p.ref_type} en`;
    case "WatchEvent": return en ? "starred" : "marcó con estrella";
    case "ForkEvent": return en ? "forked" : "hizo fork de";
    case "IssuesEvent": return en ? `${p.action === "opened" ? "opened" : "updated"} an issue in` : `${p.action === "opened" ? "abrió" : "actualizó"} un issue en`;
    case "IssueCommentEvent": return en ? "commented on" : "comentó en";
    case "PullRequestEvent": { const a = p.action === "opened" ? (en ? "opened" : "abrió") : p.action === "closed" ? (en ? "closed" : "cerró") : en ? "updated" : "actualizó"; return en ? `${a} a pull request in` : `${a} un pull request en`; }
    case "ReleaseEvent": return en ? "published a release in" : "publicó una release en";
    case "PublicEvent": return en ? "made public" : "hizo público";
    default: return en ? "activity in" : "actividad en";
  }
}
function commitSnippet(ev) {
  const commits = (ev.payload && ev.payload.commits) || [];
  if (!commits.length) return "";
  const last = commits[commits.length - 1];
  const msg = stripEmoji((last.message || "").split("\n")[0]);
  if (!msg) return "";
  const short = msg.length > 64 ? msg.slice(0, 63).trimEnd() + "…" : msg;
  return `<span class="log-msg">“${escapeHtml(short)}”</span>`;
}
function renderActivity() {
  const body = $("#terminal-body");
  const useful = (events || []).filter((ev) => ev.repo).slice(0, 12);
  if (!useful.length) {
    body.innerHTML = `<p class="terminal-empty">// ${T("empty.activity")}</p><div class="terminal-cursor"><span class="log-prompt">$</span><span class="blink"></span></div>`;
    return;
  }
  /* como en una consola real: lo más antiguo arriba y el evento/commit más reciente en la última línea */
  useful.reverse();
  body.innerHTML = useful.map((ev, i) => {
    const repo = ev.repo.name;
    return `<div class="log-line" style="--d:${i}"><span class="log-ts">[${termTime(ev.created_at)}]</span><span class="log-prompt">$</span><span class="log-action">${describeEvent(ev)}</span><a href="https://github.com/${repo}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo)}</a>${commitSnippet(ev)}</div>`;
  }).join("") + `<div class="terminal-cursor" style="--d:${useful.length}"><span class="log-prompt">$</span><span class="blink"></span></div>`;
  /* mantener la vista pegada a la última línea mientras se "imprimen" */
  const stick = () => { body.scrollTop = body.scrollHeight; };
  stick();
  clearTimeout(body._stick);
  body._stick = setTimeout(stick, useful.length * 80 + 700);
  $$(".log-line", body).forEach((l) => l.addEventListener("animationend", stick, { once: true }));
}

/* ===================================================== Idioma =========== */
function rerenderAll() {
  document.documentElement.lang = LANG;
  applyI18n();
  renderTech(); renderAbout(); renderProjectStats(false); renderDeps();
  updateProfileToggleLabel(); updateCopyLabel(false);
  if (user) { renderProfile(); renderHeroStats(false); renderNumbers(false); syncRepoControls(); renderRepos(); }
  renderActivity();
  mountStatic();
  setupSpotlight();
}
function setLang(lang) {
  const next = lang === "en" ? "en" : "es";
  document.documentElement.dataset.lang = next;
  if (next === LANG) return;
  document.body.classList.add("lang-out");
  clearTimeout(langTimer);
  langTimer = setTimeout(() => {
    LANG = next;
    try { localStorage.setItem("lang", LANG); } catch (e) {}
    rerenderAll();
    document.body.classList.remove("lang-out");
  }, 280);
}

/* ===================================================== Toggle perfil ===== */
function updateProfileToggleLabel() {
  const btn = $("#profile-toggle");
  const open = $("#profile-drawer").dataset.open === "true";
  $(".btn-label", btn).textContent = open ? T("hero.hideProfile") : T("hero.showProfile");
  const ico = $(".btn-ico", btn);
  if (ico) { ico.dataset.m = ""; ico.dataset.ico = open ? "eye-off" : "eye"; ico.innerHTML = UI[open ? "eye-off" : "eye"]; }
}
function setupProfileToggle() {
  const btn = $("#profile-toggle"), drawer = $("#profile-drawer");
  btn.addEventListener("click", () => {
    const open = drawer.dataset.open !== "true";
    drawer.dataset.open = String(open);
    btn.setAttribute("aria-expanded", String(open));
    updateProfileToggleLabel();
  });
}

/* ============================================ Iconos revelables ========== */
function setupIconReveal() {
  $$("[data-icon-reveal]").forEach((btn) => {
    const ico = $(".btn-ico", btn);
    if (!ico || btn.dataset.ir) return;
    btn.dataset.ir = "1";
    const enter = () => { ico.classList.remove("icon-out"); ico.classList.add("icon-in"); };
    const leave = () => { if (!ico.classList.contains("icon-in")) return; ico.classList.remove("icon-in"); ico.classList.add("icon-out"); };
    ico.addEventListener("animationend", (e) => { if (e.animationName === "icoOut") ico.classList.remove("icon-out"); });
    btn.addEventListener("mouseenter", enter);
    btn.addEventListener("mouseleave", leave);
    btn.addEventListener("focus", enter);
    btn.addEventListener("blur", leave);
  });
}

/* ============================================ Spotlight (mouse) ========== */
function setupSpotlight() {
  $$("[data-spotlight]").forEach((el) => {
    if (el.dataset.sp) return;
    el.dataset.sp = "1";
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    });
  });
}

/* ============================================ Reveal on scroll =========== */
function setupReveal() {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in-view")); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  els.forEach((e) => io.observe(e));
}

/* ============================================ Nav (scrollspy) ============ */
function setupNav() {
  const links = $$(".nav-links a"), indicator = $("#nav-indicator");
  const sections = links.map((a) => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);
  let activeLink = null;
  function move(link) {
    if (!link || innerWidth <= 1000) { indicator.style.opacity = "0"; return; }
    indicator.style.opacity = "1";
    indicator.style.width = link.offsetWidth + "px";
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;
  }
  function update() {
    const y = scrollY + innerHeight * 0.33;
    let cur = sections[0];
    for (const s of sections) if (s.offsetTop <= y) cur = s;
    if (innerHeight + scrollY >= document.body.scrollHeight - 2) cur = sections[sections.length - 1];
    const link = links.find((a) => a.getAttribute("href") === "#" + cur.id);
    if (link && link !== activeLink) { links.forEach((a) => a.classList.remove("active")); link.classList.add("active"); activeLink = link; move(link); }
  }
  let tick = false;
  addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(() => { update(); tick = false; }); } }, { passive: true });
  addEventListener("resize", () => move(activeLink));
  links.forEach((a) => a.addEventListener("mouseenter", () => innerWidth > 1000 && move(a)));
  $("#nav-links").addEventListener("mouseleave", () => move(activeLink));
  update();
}

/* ============================================ Menú móvil ================ */
function setupMobileMenu() {
  const nav = $("#nav"), burger = $("#burger"), links = $("#nav-links");
  const setOpen = (o) => {
    nav.classList.toggle("open", o);
    document.body.classList.toggle("menu-open", o);
    burger.setAttribute("aria-expanded", String(o));
    burger.setAttribute("aria-label", o ? (LANG === "en" ? "Close menu" : "Cerrar menú") : (LANG === "en" ? "Open menu" : "Abrir menú"));
  };
  burger.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
  links.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  addEventListener("resize", () => { if (innerWidth > 1000) setOpen(false); });
}

/* ==================================== Fondo animado (nebulosa viva) ===== */
/* Capas: nebulosas a la deriva → estrellas con profundidad y parpadeo →
   constelación de enlaces curvos con pulsos de luz → estrellas fugaces. */
function setupBackground() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = $("#bg-canvas"), ctx = c.getContext("2d");
  let w, h, dpr, raf, sf = 0;
  let pts = [], stars = [], nebulae = [], meteors = [];
  let mx = -9999, my = -9999, hx = -9999, hy = -9999; // cursor real + posición suavizada
  let nextMeteor = 0;
  const A = [116, 166, 255], B = [154, 140, 255], C = [95, 210, 194];
  const rand = (a, b) => a + Math.random() * (b - a);

  function makeNebulae() {
    /* manchas de color enormes que respiran y orbitan muy despacio */
    const palette = [A, B, C, A, B];
    nebulae = Array.from({ length: 5 }, (_, i) => ({
      cx: rand(0.1, 0.9), cy: rand(0.05, 0.95),
      r: rand(0.32, 0.52),
      hue: palette[i],
      spd: rand(0.00004, 0.00011) * (i % 2 ? 1 : -1),
      orbit: rand(0.05, 0.16),
      phase: rand(0, Math.PI * 2),
      pulse: rand(0.00018, 0.0004),
      alpha: rand(0.05, 0.085),
    }));
  }
  function resize() {
    dpr = Math.min(1.75, devicePixelRatio || 1);
    w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr;
    c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px";
    const n = Math.min(64, Math.floor((innerWidth * innerHeight) / 23000));
    const PALETTE = [A, B, C];
    pts = Array.from({ length: n }, (_, i) => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: rand(-0.09, 0.09) * dpr, vy: rand(-0.09, 0.09) * dpr,
      r: rand(0.8, 2.2) * dpr,
      hue: PALETTE[i % 3],
      ph: rand(0, Math.PI * 2),
    }));
    const ns = Math.min(150, Math.floor((innerWidth * innerHeight) / 9500));
    stars = Array.from({ length: ns }, () => ({
      x: Math.random(), y: Math.random(),
      z: Math.random(),                        // profundidad (0 lejos, 1 cerca)
      r: rand(0.4, 1.5),
      tw: rand(0.4, 1.6),                      // velocidad de parpadeo
      ph: rand(0, Math.PI * 2),
    }));
    makeNebulae();
  }
  function drawNebulae(t) {
    for (const nb of nebulae) {
      const ox = Math.cos(t * nb.spd + nb.phase) * nb.orbit;
      const oy = Math.sin(t * nb.spd * 1.3 + nb.phase) * nb.orbit;
      const x = (nb.cx + ox) * w, y = (nb.cy + oy) * h;
      const breath = 1 + Math.sin(t * nb.pulse + nb.phase) * 0.18;
      const rad = nb.r * Math.max(w, h) * breath;
      const [r, g, b] = nb.hue;
      const grd = ctx.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, `rgba(${r},${g},${b},${nb.alpha})`);
      grd.addColorStop(0.55, `rgba(${r},${g},${b},${nb.alpha * 0.45})`);
      grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grd;
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
  }
  function drawStars(t) {
    const parX = (hx > -9000 ? (hx / innerWidth - 0.5) : 0);
    const parY = (hy > -9000 ? (hy / innerHeight - 0.5) : 0);
    for (const s of stars) {
      const depth = 0.35 + s.z * 0.65;
      const px = ((s.x - parX * 0.022 * depth) % 1 + 1) % 1 * w;
      const py = ((s.y - parY * 0.022 * depth - sf * 0.06 * depth) % 1 + 1) % 1 * h;
      const twinkle = 0.32 + 0.68 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.tw + s.ph));
      const alpha = twinkle * (0.22 + s.z * 0.5);
      ctx.fillStyle = `rgba(214,228,255,${alpha})`;
      const r = s.r * depth * dpr;
      ctx.beginPath(); ctx.arc(px, py, r, 0, 6.2832); ctx.fill();
      if (s.z > 0.85 && twinkle > 0.8) {  // destello en cruz de las estrellas cercanas
        ctx.fillRect(px - r * 3.4, py - r * 0.22, r * 6.8, r * 0.44);
        ctx.fillRect(px - r * 0.22, py - r * 3.4, r * 0.44, r * 6.8);
      }
    }
  }
  function drawConstellation(t) {
    const max = 155 * dpr;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (hx > -9000) {
        const dx = hx * dpr - p.x, dy = hy * dpr - p.y, d = Math.hypot(dx, dy);
        if (d < 230 * dpr && d > 1) { p.x += (dx / d) * 0.26; p.y += (dy / d) * 0.26; }
      }
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      /* enlaces curvos que ondulan, con el color mezclado de ambos nodos */
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy);
        if (d >= max || d < 1) continue;
        const k = 1 - d / max;
        const r = (p.hue[0] + q.hue[0]) >> 1, g = (p.hue[1] + q.hue[1]) >> 1, b = (p.hue[2] + q.hue[2]) >> 1;
        const bend = Math.sin(t * 0.0005 + p.ph + q.ph) * d * 0.18;
        const cx = (p.x + q.x) / 2 - (dy / d) * bend;
        const cy = (p.y + q.y) / 2 + (dx / d) * bend;
        ctx.strokeStyle = `rgba(${r},${g},${b},${k * 0.17})`;
        ctx.lineWidth = dpr * (0.6 + k * 0.7);
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(cx, cy, q.x, q.y); ctx.stroke();
        /* pulso de luz que recorre algunos enlaces */
        if ((i + j) % 3 === 0 && k > 0.25) {
          const u = ((t * 0.00035 + p.ph * 0.35) % 1 + 1) % 1, iu = 1 - u;
          const px = iu * iu * p.x + 2 * iu * u * cx + u * u * q.x;
          const py = iu * iu * p.y + 2 * iu * u * cy + u * u * q.y;
          const pr = 3.2 * dpr, pg = ctx.createRadialGradient(px, py, 0, px, py, pr);
          pg.addColorStop(0, `rgba(255,255,255,${k * 0.55})`);
          pg.addColorStop(0.4, `rgba(${r},${g},${b},${k * 0.35})`);
          pg.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, py, pr, 0, 6.2832); ctx.fill();
        }
      }
      /* nodo con su propio matiz */
      const [nr, ng, nb] = p.hue;
      const rad = p.r * 4.2, grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
      grd.addColorStop(0, `rgba(${nr},${ng},${nb},0.5)`); grd.addColorStop(1, `rgba(${nr},${ng},${nb},0)`);
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, 6.2832); ctx.fill();
    }
  }
  function spawnMeteor(t) {
    const fromLeft = Math.random() < 0.5;
    meteors.push({
      x: fromLeft ? rand(-0.1, 0.35) * w : rand(0.55, 1.05) * w,
      y: rand(-0.08, 0.3) * h,
      vx: (fromLeft ? 1 : -1) * rand(5.5, 9) * dpr,
      vy: rand(3, 5.5) * dpr,
      life: 1,
      decay: rand(0.012, 0.02),
      hue: Math.random() < 0.5 ? A : B,
    });
    nextMeteor = t + rand(3500, 8500);
  }
  function drawMeteors(t) {
    if (t > nextMeteor) spawnMeteor(t);
    meteors = meteors.filter((m) => m.life > 0);
    for (const m of meteors) {
      const [r, g, b] = m.hue;
      const tail = 16;
      const tx = m.x - m.vx * tail, ty = m.y - m.vy * tail;
      const grd = ctx.createLinearGradient(m.x, m.y, tx, ty);
      grd.addColorStop(0, `rgba(255,255,255,${0.85 * m.life})`);
      grd.addColorStop(0.25, `rgba(${r},${g},${b},${0.4 * m.life})`);
      grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.strokeStyle = grd;
      ctx.lineWidth = 1.6 * dpr;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
      const head = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 5 * dpr);
      head.addColorStop(0, `rgba(255,255,255,${0.9 * m.life})`);
      head.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = head;
      ctx.beginPath(); ctx.arc(m.x, m.y, 5 * dpr, 0, 6.2832); ctx.fill();
      m.x += m.vx; m.y += m.vy; m.life -= m.decay;
    }
  }
  function frame(t) {
    /* posición del cursor suavizada (para el paralaje y la atracción de nodos) */
    if (mx > -9000) {
      hx = hx < -9000 ? mx : hx + (mx - hx) * 0.08;
      hy = hy < -9000 ? my : hy + (my - hy) * 0.08;
    }
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    drawNebulae(t);
    drawStars(t);
    drawConstellation(t);
    drawMeteors(t);
    ctx.globalCompositeOperation = "source-over";
    raf = requestAnimationFrame(frame);
  }
  const onScroll = () => { const m = document.body.scrollHeight - innerHeight; sf = m > 0 ? Math.min(1, Math.max(0, scrollY / m)) : 0; };
  resize(); onScroll(); raf = requestAnimationFrame(frame);
  addEventListener("resize", resize, { passive: true });
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame); });
}

/* ============================== Nombre del hero letra a letra ============ */
function decorateName() {
  const el = $("#name");
  if (!el) return;
  const text = el.textContent;
  if (!text || (el.dataset.split === text && $(".char", el))) return;
  el.dataset.split = text;
  el.classList.add("hero-name--split");
  const total = Math.max(1, [...text.replace(/\s+/g, "")].length - 1);
  /* aproxima el degradado del título coloreando cada letra */
  const G = [[238, 243, 255], [182, 204, 255], [155, 176, 255]];
  const colorAt = (t) => {
    const [p, q, k] = t < 0.55 ? [G[0], G[1], t / 0.55] : [G[1], G[2], (t - 0.55) / 0.45];
    return `rgb(${p.map((v, i) => Math.round(v + (q[i] - v) * k)).join(",")})`;
  };
  let ci = 0;
  el.innerHTML = text.split(/\s+/).map((word) =>
    `<span class="word">` + [...word].map((ch) =>
      `<span class="char" style="--ci:${ci};color:${colorAt(ci++ / total)}">${escapeHtml(ch)}</span>`
    ).join("") + `</span>`
  ).join(" ");
}

/* ============================== Barra de progreso de scroll ============== */
function setupScrollProgress() {
  const bar = $("#scroll-progress"), nav = $("#nav");
  let tick = false;
  const update = () => {
    const m = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${m > 0 ? Math.min(1, scrollY / m) : 0})`;
    nav.classList.toggle("scrolled", scrollY > 10);
  };
  addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(() => { update(); tick = false; }); } }, { passive: true });
  addEventListener("resize", update, { passive: true });
  update();
}

/* ===================================================== Carga ============ */
async function load() {
  const [pRes, rRes, eRes] = await Promise.allSettled([fetch(URLS.profile), fetch(URLS.repos), fetch(URLS.events)]);
  try {
    if (pRes.status !== "fulfilled" || !pRes.value.ok) throw new Error(T("err.profile"));
    if (rRes.status !== "fulfilled" || !rRes.value.ok) throw new Error(T("err.repos"));
    user = await pRes.value.json();
    repos = await rRes.value.json();
    renderProfile(); renderHeroStats(true); renderNumbers(true);
    buildRepoControls(); renderRepos(); updateProfileToggleLabel();
    mountStatic(); setupSpotlight();
  } catch (err) {
    $("#name").textContent = LANG === "en" ? "Could not load profile" : "No se pudo cargar el perfil";
    decorateName();
    $("#bio").textContent = err.message;
    $("#stat-grid").innerHTML = `<p class="state-msg error">${err.message}</p>`;
    $("#repos-list").innerHTML = `<p class="state-msg error">${err.message}</p>`;
  }
  try { events = eRes.status === "fulfilled" && eRes.value.ok ? await eRes.value.json() : []; } catch { events = []; }
  renderActivity();
}

/* ===================================================== Init ============= */
function init() {
  $("#year").textContent = new Date().getFullYear();
  applyI18n();
  renderTech(); renderAbout(); renderProjectStats(true); renderDeps();
  $("#terminal-body").innerHTML = `<div class="terminal-cursor"><span class="log-prompt">$</span><span class="log-action">${T("loading.activity")}</span><span class="blink"></span></div>`;
  mountStatic();

  setupProfileToggle(); setupIconReveal(); setupDepTabs(); setupCopy();
  setupReveal(); setupNav(); setupMobileMenu(); setupBackground(); setupSpotlight();
  setupScrollProgress(); decorateName();

  $("#repo-search").addEventListener("input", renderRepos);
  $("#repo-language").addEventListener("change", renderRepos);
  $("#repo-sort").addEventListener("change", renderRepos);
  $$(".lang [data-lang-set]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.langSet)));

  load();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
