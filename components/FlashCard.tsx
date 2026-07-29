"use client";

export type CardData = {
  id: string;
  company: string;
  icon: string;
  region: string;
  category: string;
  alertType: "relancer" | "risque" | "opportunite" | "signal";
  alertReason: string;
  alertDetail: string;
  metrics: {
    ca: string;
    panierMoyen: string;
    retention: string;
    rfmScore: number;
    rfmLabel: string;
  };
  comment: string;
  commentMeta: string;
  daysSinceContact: number;
};

const badgeStyles: Record<string, React.CSSProperties> = {
  relancer: { background: "#fff7ed", color: "#ea580c", borderColor: "#fed7aa" },
  risque: { background: "#fef2f2", color: "#dc2626", borderColor: "#fecaca" },
  opportunite: { background: "#faf5ff", color: "#7c3aed", borderColor: "#e9d5ff" },
  signal: { background: "#fffbeb", color: "#b45309", borderColor: "#fde68a" },
};

const badgeLabels: Record<string, string> = {
  relancer: "Relancer",
  risque: "Risque de perte",
  opportunite: "Opportunité",
  signal: "Signal faible",
};

export default function FlashCard({ card }: { card: CardData }) {
  const badge = badgeStyles[card.alertType];
  const badgeLabel = badgeLabels[card.alertType];

  return (
    <div
      style={{
        background: "white",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: 24,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              border: "1px solid",
              ...badge,
            }}
          >
            {badgeLabel}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {card.daysSinceContact > 0
              ? `Dernier contact il y a ${card.daysSinceContact}j`
              : "Jamais contacté"}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr 180px",
          gap: 0,
        }}
        className="max-md:grid-cols-1 max-md:gap-3"
      >
        <div style={{ paddingRight: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 20,
              }}
            >
              {card.icon}
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--text)",
                  marginBottom: 2,
                  cursor: "pointer",
                }}
              >
                {card.company}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{card.category}</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11.5,
                  color: "var(--light)",
                  marginTop: 5,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1C4.68629 1 2 3.68629 2 7C2 11 8 15 8 15C8 15 14 11 14 7C14 3.68629 11.3137 1 8 1Z" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="8" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {card.region}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "0 20px",
            borderLeft: "1px solid #f1f5f9",
            borderRight: "1px solid #f1f5f9",
          }}
          className="max-md:border-l-0 max-md:border-r-0 max-md:border-t max-md:border-b max-md:border-solid max-md:border-[#f1f5f9] max-md:py-3 max-md:px-0"
        >
          <div style={{ fontSize: 11, color: "var(--light)", marginBottom: 5 }}>Raison de l&apos;alerte</div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 8,
              lineHeight: 1.4,
            }}
          >
            {card.alertReason}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55 }}>
            {card.alertDetail}
          </div>
        </div>

        <div style={{ paddingLeft: 20 }}>
          <div style={{ fontSize: 11, color: "var(--light)", marginBottom: 2 }}>CA total</div>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 10,
            }}
          >
            {card.metrics.ca}
          </div>
          <div style={{ fontSize: 11, color: "var(--light)", marginBottom: 2 }}>Panier moyen</div>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 10,
            }}
          >
            {card.metrics.panierMoyen}
          </div>
          <div style={{ fontSize: 11, color: "var(--light)", marginBottom: 2 }}>Rétention</div>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 10,
            }}
          >
            {card.metrics.retention}
          </div>
          <div style={{ fontSize: 11, color: "var(--light)", marginBottom: 2 }}>Score RFM</div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: "var(--purple)",
            }}
          >
            {card.metrics.rfmScore}
            <span style={{ fontSize: 11, fontWeight: 400, color: "var(--muted)", marginLeft: 4 }}>
              {card.metrics.rfmLabel}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 16,
          background: "#f8fafc",
          borderRadius: 8,
          padding: "11px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, marginBottom: 2 }}>
            &ldquo;{card.comment}&rdquo;
          </div>
          <div style={{ fontSize: 11, color: "var(--light)" }}>{card.commentMeta}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "9px 0",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "white",
            fontSize: 13,
            color: "#374151",
            cursor: "pointer",
            fontFamily: "Figtree, sans-serif",
            fontWeight: 500,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 4L8 7L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 8L8 11L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L8 15L14 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Contacter
        </button>
        <button
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "9px 0",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "white",
            fontSize: 13,
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
          Planifier
        </button>
        <button
          style={{
            flex: 1.6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "9px 0",
            borderRadius: 8,
            border: "1px solid var(--active)",
            background: "var(--active)",
            fontSize: 13,
            color: "white",
            cursor: "pointer",
            fontFamily: "Figtree, sans-serif",
            fontWeight: 700,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M14 6H2V14H14V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M5 6V4C5 2.34315 6.34315 1 8 1C9.65685 1 11 2.34315 11 4V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Passer commande
        </button>
      </div>
    </div>
  );
}
