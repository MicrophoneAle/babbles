import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { api } from "../api";
import { useOwner } from "../AuthProvider";
import ConfirmModal from "../components/ConfirmModal";
import { formatNavDate } from "../utils/navDate";
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
  const plainText = (entry.preview || "").trim();
  if (!plainText) return null;
  if (title && plainText === title) return null;
  return plainText.length > 150 ? plainText.slice(0, 150).trimEnd() + "..." : plainText;
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

function sortDayEntries(list, sortMode) {
  const sorted = [...list];
  switch (sortMode) {
    case "oldest":
      return sorted.sort((a, b) => createdAtMs(a) - createdAtMs(b));
    case "longest":
      return sorted.sort((a, b) => (b.wordCount ?? 0) - (a.wordCount ?? 0));
    case "shortest":
      return sorted.sort((a, b) => (a.wordCount ?? 0) - (b.wordCount ?? 0));
    case "newest":
    default:
      return sorted.sort((a, b) => createdAtMs(b) - createdAtMs(a));
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
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

  const activeDateIndex =
    sortedDates.length === 0 ? 0 : Math.min(Math.max(dateIndex, 0), sortedDates.length - 1);
  const currentDate = sortedDates[activeDateIndex] ?? null;

  const sortedDayEntries = useMemo(() => {
    if (!currentDate) return [];
    const filtered = entries.filter((e) => e.date === currentDate);
    return sortDayEntries(filtered, sortBy);
  }, [entries, currentDate, sortBy]);

  useEffect(() => {
    setSortBy(SORT_NEWEST);
    setDropdownOpen(false);
  }, [currentDate]);

  useEffect(() => {
    if (sortedDates.length === 0) return;
    const clamped = Math.min(Math.max(dateIndex, 0), sortedDates.length - 1);
    if (dateIndex !== clamped) {
      setDateIndex(clamped);
    }
  }, [sortedDates, dateIndex]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const canGoOlder = sortedDates.length > 0 && activeDateIndex > 0;
  const canGoNewer = sortedDates.length > 0 && activeDateIndex < sortedDates.length - 1;

  const formattedCurrentDate = currentDate
    ? formatNavDate(new Date(`${currentDate}T12:00:00`))
    : "";

  const selectedSortLabel =
    SORT_OPTIONS.find((option) => option.value === sortBy)?.label ?? "Newest first";

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
          <div className="relative flex w-full items-center">
            <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
                {canGoOlder ? (
                  <button
                    type="button"
                    onClick={() => setDateIndex((i) => i - 1)}
                    className="shrink-0 text-ds-3xl leading-none text-[#6b4a2a] transition hover:text-[#3b2a1a]"
                    aria-label="Older date"
                  >
                    ←
                  </button>
                ) : (
                  <span className="shrink-0 text-ds-3xl leading-none text-journal-grey/40" aria-hidden>
                    ←
                  </span>
                )}
                <h3 className="font-date-md whitespace-nowrap text-center text-journal-brown">
                  {formattedCurrentDate}
                </h3>
                {canGoNewer ? (
                  <button
                    type="button"
                    onClick={() => setDateIndex((i) => i + 1)}
                    className="shrink-0 text-ds-3xl leading-none text-[#6b4a2a] transition hover:text-[#3b2a1a]"
                    aria-label="Newer date"
                  >
                    →
                  </button>
                ) : (
                  <span className="shrink-0 text-ds-3xl leading-none text-journal-grey/40" aria-hidden>
                    →
                  </span>
                )}
              </div>
            <div ref={dropdownRef} className="ml-auto shrink-0" style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((open) => !open)}
                  className="font-dancing whitespace-nowrap text-ds-xs text-[#6b4a2a] transition hover:text-[#3b2a1a]"
                  style={{ marginTop: "8px" }}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="listbox"
                  aria-label="Sort babbles"
                >
                  {selectedSortLabel} ▾
                </button>
                {dropdownOpen ? (
                  <ul
                    role="listbox"
                    aria-label="Sort options"
                    className="right-0 min-w-[9.5rem] rounded-[2px] border border-journal-brown/25 py-1 shadow-sm"
                    style={{
                      position: "absolute",
                      top: "100%",
                      marginTop: "4px",
                      zIndex: 100
                    }}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <li key={option.value} role="presentation">
                        <button
                          type="button"
                          role="option"
                          aria-selected={sortBy === option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setDropdownOpen(false);
                          }}
                          className={`font-dancing block w-full px-3 py-1.5 text-left text-ds-xs transition ${
                            sortBy === option.value
                              ? "bg-[#ede2cb] text-[#3b2a1a]"
                              : "text-[#6b4a2a] hover:bg-[#f0e5cf]/80 hover:text-[#3b2a1a]"
                          }`}
                        >
                          {option.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
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
                      {bodyPreview ? (
                        <p className="mt-1 overflow-hidden font-prose text-sm font-medium leading-relaxed text-journal-charcoal [overflow-wrap:break-word] [word-break:break-word]">
                          {bodyPreview}
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
