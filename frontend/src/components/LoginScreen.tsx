import React, { useState } from 'react';
import { Lock, Loader2, UserPlus } from 'lucide-react';
import { login, register } from '../services/api';
import type { AuthUser } from '../services/api';

interface LoginScreenProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isRegister = mode === 'register';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Read the actual current DOM values at submit time, not just React
    // state -- some browser extensions/password managers (and some
    // mobile browser autofill) set an input's visible value without
    // dispatching the input/change event React's onChange listens for,
    // so state can silently stay '' even though the field looks filled.
    // Submitting stale empty state then sends {email:'',password:''},
    // which the backend correctly rejects (422) -- looking like a fake/
    // broken login when the real issue is just what got submitted.
    const formData = new FormData(e.currentTarget);
    const submittedName = (formData.get('name') as string) || name;
    const submittedEmail = (formData.get('email') as string) || email;
    const submittedPassword = (formData.get('password') as string) || password;

    if (!submittedEmail || !submittedPassword) {
      setError('Please enter both your email and password.');
      return;
    }
    if (isRegister && !submittedName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (isRegister && submittedPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const user = isRegister
        ? await register(submittedName.trim(), submittedEmail, submittedPassword)
        : await login(submittedEmail, submittedPassword);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || (isRegister ? 'Could not create the account.' : 'Login failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-slate-900">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-8 w-full max-w-sm space-y-4"
      >
        <div className="flex items-center gap-2 justify-center mb-2">
          <div className="p-2 bg-[#006980] rounded-lg">
            {isRegister ? <UserPlus className="w-5 h-5 text-white" /> : <Lock className="w-5 h-5 text-white" />}
          </div>
          <h1 className="text-lg font-bold text-white tracking-wide">Ptah-Realty</h1>
        </div>
        <p className="text-xs text-slate-400 text-center mb-4">
          {isRegister ? 'Create your workspace — free trial credits included' : 'Sign in to your workspace'}
        </p>

        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 text-xs rounded px-3 py-2">
            {error}
          </div>
        )}

        {isRegister && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full name</label>
            <input
              type="text"
              name="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-cyan-500"
              placeholder="Your name"
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
          <input
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-cyan-500"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
          <input
            type="password"
            name="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-cyan-500"
            placeholder={isRegister ? 'At least 8 characters' : '••••••••'}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-[#006980] hover:bg-cyan-700 text-white font-semibold text-sm rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span>{isLoading ? (isRegister ? 'Creating account...' : 'Signing in...') : isRegister ? 'Create Account' : 'Sign In'}</span>
        </button>

        <p className="text-xs text-slate-400 text-center pt-1">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => { setMode(isRegister ? 'login' : 'register'); setError(null); }}
            className="text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            {isRegister ? 'Sign in' : 'Sign up free'}
          </button>
        </p>
      </form>
    </div>
  );
};
