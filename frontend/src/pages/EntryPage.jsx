import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useOwner } from "../AuthProvider";
import RichEditor from "../components/Editor";
import TagInput from "../components/TagInput";
import ConfirmModal from "../components/ConfirmModal";

const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };

function normalizeTagSuggestionStrings(list) {
  if (!Array.isArray(list)) return [];
  const strings = list
    .map((t) => {
      if (typeof t === "string") return t.trim().toLowerCase();
      if (t && typeof t === "object") {
        const n = t.name ?? t.tag ?? t.label;
        return typeof n === "string" ? n.trim().toLowerCase() : "";
      }
      return "";
    })
    .filter((s) => typeof s === "string" && s.length > 0);
  return [...new Set(strings)];
}

function formatCreatedTime(iso) {
  if (!iso) return "";
  try {
    return format(parseISO(iso), "h:mm a");
  } catch {
    return "";
  }
}

const EDITOR_FULLSCREEN_SCROLL_CLASS = "h-[calc(100vh-12rem)]";

function TodayEntryEditor({ entry, tagSuggestions, readOnly, onDeleted, onUpdated }) {
  const [title, setTitle] = useState(entry.title ?? "");
  const [content, setContent] = useState(entry.content || emptyDoc);
  const [plainText, setPlainText] = useState(entry.plainText ?? "");
  const [tags, setTags] = useState(entry.tags || []);
  const [savedTags, setSavedTags] = useState(entry.tags || []);
  const [status, setStatus] = useState("Saved");
  const [showSavedFlash, setShowSavedFlash] = useState(false);
  const [editorNonce, setEditorNonce] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editorFullscreen, setEditorFullscreen] = useState(false);
  const saveRef = useRef(async () => false);

  // Only reset when this card represents a different entry. Do not depend on
  // entry.updatedAt — auto-save bumps it ~every 10s and would clear fullscreen
  // and remount the editor via editorNonce.
  useEffect(() => {
    setTitle(entry.title ?? "");
    setContent(entry.content || emptyDoc);
    setPlainText(entry.plainText ?? "");
    setTags(entry.tags || []);
    setSavedTags(entry.tags || []);
    setEditorNonce((n) => n + 1);
    setStatus("Saved");
    setEditorFullscreen(false);
  }, [entry.id]);

  useEffect(() => {
    if (!editorFullscreen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setEditorFullscreen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editorFullscreen]);

  const saveEntry = useCallback(async () => {
    if (readOnly) return false;
    setStatus("Saving...");
    const payload = { title, content, plainText, tags };
    try {
      const updated = await api.updateEntryById(entry.id, payload);
      setStatus("Saved");
      setSavedTags(tags);
      onUpdated?.(updated);
      return true;
    } catch (error) {
      setStatus("Save failed");
      // eslint-disable-next-line no-console
      console.error("[Entry] Save failed", error);
      return false;
    }
  }, [readOnly, title, content, plainText, tags, entry.id, onUpdated]);

  useEffect(() => {
    saveRef.current = saveEntry;
  });

  useEffect(() => {
    if (readOnly) return undefined;
    const timer = setInterval(() => {
      void saveRef.current();
    }, 10000);
    return () => clearInterval(timer);
  }, [readOnly, entry.id]);

  async function handleDelete() {
    try {
      await api.deleteEntryById(entry.id);
      onDeleted(entry.id);
    } catch {
      // eslint-disable-next-line no-console
      console.error("Delete failed");
    } finally {
      setConfirmOpen(false);
    }
  }

  return (
    <article className="page-content-block mb-6 animate-fadeIn p-4">
      <ConfirmModal
        isOpen={confirmOpen}
        message="Delete this babble? This cannot be undone."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void handleDelete()}
      />
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-journal-brown/15 pb-2">
        <p className="font-heading text-sm italic text-journal-grey">{formatCreatedTime(entry.createdAt)}</p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setEditorFullscreen((v) => !v)}
            className="bg-transparent p-0 text-xs text-[#6b4a2a] transition hover:text-[#3b2a1a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6b4a2a]/30"
            title={editorFullscreen ? "Collapse editor" : "Expand editor"}
            aria-label={editorFullscreen ? "Collapse editor" : "Expand editor"}
            aria-pressed={editorFullscreen}
          >
            {editorFullscreen ? "⤡" : "⤢"}
          </button>
          {!readOnly ? (
            <button
              type="button"
              className="text-xs font-semibold text-red-800/70 underline decoration-red-800/30 hover:text-red-800"
              onClick={() => setConfirmOpen(true)}
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>
      {!editorFullscreen ? (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          readOnly={readOnly}
          disabled={readOnly}
          placeholder="Title (optional)"
          className="mb-3 w-full rounded-[2px] border border-journal-grey/40 bg-journal-white px-3 py-2 font-heading text-lg italic text-journal-brown outline-none placeholder:text-journal-grey/60 focus:ring-2 focus:ring-journal-brown/20 disabled:cursor-not-allowed disabled:bg-[#f0ebe3]"
        />
      ) : null}
      {!editorFullscreen ? (
        <div className="mb-3">
          <p className="mb-2 font-heading text-sm italic text-journal-brown">Tags</p>
          <TagInput tags={tags} setTags={setTags} suggestions={tagSuggestions} savedTags={savedTags} readOnly={readOnly} />
        </div>
      ) : null}
      <RichEditor
        key={`${entry.id}-${editorNonce}`}
        value={content}
        readOnly={readOnly}
        scrollAreaClassName={editorFullscreen ? EDITOR_FULLSCREEN_SCROLL_CLASS : undefined}
        onChange={(next) => {
          setContent(next.json);
          setPlainText(next.text);
        }}
      />
      <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
        {!editorFullscreen ? (
          <span className="text-xs font-semibold text-journal-grey">{readOnly ? "View only" : status}</span>
        ) : null}
        {showSavedFlash && !readOnly ? <span className="save-indicator">✓ Babble saved</span> : null}
        {!readOnly ? (
          <button
            type="button"
            onClick={async () => {
              const ok = await saveEntry();
              if (ok) {
                setShowSavedFlash(true);
                setTimeout(() => setShowSavedFlash(false), 2000);
              }
            }}
            className="rounded-[2px] border border-journal-brown/60 bg-journal-brown px-4 py-2 text-sm font-semibold text-[#f5edd9] shadow-md transition hover:bg-[#5d4533]"
          >
            Save Entry
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default function EntryPage({ mode }) {
  const params = useParams();
  const navigate = useNavigate();
  const { isOwner, isLoaded } = useOwner();
  const readOnly = !isOwner;

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const entryId = mode === "id" ? Number.parseInt(params.entryId, 10) : null;
  const idValid = mode !== "id" || (Number.isInteger(entryId) && entryId > 0);

  const [todayEntries, setTodayEntries] = useState([]);
  const [todayLoading, setTodayLoading] = useState(mode === "today");

  const [singleEntry, setSingleEntry] = useState(null);
  const [singleLoadError, setSingleLoadError] = useState(null);
  const [adjacent, setAdjacent] = useState({ previous: null, next: null });
  const [tagSuggestions, setTagSuggestions] = useState([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState(emptyDoc);
  const [plainText, setPlainText] = useState("");
  const [tags, setTags] = useState([]);
  const [savedTags, setSavedTags] = useState([]);
  const [status, setStatus] = useState("Saved");
  const [showSavedFlash, setShowSavedFlash] = useState(false);
  const [editorNonce, setEditorNonce] = useState(0);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const saveSingleRef = useRef(async () => false);

  useEffect(() => {
    let active = true;
    async function loadTags() {
      try {
        const tagsRes = await api.getTags();
        if (active) setTagSuggestions(normalizeTagSuggestionStrings(tagsRes));
      } catch {
        if (active) setTagSuggestions([]);
      }
    }
    void loadTags();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (mode !== "today") return undefined;
    let active = true;
    async function loadToday() {
      setTodayLoading(true);
      try {
        const list = await api.getEntryByDate(todayStr);
        if (!active) return;
        const arr = Array.isArray(list) ? [...list] : [];
        arr.reverse();
        setTodayEntries(arr);
      } catch {
        if (active) setTodayEntries([]);
      } finally {
        if (active) setTodayLoading(false);
      }
    }
    void loadToday();
    return () => {
      active = false;
    };
  }, [mode, todayStr]);

  useEffect(() => {
    if (mode !== "id" || !idValid) return undefined;
    let active = true;
    async function loadSingle() {
      setSingleLoadError(null);
      setSingleEntry(null);
      try {
        const [entry, adj] = await Promise.all([api.getEntryById(entryId), api.getAdjacentEntries(entryId)]);
        if (!active) return;
        setSingleEntry(entry);
        setAdjacent(adj || { previous: null, next: null });
        setTitle(entry.title ?? "");
        setContent(entry.content || emptyDoc);
        setPlainText(entry.plainText ?? "");
        setTags(entry.tags || []);
        setSavedTags(entry.tags || []);
        setEditorNonce((n) => n + 1);
        setStatus("Saved");
      } catch (error) {
        if (!active) return;
        if (error?.status === 404) setSingleLoadError("Entry not found.");
        else setSingleLoadError("Failed to load entry.");
      }
    }
    void loadSingle();
    return () => {
      active = false;
    };
  }, [mode, idValid, entryId]);

  const saveSingle = useCallback(async () => {
    if (readOnly || mode !== "id" || !singleEntry) return false;
    setStatus("Saving...");
    try {
      const updated = await api.updateEntryById(singleEntry.id, {
        title,
        content,
        plainText,
        tags
      });
      setStatus("Saved");
      setSavedTags(tags);
      setSingleEntry(updated);
      return true;
    } catch (error) {
      setStatus("Save failed");
      // eslint-disable-next-line no-console
      console.error("[Entry] Save failed", error);
      return false;
    }
  }, [readOnly, mode, singleEntry, title, content, plainText, tags]);

  useEffect(() => {
    saveSingleRef.current = saveSingle;
  });

  useEffect(() => {
    if (mode !== "id" || readOnly) return undefined;
    const timer = setInterval(() => {
      void saveSingleRef.current();
    }, 10000);
    return () => clearInterval(timer);
  }, [mode, readOnly, singleEntry?.id]);

  async function handleNewEntry() {
    if (readOnly) return;
    try {
      const created = await api.createNewEntry({
        date: todayStr,
        title: "",
        content: emptyDoc,
        plainText: "",
        tags: []
      });
      setTodayEntries((prev) => [created, ...prev]);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to create entry", e);
    }
  }

  if (mode === "id" && !idValid) {
    return (
      <section>
        <p className="font-heading text-lg italic text-journal-grey">Invalid entry link.</p>
      </section>
    );
  }

  if (mode === "id" && singleLoadError) {
    return (
      <section>
        <p className="font-heading text-lg italic text-journal-grey">{singleLoadError}</p>
      </section>
    );
  }

  if (mode === "id" && singleEntry) {
    const entryDateStr = singleEntry.date;
    return (
      <section className="relative overflow-visible pr-1">
        <ConfirmModal
          isOpen={confirmDeleteOpen}
          message="Delete this babble? This cannot be undone."
          onCancel={() => setConfirmDeleteOpen(false)}
          onConfirm={async () => {
            try {
              const nextId = adjacent.next;
              const prevId = adjacent.previous;
              await api.deleteEntryById(singleEntry.id);
              if (nextId != null) navigate(`/entry/${nextId}`);
              else if (prevId != null) navigate(`/entry/${prevId}`);
              else navigate("/");
            } catch {
              // eslint-disable-next-line no-console
              console.error("Delete failed");
            } finally {
              setConfirmDeleteOpen(false);
            }
          }}
        />
        <button
          type="button"
          disabled={adjacent.previous == null}
          onClick={() => adjacent.previous != null && navigate(`/entry/${adjacent.previous}`)}
          className={`absolute left-0 top-1/2 z-10 h-[60px] w-4 -translate-y-1/2 rounded-r-[2px] border-r border-journal-grey/40 text-sm font-bold shadow-sm transition ${
            adjacent.previous != null
              ? "bg-journal-brown text-journal-white hover:bg-[#5b4330]"
              : "cursor-not-allowed bg-[#cfc8be] text-[#f5f5f5]"
          }`}
          title={adjacent.previous != null ? "Previous babble" : "No previous babble"}
        >
          ‹
        </button>
        <button
          type="button"
          disabled={adjacent.next == null}
          onClick={() => adjacent.next != null && navigate(`/entry/${adjacent.next}`)}
          className={`absolute right-0 top-1/2 z-10 h-[60px] w-4 -translate-y-1/2 rounded-l-[2px] border-l border-journal-grey/40 text-sm font-bold shadow-sm transition ${
            adjacent.next != null
              ? "bg-journal-brown text-journal-white hover:bg-[#5b4330]"
              : "cursor-not-allowed bg-[#cfc8be] text-[#f5f5f5]"
          }`}
          title={adjacent.next != null ? "Next babble" : "No next babble"}
        >
          ›
        </button>
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="section-title text-4xl">{format(new Date(`${entryDateStr}T12:00:00`), "EEEE, MMMM d")}</h2>
          <div className="flex items-center gap-3">
            <p className="font-heading text-sm italic text-journal-grey">{formatCreatedTime(singleEntry.createdAt)}</p>
            {!readOnly ? (
              <button
                type="button"
                className="text-xs font-semibold text-red-800/70 underline decoration-red-800/30 hover:text-red-800"
                onClick={() => setConfirmDeleteOpen(true)}
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>
        <p className="mb-4 text-sm font-semibold text-journal-grey">
          {!isLoaded ? "Loading…" : readOnly ? "View only" : status}
        </p>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          readOnly={readOnly}
          disabled={readOnly}
          placeholder="Title (optional)"
          className="mb-4 w-full rounded-[2px] border border-journal-grey/40 bg-journal-white px-3 py-2 font-heading text-xl italic text-journal-brown outline-none placeholder:text-journal-grey/60 focus:ring-2 focus:ring-journal-brown/20 disabled:cursor-not-allowed disabled:bg-[#f0ebe3]"
        />
        <div className="mb-4">
          <p className="mb-2 font-heading text-lg italic text-journal-brown">Tags</p>
          <TagInput tags={tags} setTags={setTags} suggestions={tagSuggestions} savedTags={savedTags} readOnly={readOnly} />
        </div>
        <RichEditor
          key={`${singleEntry.id}-${editorNonce}`}
          value={content}
          readOnly={readOnly}
          onChange={(next) => {
            setContent(next.json);
            setPlainText(next.text);
          }}
        />
        <div className="mt-4 flex items-center justify-end gap-3">
          {showSavedFlash && !readOnly ? <span className="save-indicator">✓ Babble saved</span> : null}
          {!readOnly ? (
            <button
              type="button"
              onClick={async () => {
                const ok = await saveSingle();
                if (ok) {
                  setShowSavedFlash(true);
                  setTimeout(() => setShowSavedFlash(false), 2000);
                }
              }}
              className="rounded-[2px] border border-journal-brown/60 bg-journal-brown px-4 py-2 text-sm font-semibold text-[#f5edd9] shadow-md transition hover:bg-[#5d4533]"
            >
              Save Entry
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  if (mode === "id" && !singleEntry && !singleLoadError) {
    return (
      <section>
        <p className="font-heading text-lg italic text-journal-grey">Loading…</p>
      </section>
    );
  }

  return (
    <section className="relative pr-1">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title text-4xl">{format(new Date(`${todayStr}T12:00:00`), "EEEE, MMMM d")}</h2>
        {!readOnly ? (
          <button
            type="button"
            onClick={() => void handleNewEntry()}
            className="flex items-center gap-2 rounded-[2px] border border-journal-brown/50 bg-journal-brown px-4 py-2.5 font-heading text-base italic text-[#f5edd9] shadow-md transition hover:bg-[#5d4533]"
          >
            <span className="text-xl font-bold leading-none">+</span>
            New Entry
          </button>
        ) : null}
      </div>
      <p className="mb-4 text-sm font-semibold text-journal-grey">
        {!isLoaded ? "Loading…" : readOnly ? "View only — sign in as the owner to write." : "Each babble saves on its own."}
      </p>
      {todayLoading ? (
        <p className="font-heading text-lg italic text-journal-grey">Loading today&apos;s babbles…</p>
      ) : todayEntries.length === 0 ? (
        <p className="font-heading text-lg italic text-journal-grey">
          No babbles yet for today.
          {!readOnly ? " Click New Entry to begin." : ""}
        </p>
      ) : (
        todayEntries.map((entry) => (
          <TodayEntryEditor
            key={entry.id}
            entry={entry}
            tagSuggestions={tagSuggestions}
            readOnly={readOnly}
            onDeleted={(id) => setTodayEntries((prev) => prev.filter((e) => e.id !== id))}
            onUpdated={(updated) =>
              setTodayEntries((prev) => prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)))
            }
          />
        ))
      )}
    </section>
  );
}
