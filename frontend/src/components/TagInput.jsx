import { useMemo, useState } from "react";

export default function TagInput({ tags, setTags, suggestions = [] }) {
  const [value, setValue] = useState("");
  const filtered = useMemo(
    () =>
      suggestions.filter((tag) => tag.includes(value.toLowerCase()) && !tags.includes(tag)).slice(0, 6),
    [suggestions, value, tags]
  );

  const addTag = (raw) => {
    const tag = raw.trim().toLowerCase();
    if (!tag || tags.includes(tag)) return;
    setTags([...tags, tag]);
    setValue("");
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 transition hover:bg-violet-200"
            onClick={() => setTags(tags.filter((t) => t !== tag))}
          >
            #{tag} ×
          </button>
        ))}
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag(value);
          }
        }}
        className="w-full rounded-xl border border-violet-100 bg-white/90 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-200"
        placeholder="Add a tag and press Enter"
      />
      {!!value && filtered.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {filtered.map((tag) => (
            <button
              key={tag}
              onClick={() => addTag(tag)}
              className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-slate-700"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
