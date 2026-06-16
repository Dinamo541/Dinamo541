/* =========================================================================
   Dominique Mariano · Dinamo541 — dashboard en vivo sobre la API de GitHub.
   Bilingüe (ES / EN): el texto estático se cambia por CSS según data-lang;
   el texto generado aquí se cambia con el diccionario STR y un re-render.
   Perfil + repos son obligatorios; la actividad es best-effort.
   ========================================================================= */
const username = "Dinamo541";
const API = "https://api.github.com";
const profileUrl = `${API}/users/${username}`;
const reposUrl = `${API}/users/${username}/repos?sort=updated&per_page=100`;
const eventsUrl = `${API}/users/${username}/events/public?per_page=30`;

/* ------------------------------------------------------------- DOM refs */
const avatar = document.getElementById("avatar");
const nameEl = document.getElementById("name");
const bioEl = document.getElementById("bio");
const quickLinks = document.getElementById("quick-links");
const statsEl = document.getElementById("stats");
const profileLink = document.getElementById("profile-link");
const overviewGrid = document.getElementById("overview-grid");
const reposGrid = document.getElementById("repos-grid");
const repoSearch = document.getElementById("repo-search");
const repoLanguage = document.getElementById("repo-language");
const repoSort = document.getElementById("repo-sort");
const activityList = document.getElementById("activity-list");
const repoCardTemplate = document.getElementById("repo-card-template");

const nf = new Intl.NumberFormat("es-AR");
let allRepos = [];
let currentUser = null;
let currentEvents = [];

/* ------------------------------------------------------------- i18n */
let LANG = document.documentElement.dataset.lang === "en" ? "en" : "es";

const STR = {
  es: {
    title: "Dominique Mariano · Dinamo541 — Estudiante de programación",
    followers: "Seguidores", following: "Siguiendo", publicRepos: "Repos públicos", stars: "Estrellas",
    ovRepos: "Repositorios públicos", ovStars: "Estrellas totales", ovForks: "Forks totales",
    ovFollowers: "Seguidores", ovTopLang: "Lenguaje principal", ovSince: "En GitHub desde",
    email: "Email", maven: "Maven Central",
    public: "Público", fork: "Fork", archived: "Archivado",
    updated: "Actualizado", open: "Abrir ↗", noDesc: "Proyecto sin descripción todavía.",
    loadingRepos: "Cargando repositorios…", loadingActivity: "Cargando actividad…",
    noMatch: "No hay repositorios que coincidan con tu búsqueda.",
    noActivity: "No hay actividad pública reciente para mostrar.",
    bioFallback: "Estudiante de programación construyendo proyectos y aprendiendo cada día.",
    errProfile: "No se pudo cargar el perfil. GitHub puede estar limitando las peticiones; intenta de nuevo en un minuto.",
    errRepos: "No se pudieron cargar los repositorios en este momento.",
    errName: "No se pudo cargar el perfil", errRetry: "Intenta de nuevo más tarde.",
    searchPlaceholder: "Buscar repositorio…", allLanguages: "Todos los lenguajes",
    sort: { score: "Más relevantes", updated: "Recientes", stars: "Más estrellas", forks: "Más forks", name: "Nombre (A-Z)" },
  },
  en: {
    title: "Dominique Mariano · Dinamo541 — Programming student",
    followers: "Followers", following: "Following", publicRepos: "Public repos", stars: "Stars",
    ovRepos: "Public repositories", ovStars: "Total stars", ovForks: "Total forks",
    ovFollowers: "Followers", ovTopLang: "Top language", ovSince: "On GitHub since",
    email: "Email", maven: "Maven Central",
    public: "Public", fork: "Fork", archived: "Archived",
    updated: "Updated", open: "Open ↗", noDesc: "No description yet.",
    loadingRepos: "Loading repositories…", loadingActivity: "Loading activity…",
    noMatch: "No repositories match your search.",
    noActivity: "No recent public activity to show.",
    bioFallback: "Programming student building projects and learning every day.",
    errProfile: "Could not load the profile. GitHub may be rate-limiting requests; try again in a minute.",
    errRepos: "Could not load the repositories right now.",
    errName: "Could not load the profile", errRetry: "Please try again later.",
    searchPlaceholder: "Search repository…", allLanguages: "All languages",
    sort: { score: "Most relevant", updated: "Recent", stars: "Most stars", forks: "Most forks", name: "Name (A-Z)" },
  },
};
const t = () => STR[LANG];

