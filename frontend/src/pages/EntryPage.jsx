import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useOwner } from "../AuthProvider";
import RichEditor from "../components/Editor";
import TagInput from "../components/TagInput";

const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };

/** Always returns an array of non-empty plain strings for autocomplete. */
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

export default function EntryPage({ mode }) {
  const params = useParams();
  const navigate = useNavigate();
  const { isOwner, isLoaded } = useOwner();
  const readOnly = !isOwner;
  const date = useMemo(
    () => (mode === "today" ? new Date().toISOString().slice(0, 10) : params.date),
    [mode, params.date]
  );
  const [content, setContent] = useState(emptyDoc);
  const [plainText, setPlainText] = useState("");
  const [tags, setTags] = useState([]);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [status, setStatus] = useState("Saved");
  const [showSavedFlash, setShowSavedFlash] = useState(false);
  const [exists, setExists] = useState(false);
  const [adjacent, setAdjacent] = useState({ previous: null, next: null });
  const [savedTags, setSavedTags] = useState([]);
  const [editorNonce, setEditorNonce] = useState(0);
  const saveEntryRef = useRef(async () => false);

  const hasContentToSave = plainText.trim().length > 0 || tags.length > 0;

  async function saveEntry() {
    if (readOnly) return false;
    setStatus("Saving...");
    const payload = { date, content, plainText, tags };
    // eslint-disable-next-line no-console
    console.log("[Entry] Save payload:", payload);
    try {
      if (exists) {
        try {
          await api.updateEntry(date, payload);
        } catch (error) {
          if (error?.status === 404) {
            await api.createEntry(payload);
            setExists(true);
          } else {
            throw error;
          }
        }
      } else if (hasContentToSave) {
        try {
          await api.createEntry(payload);
          setExists(true);
        } catch (error) {
          if (error?.status === 409) {
            await api.updateEntry(date, payload);
            setExists(true);
          } else {
            throw error;
          }
        }
      }
      setStatus("Saved");
      setSavedTags(tags);
      // eslint-disable-next-line no-console
      console.log("Entry saved successfully");
      return true;
    } catch (error) {
      setStatus("Save failed");
      // eslint-disable-next-line no-console
      console.error("[Entry] Save failed", error);
      return false;
    }
  }

  useEffect(() => {
    saveEntryRef.current = saveEntry;
  });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [tagsRes] = await Promise.all([api.getTags()]);
        if (active) setTagSuggestions(normalizeTagSuggestionStrings(tagsRes));
      } catch {
        // no-op
      }

      try {
        const adjacentEntries = await api.getAdjacentEntries(date);
        if (active) setAdjacent(adjacentEntries);
      } catch {
        if (active) setAdjacent({ previous: null, next: null });
      }

      try {
        const entry = await api.getEntryByDate(date);
        if (!active) return;
        setExists(true);
        setContent(entry.content || emptyDoc);
        setPlainText(entry.plainText || "");
        setTags(entry.tags || []);
        setEditorNonce((n) => n + 1);
      } catch (error) {
        if (!active) return;
        if (error?.status === 404) {
          setExists(false);
          setContent(emptyDoc);
          setPlainText("");
          setTags([]);
          setEditorNonce((n) => n + 1);
        } else {
          setStatus("Failed to load entry");
          // eslint-disable-next-line no-console
          console.error("[Entry] Load failed", error);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [date, mode]);

  useEffect(() => {
    if (!isOwner) return undefined;
    const timer = setInterval(() => {
      void saveEntryRef.current();
    }, 10000);
    return () => clearInterval(timer);
  }, [isOwner]);

  return (
    <section className="relative overflow-visible pr-1">
      <button
        disabled={!adjacent.previous}
        onClick={() => adjacent.previous && navigate(`/entry/${adjacent.previous}`)}
        className={`absolute left-0 top-1/2 z-10 h-[60px] w-4 -translate-y-1/2 rounded-r-[2px] border-r border-journal-grey/40 text-sm font-bold shadow-sm transition ${
          adjacent.previous
            ? "bg-journal-brown text-journal-white hover:bg-[#5b4330]"
            : "cursor-not-allowed bg-[#cfc8be] text-[#f5f5f5]"
        }`}
        title={adjacent.previous ? `Go to ${adjacent.previous}` : "No previous entry"}
      >
        ‹
      </button>
      <button
        disabled={!adjacent.next}
        onClick={() => adjacent.next && navigate(`/entry/${adjacent.next}`)}
        className={`absolute right-0 top-1/2 z-10 h-[60px] w-4 -translate-y-1/2 rounded-l-[2px] border-l border-journal-grey/40 text-sm font-bold shadow-sm transition ${
          adjacent.next
            ? "bg-journal-brown text-journal-white hover:bg-[#5b4330]"
            : "cursor-not-allowed bg-[#cfc8be] text-[#f5f5f5]"
        }`}
        title={adjacent.next ? `Go to ${adjacent.next}` : "No next entry"}
      >
        ›
      </button>
      <h2 className="section-title mb-1 text-4xl">
        {format(new Date(`${date}T00:00:00`), "EEEE, MMMM d")}
      </h2>
      <p className="mb-4 text-sm font-semibold text-journal-grey">
        {!isLoaded ? "Loading…" : readOnly ? "View only" : status}
      </p>

      <div className="mb-4">
        <p className="mb-2 font-heading text-lg italic text-journal-brown">Tags</p>
        <TagInput tags={tags} setTags={setTags} suggestions={tagSuggestions} savedTags={savedTags} readOnly={readOnly} />
      </div>

      <RichEditor
        key={`${date}-${editorNonce}`}
        value={content}
        readOnly={readOnly}
        onChange={(next) => {
          setContent(next.json);
          setPlainText(next.text);
        }}
      />
      <div className="mt-4 flex items-center justify-end gap-3">
        {showSavedFlash && !readOnly && <span className="save-indicator">✓ Entry saved</span>}
        {!readOnly ? (
          <button
            onClick={async () => {
              const ok = await saveEntry();
              if (ok) {
                setShowSavedFlash(true);
                setTimeout(() => setShowSavedFlash(false), 2000);
              }
            }}
            className="rounded-[2px] border border-journal-brown/60 bg-journal-brown px-4 py-2 text-sm font-semibold text-journal-white shadow-md transition hover:bg-[#5d4533]"
          >
            Save Entry
          </button>
        ) : null}
      </div>
    </section>
  );
}
