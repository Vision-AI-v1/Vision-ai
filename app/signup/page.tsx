"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.user && !data.session) {
      setMessage(
        "Account created. Check your email to verify your account."
      );
      return;
    }

    window.location.href = "/dashboard";
  }

  async function handleGoogleSignup() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setLoading(false);
      setMessage(error.message);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-[420px]">

        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-semibold">
            V
          </div>
        </div>

        <h1 className="text-center text-3xl font-semibold mt-7">
          Create your account
        </h1>

        <p className="text-center text-white/50 mt-2">
          Start using Vision AI
        </p>

        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
          className="mt-8 w-full h-12 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition flex items-center justify-center gap-3"
        >
          <span className="font-medium">
            Continue with Google
          </span>
        </button>

        <div className="flex items-center gap-4 my-7">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-xs text-white/35">
            OR
          </span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <form onSubmit={handleSignup}>

          <label className="text-sm text-white/70">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            autoComplete="email"
            className="mt-2 w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 outline-none focus:border-white/30 transition"
          />

          <label className="block text-sm text-white/70 mt-5">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="new-password"
            className="mt-2 w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 outline-none focus:border-white/30 transition"
          />

          {message && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full h-12 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

        </form>

        <p className="text-center text-sm text-white/50 mt-7">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-white hover:underline"
          >
            Log in
          </Link>
        </p>

        <p className="text-center text-xs text-white/30 mt-8 leading-5">
          By continuing, you agree to Vision AI's terms and
          acknowledge our privacy policy.
        </p>

      </div>
    </main>
  );
}