/* GitHub linguist colors (subconjunto) para el punto de lenguaje. */
const LANG_COLORS = {
  Java: "#b07219", C: "#555555", "C++": "#f34b7d", "C#": "#178600",
  Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#3178c6",
  HTML: "#e34c26", CSS: "#563d7c", SCSS: "#c6538c", Shell: "#89e051",
  Kotlin: "#A97BFF", Go: "#00ADD8", Rust: "#dea584", Ruby: "#701516",
  PHP: "#4F5D95", Swift: "#F05138", Dart: "#00B4AB", Lua: "#000080",
  "Jupyter Notebook": "#DA5B0B", Dockerfile: "#384d54", Makefile: "#427819",
  Vue: "#41b883", Assembly: "#6E4C13", Batchfile: "#C1F12E",
};
const langColor = (lang) => LANG_COLORS[lang] || "#8b9bbd";

/* ------------------------------------------------------------- Helpers */
function timeAgo(dateString) {
  const diff = Math.max(1, Math.floor((Date.now() - new Date(dateString).getTime()) / 1000));
  const units =
    LANG === "en"
      ? [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1]]
      : [["año", 31536000], ["mes", 2592000], ["día", 86400], ["hora", 3600], ["minuto", 60], ["segundo", 1]];
  for (const [label, secs] of units) {
    const n = Math.floor(diff / secs);
    if (n >= 1) {
      if (LANG === "en") return `${n} ${label}${n === 1 ? "" : "s"} ago`;
      const plural = n === 1 ? "" : label === "mes" ? "es" : "s";
      return `hace ${n} ${label}${plural}`;
    }
  }
  return LANG === "en" ? "just now" : "hace un momento";
}

function formatSize(kb) {
  if (kb < 1024) return `${nf.format(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

/* ------------------------------------------------------------- Header */
function renderProfile(user) {
  avatar.src = user.avatar_url;
  avatar.alt = `Avatar de ${user.login}`;
  nameEl.textContent = user.name ? `${user.name} (@${user.login})` : `@${user.login}`;
  bioEl.textContent = user.bio || t().bioFallback;
  profileLink.href = user.html_url;

  quickLinks.innerHTML = "";
  const links = [];
  if (user.location) links.push({ icon: "📍", label: user.location });
  if (user.company) links.push({ icon: "🏢", label: user.company });
  if (user.twitter_username)
    links.push({
      icon: "🐦",
      label: `@${user.twitter_username}`,
      href: `https://twitter.com/${user.twitter_username}`,
    });
  links.push({ icon: "✉️", label: t().email, href: "mailto:dominiquecastro81@gmail.com" });
  links.push({
    icon: "📦",
    label: t().maven,
    href: "https://central.sonatype.com/namespace/io.github.dinamo541",
  });

  links.forEach((l) => {
    const node = document.createElement(l.href ? "a" : "span");
    node.className = "inline-link";
    if (l.href) {
      node.href = l.href;
      if (l.href.startsWith("http")) {
        node.target = "_blank";
        node.rel = "noopener noreferrer";
      }
    }
    node.innerHTML = `<span>${l.icon}</span> ${l.label}`;
    quickLinks.appendChild(node);
  });
}

