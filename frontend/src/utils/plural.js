/**
 * @param {number} count
 * @param {string} word Singular noun (e.g. "word", "babble")
 * @param {string} [pluralForm] Optional irregular plural (e.g. "entries")
 */
export function plural(count, word, pluralForm) {
  const noun = count === 1 ? word : (pluralForm ?? `${word}s`);
  return `${count} ${noun}`;
}

/** Word count label with optional reading time (~200 wpm). Omits read time when count is 0. */
export function wordCountWithReadingTime(wordCount) {
  const count = wordCount ?? 0;
  const words = plural(count, "word");
  if (count === 0) return words;
  const readingTime = Math.max(1, Math.ceil(count / 200));
  return `${words} · ~${readingTime} min read`;
}
