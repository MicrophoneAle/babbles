import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

const BTN =
  "rounded-[4px] border border-journal-gold/40 bg-[#f0e5d4] px-2 py-1 text-xs font-bold text-journal-maroon transition hover:bg-[#e6d5ba]";

function Toolbar({ editor }) {
  if (!editor) return null;
  return (
    <div className="mb-3 flex flex-wrap gap-2 rounded-[4px] border border-journal-gold/30 bg-[#f5f0e8] p-2">
      <button className={BTN} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
      <button className={BTN} onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
      <button className={BTN} onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
      <button className={BTN} onClick={() => editor.chain().focus().toggleHighlight().run()}>HL</button>
      <button className={BTN} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
      <button className={BTN} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
      <button className={BTN} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
      <button className={BTN} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
      <button className={BTN} onClick={() => editor.chain().focus().toggleBlockquote().run()}>" "</button>
    </div>
  );
}

export default function RichEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      Placeholder.configure({
        placeholder: "Write your thoughts..."
      })
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "journal-page min-h-[360px] rounded-[4px] border border-[#d6c4a4] bg-journal-cream p-5 text-journal-ink prose prose-stone max-w-none focus:outline-none"
      }
    },
    onUpdate: ({ editor: instance }) => {
      onChange({
        json: instance.getJSON(),
        text: instance.getText()
      });
    }
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(value || { type: "doc", content: [{ type: "paragraph" }] }, false);
  }, [value, editor]);

  return (
    <div className="animate-fadeIn">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
