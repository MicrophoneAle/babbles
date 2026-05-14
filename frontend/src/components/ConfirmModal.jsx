export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Dismiss"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-[2px] border border-journal-brown/40 bg-journal-paper px-6 py-5 shadow-lg"
      >
        <p className="font-heading text-lg italic leading-relaxed text-journal-charcoal">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[2px] border border-journal-brown/50 bg-transparent px-4 py-2 text-sm font-semibold text-journal-brown transition hover:bg-journal-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-[2px] border border-journal-brown/60 bg-journal-brown px-4 py-2 text-sm font-semibold text-journal-white transition hover:bg-[#5d4533]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
