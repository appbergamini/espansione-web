import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect, useImperativeHandle, forwardRef } from 'react';

const ToolbarBtn = ({ onClick, active, title, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    style={{
      background: active ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${active ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.08)'}`,
      color: active ? '#60a5fa' : 'var(--text-secondary)',
      padding: '0.3rem 0.55rem',
      borderRadius: '5px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '0.85rem',
      fontWeight: 600,
      opacity: disabled ? 0.4 : 1,
    }}
  >
    {children}
  </button>
);

function RichTextEditor({ value, onChange, placeholder, height = 240 }, ref) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
    ],
    content: value || '',
    immediatelyRender: false,
    onUpdate({ editor }) { onChange?.(editor.getHTML()); },
    editorProps: {
      attributes: {
        style: `min-height:${height}px;outline:none;padding:0.75rem 1rem;font-size:0.92rem;line-height:1.55;color:var(--text-primary);`,
        'data-placeholder': placeholder || '',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  useImperativeHandle(ref, () => ({
    insertText(text) { editor?.chain().focus().insertContent(text).run(); },
    focus() { editor?.commands.focus(); },
  }), [editor]);

  if (!editor) return <div style={{ minHeight: `${height}px`, background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }} />;

  const isActive = (name, attrs) => editor.isActive(name, attrs);

  const promptLink = () => {
    const previous = editor.getAttributes('link').href || '';
    const url = window.prompt('URL do link:', previous);
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ display: 'flex', gap: '0.3rem', padding: '0.4rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={isActive('bold')} title="Negrito (Ctrl+B)"><strong>B</strong></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={isActive('italic')} title="Itálico (Ctrl+I)"><em>I</em></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={isActive('strike')} title="Tachado"><s>S</s></ToolbarBtn>
        <span style={{ width: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 0.2rem' }} />
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={isActive('heading', { level: 2 })} title="Título">H</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={isActive('bulletList')} title="Lista">• Lista</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={isActive('orderedList')} title="Lista numerada">1. Lista</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={isActive('blockquote')} title="Citação">❝</ToolbarBtn>
        <span style={{ width: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 0.2rem' }} />
        <ToolbarBtn onClick={promptLink} active={isActive('link')} title="Link">🔗</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Limpar formatação">✖ Fmt</ToolbarBtn>
        <span style={{ flex: 1 }} />
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Desfazer (Ctrl+Z)" disabled={!editor.can().undo()}>↶</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Refazer (Ctrl+Y)" disabled={!editor.can().redo()}>↷</ToolbarBtn>
      </div>
      <EditorContent editor={editor} />
      <style jsx global>{`
        .ProseMirror > *:first-child { margin-top: 0; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: var(--text-secondary);
          float: left;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror p { margin: 0.5rem 0; }
        .ProseMirror h2 { font-size: 1.15rem; margin: 0.75rem 0 0.4rem; font-weight: 700; }
        .ProseMirror h3 { font-size: 1rem; margin: 0.6rem 0 0.35rem; font-weight: 600; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.4rem; margin: 0.5rem 0; }
        .ProseMirror li { margin: 0.15rem 0; }
        .ProseMirror blockquote { border-left: 3px solid rgba(96,165,250,0.4); margin: 0.5rem 0; padding: 0.2rem 0.75rem; color: var(--text-secondary); }
        .ProseMirror a { color: #60a5fa; text-decoration: underline; }
        .ProseMirror strong { font-weight: 700; }
        .ProseMirror em { font-style: italic; }
      `}</style>
    </div>
  );
}

export default forwardRef(RichTextEditor);
