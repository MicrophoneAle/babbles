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
            className={`h-3 w-3 rounded-sm ${active ? "bg-violet-400" : "bg-violet-100"}`}
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
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/70 p-4 shadow-soft">
          <p className="text-sm font-bold text-slate-500">Current streak</p>
          <p className="text-3xl font-extrabold text-violet-700">{stats.currentStreak} 🔥</p>
        </div>
        <div className="rounded-2xl bg-white/70 p-4 shadow-soft">
          <p className="text-sm font-bold text-slate-500">Longest streak</p>
          <p className="text-3xl font-extrabold text-violet-700">{stats.longestStreak}</p>
        </div>
        <div className="rounded-2xl bg-white/70 p-4 shadow-soft">
          <p className="text-sm font-bold text-slate-500">Total entries</p>
          <p className="text-3xl font-extrabold text-violet-700">{stats.totalEntries}</p>
        </div>
        <div className="rounded-2xl bg-white/70 p-4 shadow-soft">
          <p className="text-sm font-bold text-slate-500">Total words</p>
          <p className="text-3xl font-extrabold text-violet-700">{stats.totalWords}</p>
        </div>
      </div>
      <div className="rounded-2xl bg-white/70 p-4 shadow-soft">
        <h3 className="mb-3 text-lg font-extrabold text-violet-700">Writing calendar</h3>
        <Heatmap dates={stats.heatmap.map((d) => d.date)} />
      </div>
    </section>
  );
}
