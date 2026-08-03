"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type AccountOverview = {
  account_number: string;
  account_name: string;
  account_type: string;
  region: string;
  ytd_turnover_ex_vat: number;
  turnover_evolution_percent: string | null;
  rfm_segment: string;
  days_since_last_order: number | null;
};

const filterOptions = [
  { key: "all", label: "Tous" },
  { key: "VIP", label: "VIP" },
  { key: "Loyal", label: "Fidèle" },
  { key: "Regular", label: "Régulier" },
  { key: "At Risk", label: "À risque" },
  { key: "Dormant", label: "Dormant" },
  { key: "New / Potential", label: "Nouveau" },
];

const PAGE_SIZE = 8;

type SortKey = "company" | "statut" | "ca" | "days";
type SortDir = "asc" | "desc";

function SortArrow({
  col,
  sortKey,
  sortDir,
}: {
  col: SortKey;
  sortKey: SortKey | null;
  sortDir: SortDir;
}) {
  if (sortKey !== col) return null;
  return (
    <span style={{ marginLeft: 3, fontSize: 10 }}>
      {sortDir === "asc" ? "▲" : "▼"}
    </span>
  );
}

function formatEur(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatEvolution(pct: string | null): string {
  if (pct === null) return "—";
  const n = parseFloat(pct);
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

function formatDays(days: number | null): string {
  if (days === null) return "—";
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  return `Il y a ${days} jours`;
}

const accountTypeStyles: Record<string, { background: string; color: string; borderColor: string }> = {
  Distributeur: { background: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" },
  Retail: { background: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" },
  Grossiste: { background: "#f8fafc", color: "#64748b", borderColor: "#e2e8f0" },
  Revendeur: { background: "#f8fafc", color: "#64748b", borderColor: "#e2e8f0" },
};

const rfmSegmentStyles: Record<string, { background: string; color: string }> = {
  VIP: { background: "#eff6ff", color: "#1d4ed8" },
  Loyal: { background: "#f0fdf4", color: "#15803d" },
  Regular: { background: "#f0fdf9", color: "#0f766e" },
  "At Risk": { background: "#fff7ed", color: "#ea580c" },
  Dormant: { background: "#fef2f2", color: "#dc2626" },
  "New / Potential": { background: "#faf5ff", color: "#7c3aed" },
};

export default function ComptesPage() {
  const [accounts, setAccounts] = useState<AccountOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.rpc("get_accounts_overview").then(({ data, error }) => {
      if (!error && data) setAccounts(data as AccountOverview[]);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = accounts;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.account_name.toLowerCase().includes(q) ||
          c.account_number.toLowerCase().includes(q)
      );
    }

    if (filter !== "all")
      result = result.filter((c) => c.rfm_segment === filter);

    if (sortKey) {
      result = [...result].sort((a, b) => {
        let cmp = 0;
        if (sortKey === "company") cmp = a.account_name.localeCompare(b.account_name);
        else if (sortKey === "statut") cmp = a.account_type.localeCompare(b.account_type);
        else if (sortKey === "ca") cmp = a.ytd_turnover_ex_vat - b.ytd_turnover_ex_vat;
        else if (sortKey === "days")
          cmp = (a.days_since_last_order ?? Infinity) - (b.days_since_last_order ?? Infinity);
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [accounts, search, filter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const detailRoute = (id: string) => `/comptes/${id}`;

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
        }}
      >
        <span style={{ color: "var(--muted)", fontSize: 13 }}>
          Chargement des comptes…
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div className="page-header" style={{ padding: "24px 28px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>
              Comptes
            </h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "3px 0 0" }}>
              Gérez vos comptes clients
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/import"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                background: "var(--white)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12.5,
                color: "var(--text)",
                cursor: "pointer",
                fontFamily: "Figtree, sans-serif",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M2 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Importer des commandes
            </Link>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                background: "var(--active)",
                border: "1px solid var(--active)",
                borderRadius: 8,
                fontSize: 12.5,
                color: "white",
                cursor: "pointer",
                fontFamily: "Figtree, sans-serif",
                fontWeight: 600,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Créer un compte
            </button>
          </div>
        </div>
      </div>

      <div
        className="list-toolbar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          margin: "16px 28px 0",
          flexShrink: 0,
        }}
      >
        <div className="search-wrap" style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <svg
            className="search-icon"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--light)" }}
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Rechercher un compte..."
            style={{
              width: "100%",
              padding: "8px 12px 8px 34px",
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 13,
              fontFamily: "Figtree, sans-serif",
              color: "var(--text)",
              outline: "none",
            }}
          />
        </div>

        <div className="filter-row" style={{ display: "flex", gap: 6 }}>
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { setFilter(opt.key); setPage(0); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 12px",
                background: filter === opt.key ? "#eff6ff" : "white",
                border: filter === opt.key ? "1px solid #bfdbfe" : "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                color: filter === opt.key ? "var(--active)" : "#374151",
                cursor: "pointer",
                fontFamily: "Figtree, sans-serif",
                fontWeight: filter === opt.key ? 600 : 500,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="comptes-table-wrap"
        style={{
          margin: "14px 28px 24px",
          background: "white",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflowX: "auto",
          flex: 1,
        }}
      >
        <table
          className="comptes-table"
          style={{ width: "100%", minWidth: 780, borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--border)" }}>
              <Th onClick={() => handleSort("company")} sortable>
                Compte <SortArrow col="company" sortKey={sortKey} sortDir={sortDir} />
              </Th>
              <Th onClick={() => handleSort("statut")} sortable>
                Statut <SortArrow col="statut" sortKey={sortKey} sortDir={sortDir} />
              </Th>
              <Th>RFM</Th>
              <Th onClick={() => handleSort("ca")} sortable>
                CA <SortArrow col="ca" sortKey={sortKey} sortDir={sortDir} />
              </Th>
              <Th>Région</Th>
              <Th onClick={() => handleSort("days")} sortable>
                Dernière commande <SortArrow col="days" sortKey={sortKey} sortDir={sortDir} />
              </Th>
            </tr>
          </thead>
          <tbody>
            {paged.map((c) => (
              <tr
                key={c.account_number}
                onClick={() => window.location.href = detailRoute(c.account_number)}
                style={{ cursor: "pointer", transition: "background 0.12s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        background: "#f1f5f9",
                        color: "#64748b",
                        flexShrink: 0,
                      }}
                    >
                      {c.account_name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{c.account_name}</div>
                      <div style={{ fontSize: 11, color: "var(--light)" }}>{c.account_number}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      border: "1px solid",
                      ...(accountTypeStyles[c.account_type] ?? accountTypeStyles.Grossiste),
                    }}
                  >
                    {c.account_type}
                  </span>
                </td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 9px",
                      borderRadius: 20,
                      fontSize: 11.5,
                      fontWeight: 700,
                      ...(rfmSegmentStyles[c.rfm_segment] ?? rfmSegmentStyles.Regular),
                    }}
                  >
                    {c.rfm_segment}
                  </span>
                </td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>
                    {formatEur(c.ytd_turnover_ex_vat)}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      marginLeft: 4,
                      color:
                        c.turnover_evolution_percent !== null && parseFloat(c.turnover_evolution_percent) >= 0
                          ? "var(--green)"
                          : "var(--red)",
                    }}
                  >
                    {formatEvolution(c.turnover_evolution_percent)}
                  </span>
                </td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                  <span style={{ fontSize: 12.5, color: "var(--text)" }}>
                    {c.region}
                  </span>
                </td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                  <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
                    {formatDays(c.days_since_last_order)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          className="pagination"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderTop: "1px solid var(--border)",
            fontSize: 12.5,
            color: "var(--muted)",
          }}
        >
          <span>
            {filtered.length === 0
              ? "Aucun résultat"
              : `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, filtered.length)} sur ${filtered.length}`}
          </span>
          {totalPages > 1 && (
            <div className="pg-btns" style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: i === page ? "1px solid var(--active)" : "1px solid var(--border)",
                    background: i === page ? "var(--active)" : "white",
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "Figtree, sans-serif",
                    color: i === page ? "white" : "var(--muted)",
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Th({
  children,
  onClick,
  sortable,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  sortable?: boolean;
}) {
  return (
    <th
      onClick={onClick}
      style={{
        fontSize: 11.5,
        color: "var(--muted)",
        fontWeight: 600,
        textAlign: "left",
        padding: "11px 16px",
        whiteSpace: "nowrap",
        cursor: sortable ? "pointer" : "default",
        userSelect: "none",
      }}
    >
      {children}
    </th>
  );
}
