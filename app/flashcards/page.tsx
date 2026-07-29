"use client";

import { useState, useMemo } from "react";
import FlashCard from "@/components/FlashCard";
import { flashCards } from "@/lib/data";

const tabs = [
  { key: "all", label: "Tous" },
  { key: "relancer", label: "Relancer" },
  { key: "risque", label: "Risque de perte" },
  { key: "opportunite", label: "Opportunité" },
  { key: "signal", label: "Signal faible" },
];

const kpiData = [
  { label: "CA potentiel à récupérer", value: "€187K", evol: "+18%", color: "var(--green)" },
  { label: "Clients à relancer", value: "3", evol: "+2", color: "var(--orange)" },
  { label: "En risque", value: "2", evol: "-1", color: "var(--red)" },
  { label: "Opportunités", value: "3", evol: "+1", color: "var(--purple)" },
];

const GRID_PAGE_SIZE = 8;

const badgeLabels: Record<string, string> = {
  relancer: "Relancer",
  risque: "Risque de perte",
  opportunite: "Opportunité",
  signal: "Signal faible",
};

export default function FlashcardsPage() {
  const [tab, setTab] = useState("all");
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");
  const [activeIndex, setActiveIndex] = useState(0);
  const [gridPage, setGridPage] = useState(0);

  const filtered = useMemo(() => {
    if (tab === "all") return flashCards;
    return flashCards.filter((c) => c.alertType === tab);
  }, [tab]);

  const visibleCards = filtered.length > 0 ? filtered : flashCards;
  const current = visibleCards[activeIndex] ?? visibleCards[0];

  const totalGridPages = Math.ceil(filtered.length / GRID_PAGE_SIZE);
  const pagedGrid = filtered.slice(gridPage * GRID_PAGE_SIZE, (gridPage + 1) * GRID_PAGE_SIZE);

  const handlePrev = () => {
    setActiveIndex((i) => (i > 0 ? i - 1 : visibleCards.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((i) => (i < visibleCards.length - 1 ? i + 1 : 0));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div style={{ padding: "24px 28px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>Flashcards</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "3px 0 0" }}>Mis à jour aujourd&apos;hui</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>TM</div>
              <div className="max-md:hidden">
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)" }}>Thomas Martin</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Commercial</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, margin: "16px 28px 0", flexShrink: 0 }}>
        {kpiData.map((kpi) => (
          <div key={kpi.label} style={{ flex: 1, background: "white", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{kpi.value}</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: kpi.color }}>{kpi.evol}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "16px 28px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", background: "white", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          {tabs.map((t) => {
            const count = t.key === "all" ? flashCards.length : flashCards.filter((c) => c.alertType === t.key).length;
            return (
              <button key={t.key} onClick={() => { setTab(t.key); setActiveIndex(0); setGridPage(0); }}
                style={{ padding: "7px 14px", border: "none", borderRight: "1px solid var(--border)", background: tab === t.key ? "#f1f5f9" : "transparent", fontSize: 12.5, color: tab === t.key ? "var(--text)" : "var(--muted)", cursor: "pointer", fontFamily: "Figtree, sans-serif", fontWeight: tab === t.key ? 600 : 500, whiteSpace: "nowrap" }}>
                {t.label} ({count})
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", background: "white", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          <button onClick={() => setViewMode("carousel")} style={{ padding: "7px 10px", border: "none", background: viewMode === "carousel" ? "#f1f5f9" : "transparent", cursor: "pointer", display: "flex", color: viewMode === "carousel" ? "#374151" : "#94a3b8" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="9" y="3" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
          <button onClick={() => setViewMode("grid")} style={{ padding: "7px 10px", border: "none", borderLeft: "1px solid var(--border)", background: viewMode === "grid" ? "#f1f5f9" : "transparent", cursor: "pointer", display: "flex", color: viewMode === "grid" ? "#374151" : "#94a3b8" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="4" height="4" rx="1" fill="currentColor" /><rect x="7" y="1" width="4" height="4" rx="1" fill="currentColor" /><rect x="1" y="7" width="4" height="4" rx="1" fill="currentColor" /><rect x="7" y="7" width="4" height="4" rx="1" fill="currentColor" /><rect x="13" y="1" width="2" height="10" rx="1" fill="currentColor" /><rect x="1" y="13" width="10" height="2" rx="1" fill="currentColor" /></svg>
          </button>
        </div>
      </div>

      <div style={{ margin: "14px 28px 24px", flex: 1, minHeight: 0 }}>
        {viewMode === "carousel" ? (
          <div style={{ position: "relative", minHeight: 400 }}>
            <div style={{ position: "relative", zIndex: 2 }}>
              <FlashCard key={current.id} card={current} />
            </div>
            {visibleCards.length > 1 && (
              <>
                <div style={{ position: "absolute", inset: 0, transform: "translateY(8px) scaleX(0.96)", opacity: 0.55, zIndex: 1, background: "white", border: "1px solid var(--border)", borderRadius: 14 }} />
                <div style={{ position: "absolute", inset: 0, transform: "translateY(16px) scaleX(0.92)", opacity: 0.3, zIndex: 0, background: "white", border: "1px solid var(--border)", borderRadius: 14 }} />
              </>
            )}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 14 }}>
              <button onClick={handlePrev} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid var(--border)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7 3L4 6L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <div style={{ display: "flex", gap: 6 }}>
                {visibleCards.map((_, idx) => (
                  <button key={idx} onClick={() => setActiveIndex(idx)} style={{ width: idx === activeIndex ? 20 : 8, height: 8, borderRadius: 4, border: "none", background: idx === activeIndex ? "var(--active)" : "#e2e8f0", cursor: "pointer", transition: "all 0.2s" }} />
                ))}
              </div>
              <button onClick={handleNext} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid var(--border)", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M5 3L8 6L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            {visibleCards.length > 1 && (
              <div style={{ textAlign: "center", fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}>{activeIndex + 1} / {visibleCards.length}</div>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="max-md:grid-cols-1">
              {pagedGrid.map((card) => (
                <div key={card.id} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 10, fontSize: 10.5, fontWeight: 600,
                      background: card.alertType === "relancer" ? "#fff7ed" : card.alertType === "risque" ? "#fef2f2" : card.alertType === "opportunite" ? "#faf5ff" : "#fffbeb",
                      color: card.alertType === "relancer" ? "#ea580c" : card.alertType === "risque" ? "#dc2626" : card.alertType === "opportunite" ? "#7c3aed" : "#b45309" }}>
                      {badgeLabels[card.alertType]}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: "#f1f5f9", flexShrink: 0 }}>{card.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{card.company}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{card.category}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{card.alertReason}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.4, marginBottom: 10 }}>{card.alertDetail}</div>
                  <div style={{ display: "flex", gap: 5 }}>
                    <div style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid var(--border)", background: "white", fontSize: 11, cursor: "pointer", textAlign: "center" }}>Contacter</div>
                    <div style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid var(--active)", background: "var(--active)", fontSize: 11, cursor: "pointer", textAlign: "center", color: "white", fontWeight: 600 }}>Commande</div>
                  </div>
                </div>
              ))}
            </div>
            {totalGridPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", fontSize: 12.5, color: "var(--muted)" }}>
                <span>{gridPage * GRID_PAGE_SIZE + 1}–{Math.min((gridPage + 1) * GRID_PAGE_SIZE, filtered.length)} sur {filtered.length}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {Array.from({ length: totalGridPages }, (_, i) => (
                    <button key={i} onClick={() => setGridPage(i)} style={{ padding: "4px 10px", borderRadius: 6, border: i === gridPage ? "1px solid var(--active)" : "1px solid var(--border)", background: i === gridPage ? "var(--active)" : "white", fontSize: 12, cursor: "pointer", fontFamily: "Figtree, sans-serif", color: i === gridPage ? "white" : "var(--muted)" }}>{i + 1}</button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
