export default function Prompts({ prompts, hidden, onHide }) {
  if (hidden || !prompts?.length) return null;
  return (
    <section className="card-surface mb-4 animate-fadeIn p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="page-subheading text-journal-brown">Daily prompts</h3>
        <button onClick={onHide} className="text-ds-xs font-semibold text-journal-grey hover:text-journal-charcoal">
          Hide
        </button>
      </div>
      <ul className="prompt-list space-y-1 text-sm text-journal-charcoal">
        {prompts.map((prompt) => (
          <li key={prompt}>- {prompt}</li>
        ))}
      </ul>
    </section>
  );
}
