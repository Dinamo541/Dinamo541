const username = "Dinamo541";
const apiBase = "https://api.github.com";
const profileUrl = `${apiBase}/users/${username}`;
const reposUrl = `${apiBase}/users/${username}/repos?sort=updated&per_page=100`;
const eventsUrl = `${apiBase}/users/${username}/events/public?per_page=12`;

const avatar = document.getElementById("avatar");
const nameEl = document.getElementById("name");
const bioEl = document.getElementById("bio");
const statsEl = document.getElementById("stats");
const quickLinksEl = document.getElementById("quick-links");
const profileLink = document.getElementById("profile-link");
const overviewGrid = document.getElementById("overview-grid");
const reposGrid = document.getElementById("repos-grid");
const activityList = document.getElementById("activity-list");
const repoCardTemplate = document.getElementById("repo-card-template");
const repoSearch = document.getElementById("repo-search");
const repoLanguage = document.getElementById("repo-language");
const repoSort = document.getElementById("repo-sort");

const nf = new Intl.NumberFormat("es-AR");
let allRepos = [];

function daysSince(dateString) {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const days = Math.max(1, Math.floor((now - date) / (1000 * 60 * 60 * 24)));
  return `${days} día${days === 1 ? "" : "s"}`;
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(dateString));
}

function formatRepoSize(kb) {
  if (kb > 1024) {
    return `${(kb / 1024).toFixed(1)} MB`;
  }
  return `${kb} KB`;
}

function renderQuickLinks(user) {
  quickLinksEl.innerHTML = "";

  const links = [
    { href: user.blog, label: "Sitio web" },
    { href: `https://github.com/${user.login}?tab=repositories`, label: "Repositorios" },
    { href: `https://github.com/${user.login}?tab=followers`, label: "Seguidores" },
  ].filter((item) => item.href);

  links.forEach((item) => {
    const a = document.createElement("a");
    a.className = "inline-link";
    a.href = item.href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = item.label;
    quickLinksEl.appendChild(a);
  });
}

function renderStats(user) {
  const stats = [
    `Seguidores: ${nf.format(user.followers)}`,
    `Siguiendo: ${nf.format(user.following)}`,
    `Repos públicos: ${nf.format(user.public_repos)}`,
    user.company ? `Empresa: ${user.company}` : null,
    user.location ? `Ubicación: ${user.location}` : null,
  ].filter(Boolean);

  statsEl.innerHTML = "";
  stats.forEach((stat) => {
    const span = document.createElement("span");
    span.className = "stat-pill";
    span.textContent = stat;
    statsEl.appendChild(span);
  });
}

function computeTopLanguages(repos) {
  const langMap = new Map();
  repos.forEach((repo) => {
    if (repo.language) {
      langMap.set(repo.language, (langMap.get(repo.language) || 0) + 1);
    }
  });

  return [...langMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([lang, count]) => `${lang} (${count})`)
    .join(" · ");
}

function renderOverview(user, repos) {
  const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
  const totalForks = repos.reduce((acc, repo) => acc + repo.forks_count, 0);
  const activeRepos = repos.filter((repo) => Date.now() - new Date(repo.updated_at).getTime() <= 30 * 24 * 60 * 60 * 1000).length;
  const latestPush = repos
    .map((repo) => new Date(repo.pushed_at).getTime())
    .sort((a, b) => b - a)[0];

  const overviewItems = [
    { label: "Usuario", value: `@${user.login}` },
    { label: "Cuenta creada", value: formatDate(user.created_at) },
    { label: "Último update detectado", value: latestPush ? formatDate(latestPush) : "N/A" },
    { label: "Total estrellas", value: `★ ${nf.format(totalStars)}` },
    { label: "Total forks", value: `⑂ ${nf.format(totalForks)}` },
    { label: "Repos activos", value: nf.format(activeRepos) },
    { label: "Lenguajes más usados", value: computeTopLanguages(repos) || "Sin datos" },
    { label: "Gists públicos", value: nf.format(user.public_gists) },
  ];

  overviewGrid.innerHTML = "";
  overviewItems.forEach((item) => {
    const block = document.createElement("article");
    block.className = "overview-item";
    block.innerHTML = `<p class="overview-label">${item.label}</p><p class="overview-value">${item.value}</p>`;
    overviewGrid.appendChild(block);
  });
}

function repoScore(repo) {
  return repo.stargazers_count * 4 + repo.forks_count * 2 + repo.open_issues_count;
}

function updateLanguageFilter(repos) {
  const langs = [...new Set(repos.map((repo) => repo.language).filter(Boolean))].sort();
  repoLanguage.innerHTML = '<option value="all">Todos los lenguajes</option>';
  langs.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang;
    option.textContent = lang;
    repoLanguage.appendChild(option);
  });
}

