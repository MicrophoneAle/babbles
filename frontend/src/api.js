const RAW_API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");
const API_BASE = RAW_API_URL.endsWith("/api") ? RAW_API_URL : `${RAW_API_URL}/api`;

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const method = options.method || "GET";
  const payload = options.body ? JSON.parse(options.body) : null;

  // eslint-disable-next-line no-console
  console.log("[API] Request URL:", url);
  // eslint-disable-next-line no-console
  console.log("[API] Request method:", method);
  // eslint-disable-next-line no-console
  console.log("[API] Request payload:", payload);

  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options
    });

    const rawBody = await res.text();
    let parsedBody = null;
    if (rawBody) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        parsedBody = rawBody;
      }
    }

    // eslint-disable-next-line no-console
    console.log("[API] Response status:", res.status);
    // eslint-disable-next-line no-console
    console.log("[API] Response body:", parsedBody);

    if (!res.ok) {
      const error = new Error(`API error: ${res.status}`);
      error.status = res.status;
      error.body = parsedBody;
      throw error;
    }

    if (res.status === 204) {
      return null;
    }

    return parsedBody;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[API] Request failed:", error);
    throw error;
  }
}

export const api = {
  getEntries: (search = "") => request(`/entries${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  getAdjacentEntries: (date) => request(`/entries/adjacent/${date}`),
  getEntryByDate: (date) => request(`/entries/${date}`),
  createEntry: (body) => request("/entries", { method: "POST", body: JSON.stringify(body) }),
  updateEntry: (date, body) => request(`/entries/${date}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteEntry: (date) => request(`/entries/${date}`, { method: "DELETE" }),
  getPrompts: () => request("/prompts"),
  getStats: () => request("/stats"),
  getTags: () => request("/tags"),
  createTag: (name) => request("/tags", { method: "POST", body: JSON.stringify({ name }) }),
  deleteTag: (name) => request(`/tags/${encodeURIComponent(name)}`, { method: "DELETE" })
};
