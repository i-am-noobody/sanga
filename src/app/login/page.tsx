"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = await res.json();
      if (!res.ok) {
        setMessage(payload.error ?? "Login failed");
      } else {
        setMessage("Login successful. Redirecting...");
        // Redirect to admin after successful login
        router.push("/admin");
      }
    } catch (error) {
      console.error("Login error", error);
      setMessage("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_35%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center gap-8 px-6 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Sanga Admin</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Sign in to admin</h1>
              <p className="mt-2 text-slate-300">Enter your credentials to access the admin dashboard.</p>
            </div>
            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <label className="block text-sm text-slate-300">
                Email
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Password
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  required
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
              {message ? <p className="text-sm text-rose-300">{message}</p> : null}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
