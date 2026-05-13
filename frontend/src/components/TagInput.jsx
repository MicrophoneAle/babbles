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

export default function TagInput({ tags, setTags, suggestions = [], savedTags = [] }) {
  const [value, setValue] = useState("");
  const suggestionStrings = useMemo(() => toSuggestionStrings(suggestions), [suggestions]);

  const filtered = useMemo(
    () =>
      suggestionStrings
        .filter(
          (tag) =>
            typeof tag === "string" && tag.includes(value.toLowerCase()) && !tags.includes(tag)
        )
        .slice(0, 6),
    [suggestionStrings, value, tags]
  );

  const addTag = async (raw) => {
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
          <button
            key={tag}
            className="rounded-full border border-journal-brown/40 bg-[#f1ece4] px-3 py-1 text-xs font-semibold text-journal-text transition hover:bg-[#e5ded2]"
            onClick={() => setTags(tags.filter((t) => t !== tag))}
          >
            #{tag} {savedTags.includes(tag) ? "✓" : ""} ×
          </button>
        ))}
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void addTag(value);
          }
        }}
        className="w-full rounded-[4px] border border-journal-grey/40 bg-journal-white px-3 py-2 text-sm text-journal-text outline-none focus:ring-2 focus:ring-journal-brown/20"
        placeholder="Add a tag and press Enter"
      />
      {!!value && filtered.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {filtered.map((tag) => (
            <button
              key={tag}
              onClick={() => void addTag(tag)}
              className="rounded-full border border-journal-brown/30 bg-journal-sticky px-3 py-1 text-xs font-semibold text-journal-brown"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
