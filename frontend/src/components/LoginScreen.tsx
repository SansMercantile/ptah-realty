import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { login } from '../services/api';
import type { AuthUser } from '../services/api';

interface LoginScreenProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const user = await login(email, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
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
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-wide">Ptah-Realty</h1>
        </div>
        <p className="text-xs text-slate-400 text-center mb-4">Sign in to your workspace</p>

        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 text-xs rounded px-3 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
          <input
            type="email"
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
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-hidden focus:border-cyan-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-[#006980] hover:bg-cyan-700 text-white font-semibold text-sm rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
        </button>
      </form>
    </div>
  );
};
