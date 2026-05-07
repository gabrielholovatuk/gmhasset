// ── Autenticação client-side com SHA-256 via Web Crypto API
window.GMH = window.GMH || {};

GMH.Auth = (() => {
  const STORAGE_KEY = "gmh_session";
  const SESSION_HOURS = 168; // 7 dias

  async function sha256(str) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function login(username, password) {
    const hash = await sha256(password);
    const user = GMH.USERS.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.hash === hash
    );
    if (!user) return { ok: false, error: "Usuário ou senha incorretos" };

    const expiry = Date.now() + SESSION_HOURS * 3600 * 1000;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: user.username, role: user.role, expiry }));
    return { ok: true, user: { username: user.username, role: user.role } };
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (Date.now() > s.expiry) { localStorage.removeItem(STORAGE_KEY); return null; }
      return s;
    } catch { return null; }
  }

  function isAdmin() {
    const s = getSession();
    return s?.role === "admin";
  }

  return { login, logout, getSession, isAdmin };
})();
