import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase'; // ✅ corrected import path

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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-center">
      {/* Signup Form */}
      <h2 className="text-xl font-semibold">Sign Up</h2>
      <input
        type="email"
        name="signupEmail"
        value={form.signupEmail}
        onChange={handleChange}
        placeholder="Email"
        className="w-full px-4 py-2 mt-2 border rounded"
      />
      <div className="relative mt-2">
        <input
          type={visibility.signup ? 'text' : 'password'}
          name="signupPassword"
          value={form.signupPassword}
          onChange={handleChange}
          placeholder="Password"
          className="w-full px-4 py-2 border rounded"
        />
        <span
          className="absolute right-3 top-2 cursor-pointer"
          onClick={() => toggleVisibility('signup')}
        >
          {visibility.signup ? '🙈' : '👁️'}
        </span>
      </div>
      <button
        onClick={() => handleAuth(true)}
        className="w-full mt-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        disabled={loading}
      >
        Sign Up
      </button>

      {/* Login Form */}
      <h2 className="text-xl font-semibold mt-6">Login</h2>
      <input
        type="email"
        name="loginEmail"
        value={form.loginEmail}
        onChange={handleChange}
        placeholder="Email"
        className="w-full px-4 py-2 mt-2 border rounded"
      />
      <div className="relative mt-2">
        <input
          type={visibility.login ? 'text' : 'password'}
          name="loginPassword"
          value={form.loginPassword}
          onChange={handleChange}
          placeholder="Password"
          className="w-full px-4 py-2 border rounded"
        />
        <span
          className="absolute right-3 top-2 cursor-pointer"
          onClick={() => toggleVisibility('login')}
        >
          {visibility.login ? '🙈' : '👁️'}
        </span>
      </div>
      <button
        onClick={() => handleAuth(false)}
        className="w-full mt-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={loading}
      >
        Login
      </button>

      {/* Feedback */}
      {message && <p className="text-red-500 mt-4">{message}</p>}
      {loading && <p className="text-green-500 mt-2">Processing...</p>}
    </div>
  );
};

export default Auth;
