import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, saveToken } from "../services/api.js";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!data.token) {
        throw new Error("Login response did not contain a token.");
      }

      saveToken(data.token);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-container">
      <h1>Secure Notes</h1>
      <p className="subtitle">Login to access your notes.</p>

      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <button className="submit-button" disabled={loading}>
          {loading ? "Please wait..." : "Login"}
        </button>
      </form>

      {message && <p className="form-message error">{message}</p>}

      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </main>
  );
}
