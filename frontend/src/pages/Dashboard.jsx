import React from "react";

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, clearToken } from "../services/api.js";

import NoteForm from "../components/NoteForm.jsx";
import NoteList from "../components/NoteList.jsx";
import PostForm from "../components/PostForm.jsx";
import PostList from "../components/PostList.jsx";

export default function Dashboard() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [message, setMessage] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);

  const logout = useCallback(() => {
    clearToken();
    navigate("/", { replace: true });
  }, [navigate]);

  const loadNotes = useCallback(
    async (selectedPage = 1) => {
      setNotesLoading(true);

      try {
        const profile = await apiRequest("/users/me");
        const currentUser = profile.user || profile;

        if (currentUser.role === "admin") {
          navigate("/admin", { replace: true });
          return;
        }

        const data = await apiRequest(`/notes?page=${selectedPage}&limit=10`);

        setNotes(data.notes || []);
        setPage(selectedPage);
        setTotalPages(Math.max(1, data.pagination?.totalPages || 1));
      } catch (error) {
        if (!localStorage.getItem("token")) {
          logout();
        } else {
          setMessage(error.message || "Could not load notes.");
        }
      } finally {
        setNotesLoading(false);
      }
    },
    [logout, navigate],
  );

  const loadPublicPosts = useCallback(async () => {
    setPostsLoading(true);

    try {
      const data = await apiRequest("/posts/public");
      setPosts(data.posts || []);
    } catch (error) {
      setMessage(error.message || "Could not load public posts.");
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes(1);
    loadPublicPosts();
  }, [loadNotes, loadPublicPosts]);

  // Create or update a personal note.
  async function saveNote(values) {
    setMessage("");

    try {
      if (editingNote) {
        await apiRequest(`/notes/${editingNote._id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });

        setMessage("Note updated successfully.");
      } else {
        await apiRequest("/notes", {
          method: "POST",
          body: JSON.stringify(values),
        });

        setMessage("Note created successfully.");
      }

      setEditingNote(null);
      await loadNotes(1);

      return true;
    } catch (error) {
      setMessage(error.message || "Could not save note.");
      return false;
    }
  }

  // Delete a personal note.
  async function deleteNote(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?",
    );

    if (!confirmed) return;

    setMessage("");

    try {
      await apiRequest(`/notes/${id}`, {
        method: "DELETE",
      });

      setMessage("Note deleted successfully.");

      const nextPage = notes.length === 1 && page > 1 ? page - 1 : page;

      await loadNotes(nextPage);
    } catch (error) {
      setMessage(error.message || "Could not delete note.");
    }
  }

  // Publish a public post.
  async function publishPost(values) {
    setMessage("");
    setPublishing(true);

    try {
      await apiRequest("/posts", {
        method: "POST",
        body: JSON.stringify(values),
      });

      setMessage("Public post published successfully.");
      await loadPublicPosts();

      return true;
    } catch (error) {
      setMessage(error.message || "Could not publish post.");
      return false;
    } finally {
      setPublishing(false);
    }
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Secure Notes</h1>
          <p className="subtitle">
            Manage your private notes and share public posts.
          </p>
        </div>

        <button type="button" className="logout-button" onClick={logout}>
          Logout
        </button>
      </header>

      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}

      <NoteForm
        editingNote={editingNote}
        onSave={saveNote}
        onCancel={() => setEditingNote(null)}
        loading={notesLoading}
      />

      {notesLoading && notes.length === 0 ? (
        <p>Loading your notes...</p>
      ) : (
        <NoteList
          notes={notes}
          page={page}
          totalPages={totalPages}
          onEdit={setEditingNote}
          onDelete={deleteNote}
          onPageChange={loadNotes}
        />
      )}

      <PostForm onPublish={publishPost} loading={publishing} />

      <PostList
        posts={posts}
        loading={postsLoading}
        onRefresh={loadPublicPosts}
      />
    </main>
  );
}
