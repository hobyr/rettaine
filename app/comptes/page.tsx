"use client";

import { useState, useMemo } from "react";
import { accounts, statutStyles, rfmStyles } from "@/lib/data";

const filterOptions = [
  { key: "all", label: "Tous" },
  { key: "premium", label: "Premium" },
  { key: "standard", label: "Standard" },
  { key: "champion", label: "Champions" },
  { key: "risque", label: "À risque" },
];

const PAGE_SIZE = 8;

type SortKey = "company" | "statut" | "ca" | "nps";
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

export default function ComptesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let result = accounts;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.company.toLowerCase().includes(q) ||
          c.displayId.toLowerCase().includes(q)
      );
    }

    if (filter === "premium") result = result.filter((c) => c.statut === "premium");
    else if (filter === "standard") result = result.filter((c) => c.statut === "standard");
    else if (filter === "champion") result = result.filter((c) => c.rfm.category === "champion");
    else if (filter === "risque") result = result.filter((c) => c.rfm.category === "risque");

    if (sortKey) {
      result = [...result].sort((a, b) => {
        let cmp = 0;
        if (sortKey === "company") cmp = a.company.localeCompare(b.company);
        else if (sortKey === "statut") cmp = a.statut.localeCompare(b.statut);
        else if (sortKey === "ca") cmp = a.ca - b.ca;
        else if (sortKey === "nps") cmp = a.nps - b.nps;
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [search, filter, sortKey, sortDir]);

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

  const detailRoute = (id: string) => `/comptes/${id.replace("C-", "").replace(/^0+/, "")}`;

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
              <Th onClick={() => handleSort("nps")} sortable>
                NPS <SortArrow col="nps" sortKey={sortKey} sortDir={sortDir} />
              </Th>
              <Th>Email</Th>
            </tr>
          </thead>
          <tbody>
            {paged.map((c) => (
              <tr
                key={c.id}
                onClick={() => window.location.href = detailRoute(c.id)}
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
                        fontSize: 11,
                        fontWeight: 700,
                        background: "#f1f5f9",
                        flexShrink: 0,
                      }}
                    >
                      {c.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{c.company}</div>
                      <div style={{ fontSize: 11, color: "var(--light)" }}>{c.displayId}</div>
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
                      ...statutStyles[c.statut],
                    }}
                  >
                    {c.statut === "premium" ? "Premium" : "Standard"}
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
                      ...rfmStyles[c.rfm.category],
                    }}
                  >
                    {c.rfm.label} ({c.rfm.score})
                  </span>
                </td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>€{c.ca.toLocaleString()}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      marginLeft: 4,
                      color: c.caEvolution >= 0 ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {c.caEvolution >= 0 ? "+" : ""}{c.caEvolution}%
                  </span>
                </td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color:
                        c.nps >= 70 ? "var(--green)" : c.nps >= 40 ? "var(--orange)" : "var(--red)",
                    }}
                  >
                    {c.nps}
                  </span>
                </td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                  <span style={{ fontSize: 16 }}>
                    {c.email ? "✅" : "❌"}
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
