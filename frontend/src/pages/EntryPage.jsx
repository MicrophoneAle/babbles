import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import RichEditor from "../components/Editor";
import Prompts from "../components/Prompts";
import TagInput from "../components/TagInput";

const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };

export default function EntryPage({ mode }) {
  const params = useParams();
  const navigate = useNavigate();
  const date = useMemo(
    () => (mode === "today" ? new Date().toISOString().slice(0, 10) : params.date),
    [mode, params.date]
  );
  const [content, setContent] = useState(emptyDoc);
  const [plainText, setPlainText] = useState("");
  const [tags, setTags] = useState([]);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [hidePrompts, setHidePrompts] = useState(false);
  const [status, setStatus] = useState("Saved");
  const [showSavedFlash, setShowSavedFlash] = useState(false);
  const [exists, setExists] = useState(false);
  const [adjacent, setAdjacent] = useState({ previous: null, next: null });
  const [savedTags, setSavedTags] = useState([]);

  const hasContentToSave = plainText.trim().length > 0 || tags.length > 0;

  async function saveEntry() {
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
    let active = true;
    async function load() {
      try {
        const [tagsRes] = await Promise.all([api.getTags()]);
        if (active) setTagSuggestions(tagsRes);
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
      } catch (error) {
        if (!active) return;
        if (error?.status === 404) {
          setExists(false);
          setContent(emptyDoc);
          setPlainText("");
          setTags([]);
          if (mode === "today") {
            const promptData = await api.getPrompts();
            setPrompts(promptData.prompts || []);
          }
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
    const timer = setInterval(async () => {
      await saveEntry();
    }, 10000);
    return () => clearInterval(timer);
  }, [exists, date, content, plainText, tags]);

  return (
    <section className="relative card-surface overflow-hidden p-6">
      <button
        disabled={!adjacent.previous}
        onClick={() => adjacent.previous && navigate(`/entry/${adjacent.previous}`)}
        className={`absolute left-0 top-1/2 h-24 w-7 -translate-y-1/2 rounded-r-[4px] border-r border-journal-grey/40 text-lg font-bold shadow-md transition ${
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
        className={`absolute right-0 top-1/2 h-24 w-7 -translate-y-1/2 rounded-l-[4px] border-l border-journal-grey/40 text-lg font-bold shadow-md transition ${
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
      <p className="mb-4 text-sm font-semibold text-journal-grey">{status}</p>

      <Prompts prompts={prompts} hidden={hidePrompts} onHide={() => setHidePrompts(true)} />

      <div className="mb-4">
        <p className="mb-2 font-heading text-lg italic text-journal-brown">Tags</p>
        <TagInput tags={tags} setTags={setTags} suggestions={tagSuggestions} savedTags={savedTags} />
      </div>

      <RichEditor
        value={content}
        onChange={(next) => {
          setContent(next.json);
          setPlainText(next.text);
        }}
      />
      <div className="mt-4 flex items-center justify-end gap-3">
        {showSavedFlash && <span className="save-indicator">✓ Entry saved</span>}
        <button
          onClick={async () => {
            const ok = await saveEntry();
            if (ok) {
              setShowSavedFlash(true);
              setTimeout(() => setShowSavedFlash(false), 2000);
            }
          }}
          className="rounded-[4px] border border-journal-brown/60 bg-journal-brown px-4 py-2 text-sm font-semibold text-journal-white shadow-md transition hover:bg-[#5d4533]"
        >
          Save Entry
        </button>
      </div>
    </section>
  );
}
