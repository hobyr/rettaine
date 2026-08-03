"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AnalysisKpi = {
  active_accounts: number;
  ytd_turnover: number;
  ytd_turnover_previous_year: number;
  ytd_growth_pct: number;
  active_accounts_count: number;
  new_clients_count: number;
  lost_clients_count: number;
};

type RfmSegmentRow = {
  rfm_segment: string;
  account_count: number;
  account_percentage: number;
  ytd_turnover: number;
};

type TopAccount = {
  rank: number;
  account_number: string;
  account_name: string;
  ytd_turnover: number;
  ytd_growth_pct: number;
};

type TopProduct = {
  rank: number;
  sku: string;
  product_name: string;
  ytd_turnover: number;
  ytd_growth_pct: number;
};

type PenetrationRow = {
  rank: number;
  sku: string;
  product_name: string;
  buying_accounts_count: number;
  active_accounts_count: number;
  penetration_rate_pct: number;
};

const rfmSegmentStyles: Record<string, { background: string; color: string }> = {
  VIP: { background: "#eff6ff", color: "#1d4ed8" },
  Loyal: { background: "#f0fdf4", color: "#15803d" },
  Regular: { background: "#f0fdf9", color: "#0f766e" },
  "At Risk": { background: "#fff7ed", color: "#ea580c" },
  Dormant: { background: "#fef2f2", color: "#dc2626" },
  "New / Potential": { background: "#faf5ff", color: "#7c3aed" },
};

function formatEur(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatPct(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  const sign = n >= 0 ? "+" : "";
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(n);
  return `${sign}${formatted}%`;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 28, marginBottom: 14, paddingLeft: 28 }}>
      {children}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 12, padding: 18, ...style }}>
      {children}
    </div>
  );
}

function TopAccountRow({ account, index, mode }: { account: TopAccount; index: number; mode: "ca" | "bar" }) {
  const growthColor = account.ytd_growth_pct >= 0 ? "var(--green)" : "var(--red)";
  return (
    <div
      onClick={() => (window.location.href = `/comptes/${account.account_number}`)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 6px",
        margin: "-4px -6px",
        borderRadius: 8,
        cursor: "pointer",
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ fontSize: 11, color: "var(--muted)", width: 16, fontWeight: 600, flexShrink: 0 }}>{index + 1}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {account.account_name}
        </div>
        <div style={{ fontSize: 10, color: "var(--light)" }}>{account.account_number}</div>
      </div>
      {mode === "bar" && (
        <div style={{ width: 60, height: 4, background: "#f1f5f9", borderRadius: 2, flexShrink: 0 }}>
          <div style={{ width: `${Math.min(Math.abs(account.ytd_growth_pct) * 2, 100)}%`, height: 4, background: growthColor, borderRadius: 2 }} />
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, minWidth: mode === "ca" ? 96 : 48 }}>
        <span style={{ fontSize: mode === "ca" ? 13 : 12, fontWeight: 700, color: mode === "ca" ? "var(--text)" : growthColor, whiteSpace: "nowrap" }}>
          {mode === "ca" ? formatEur(account.ytd_turnover) : formatPct(account.ytd_growth_pct)}
        </span>
        {mode === "ca" && (
          <span style={{ fontSize: 11, fontWeight: 600, color: growthColor, whiteSpace: "nowrap" }}>
            {formatPct(account.ytd_growth_pct)}
          </span>
        )}
      </div>
    </div>
  );
}

function ProductRow({ product, index }: { product: TopProduct; index: number }) {
  const color = product.ytd_growth_pct >= 0 ? "var(--green)" : "var(--red)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11, color: "var(--muted)", width: 16, fontWeight: 600, flexShrink: 0 }}>{index + 1}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {product.product_name.trim()}
        </div>
        <div style={{ fontSize: 10, color: "var(--light)" }}>{product.sku}</div>
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, flexShrink: 0, whiteSpace: "nowrap" }}>
        {formatPct(product.ytd_growth_pct)}
      </span>
    </div>
  );
}

