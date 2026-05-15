export default function Prompts({ prompts, hidden, onHide }) {
  if (hidden || !prompts?.length) return null;
  return (
    <section className="card-surface mb-4 animate-fadeIn p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-heading text-2xl italic text-journal-brown">Daily prompts</h3>
        <button onClick={onHide} className="font-dancing text-ds-xs font-semibold text-journal-grey hover:text-journal-charcoal">
          Hide
        </button>
      </div>
      <ul className="space-y-1 font-dancing text-ds-sm text-journal-charcoal">
        {prompts.map((prompt) => (
          <li key={prompt}>- {prompt}</li>
        ))}
      </ul>
    </section>
  );
}
