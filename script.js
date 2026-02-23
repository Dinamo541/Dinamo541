const username = "Dinamo541";
const profileUrl = `https://api.github.com/users/${username}`;
const reposUrl = `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`;

const avatar = document.getElementById("avatar");
const nameEl = document.getElementById("name");
const bioEl = document.getElementById("bio");
const statsEl = document.getElementById("stats");
const profileLink = document.getElementById("profile-link");
const reposGrid = document.getElementById("repos-grid");
const repoCardTemplate = document.getElementById("repo-card-template");

const nf = new Intl.NumberFormat("es-AR");

function daysSince(dateString) {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const days = Math.max(1, Math.floor((now - date) / (1000 * 60 * 60 * 24)));
  return `Actualizado hace ${days} día${days === 1 ? "" : "s"}`;
}

function renderStats(user) {
  const stats = [
    `Seguidores: ${nf.format(user.followers)}`,
    `Siguiendo: ${nf.format(user.following)}`,
    `Repos públicos: ${nf.format(user.public_repos)}`,
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

function renderRepos(repos) {
  reposGrid.innerHTML = "";

  if (!repos.length) {
    reposGrid.innerHTML = '<p class="error">No se encontraron repositorios públicos para mostrar.</p>';
    return;
  }

  repos.forEach((repo) => {
    const fragment = repoCardTemplate.content.cloneNode(true);
    fragment.querySelector(".repo-name").textContent = repo.name;
    fragment.querySelector(".repo-lang").textContent = repo.language || "Sin lenguaje";
    fragment.querySelector(".repo-desc").textContent = repo.description || "Proyecto sin descripción todavía.";
    fragment.querySelector(".repo-stars").textContent = `★ ${nf.format(repo.stargazers_count)}`;
    fragment.querySelector(".repo-updated").textContent = daysSince(repo.updated_at);

    const link = fragment.querySelector(".repo-link");
    link.href = repo.html_url;

    reposGrid.appendChild(fragment);
  });
}

function pickFeaturedRepos(allRepos, max = 6) {
  return allRepos
    .filter((repo) => !repo.fork)
    .sort((a, b) => {
      const scoreA = a.stargazers_count * 3 + a.forks_count * 2 + a.open_issues_count;
      const scoreB = b.stargazers_count * 3 + b.forks_count * 2 + b.open_issues_count;
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      return new Date(b.updated_at) - new Date(a.updated_at);
    })
    .slice(0, max);
}

async function loadPage() {
  try {
    const [profileResponse, reposResponse] = await Promise.all([fetch(profileUrl), fetch(reposUrl)]);

    if (!profileResponse.ok || !reposResponse.ok) {
      throw new Error("No se pudieron cargar los datos del perfil en este momento.");
    }

    const user = await profileResponse.json();
    const repos = await reposResponse.json();

    avatar.src = user.avatar_url;
    avatar.alt = `Avatar de ${user.login}`;
    nameEl.textContent = user.name ? `${user.name} (@${user.login})` : `@${user.login}`;
    bioEl.textContent = user.bio || "Desarrollador construyendo proyectos y aprendiendo constantemente.";
    profileLink.href = user.html_url;

    renderStats(user);
    renderRepos(pickFeaturedRepos(repos));
  } catch (error) {
    nameEl.textContent = "No se pudo cargar el perfil";
    bioEl.textContent = "Intenta de nuevo más tarde.";
    reposGrid.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

loadPage();
