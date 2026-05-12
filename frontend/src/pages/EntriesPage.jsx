import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function EntriesPage() {
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const id = setTimeout(async () => {
      const data = await api.getEntries(search);
      setEntries(data);
    }, 200);
    return () => clearTimeout(id);
  }, [search]);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-white/40 bg-white/60 p-4 shadow-soft">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-200"
          placeholder="Search by keyword or tag..."
        />
      </div>
      {entries.map((entry) => (
        <Link
          key={entry.id}
          to={`/entry/${entry.date}`}
          className="block animate-fadeIn rounded-2xl border border-white/40 bg-white/65 p-4 shadow-soft transition hover:-translate-y-0.5"
        >
          <h3 className="font-extrabold text-violet-700">{entry.date}</h3>
          <p className="mt-1 text-sm text-slate-600">{entry.preview || "No preview yet..."}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-sky-100 px-2 py-1 text-xs font-bold text-slate-700">
                #{tag}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </section>
  );
}
