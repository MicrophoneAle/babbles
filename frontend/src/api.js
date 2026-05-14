const RAW_API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");
const API_BASE = RAW_API_URL.endsWith("/api") ? RAW_API_URL : `${RAW_API_URL}/api`;

let getTokenFn = null;

export function setApiTokenGetter(fn) {
  getTokenFn = fn;
}

export function clearApiTokenGetter() {
  getTokenFn = null;
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const method = options.method || "GET";
  let payload = null;
  if (options.body) {
    try {
      payload = JSON.parse(options.body);
    } catch {
      payload = options.body;
    }
  }

  // eslint-disable-next-line no-console
  console.log("[API] Request URL:", url);
  // eslint-disable-next-line no-console
  console.log("[API] Request method:", method);
  // eslint-disable-next-line no-console
  console.log("[API] Request payload:", payload);

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (getTokenFn) {
    try {
      const token = await getTokenFn();
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch {
      // leave unauthenticated
    }
  }

  try {
    const { headers: _ignoredHeaders, ...restOptions } = options;
    const res = await fetch(url, {
      ...restOptions,
      headers
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
  /** Previous / next entry id for navigation */
  getAdjacentEntries: (id) => request(`/entries/adjacent/${id}`),
  /** All entries for a calendar day (array) */
  getEntryByDate: (date) => request(`/entries/${date}`),
  /** Single entry by id */
  getEntryById: (id) => request(`/entries/id/${id}`),
  /** @deprecated Prefer createNewEntry — creates a row (may be blank) */
  createEntry: (body) => request("/entries", { method: "POST", body: JSON.stringify(body) }),
  createNewEntry: (body) => request("/entries", { method: "POST", body: JSON.stringify(body) }),
  updateEntryById: (id, body) => request(`/entries/id/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteEntryById: (id) => request(`/entries/id/${id}`, { method: "DELETE" }),
  /**
   * @deprecated Updates by id only; `dateOrId` must be the numeric entry id.
   * Kept for older call sites that passed a date string — use updateEntryById instead.
   */
  updateEntry: (dateOrId, body) => request(`/entries/id/${dateOrId}`, { method: "PUT", body: JSON.stringify(body) }),
  /** @deprecated Use deleteEntryById — `id` must be entry id */
  deleteEntry: (id) => request(`/entries/id/${id}`, { method: "DELETE" }),
  getPrompts: () => request("/prompts"),
  getStats: () => request("/stats"),
  getTags: () => request("/tags"),
  createTag: (name) => request("/tags", { method: "POST", body: JSON.stringify({ name }) }),
  deleteTag: (name) => request(`/tags/${encodeURIComponent(name)}`, { method: "DELETE" })
};
