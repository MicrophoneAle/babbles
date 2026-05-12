export default function Prompts({ prompts, hidden, onHide }) {
  if (hidden || !prompts?.length) return null;
  return (
    <section className="mb-4 animate-fadeIn rounded-2xl border border-violet-100 bg-white/75 p-4 shadow-soft">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-extrabold text-violet-700">Daily prompts</h3>
        <button onClick={onHide} className="text-xs font-bold text-slate-500 hover:text-slate-700">
          Hide
        </button>
      </div>
      <ul className="space-y-1 text-sm text-slate-600">
        {prompts.map((prompt) => (
          <li key={prompt}>- {prompt}</li>
        ))}
      </ul>
    </section>
  );
}
