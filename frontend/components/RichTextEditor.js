"use client";

import { useEffect, useRef } from "react";

const toolbarActions = [
  { label: "Bold", command: "bold" },
  { label: "Italic", command: "italic" },
  { label: "Bullet", command: "insertUnorderedList" },
  { label: "Quote", command: "formatBlock", value: "blockquote" },
];

export default function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Describe the client requirements, scope, and delivery expectations...",
}) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  function runCommand(command, commandValue) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML || "");
  }

  return (
    <div className="field full">
      <label>{label}</label>
      <div className="rich-text-editor">
        <div className="rich-text-toolbar">
          {toolbarActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => runCommand(action.command, action.value)}
            >
              {action.label}
            </button>
          ))}
        </div>
        <div
          className="rich-text-surface"
          contentEditable
          ref={editorRef}
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={(event) => onChange(event.currentTarget.innerHTML)}
        />
      </div>
      <div className="form-note">
        Rich text is supported and sanitized on the backend before storage.
      </div>
    </div>
  );
}