function applyRepoFilters(repos) {
  const term = repoSearch.value.trim().toLowerCase();
  const selectedLanguage = repoLanguage.value;
  const sortBy = repoSort.value;

  const filtered = repos.filter((repo) => {
    const matchesTerm =
      !term ||
      repo.name.toLowerCase().includes(term) ||
      (repo.description && repo.description.toLowerCase().includes(term));
    const matchesLanguage = selectedLanguage === "all" || repo.language === selectedLanguage;
    return matchesTerm && matchesLanguage;
  });

  filtered.sort((a, b) => {
    switch (sortBy) {
      case "updated":
        return new Date(b.updated_at) - new Date(a.updated_at);
      case "stars":
        return b.stargazers_count - a.stargazers_count;
      case "forks":
        return b.forks_count - a.forks_count;
      case "name":
        return a.name.localeCompare(b.name);
      case "score":
      default:
        return repoScore(b) - repoScore(a);
    }
  });

  return filtered;
}

function renderRepos(repos) {
  reposGrid.innerHTML = "";

  if (!repos.length) {
    reposGrid.innerHTML = '<p class="empty">No hay repositorios que coincidan con esos filtros.</p>';
    return;
  }

  repos.slice(0, 12).forEach((repo) => {
    const fragment = repoCardTemplate.content.cloneNode(true);
    fragment.querySelector(".repo-name").textContent = repo.name;
    fragment.querySelector(".repo-visibility").textContent = repo.private ? "Privado" : "Público";
    fragment.querySelector(".repo-desc").textContent = repo.description || "Proyecto sin descripción todavía.";
    fragment.querySelector(".repo-lang").textContent = repo.language || "Sin lenguaje";
    fragment.querySelector(".repo-size").textContent = `Tamaño: ${formatRepoSize(repo.size)}`;
    fragment.querySelector(".repo-license").textContent = repo.license?.spdx_id || "Sin licencia";
    fragment.querySelector(".repo-stars").textContent = `★ ${nf.format(repo.stargazers_count)}`;
    fragment.querySelector(".repo-forks").textContent = `⑂ ${nf.format(repo.forks_count)}`;
    fragment.querySelector(".repo-updated").textContent = `Actualizado hace ${daysSince(repo.updated_at)}`;

    const link = fragment.querySelector(".repo-link");
    link.href = repo.html_url;

    reposGrid.appendChild(fragment);
  });
}

function describeEvent(event) {
  const repoName = event.repo?.name || "repositorio";
  switch (event.type) {
    case "PushEvent":
      return `Push en ${repoName} con ${event.payload.size || 0} commit(s)`;
    case "CreateEvent":
      return `Creación de ${event.payload.ref_type} en ${repoName}`;
    case "WatchEvent":
      return `Marcó con estrella ${repoName}`;
    case "ForkEvent":
      return `Fork de ${repoName}`;
    case "IssuesEvent":
      return `Actividad en issues de ${repoName}`;
    case "PullRequestEvent":
      return `Actividad de pull request en ${repoName}`;
    default:
      return `${event.type.replace("Event", "")} en ${repoName}`;
  }
}

function renderActivity(events) {
  activityList.innerHTML = "";

  if (!events.length) {
    activityList.innerHTML = '<li class="empty">No hay eventos públicos recientes para mostrar.</li>';
    return;
  }

  events.slice(0, 10).forEach((event) => {
    const li = document.createElement("li");
    li.className = "activity-item";
    li.innerHTML = `<span class="accent">●</span> ${describeEvent(event)} <span class="activity-time">${formatDate(
      event.created_at,
    )}</span>`;
    activityList.appendChild(li);
  });
}

function bindRepoControls() {
  [repoSearch, repoLanguage, repoSort].forEach((control) => {
    control.addEventListener("input", () => {
      renderRepos(applyRepoFilters(allRepos));
    });
    control.addEventListener("change", () => {
      renderRepos(applyRepoFilters(allRepos));
    });
  });
}

async function loadPage() {
  try {
    const [profileResponse, reposResponse, eventsResponse] = await Promise.all([
      fetch(profileUrl),
      fetch(reposUrl),
      fetch(eventsUrl),
    ]);

    if (!profileResponse.ok || !reposResponse.ok || !eventsResponse.ok) {
      throw new Error("No se pudieron cargar los datos del perfil en este momento.");
    }

    const user = await profileResponse.json();
    allRepos = (await reposResponse.json()).filter((repo) => !repo.fork);
    const events = await eventsResponse.json();

    avatar.src = user.avatar_url;
    avatar.alt = `Avatar de ${user.login}`;
    nameEl.textContent = user.name ? `${user.name} (@${user.login})` : `@${user.login}`;
    bioEl.textContent = user.bio || "Desarrollador construyendo proyectos y aprendiendo constantemente.";
    profileLink.href = user.html_url;

    renderQuickLinks(user);
    renderStats(user);
    renderOverview(user, allRepos);
    updateLanguageFilter(allRepos);
    renderRepos(applyRepoFilters(allRepos));
    renderActivity(events);
  } catch (error) {
    nameEl.textContent = "No se pudo cargar el perfil";
    bioEl.textContent = "Intenta de nuevo más tarde.";
    overviewGrid.innerHTML = `<p class="error">${error.message}</p>`;
    reposGrid.innerHTML = `<p class="error">${error.message}</p>`;
    activityList.innerHTML = `<li class="error">${error.message}</li>`;
  }
}

bindRepoControls();
loadPage();
