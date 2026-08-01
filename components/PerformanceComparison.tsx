"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PerformanceKpiRow = {
  account_number: string;
  account_name: string;
  account_type: string;
  segment_count: number;
  ca_rank: number;
  kpi_key: string;
  kpi_label: string;
  unit: string;
  higher_is_better: boolean;
  account_value: number;
  segment_average: number;
};

type KpiRow = {
  key: string;
  label: string;
  unit: string;
  accountValue: number;
  segmentAverage: number;
  status: "above" | "below" | "neutral";
};

const SEGMENT_LABELS: Record<string, string> = {
  Grossiste: "Grossistes",
  Revendeur: "Revendeurs",
  Distributeur: "Distributeurs",
  Retail: "Retail",
};

function formatEur(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatNumber(n: number, maxDecimals = 0): string {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: maxDecimals,
  }).format(n);
}

function formatPercent(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(n)}%`;
}

function formatValue(value: number, unit: string): string {
  switch (unit) {
    case "eur":
      return formatEur(value);
    case "percent":
      return formatPercent(value);
    case "count":
      return formatNumber(value);
    case "days":
      return `${formatNumber(value, 1)} j`;
    case "rfm":
      return formatNumber(value, 1);
    default:
      return formatNumber(value);
  }
}

function formatOrdinal(n: number): string {
  if (n === 1) return "1ᵉʳ";
  return `${formatNumber(n)}ᵉ`;
}

function formatRange(startDate: string, endDate: string): string {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return `${new Intl.DateTimeFormat("fr-FR", options).format(
    new Date(`${startDate}T00:00:00`)
  )} → ${new Intl.DateTimeFormat("fr-FR", options).format(
    new Date(`${endDate}T00:00:00`)
  )}`;
}

function computeStatus(
  accountValue: number,
  segmentAverage: number,
  higherIsBetter: boolean
): "above" | "below" | "neutral" {
  if (segmentAverage === 0) return "neutral";
  const ratio = accountValue / segmentAverage;
  if (higherIsBetter) {
    if (ratio > 1.05) return "above";
    if (ratio < 0.95) return "below";
  } else {
    if (ratio < 0.95) return "above";
    if (ratio > 1.05) return "below";
  }
  return "neutral";
}

const STATUS_CHIP_STYLES: Record<
  "above" | "below" | "neutral",
  { background: string; color: string; borderColor: string; label: string }
> = {
  above: {
    background: "#f0fdf4",
    color: "#15803d",
    borderColor: "#bbf7d0",
    label: "↑ Au-dessus de la moyenne",
  },
  below: {
    background: "#fef2f2",
    color: "#dc2626",
    borderColor: "#fecaca",
    label: "↓ En dessous de la moyenne",
  },
  neutral: {
    background: "#f8fafc",
    color: "#64748b",
    borderColor: "#e2e8f0",
    label: "≈ Dans la moyenne",
  },
};

export default function PerformanceComparison({
  accountNumber,
  startDate,
  endDate,
}: {
  accountNumber: string;
  startDate: string;
  endDate: string;
}) {
  const [rows, setRows] = useState<PerformanceKpiRow[]>([]);
  const [appliedRange, setAppliedRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const loading =
    appliedRange === null ||
    appliedRange.start !== startDate ||
    appliedRange.end !== endDate;

  useEffect(() => {
    const supabase = createClient();

    supabase
      .rpc("get_account_performance_comparison", {
        p_account_number: accountNumber,
        p_start_date: startDate,
        p_end_date: endDate,
      })
      .then(({ data, error }) => {
        if (!error && data) setRows(data as PerformanceKpiRow[]);
        setAppliedRange({ start: startDate, end: endDate });
      });
  }, [accountNumber, startDate, endDate]);

  const kpis = useMemo<KpiRow[]>(() => {
    return rows.map((r) => ({
      key: r.kpi_key,
      label: r.kpi_label,
      unit: r.unit,
      accountValue: Number(r.account_value),
      segmentAverage: Number(r.segment_average),
      status: computeStatus(
        Number(r.account_value),
        Number(r.segment_average),
        r.higher_is_better
      ),
    }));
  }, [rows]);

  const header = rows[0];
  const forces = kpis.filter((k) => k.status === "above");
  const progress = kpis.filter((k) => k.status === "below");

  return (
    <div style={{ margin: "14px 28px 28px", flexShrink: 0 }}>
      <div
        style={{
          fontSize: 13.5,
          fontWeight: 700,
          color: "var(--text)",
          marginBottom: 12,
        }}
      >
        Comparaison de performances
      </div>

      {loading ? (
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
          Chargement…
        </div>
      ) : !header ? (
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
          Aucune donnée disponible pour cette période
        </div>
      ) : (
        <div
          style={{
            background: "white",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              paddingBottom: 14,
              borderBottom: "1px solid var(--border)",
              marginBottom: 4,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
              {SEGMENT_LABELS[header.account_type] ?? header.account_type} ·{" "}
              {formatNumber(header.segment_count)} comptes ·{" "}
              {formatRange(startDate, endDate)}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12.5,
              }}
            >
              <span style={{ color: "var(--muted)" }}>
                Rang CA dans le segment
              </span>
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--text)",
                  background: "#f1f5f9",
                  borderRadius: 8,
                  padding: "4px 10px",
                }}
              >
                {formatOrdinal(header.ca_rank)} /{" "}
                {formatNumber(header.segment_count)}
              </span>
            </div>
          </div>

          <div>
            {kpis.map((k) => {
              const chip = STATUS_CHIP_STYLES[k.status];
              return (
                <div
                  key={k.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "12px 4px",
                    borderBottom: "1px solid var(--border)",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, fontSize: 13, color: "var(--text)" }}>
                    {k.label}
                  </div>
                  <div style={{ textAlign: "right", minWidth: 110 }}>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: "var(--text)",
                      }}
                    >
                      {formatValue(k.accountValue, k.unit)}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        marginTop: 2,
                      }}
                    >
                      Moy. segment :{" "}
                      {formatValue(k.segmentAverage, k.unit)}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      whiteSpace: "nowrap",
                      fontSize: 10.5,
                      fontWeight: 600,
                      background: chip.background,
                      color: chip.color,
                      border: `1px solid ${chip.borderColor}`,
                      borderRadius: 999,
                      padding: "3px 9px",
                    }}
                  >
                    {chip.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: 14,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#15803d",
                  marginBottom: 8,
                }}
              >
                Forces vs segment
              </div>
              {forces.length > 0 ? (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {forces.map((k) => (
                    <span
                      key={k.key}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        background: "#f0fdf4",
                        color: "#15803d",
                        border: "1px solid #bbf7d0",
                        borderRadius: 999,
                        padding: "3px 10px",
                      }}
                    >
                      {k.label}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  Aucune force identifiée sur la période
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#dc2626",
                  marginBottom: 8,
                }}
              >
                Points de progrès
              </div>
              {progress.length > 0 ? (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {progress.map((k) => (
                    <span
                      key={k.key}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        background: "#fef2f2",
                        color: "#dc2626",
                        border: "1px solid #fecaca",
                        borderRadius: 999,
                        padding: "3px 10px",
                      }}
                    >
                      {k.label}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  Aucun point de progrès sur la période
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
