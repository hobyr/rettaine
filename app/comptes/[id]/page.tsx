"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import TurnoverEvolutionChart from "@/components/TurnoverEvolutionChart";

type AccountDetailKpi = {
  account_number: string;
  account_name: string;
  ytd_turnover_ex_vat: number;
  ytd_turnover_evolution_percent: string | null;
  last_order_date: string | null;
  days_since_last_order: number | null;
  average_days_between_orders: number | null;
  average_days_between_orders_previous_6_months: number | null;
  days_between_orders_evolution: number | null;
  ytd_average_order_value: number;
  previous_ytd_average_order_value: number;
  average_order_value_evolution: number;
  turnover_12_months_ex_vat: number;
  previous_12_months_turnover_ex_vat: number;
  turnover_12_months_evolution_percent: string | null;
};

type AccountRfmPeriod = {
  account_number: string;
  recency_score: number;
  frequency_score: number;
  monetary_score: number;
  rfm_score: string;
  rfm_segment: string;
  frequency: number;
  recency_days: number;
  monetary: number;
};

type AccountRfmPosition = {
  rfm_status: string;
  account_rfm_score: string;
  portfolio_average_rfm_score: string;
  account_recency_score: number;
  portfolio_average_recency_score: string;
  account_frequency_score: number;
  portfolio_average_frequency_score: string;
  account_monetary_score: number;
  portfolio_average_monetary_score: string;
};

type AccountProductPerformance = {
  sku: string;
  ytd_turnover_ex_vat: number;
  previous_ytd_turnover_ex_vat: number;
  turnover_evolution_percent: string | null;
  ytd_quantity: number;
  previous_ytd_quantity: number;
  quantity_evolution_percent: string | null;
};

type DonutSlice = {
  sku: string;
  name: string;
  value: number;
  color: string;
  share: number;
};

const TOP_PRODUCTS_PALETTE = [
  "#2563eb",
  "#7c3aed",
  "#16a34a",
  "#ea580c",
  "#dc2626",
  "#14b8a6",
];

function formatEur(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function formatEvolution(pct: string | null): string {
  if (pct === null) return "—";
  const n = parseFloat(pct);
  const sign = n >= 0 ? "+" : "";
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(n);
  return `${sign}${formatted}%`;
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

const rfmStatusStyles: Record<string, { background: string; color: string }> = {
  Excellent: { background: "#eff6ff", color: "#1d4ed8" },
  Bon: { background: "#f0fdf4", color: "#15803d" },
  Moyen: { background: "#fff7ed", color: "#ea580c" },
  Faible: { background: "#fef2f2", color: "#dc2626" },
  Critique: { background: "#fef2f2", color: "#dc2626" },
};

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DonutSlice }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "white",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "8px 10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        fontSize: 11,
      }}
    >
      <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>
        {d.name}
      </div>
      <div style={{ color: "var(--muted)" }}>
        {formatEur(d.value)} · {d.share} %
      </div>
    </div>
  );
}

