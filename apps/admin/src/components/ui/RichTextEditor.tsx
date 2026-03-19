"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
        active
          ? "bg-brand-100 text-brand-700"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const addLink = useCallback(() => {
    const url = window.prompt("URL:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "blog/content");
      try {
        const res = await fetch("/admin/api/admin/upload", { method: "POST", body: formData });
        const json = await res.json();
        if (res.ok && json.data?.url) {
          editor.chain().focus().setImage({ src: json.data.url }).run();
        } else {
          const url = window.prompt("Upload failed. Enter image URL manually:");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }
      } catch {
        const url = window.prompt("Upload failed. Enter image URL manually:");
        if (url) editor.chain().focus().setImage({ src: url }).run();
      }
    };
    input.click();
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-surface-border px-3 py-2 bg-slate-50/50">
      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strike"
      >
        <s>S</s>
      </ToolbarButton>
      <div className="w-px h-5 bg-slate-200 mx-1" />
      <ToolbarButton
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      >
        H3
      </ToolbarButton>
      <div className="w-px h-5 bg-slate-200 mx-1" />
      <ToolbarButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet list"
      >
        • List
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Ordered list"
      >
        1. List
      </ToolbarButton>
      <div className="w-px h-5 bg-slate-200 mx-1" />
      <ToolbarButton
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Blockquote"
      >
        &ldquo; Quote
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="Code block"
      >
        {"</>"}
      </ToolbarButton>
      <div className="w-px h-5 bg-slate-200 mx-1" />
      <ToolbarButton
        active={editor.isActive("link")}
        onClick={addLink}
        title="Insert link"
      >
        🔗 Link
      </ToolbarButton>
      <ToolbarButton onClick={addImage} title="Insert image">
        🖼 Image
      </ToolbarButton>
      <div className="w-px h-5 bg-slate-200 mx-1" />
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Divider"
      >
        —
      </ToolbarButton>
    </div>
  );
}

/** TipTap-based rich text editor with toolbar */
export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          HTMLAttributes: { class: "text-brand-600 underline" },
        },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full my-4" },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Start writing…",
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none px-4 py-3 min-h-[240px] focus:outline-none",
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-surface-border bg-white overflow-hidden focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-400 transition-shadow">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
