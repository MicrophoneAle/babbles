import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useOwner } from "../AuthProvider";
import ConfirmModal from "../components/ConfirmModal";

export default function EntriesPage() {
  const { isOwner } = useOwner();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [entries, setEntries] = useState([]);
  const [confirmDate, setConfirmDate] = useState(null);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const id = setTimeout(async () => {
      try {
        const data = await api.getEntries(search);
        setEntries(data);
      } catch {
        setEntries([]);
      }
    }, 200);
    return () => clearTimeout(id);
  }, [search]);

  return (
    <section className="space-y-4">
      <ConfirmModal
        isOpen={confirmDate !== null}
        message="Delete this entry? This cannot be undone."
        onCancel={() => setConfirmDate(null)}
        onConfirm={async () => {
          if (!confirmDate) return;
          try {
            await api.deleteEntry(confirmDate);
            setEntries((prev) => prev.filter((e) => e.date !== confirmDate));
          } catch {
            // eslint-disable-next-line no-console
            console.error("Failed to delete entry");
          } finally {
            setConfirmDate(null);
          }
        }}
      />
      <h2 className="section-title text-4xl">Past entries</h2>
      <div className="page-content-block p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[2px] border border-journal-grey/40 bg-journal-white px-3 py-2 text-sm text-journal-text outline-none focus:ring-2 focus:ring-journal-brown/20"
          placeholder="Search by keyword or tag..."
        />
      </div>
      {entries.length === 0 ? (
        <p className="font-heading text-lg italic text-journal-grey">No entries yet — open your journal to write!</p>
      ) : (
        entries.map((entry) => (
          <article key={entry.id} className="page-content-block animate-fadeIn p-4 transition hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-heading text-2xl italic text-journal-brown">{entry.date}</h3>
              {isOwner ? (
                <button
                  type="button"
                  className="shrink-0 text-xs text-red-800/60 underline decoration-red-800/30 hover:text-red-800/80"
                  onClick={() => setConfirmDate(entry.date)}
                >
                  Delete
                </button>
              ) : null}
            </div>
            <p className="mt-2 font-prose text-sm leading-relaxed text-journal-charcoal">
              {entry.preview?.length ? entry.preview : "No preview yet…"}
            </p>
            <p className="mt-2 font-heading text-sm italic text-journal-grey">
              {entry.wordCount ?? 0} words
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {(entry.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-[2px] border border-journal-brown/30 bg-journal-sticky px-2 py-1 text-xs font-semibold text-journal-brown"
                >
                  #{tag}
                </span>
              ))}
              <Link
                to={`/entry/${entry.date}`}
                className="ml-auto font-heading text-sm italic text-journal-brown underline"
              >
                Read More
              </Link>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
