import { useEffect } from "react";
import { createPortal } from "react-dom";
import RichEditor from "./Editor";
import TagInput from "./TagInput";

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

/**
 * Immersive fullscreen writing overlay (portal to document.body).
 * Parent owns editor state; this only changes presentation.
 */
export default function FullscreenEditor({
  open,
  onClose,
  title,
  onTitleChange,
  readOnly,
  tags,
  setTags,
  savedTags,
  suggestions,
  content,
  onEditorChange,
  editorKey,
  status,
  showSavedFlash,
  onSave,
  scrollAreaRef,
  restoreScrollTop,
  restoreScrollToken
}) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen editor"
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[90vw] flex-col overflow-hidden rounded-[2px] border border-[rgba(107,74,42,0.3)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        style={{
          width: "min(90vw, 100%)",
          height: "min(90vh, 100%)",
          backgroundColor: "#f5edd9",
          backgroundImage: `repeating-linear-gradient(
            to bottom,
            rgba(0,0,0,0) 0,
            rgba(0,0,0,0) 28px,
            rgba(107,74,42,0.08) 29px
          )`
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-[2px] p-1.5 text-[#6b4a2a] transition hover:bg-[rgba(107,74,42,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6b4a2a]/40"
          title="Exit fullscreen"
          aria-label="Exit fullscreen"
        >
          <CloseIcon />
        </button>

        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          readOnly={readOnly}
          disabled={readOnly}
          placeholder="Title (optional)"
          className="mb-4 w-full shrink-0 rounded-[2px] border border-journal-grey/40 bg-journal-white/90 px-3 py-2 pr-12 font-heading text-xl italic text-journal-brown outline-none placeholder:text-journal-grey/60 focus:ring-2 focus:ring-journal-brown/20 disabled:cursor-not-allowed disabled:bg-[#f0ebe3]"
        />

        <div className="mb-4 shrink-0">
          <p className="mb-2 font-heading text-sm italic text-journal-brown">Tags</p>
          <TagInput tags={tags} setTags={setTags} suggestions={suggestions} savedTags={savedTags} readOnly={readOnly} />
        </div>

        <div className="fullscreen-editor-root flex min-h-0 min-w-0 flex-1 flex-col">
          <RichEditor
            key={editorKey}
            ref={scrollAreaRef}
            layout="fullscreen"
            value={content}
            readOnly={readOnly}
            restoreScrollTop={restoreScrollTop}
            restoreScrollToken={restoreScrollToken}
            onChange={onEditorChange}
          />
        </div>

        <div className="mt-4 flex shrink-0 flex-wrap items-center justify-end gap-3">
          <span className="text-xs font-semibold text-journal-grey">{readOnly ? "View only" : status}</span>
          {showSavedFlash && !readOnly ? <span className="save-indicator">✓ Babble saved</span> : null}
          {!readOnly ? (
            <button
              type="button"
              onClick={() => void onSave()}
              className="rounded-[2px] border border-journal-brown/60 bg-journal-brown px-4 py-2 text-sm font-semibold text-[#f5edd9] shadow-md transition hover:bg-[#5d4533]"
            >
              Save Entry
            </button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
