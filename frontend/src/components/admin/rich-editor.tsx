"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ImagePlus,
  Link2,
  Link2Off,
  Undo2,
  Redo2,
  RemoveFormatting,
} from "lucide-react";
import { uploadAdminMedia } from "@/lib/admin-upload";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Минимальная высота редактируемой области */
  minHeight?: string;
  className?: string;
  /** Для SEO-имени файла при вставке картинки */
  nameHint?: string;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? "bg-[#0F3D2E]/30 text-emerald-300"
          : "text-white/50 hover:text-white hover:bg-white/10"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="w-px h-5 bg-white/10 mx-0.5" />;
}

export function RichEditor({
  value,
  onChange,
  placeholder = "Начните писать...",
  minHeight = "200px",
  className = "",
  nameHint,
}: RichEditorProps) {
  const suppressUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full" },
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-emerald-300 underline" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor: e }) => {
      if (suppressUpdate.current) return;
      const html = e.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-invert max-w-none focus:outline-none px-4 py-3 text-sm text-white leading-relaxed",
        style: `min-height: ${minHeight}`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const normalizedCurrent = current === "<p></p>" ? "" : current;
    const normalizedValue = value || "";
    if (normalizedCurrent !== normalizedValue) {
      suppressUpdate.current = true;
      editor.commands.setContent(normalizedValue || "<p></p>", { emitUpdate: false });
      suppressUpdate.current = false;
    }
  }, [value, editor]);

  const insertImage = useCallback(async () => {
    if (!editor) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const { url, error } = await uploadAdminMedia(file, { nameHint, role: "content" });
      if (error) {
        alert(error);
        return;
      }
      if (url) {
        editor.chain().focus().setImage({ src: url, alt: nameHint?.trim() || "" }).run();
      }
    };
    input.click();
  }, [editor, nameHint]);

  const insertLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = prompt("URL ссылки:", prev || "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const ic = 15;

  return (
    <div
      className={`rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden ${className}`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-white/[0.08] bg-white/[0.02]">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Жирный (Ctrl+B)"
        >
          <Bold size={ic} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Курсив (Ctrl+I)"
        >
          <Italic size={ic} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Подчёркивание (Ctrl+U)"
        >
          <UnderlineIcon size={ic} />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Заголовок H2"
        >
          <Heading2 size={ic} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Заголовок H3"
        >
          <Heading3 size={ic} />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Маркированный список"
        >
          <List size={ic} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Нумерованный список"
        >
          <ListOrdered size={ic} />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton onClick={insertImage} title="Вставить изображение">
          <ImagePlus size={ic} />
        </ToolbarButton>
        <ToolbarButton
          onClick={insertLink}
          active={editor.isActive("link")}
          title="Вставить ссылку"
        >
          <Link2 size={ic} />
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Убрать ссылку"
          >
            <Link2Off size={ic} />
          </ToolbarButton>
        )}

        <ToolbarSeparator />

        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          title="Очистить форматирование"
        >
          <RemoveFormatting size={ic} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Отменить (Ctrl+Z)"
        >
          <Undo2 size={ic} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Повторить (Ctrl+Y)"
        >
          <Redo2 size={ic} />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
