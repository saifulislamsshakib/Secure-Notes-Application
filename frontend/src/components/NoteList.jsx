import React from "react";
export default function NoteList({
  notes,
  page,
  totalPages,
  onEdit,
  onDelete,
  onPageChange,
}) {
  return (
    <section className="notes-section">
      <h2>My Notes</h2>

      {notes.length === 0 ? (
        <p>No notes yet. Create your first note above.</p>
      ) : (
        notes.map((note) => (
          <article className="note-card" key={note._id}>
            <h3>{note.title}</h3>
            <p className="note-content">{note.content}</p>
            <p className="note-date">
              {note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}
            </p>

            <div className="note-actions">
              <button className="edit-button" onClick={() => onEdit(note)}>
                Edit
              </button>
              <button
                className="delete-button"
                onClick={() => onDelete(note._id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))
      )}

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}
