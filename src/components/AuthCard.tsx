"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

type Mode = "login" | "register";

interface AuthError {
  error?: string;
}

export default function AuthCard() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        ...(isRegister ? { display_name: displayName } : {}),
      }),
    });

    if (response.ok) {
      window.location.href = "/todos";
      return;
    }

    let payload: AuthError = {};
    try {
      payload = (await response.json()) as AuthError;
    } catch {
      // The API normally returns { error }, but keep a deterministic fallback.
    }

    setError(payload.error || "Authentication failed");
    setLoading(false);
  };

  return (
    <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl shadow-black/20">
      <form onSubmit={submit} className="space-y-4">
        {isRegister && (
          <label className="block">
            <span className="block text-sm font-medium text-text-muted mb-1.5">Display name</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full rounded-xl bg-bg border border-border px-4 py-3 text-text placeholder:text-text-dim focus:border-primary"
              placeholder="Jane Doe"
              autoComplete="name"
            />
          </label>
        )}

        <label className="block">
          <span className="block text-sm font-medium text-text-muted mb-1.5">Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl bg-bg border border-border px-4 py-3 text-text placeholder:text-text-dim focus:border-primary"
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-text-muted mb-1.5">Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl bg-bg border border-border px-4 py-3 text-text placeholder:text-text-dim focus:border-primary"
            placeholder="At least 8 characters"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={8}
            required
          />
        </label>

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wider text-text-dim">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <a
        href="/auth/login"
        className="w-full py-3 rounded-xl border border-border text-text font-semibold flex items-center justify-center hover:bg-bg-lighter transition-colors duration-200"
      >
        Continue with Auth0
      </a>

      <p className="mt-6 text-center text-sm text-text-muted">
        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setError("");
            setMode(isRegister ? "login" : "register");
          }}
          className="text-primary hover:text-primary-light font-semibold transition-colors duration-200 cursor-pointer"
        >
          {isRegister ? "Sign in" : "Create one"}
        </button>
      </p>
    </div>
  );
}