/* ------------------------------------------------------------- Stat pills */
function renderStats(user, repos) {
  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const pills = [
    `${t().followers}: ${nf.format(user.followers)}`,
    `${t().following}: ${nf.format(user.following)}`,
    `${t().publicRepos}: ${nf.format(user.public_repos)}`,
    `${t().stars}: ${nf.format(totalStars)}`,
  ];
  statsEl.innerHTML = "";
  pills.forEach((p) => statsEl.appendChild(el("span", "stat-pill", p)));
}

/* ------------------------------------------------------------- Overview */
function topLanguage(repos) {
  const counts = {};
  repos.filter((r) => !r.fork && r.language).forEach((r) => {
    counts[r.language] = (counts[r.language] || 0) + 1;
  });
  const entry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return entry ? entry[0] : "—";
}

function renderOverview(user, repos) {
  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);
  const items = [
    [t().ovRepos, nf.format(user.public_repos)],
    [t().ovStars, nf.format(totalStars)],
    [t().ovForks, nf.format(totalForks)],
    [t().ovFollowers, nf.format(user.followers)],
    [t().ovTopLang, topLanguage(repos)],
    [t().ovSince, new Date(user.created_at).getFullYear().toString()],
  ];
  overviewGrid.innerHTML = "";
  items.forEach(([label, value]) => {
    const card = el("div", "overview-item");
    card.appendChild(el("p", "overview-label", label));
    card.appendChild(el("p", "overview-value", value));
    overviewGrid.appendChild(card);
  });
}

/* ------------------------------------------------------------- Repos */
function repoScore(r) {
  return r.stargazers_count * 3 + r.forks_count * 2 + r.open_issues_count - (r.fork ? 5 : 0);
}

