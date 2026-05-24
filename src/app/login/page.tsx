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
    <main className="min-h-screen bg-[#070707] text-slate-100">
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,_rgba(218,41,28,0.12),_transparent_35%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          <section className="hidden rounded-2xl bg-gradient-to-br from-rose-800/40 to-rose-700/30 p-8 text-white backdrop-blur-md md:block">
            <div className="flex h-full flex-col justify-center gap-6">
              <h2 className="text-sm uppercase tracking-widest text-rose-200">Welcome back</h2>
              <h1 className="text-3xl font-extrabold">Sanga Admin</h1>
              <p className="text-sm text-rose-100/80">Manage menu, orders and gallery from the admin dashboard. Secure and fast.</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/10" />
                <div>
                  <p className="text-sm font-semibold">Sanga</p>
                  <p className="text-xs text-rose-100/60">Restaurant Dashboard</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-white/6 bg-slate-900/75 p-8 shadow-xl backdrop-blur-lg">
            <div className="mb-6 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-rose-300/80">Administrator</p>
              <h1 className="mt-3 text-2xl font-bold text-white">Sign in</h1>
              <p className="mt-2 text-sm text-slate-300/80">Enter your admin credentials to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <label className="block text-sm text-slate-300">
                Email
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                  className="mt-2 w-full rounded-xl border border-white/8 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
                />
              </label>

              <label className="block text-sm text-slate-300">
                Password
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  required
                  className="mt-2 w-full rounded-xl border border-white/8 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
                />
              </label>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" className="h-4 w-4 rounded border-white/10 bg-slate-800" />
                  Remember me
                </label>
                <a href="/api/auth/forgot-password" className="text-sm font-medium text-rose-300 hover:underline">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              {message ? <p className="text-sm text-rose-300">{message}</p> : null}
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
