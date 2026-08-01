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

type AccountMetricsRow = {
  account_number: string;
  account_name: string;
  account_type: string;
  kpi_key: string;
  kpi_label: string;
  unit: string;
  higher_is_better: boolean;
  value: number | null;
};

type KpiRow = {
  key: string;
  label: string;
  unit: string;
  accountValue: number;
  segmentAverage: number;
  status: "above" | "below" | "neutral";
};

type AccountMetrics = {
  account_number: string;
  account_name: string;
  account_type: string;
  kpis: Record<string, number | null>;
};

type KpiDef = {
  label: string;
  unit: string;
  higher_is_better: boolean;
};

const KPI_KEYS = ["ca_period", "evolution", "aov", "orders", "avg_days", "rfm"];

const SEGMENT_LABELS: Record<string, string> = {
  Grossiste: "Grossistes",
  Revendeur: "Revendeurs",
  Distributeur: "Distributeurs",
  Retail: "Retail",
};

const accountTypeStyles: Record<
  string,
  { background: string; color: string; borderColor: string }
> = {
  Distributeur: { background: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" },
  Retail: { background: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" },
  Grossiste: { background: "#f8fafc", color: "#64748b", borderColor: "#e2e8f0" },
  Revendeur: { background: "#f8fafc", color: "#64748b", borderColor: "#e2e8f0" },
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
  const [tab, setTab] = useState<"segment" | "boutiques">("segment");

  const [rows, setRows] = useState<PerformanceKpiRow[]>([]);
  const [appliedRange, setAppliedRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const loading =
    appliedRange === null ||
    appliedRange.start !== startDate ||
    appliedRange.end !== endDate;

  const [accountMetrics, setAccountMetrics] = useState<AccountMetricsRow[]>([]);
  const [appliedMetricsRange, setAppliedMetricsRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const metricsLoading =
    appliedMetricsRange === null ||
    appliedMetricsRange.start !== startDate ||
    appliedMetricsRange.end !== endDate;

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

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

  useEffect(() => {
    const supabase = createClient();

    supabase
      .rpc("get_accounts_kpi_metrics", {
        p_start_date: startDate,
        p_end_date: endDate,
      })
      .then(({ data, error }) => {
        if (!error && data) setAccountMetrics(data as AccountMetricsRow[]);
        setAppliedMetricsRange({ start: startDate, end: endDate });
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

  const metricsByAccount = useMemo(() => {
    const map = new Map<string, AccountMetrics>();
    for (const r of accountMetrics) {
      const num = r.value === null ? null : Number(r.value);
      let entry = map.get(r.account_number);
      if (!entry) {
        entry = {
          account_number: r.account_number,
          account_name: r.account_name,
          account_type: r.account_type,
          kpis: {},
        };
        map.set(r.account_number, entry);
      }
      entry.kpis[r.kpi_key] = num;
    }
    return map;
  }, [accountMetrics]);

  const kpiDefs = useMemo(() => {
    const defs: Record<string, KpiDef> = {};
    for (const r of accountMetrics) {
      if (!defs[r.kpi_key]) {
        defs[r.kpi_key] = {
          label: r.kpi_label,
          unit: r.unit,
          higher_is_better: r.higher_is_better,
        };
      }
    }
    return defs;
  }, [accountMetrics]);

  const candidates = useMemo(() => {
    const list = Array.from(metricsByAccount.values()).filter(
      (m) => m.account_number !== accountNumber
    );
    const q = search.trim().toLowerCase();
    const filtered = q
      ? list.filter(
          (m) =>
            m.account_name.toLowerCase().includes(q) ||
            m.account_number.toLowerCase().includes(q) ||
            m.account_type.toLowerCase().includes(q)
        )
      : list;
    return [...filtered].sort(
      (a, b) => (b.kpis.ca_period ?? 0) - (a.kpis.ca_period ?? 0)
    );
  }, [metricsByAccount, accountNumber, search]);

  const analysisColumns = useMemo(() => {
    const cols: AccountMetrics[] = [];
    const current = metricsByAccount.get(accountNumber);
    if (current) cols.push(current);
    for (const id of selected) {
      const m = metricsByAccount.get(id);
      if (m) cols.push(m);
    }
    return cols;
  }, [metricsByAccount, accountNumber, selected]);

  const analysisRows = useMemo(() => {
    return KPI_KEYS.map((key) => {
      const def = kpiDefs[key];
      const values = analysisColumns.map((c) => c.kpis[key] ?? null);
      let best = -1;
      let worst = -1;
      let bestVal: number | null = null;
      let worstVal: number | null = null;
      values.forEach((v, i) => {
        if (v === null) return;
        if (best === -1) {
          best = i;
          bestVal = v;
          worst = i;
          worstVal = v;
        } else if (def && def.higher_is_better ? v > (bestVal as number) : v < (bestVal as number)) {
          best = i;
          bestVal = v;
        }
        if (def && def.higher_is_better ? v < (worstVal as number) : v > (worstVal as number)) {
          worst = i;
          worstVal = v;
        }
      });
      return {
        key,
        label: def?.label ?? key,
        unit: def?.unit ?? "",
        values,
        best,
        worst,
      };
    });
  }, [analysisColumns, kpiDefs]);

  const toggleSelected = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const renderSegmentTab = () => {
    if (loading) {
      return (
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
      );
    }
    if (!header) {
      return (
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
      );
    }
    return (
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
              {formatOrdinal(header.ca_rank)} / {formatNumber(header.segment_count)}
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
                    Moy. segment : {formatValue(k.segmentAverage, k.unit)}
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
    );
  };

  const renderBoutiquesTab = () => {
    if (metricsLoading) {
      return (
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
      );
    }
    if (metricsByAccount.size === 0) {
      return (
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
      );
    }
    return (
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
            fontSize: 12.5,
            color: "var(--muted)",
            marginBottom: 12,
          }}
        >
          Comparez ce compte à d&apos;autres boutiques de votre portefeuille ·{" "}
          {formatRange(startDate, endDate)}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div className="search-wrap" style={{ position: "relative", maxWidth: 320 }}>
            <svg
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
              onChange={(e) => setSearch(e.target.value)}
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
          {selected.length > 0 && (
            <button
              onClick={() => setSelected([])}
              style={{
                padding: "6px 12px",
                background: "white",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--muted)",
                cursor: "pointer",
                fontFamily: "Figtree, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              Tout désélectionner ({selected.length})
            </button>
          )}
        </div>

        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 10,
            overflowX: "auto",
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse" }}>
            <thead
              style={{
                position: "sticky",
                top: 0,
                background: "#f8fafc",
                zIndex: 1,
              }}
            >
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ width: 40 }}></th>
                <Th>Compte</Th>
                <Th>Type</Th>
                <Th>CA période</Th>
                <Th>Évol.</Th>
                <Th>Panier moy.</Th>
                <Th>Nbre commandes</Th>
                <Th>RFM</Th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((m) => {
                const isChecked = selected.includes(m.account_number);
                return (
                  <tr
                    key={m.account_number}
                    onClick={() => toggleSelected(m.account_number)}
                    style={{
                      cursor: "pointer",
                      background: isChecked ? "#eff6ff" : "white",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = isChecked ? "#eff6ff" : "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = isChecked ? "#eff6ff" : "white")}
                  >
                    <td style={{ padding: "9px 12px", borderBottom: "1px solid #f8fafc", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSelected(m.account_number)}
                        style={{ cursor: "pointer", accentColor: "var(--active)" }}
                      />
                    </td>
                    <td style={{ padding: "9px 12px", borderBottom: "1px solid #f8fafc" }}>
                      <div style={{ fontWeight: 700, fontSize: 12.5, color: "var(--text)" }}>
                        {m.account_name}
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--light)" }}>
                        {m.account_number}
                      </div>
                    </td>
                    <td style={{ padding: "9px 12px", borderBottom: "1px solid #f8fafc" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 10.5,
                          fontWeight: 600,
                          border: "1px solid",
                          ...(accountTypeStyles[m.account_type] ?? accountTypeStyles.Grossiste),
                        }}
                      >
                        {m.account_type}
                      </span>
                    </td>
                    <Td unit={kpiDefs.ca_period?.unit} value={m.kpis.ca_period ?? null} strong />
                    <Td unit={kpiDefs.evolution?.unit} value={m.kpis.evolution ?? null} />
                    <Td unit={kpiDefs.aov?.unit} value={m.kpis.aov ?? null} />
                    <Td unit={kpiDefs.orders?.unit} value={m.kpis.orders ?? null} />
                    <Td unit={kpiDefs.rfm?.unit} value={m.kpis.rfm ?? null} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selected.length === 0 ? (
          <div
            style={{
              fontSize: 12,
              color: "var(--muted)",
              marginTop: 14,
              padding: "12px 14px",
              background: "#f8fafc",
              border: "1px dashed var(--border)",
              borderRadius: 10,
            }}
          >
            💡 Sélectionnez des comptes à comparer ci-dessus pour afficher une
            analyse comparative.
          </div>
        ) : (
          <div style={{ marginTop: 18 }}>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 10,
              }}
            >
              Analyse comparative
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--border)" }}>
                    <th
                      style={{
                        fontSize: 11.5,
                        color: "var(--muted)",
                        fontWeight: 600,
                        textAlign: "left",
                        padding: "11px 14px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Indicateur
                    </th>
                    {analysisColumns.map((m, i) => (
                      <th
                        key={m.account_number}
                        style={{
                          fontSize: 11.5,
                          color: i === 0 ? "var(--active)" : "var(--text)",
                          fontWeight: 700,
                          textAlign: "right",
                          padding: "11px 14px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div>{i === 0 ? `${m.account_name} (ce compte)` : m.account_name}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--muted)" }}>
                          {m.account_type}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analysisRows.map((row) => (
                    <tr key={row.key} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "11px 14px", fontSize: 12.5, color: "var(--text)" }}>
                        {row.label}
                      </td>
                      {row.values.map((v, i) => {
                        const isBest = row.best !== row.worst && i === row.best;
                        const isWorst = row.best !== row.worst && i === row.worst;
                        return (
                          <td
                            key={i}
                            style={{
                              padding: "11px 14px",
                              fontSize: 12.5,
                              fontWeight: isBest || isWorst ? 700 : 600,
                              textAlign: "right",
                              whiteSpace: "nowrap",
                              color:
                                v === null
                                  ? "var(--muted)"
                                  : isBest
                                    ? "#15803d"
                                    : isWorst
                                      ? "#dc2626"
                                      : "var(--text)",
                              background: isBest ? "#f0fdf4" : isWorst ? "#fef2f2" : "transparent",
                              borderRadius: isBest || isWorst ? 6 : 0,
                            }}
                          >
                            {v === null ? "—" : formatValue(v, row.unit)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: "var(--muted)",
                marginTop: 8,
              }}
            >
              Vert = meilleure valeur · Rouge = valeur la plus faible ·{" "}
              {analysisColumns[0]?.account_name} est le compte actuellement
              affiché.
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ margin: "14px 28px 28px", flexShrink: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <span
          style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}
        >
          Comparaison de performances
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {(
            [
              { key: "segment", label: "Par segment" },
              { key: "boutiques", label: "Autres boutiques" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "6px 12px",
                background: tab === t.key ? "var(--active)" : "white",
                border:
                  tab === t.key ? "1px solid var(--active)" : "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                color: tab === t.key ? "white" : "var(--muted)",
                cursor: "pointer",
                fontFamily: "Figtree, sans-serif",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "segment" ? renderSegmentTab() : renderBoutiquesTab()}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        fontSize: 11.5,
        color: "var(--muted)",
        fontWeight: 600,
        textAlign: "left",
        padding: "9px 12px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  value,
  unit,
  strong,
}: {
  value: number | null;
  unit?: string;
  strong?: boolean;
}) {
  return (
    <td
      style={{
        padding: "9px 12px",
        borderBottom: "1px solid #f8fafc",
        fontSize: strong ? 12.5 : 12,
        fontWeight: strong ? 700 : 500,
        color: "var(--text)",
        whiteSpace: "nowrap",
      }}
    >
      {value === null || !unit ? "—" : formatValue(value, unit)}
    </td>
  );
}
