import React, { useState } from "react";

export default function CreateUserForm({ onCreate, loading }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [interests, setInterests] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const values = {
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      interests: interests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const success = await onCreate(values);

    if (success) {
      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
      setInterests("");
    }
  }

  return (
    <section className="panel">
      <h2>Create New User</h2>
      <p className="subtitle">Add a user account to Secure Notes.</p>

      <form onSubmit={handleSubmit}>
        <label>
          Full Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={2}
            maxLength={100}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Temporary Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            required
          />
        </label>

        <label>
          Role
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <label>
          Interests
          <input
            value={interests}
            onChange={(event) => setInterests(event.target.value)}
            placeholder="Reading, Technology, Sports"
          />
          <span className="subtitle">Separate interests with commas.</span>
        </label>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Creating User..." : "Create User"}
        </button>
      </form>
    </section>
  );
}