const COMPARATORS = {
  score: (a, b) => repoScore(b) - repoScore(a) || new Date(b.updated_at) - new Date(a.updated_at),
  updated: (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
  stars: (a, b) => b.stargazers_count - a.stargazers_count,
  forks: (a, b) => b.forks_count - a.forks_count,
  name: (a, b) => a.name.localeCompare(b.name),
};

function buildLanguageFilter(repos) {
  const langs = [...new Set(repos.map((r) => r.language).filter(Boolean))].sort();
  langs.forEach((lang) => {
    const opt = document.createElement("option");
    opt.value = lang;
    opt.textContent = lang;
    repoLanguage.appendChild(opt);
  });
}

function visibleRepos() {
  const q = (repoSearch?.value || "").trim().toLowerCase();
  const lang = repoLanguage?.value || "all";
  const sort = repoSort?.value || "score";
  let list = allRepos.slice();
  if (q) list = list.filter((r) => `${r.name} ${r.description || ""}`.toLowerCase().includes(q));
  if (lang !== "all") list = list.filter((r) => r.language === lang);
  list.sort(COMPARATORS[sort] || COMPARATORS.score);
  return list;
}

function repoBadge(repo) {
  if (repo.fork) return t().fork;
  if (repo.archived) return t().archived;
  return t().public;
}

function renderRepos() {
  const repos = visibleRepos();
  reposGrid.innerHTML = "";

  if (!repos.length) {
    reposGrid.innerHTML = `<p class="empty">${t().noMatch}</p>`;
    return;
  }

  repos.forEach((repo) => {
    const frag = repoCardTemplate.content.cloneNode(true);
    frag.querySelector(".repo-name").textContent = repo.name;
    frag.querySelector(".repo-visibility").textContent = repoBadge(repo);
    frag.querySelector(".repo-desc").textContent = repo.description || t().noDesc;

    const langEl = frag.querySelector(".repo-lang");
    if (repo.language) {
      langEl.innerHTML =
        `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:${langColor(repo.language)}"></span>${repo.language}`;
    } else {
      langEl.remove();
    }

    const sizeEl = frag.querySelector(".repo-size");
    if (sizeEl) sizeEl.textContent = formatSize(repo.size);

    const licenseEl = frag.querySelector(".repo-license");
    if (licenseEl) {
      if (repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION") {
        licenseEl.textContent = repo.license.spdx_id;
      } else {
        licenseEl.remove();
      }
    }

    frag.querySelector(".repo-stars").textContent = `★ ${nf.format(repo.stargazers_count)}`;
    frag.querySelector(".repo-forks").textContent = `⑂ ${nf.format(repo.forks_count)}`;
    frag.querySelector(".repo-updated").textContent = `${t().updated} ${timeAgo(repo.updated_at)}`;
    const linkEl = frag.querySelector(".repo-link");
    linkEl.href = repo.html_url;
    linkEl.textContent = t().open;

    reposGrid.appendChild(frag);
  });
}

/* ------------------------------------------------------------- Activity */
function describeEvent(ev) {
  const repo = ev.repo?.name || "";
  const link = `<a href="https://github.com/${repo}" target="_blank" rel="noopener noreferrer">${repo}</a>`;
  const p = ev.payload || {};
  const en = LANG === "en";
  switch (ev.type) {
    case "PushEvent": {
      const n = p.commits?.length || p.size || 1;
      return {
        icon: "📤",
        text: en ? `Pushed ${n} commit${n === 1 ? "" : "s"} to ${link}` : `Subió ${n} commit${n === 1 ? "" : "s"} a ${link}`,
      };
    }
    case "CreateEvent":
      return {
        icon: "✨",
        text: en
          ? `Created ${p.ref_type === "repository" ? "repository" : `${p.ref_type} in`} ${link}`
          : `Creó ${p.ref_type === "repository" ? "el repositorio" : `${p.ref_type} en`} ${link}`,
      };
    case "DeleteEvent":
      return { icon: "🗑️", text: en ? `Deleted ${p.ref_type} in ${link}` : `Eliminó ${p.ref_type} en ${link}` };
    case "WatchEvent":
      return { icon: "⭐", text: en ? `Starred ${link}` : `Marcó con estrella ${link}` };
    case "ForkEvent":
      return { icon: "🍴", text: en ? `Forked ${link}` : `Hizo fork de ${link}` };
    case "IssuesEvent":
      return {
        icon: "🐛",
        text: en
          ? `${p.action === "opened" ? "Opened" : "Updated"} an issue in ${link}`
          : `${p.action === "opened" ? "Abrió" : "Actualizó"} un issue en ${link}`,
      };
    case "IssueCommentEvent":
      return { icon: "💬", text: en ? `Commented on ${link}` : `Comentó en ${link}` };
    case "PullRequestEvent": {
      const act = en
        ? p.action === "opened" ? "Opened" : p.action === "closed" ? "Closed" : "Updated"
        : p.action === "opened" ? "Abrió" : p.action === "closed" ? "Cerró" : "Actualizó";
      return { icon: "🔀", text: en ? `${act} a pull request in ${link}` : `${act} un pull request en ${link}` };
    }
    case "ReleaseEvent":
      return { icon: "🏷️", text: en ? `Published a release in ${link}` : `Publicó una release en ${link}` };
    case "PublicEvent":
      return { icon: "🌍", text: en ? `Made ${link} public` : `Hizo público ${link}` };
    default:
      return { icon: "•", text: en ? `Activity in ${link}` : `Actividad en ${link}` };
  }
}

function renderActivity(events) {
  activityList.innerHTML = "";
  const useful = (events || []).filter((ev) => ev.repo);
  if (!useful.length) {
    activityList.innerHTML = `<li class="activity-item empty">${t().noActivity}</li>`;
    return;
  }
  useful.slice(0, 10).forEach((ev) => {
    const { icon, text } = describeEvent(ev);
    const li = el("li", "activity-item");
    li.innerHTML = `<span class="activity-icon">${icon}</span> ${text}<span class="activity-time">${timeAgo(ev.created_at)}</span>`;
    activityList.appendChild(li);
  });
}

/* ------------------------------------------------------------- Language toggle */
function updateDynamicLabels() {
  document.title = t().title;
  if (repoSearch) repoSearch.placeholder = t().searchPlaceholder;
  if (repoLanguage && repoLanguage.options[0]) repoLanguage.options[0].textContent = t().allLanguages;
  if (repoSort) {
    [...repoSort.options].forEach((o) => {
      if (t().sort[o.value]) o.textContent = t().sort[o.value];
    });
  }
}

function applyLang(lang) {
  LANG = lang === "en" ? "en" : "es";
  document.documentElement.dataset.lang = LANG;
  document.documentElement.lang = LANG;
  try {
    localStorage.setItem("lang", LANG);
  } catch (e) {
    /* ignore */
  }
  updateDynamicLabels();
  if (currentUser) {
    renderProfile(currentUser);
    renderStats(currentUser, allRepos);
    renderOverview(currentUser, allRepos);
    renderRepos();
  }
  renderActivity(currentEvents);
}

/* ------------------------------------------------------------- Tabs */
function wireTabs() {
  document.querySelectorAll(".tabs").forEach((group) => {
    const btns = group.querySelectorAll(".tab-btns button");
    const panels = group.querySelectorAll(".tab-panel");
    btns.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        btns.forEach((b) => b.classList.remove("active"));
        panels.forEach((pp) => pp.classList.remove("active"));
        btn.classList.add("active");
        if (panels[i]) panels[i].classList.add("active");
      });
    });
  });
}

