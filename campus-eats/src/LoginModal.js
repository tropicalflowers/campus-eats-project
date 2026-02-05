import React, { useState } from 'react';
import { useAppContext } from './app.jsx';

const LoginModal = () => {
  const { state, dispatch, showMessage, authFunctions } = useAppContext();
  const { isLoginModalOpen } = state;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await authFunctions.signUp(email, password);
      } else {
        await authFunctions.signIn(email, password);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    dispatch({ type: 'SET_LOGIN_MODAL_OPEN', payload: false });
    showMessage('Continuing as guest', 'info');
  };

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700 shadow-2xl">
        <h2 className="text-3xl font-bold mb-2 text-white">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-slate-400 mb-6">
          {isSignUp ? 'Sign up to start ordering' : 'Sign in to your account'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <button
            onClick={handleSkip}
            className="w-full text-slate-400 hover:text-white py-2 text-sm font-medium transition"
          >
            Continue as Guest →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
