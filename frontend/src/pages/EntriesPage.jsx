import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { api } from "../api";
import { useOwner } from "../AuthProvider";
import ConfirmModal from "../components/ConfirmModal";
import { wordCountWithReadingTime } from "../utils/plural";

function formatCreatedTime(iso) {
  if (!iso) return "";
  try {
    return format(parseISO(iso), "h:mm a");
  } catch {
    return "";
  }
}

/** Body snippet only — omit when API preview duplicates the title. */
function getBodyPreview(entry, title) {
  const preview = (entry.preview || "").trim();
  if (!preview) return null;
  if (title && preview === title) return null;
  return preview;
}

const SORT_NEWEST = "newest";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "longest", label: "Longest" },
  { value: "shortest", label: "Shortest" }
];

function createdAtMs(entry) {
  if (!entry.createdAt) return 0;
  const ms = Date.parse(entry.createdAt);
  return Number.isNaN(ms) ? 0 : ms;
}

function sortDayEntries(list, sortBy) {
  const entries = [...list];
  switch (sortBy) {
    case "oldest":
      return entries.sort((a, b) => createdAtMs(a) - createdAtMs(b));
    case "longest":
      return entries.sort((a, b) => (b.wordCount ?? 0) - (a.wordCount ?? 0));
    case "shortest":
      return entries.sort((a, b) => (a.wordCount ?? 0) - (b.wordCount ?? 0));
    case "newest":
    default:
      return entries.sort((a, b) => createdAtMs(b) - createdAtMs(a));
  }
}

