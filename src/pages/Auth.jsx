import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import '../styles/Auth.css';

// Firestore and Dexie
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { addProfile } from '../services/db'; // Make sure this path is correct

const firestore = getFirestore();

const Auth = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    signupEmail: '',
    signupPassword: '',
    loginEmail: '',
    loginPassword: '',
  });

  const [visibility, setVisibility] = useState({
    signup: false,
    login: false,
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleVisibility = (type) => {
    setVisibility((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleAuth = async (isSignup) => {
    const email = isSignup ? form.signupEmail : form.loginEmail;
    const password = isSignup ? form.signupPassword : form.loginPassword;

    if (!email || !password) {
      setMessage('Both email and password are required.');
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        // ✅ Sign up user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // ✅ Create Firestore user document
        await setDoc(doc(firestore, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          createdAt: new Date().toISOString(),
          displayName: email.split('@')[0],
          role: 'student',
        });

        // ✅ Add user to Dexie local DB
        await addProfile({
          id: user.uid,
          email: user.email,
          name: email.split('@')[0],
          bio: '',
          username: email.split('@')[0],
        });

        setMessage('Signup successful! Redirecting...');
        navigate('/profile');
      } else {
        // ✅ Log in user
        await signInWithEmailAndPassword(auth, email, password);
        setMessage('Login successful! Redirecting...');
        navigate('/dashboard');
      }
    } catch (error) {
      setMessage(`${isSignup ? 'Signup' : 'Login'} failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        {/* Signup Form */}
        <h2 className="auth-title">Sign Up</h2>
        <input
          type="email"
          name="signupEmail"
          value={form.signupEmail}
          onChange={handleChange}
          placeholder="Email"
          className="auth-input"
        />
        <div className="auth-input-wrapper">
          <input
            type={visibility.signup ? 'text' : 'password'}
            name="signupPassword"
            value={form.signupPassword}
            onChange={handleChange}
            placeholder="Password"
            className="auth-input"
          />
          <span className="toggle-visibility" onClick={() => toggleVisibility('signup')}>
            {visibility.signup ? '🙈' : '👁️'}
          </span>
        </div>
        <button
          onClick={() => handleAuth(true)}
          className="auth-button signup"
          disabled={loading}
        >
          Sign Up
        </button>

        {/* Login Form */}
        <h2 className="auth-title">Login</h2>
        <input
          type="email"
          name="loginEmail"
          value={form.loginEmail}
          onChange={handleChange}
          placeholder="Email"
          className="auth-input"
        />
        <div className="auth-input-wrapper">
          <input
            type={visibility.login ? 'text' : 'password'}
            name="loginPassword"
            value={form.loginPassword}
            onChange={handleChange}
            placeholder="Password"
            className="auth-input"
          />
          <span className="toggle-visibility" onClick={() => toggleVisibility('login')}>
            {visibility.login ? '🙈' : '👁️'}
          </span>
        </div>
        <button
          onClick={() => handleAuth(false)}
          className="auth-button login"
          disabled={loading}
        >
          Login
        </button>

        {/* Feedback */}
        {message && <p className="auth-message">{message}</p>}
        {loading && <p className="auth-loading">Processing...</p>}
      </div>
    </div>
  );
};

export default Auth;
