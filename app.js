// ── Router & Shell principal da SPA GMH
window.GMH = window.GMH || {};

const ROUTES = {
  dashboard:  { label: "Monitor de Mercado", icon: "📊", page: () => GMH.PageDashboard },
  portfolios: { label: "Gestão de Carteiras", icon: "💼", page: () => GMH.PagePortfolios },
  watchlist:  { label: "Watchlist",           icon: "★",  page: () => GMH.PageWatchlist },
  alerts:     { label: "Alertas",             icon: "🔔", page: () => GMH.PageAlerts },
  report:     { label: "Relatório PDF",       icon: "📄", page: () => GMH.PageReport },
};

let currentPage = null;
let currentRoute = null;

// ── Inicialização
document.addEventListener("DOMContentLoaded", () => {
  const session = GMH.Auth.getSession();
  if (!session) {
    showLogin();
  } else {
    showApp(session);
  }
});

// ── Tela de Login
function showLogin() {
  document.getElementById("screen-login").classList.remove("hidden");
  document.getElementById("screen-app").classList.add("hidden");

  const form = document.getElementById("login-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = document.getElementById("login-user").value.trim();
    const pass = document.getElementById("login-pass").value;
    const btn  = document.getElementById("login-btn");
    const err  = document.getElementById("login-error");
    err.textContent = "";
    btn.disabled = true;
    btn.textContent = "Autenticando...";

    const result = await GMH.Auth.login(user, pass);
    if (result.ok) {
      showApp(result.user);
    } else {
      err.textContent = result.error;
      btn.disabled = false;
      btn.textContent = "Entrar";
    }
  });
}

// ── App Shell
function showApp(session) {
  document.getElementById("screen-login").classList.add("hidden");
  document.getElementById("screen-app").classList.remove("hidden");

  // Dados do usuário
  document.getElementById("user-name").textContent = session.username;
  const badge = document.getElementById("user-badge");
  if (session.role === "admin") {
    badge.textContent = "Admin";
    badge.classList.add("badge-admin");
  } else {
    badge.textContent = "Cliente";
    badge.classList.add("badge-cliente");
  }

  buildSidebar(session);

  // Botão de logout
  document.getElementById("btn-logout").addEventListener("click", () => {
    GMH.Auth.logout();
    location.reload();
  });

  // Hamburger menu
  document.getElementById("btn-menu").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("sidebar-overlay").classList.toggle("visible");
  });
  document.getElementById("sidebar-overlay").addEventListener("click", closeSidebar);

  // Rota inicial
  navigate("dashboard");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebar-overlay").classList.remove("visible");
}

function buildSidebar(session) {
  const nav = document.getElementById("nav-links");
  nav.innerHTML = Object.entries(ROUTES).map(([id, r]) => `
    <a class="nav-link" data-route="${id}" href="#${id}">
      <span class="nav-icon">${r.icon}</span>
      <span class="nav-label">${r.label}</span>
    </a>
  `).join("");

  nav.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(link.dataset.route);
      closeSidebar();
    });
  });
}

function navigate(routeId) {
  if (!ROUTES[routeId]) routeId = "dashboard";
  currentRoute = routeId;

  // Highlight active nav
  document.querySelectorAll(".nav-link").forEach(l => l.classList.toggle("active", l.dataset.route === routeId));

  // Cleanup previous page
  if (currentPage?.destroy) currentPage.destroy();

  // Render page
  const container = document.getElementById("page-content");
  container.innerHTML = "";
  const module = ROUTES[routeId].page();
  currentPage = module;
  module.render(container);

  // Scroll to top
  document.getElementById("main-content").scrollTo(0, 0);
}
