"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Underline as UnderlineIcon,
} from "lucide-react";
import { uploadImage } from "@/lib/upload-api";
import { getApiErrorMessage } from "@/lib/api-error";

interface AdminProductDescriptionEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function toolbarButtonClass(active?: boolean) {
  return `flex h-8 w-8 items-center justify-center border transition-colors ${
    active
      ? "border-teal-400 bg-teal-50 text-teal-700"
      : "border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:text-teal-700"
  }`;
}

export function normalizeDescriptionHtml(html: string): string {
  const trimmed = html.trim();
  if (
    !trimmed ||
    trimmed === "<p></p>" ||
    trimmed === "<p><br></p>" ||
    trimmed === "<p><br class=\"ProseMirror-trailingBreak\"></p>"
  ) {
    return "";
  }
  return trimmed;
}

export default function AdminProductDescriptionEditor({
  value,
  onChange,
  placeholder = "Nhập mô tả chi tiết — hỗ trợ in đậm, danh sách, chèn ảnh...",
}: AdminProductDescriptionEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-teal-600 underline" },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "mx-auto my-4 max-w-full rounded-none",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor: instance }) => {
      onChange(normalizeDescriptionHtml(instance.getHTML()));
    },
    editorProps: {
      attributes: {
        class:
          "admin-product-editor min-h-[220px] px-3 py-2.5 text-sm text-slate-800 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = normalizeDescriptionHtml(editor.getHTML());
    const next = normalizeDescriptionHtml(value);
    if (current !== next) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  const insertImage = (src: string, alt?: string) => {
    editor?.chain().focus().setImage({ src, alt: alt ?? "" }).run();
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file || !editor) return;

    setUploading(true);
    setError(null);
    try {
      const uploaded = await uploadImage(file);
      insertImage(uploaded.url, file.name);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleInsertImageUrl = () => {
    const url = imageUrl.trim();
    if (!url || !editor) return;
    insertImage(url);
    setImageUrl("");
    setShowUrlInput(false);
  };

  const handleSetLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Nhập URL liên kết:", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5 border border-slate-200 bg-slate-50 p-2">
        <button
          type="button"
          title="In đậm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarButtonClass(editor.isActive("bold"))}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="In nghiêng"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarButtonClass(editor.isActive("italic"))}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Gạch chân"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={toolbarButtonClass(editor.isActive("underline"))}
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Tiêu đề"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={toolbarButtonClass(editor.isActive("heading", { level: 2 }))}
        >
          <span className="text-xs font-bold">H2</span>
        </button>
        <button
          type="button"
          title="Danh sách"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarButtonClass(editor.isActive("bulletList"))}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Danh sách số"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={toolbarButtonClass(editor.isActive("orderedList"))}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Chèn liên kết"
          onClick={handleSetLink}
          className={toolbarButtonClass(editor.isActive("link"))}
        >
          <Link2 className="h-4 w-4" />
        </button>

        <span className="mx-1 h-6 w-px bg-slate-200" />

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-100 disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ImagePlus className="h-3.5 w-3.5" />
          )}
          Tải ảnh lên
        </button>
        <button
          type="button"
          onClick={() => setShowUrlInput((prev) => !prev)}
          className="inline-flex items-center gap-1.5 border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-teal-200 hover:text-teal-700"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          Dán link ảnh
        </button>

        <input
          ref={fileInputRef}
          id="admin-product-description-image"
          type="file"
          accept="image/*"
          aria-label="Chọn ảnh upload cho mô tả"
          className="sr-only"
          onChange={(e) => handleFileUpload(e.target.files?.[0] ?? null)}
        />
      </div>

      {showUrlInput && (
        <div className="flex flex-wrap gap-2 border border-slate-200 bg-white p-2">
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/.../anh.jpg"
            className="min-w-[240px] flex-1 border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400"
          />
          <button
            type="button"
            onClick={handleInsertImageUrl}
            className="bg-ocean-700 px-3 py-2 text-sm font-medium text-white hover:bg-ocean-800"
          >
            Chèn
          </button>
          <button
            type="button"
            onClick={() => {
              setShowUrlInput(false);
              setImageUrl("");
            }}
            className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800"
          >
            Hủy
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="border border-slate-200 bg-white focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100">
        <EditorContent editor={editor} />
      </div>

      <p className="text-xs text-slate-500">
        Lưu dạng HTML — ảnh upload qua Cloudinary, hiển thị trên trang sản phẩm.
      </p>
    </div>
  );
}
