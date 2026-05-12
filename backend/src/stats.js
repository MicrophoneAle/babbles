function normalizeToDateOnly(input) {
  return new Date(`${input.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

export function calculateStreaks(dates) {
  if (!dates.length) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const unique = [...new Set(dates.map((d) => d.toISOString().slice(0, 10)))]
    .map((d) => new Date(`${d}T00:00:00.000Z`))
    .sort((a, b) => a - b);

  let longest = 1;
  let current = 1;

  for (let i = 1; i < unique.length; i += 1) {
    const prev = normalizeToDateOnly(unique[i - 1]).getTime();
    const now = normalizeToDateOnly(unique[i]).getTime();
    const diffDays = (now - prev) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      current += 1;
    } else {
      longest = Math.max(longest, current);
      current = 1;
    }
  }

  longest = Math.max(longest, current);

  const today = new Date();
  const todayDate = new Date(`${today.toISOString().slice(0, 10)}T00:00:00.000Z`);
  const latest = normalizeToDateOnly(unique[unique.length - 1]);
  const delta = (todayDate.getTime() - latest.getTime()) / (1000 * 60 * 60 * 24);

  if (delta > 1) {
    return { currentStreak: 0, longestStreak: longest };
  }

  let runningCurrent = 1;
  for (let i = unique.length - 1; i > 0; i -= 1) {
    const a = normalizeToDateOnly(unique[i]).getTime();
    const b = normalizeToDateOnly(unique[i - 1]).getTime();
    if ((a - b) / (1000 * 60 * 60 * 24) === 1) {
      runningCurrent += 1;
    } else {
      break;
    }
  }

  return { currentStreak: runningCurrent, longestStreak: longest };
}
