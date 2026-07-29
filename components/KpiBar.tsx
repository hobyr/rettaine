"use client";

const kpis = [
  {
    label: "Chiffre d'affaires",
    value: "€284,500",
    evolution: "+12.5",
    vsPrev: "€252,800",
  },
  {
    label: "Panier Moyen",
    value: "€78.40",
    evolution: "+3.2",
    vsPrev: "€75.90",
  },
  {
    label: "Taux de Conversion",
    value: "3.8%",
    evolution: "+0.4",
    vsPrev: "3.4%",
  },
  {
    label: "Nbre de Commandes",
    value: "3,628",
    evolution: "+8.7",
    vsPrev: "3,338",
  },
  {
    label: "Nbre de Clients",
    value: "1,847",
    evolution: "+5.1",
    vsPrev: "1,757",
  },
  {
    label: "Taux de Rétention",
    value: "72.4%",
    evolution: "+2.1",
    vsPrev: "70.3%",
  },
  {
    label: "NPS",
    value: "45",
    evolution: "+3",
    vsPrev: "42",
  },
];

export default function KpiBar() {
  return (
    <div
      className="kpi-bar"
      style={{
        display: "flex",
        margin: "18px 28px 0",
        background: "white",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="kpi-item"
          style={{
            flex: 1,
            padding: "16px 18px",
            borderRight: "1px solid var(--border)",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 11.5,
              color: "var(--muted)",
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 4,
              whiteSpace: "nowrap",
            }}
          >
            {kpi.label}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span
              style={{
                fontSize: 19,
                fontWeight: 800,
                color: "var(--text)",
                letterSpacing: "-0.03em",
              }}
            >
              {kpi.value}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: kpi.evolution.startsWith("+") ? "var(--green)" : "var(--red)",
              }}
            >
              {kpi.evolution}%
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#b0b9c8", marginTop: 4 }}>
            vs {kpi.vsPrev}
          </div>
        </div>
      ))}
    </div>
  );
}
