import { useMemo, useState } from "react";
import { api } from "../api";

function toSuggestionStrings(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((t) => {
      if (typeof t === "string") return t.trim().toLowerCase();
      if (t && typeof t === "object") {
        const n = t.name ?? t.tag ?? t.label;
        return typeof n === "string" ? n.trim().toLowerCase() : "";
      }
      return "";
    })
    .filter((s) => typeof s === "string" && s.length > 0);
}

export default function TagInput({ tags, setTags, suggestions = [], savedTags = [], readOnly = false }) {
  const [value, setValue] = useState("");
  const suggestionStrings = useMemo(() => toSuggestionStrings(suggestions), [suggestions]);

  const availableTags = useMemo(
    () => suggestionStrings.filter((tag) => typeof tag === "string" && !tags.includes(tag)),
    [suggestionStrings, tags]
  );

  const addTag = async (raw) => {
    if (readOnly) return;
    const tag = raw.trim().toLowerCase();
    if (!tag || tags.includes(tag)) return;
    setTags([...tags, tag]);
    setValue("");
    if (!suggestionStrings.includes(tag)) {
      try {
        await api.createTag(tag);
      } catch {
        // tag may already exist, that is fine
      }
    }
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {tags.map((tag) => (
          readOnly ? (
            <span
              key={tag}
              className="rounded-[2px] border border-journal-brown/40 bg-[#f1ece4] px-3 py-1 text-xs font-semibold text-journal-text"
            >
              #{tag}
            </span>
          ) : (
            <button
              key={tag}
              type="button"
              className="rounded-[2px] border border-journal-brown/40 bg-[#f1ece4] px-3 py-1 text-xs font-semibold text-journal-text transition hover:bg-[#e5ded2]"
              onClick={() => setTags(tags.filter((t) => t !== tag))}
            >
              #{tag} {savedTags.includes(tag) ? "✓" : ""} ×
            </button>
          )
        ))}
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (readOnly) return;
          if (e.key === "Enter") {
            e.preventDefault();
            void addTag(value);
          }
        }}
        readOnly={readOnly}
        disabled={readOnly}
        className="w-full rounded-[2px] border border-journal-grey/40 bg-journal-white px-3 py-2 text-sm text-journal-text outline-none focus:ring-2 focus:ring-journal-brown/20 disabled:cursor-not-allowed disabled:bg-[#f0ebe3] disabled:text-journal-grey"
        placeholder={readOnly ? "Tags (view only)" : "Add a tag and press Enter"}
      />
      {!readOnly && availableTags.length > 0 ? (
        <>
          <p className="mt-3 font-heading text-sm italic text-[#6b4a2a]">Available tags</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => void addTag(tag)}
                className="cursor-pointer rounded-[2px] border border-[rgba(107,74,42,0.3)] bg-[rgba(245,230,200,0.5)] px-3 py-1 font-heading text-sm italic text-[#6b4a2a] transition hover:bg-[rgba(245,230,200,0.75)]"
              >
                #{tag}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
