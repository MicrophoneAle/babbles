import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  async function loadTags() {
    const data = await api.getTagsSummary();
    setTags(data);
  }

  useEffect(() => {
    loadTags();
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="section-title text-4xl">Tags</h2>
      <div className="card-surface flex gap-2 p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-[4px] border border-journal-gold/50 bg-journal-cream px-3 py-2 text-sm text-journal-ink outline-none focus:ring-2 focus:ring-journal-gold/40"
          placeholder="New tag name"
        />
        <button
          onClick={async () => {
            if (!name.trim()) return;
            await api.createTag(name);
            setName("");
            loadTags();
          }}
          className="rounded-[4px] border border-journal-gold/60 bg-journal-maroon px-4 py-2 text-sm font-bold text-journal-cream"
        >
          Create Tag
        </button>
      </div>

      <div className="card-surface p-4">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.name}
              className="flex items-center gap-2 rounded-full border border-journal-gold/60 bg-journal-maroon px-3 py-1 text-sm font-bold text-journal-gold"
            >
              <button onClick={() => navigate(`/entries?search=${encodeURIComponent(tag.name)}`)}>
                #{tag.name} ({tag.count})
              </button>
              <button
                className="text-journal-cream"
                onClick={async () => {
                  const ok = window.confirm(`Delete tag "${tag.name}"?`);
                  if (!ok) return;
                  await api.deleteTag(tag.name);
                  loadTags();
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
