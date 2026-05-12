import { useEffect, useMemo, useState } from "react";
import { eachDayOfInterval, endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import { api } from "../api";

function getColor(wordCount) {
  if (!wordCount) return "bg-[#d8d8d8]";
  return `bg-[#6B1E1E]`;
}

function Heatmap({ entries }) {
  const byDate = useMemo(() => {
    const map = new Map();
    entries.forEach((entry) => map.set(entry.date, entry.wordCount || 0));
    return map;
  }, [entries]);

  const maxWordCount = useMemo(
    () => Math.max(1, ...entries.map((entry) => entry.wordCount || 0)),
    [entries]
  );

  const days = useMemo(() => {
    const today = new Date();
    const intervalStart = startOfWeek(subWeeks(today, 51), { weekStartsOn: 1 });
    const intervalEnd = endOfWeek(today, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: intervalStart, end: intervalEnd });
  }, []);

  const weeks = useMemo(() => {
    const arr = [];
    for (let i = 0; i < days.length; i += 7) {
      arr.push(days.slice(i, i + 7));
    }
    return arr;
  }, [days]);

  const monthLabels = useMemo(
    () =>
      weeks.map((week, idx) => {
        const first = week[0];
        if (idx === 0 || format(first, "MMM") !== format(weeks[idx - 1][0], "MMM")) {
          return format(first, "MMM");
        }
        return "";
      }),
    [weeks]
  );

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        <div className="mb-2 grid grid-cols-[repeat(53,minmax(0,1fr))] gap-1 pl-9 text-[10px] text-[#7a5a4d]">
          {monthLabels.map((month, index) => (
            <div key={`${month}-${index}`} className="h-3">
              {month}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="grid grid-rows-7 gap-1 text-[10px] text-[#7a5a4d]">
            {["Mon", "", "Wed", "", "Fri", "", "Sun"].map((label, idx) => (
              <div key={`label-${idx}`} className="h-3 leading-3">
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[repeat(53,minmax(0,1fr))] gap-1">
            {weeks.map((week, weekIdx) => (
              <div key={`week-${weekIdx}`} className="grid grid-rows-7 gap-1">
                {week.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const wordCount = byDate.get(key) || 0;
                  return (
                    <div
                      key={key}
                      title={`${key} - ${wordCount} words`}
                      className={`h-3 w-3 rounded-[2px] ${getColor(wordCount)}`}
                      style={wordCount ? { opacity: Math.max(0.3, wordCount / maxWordCount) } : undefined}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
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
      <h2 className="section-title text-4xl">Writing stats</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="card-surface p-4">
          <p className="text-sm font-bold text-[#6b4a3b]">Current streak</p>
          <p className="font-heading text-3xl font-bold italic text-journal-maroon">{stats.currentStreak} 🔥</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-sm font-bold text-[#6b4a3b]">Longest streak</p>
          <p className="font-heading text-3xl font-bold italic text-journal-maroon">{stats.longestStreak}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-sm font-bold text-[#6b4a3b]">Total entries</p>
          <p className="font-heading text-3xl font-bold italic text-journal-maroon">{stats.totalEntries}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-sm font-bold text-[#6b4a3b]">Total words</p>
          <p className="font-heading text-3xl font-bold italic text-journal-maroon">{stats.totalWords}</p>
        </div>
      </div>
      <div className="card-surface p-4">
        <h3 className="mb-3 font-heading text-2xl italic text-journal-maroon">Writing calendar</h3>
        <Heatmap entries={stats.heatmap} />
      </div>
    </section>
  );
}
