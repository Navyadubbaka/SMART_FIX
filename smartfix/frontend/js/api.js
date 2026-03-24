const API_BASE = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");
const getUser = () => JSON.parse(localStorage.getItem("user") || "null");

async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "./login.html";
}

function requireAuth(roles = []) {
  const user = getUser();
  if (!user || !getToken()) return (window.location.href = "./login.html");
  if (roles.length && !roles.includes(user.role)) return (window.location.href = "./dashboard.html");
}

function statusBadge(status) {
  const cls = status.replace(/\s/g, "");
  return `<span class="status ${cls}">${status}</span>`;
}
