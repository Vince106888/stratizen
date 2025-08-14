import React, { useState, useEffect, useRef } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import "../styles/Auth.css";
import strathLogo from "../assets/SU-Logo.png";

import { getFirestore, doc, setDoc } from "firebase/firestore";
import { createUserProfile } from "../services/db";

const firestore = getFirestore();

const Auth = () => {
  const navigate = useNavigate();

  // Refs for input elements to manage focus
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const [tab, setTab] = useState("login"); // "login" or "signup"
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Password visibility toggles
  const [visibility, setVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Global auth listener for user session tracking across app
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, optionally handle user state globally here
        console.log("User logged in:", user.uid);
      } else {
        // User is signed out
        console.log("No user logged in");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleVisibility = (field) => {
    setVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Enter key handlers for Login form inputs
  const handleKeyDownLogin = (e) => {
    if (e.key === "Enter") {
      if (e.target.name === "email") {
        passwordRef.current?.focus();
      } else if (e.target.name === "password") {
        handleAuth(false); // Login
      }
    }
  };

  // Enter key handlers for Signup form inputs
  const handleKeyDownSignup = (e) => {
    if (e.key === "Enter") {
      if (e.target.name === "email") {
        passwordRef.current?.focus();
      } else if (e.target.name === "password") {
        confirmPasswordRef.current?.focus();
      } else if (e.target.name === "confirmPassword") {
        handleAuth(true); // Signup
      }
    }
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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("Signed up user:", user);

        // Create profile in Firestore
        await createUserProfile(user, {
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
              ref={emailRef}
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              onKeyDown={handleKeyDownLogin}
              className="auth-input"
              autoComplete="username"
            />

            <div className="auth-input-wrapper">
              <input
                ref={passwordRef}
                type={visibility.password ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                onKeyDown={handleKeyDownLogin}
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
              ref={emailRef}
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              onKeyDown={handleKeyDownSignup}
              className="auth-input"
              autoComplete="username"
            />

            <div className="auth-input-wrapper">
              <input
                ref={passwordRef}
                type={visibility.password ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                onKeyDown={handleKeyDownSignup}
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
                ref={confirmPasswordRef}
                type={visibility.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                onKeyDown={handleKeyDownSignup}
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
