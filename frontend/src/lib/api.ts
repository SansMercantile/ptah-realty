/**
 * PTAH Realty -- auth-aware fetch wrapper + session storage.
 *
 * apiFetch() attaches the stored bearer token (if any) to every request
 * and, on a 401 response, clears the stored session and reloads so the
 * user lands back on the login screen -- consistent handling in one
 * place instead of every call site checking for 401 itself.
 */

const STORAGE_KEY = "ptah_auth";

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
}

interface StoredAuth {
  access_token: string;
  user: StoredUser;
}

export function getStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: StoredAuth): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/v1/realty/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, error: data.detail || "Login failed." };
  }
  setStoredAuth({ access_token: data.access_token, user: data.user });
  return { ok: true };
}

export function logout(): void {
  clearStoredAuth();
  window.location.reload();
}

/**
 * Drop-in replacement for the global fetch() for authenticated API calls.
 * Attaches the stored bearer token and handles session expiry uniformly.
 */
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const auth = getStoredAuth();
  const headers = new Headers(init.headers || {});
  if (auth?.access_token) {
    headers.set("Authorization", `Bearer ${auth.access_token}`);
  }
  const res = await fetch(input, { ...init, headers });
  if (res.status === 401) {
    clearStoredAuth();
    window.location.reload();
  }
  return res;
}
