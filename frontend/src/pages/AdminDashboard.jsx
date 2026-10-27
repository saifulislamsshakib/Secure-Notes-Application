import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest, clearToken } from "../services/api.js";
import NoteForm from "../components/NoteForm.jsx";
import NoteList from "../components/NoteList.jsx";
import PostList from "../components/PostList.jsx";
import CreateUserForm from "../components/CreateUserForm.jsx";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");

  const [myNotes, setMyNotes] = useState([]);
  const [myEditingNote, setMyEditingNote] = useState(null);
  const [myNotesPage, setMyNotesPage] = useState(1);
  const [myNotesTotalPages, setMyNotesTotalPages] = useState(1);
  const [myNotesLoading, setMyNotesLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userNotes, setUserNotes] = useState([]);
  const [notesPage, setNotesPage] = useState(1);
  const [notesTotalPages, setNotesTotalPages] = useState(1);
  const [notesLoading, setNotesLoading] = useState(false);

  const [publicPosts, setPublicPosts] = useState([]);
  const [publicPostsLoading, setPublicPostsLoading] = useState(false);
  const [publicPostsError, setPublicPostsError] = useState("");

  const [interestGroups, setInterestGroups] = useState([]);
  const [interestsLoading, setInterestsLoading] = useState(false);
  const [interestsError, setInterestsError] = useState("");

  const logout = useCallback(() => {
    clearToken();
    navigate("/", { replace: true });
  }, [navigate]);

  // Verify admin role and load users.
  const loadUsers = useCallback(async () => {
    setUsersLoading(true);

    try {
      const profile = await apiRequest("/users/me");
      const currentUser = profile.user || profile;

      if (currentUser.role !== "admin") {
        navigate("/dashboard", { replace: true });
        return;
      }

      const data = await apiRequest("/admin/users?page=1&limit=100");
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (error) {
      if (!localStorage.getItem("token")) {
        logout();
      } else {
        setMessage(error.message || "Could not load users.");
      }
    } finally {
      setUsersLoading(false);
    }
  }, [logout, navigate]);

  // Load the admin's own notes.
  const loadMyNotes = useCallback(async (page = 1) => {
    setMyNotesLoading(true);

    try {
      const data = await apiRequest(`/notes?page=${page}&limit=10`);

      setMyNotes(data.notes || []);
      setMyNotesPage(page);
      setMyNotesTotalPages(Math.max(1, data.pagination?.totalPages || 1));
    } catch (error) {
      setMessage(error.message || "Could not load your notes.");
    } finally {
      setMyNotesLoading(false);
    }
  }, []);

  // Load all public posts.
  const loadPublicPosts = useCallback(async () => {
    setPublicPostsLoading(true);
    setPublicPostsError("");

    try {
      const data = await apiRequest("/posts/public");
      setPublicPosts(data.posts || []);
    } catch (error) {
      setPublicPostsError(error.message || "Could not load public posts.");
    } finally {
      setPublicPostsLoading(false);
    }
  }, []);

  // Load users grouped by interests using the aggregation endpoint.
  const loadInterestGroups = useCallback(async () => {
    setInterestsLoading(true);
    setInterestsError("");

    try {
      const data = await apiRequest("/admin/users/interests");
      setInterestGroups(data.groups || []);
    } catch (error) {
      setInterestGroups([]);
      setInterestsError(error.message || "Could not load interest groups.");
    } finally {
      setInterestsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadMyNotes(1);
    loadPublicPosts();
    loadInterestGroups();
  }, [loadUsers, loadMyNotes, loadPublicPosts, loadInterestGroups]);

  // Create or update the admin's own note.
  async function saveMyNote(values) {
    setMessage("");

    try {
      if (myEditingNote) {
        await apiRequest(`/notes/${myEditingNote._id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });

        setMessage("Your note updated successfully.");
      } else {
        await apiRequest("/notes", {
          method: "POST",
          body: JSON.stringify(values),
        });

        setMessage("Your note created successfully.");
      }

      setMyEditingNote(null);
      await loadMyNotes(1);
      return true;
    } catch (error) {
      setMessage(error.message || "Could not save your note.");
      return false;
    }
  }

  // Delete the admin's own note.
  async function deleteMyNote(id) {
    if (!window.confirm("Are you sure you want to delete your note?")) {
      return;
    }

    setMessage("");

    try {
      await apiRequest(`/notes/${id}`, {
        method: "DELETE",
      });

      setMessage("Your note deleted successfully.");

      const nextPage =
        myNotes.length === 1 && myNotesPage > 1 ? myNotesPage - 1 : myNotesPage;

      await loadMyNotes(nextPage);
    } catch (error) {
      setMessage(error.message || "Could not delete your note.");
    }
  }

  // Create a user from the dashboard form.
  async function createUser(values) {
    setCreatingUser(true);
    setMessage("");

    try {
      await apiRequest("/admin/users", {
        method: "POST",
        body: JSON.stringify(values),
      });

      setMessage("User created successfully.");

      await Promise.all([loadUsers(), loadInterestGroups()]);

      return true;
    } catch (error) {
      setMessage(error.message || "Could not create user.");
      return false;
    } finally {
      setCreatingUser(false);
    }
  }

  async function changeRole(user) {
    const newRole = user.role === "admin" ? "user" : "admin";

    if (
      !window.confirm(`Change ${user.name || user.email}'s role to ${newRole}?`)
    ) {
      return;
    }

    setMessage("");

    try {
      await apiRequest(`/admin/users/${user._id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });

      setMessage("User role updated successfully.");
      await loadUsers();
    } catch (error) {
      setMessage(error.message || "Could not change user role.");
    }
  }

  async function deleteUser(user) {
    if (
      !window.confirm(
        `Delete ${user.name || user.email}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setMessage("");

    try {
      await apiRequest(`/admin/users/${user._id}`, {
        method: "DELETE",
      });

      if (selectedUser?._id === user._id) {
        setSelectedUser(null);
        setUserNotes([]);
      }

      setMessage("User deleted successfully.");

      await Promise.all([loadUsers(), loadInterestGroups()]);
    } catch (error) {
      setMessage(error.message || "Could not delete user.");
    }
  }

  async function viewUserNotes(user, page = 1) {
    setSelectedUser(user);
    setNotesLoading(true);
    setMessage("");

    try {
      const data = await apiRequest(
        `/admin/users/${user._id}/notes?page=${page}&limit=10`,
      );

      setUserNotes(data.notes || []);
      setNotesPage(data.pagination?.page || page);
      setNotesTotalPages(Math.max(1, data.pagination?.totalPages || 1));
    } catch (error) {
      setUserNotes([]);
      setMessage(error.message || "Could not load this user's notes.");
    } finally {
      setNotesLoading(false);
    }
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="subtitle">
            Manage your notes, users, and public posts.
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
        editingNote={myEditingNote}
        onSave={saveMyNote}
        onCancel={() => setMyEditingNote(null)}
        loading={myNotesLoading}
      />

      {myNotesLoading && myNotes.length === 0 ? (
        <p>Loading your notes...</p>
      ) : (
        <NoteList
          notes={myNotes}
          page={myNotesPage}
          totalPages={myNotesTotalPages}
          onEdit={setMyEditingNote}
          onDelete={deleteMyNote}
          onPageChange={loadMyNotes}
        />
      )}

      <CreateUserForm onCreate={createUser} loading={creatingUser} />

      <section className="notes-section">
        <div className="dashboard-header">
          <h2>User Management</h2>

          <button
            type="button"
            className="cancel-button"
            onClick={loadUsers}
            disabled={usersLoading}
          >
            {usersLoading ? "Loading..." : "Refresh Users"}
          </button>
        </div>

        {usersLoading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          users.map((user) => (
            <article className="admin-row" key={user._id}>
              <div>
                <h3>{user.name || "Unnamed User"}</h3>
                <p>{user.email}</p>
                <p>
                  Role: <strong>{user.role}</strong>
                </p>
              </div>

              <div className="admin-actions">
                <button
                  type="button"
                  className="view-notes-button"
                  onClick={() => viewUserNotes(user, 1)}
                >
                  View Notes
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => changeRole(user)}
                  disabled={user.role === "admin"}
                >
                  Change Role
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => deleteUser(user)}
                  disabled={user.role === "admin"}
                >
                  Delete User
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      {selectedUser && (
        <section className="notes-section">
          <div className="dashboard-header">
            <div>
              <h2>User Notes</h2>
              <p className="subtitle">
                Notes belonging to {selectedUser.name || selectedUser.email}.
              </p>
            </div>

            <button
              type="button"
              className="cancel-button"
              onClick={() => {
                setSelectedUser(null);
                setUserNotes([]);
              }}
            >
              Close
            </button>
          </div>

          {notesLoading ? (
            <p>Loading notes...</p>
          ) : userNotes.length === 0 ? (
            <p>No notes found for this user.</p>
          ) : (
            userNotes.map((note) => (
              <article className="note-card" key={note._id}>
                <h3>{note.title}</h3>
                <p className="note-content">{note.content}</p>

                {note.createdAt && (
                  <p className="note-date">
                    Created: {new Date(note.createdAt).toLocaleString()}
                  </p>
                )}
              </article>
            ))
          )}

          {notesTotalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="cancel-button"
                disabled={notesLoading || notesPage <= 1}
                onClick={() => viewUserNotes(selectedUser, notesPage - 1)}
              >
                Previous
              </button>

              <span>
                Page {notesPage} of {notesTotalPages}
              </span>

              <button
                type="button"
                className="cancel-button"
                disabled={notesLoading || notesPage >= notesTotalPages}
                onClick={() => viewUserNotes(selectedUser, notesPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

      {/* Interests Aggregation  */}
      <section className="notes-section">
        <div className="dashboard-header">
          <div>
            <h2>Users Grouped by Interests</h2>
            <p className="subtitle">
              View users grouped according to their interests.
            </p>
          </div>

          <button
            type="button"
            className="cancel-button"
            onClick={loadInterestGroups}
            disabled={interestsLoading}
          >
            {interestsLoading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {interestsError && (
          <p className="form-message error" role="alert">
            {interestsError}
          </p>
        )}

        {interestsLoading ? (
          <p>Loading interest groups...</p>
        ) : !interestsError && interestGroups.length === 0 ? (
          <p>No interest groups found.</p>
        ) : (
          interestGroups.map((group) => (
            <article className="note-card" key={group.interest}>
              <h3>{group.interest}</h3>

              <p>
                Total users: <strong>{group.userCount}</strong>
              </p>

              {group.users?.length > 0 ? (
                <ul>
                  {group.users.map((user) => (
                    <li key={user.id}>
                      <strong>{user.name}</strong>
                      {" — "}
                      {user.email}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No users found in this group.</p>
              )}
            </article>
          ))
        )}
      </section>

      <section className="notes-section">
        <div className="dashboard-header">
          <div>
            <h2>Public Posts</h2>
            <p className="subtitle">Posts shared publicly by all users.</p>
          </div>

          <button
            type="button"
            className="cancel-button"
            onClick={loadPublicPosts}
            disabled={publicPostsLoading}
          >
            {publicPostsLoading ? "Loading..." : "Refresh Posts"}
          </button>
        </div>

        {publicPostsError && (
          <p className="form-message" role="alert">
            {publicPostsError}
          </p>
        )}

        <PostList
          posts={publicPosts}
          loading={publicPostsLoading}
          onRefresh={loadPublicPosts}
        />
      </section>
    </main>
  );
}
