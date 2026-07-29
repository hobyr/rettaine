"use client"

import { useState, useMemo } from "react"
import type { Produit, Categorie } from "@/lib/products"

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const tabs = [
  { key: "all", label: "Tous" },
  { key: "new", label: "Nouveautés" },
  { key: "hot", label: "Meilleures ventes" },
  { key: "stock", label: "Épuisés" },
]

export default function ProduitsContent({
  produits,
  categories,
}: {
  produits: Produit[]
  categories: Categorie[]
}) {
  const [tab, setTab] = useState("all")
  const [view, setView] = useState<"grid" | "list">("grid")

  const filtered = useMemo(() => {
    if (tab === "all") return produits
    if (tab === "new") return produits.filter((p) => p.badge === "new")
    if (tab === "hot") return produits.filter((p) => p.badge === "hot" || p.ca > 8000)
    if (tab === "stock") return produits.filter((p) => p.stock < 30)
    return produits
  }, [tab, produits])

  const totalFormats = produits.reduce((s, p) => s + p.formats.length, 0)
  const totalCa = produits.reduce((s, p) => s + p.ca, 0)
  const totalStock = produits.reduce((s, p) => s + p.stock, 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div style={{ padding: "24px 28px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>Produits</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "3px 0 0" }}>Catalogue et gestion des produits</p>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "var(--active)", border: "1px solid var(--active)", borderRadius: 8, fontSize: 12.5, color: "white", cursor: "pointer", fontFamily: "Figtree, sans-serif", fontWeight: 600 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            Ajouter un produit
          </button>
        </div>
      </div>

      <div className="prod-kpi-bar" style={{ display: "flex", gap: 12, margin: "16px 28px 0", flexShrink: 0 }}>
        <div className="prod-kpi" style={{ flex: 1, background: "white", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
          <div className="prod-kpi-label" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Nb Produits</div>
          <div className="prod-kpi-val" style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{produits.length}</div>
          <div className="prod-kpi-sub" style={{ fontSize: 11, color: "var(--light)", marginTop: 3 }}>Tous actifs</div>
        </div>
        <div className="prod-kpi" style={{ flex: 1, background: "white", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
          <div className="prod-kpi-label" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>CA Produits</div>
          <div className="prod-kpi-val" style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>€{formatCents(totalCa)}</div>
          <div className="prod-kpi-sub" style={{ fontSize: 11, color: "var(--light)", marginTop: 3 }}>Cumul annuel</div>
        </div>
        <div className="prod-kpi" style={{ flex: 1, background: "white", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
          <div className="prod-kpi-label" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Nb SKUs</div>
          <div className="prod-kpi-val" style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{totalFormats}</div>
          <div className="prod-kpi-sub" style={{ fontSize: 11, color: "var(--light)", marginTop: 3 }}>Déclinées</div>
        </div>
        <div className="prod-kpi" style={{ flex: 1, background: "white", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
          <div className="prod-kpi-label" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Stock Total</div>
          <div className="prod-kpi-val" style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{totalStock}</div>
          <div className="prod-kpi-sub" style={{ fontSize: 11, color: "var(--light)", marginTop: 3 }}>Unités</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "14px 28px 0", flexShrink: 0 }}>
        <div className="tabs" style={{ display: "flex", background: "white", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: "7px 14px", border: "none", borderRight: "1px solid var(--border)", background: tab === t.key ? "#f1f5f9" : "transparent", fontSize: 12.5, color: tab === t.key ? "var(--text)" : "var(--muted)", cursor: "pointer", fontFamily: "Figtree, sans-serif", fontWeight: tab === t.key ? 600 : 500 }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", background: "white", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          <button onClick={() => setView("grid")} style={{ padding: "7px 10px", border: "none", background: view === "grid" ? "#f1f5f9" : "transparent", cursor: "pointer", display: "flex", color: view === "grid" ? "#374151" : "#94a3b8" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="4" height="4" rx="1" fill="currentColor" /><rect x="7" y="1" width="4" height="4" rx="1" fill="currentColor" /><rect x="1" y="7" width="4" height="4" rx="1" fill="currentColor" /><rect x="7" y="7" width="4" height="4" rx="1" fill="currentColor" /><rect x="13" y="1" width="2" height="10" rx="1" fill="currentColor" /><rect x="1" y="13" width="10" height="2" rx="1" fill="currentColor" /></svg>
          </button>
          <button onClick={() => setView("list")} style={{ padding: "7px 10px", border: "none", borderLeft: "1px solid var(--border)", background: view === "list" ? "#f1f5f9" : "transparent", cursor: "pointer", display: "flex", color: view === "list" ? "#374151" : "#94a3b8" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="9" y="3" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="prods-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, margin: "14px 28px 0" }}>
          {filtered.map((p) => (
            <div key={p.id} className="prod-card" style={{ background: "white", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", cursor: "pointer" }}>
              <div className="prod-card-visual" style={{ height: 110, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, background: p.visualBg, position: "relative" }}>
                {p.emoji}
              </div>
              <div className="prod-card-body" style={{ padding: 14 }}>
                <div className="prod-card-name" style={{ fontSize: 14.5, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{p.name}</div>
                <div className="prod-card-flavor" style={{ fontSize: 12, color: "var(--muted)", marginTop: 1, marginBottom: 10 }}>{p.flavor}</div>
                <span className="prod-card-cat" style={{ display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 10.5, fontWeight: 600, marginBottom: 10, background: p.visualBg, color: p.categoryColor }}>{p.category}</span>
                <div className="prod-formats" style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  {p.formats.slice(0, 3).map((f) => (
                    <div key={f.sku} className="prod-format" style={{ flex: 1, background: "#f8fafc", borderRadius: 7, padding: "7px 9px" }}>
                      <div className="prod-format-name" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 2 }}>{f.name}</div>
                      <div className="prod-format-sku" style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", marginBottom: 1 }}>{f.sku}</div>
                      <div className="prod-format-price" style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>€{f.price}</div>
                    </div>
                  ))}
                </div>
                <div className="prod-card-foot" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                  <div className="prod-ca" style={{ fontSize: 12, color: "var(--muted)" }}>
                    CA: <span style={{ fontWeight: 700, color: "var(--text)" }}>€{formatCents(p.ca)}</span>
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, padding: "2px 7px", borderRadius: 8, background: p.evolution >= 0 ? "#f0fdf4" : "#fef2f2", color: p.evolution >= 0 ? "#15803d" : "#dc2626" }}>
                    {p.evolution >= 0 ? "+" : ""}{p.evolution}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="comptes-table-wrap" style={{ margin: "14px 28px 0", background: "white", border: "1px solid var(--border)", borderRadius: 12, overflowX: "auto", flex: 1 }}>
          <table style={{ width: "100%", minWidth: 700, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--border)" }}>
                <th style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "11px 16px" }}>Produit</th>
                <th style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "11px 16px" }}>Catégorie</th>
                <th style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "11px 16px" }}>SKUs</th>
                <th style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "11px 16px" }}>CA</th>
                <th style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "11px 16px" }}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} style={{ cursor: "pointer", transition: "background 0.12s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                  <td style={{ padding: "11px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{p.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{p.flavor}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "11px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                    <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: p.visualBg, color: p.categoryColor }}>{p.category}</span>
                  </td>
                  <td style={{ padding: "11px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{p.formats.length}</span>
                    <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 4 }}>
                      ({p.formats.map((f) => f.name).join(", ")})
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>€{formatCents(p.ca)}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, marginLeft: 4, color: p.evolution >= 0 ? "var(--green)" : "var(--red)" }}>
                      {p.evolution >= 0 ? "+" : ""}{p.evolution}%
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", display: "inline-block", background: p.stock < 30 ? "var(--red)" : p.stock < 150 ? "var(--orange)" : "var(--green)" }} />
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{p.stock}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ margin: "14px 28px 24px", flexShrink: 0 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", margin: "0 0 14px" }}>Catégories</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {categories.map((cat) => (
            <div key={cat.name} className="cat-card" style={{ background: "white", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
              <div className="cat-header" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div className="cat-emoji" style={{ fontSize: 28, width: 44, height: 44, background: "#f8fafc", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{cat.emoji}</div>
                <div>
                  <div className="cat-name" style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>{cat.name}</div>
                  <div className="cat-count" style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 1 }}>{cat.count} produits</div>
                </div>
              </div>
              <div className="cat-ca" style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>€{formatCents(cat.ca)}</div>
              <div className="cat-evol" style={{ fontSize: 11.5, fontWeight: 700, marginTop: 1, color: cat.evolution >= 0 ? "var(--green)" : "var(--red)" }}>
                {cat.evolution >= 0 ? "+" : ""}{cat.evolution}%
              </div>
              <div className="cat-bar-wrap" style={{ height: 6, background: "#f1f5f9", borderRadius: 3, margin: "12px 0" }}>
                <div className="cat-bar" style={{ height: 6, borderRadius: 3, background: cat.color, width: `${Math.min(cat.evolution * 3 + 30, 100)}%` }} />
              </div>
              <div className="cat-prods" style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {cat.topProducts.map((p) => (
                  <div key={p.name} className="cat-prod-row" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                    <div className="cat-prod-dot" style={{ width: 9, height: 9, borderRadius: 3, background: p.color, flexShrink: 0 }} />
                    <span className="cat-prod-name" style={{ flex: 1, color: "var(--text)", fontWeight: 500 }}>{p.name}</span>
                    <span className="cat-prod-share" style={{ color: "var(--muted)", fontSize: 11.5 }}>{p.share}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
