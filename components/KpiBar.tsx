"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type KpiData = {
  ytd_turnover_ex_vat: number;
  active_accounts: number;
  at_risk_turnover_ex_vat: number;
  opportunity_turnover_ex_vat: number;
  accounts_to_contact: number;
};

function formatEur(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export default function KpiBar() {
  const [data, setData] = useState<KpiData | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.rpc("get_home_portfolio_kpis").then(({ data, error }) => {
      if (!error && data?.[0]) setData(data[0] as unknown as KpiData);
    });
  }, []);

  const kpis = data
    ? [
        {
          label: "CA portefeuille YTD",
          value: formatEur(data.ytd_turnover_ex_vat),
          subtitle: `${data.active_accounts} comptes actifs`,
        },
        {
          label: "CA en risque",
          value: formatEur(data.at_risk_turnover_ex_vat),
          subtitle: "comptes en baisse >20%",
        },
        {
          label: "CA en opportunité",
          value: formatEur(data.opportunity_turnover_ex_vat),
          subtitle: "comptes en hausse >20%",
        },
        {
          label: "Clients à contacter",
          value: String(data.accounts_to_contact),
          subtitle: "clients en risque / dormants",
        },
      ]
    : [];

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
      {kpis.length === 0 ? (
        <div style={{ flex: 1, padding: "24px 18px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
          Chargement…
        </div>
      ) : (
        kpis.map((kpi) => (
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
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "var(--text)",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              {kpi.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
              {kpi.subtitle}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
