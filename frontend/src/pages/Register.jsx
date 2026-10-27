import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api.js";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [interests, setInterests] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const interestList = [
        ...new Set(
          interests
            .split(",")
            .map((interest) => interest.trim())
            .filter(Boolean)
            .map((interest) => interest.slice(0, 50)),
        ),
      ];

      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          interests: interestList,
        }),
      });

      navigate("/", {
        replace: true,
        state: {
          message: "Registration successful. Please log in.",
        },
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-container">
      <h1>Create Account</h1>
      <p className="subtitle">Register to start using Secure Notes.</p>

      <form onSubmit={handleSubmit}>
        <label>
          Full name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            onChange={(e) => setEmail(e.target.value)}
            maxLength={254}
            required
          />
        </label>

        <label>
          Password
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              maxLength={72}
              required
            />
            <button
              type="button"
              className="show-password-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <label>
          Interests
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="Reading, Technology, Sports"
            maxLength={500}
          />
          <small>Separate interests with commas.</small>
        </label>

        <button className="submit-button" disabled={loading}>
          {loading ? "Please wait..." : "Create Account"}
        </button>
      </form>

      {message && <p className="form-message error">{message}</p>}

      <p>
        Already registered? <Link to="/">Login</Link>
      </p>
    </main>
  );
}
