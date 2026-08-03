"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Comptes",
    href: "/comptes",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="6" cy="4.5" r="2.5" fill="currentColor" />
        <path d="M1 13.5C1 10.7386 3.23858 8.5 6 8.5C8.76142 8.5 11 10.7386 11 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="11.5" cy="4.5" r="2" fill="currentColor" />
        <path d="M15 13.5C15 11.2909 13.2091 9.5 11 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Actions",
    href: "/actions",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 8L7.5 10.5L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Produits",
    href: "/produits",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 5L8 2L14 5V11L8 14L2 11V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 8L14 5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 8L2 5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 8V14" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Analyse",
    href: "/analyse",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="9" width="3" height="5" rx="0.75" fill="currentColor" />
        <rect x="6.5" y="5" width="3" height="9" rx="0.75" fill="currentColor" />
        <rect x="11" y="2" width="3" height="12" rx="0.75" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Marketing",
    href: "/marketing",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 12L4 8L6 11L9 5L12 10L14 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="14" cy="4" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Paramètres",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 1V3M8 13V15M1 8H3M13 8H15M3.05 3.05L4.46 4.46M11.54 11.54L12.95 12.95M12.95 3.05L11.54 4.46M4.46 11.54L3.05 12.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Intégrations",
    href: "#",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 4.5H9.5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 11.5H6.5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <aside
      style={{
        width: 172,
        minHeight: "100vh",
        background: "var(--sidebar)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 10px",
        flexShrink: 0,
      }}
      className="max-md:hidden"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 8px",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 800,
            color: "white",
          }}
        >
          R
        </div>
        <span style={{ color: "white", fontWeight: 700, fontSize: 15, letterSpacing: "-0.03em" }}>
          Rettaine
        </span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.label}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 8,
                color: isActive ? "white" : "#6b7fa3",
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.15s",
                border: "none",
                background: isActive ? "var(--active)" : "transparent",
                textAlign: "left",
                width: "100%",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "var(--sidebar-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div
        onClick={handleSignOut}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 10px",
          color: "#4b5f7c",
          fontSize: 12,
          cursor: "pointer",
          marginTop: "auto",
          border: "none",
          background: "transparent",
          fontFamily: "Figtree, sans-serif",
          textAlign: "left",
          width: "100%",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M6 2H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M11 11L14 8L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span>Déconnexion</span>
      </div>
    </aside>
  );
}
