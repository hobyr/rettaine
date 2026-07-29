"use client";

import { useMemo } from "react";
import { accounts, produits } from "@/lib/data";

const TOTAL_ACCOUNTS = accounts.length;

const rfmSegments = [
  { key: "champion" as const, label: "Champion", color: "#1d4ed8", bg: "#eff6ff" },
  { key: "loyal" as const, label: "Loyal", color: "#15803d", bg: "#f0fdf4" },
  { key: "risque" as const, label: "À risque", color: "#ea580c", bg: "#fff7ed" },
  { key: "perdu" as const, label: "Perdu", color: "#dc2626", bg: "#fef2f2" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 28, marginBottom: 14, paddingLeft: 28 }}>
      {children}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 12, padding: 18, ...style }}>
      {children}
    </div>
  );
}

export default function AnalysePage() {
  const top5Ca = useMemo(() => [...accounts].sort((a, b) => b.ca - a.ca).slice(0, 5), []);
  const top5Evol = useMemo(() => [...accounts].filter((a) => a.caEvolution > 0).sort((a, b) => b.caEvolution - a.caEvolution).slice(0, 5), []);
  const bottom5Evol = useMemo(() => [...accounts].filter((a) => a.caEvolution < 0).sort((a, b) => a.caEvolution - b.caEvolution).slice(0, 5), []);

  const topProduits = useMemo(() => [...produits].sort((a, b) => b.evolution - a.evolution), []);
  const bottomProduits = useMemo(() => [...produits].filter((p) => p.evolution < 0).sort((a, b) => a.evolution - b.evolution), []);
  const topPenetration = useMemo(() => [...produits].sort((a, b) => b.penetration - a.penetration), []);

  const rfmCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of rfmSegments) counts[s.key] = 0;
    for (const a of accounts) counts[a.rfm.category] = (counts[a.rfm.category] || 0) + 1;
    return counts;
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div style={{ padding: "24px 28px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>Analyse</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "3px 0 0" }}>Performance portefeuille · 1 janv. – 31 mai 2024</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", background: "white", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5, color: "#374151", cursor: "pointer", fontFamily: "Figtree, sans-serif", fontWeight: 500 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M2 7H14" stroke="currentColor" strokeWidth="1.5" /><path d="M5 1V4M11 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              1 janv. – 31 mai 2024
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>AD</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 28px", flexShrink: 0 }}>
        <SectionTitle>👥 CLIENTS</SectionTitle>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Card>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>Matrice RFM — {TOTAL_ACCOUNTS} comptes segmentés</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rfmSegments.map((seg) => {
                const count = rfmCounts[seg.key] || 0;
                const pct = Math.round((count / TOTAL_ACCOUNTS) * 100);
                return (
                  <div key={seg.key}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>{seg.label}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)" }}>{count} · {pct}%</span>
                    </div>
                    <div style={{ width: "100%", height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: 8, background: seg.color, borderRadius: 4, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, fontSize: 12, color: "var(--blue)", fontWeight: 600, cursor: "pointer" }}>
              Voir plus →
            </div>
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>🏆 Top 5 comptes — CA</div>
                <span style={{ fontSize: 11.5, color: "var(--blue)", fontWeight: 600, cursor: "pointer" }}>Voir plus →</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {top5Ca.map((a, i) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)", width: 16, fontWeight: 600 }}>{i + 1}</span>
                    <span style={{ fontSize: 16, width: 26, textAlign: "center", flexShrink: 0 }}>{a.icon}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{a.company}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>€{a.ca.toLocaleString()}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: a.caEvolution >= 0 ? "var(--green)" : "var(--red)" }}>
                      {a.caEvolution >= 0 ? "+" : ""}{a.caEvolution}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>🚀 Ont dépassé N-1 — top 5</div>
              <span style={{ fontSize: 11.5, color: "var(--blue)", fontWeight: 600, cursor: "pointer" }}>Voir plus →</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {top5Evol.length === 0 ? (
                <div style={{ fontSize: 12.5, color: "var(--muted)", padding: "12px 0", textAlign: "center" }}>Aucun compte en progression</div>
              ) : (
                top5Evol.map((a, i) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)", width: 16, fontWeight: 600 }}>{i + 1}</span>
                    <span style={{ fontSize: 16, width: 26, textAlign: "center", flexShrink: 0 }}>{a.icon}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{a.company}</span>
                    <div style={{ width: 60, height: 4, background: "#f1f5f9", borderRadius: 2 }}>
                      <div style={{ width: `${Math.min(a.caEvolution * 2, 100)}%`, height: 4, background: "var(--green)", borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", minWidth: 48, textAlign: "right" }}>+{a.caEvolution}%</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>🔻 En retard sur N-1 — top 5</div>
              <span style={{ fontSize: 11.5, color: "var(--blue)", fontWeight: 600, cursor: "pointer" }}>Voir plus →</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {bottom5Evol.length === 0 ? (
                <div style={{ fontSize: 12.5, color: "var(--muted)", padding: "12px 0", textAlign: "center" }}>Aucun compte en retard</div>
              ) : (
                bottom5Evol.map((a, i) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)", width: 16, fontWeight: 600 }}>{i + 1}</span>
                    <span style={{ fontSize: 16, width: 26, textAlign: "center", flexShrink: 0 }}>{a.icon}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{a.company}</span>
                    <div style={{ width: 60, height: 4, background: "#f1f5f9", borderRadius: 2 }}>
                      <div style={{ width: `${Math.min(Math.abs(a.caEvolution) * 2, 100)}%`, height: 4, background: "var(--red)", borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--red)", minWidth: 48, textAlign: "right" }}>{a.caEvolution}%</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <div style={{ padding: "0 28px 24px", flexShrink: 0 }}>
        <SectionTitle>📦 PRODUITS</SectionTitle>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Card>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>🔥 Fonctionnent fort vs N-1</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topProduits.slice(0, 5).map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)", width: 16, fontWeight: 600 }}>{i + 1}</span>
                  <span style={{ fontSize: 16, width: 26, textAlign: "center", flexShrink: 0 }}>{p.emoji}</span>
                  <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>{p.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: p.evolution >= 0 ? "var(--green)" : "var(--red)" }}>
                    {p.evolution >= 0 ? "+" : ""}{p.evolution}%
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>🔻 Moins bien vs N-1</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {bottomProduits.length === 0 ? (
                <div style={{ fontSize: 12.5, color: "var(--muted)", padding: "12px 0", textAlign: "center" }}>Tous les produits sont en progression</div>
              ) : (
                bottomProduits.slice(0, 5).map((p, i) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)", width: 16, fontWeight: 600 }}>{i + 1}</span>
                    <span style={{ fontSize: 16, width: 26, textAlign: "center", flexShrink: 0 }}>{p.emoji}</span>
                    <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>{p.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--red)" }}>
                      {p.evolution >= 0 ? "+" : ""}{p.evolution}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div style={{ marginTop: 14 }}>
          <Card>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>📊 Taux de pénétration — % des {TOTAL_ACCOUNTS} comptes qui référencent le produit</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topPenetration.map((p) => (
                <div key={p.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16, width: 24, textAlign: "center", flexShrink: 0 }}>{p.emoji}</span>
                    <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>{p.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", minWidth: 32, textAlign: "right" }}>{p.penetration}%</span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${p.penetration}%`, height: 6, background: "var(--active)", borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
