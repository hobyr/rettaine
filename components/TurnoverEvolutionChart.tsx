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

type TurnoverPeriodRow = {
  bucket_key: string;
  period_turnover: number;
  previous_period_turnover: number;
  evolution_percent: string | null;
};

type ChartPoint = {
  key: string;
  month: string;
  monthFull: string;
  period: number;
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
          <span style={{ color: "var(--muted)" }}>CA période</span>
          <span style={{ fontWeight: 700, color: "#2563eb" }}>
            {formatEur(point.period)}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <span style={{ color: "var(--muted)" }}>CA N-1</span>
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
  startDate,
  endDate,
}: {
  accountNumber: string;
  startDate: string;
  endDate: string;
}) {
  const [rows, setRows] = useState<TurnoverPeriodRow[]>([]);
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
      .rpc("get_account_turnover_by_period", {
        p_account_number: accountNumber,
        p_start_date: startDate,
        p_end_date: endDate,
      })
      .then(({ data, error }) => {
        if (!error && data) setRows(data as TurnoverPeriodRow[]);
        setAppliedRange({ start: startDate, end: endDate });
      });
  }, [accountNumber, startDate, endDate]);

  const points = useMemo<ChartPoint[]>(
    () =>
      rows.map((r) => {
        const [y, m] = r.bucket_key.split("-").map(Number);
        return {
          key: r.bucket_key,
          month: `${MONTHS_FR_SHORT[m - 1] ?? ""} ${y}`,
          monthFull: `${MONTHS_FR_FULL[m - 1] ?? ""} ${y}`,
          period: r.period_turnover,
          previous: r.previous_period_turnover,
          evolutionPercent:
            r.evolution_percent !== null
              ? Number(r.evolution_percent)
              : null,
        };
      }),
    [rows]
  );

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
          CA période
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 16, borderTop: "2px dashed #94a3b8" }} />
          CA N-1
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
      ) : points.length === 0 ? (
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
            data={points}
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
              dataKey="period"
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
