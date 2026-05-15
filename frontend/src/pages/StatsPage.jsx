import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths
} from "date-fns";
import { api } from "../api";
import { plural } from "../utils/plural";

/** Stable tilt per calendar day (re-renders do not reshuffle). */
function stickyRotationDeg(day) {
  const d = day.getDate();
  const m = day.getMonth() + 1;
  return ((d * 13 + m * 7) % 11) - 5;
}

function StickyCalendar({ entries }) {
  const [monthCursor, setMonthCursor] = useState(new Date());
  const byDate = useMemo(() => {
    const map = new Map();
    entries.forEach((entry) => map.set(entry.date, entry.wordCount || 0));
    return map;
  }, [entries]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(monthCursor);
    const monthEnd = endOfMonth(monthCursor);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [monthCursor]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          className="rounded-[2px] border border-journal-grey/40 px-3 py-1 font-dancing text-ds-sm"
          onClick={() => setMonthCursor(subMonths(monthCursor, 1))}
        >
          ←
        </button>
        <h3 className="font-dancing text-5xl italic text-journal-brown">{format(monthCursor, "MMMM yyyy")}</h3>
        <button
          className="rounded-[2px] border border-journal-grey/40 px-3 py-1 font-dancing text-ds-sm"
          onClick={() => setMonthCursor(addMonths(monthCursor, 1))}
        >
          →
        </button>
      </div>
      <div className="mb-2 grid grid-cols-7 gap-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-center font-heading text-base italic text-journal-grey">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const words = byDate.get(key) || 0;
          const inMonth = isSameMonth(day, monthCursor);
          const today = isSameDay(day, new Date());
          return (
            <div
              key={key}
              title={`${format(day, "PPP")} - ${plural(words, "word")}`}
              className={`relative h-16 rounded-[2px] border border-[#d9ccb0] p-1 text-xs shadow-sm transition ${
                words ? "bg-[#e9d6ad]" : "bg-journal-sticky"
              } ${today ? "ring-2 ring-journal-brown/30" : ""} ${inMonth ? "" : "opacity-40"}`}
              style={{ transform: `rotate(${stickyRotationDeg(day)}deg)` }}
            >
              <p className="font-dancing font-semibold text-journal-charcoal">{format(day, "d")}</p>
              {words > 0 ? (
                <div className="mt-1 text-[10px] text-journal-brown">
                  <span>✒</span> {words}w
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalEntries: 0,
    totalWords: 0,
    heatmap: []
  });

  useEffect(() => {
    api.getStats().then(setStats);
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="section-title text-5xl">Writing stats</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="page-content-block p-4">
          <p className="font-heading text-xl italic text-journal-grey">Current streak</p>
          <p className="font-heading text-4xl italic text-journal-brown">{stats.currentStreak} 🔥</p>
        </div>
        <div className="page-content-block p-4">
          <p className="font-heading text-xl italic text-journal-grey">Longest streak</p>
          <p className="font-heading text-4xl italic text-journal-brown">{stats.longestStreak}</p>
        </div>
        <div className="page-content-block p-4">
          <p className="font-heading text-xl italic text-journal-grey">Total babbles</p>
          <p className="font-heading text-4xl italic text-journal-brown">{stats.totalEntries}</p>
        </div>
        <div className="page-content-block p-4">
          <p className="font-heading text-xl italic text-journal-grey">Total words</p>
          <p className="font-heading text-4xl italic text-journal-brown">{stats.totalWords}</p>
        </div>
      </div>
      <div className="page-content-block p-4">
        <StickyCalendar entries={stats.heatmap} />
      </div>
    </section>
  );
}
