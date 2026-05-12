export default function Prompts({ prompts, hidden, onHide }) {
  if (hidden || !prompts?.length) return null;
  return (
    <section className="card-surface mb-4 animate-fadeIn p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-heading text-xl italic text-journal-maroon">Daily prompts</h3>
        <button onClick={onHide} className="text-xs font-bold text-[#6b1e1e]/80 hover:text-[#6b1e1e]">
          Hide
        </button>
      </div>
      <ul className="space-y-1 text-sm text-[#4b332d]">
        {prompts.map((prompt) => (
          <li key={prompt}>- {prompt}</li>
        ))}
      </ul>
    </section>
  );
}
