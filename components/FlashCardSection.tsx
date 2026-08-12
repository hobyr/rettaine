"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import EmailModal from "@/components/EmailModal";

type HomeFlashcard = {
  account_number: string;
  account_name: string;
  SKU: string | null;
  signal_type: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  current_units: number | null;
  previous_units: number | null;
  units_evolution_percent: string | null;
  current_turnover_ex_vat: number | null;
  previous_turnover_ex_vat: number | null;
  turnover_evolution_percent: string | null;
  last_order_date: string | null;
};

type SignalGroup = "OPPORTUNITY" | "RISK";

type SignalMeta = {
  label: string;
  group: SignalGroup;
  bg: string;
  color: string;
  icon: string;
  action: string;
};

const signalMeta: Record<string, SignalMeta> = {
  ACCOUNT_GROWTH_CROSS_SELL: {
    label: "Compte en croissance",
    group: "OPPORTUNITY",
    bg: "#faf5ff",
    color: "#7c3aed",
    icon: "▲",
    action:
      "Identifier les nouvelles références à proposer pour développer l'assortiment du client.",
  },
  PRODUCT_ACCELERATION: {
    label: "Accélération",
    group: "OPPORTUNITY",
    bg: "#f0fdf4",
    color: "#15803d",
    icon: "▲",
    action:
      "Contacter le client pour consolider la croissance et sécuriser les volumes.",
  },
  PRODUCT_DECELERATION: {
    label: "Ralentissement",
    group: "OPPORTUNITY",
    bg: "#eff6ff",
    color: "#2563eb",
    icon: "▲",
    action:
      "Analyser les causes du ralentissement et relancer la dynamique de la référence.",
  },
  PRODUCT_DECLINE: {
    label: "Déclin",
    group: "RISK",
    bg: "#fef2f2",
    color: "#dc2626",
    icon: "!",
    action:
      "Contacter le client pour comprendre la baisse et proposer un plan de relance.",
  },
  PRODUCT_EROSION: {
    label: "Érosion",
    group: "RISK",
    bg: "#fef2f2",
    color: "#dc2626",
    icon: "!",
    action:
      "Contacter le client pour identifier les raisons de la baisse et relancer la référence.",
  },
  VOLUME_DOWN_REVENUE_STABLE: {
    label: "Volume en baisse",
    group: "RISK",
    bg: "#fffbeb",
    color: "#d97706",
    icon: "!",
    action:
      "Vérifier les conditions de mise en avant et la disponibilité de la référence.",
  },
};

const tabs = [
  { key: "all", label: "Toutes" },
  { key: "OPPORTUNITY", label: "Opportunités" },
  { key: "RISK", label: "En risque" },
];

