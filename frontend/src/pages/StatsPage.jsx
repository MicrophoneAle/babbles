import { useEffect, useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { api } from "../api";

function Heatmap({ dates }) {
  const set = new Set(dates);
  const days = useMemo(() => Array.from({ length: 140 }, (_, i) => subDays(new Date(), 139 - i)), []);
  return (
    <div className="grid grid-cols-20 gap-1">
      {days.map((day) => {
        const key = format(day, "yyyy-MM-dd");
        const active = set.has(key);
        return (
          <div
            key={key}
            title={key}
            className={`h-3 w-3 rounded-[2px] ${active ? "bg-journal-maroonSoft" : "bg-[#dccfb9]"}`}
          />
        );
      })}
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
        <Heatmap dates={stats.heatmap.map((d) => d.date)} />
      </div>
    </section>
  );
}
