import { useEffect, useState } from "react";
import React from "react";
export default function NoteForm({ editingNote, onSave, onCancel, loading }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    setTitle(editingNote?.title || "");
    setContent(editingNote?.content || "");
  }, [editingNote]);

  async function handleSubmit(event) {
    event.preventDefault();

    const saved = await onSave({
      title: title.trim(),
      content: content.trim(),
    });

    if (saved) {
      setTitle("");
      setContent("");
    }
  }

  return (
    <section className="panel">
      <h2>{editingNote ? "Edit Note" : "Create a Note"}</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
          />
        </label>

        <label>
          Content
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={20000}
            rows={5}
            required
          />
        </label>

        <div className="form-actions">
          <button className="submit-button" disabled={loading}>
            {loading ? "Saving..." : editingNote ? "Save Changes" : "Add Note"}
          </button>

          {editingNote && (
            <button type="button" className="cancel-button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
