const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_BASE = `${API_URL}/api`;

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getEntries: (search = "") => request(`/entries${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  getEntryByDate: (date) => request(`/entries/${date}`),
  createEntry: (body) => request("/entries", { method: "POST", body: JSON.stringify(body) }),
  updateEntry: (date, body) => request(`/entries/${date}`, { method: "PUT", body: JSON.stringify(body) }),
  getPrompts: () => request("/prompts"),
  getStats: () => request("/stats"),
  getTags: () => request("/tags")
};