export default function AnalysePage() {
  const [kpi, setKpi] = useState<AnalysisKpi | null>(null);
  const [rfm, setRfm] = useState<RfmSegmentRow[]>([]);
  const [topCa, setTopCa] = useState<TopAccount[]>([]);
  const [topGrowth, setTopGrowth] = useState<TopAccount[]>([]);
  const [topDecline, setTopDecline] = useState<TopAccount[]>([]);
  const [topProductsGrowth, setTopProductsGrowth] = useState<TopProduct[]>([]);
  const [topProductsDecline, setTopProductsDecline] = useState<TopProduct[]>([]);
  const [penetration, setPenetration] = useState<PenetrationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.rpc("get_dashboard_analysis_kpi"),
      supabase.rpc("get_dashboard_rfm_matrix"),
      supabase.rpc("get_dashboard_top_accounts_by_turnover"),
      supabase.rpc("get_dashboard_top_accounts_growth"),
      supabase.rpc("get_dashboard_top_accounts_decline"),
      supabase.rpc("get_dashboard_top_products_growth"),
      supabase.rpc("get_dashboard_top_products_decline"),
      supabase.rpc("get_dashboard_product_penetration"),
    ]).then((results) => {
      const [k, r, ca, g, d, pg, pd, pn] = results;
      if (!k.error && k.data) setKpi(k.data[0] as AnalysisKpi);
      if (!r.error && r.data) setRfm(r.data as RfmSegmentRow[]);
      if (!ca.error && ca.data) setTopCa(ca.data as TopAccount[]);
      if (!g.error && g.data) setTopGrowth(g.data as TopAccount[]);
      if (!d.error && d.data) setTopDecline(d.data as TopAccount[]);
      if (!pg.error && pg.data) setTopProductsGrowth(pg.data as TopProduct[]);
      if (!pd.error && pd.data) setTopProductsDecline(pd.data as TopProduct[]);
      if (!pn.error && pn.data) setPenetration(pn.data as PenetrationRow[]);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100%" }}>
        <span style={{ color: "var(--muted)", fontSize: 13 }}>Chargement de l&apos;analyse…</span>
      </div>
    );
  }

  const activeAccounts = kpi?.active_accounts_count ?? kpi?.active_accounts ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div style={{ padding: "24px 28px 0", flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>Analyse</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "3px 0 0" }}>Performance portefeuille · année en cours</p>
        </div>
      </div>

      <div
        className="compte-kpi-bar"
        style={{ display: "flex", margin: "14px 28px 0", background: "white", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", flexShrink: 0 }}
      >
        <div className="compte-kpi" style={{ flex: 1, padding: "13px 14px", borderRight: "1px solid var(--border)" }}>
          <div className="ck-label" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>Comptes actifs</div>
          <div className="ck-val" style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
            {activeAccounts}
          </div>
        </div>
        <div className="compte-kpi" style={{ flex: 1, padding: "13px 14px", borderRight: "1px solid var(--border)" }}>
          <div className="ck-label" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>CA portefeuille YTD</div>
          <div className="ck-val" style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
            {kpi ? formatEur(kpi.ytd_turnover) : "—"}
          </div>
        </div>
        <div className="compte-kpi" style={{ flex: 1, padding: "13px 14px", borderRight: "1px solid var(--border)" }}>
          <div className="ck-label" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>Croissance vs N-1</div>
          <div className="ck-val" style={{ fontSize: 16, fontWeight: 800, color: kpi && kpi.ytd_growth_pct >= 0 ? "var(--green)" : "var(--red)", letterSpacing: "-0.02em" }}>
            {kpi ? formatPct(kpi.ytd_growth_pct) : "—"}
          </div>
          {kpi && (
            <div style={{ fontSize: 10.5, fontWeight: 600, marginTop: 2, color: kpi.ytd_growth_pct >= 0 ? "var(--green)" : "var(--red)" }}>
              {formatEur(kpi.ytd_turnover - kpi.ytd_turnover_previous_year)} vs N-1
            </div>
          )}
        </div>
        <div className="compte-kpi" style={{ flex: 1, padding: "13px 14px" }}>
          <div className="ck-label" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>Comptes perdus</div>
          <div className="ck-val" style={{ fontSize: 16, fontWeight: 800, color: "var(--red)", letterSpacing: "-0.02em" }}>
            {kpi ? kpi.lost_clients_count : "—"}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 28px", flexShrink: 0 }}>
        <SectionTitle>👥 CLIENTS</SectionTitle>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Card>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
              Matrice RFM — {activeAccounts} comptes segmentés
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {rfm.map((seg) => {
                const st = rfmSegmentStyles[seg.rfm_segment] ?? rfmSegmentStyles.Regular;
                return (
                  <div key={seg.rfm_segment}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: st.color, flexShrink: 0 }} />
                        {seg.rfm_segment}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", whiteSpace: "nowrap" }}>
                        {seg.account_count} · {seg.account_percentage}% · {formatEur(seg.ytd_turnover)}
                      </span>
                    </div>
                    <div style={{ width: "100%", height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${seg.account_percentage}%`, height: 8, background: st.color, borderRadius: 4, transition: "width 0.5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>🏆 Top 5 comptes — CA</div>
              <span style={{ fontSize: 11.5, color: "var(--blue)", fontWeight: 600, cursor: "pointer" }} onClick={() => (window.location.href = "/comptes")}>
                Voir plus →
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topCa.map((a, i) => (
                <TopAccountRow key={a.account_number} account={a} index={i} mode="ca" />
              ))}
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>🚀 Ont dépassé N-1 — top 5</div>
              <span style={{ fontSize: 11.5, color: "var(--blue)", fontWeight: 600, cursor: "pointer" }} onClick={() => (window.location.href = "/comptes")}>
                Voir plus →
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topGrowth.length === 0 ? (
                <div style={{ fontSize: 12.5, color: "var(--muted)", padding: "12px 0", textAlign: "center" }}>Aucun compte en progression</div>
              ) : (
                topGrowth.map((a, i) => <TopAccountRow key={a.account_number} account={a} index={i} mode="bar" />)
              )}
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>🔻 En retard sur N-1 — top 5</div>
              <span style={{ fontSize: 11.5, color: "var(--blue)", fontWeight: 600, cursor: "pointer" }} onClick={() => (window.location.href = "/comptes")}>
                Voir plus →
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topDecline.length === 0 ? (
                <div style={{ fontSize: 12.5, color: "var(--muted)", padding: "12px 0", textAlign: "center" }}>Aucun compte en retard</div>
              ) : (
                topDecline.map((a, i) => <TopAccountRow key={a.account_number} account={a} index={i} mode="bar" />)
              )}
            </div>
          </Card>
        </div>
      </div>

      <div style={{ padding: "0 28px 24px", flexShrink: 0 }}>
        <SectionTitle>📦 PRODUITS</SectionTitle>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>🔥 Fonctionnent fort vs N-1</div>
              <span style={{ fontSize: 11.5, color: "var(--blue)", fontWeight: 600, cursor: "pointer" }} onClick={() => (window.location.href = "/produits")}>
                Voir plus →
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topProductsGrowth.length === 0 ? (
                <div style={{ fontSize: 12.5, color: "var(--muted)", padding: "12px 0", textAlign: "center" }}>Aucune donnée</div>
              ) : (
                topProductsGrowth.map((p, i) => <ProductRow key={p.sku} product={p} index={i} />)
              )}
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>🔻 Moins bien vs N-1 — bottom 10</div>
              <span style={{ fontSize: 11.5, color: "var(--blue)", fontWeight: 600, cursor: "pointer" }} onClick={() => (window.location.href = "/produits")}>
                Voir plus →
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topProductsDecline.length === 0 ? (
                <div style={{ fontSize: 12.5, color: "var(--muted)", padding: "12px 0", textAlign: "center" }}>Tous les produits sont en progression</div>
              ) : (
                topProductsDecline.map((p, i) => <ProductRow key={p.sku} product={p} index={i} />)
              )}
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
              📊 Taux de pénétration — % des {activeAccounts} comptes qui référencent le produit
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {penetration.map((p) => (
                <div key={p.sku}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.product_name.trim()}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--light)" }}>{p.sku}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", minWidth: 32, textAlign: "right", flexShrink: 0 }}>
                      {p.penetration_rate_pct}%
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${p.penetration_rate_pct}%`, height: 6, background: "var(--active)", borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