export default function EntriesPage() {
  const { isOwner } = useOwner();
  const navigate = useNavigate();
  const location = useLocation();
  const initialDate = location.state?.selectedDate;
  const consumedInitialDate = useRef(false);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [entries, setEntries] = useState([]);
  const [dateIndex, setDateIndex] = useState(0);
  const [sortBy, setSortBy] = useState(SORT_NEWEST);
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

  const sortedDates = useMemo(() => {
    const dates = new Set(entries.map((e) => e.date));
    return [...dates].sort((a, b) => a.localeCompare(b));
  }, [entries]);

  const currentDate = sortedDates[dateIndex] ?? null;

  const dayEntries = useMemo(() => {
    if (!currentDate) return [];
    return entries.filter((e) => e.date === currentDate);
  }, [entries, currentDate]);

  const sortedDayEntries = useMemo(
    () => sortDayEntries(dayEntries, sortBy),
    [dayEntries, sortBy]
  );

  useEffect(() => {
    setSortBy(SORT_NEWEST);
  }, [currentDate]);

  useEffect(() => {
    if (sortedDates.length === 0) {
      setDateIndex(0);
      return;
    }
    if (!consumedInitialDate.current && initialDate) {
      consumedInitialDate.current = true;
      const idx = sortedDates.indexOf(initialDate);
      setDateIndex(idx >= 0 ? idx : sortedDates.length - 1);
      return;
    }
    if (!consumedInitialDate.current) {
      consumedInitialDate.current = true;
      setDateIndex(sortedDates.length - 1);
      return;
    }
    setDateIndex((prev) => {
      const prevDate = sortedDates[prev];
      if (prevDate) {
        const idx = sortedDates.indexOf(prevDate);
        if (idx >= 0) return idx;
      }
      return sortedDates.length - 1;
    });
  }, [sortedDates, initialDate]);

  const canGoOlder = sortedDates.length > 0 && dateIndex > 0;
  const canGoNewer = sortedDates.length > 0 && dateIndex < sortedDates.length - 1;

  const formattedCurrentDate = currentDate
    ? format(new Date(`${currentDate}T12:00:00`), "EEEE, MMMM d, yyyy")
    : "";

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
      <h2 className="section-title">Past Babbles</h2>
      <div className="page-content-block p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="babble-title-input w-full rounded-[2px] border border-journal-grey/40 bg-journal-white px-3 py-2 text-sm text-journal-text outline-none focus:ring-2 focus:ring-journal-brown/20"
          placeholder="Search by keyword or tag..."
        />
      </div>
      {entries.length === 0 ? (
        <p className="font-ui-hint text-ds-xl text-journal-grey">
          No babbles yet — open Babble to start writing!
        </p>
      ) : sortedDates.length === 0 ? (
        <p className="font-ui-hint text-ds-xl text-journal-grey">No babbles match your search.</p>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-4">
            {canGoOlder ? (
              <button
                type="button"
                onClick={() => setDateIndex((i) => i - 1)}
                className="text-ds-3xl leading-none text-[#6b4a2a] transition hover:text-[#3b2a1a]"
                aria-label="Older date"
              >
                ←
              </button>
            ) : (
              <span className="text-ds-3xl leading-none text-journal-grey/40" aria-hidden>
                ←
              </span>
            )}
            <h3 className="font-date-md shrink-0 whitespace-nowrap text-center text-journal-brown">
              {formattedCurrentDate}
            </h3>
            {canGoNewer ? (
              <button
                type="button"
                onClick={() => setDateIndex((i) => i + 1)}
                className="text-ds-3xl leading-none text-[#6b4a2a] transition hover:text-[#3b2a1a]"
                aria-label="Newer date"
              >
                →
              </button>
            ) : (
              <span className="text-ds-3xl leading-none text-journal-grey/40" aria-hidden>
                →
              </span>
            )}
            </div>
            <div className="flex justify-end">
              <div
                className="flex flex-wrap items-center justify-end gap-1"
                role="group"
                aria-label="Sort babbles"
              >
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortBy(option.value)}
                    className={`rounded-[2px] px-2 py-0.5 text-ds-xs transition ${
                      sortBy === option.value
                        ? "bg-[#ede2cb] text-[#3b2a1a]"
                        : "text-[#6b4a2a] hover:bg-[#f0e5cf]/80 hover:text-[#3b2a1a]"
                    }`}
                    aria-pressed={sortBy === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {sortedDayEntries.map((entry) => {
              const title = (entry.title || "").trim();
              const bodyPreview = getBodyPreview(entry, title);
              return (
                <article
                  key={entry.id}
                  className="page-content-block animate-fadeIn p-4 transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-time text-ds-xs font-semibold uppercase tracking-wide text-journal-grey">
                        {formatCreatedTime(entry.createdAt)}
                      </p>
                      <p
                        className={`babble-entry-title mt-1 ${
                          title ? "text-journal-charcoal" : "text-journal-charcoal/60"
                        }`}
                      >
                        {title || "Untitled Babble"}
                      </p>
                      {bodyPreview || !title ? (
                        <p className="mt-1 font-prose text-sm font-medium leading-relaxed text-journal-charcoal">
                          {bodyPreview || "No preview yet…"}
                        </p>
                      ) : null}
                    </div>
                    {isOwner ? (
                      <button
                        type="button"
                        className="shrink-0 text-ds-xs text-red-800/60 underline decoration-red-800/30 hover:text-red-800/80"
                        onClick={() => setConfirmEntryId(entry.id)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                  <p className="word-count mt-2 text-ds-base italic text-journal-grey">
                    {wordCountWithReadingTime(entry.wordCount)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {(entry.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="tag-chip rounded-[2px] border border-journal-brown/30 bg-journal-sticky px-2 py-1 text-ds-xs font-semibold text-journal-brown"
                      >
                        #{tag}
                      </span>
                    ))}
                    {isOwner ? (
                      <div className="ml-auto flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          className="text-ds-base text-journal-brown underline"
                          onClick={() => navigate(`/entry/${entry.id}`, { state: { viewOnly: true } })}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="text-ds-base text-journal-brown underline"
                          onClick={() => navigate(`/entry/${entry.id}`, { state: { editMode: true } })}
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      <Link
                        to={`/entry/${entry.id}`}
                        className="font-dancing ml-auto text-ds-base text-journal-brown underline"
                      >
                        Read More
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