/* ------------------------------------------------------------- Scrollspy */
function setupScrollSpy() {
  const links = [...document.querySelectorAll(".nav-links a")];
  const map = new Map();
  links.forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    const section = document.getElementById(id);
    if (section) map.set(section, a);
  });
  if (!map.size || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((a) => a.classList.remove("active"));
          map.get(entry.target)?.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  map.forEach((_, section) => observer.observe(section));
}

/* ------------------------------------------------------------- Boot */
async function loadPage() {
  document.getElementById("year").textContent = new Date().getFullYear();
  updateDynamicLabels();
  reposGrid.innerHTML = `<p class="empty">${t().loadingRepos}</p>`;
  activityList.innerHTML = `<li class="activity-item empty">${t().loadingActivity}</li>`;

  const [profileRes, reposRes, eventsRes] = await Promise.allSettled([
    fetch(profileUrl),
    fetch(reposUrl),
    fetch(eventsUrl),
  ]);

  try {
    if (profileRes.status !== "fulfilled" || !profileRes.value.ok) throw new Error(t().errProfile);
    if (reposRes.status !== "fulfilled" || !reposRes.value.ok) throw new Error(t().errRepos);

    currentUser = await profileRes.value.json();
    allRepos = await reposRes.value.json();

    renderProfile(currentUser);
    renderStats(currentUser, allRepos);
    renderOverview(currentUser, allRepos);
    buildLanguageFilter(allRepos);
    renderRepos();
  } catch (error) {
    nameEl.textContent = t().errName;
    bioEl.textContent = t().errRetry;
    overviewGrid.innerHTML = `<p class="error">${error.message}</p>`;
    reposGrid.innerHTML = `<p class="error">${error.message}</p>`;
  }

  try {
    if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
      currentEvents = await eventsRes.value.json();
    } else {
      currentEvents = [];
    }
  } catch {
    currentEvents = [];
  }
  renderActivity(currentEvents);
}

/* ------------------------------------------------------------- Wiring */
repoSearch?.addEventListener("input", renderRepos);
repoLanguage?.addEventListener("change", renderRepos);
repoSort?.addEventListener("change", renderRepos);
document.querySelectorAll(".lang-switch [data-lang-set]").forEach((b) =>
  b.addEventListener("click", () => applyLang(b.dataset.langSet))
);

wireTabs();
setupScrollSpy();
loadPage();
