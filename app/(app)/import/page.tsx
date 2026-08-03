"use client";

import { useRef, useState } from "react";
import {
  parseCsv,
  normalizeOrderRows,
  guessColumnMap,
  importOrders,
  type ImportSummary,
  type ColumnMap,
  type NormalizedOrderRow,
  type NormalizationIssue,
} from "@/lib/orders/import";

type Status = "idle" | "ready" | "importing" | "done" | "error";

type Preview = {
  rows: NormalizedOrderRow[];
  issues: NormalizationIssue[];
  duplicateLines: number[];
};

function formatEur(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function displayValue(value: number | string): string {
  if (typeof value === "number") return value.toLocaleString("fr-FR");
  return value;
}

function formatPrice(value: number | string): string {
  if (typeof value === "number") return formatEur(value);
  return value;
}

export default function ImportPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvText, setCsvText] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<string[][]>([]);
  const [colMap, setColMap] = useState<ColumnMap>({});
  const [status, setStatus] = useState<Status>("idle");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [result, setResult] = useState<ImportSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  function handleFile(file: File | undefined | null) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? "")
      const { headers, rows } = parseCsv(text)
      const initialMap = guessColumnMap(headers)
      setHeaders(headers)
      setDataRows(rows)
      setColMap(initialMap)
      setFileName(file.name)
      setCsvText(text)
      setPreview(normalizeOrderRows(headers, rows, initialMap))
      setStatus("ready")
      setResult(null)
      setErrorMessage("")
    }
    reader.readAsText(file)
  }

  function handleColumnChange(key: keyof NormalizedOrderRow, value: string) {
    const next = { ...colMap }
    if (value === "") {
      delete next[key]
    } else {
      next[key] = Number(value)
    }
    setColMap(next)
    setPreview(normalizeOrderRows(headers, dataRows, next))
    setStatus("ready")
    setResult(null)
    setErrorMessage("")
  }

  async function handleImport() {
    if (!csvText) return
    setStatus("importing")
    setErrorMessage("")
    try {
      const summary = await importOrders(csvText, colMap)
      setResult(summary)
      setStatus("done")
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Erreur lors de l'import")
      setStatus("error")
    }
  }

  function reset() {
    setFileName(null)
    setCsvText("")
    setHeaders([])
    setDataRows([])
    setColMap({})
    setPreview(null)
    setResult(null)
    setErrorMessage("")
    setStatus("idle")
    if (inputRef.current) inputRef.current.value = ""
  }

  const validCount = preview ? preview.rows.length - preview.issues.length : 0

  const previewColumns: { label: string; key: keyof NormalizedOrderRow }[] = [
    { label: "N° commande", key: "order_number" },
    { label: "Date", key: "date" },
    { label: "Compte", key: "account_number" },
    { label: "SKU", key: "sku" },
    { label: "Quantité", key: "quantity" },
    { label: "PU HT", key: "unit_price_ex_vat" },
  ]

  const unmapped = previewColumns.filter((col) => colMap[col.key] === undefined)

  return (
    <div className="page-header" style={{ padding: "24px 28px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>
            Importer des commandes
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "3px 0 0" }}>
            Importez vos ventes au format CSV : les doublons sont automatiquement ignorés.
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {status === "idle" && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            handleFile(e.dataTransfer.files?.[0])
          }}
          onClick={() => inputRef.current?.click()}
          style={{
            marginTop: 24,
            border: "2px dashed var(--border)",
            borderRadius: 14,
            background: "var(--white)",
            padding: "56px 24px",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>
            Glissez votre fichier CSV ici
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            ou cliquez pour parcourir · les colonnes sont reconnues automatiquement, ajustables après le chargement
          </div>
        </div>
      )}

      {status !== "idle" && fileName && (
        <div
          style={{
            marginTop: 24,
            background: "var(--white)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: 20,
            animation: "fadeIn 0.25s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>📄</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{fileName}</span>
            </div>
            <button
              onClick={reset}
              style={{
                border: "1px solid var(--border)",
                background: "transparent",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: 12.5,
                color: "var(--muted)",
                cursor: "pointer",
                fontFamily: "Figtree, sans-serif",
              }}
            >
              Réinitialiser
            </button>
          </div>

          {preview && (
            <>
              <div
                style={{
                  marginTop: 16,
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  background: "var(--bg)",
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                  Correspondance des colonnes
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, marginBottom: 10 }}>
                  Associez chaque champ requis à une colonne du fichier. Les colonnes sont reconnues automatiquement,
                  vous pouvez les corriger ici.
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 10,
                  }}
                >
                  {previewColumns.map((field) => {
                    const selected = colMap[field.key]
                    return (
                      <label key={field.key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>{field.label}</span>
                        <select
                          value={selected === undefined ? "" : String(selected)}
                          onChange={(e) => handleColumnChange(field.key, e.target.value)}
                          style={{
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            background: "var(--white)",
                            padding: "7px 10px",
                            fontSize: 12.5,
                            color: "var(--text)",
                            fontFamily: "Figtree, sans-serif",
                          }}
                        >
                          <option value="">— non fourni —</option>
                          {headers.map((h, i) => (
                            <option key={i} value={String(i)}>
                              {i} · {h.trim() || `(colonne ${i + 1})`}
                            </option>
                          ))}
                        </select>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                <StatChip label="Lignes" value={preview.rows.length} color="var(--text)" />
                <StatChip label="Valides" value={validCount} color="var(--green)" />
                <StatChip label="Avec erreurs" value={preview.issues.length} color="var(--red)" />
                <StatChip label="Doublons dans le fichier" value={preview.duplicateLines.length} color="var(--orange)" />
              </div>

              <div style={{ marginTop: 16, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead>
                    <tr>
                      {previewColumns.map((col) => (
                        <th
                          key={col.key}
                          style={{
                            textAlign: "left",
                            padding: "8px 10px",
                            color: "var(--muted)",
                            fontWeight: 600,
                            borderBottom: "1px solid var(--border)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 8).map((row, i) => (
                      <tr key={i}>
                        {previewColumns.map((col) => (
                          <td
                            key={col.key}
                            style={{
                              padding: "8px 10px",
                              color: "var(--text)",
                              borderBottom: "1px solid var(--border)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {col.key === "unit_price_ex_vat"
                              ? formatPrice(row[col.key])
                              : col.key === "quantity"
                                ? displayValue(row[col.key])
                                : row[col.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.rows.length > 8 && (
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
                    … et {preview.rows.length - 8} autres lignes
                  </div>
                )}
              </div>

              {preview.issues.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--red)", marginBottom: 6 }}>
                    {preview.issues.length} ligne(s) en erreur :
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.7 }}>
                    {preview.issues.slice(0, 5).map((issue, i) => (
                      <div key={i}>
                        Ligne {issue.line}
                        {issue.order_number ? ` (${issue.order_number})` : ""} — {issue.reason}
                      </div>
                    ))}
                    {preview.issues.length > 5 && <div>… et {preview.issues.length - 5} autres</div>}
                  </div>
                </div>
              )}
            </>
          )}

          {status === "done" && result && (
            <div
              style={{
                marginTop: 16,
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 10,
                padding: 14,
                fontSize: 13,
                color: "#15803d",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Import terminé</div>
              <div>✅ {result.inserted} commande(s) insérée(s)</div>
              <div>⏭️ {result.duplicates} doublon(s) ignoré(s)</div>
              {result.invalid > 0 && <div>⚠️ {result.invalid} ligne(s) invalide(s) non importée(s)</div>}
              {result.errors.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 12.5, color: "var(--muted)" }}>
                  {result.errors.slice(0, 5).map((err, i) => (
                    <div key={i}>
                      Ligne {err.line}
                      {err.order_number ? ` (${err.order_number})` : ""} — {err.reason}
                    </div>
                  ))}
                  {result.errors.length > 5 && <div>… et {result.errors.length - 5} autres</div>}
                </div>
              )}
            </div>
          )}

          {status === "error" && (
            <div
              style={{
                marginTop: 16,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 10,
                padding: 14,
                fontSize: 13,
                color: "var(--red)",
              }}
            >
              {errorMessage}
            </div>
          )}

          {status === "ready" && (
            <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={handleImport}
                disabled={unmapped.length > 0}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  background: "var(--active)",
                  border: "1px solid var(--active)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "white",
                  cursor: unmapped.length > 0 ? "not-allowed" : "pointer",
                  fontFamily: "Figtree, sans-serif",
                  fontWeight: 600,
                  opacity: unmapped.length > 0 ? 0.45 : 1,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Importer {validCount > 0 ? `${validCount} ligne(s)` : ""}
              </button>
              {unmapped.length > 0 && (
                <span style={{ fontSize: 12.5, color: "var(--orange)", fontWeight: 600 }}>
                  Colonne non assignée : {unmapped.map((col) => col.label).join(", ")}
                </span>
              )}
            </div>
          )}

          {status === "importing" && (
            <div style={{ marginTop: 16, fontSize: 13, color: "var(--muted)" }}>Import en cours…</div>
          )}
        </div>
      )}
    </div>
  );
}

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "8px 14px",
        background: "var(--bg)",
        display: "flex",
        alignItems: "baseline",
        gap: 6,
      }}
    >
      <span style={{ fontSize: 16, fontWeight: 800, color }}>{value}</span>
      <span style={{ fontSize: 12, color: "var(--muted)" }}>{label}</span>
    </div>
  );
}
