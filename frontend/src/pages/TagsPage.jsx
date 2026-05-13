import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import ConfirmModal from "../components/ConfirmModal";

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [name, setName] = useState("");
  const [confirmTag, setConfirmTag] = useState(null);
  const navigate = useNavigate();

  async function loadTags() {
    const data = await api.getTags();
    setTags(data);
  }

  useEffect(() => {
    loadTags();
  }, []);

  return (
    <section className="space-y-4">
      <ConfirmModal
        isOpen={confirmTag !== null}
        message={
          confirmTag
            ? `Delete tag "${confirmTag}"? This cannot be undone.`
            : "Delete this tag? This cannot be undone."
        }
        onCancel={() => setConfirmTag(null)}
        onConfirm={async () => {
          if (!confirmTag) return;
          try {
            await api.deleteTag(confirmTag);
            await loadTags();
          } catch {
            // eslint-disable-next-line no-console
            console.error("Failed to delete tag");
          } finally {
            setConfirmTag(null);
          }
        }}
      />
      <h2 className="section-title text-4xl">Tags</h2>
      <div className="page-content-block flex gap-2 p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-[4px] border border-journal-grey/40 bg-journal-white px-3 py-2 text-sm text-journal-text outline-none focus:ring-2 focus:ring-journal-brown/20"
          placeholder="New tag name"
        />
        <button
          onClick={async () => {
            if (!name.trim()) return;
            await api.createTag(name);
            setName("");
            await loadTags();
          }}
          className="rounded-[4px] border border-journal-brown/40 bg-journal-brown px-4 py-2 text-sm font-semibold text-journal-white"
        >
          Create Tag
        </button>
      </div>

      <div className="page-content-block p-4">
        <h3 className="mb-4 font-heading text-2xl italic text-journal-brown">Tag List</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.name}
              className="flex items-center gap-2 rounded-full border border-journal-brown/30 bg-journal-sticky px-3 py-1 text-sm font-semibold text-journal-brown"
            >
              <span className="font-heading italic">{tag.name}</span>
              <span className="text-xs text-journal-grey">({tag.count} entries)</span>
              <button
                type="button"
                className="font-heading text-sm italic text-journal-brown underline"
                onClick={() => navigate(`/entries?search=${encodeURIComponent(tag.name)}`)}
              >
                View
              </button>
              <button
                type="button"
                className="rounded-[4px] border border-journal-grey/50 bg-journal-white px-2 py-0.5 text-xs font-semibold text-journal-charcoal"
                onClick={() => setConfirmTag(tag.name)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
