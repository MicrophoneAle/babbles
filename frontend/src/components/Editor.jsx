import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef } from "react";

const HIGHLIGHT_COLORS = [
  { hex: "#FFD700", label: "Yellow" },
  { hex: "#90EE90", label: "Green" },
  { hex: "#ADD8E6", label: "Blue" },
  { hex: "#FFB6C1", label: "Pink" },
  { hex: "#FFD580", label: "Orange" },
  { hex: "#D8B4FE", label: "Purple" },
  { hex: "#FCA5A5", label: "Red" }
];

const TOOL_BTN_BASE =
  "rounded-[2px] border border-journal-grey/30 bg-[#f6f4ef] px-2 py-1 text-xs font-semibold text-journal-charcoal transition hover:bg-[#ece8df] max-md:min-h-9 max-md:min-w-9 max-md:flex max-md:items-center max-md:justify-center max-md:px-2.5";
const TOOL_BTN_ACTIVE = "bg-[#e8dcc2] border-[#6b4a2a]";

function toolBtnClass(active) {
  return [TOOL_BTN_BASE, active ? TOOL_BTN_ACTIVE : ""].filter(Boolean).join(" ");
}

function Toolbar({ editor, readOnly }) {
  const imageInputRef = useRef(null);

  if (!editor || readOnly) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is over 2MB and may slow down saving");
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const base64 = readerEvent.target?.result;
      if (typeof base64 === "string") {
        editor.chain().focus().setImage({ src: base64 }).run();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="editor-toolbar mb-3 flex flex-col gap-2 rounded-[2px] border border-journal-grey/25 bg-[#faf8f3] p-2 max-md:gap-2.5">
      <input
        type="file"
        accept="image/jpeg, image/png"
        style={{ display: "none" }}
        ref={imageInputRef}
        onChange={handleImageUpload}
      />
      <div className="editor-toolbar-row flex flex-wrap items-center gap-2 max-md:gap-2.5">
        <button
          type="button"
          className={toolBtnClass(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          className={toolBtnClass(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </button>
        <button
          type="button"
          className={toolBtnClass(editor.isActive("underline"))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          U
        </button>
        <span className="mx-0.5 h-4 w-px shrink-0 bg-journal-grey/30" aria-hidden />
        <button
          type="button"
          className={toolBtnClass(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </button>
        <button
          type="button"
          className={toolBtnClass(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </button>
        <button
          type="button"
          className={toolBtnClass(editor.isActive("heading", { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          Heading
        </button>
        <button
          type="button"
          className={toolBtnClass(editor.isActive("blockquote"))}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Quote
        </button>
        <span className="mx-0.5 h-4 w-px shrink-0 bg-journal-grey/30" aria-hidden />
        <button
          type="button"
          className={toolBtnClass(false)}
          title="Insert image"
          aria-label="Insert image"
          onClick={() => imageInputRef.current?.click()}
        >
          Image
        </button>
      </div>

      <div className="editor-toolbar-row flex flex-wrap items-center gap-1.5 border-t border-journal-grey/20 pt-2 max-md:gap-2.5">
        <span className="font-ui-hint mr-1 text-[10px] font-bold uppercase tracking-wide text-journal-grey">Highlight</span>
        {HIGHLIGHT_COLORS.map(({ hex, label }) => (
          <button
            key={hex}
            type="button"
            title={label}
            aria-label={`Highlight ${label}`}
            className={[
              "h-[20px] w-[20px] shrink-0 rounded-full border-2 border-[rgba(107,74,42,0.35)] shadow-sm ring-offset-1 transition hover:scale-110 hover:ring-2 hover:ring-journal-brown/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-journal-brown/40 max-md:h-9 max-md:w-9",
              editor.isActive("highlight", { color: hex }) ? "ring-2 ring-[#6b4a2a] ring-offset-1" : ""
            ].join(" ")}
            style={{ backgroundColor: hex }}
            onClick={() => editor.chain().focus().toggleHighlight({ color: hex }).run()}
          />
        ))}
        <button
          type="button"
          title="Remove highlight"
          aria-label="Remove highlight"
          className="ml-0.5 flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full border-2 border-dashed border-journal-brown/50 bg-[#f6f4ef] text-[11px] font-bold leading-none text-journal-brown transition hover:bg-[#ece8df] hover:border-journal-brown max-md:h-9 max-md:w-9"
          onClick={() => editor.chain().focus().unsetHighlight().run()}
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default function RichEditor({
  value,
  onChange,
  readOnly = false,
  fullscreen = false,
  scrollAreaClassName,
  autoFocusEditor = false
}) {
  const didAutoFocus = useRef(false);

  const editor = useEditor({
    editable: !readOnly,
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        inline: false,
        allowBase64: true
      }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: readOnly ? "Read-only view" : "Write your thoughts..."
      })
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "tiptap journal-page min-h-[280px] bg-transparent p-5 text-journal-text max-w-none focus:outline-none"
      }
    },
    onUpdate: ({ editor: instance }) => {
      if (readOnly) return;
      onChange({
        json: instance.getJSON(),
        text: instance.getText()
      });
    }
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    if (!autoFocusEditor) {
      didAutoFocus.current = false;
    }
  }, [autoFocusEditor]);

  useEffect(() => {
    if (!editor || readOnly || !autoFocusEditor || didAutoFocus.current) return;
    didAutoFocus.current = true;
    const id = requestAnimationFrame(() => {
      editor.chain().focus("end").run();
    });
    return () => cancelAnimationFrame(id);
  }, [editor, readOnly, autoFocusEditor]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getJSON();
    const next = value || { type: "doc", content: [{ type: "paragraph" }] };
    if (JSON.stringify(current) !== JSON.stringify(next)) {
      editor.commands.setContent(next, false);
    }
  }, [editor, value]);

  const scrollHeightClass = scrollAreaClassName || "h-[320px]";

  return (
    <div className="animate-fadeIn">
      <Toolbar editor={editor} readOnly={readOnly} />
      <div
        className={`editor-scroll-area overflow-y-auto rounded-[2px] border border-[#d8d6d1] bg-[#faf8f5] ${scrollHeightClass}`}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
