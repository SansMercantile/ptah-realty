/**
 * PTAH Realty -- login gate. Rendered in place of the main app when no
 * valid session exists (see App.tsx). Styled to match the rest of the
 * app (see RealtyValuation.tsx's card conventions).
 */
import React, { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { login } from "../lib/api";

interface LoginProps {
  onLogin: () => void;
  tenantDisplayName: string;
}

export default function Login({ onLogin, tenantDisplayName }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const result = await login(email, password);
    if (result.ok) {
      onLogin();
    } else {
      setError(result.error || "Login failed.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-6 space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-amber-500" />
          <h2 className="font-display font-semibold text-slate-900 dark:text-white">
            Sign in to {tenantDisplayName}
          </h2>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-600 dark:text-slate-500 uppercase tracking-wider">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-600 dark:text-slate-500 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        {error && (
          <p className="text-[11px] text-red-600 dark:text-red-400 font-mono bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded p-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 dark:disabled:text-slate-600 text-slate-950 font-medium text-sm rounded px-4 py-2 transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
