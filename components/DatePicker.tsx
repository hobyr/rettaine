"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

function toIso(year: number, month: number, day: number) {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function parseIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}

function isSameDay(a: { year: number; month: number; day: number }, b: { year: number; month: number; day: number }) {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function formatLabel(iso: string) {
  const { year, month, day } = parseIso(iso);
  const date = new Date(year, month, day);
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

type DatePickerProps = {
  label?: string;
  value: string;
  onChange: (iso: string) => void;
};

export default function DatePicker({ label, value, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseIso(value);
  const [view, setView] = useState({ year: selected.year, month: selected.month });
  const [shift, setShift] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const el = popupRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const over = rect.right - window.innerWidth;
    setShift(over > 0 ? over + 4 : 0);
  }, [open, view]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const openCalendar = () => {
    setView(parseIso(value));
    setOpen(true);
  };

  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const gridOffset = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const cells: (number | null)[] = [
    ...Array.from({ length: gridOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = new Date();
  const todayDate = { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() };

  const prevMonth = () => {
    setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }));
  };

  const nextMonth = () => {
    setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }));
  };

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      {label && (
        <span
          style={{
            marginRight: 6,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--muted)",
          }}
        >
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={openCalendar}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
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
          <rect x="1" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 4V3C4 1.89543 4.89543 1 6 1H10C11.1046 1 12 1.89543 12 3V4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M1 8H15" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        {formatLabel(value)}
      </button>

      {open && (
        <div
          ref={popupRef}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            transform: shift ? `translateX(-${shift}px)` : undefined,
            zIndex: 30,
            background: "white",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
            padding: 10,
            animation: "fadeIn 0.15s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Mois précédent"
              style={{
                width: 26,
                height: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                borderRadius: 6,
                color: "var(--muted)",
                cursor: "pointer",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M10 2L4 8L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)" }}>
              {MONTHS[view.month]} {view.year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Mois suivant"
              style={{
                width: 26,
                height: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                borderRadius: 6,
                color: "var(--muted)",
                cursor: "pointer",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M6 2L12 8L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 28px)",
              gap: 2,
            }}
          >
            {WEEKDAYS.map((wd, i) => (
              <div
                key={i}
                style={{
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "var(--light)",
                }}
              >
                {wd}
              </div>
            ))}
            {cells.map((day, i) => {
              if (day === null) {
                return <div key={i} style={{ height: 28 }} />;
              }
              const cell = { year: view.year, month: view.month, day };
              const isSelected = isSameDay(cell, selected);
              const isToday = isSameDay(cell, todayDate);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(toIso(view.year, view.month, day));
                    setOpen(false);
                  }}
                  style={{
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontFamily: "Figtree, sans-serif",
                    fontWeight: 600,
                    background: isSelected ? "var(--active)" : "transparent",
                    border: isToday && !isSelected ? "1px solid var(--active)" : "1px solid transparent",
                    color: isSelected ? "white" : "var(--text)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "#f1f5f9";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
