"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { createClient } from "@/lib/supabase/client";

type TurnoverEvolutionRow = {
  account_number: string;
  month_number: number;
  month_name: string;
  current_year: number;
  previous_year: number;
  current_year_turnover: string;
  previous_year_turnover: string;
  current_year_ytd_turnover: string;
  previous_year_ytd_turnover: string;
  monthly_evolution_amount: string;
  monthly_evolution_percent: string | null;
  ytd_evolution_amount: string;
  ytd_evolution_percent: string | null;
};

type ChartPoint = {
  month: string;
  monthFull: string;
  currentYear: number;
  previousYear: number;
  current: number;
  previous: number;
  evolutionPercent: number | null;
};

const MONTHS_FR_SHORT = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

const MONTHS_FR_FULL = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const ranges = [
  { key: "12m", label: "12m" },
  { key: "6m", label: "6m" },
  { key: "3m", label: "3m" },
] as const;

type RangeKey = (typeof ranges)[number]["key"];

function formatEur(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatEurCompact(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(cents / 100);
}

function formatEvolutionPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "10px 13px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        minWidth: 180,
      }}
    >
      <div
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          color: "var(--text)",
          marginBottom: 6,
        }}
      >
        {point.monthFull}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          fontSize: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <span style={{ color: "var(--muted)" }}>CA {point.currentYear}</span>
          <span style={{ fontWeight: 700, color: "#2563eb" }}>
            {formatEur(point.current)}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <span style={{ color: "var(--muted)" }}>CA {point.previousYear}</span>
          <span style={{ fontWeight: 600, color: "#94a3b8" }}>
            {formatEur(point.previous)}
          </span>
        </div>
        {point.evolutionPercent !== null && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              borderTop: "1px solid var(--border)",
              paddingTop: 5,
              marginTop: 3,
            }}
          >
            <span style={{ color: "var(--muted)" }}>Évolution</span>
            <span
              style={{
                fontWeight: 700,
                color: point.evolutionPercent >= 0 ? "#15803d" : "#dc2626",
              }}
            >
              {formatEvolutionPercent(point.evolutionPercent)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TurnoverEvolutionChart({
  accountNumber,
}: {
  accountNumber: string;
}) {
  const [rows, setRows] = useState<TurnoverEvolutionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("12m");

  useEffect(() => {
    const supabase = createClient();
    const now = new Date();

    supabase
      .rpc("get_account_turnover_evolution", {
        p_account_number: accountNumber,
        p_year: now.getFullYear(),
        p_month: now.getMonth() + 1,
      })
      .then(({ data, error }) => {
        if (!error && data) setRows(data as TurnoverEvolutionRow[]);
        setLoading(false);
      });
  }, [accountNumber]);

  const points = useMemo<ChartPoint[]>(
    () =>
      rows.map((r) => ({
        month: MONTHS_FR_SHORT[r.month_number - 1] ?? String(r.month_number),
        monthFull: MONTHS_FR_FULL[r.month_number - 1] ?? r.month_name,
        currentYear: r.current_year,
        previousYear: r.previous_year,
        current: Number(r.current_year_turnover),
        previous: Number(r.previous_year_turnover),
        evolutionPercent:
          r.monthly_evolution_percent !== null
            ? Number(r.monthly_evolution_percent)
            : null,
      })),
    [rows]
  );

  const visible = useMemo(() => {
    if (range === "12m") return points;
    if (range === "6m") return points.slice(-6);
    return points.slice(-3);
  }, [points, range]);

  const currentYear = points[0]?.currentYear ?? new Date().getFullYear();
  const previousYear = points[0]?.previousYear ?? currentYear - 1;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 18,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <span
          style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}
        >
          Évolution du CA
        </span>
        <div
          style={{
            display: "flex",
            gap: 0,
            background: "#f1f5f9",
            borderRadius: 7,
            overflow: "hidden",
            padding: 2,
          }}
        >
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              style={{
                padding: "4px 11px",
                border: "none",
                background: range === r.key ? "white" : "transparent",
                fontSize: 11.5,
                color: range === r.key ? "var(--text)" : "var(--muted)",
                cursor: "pointer",
                borderRadius: 5,
                fontFamily: "Figtree, sans-serif",
                fontWeight: range === r.key ? 600 : 500,
                boxShadow:
                  range === r.key ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 14,
          marginBottom: 12,
          fontSize: 11,
          color: "var(--muted)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 16,
              height: 2.5,
              background: "#2563eb",
              borderRadius: 1,
            }}
          />
          CA {currentYear}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 16, borderTop: "2px dashed #94a3b8" }} />
          CA {previousYear}
        </span>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 220,
            color: "var(--muted)",
            fontSize: 13,
          }}
        >
          Chargement…
        </div>
      ) : visible.length === 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 220,
            color: "var(--muted)",
            fontSize: 13,
          }}
        >
          Aucune donnée disponible
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={visible}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
              padding={{ left: 12, right: 12 }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={56}
              tickFormatter={(v: number) => formatEurCompact(v)}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "#e2e8f0", strokeDasharray: "4 4" }}
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }}
              activeDot={{
                r: 5.5,
                fill: "#2563eb",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
            <Line
              type="monotone"
              dataKey="previous"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              dot={{ r: 2.5, fill: "#94a3b8", strokeWidth: 0 }}
              activeDot={{
                r: 5,
                fill: "#94a3b8",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
