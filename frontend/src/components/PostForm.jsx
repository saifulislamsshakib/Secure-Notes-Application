import React from "react";
import { useState } from "react";

export default function PostForm({ onPublish, loading }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const success = await onPublish({
      title: title.trim(),
      content: content.trim(),
    });

    if (success) {
      setTitle("");
      setContent("");
    }
  }

  return (
    <section className="panel">
      <h2>Create a Public Post</h2>
      <p className="subtitle">Share something that other users can read.</p>

      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            required
          />
        </label>

        <label>
          Content
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={20000}
            rows={4}
            required
          />
        </label>

        <button className="submit-button" disabled={loading}>
          {loading ? "Publishing..." : "Publish Post"}
        </button>
      </form>
    </section>
  );
}
