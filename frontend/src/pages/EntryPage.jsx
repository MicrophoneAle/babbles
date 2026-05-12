import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useParams } from "react-router-dom";
import { api } from "../api";
import RichEditor from "../components/Editor";
import Prompts from "../components/Prompts";
import TagInput from "../components/TagInput";

const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };

export default function EntryPage({ mode }) {
  const params = useParams();
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
  const [manualSaved, setManualSaved] = useState(false);
  const [exists, setExists] = useState(false);

  async function saveEntry() {
    setStatus("Saving...");
    try {
      if (exists) {
        await api.updateEntry(date, { content, plainText, tags });
      } else if (plainText.trim()) {
        await api.createEntry({ date, content, plainText, tags });
        setExists(true);
      }
      setStatus("Saved");
      return true;
    } catch {
      setStatus("Save failed");
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
        const entry = await api.getEntryByDate(date);
        if (!active) return;
        setExists(true);
        setContent(entry.content || emptyDoc);
        setPlainText(entry.plainText || "");
        setTags(entry.tags || []);
      } catch {
        if (!active) return;
        setExists(false);
        setContent(emptyDoc);
        setPlainText("");
        setTags([]);
        if (mode === "today") {
          const promptData = await api.getPrompts();
          setPrompts(promptData.prompts || []);
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
      <div className="absolute right-8 top-0 h-28 w-3 bg-journal-maroonSoft shadow-md" />
      <h2 className="section-title mb-1 text-4xl">
        {format(new Date(`${date}T00:00:00`), "EEEE, MMMM d")}
      </h2>
      <p className="mb-4 text-sm font-bold text-[#5c3a2e]">{status}</p>

      <Prompts prompts={prompts} hidden={hidePrompts} onHide={() => setHidePrompts(true)} />

      <div className="mb-4">
        <p className="mb-2 text-sm font-bold text-journal-maroon">Tags</p>
        <TagInput tags={tags} setTags={setTags} suggestions={tagSuggestions} />
      </div>

      <RichEditor
        value={content}
        onChange={(next) => {
          setContent(next.json);
          setPlainText(next.text);
        }}
      />
      <div className="mt-4 flex items-center justify-end gap-3">
        {manualSaved && <span className="text-sm text-journal-maroon">Saved</span>}
        <button
          onClick={async () => {
            const ok = await saveEntry();
            if (ok) {
              setManualSaved(true);
              setTimeout(() => setManualSaved(false), 1500);
            }
          }}
          className="rounded-[4px] border border-journal-gold/70 bg-journal-maroon px-4 py-2 text-sm font-bold text-journal-cream shadow-md transition hover:bg-journal-maroonSoft"
        >
          Save Entry
        </button>
      </div>
    </section>
  );
}
