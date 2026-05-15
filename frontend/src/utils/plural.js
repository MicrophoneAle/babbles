/**
 * @param {number} count
 * @param {string} word Singular noun (e.g. "word", "babble")
 * @param {string} [pluralForm] Optional irregular plural (e.g. "entries")
 */
export function plural(count, word, pluralForm) {
  const noun = count === 1 ? word : (pluralForm ?? `${word}s`);
  return `${count} ${noun}`;
}
