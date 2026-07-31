"use client";

import { usePathname } from "next/navigation";

const items = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="1.5" y="1.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11.5" y="1.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1.5" y="11.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11.5" y="11.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Comptes",
    href: "/comptes",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="7.5" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1.5 17C1.5 13.6863 4.18629 11 7.5 11C10.8137 11 13.5 13.6863 13.5 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="14" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M18.5 17C18.5 14.5147 16.4853 12.5 14 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    badge: 4,
  },
  {
    label: "Actions",
    href: "/actions",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2.5" y="2.5" width="15" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6.5 10L9.5 13L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Produits",
    href: "/produits",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2.5 6.5L10 3L17.5 6.5V13.5L10 17L2.5 13.5V6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 10L17.5 6.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 10L2.5 6.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 10V17" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Analyse",
    href: "/analyse",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2.5" y="11.5" width="3.5" height="6" rx="1" fill="currentColor" />
        <rect x="8.25" y="6.5" width="3.5" height="11" rx="1" fill="currentColor" />
        <rect x="14" y="3" width="3.5" height="14.5" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Marketing",
    href: "/marketing",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2.5 15L5 10L7.5 13.5L11.5 6.5L15 12.5L17.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="17.5" cy="5" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Menu",
    href: "#menu",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="5" r="1.5" fill="currentColor" />
        <circle cx="10" cy="10" r="1.5" fill="currentColor" />
        <circle cx="10" cy="15" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex md:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "white",
        borderTop: "1px solid var(--border)",
        zIndex: 100,
        padding: "6px 0",
        overflowX: "auto",
        flexWrap: "nowrap",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
      }}
    >
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <a
            key={item.label}
            href={item.href}
            style={{
              flex: "0 0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 12px",
              border: "none",
              background: "transparent",
              color: isActive ? "var(--active)" : "#94a3b8",
              fontSize: 10,
              fontWeight: 500,
              cursor: "pointer",
              position: "relative",
              textDecoration: "none",
            }}
          >
            <div style={{ position: "relative" }}>
              {item.icon}
              {item.badge && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -8,
                    background: "#ef4444",
                    color: "white",
                    fontSize: 8,
                    fontWeight: 700,
                    padding: "1px 4px",
                    borderRadius: 8,
                    minWidth: 14,
                    textAlign: "center",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
