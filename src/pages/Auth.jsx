import React, { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import '../styles/Auth.css'; // Ensure the path is correct

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          const profileComplete = docSnap.exists() && docSnap.data().profileComplete;
          navigate(profileComplete ? '/dashboard' : '/profile');
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

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
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage('Signup successful! Redirecting...');
        navigate('/profile');
      } else {
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
