import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

const BTN =
  "rounded-[2px] border border-journal-grey/30 bg-[#f6f4ef] px-2 py-1 text-xs font-semibold text-journal-charcoal transition hover:bg-[#ece8df]";

function Toolbar({ editor }) {
  if (!editor) return null;
  return (
    <div className="mb-3 flex flex-wrap gap-2 rounded-[2px] border border-journal-grey/25 bg-[#faf8f3] p-2">
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
          "journal-page min-h-[280px] bg-transparent p-5 text-journal-text prose prose-stone max-w-none focus:outline-none"
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
    const current = editor.getJSON();
    const next = value || { type: "doc", content: [{ type: "paragraph" }] };
    if (JSON.stringify(current) !== JSON.stringify(next)) {
      editor.commands.setContent(next, false);
    }
  }, [editor]);

  return (
    <div className="animate-fadeIn">
      <Toolbar editor={editor} />
      <div className="editor-scroll-area h-[320px] overflow-y-auto rounded-[2px] border border-[#d8d6d1] bg-[#faf8f5]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
