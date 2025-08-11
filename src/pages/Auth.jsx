import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import "../styles/Auth.css";
import strathLogo from "../assets/SU-Logo.png";

import { getFirestore, doc, setDoc } from "firebase/firestore";
import { addProfile } from "../services/db";

const firestore = getFirestore();

const Auth = () => {
  const navigate = useNavigate();

  const [tab, setTab] = useState("login"); // "login" or "signup"
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Separate visibility for each password input
  const [visibility, setVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleVisibility = (field) => {
    setVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleAuth = async (isSignup) => {
    const { email, password, confirmPassword } = form;
    if (!email || !password) {
      setMessage("Both email and password are required.");
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await setDoc(doc(firestore, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          createdAt: new Date().toISOString(),
          displayName: email.split("@")[0],
          role: "student",
        });

        await addProfile({
          id: user.uid,
          email: user.email,
          name: email.split("@")[0],
          bio: "",
          username: email.split("@")[0],
        });

        setMessage("Signup successful! Redirecting...");
        navigate("/profile");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("Login successful! Redirecting...");
        navigate("/dashboard");
      }
    } catch (error) {
      setMessage(`${isSignup ? "Signup" : "Login"} failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!form.email) {
      setMessage("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, form.email);
      setMessage("Password reset link sent! Check your inbox.");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo + Title */}
        <div className="auth-header">
          <img src={strathLogo} alt="Strathmore Logo" className="auth-logo" />
          <h1 className="auth-brand">Stratizen</h1>
          <p className="auth-subtitle">Empower the Campus. Shape the Future.</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => setTab("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`auth-tab ${tab === "signup" ? "active" : ""}`}
            onClick={() => setTab("signup")}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {/* Login Form */}
        {tab === "login" && (
          <div className="auth-form">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="auth-input"
              autoComplete="username"
            />

            <div className="auth-input-wrapper">
              <input
                type={visibility.password ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="auth-input"
                autoComplete="current-password"
              />
              <span
                className="toggle-visibility"
                onClick={() => toggleVisibility("password")}
                role="button"
                aria-label="Toggle password visibility"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") toggleVisibility("password");
                }}
              >
                {visibility.password ? "🙈" : "👁️"}
              </span>
            </div>

            <p className="forgot-password" onClick={handleForgotPassword}>
              Forgot Password?
            </p>

            <button
              onClick={() => handleAuth(false)}
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Processing..." : "Login"}
            </button>
          </div>
        )}

        {/* Signup Form */}
        {tab === "signup" && (
          <div className="auth-form">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="auth-input"
              autoComplete="username"
            />

            <div className="auth-input-wrapper">
              <input
                type={visibility.password ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="auth-input"
                autoComplete="new-password"
              />
              <span
                className="toggle-visibility"
                onClick={() => toggleVisibility("password")}
                role="button"
                aria-label="Toggle password visibility"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") toggleVisibility("password");
                }}
              >
                {visibility.password ? "🙈" : "👁️"}
              </span>
            </div>

            <div className="auth-input-wrapper">
              <input
                type={visibility.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="auth-input"
                autoComplete="new-password"
              />
              <span
                className="toggle-visibility"
                onClick={() => toggleVisibility("confirmPassword")}
                role="button"
                aria-label="Toggle confirm password visibility"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") toggleVisibility("confirmPassword");
                }}
              >
                {visibility.confirmPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <button
              onClick={() => handleAuth(true)}
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Processing..." : "Create Account"}
            </button>
          </div>
        )}

        {/* Feedback */}
        {message && <p className="auth-message">{message}</p>}
      </div>
    </div>
  );
};

export default Auth;
