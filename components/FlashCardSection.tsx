"use client";

import { useState } from "react";
import FlashCard from "./FlashCard";
import { flashCards } from "@/lib/data";

const tabs = [
  { key: "all", label: "Tous", count: 0 },
  { key: "relancer", label: "Relancer", count: 2 },
  { key: "risque", label: "Risque de perte", count: 1 },
  { key: "opportunite", label: "Opportunité", count: 2 },
  { key: "signal", label: "Signal faible", count: 1 },
];

export default function FlashCardSection() {
  const [activeTab, setActiveTab] = useState("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");

  const filtered =
    activeTab === "all"
      ? flashCards
      : flashCards.filter((c) => c.alertType === activeTab);

  const visibleCards = filtered.length > 0 ? filtered : flashCards;
  const current = visibleCards[activeIndex] ?? visibleCards[0];

  const handlePrev = () => {
    setActiveIndex((i) => (i > 0 ? i - 1 : visibleCards.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((i) => (i < visibleCards.length - 1 ? i + 1 : 0));
  };

  return (
    <div style={{ margin: "24px 28px 0", flex: 1, minHeight: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <h2
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            À traiter
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "2px 0 0" }}>
            {visibleCards.length} client{visibleCards.length > 1 ? "s" : ""} nécessitent une action
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 12px",
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              color: "#374151",
              cursor: "pointer",
              fontFamily: "Figtree, sans-serif",
              fontWeight: 500,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Trier
          </button>
          <div
            style={{
              display: "flex",
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setViewMode("carousel")}
              style={{
                padding: "7px 10px",
                border: "none",
                background: viewMode === "carousel" ? "#f1f5f9" : "transparent",
                cursor: "pointer",
                display: "flex",
                color: viewMode === "carousel" ? "#374151" : "#94a3b8",
                transition: "all 0.15s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="3" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="9" y="3" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                padding: "7px 10px",
                border: "none",
                borderLeft: "1px solid var(--border)",
                background: viewMode === "grid" ? "#f1f5f9" : "transparent",
                cursor: "pointer",
                display: "flex",
                color: viewMode === "grid" ? "#374151" : "#94a3b8",
                transition: "all 0.15s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="4" height="4" rx="1" fill="currentColor" />
                <rect x="7" y="1" width="4" height="4" rx="1" fill="currentColor" />
                <rect x="1" y="7" width="4" height="4" rx="1" fill="currentColor" />
                <rect x="7" y="7" width="4" height="4" rx="1" fill="currentColor" />
                <rect x="13" y="1" width="2" height="10" rx="1" fill="currentColor" />
                <rect x="1" y="13" width="10" height="2" rx="1" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          background: "white",
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "hidden",
          marginBottom: 16,
          width: "fit-content",
        }}
      >
        {tabs.map((tab) => {
          const count =
            tab.key === "all"
              ? flashCards.length
              : flashCards.filter((c) => c.alertType === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setActiveIndex(0);
              }}
              style={{
                padding: "6px 12px",
                border: "none",
                borderRight: "1px solid var(--border)",
                background: activeTab === tab.key ? "#f1f5f9" : "transparent",
                fontSize: 12.5,
                color: activeTab === tab.key ? "var(--text)" : "var(--muted)",
                cursor: "pointer",
                fontFamily: "Figtree, sans-serif",
                fontWeight: activeTab === tab.key ? 600 : 500,
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {viewMode === "carousel" ? (
        <div style={{ position: "relative", minHeight: 400 }}>
          <div style={{ position: "relative", zIndex: 2 }}>
            <FlashCard key={current.id} card={current} />
          </div>
          {visibleCards.length > 1 && (
            <>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: "translateY(8px) scaleX(0.96)",
                  opacity: 0.55,
                  zIndex: 1,
                  background: "white",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: "translateY(16px) scaleX(0.92)",
                  opacity: 0.3,
                  zIndex: 0,
                  background: "white",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                }}
              />
            </>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
              marginTop: 14,
            }}
          >
            <button
              onClick={handlePrev}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--muted)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M7 3L4 6L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div style={{ display: "flex", gap: 6 }}>
              {visibleCards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  style={{
                    width: idx === activeIndex ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    border: "none",
                    background: idx === activeIndex ? "var(--active)" : "#e2e8f0",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--muted)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M5 3L8 6L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {visibleCards.length > 1 && (
            <div
              style={{
                textAlign: "center",
                fontSize: 12.5,
                color: "var(--muted)",
                marginTop: 8,
                paddingBottom: 24,
              }}
            >
              {activeIndex + 1} / {visibleCards.length}
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            paddingBottom: 24,
          }}
          className="max-md:grid-cols-1"
        >
          {visibleCards.map((card) => (
            <div
              key={card.id}
              style={{
                background: "white",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 14,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    padding: "2px 8px",
                    borderRadius: 10,
                    fontSize: 10.5,
                    fontWeight: 600,
                    background:
                      card.alertType === "relancer"
                        ? "#fff7ed"
                        : card.alertType === "risque"
                          ? "#fef2f2"
                          : card.alertType === "opportunite"
                            ? "#faf5ff"
                            : "#fffbeb",
                    color:
                      card.alertType === "relancer"
                        ? "#ea580c"
                        : card.alertType === "risque"
                          ? "#dc2626"
                          : card.alertType === "opportunite"
                            ? "#7c3aed"
                            : "#b45309",
                  }}
                >
                  {badgeLabels[card.alertType]}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 9,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 7,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    background: "#f1f5f9",
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>
                    {card.company}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{card.category}</div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: 4,
                }}
              >
                {card.alertReason}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  lineHeight: 1.4,
                  marginBottom: 10,
                }}
              >
                {card.alertDetail}
              </div>

              <div style={{ display: "flex", gap: 5 }}>
                <div style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid var(--border)", background: "white", fontSize: 11, cursor: "pointer", textAlign: "center" }}>
                  Contacter
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    borderRadius: 6,
                    border: "1px solid var(--active)",
                    background: "var(--active)",
                    fontSize: 11,
                    cursor: "pointer",
                    textAlign: "center",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  Commande
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const badgeLabels: Record<string, string> = {
  relancer: "Relancer",
  risque: "Risque de perte",
  opportunite: "Opportunité",
  signal: "Signal faible",
};
