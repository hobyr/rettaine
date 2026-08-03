"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MemberInfo = {
  name: string;
  role: string;
};

const roleLabels: Record<string, string> = {
  MANAGER: "Manager",
  BUSINESS_DEVELOPER_REPRESENTATIVE: "Commercial",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function Topbar() {
  const supabase = createClient();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [fallbackEmail, setFallbackEmail] = useState("");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(async ({ data }) => {
      const user = data?.user;
      if (!user) return;

      if (mounted) setFallbackEmail(user.email ?? "");

      const { data: memberRow } = await supabase
        .from("company_members")
        .select("name, role")
        .eq("user_id", user.id)
        .single();

      if (mounted && memberRow) {
        setMember({ name: memberRow.name ?? user.email ?? "", role: memberRow.role ?? "" });
      }
    });

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const displayName = member?.name || fallbackEmail || "Utilisateur";
  const roleLabel = (member && roleLabels[member.role]) || "Membre";
  const avatarText = member?.name ? initials(member.name) : fallbackEmail.slice(0, 2).toUpperCase();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "24px 28px 0",
        gap: 16,
        flexShrink: 0,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "var(--text)",
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          Bonjour {displayName} 👋
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "var(--muted)",
            margin: "3px 0 0",
          }}
        >
          Voici ce qui mérite votre attention aujourd&apos;hui.
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--muted)",
              marginBottom: 4,
            }}
          >
            Période
          </div>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 12px",
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12.5,
              color: "#374151",
              cursor: "pointer",
              fontFamily: "Figtree, sans-serif",
              fontWeight: 500,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 7H14" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 1V4M11 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            1 janv. – 31 mai 2024 (YTD)
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div style={{ position: "relative", display: "flex", alignItems: "center", cursor: "pointer" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 2.5C7.5 2.5 6 5 6 7.5C6 10 5 11 4 12L3 13H17L16 12C15 11 14 10 14 7.5C14 5 12.5 2.5 10 2.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 15C8 16.1046 8.89543 17 10 17C11.1046 17 12 16.1046 12 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "#ef4444",
              color: "white",
              fontSize: 9,
              fontWeight: 700,
              width: 14,
              height: 14,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            3
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
          >
            {avatarText || "U"}
          </div>
          <div className="max-md:hidden">
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)" }}>{displayName}</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>{roleLabel}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
