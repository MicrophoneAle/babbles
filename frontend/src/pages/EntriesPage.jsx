import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { api } from "../api";
import { useOwner } from "../AuthProvider";
import ConfirmModal from "../components/ConfirmModal";
import { plural } from "../utils/plural";

function formatCreatedTime(iso) {
  if (!iso) return "";
  try {
    return format(parseISO(iso), "h:mm a");
  } catch {
    return "";
  }
}

export default function EntriesPage() {
  const { isOwner } = useOwner();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [entries, setEntries] = useState([]);
  const [confirmEntryId, setConfirmEntryId] = useState(null);

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

  const grouped = useMemo(() => {
    const map = new Map();
    for (const entry of entries) {
      const d = entry.date;
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(entry);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0));
  }, [entries]);

  return (
    <section className="space-y-4">
      <ConfirmModal
        isOpen={confirmEntryId !== null}
        message="Delete this babble? This cannot be undone."
        onCancel={() => setConfirmEntryId(null)}
        onConfirm={async () => {
          if (confirmEntryId == null) return;
          try {
            await api.deleteEntryById(confirmEntryId);
            setEntries((prev) => prev.filter((e) => e.id !== confirmEntryId));
          } catch {
            // eslint-disable-next-line no-console
            console.error("Failed to delete entry");
          } finally {
            setConfirmEntryId(null);
          }
        }}
      />
      <h2 className="section-title text-5xl">Past Babbles</h2>
      <div className="page-content-block p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[2px] border border-journal-grey/40 bg-journal-white px-3 py-2 font-dancing text-ds-sm text-journal-text outline-none focus:ring-2 focus:ring-journal-brown/20"
          placeholder="Search by keyword or tag..."
        />
      </div>
      {entries.length === 0 ? (
        <p className="font-dancing text-ds-xl italic text-journal-grey">
          No babbles yet — open Babble to start writing!
        </p>
      ) : (
        grouped.map(([date, dayEntries]) => (
          <div key={date} className="space-y-3">
            <h3 className="font-heading text-3xl italic text-journal-brown">{date}</h3>
            {dayEntries.map((entry) => {
              const title = (entry.title || "").trim();
              const previewLine = title || (entry.preview?.length ? entry.preview : "No preview yet…");
              return (
                <article
                  key={entry.id}
                  className="page-content-block animate-fadeIn p-4 transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-dancing text-ds-xs font-semibold uppercase tracking-wide text-journal-grey">
                        {formatCreatedTime(entry.createdAt)}
                      </p>
                      <p
                        className={
                          title
                            ? "mt-1 font-heading text-sm font-medium italic leading-relaxed text-journal-charcoal"
                            : "mt-1 font-prose text-sm font-medium leading-relaxed text-journal-charcoal"
                        }
                      >
                        {previewLine}
                      </p>
                    </div>
                    {isOwner ? (
                      <button
                        type="button"
                        className="shrink-0 font-dancing text-ds-xs text-red-800/60 underline decoration-red-800/30 hover:text-red-800/80"
                        onClick={() => setConfirmEntryId(entry.id)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-2 font-dancing text-ds-base italic text-journal-grey">
                    {plural(entry.wordCount ?? 0, "word")}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {(entry.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-[2px] border border-journal-brown/30 bg-journal-sticky px-2 py-1 font-dancing text-ds-xs font-semibold text-journal-brown"
                      >
                        #{tag}
                      </span>
                    ))}
                    {isOwner ? (
                      <div className="ml-auto flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          className="font-dancing text-ds-base italic text-journal-brown underline"
                          onClick={() => navigate(`/entry/${entry.id}`, { state: { viewOnly: true } })}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="font-dancing text-ds-base italic text-journal-brown underline"
                          onClick={() => navigate(`/entry/${entry.id}`, { state: { editMode: true } })}
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      <Link
                        to={`/entry/${entry.id}`}
                        className="ml-auto font-dancing text-ds-base italic text-journal-brown underline"
                      >
                        Read More
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ))
      )}
    </section>
  );
}