export default function CompteDetailPage() {
  const params = useParams<{ id: string }>();
  const accountNumber = params.id;

  const [kpi, setKpi] = useState<AccountDetailKpi | null>(null);
  const [accountInfo, setAccountInfo] = useState<{ type: string; region: string } | null>(null);
  const [rfm, setRfm] = useState<AccountRfmPeriod | null>(null);
  const [rfmPos, setRfmPos] = useState<AccountRfmPosition | null>(null);
  const [products, setProducts] = useState<AccountProductPerformance[] | null>(null);
  const [productNames, setProductNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const startDate = "2026-01-01";
    const endDate = "2026-07-30";

    Promise.all([
      supabase.rpc("get_account_detail_kpis", { p_account_number: accountNumber }),
      supabase.from("accounts").select("type, region").eq("account_number", accountNumber).single(),
      supabase.rpc("get_account_rfm_by_period", { start_date: startDate, end_date: endDate }),
      supabase.rpc("get_account_rfm_position_vs_global_portfolio", { p_account_number: accountNumber }),
      supabase.rpc("get_account_product_performance_by_account", { p_account_number: accountNumber }),
      supabase.from("products").select("SKU, designation"),
    ]).then(([kpiRes, accountRes, rfmPeriodRes, rfmPosRes, prodRes, productRows]) => {
      if (kpiRes.error || accountRes.error) {
        setError(true);
        setLoading(false);
        return;
      }
      if (kpiRes.data?.[0]) setKpi(kpiRes.data[0]);
      if (accountRes.data) setAccountInfo(accountRes.data);
      if (rfmPeriodRes.data) {
        const match = (rfmPeriodRes.data as AccountRfmPeriod[]).find(
          (r) => r.account_number === accountNumber
        );
        if (match) setRfm(match);
      }
      if (rfmPosRes.data?.[0]) setRfmPos(rfmPosRes.data[0]);
      if (prodRes.data) setProducts(prodRes.data);
      if (productRows.data) {
        setProductNames(
          new Map(productRows.data.map((p) => [p.SKU, p.designation]))
        );
      }
      setLoading(false);
    });
  }, [accountNumber]);

  const { slices: donutSlices, total: donutTotal } = useMemo<
    { slices: DonutSlice[]; total: number }
  >(() => {
    const slices =
      products?.map((p, i) => ({
        sku: p.sku,
        name: productNames.get(p.sku) ?? p.sku,
        value: p.ytd_turnover_ex_vat,
        color: TOP_PRODUCTS_PALETTE[i % TOP_PRODUCTS_PALETTE.length],
      })) ?? [];
    const total = slices.reduce((sum, s) => sum + s.value, 0);
    return {
      slices: slices.map((s) => ({
        ...s,
        share: total === 0 ? 0 : Math.round((s.value / total) * 100),
      })),
      total,
    };
  }, [products, productNames]);

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
          Chargement du compte…
        </span>
      </div>
    );
  }

  if (error || !kpi) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
          gap: 10,
        }}
      >
        <span style={{ color: "var(--muted)", fontSize: 13 }}>
          Compte introuvable
        </span>
        <Link
          href="/comptes"
          style={{
            fontSize: 12.5,
            color: "var(--active)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Retour à la liste
        </Link>
      </div>
    );
  }

  const typeStyle = accountTypeStyles[accountInfo?.type ?? ""] ?? accountTypeStyles.Grossiste;
  const rfmStatusStyle = rfmStatusStyles[rfmPos?.rfm_status ?? ""] ?? rfmStatusStyles.Moyen;

  const rfmDimensions = [
    { label: "Récence", score: rfm?.recency_score ?? null, max: 10 },
    { label: "Fréquence", score: rfm?.frequency_score ?? null, max: 10 },
    { label: "Montant", score: rfm?.monetary_score ?? null, max: 10 },
  ];

  const evolutionColor = (pct: string | null) =>
    pct === null
      ? "var(--muted)"
      : parseFloat(pct) >= 0
        ? "var(--green)"
        : "var(--red)";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div
        className="compte-topbar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 28px 0",
          flexShrink: 0,
        }}
      >
        <div
          className="breadcrumb"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            color: "var(--muted)",
          }}
        >
          <Link
            href="/comptes"
            style={{ color: "var(--muted)", cursor: "pointer", textDecoration: "none" }}
          >
            Comptes
          </Link>
          <span>&gt;</span>
          <span style={{ color: "var(--text)" }}>{kpi.account_name}</span>
        </div>
      </div>

      <div className="compte-header" style={{ padding: "14px 28px 0", flexShrink: 0 }}>
        <div
          className="compte-title-row"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 7,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              fontWeight: 700,
              color: "#64748b",
              flexShrink: 0,
            }}
          >
            {kpi.account_name.charAt(0)}
          </div>
          <h1
            className="compte-title"
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            {kpi.account_name}
          </h1>
          <span
            className="tag"
            style={{
              display: "inline-flex",
              padding: "3px 10px",
              borderRadius: 20,
              fontSize: 11.5,
              fontWeight: 600,
              border: "1px solid",
              ...typeStyle,
            }}
          >
            {accountInfo?.type ?? "—"}
          </span>
        </div>

        <div
          className="compte-meta"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 12,
            color: "var(--muted)",
            flexWrap: "wrap",
          }}
        >
          <span
            className="compte-meta-item"
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 4L8 7L14 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 8L8 11L14 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L8 15L14 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {accountNumber}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1C4.68629 1 2 3.68629 2 7C2 11 8 15 8 15C8 15 14 11 14 7C14 3.68629 11.3137 1 8 1Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="8" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {accountInfo?.region ?? "—"}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 4C2 2.89543 2.89543 2 4 2H5.5C5.77614 2 6 2.22386 6 2.5V5.5C6 5.77614 5.77614 6 5.5 6H4C4 10 6 12 10 12V10.5C10 10.2239 10.2239 10 10.5 10H13.5C13.7761 10 14 10.2239 14 10.5V12C14 13.1046 13.1046 14 12 14H11C6.02944 14 2 9.97056 2 5V4Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            {formatDays(kpi.days_since_last_order)}
          </span>
        </div>

        <div
          className="compte-actions-row"
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <button
            className="btn-outline"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 13px",
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12.5,
              color: "#374151",
              cursor: "pointer",
              fontFamily: "Figtree, sans-serif",
              fontWeight: 500,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M11 2H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path d="M11 1H5V3H11V1Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Modifier
          </button>
          <button
            className="btn-outline"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 13px",
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12.5,
              color: "#374151",
              cursor: "pointer",
              fontFamily: "Figtree, sans-serif",
              fontWeight: 500,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 4L8 7L14 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 8L8 11L14 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L8 15L14 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Contacter
          </button>
          <button
            className="btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
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
              <rect
                x="1"
                y="4"
                width="14"
                height="10"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M4 4V3C4 1.89543 4.89543 1 6 1H10C11.1046 1 12 1.89543 12 3V4"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            Voir les commandes
          </button>
        </div>
      </div>

      <div
        className="compte-kpi-bar"
        style={{
          display: "flex",
          margin: "14px 28px 0",
          background: "white",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          className="compte-kpi"
          style={{
            flex: 1,
            padding: "13px 14px",
            borderRight: "1px solid var(--border)",
          }}
        >
          <div className="ck-label" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>
            CA Total
          </div>
          <div
            className="ck-val"
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            {formatEur(kpi.ytd_turnover_ex_vat)}
          </div>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              marginTop: 2,
              color:
                kpi.ytd_turnover_evolution_percent !== null &&
                parseFloat(kpi.ytd_turnover_evolution_percent) >= 0
                  ? "var(--green)"
                  : "var(--red)",
            }}
          >
            {formatEvolution(kpi.ytd_turnover_evolution_percent)} vs N-1
          </div>
        </div>
        <div
          className="compte-kpi"
          style={{
            flex: 1,
            padding: "13px 14px",
            borderRight: "1px solid var(--border)",
          }}
        >
          <div className="ck-label" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>
            Panier Moyen
          </div>
          <div
            className="ck-val"
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            {formatEur(kpi.ytd_average_order_value)}
          </div>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              marginTop: 2,
              color:
                kpi.average_order_value_evolution >= 0
                  ? "var(--green)"
                  : "var(--red)",
            }}
          >
            {kpi.average_order_value_evolution >= 0 ? "+" : ""}
            {formatEur(Math.abs(kpi.average_order_value_evolution))} vs N-1
          </div>
        </div>
        <div
          className="compte-kpi"
          style={{
            flex: 1,
            padding: "13px 14px",
            borderRight: "1px solid var(--border)",
          }}
        >
          <div className="ck-label" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>
            Nbre Commandes
          </div>
          <div
            className="ck-val"
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            {rfm?.frequency ?? "—"}
          </div>
        </div>
        <div
          className="compte-kpi"
          style={{
            flex: 1,
            padding: "13px 14px",
            borderRight: "1px solid var(--border)",
          }}
        >
          <div className="ck-label" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>
            Délai moyen
          </div>
          <div
            className="ck-val"
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            {kpi.average_days_between_orders !== null
              ? `${formatNumber(kpi.average_days_between_orders)} jours`
              : "—"}
          </div>
        </div>
        <div
          className="compte-kpi"
          style={{
            flex: 1,
            padding: "13px 14px",
            borderRight: "1px solid var(--border)",
          }}
        >
          <div className="ck-label" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>
            Score RFM
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              className="ck-val"
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "var(--text)",
                letterSpacing: "-0.02em",
              }}
            >
              {rfm?.rfm_score ?? "—"}
            </span>
          </div>
        </div>
        <div className="compte-kpi" style={{ flex: 1, padding: "13px 14px" }}>
          <div className="ck-label" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>
            Dernière commande
          </div>
          <div
            className="ck-val"
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            {formatDays(kpi.days_since_last_order)}
          </div>
        </div>
      </div>

      <div
        className="charts-row"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) 320px",
          gap: 14,
          margin: "14px 28px 0",
          flexShrink: 0,
        }}
      >
        <TurnoverEvolutionChart accountNumber={accountNumber} />

        <div
          className="chart-card"
          style={{
            background: "white",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 18,
            overflow: "hidden",
          }}
        >
          <div
            className="chart-title-row"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span
              className="chart-title"
              style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}
            >
              Score RFM
            </span>
          </div>
          <div
            className="rfm-scores"
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            {rfmDimensions.map((dim) => (
              <div
                key={dim.label}
                className="rfm-row"
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    width: 80,
                    flexShrink: 0,
                  }}
                >
                  {dim.label}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    background: "#f1f5f9",
                    borderRadius: 3,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: dim.score !== null ? `${(dim.score / dim.max) * 100}%` : "0%",
                      height: 6,
                      background: "var(--active)",
                      borderRadius: 3,
                      transition: "width 0.5s",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "var(--text)",
                    minWidth: 24,
                    textAlign: "right",
                  }}
                >
                  {dim.score !== null ? dim.score : "—"}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              className="rfm-status-tag"
              style={{
                display: "inline-block",
                padding: "3px 9px",
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: 600,
                ...rfmStatusStyle,
              }}
            >
              {rfm?.rfm_segment ?? "—"}
            </span>
            {rfmPos && (
              <span
                style={{
                  fontSize: 11.5,
                  color: "var(--muted)",
                  fontWeight: 500,
                }}
              >
                vs {rfmPos.portfolio_average_rfm_score} moyenne portefeuille
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className="bottom-row"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 14,
          margin: "14px 28px 0",
          flexShrink: 0,
        }}
      >
        <div
          className="bottom-card"
          style={{
            background: "white",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 18,
            minWidth: 0,
          }}
        >
          <div
            className="bottom-title"
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 14,
            }}
          >
            Top Produits
          </div>
          {!products ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 180,
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              Données indisponibles
            </div>
          ) : products.length === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 180,
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              Aucun produit sur la période
            </div>
          ) : (
            <div style={{ display: "flex", gap: 18, alignItems: "stretch" }}>
              <div
                style={{
                  width: 282,
                  flexShrink: 0,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  background: "#f1f5f9",
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <div style={{ position: "relative", width: "100%", height: 205 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<DonutTooltip />} />
                      <Pie
                        data={donutSlices}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={94}
                        paddingAngle={2}
                        cornerRadius={4}
                        stroke="none"
                      >
                        {donutSlices.map((d) => (
                          <Cell key={d.sku} fill={d.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>
                      CA 2026
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>
                      {formatEur(donutTotal)}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    width: "100%",
                    marginTop: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                  }}
                >
                  {donutSlices.map((d) => (
                    <div
                      key={d.sku}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 10.5,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          background: d.color,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: "var(--text)",
                          fontWeight: 500,
                        }}
                      >
                        {d.name}
                      </span>
                      <span style={{ color: "var(--muted)", fontWeight: 600, flexShrink: 0 }}>
                        {d.share} %
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0, overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  whiteSpace: "nowrap",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--muted)",
                        paddingBottom: 6,
                        paddingRight: 10,
                        width: "100%",
                      }}
                    >
                      Produit
                    </th>
                    <th style={{ textAlign: "right", fontSize: 10, fontWeight: 600, color: "var(--muted)", paddingBottom: 6, paddingRight: 5 }}>
                      CA
                    </th>
                    <th style={{ textAlign: "right", fontSize: 10, fontWeight: 600, color: "var(--muted)", paddingBottom: 6, paddingRight: 5 }}>
                      CA N-1
                    </th>
                    <th style={{ textAlign: "right", fontSize: 10, fontWeight: 600, color: "var(--muted)", paddingBottom: 6, paddingRight: 5 }}>
                      Évol CA
                    </th>
                    <th style={{ textAlign: "right", fontSize: 10, fontWeight: 600, color: "var(--muted)", paddingBottom: 6, paddingRight: 5 }}>
                      Qté
                    </th>
                    <th style={{ textAlign: "right", fontSize: 10, fontWeight: 600, color: "var(--muted)", paddingBottom: 6, paddingRight: 5 }}>
                      Qté N-1
                    </th>
                    <th style={{ textAlign: "right", fontSize: 10, fontWeight: 600, color: "var(--muted)", paddingBottom: 6 }}>
                      Évol Qté
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const name = productNames.get(p.sku);
                    return (
                      <tr key={p.sku} style={{ borderTop: "1px solid var(--border)" }}>
                        <td style={{ paddingTop: 8, paddingRight: 5, width: "100%", whiteSpace: "normal" }}>
                          <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 10.5 }}>
                            {name ?? p.sku}
                          </div>
                          {name && (
                            <div style={{ fontSize: 9.5, color: "var(--light)" }}>
                              {p.sku}
                            </div>
                          )}
                        </td>
                        <td style={{ paddingTop: 8, paddingRight: 5, textAlign: "right", fontWeight: 600, color: "var(--text)", fontSize: 10.5 }}>
                          {formatEur(p.ytd_turnover_ex_vat)}
                        </td>
                        <td style={{ paddingTop: 8, paddingRight: 5, textAlign: "right", color: "var(--muted)", fontSize: 10.5 }}>
                          {formatEur(p.previous_ytd_turnover_ex_vat)}
                        </td>
                        <td style={{ paddingTop: 8, paddingRight: 5, textAlign: "right", fontWeight: 600, color: evolutionColor(p.turnover_evolution_percent), fontSize: 10.5 }}>
                          {formatEvolution(p.turnover_evolution_percent)}
                        </td>
                        <td style={{ paddingTop: 8, paddingRight: 5, textAlign: "right", fontWeight: 600, color: "var(--text)", fontSize: 10.5 }}>
                          {formatNumber(p.ytd_quantity)}
                        </td>
                        <td style={{ paddingTop: 8, paddingRight: 5, textAlign: "right", color: "var(--muted)", fontSize: 10.5 }}>
                          {formatNumber(p.previous_ytd_quantity)}
                        </td>
                        <td style={{ paddingTop: 8, textAlign: "right", fontWeight: 600, color: evolutionColor(p.quantity_evolution_percent), fontSize: 10.5 }}>
                          {formatEvolution(p.quantity_evolution_percent)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>

        <div
          className="bottom-card"
          style={{
            background: "white",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 18,
          }}
        >
          <div
            className="bottom-title"
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 14,
            }}
          >
            Commandes
          </div>
          <div className="cmd-total" style={{ marginBottom: 14 }}>
            <div
              className="cmd-total-label"
              style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}
            >
              Délai moyen entre commandes
            </div>
            <div
              className="cmd-total-val"
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "var(--text)",
              }}
            >
              {kpi.average_days_between_orders !== null
                ? `${formatNumber(kpi.average_days_between_orders)} jours`
                : "—"}
            </div>
          </div>
          <div
            className="cmd-metrics"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 14,
              paddingTop: 14,
              borderTop: "1px solid var(--border)",
            }}
          >
            <div
              className="cmd-metric"
              style={{
                background: "#f8fafc",
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              <div
                className="cmd-metric-label"
                style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 3 }}
              >
                Évolution du délai
              </div>
              <div
                className="cmd-metric-val"
                style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}
              >
                {kpi.days_between_orders_evolution !== null
                  ? `${kpi.days_between_orders_evolution >= 0 ? "+" : ""}${formatNumber(kpi.days_between_orders_evolution)} jours`
                  : "—"}
              </div>
              <div
                className="cmd-metric-sub"
                style={{
                  fontSize: 10,
                  color: "var(--light)",
                  marginTop: 2,
                }}
              >
                vs période précédente
              </div>
            </div>
            <div
              className="cmd-metric"
              style={{
                background: "#f8fafc",
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              <div
                className="cmd-metric-label"
                style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 3 }}
              >
                CA 12 mois
              </div>
              <div
                className="cmd-metric-val"
                style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}
              >
                {formatEur(kpi.turnover_12_months_ex_vat)}
              </div>
              <div
                className="cmd-metric-sub"
                style={{
                  fontSize: 10,
                  color:
                    kpi.turnover_12_months_evolution_percent !== null &&
                    parseFloat(kpi.turnover_12_months_evolution_percent) >= 0
                      ? "var(--green)"
                      : "var(--red)",
                  marginTop: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                {formatEvolution(kpi.turnover_12_months_evolution_percent)} vs N-1
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ margin: "14px 28px 28px", flexShrink: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: 12,
          }}
        >
          Forces & Faiblesses
        </div>
        <div
          style={{
            background: "white",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 80,
            color: "var(--muted)",
            fontSize: 13,
          }}
        >
          Analyse à venir — basée sur les comparaisons avec le portefeuille
        </div>
      </div>
    </div>
  );
}
