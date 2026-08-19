"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Login failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-cream px-6 py-20">
      {/* soft decorative backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 15%, rgba(244,121,32,0.10), transparent 40%), radial-gradient(circle at 80% 85%, rgba(26,17,9,0.06), transparent 45%)",
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-heading text-sm font-black uppercase tracking-[0.18em] text-[#f47920]">
            Azésa · Admin
          </p>
          <h2 className="mt-2 font-heading text-4xl font-black tracking-[-0.02em] text-brand-dark">
            Sign in
          </h2>
          <p className="mt-2 text-sm font-semibold text-brand-dark/55">
            Manage orders &amp; products — authorized staff only.
          </p>
        </div>

        <div className="w-full rounded-3xl border-2 border-brand-dark bg-white/90 p-8 shadow-[6px_6px_0_0_#1c1109] backdrop-blur">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="mb-1 block font-heading text-[11px] font-black uppercase tracking-wide text-brand-dark/60">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@azesa.in"
                autoComplete="username"
                required
                className="input"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1 block font-heading text-[11px] font-black uppercase tracking-wide text-brand-dark/60">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="input"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full justify-center">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-5 text-center text-[11px] font-semibold text-brand-dark/45">
            Local dev default — admin@azesa.in. Set ADMIN_PASSWORD_HASH /
            ADMIN_PASSWORD to override.
          </p>
        </div>
      </div>
    </div>
  );
}
