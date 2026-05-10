// resources/js/Components/RichTextEditor.tsx
// TipTap rich text editor configured for Arabic RTL medical notes
// npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-text-direction @tiptap/extension-placeholder @tiptap/extension-underline

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextDirection from "@tiptap/extension-text-direction";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";
import {
    Bold,
    Italic,
    UnderlineIcon,
    List,
    ListOrdered,
    Heading2,
    Undo,
    Redo,
} from "lucide-react";

interface Props {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    editable?: boolean;
    minHeight?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = "اكتب ملاحظاتك الطبية هنا...",
    editable = true,
    minHeight = "200px",
}: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Disable extensions we don't need in medical notes
                codeBlock: false,
                code: false,
                blockquote: false,
                horizontalRule: false,
            }),
            Underline,
            TextDirection.configure({
                types: ["heading", "paragraph"],
                defaultDirection: "rtl",
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: "is-editor-empty",
            }),
        ],
        content: value,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "outline-none",
                dir: "rtl",
            },
        },
    });

    // Sync external value changes (e.g. form reset)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value, false);
        }
    }, [value]);

    if (!editor) return null;

    return (
        <div
            className={`border rounded-lg overflow-hidden ${editable ? "border-gray-300 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500" : "border-transparent bg-transparent"}`}
        >
            {/* Toolbar — only shown when editable */}
            {editable && (
                <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 flex-wrap">
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleBold().run()
                        }
                        active={editor.isActive("bold")}
                        title="غامق"
                    >
                        <Bold size={15} />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                        active={editor.isActive("italic")}
                        title="مائل"
                    >
                        <Italic size={15} />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleUnderline().run()
                        }
                        active={editor.isActive("underline")}
                        title="تسطير"
                    >
                        <UnderlineIcon size={15} />
                    </ToolbarButton>

                    <div className="w-px h-5 bg-gray-200 mx-1" />

                    <ToolbarButton
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run()
                        }
                        active={editor.isActive("heading", { level: 2 })}
                        title="عنوان"
                    >
                        <Heading2 size={15} />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleBulletList().run()
                        }
                        active={editor.isActive("bulletList")}
                        title="قائمة نقطية"
                    >
                        <List size={15} />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleOrderedList().run()
                        }
                        active={editor.isActive("orderedList")}
                        title="قائمة مرقّمة"
                    >
                        <ListOrdered size={15} />
                    </ToolbarButton>

                    <div className="w-px h-5 bg-gray-200 mx-1" />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="تراجع"
                    >
                        <Undo size={15} />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="إعادة"
                    >
                        <Redo size={15} />
                    </ToolbarButton>
                </div>
            )}

            {/* Editor content */}
            <style>{`
                .ProseMirror { min-height: ${minHeight}; padding: 12px 14px; direction: rtl; }
                .ProseMirror:focus { outline: none; }
                .ProseMirror p { margin-bottom: 0.5em; line-height: 1.7; }
                .ProseMirror h2 { font-size: 1.1em; font-weight: 700; margin-bottom: 0.4em; }
                .ProseMirror ul, .ProseMirror ol { padding-right: 1.25rem; margin-bottom: 0.5em; }
                .ProseMirror li { margin-bottom: 0.2em; }
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                    float: right;
                    height: 0;
                }
            `}</style>

            <EditorContent editor={editor} />
        </div>
    );
}

function ToolbarButton({
    children,
    onClick,
    active = false,
    disabled = false,
    title,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    title?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`
                p-1.5 rounded-md transition-colors
                ${active ? "bg-primary-100 text-primary-700" : "text-gray-600 hover:bg-gray-200"}
                ${disabled ? "opacity-30 cursor-not-allowed" : ""}
            `}
        >
            {children}
        </button>
    );
}
