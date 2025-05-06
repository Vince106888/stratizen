import React, { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase'; // ✅ corrected import path
import '../styles/Auth.css'; // adjust the path if needed

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

  // Redirect user if already authenticated
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-100 to-indigo-200 flex items-center justify-center px-4">
      <div className="max-w-md w-full p-8 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200">
        {/* Signup Form */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign Up</h2>
        <input
          type="email"
          name="signupEmail"
          value={form.signupEmail}
          onChange={handleChange}
          placeholder="Email"
          className="w-full px-4 py-3 mt-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <div className="relative mt-2">
          <input
            type={visibility.signup ? 'text' : 'password'}
            name="signupPassword"
            value={form.signupPassword}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <span
            className="absolute right-4 top-3 text-gray-500 hover:text-blue-500 transition-colors cursor-pointer"
            onClick={() => toggleVisibility('signup')}
          >
            {visibility.signup ? '🙈' : '👁️'}
          </span>
        </div>
        <button
          onClick={() => handleAuth(true)}
          className="w-full mt-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition"
          disabled={loading}
        >
          Sign Up
        </button>

        {/* Login Form */}
        <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Login</h2>
        <input
          type="email"
          name="loginEmail"
          value={form.loginEmail}
          onChange={handleChange}
          placeholder="Email"
          className="w-full px-4 py-3 mt-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <div className="relative mt-2">
          <input
            type={visibility.login ? 'text' : 'password'}
            name="loginPassword"
            value={form.loginPassword}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <span
            className="absolute right-4 top-3 text-gray-500 hover:text-blue-500 transition-colors cursor-pointer"
            onClick={() => toggleVisibility('login')}
          >
            {visibility.login ? '🙈' : '👁️'}
          </span>
        </div>
        <button
          onClick={() => handleAuth(false)}
          className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition"
          disabled={loading}
        >
          Login
        </button>

        {/* Feedback */}
        {message && <p className="text-sm text-red-600 mt-4">{message}</p>}
        {loading && <p className="text-sm text-blue-500 mt-2 animate-pulse">Processing...</p>}
      </div>
    </div>
  );
};

export default Auth;
