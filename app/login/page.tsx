"use client";

export const dynamic = "force-dynamic";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { supabase } from "@/lib/supabase-client";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<
    "google" | "github" | null
  >(null);

  const [error, setError] = useState<string | null>(null);

  const busy = loading || socialLoading !== null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) {
      return;
    }

    setError(null);

    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setLoading(true);

    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    setLoading(false);

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "That email and password don't match."
          : signInError.message
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleOAuth(provider: "google" | "github") {
    if (busy) {
      return;
    }

    setError(null);
    setSocialLoading(provider);

    const { error: oauthError } =
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

    if (oauthError) {
      setError(oauthError.message);
      setSocialLoading(null);
    }
  }

  const year = new Date().getFullYear();

  return (
    <div className="vision-login-page">
      {/* BACKGROUND */}
      <div className="vision-login-background">
        <div className="vision-login-orb vision-login-orb-one" />
        <div className="vision-login-orb vision-login-orb-two" />
        <div className="vision-login-orb vision-login-orb-three" />
        <div className="vision-login-grid" />
      </div>

      {/* HEADER */}
      <header className="vision-login-header">
        <Link href="/" className="vision-login-brand">
          <div className="vision-login-brand-icon">
            <div className="vision-logo-mark">V</div>
          </div>

          <span className="vision-login-brand-name">
            Vision AI
          </span>
        </Link>

        <Link href="/" className="vision-login-back">
          Back to home
        </Link>
      </header>

      {/* MAIN */}
      <main className="vision-login-content">
        <div className="vision-login-card">
          <div className="vision-login-card-glow" />

          {/* LOGO */}
          <div className="vision-login-logo-wrap">
            <div className="vision-login-logo-glow" />

            <div className="vision-login-logo">
              <span className="vision-logo-mark">V</span>
            </div>
          </div>

          {/* HEADING */}
          <div className="vision-login-heading">
            <div className="vision-login-eyebrow">
              <span className="vision-login-status-dot" />
              WELCOME BACK
            </div>

            <h1>
              Sign in to <span>Vision AI</span>
            </h1>

            <p>
              Enter your details to get back to your workspace.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div
              className="vision-login-error"
              role="alert"
            >
              <span className="vision-login-error-dot" />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          <form
            className="vision-login-form"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* EMAIL */}
            <div className="vision-login-field">
              <label htmlFor="email">
                Email address
              </label>

              <div className="vision-login-input-wrap">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  disabled={busy}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="vision-login-field">
              <div className="vision-login-label-row">
                <label htmlFor="password">
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="vision-login-forgot"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="vision-login-input-wrap">
                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  disabled={busy}
                />

                <button
                  type="button"
                  className="vision-login-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="vision-login-submit"
              disabled={busy}
            >
              {loading ? (
                <Loader2
                  size={18}
                  className="vision-login-spinner"
                />
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="vision-login-divider">
            <span />
            <small>OR CONTINUE WITH</small>
            <span />
          </div>

          {/* SOCIAL LOGIN */}
          <div className="vision-social-buttons">
            <button
              type="button"
              className="vision-social-button"
              onClick={() =>
                handleOAuth("google")
              }
              disabled={busy}
            >
              {socialLoading === "google" ? (
                <Loader2
                  size={15}
                  className="vision-login-spinner"
                />
              ) : (
                <span className="vision-social-glyph">
                  G
                </span>
              )}

              <span>Google</span>
            </button>

            <button
              type="button"
              className="vision-social-button"
              onClick={() =>
                handleOAuth("github")
              }
              disabled={busy}
            >
              {socialLoading === "github" ? (
                <Loader2
                  size={15}
                  className="vision-login-spinner"
                />
              ) : (
                <span className="vision-social-glyph">
                  GH
                </span>
              )}

              <span>GitHub</span>
            </button>
          </div>

          {/* SIGNUP */}
          <div className="vision-login-bottom">
            <span>Don't have an account?</span>

            <Link href="/signup">
              Create one
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* SECURITY */}
          <div className="vision-login-security">
            <span className="vision-security-dot" />
            Secured with end-to-end encryption
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="vision-login-footer">
        <div>
          © {year} Vision AI. All rights reserved.
        </div>

        <div>
          <Link href="/privacy">
            Privacy
          </Link>

          <span className="vision-footer-separator">
            ·
          </span>

          <Link href="/terms">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}