function formatEur(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export default function FlashCardSection() {
  const [flashcards, setFlashcards] = useState<HomeFlashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");
  const [emailModalCard, setEmailModalCard] = useState<HomeFlashcard | null>(null);

  const closeEmailModal = useCallback(() => setEmailModalCard(null), []);

  useEffect(() => {
    const supabase = createClient();
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .rpc("get_home_flashcards", { current_end_date: today })
      .then(({ data, error }) => {
        if (!error && data) setFlashcards(data as HomeFlashcard[]);
        setLoading(false);
      });
  }, []);

  const filtered =
    activeTab === "all"
      ? flashcards
      : flashcards.filter((c) => signalMeta[c.signal_type]?.group === activeTab);

  const visibleCards = filtered.length > 0 ? filtered : flashcards;
  const current = visibleCards[activeIndex] ?? visibleCards[0];

  const handlePrev = () => {
    setActiveIndex((i) => (i > 0 ? i - 1 : visibleCards.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((i) => (i < visibleCards.length - 1 ? i + 1 : 0));
  };

  if (loading) {
    return (
      <div
        style={{
          margin: "24px 28px 0",
          padding: 24,
          textAlign: "center",
          color: "var(--muted)",
          fontSize: 13,
        }}
      >
        Chargement des flashcards…
      </div>
    );
  }

  function renderCard(card: HomeFlashcard, detailed: boolean) {
    const meta = signalMeta[card.signal_type] ?? {
      label: "Alerte",
      group: "RISK",
      bg: "#fef2f2",
      color: "#dc2626",
      icon: "!",
      action: "",
    };
    const badge = { bg: meta.bg, color: meta.color };
    const badgeLabel = meta.label;
    const priorityColor =
      card.priority === "HIGH"
        ? "var(--red)"
        : card.priority === "MEDIUM"
          ? "var(--orange)"
          : "var(--muted)";

    return (
      <div
        style={{
          background: "white",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: detailed ? 20 : 14,
          boxShadow: detailed ? "0 4px 16px rgba(0,0,0,0.08)" : undefined,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: detailed ? 14 : 10,
          }}
        >
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 9px",
                borderRadius: 20,
                fontSize: detailed ? 12 : 10.5,
                fontWeight: 600,
                background: badge.bg,
                color: badge.color,
              }}
            >
              {badgeLabel}
            </span>
            <span
              style={{
                display: "inline-flex",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: priorityColor,
              }}
            />
          </div>
          {detailed && card.current_turnover_ex_vat != null && (
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              {formatEur(card.current_turnover_ex_vat)} CA
            </span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 9,
            alignItems: "center",
            marginBottom: detailed ? 12 : 8,
          }}
        >
          <div
            style={{
              width: detailed ? 36 : 28,
              height: detailed ? 36 : 28,
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: detailed ? 13 : 11,
              fontWeight: 700,
              background: meta.bg,
              color: meta.color,
              flexShrink: 0,
            }}
          >
            {meta.icon}
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: detailed ? 14 : 12.5,
                color: "var(--text)",
              }}
            >
              {card.account_name}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              {card.account_number}
            </div>
            {card.SKU && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: meta.color,
                  marginTop: 2,
                }}
              >
                {card.SKU}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            fontSize: detailed ? 13.5 : 12,
            fontWeight: 600,
            color: "var(--text)",
            marginBottom: 4,
          }}
        >
          {card.title}
        </div>

        {detailed && (
          <div
            style={{
              fontSize: 12.5,
              color: "var(--muted)",
              lineHeight: 1.5,
              marginBottom: 12,
            }}
          >
            {card.description}
          </div>
        )}

        {detailed && (
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 8,
              padding: "10px 13px",
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 11, color: "var(--light)", marginBottom: 2 }}>
              Action recommandée
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text)", fontWeight: 500 }}>
              {meta.action}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 6 }}>
          <div
            style={{
              flex: 1,
              padding: detailed ? "8px 0" : "6px 0",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "white",
              fontSize: detailed ? 12 : 10.5,
              cursor: "pointer",
              textAlign: "center",
              color: "var(--text)",
              fontWeight: 500,
            }}
          >
            Contacter
          </div>
          <div
            style={{
              flex: 1,
              padding: detailed ? "8px 0" : "6px 0",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "white",
              fontSize: detailed ? 12 : 10.5,
              cursor: "pointer",
              textAlign: "center",
              color: "var(--text)",
              fontWeight: 500,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setEmailModalCard(card);
            }}
          >
            Preparer l&apos;email
          </div>
          <div
            style={{
              flex: 1,
              padding: detailed ? "8px 0" : "6px 0",
              borderRadius: 6,
              border: "1px solid var(--active)",
              background: "var(--active)",
              fontSize: detailed ? 12 : 10.5,
              cursor: "pointer",
              textAlign: "center",
              color: "white",
              fontWeight: 600,
            }}
          >
            Voir le compte
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ margin: "24px 28px 0", flex: 1, minHeight: 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
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
            {visibleCards.length} sign
            {visibleCards.length > 1 ? "aux" : "l"} à traiter
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
              ? flashcards.length
              : flashcards.filter(
                  (c) => signalMeta[c.signal_type]?.group === tab.key
                ).length;
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
            {current && renderCard(current, true)}
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
                  pointerEvents: "none",
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
                  pointerEvents: "none",
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
            <div key={`${card.account_number}-${card.SKU ?? "account"}`}>
              {renderCard(card, false)}
            </div>
          ))}
        </div>
      )}

      <EmailModal
        open={!!emailModalCard}
        flashcard={emailModalCard}
        onClose={closeEmailModal}
      />
    </div>
  );
}
