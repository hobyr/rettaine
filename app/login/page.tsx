"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted && data?.user) {
        router.replace("/dashboard");
      }
    });
    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Identifiants incorrects."
          : "Impossible de se connecter. Veuillez réessayer.",
      );
      setLoading(false);
      return;
    }

    const next = searchParams.get("next");
    router.replace(next && next.startsWith("/") ? next : "/dashboard");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: 24,
      }}
    >
      <div
        style={{
          width: 380,
          maxWidth: "100%",
          background: "white",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "32px 28px",
          boxShadow: "0 8px 30px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 800,
              color: "white",
            }}
          >
            R
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
              Rettaine
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Connexion à votre espace</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              htmlFor="email"
              style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}
            >
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "9px 12px",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 13.5,
                color: "var(--text)",
                background: "white",
                outline: "none",
                fontFamily: "Figtree, sans-serif",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "9px 12px",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 13.5,
                color: "var(--text)",
                background: "white",
                outline: "none",
                fontFamily: "Figtree, sans-serif",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                fontSize: 12.5,
                color: "var(--red)",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "8px 12px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: "10px 12px",
              background: "var(--active)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
              fontFamily: "Figtree, sans-serif",
            }}
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
