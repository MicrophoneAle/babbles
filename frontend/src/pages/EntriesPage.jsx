import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";

export default function EntriesPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const id = setTimeout(async () => {
      const data = await api.getEntries(search);
      setEntries(data);
    }, 200);
    return () => clearTimeout(id);
  }, [search]);

  return (
    <section className="space-y-4">
      <h2 className="section-title text-4xl">Past entries</h2>
      <div className="card-surface p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[4px] border border-journal-gold/50 bg-journal-cream px-3 py-2 text-sm text-journal-ink outline-none focus:ring-2 focus:ring-journal-gold/40"
          placeholder="Search by keyword or tag..."
        />
      </div>
      {entries.map((entry) => (
        <Link
          key={entry.id}
          to={`/entry/${entry.date}`}
          className="card-surface block animate-fadeIn p-4 transition hover:-translate-y-0.5"
        >
          <h3 className="font-heading text-2xl italic text-journal-maroon">{entry.date}</h3>
          <p className="mt-1 text-sm text-[#4b332d]">{entry.preview || "No preview yet..."}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-journal-gold/60 bg-journal-maroon px-2 py-1 text-xs font-bold text-journal-gold"
              >
                #{tag}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </section>
  );
}
