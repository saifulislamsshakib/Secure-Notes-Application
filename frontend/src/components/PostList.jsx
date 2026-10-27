import React from "react";
export default function PostList({ posts, loading, onRefresh }) {
  return (
    <section className="notes-section">
      <div className="dashboard-header">
        <h2>Public Posts</h2>

        <button
          type="button"
          className="cancel-button"
          onClick={onRefresh}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No public posts yet.</p>
      ) : (
        posts.map((post) => (
          <article className="note-card" key={post._id}>
            <h3>{post.title}</h3>
            <p className="note-content">{post.content}</p>

            <p className="note-date">By: {post.authorName || "User"}</p>

            {post.createdAt && (
              <p className="note-date">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            )}
          </article>
        ))
      )}
    </section>
  );
}
