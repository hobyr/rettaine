"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface CompteDetail {
  id: string;
  displayId: string;
  company: string;
  icon: string;
  statut: "premium" | "standard";
  email: string;
  phone: string;
  region: string;
  category: string;
  caTotal: number;
  panierMoyen: number;
  nbreCommandes: number;
  tauxRetention: number;
  rfmScore: number;
  rfmEvol: number;
  rfmCategory: "champion" | "loyal" | "risque" | "perdu";
  nps: number;
  rfm: { r: number; f: number; m: number };
  monthlyRevenue: number[];
  topProduits: { rank: number; name: string; ca: number; share: number }[];
  commandes: { reassort: number; nouvellesRef: number; delaiMoyen: number; tauxRetour: number };
  strengths: { label: string; delta: number }[];
}

const accounts: Record<string, CompteDetail> = {
  "001": {
    id: "C-001", displayId: "C-001", company: "Beauté Éclat", icon: "💄", statut: "premium",
    email: "contact@beaute-eclat.fr", phone: "01 23 45 67 89", region: "Paris, Île-de-France", category: "Cosmétique",
    caTotal: 12450, panierMoyen: 89, nbreCommandes: 140, tauxRetention: 68, rfmScore: 845, rfmEvol: 12, rfmCategory: "champion", nps: 72,
    rfm: { r: 4.5, f: 3.8, m: 4.2 },
    monthlyRevenue: [8200, 9100, 8700, 10200, 11500, 12450, 11800, 13100, 12800, 14200, 13800, 12450],
    topProduits: [
      { rank: 1, name: "Sérum Hydratation Intensive", ca: 4200, share: 33.7 },
      { rank: 2, name: "Crème Régénérante Nuit", ca: 3100, share: 24.9 },
      { rank: 3, name: "Nettoyant Douceur", ca: 1850, share: 14.9 },
    ],
    commandes: { reassort: 68, nouvellesRef: 32, delaiMoyen: 2.4, tauxRetour: 3.8 },
    strengths: [
      { label: "Panier moyen", delta: 12.4 },
      { label: "Taux de rétention", delta: 5.2 },
      { label: "CA mensuel", delta: 8.7 },
    ],
  },
  "002": {
    id: "C-002", displayId: "C-002", company: "TechNova", icon: "🖥️", statut: "standard",
    email: "ventes@technova.fr", phone: "04 72 34 56 78", region: "Lyon, Auvergne-Rhône-Alpes", category: "Électronique",
    caTotal: 5230, panierMoyen: 1250, nbreCommandes: 42, tauxRetention: 22, rfmScore: 312, rfmEvol: -18, rfmCategory: "perdu", nps: 34,
    rfm: { r: 1.8, f: 2.1, m: 3.5 },
    monthlyRevenue: [8900, 8200, 7500, 7100, 6800, 6200, 5800, 5400, 5100, 4900, 4600, 5230],
    topProduits: [
      { rank: 1, name: "Serveur Pro Rack XL", ca: 2100, share: 40.2 },
      { rank: 2, name: "Station de Travail WP", ca: 1450, share: 27.7 },
      { rank: 3, name: "Câblage CAT7 10m", ca: 680, share: 13.0 },
    ],
    commandes: { reassort: 35, nouvellesRef: 65, delaiMoyen: 4.1, tauxRetour: 8.5 },
    strengths: [
      { label: "Panier moyen", delta: -5.8 },
      { label: "Taux de rétention", delta: -12.3 },
      { label: "CA mensuel", delta: -8.1 },
    ],
  },
  "003": {
    id: "C-003", displayId: "C-003", company: "GreenWave", icon: "🌱", statut: "premium",
    email: "hello@greenwave-eco.fr", phone: "05 56 78 90 12", region: "Bordeaux, Nouvelle-Aquitaine", category: "Éco-responsable",
    caTotal: 8200, panierMoyen: 45, nbreCommandes: 182, tauxRetention: 55, rfmScore: 723, rfmEvol: 22, rfmCategory: "champion", nps: 68,
    rfm: { r: 3.9, f: 4.1, m: 3.2 },
    monthlyRevenue: [4100, 4600, 5200, 5800, 6100, 6500, 7000, 7400, 7600, 8000, 8100, 8200],
    topProduits: [
      { rank: 1, name: "Pack Découverte Zéro Déchet", ca: 2900, share: 35.4 },
      { rank: 2, name: "Recharge Concentrée Multi-usage", ca: 2100, share: 25.6 },
      { rank: 3, name: "Kit Compostage Balcon", ca: 1400, share: 17.1 },
    ],
    commandes: { reassort: 72, nouvellesRef: 28, delaiMoyen: 1.8, tauxRetour: 2.1 },
    strengths: [
      { label: "Nouvelles références", delta: 22.1 },
      { label: "Fidélité client", delta: 8.5 },
      { label: "Taux de recommandation", delta: 15.3 },
    ],
  },
  "004": {
    id: "C-004", displayId: "C-004", company: "Maison&Co", icon: "🏠", statut: "premium",
    email: "commercial@maisonco.fr", phone: "02 40 12 34 56", region: "Nantes, Pays de la Loire", category: "Décoration",
    caTotal: 45600, panierMoyen: 156, nbreCommandes: 292, tauxRetention: 78, rfmScore: 654, rfmEvol: 5, rfmCategory: "loyal", nps: 81,
    rfm: { r: 3.5, f: 3.2, m: 4.8 },
    monthlyRevenue: [38000, 39500, 40200, 41800, 42500, 43100, 43800, 44200, 44800, 45100, 45400, 45600],
    topProduits: [
      { rank: 1, name: "Canapé Modulable Oslo", ca: 15200, share: 33.3 },
      { rank: 2, name: "Table Basse Scandi", ca: 9800, share: 21.5 },
      { rank: 3, name: "Lampe Design Luna", ca: 6700, share: 14.7 },
    ],
    commandes: { reassort: 82, nouvellesRef: 18, delaiMoyen: 3.2, tauxRetour: 4.5 },
    strengths: [
      { label: "CA total", delta: 5.4 },
      { label: "Taux de rétention", delta: 2.1 },
      { label: "Satisfaction client", delta: 3.8 },
    ],
  },
  "005": {
    id: "C-005", displayId: "C-005", company: "SportFit", icon: "🏋️", statut: "standard",
    email: "sav@sportfit.fr", phone: "04 91 23 45 67", region: "Marseille, Provence-Alpes-Côte d'Azur", category: "Sport & Fitness",
    caTotal: 18700, panierMoyen: 67, nbreCommandes: 279, tauxRetention: 45, rfmScore: 523, rfmEvol: -2, rfmCategory: "risque", nps: 45,
    rfm: { r: 2.8, f: 3.5, m: 2.9 },
    monthlyRevenue: [17500, 18000, 18200, 17900, 17600, 18100, 18500, 18800, 18600, 18400, 18700, 18700],
    topProduits: [
      { rank: 1, name: "Legging Performance Pro", ca: 6800, share: 36.4 },
      { rank: 2, name: "Tapis de Yoga Premium", ca: 4200, share: 22.5 },
      { rank: 3, name: "Set Élastiques Résistance", ca: 3100, share: 16.6 },
    ],
    commandes: { reassort: 58, nouvellesRef: 42, delaiMoyen: 2.9, tauxRetour: 6.2 },
    strengths: [
      { label: "Nouveaux produits", delta: 4.3 },
      { label: "Panier moyen", delta: -1.8 },
      { label: "Rétention", delta: -5.5 },
    ],
  },
};

function getDefaultDetail(): CompteDetail {
  return accounts["001"];
}

function drawChart(
  canvas: HTMLCanvasElement,
  data: number[],
  color: string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  const w = rect.width;
  const h = rect.height;

  ctx.clearRect(0, 0, w, h);
  if (data.length < 2) return;

  const pad = { top: 8, bottom: 20, left: 40, right: 8 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const max = Math.max(...data) * 1.1;
  const min = 0;
  const range = max - min || 1;
  const stepX = chartW / (data.length - 1);

  const labels = ["Juil", "Août", "Sep", "Oct", "Nov", "Déc", "Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#94a3b8";
  ctx.font = "10px Figtree, sans-serif";
  ctx.textAlign = "right";
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    const val = Math.round(max - (range / 4) * i);
    ctx.fillText("€" + val.toLocaleString(), pad.left - 6, y + 3);
  }

  const gradient = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
  gradient.addColorStop(0, color + "33");
  gradient.addColorStop(1, color + "00");

  ctx.beginPath();
  data.forEach((val, i) => {
    const x = pad.left + i * stepX;
    const y = pad.top + chartH - ((val - min) / range) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  const lastX = pad.left + (data.length - 1) * stepX;
  ctx.lineTo(lastX, pad.top + chartH);
  ctx.lineTo(pad.left, pad.top + chartH);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  data.forEach((val, i) => {
    const x = pad.left + i * stepX;
    const y = pad.top + chartH - ((val - min) / range) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  data.forEach((val, i) => {
    const x = pad.left + i * stepX;
    const y = pad.top + chartH - ((val - min) / range) * chartH;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  ctx.fillStyle = "#94a3b8";
  ctx.font = "10px Figtree, sans-serif";
  ctx.textAlign = "center";
  data.forEach((_, i) => {
    const x = pad.left + i * stepX;
    ctx.fillText(labels[i] || "", x, h - 4);
  });
}

export default function CompteDetailPage() {
  const params = useParams<{ id: string }>();
  const account = accounts[params.id] || getDefaultDetail();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartTab, setChartTab] = useState<"12m" | "6m" | "3m">("12m");

  const chartData =
    chartTab === "12m"
      ? account.monthlyRevenue
      : chartTab === "6m"
        ? account.monthlyRevenue.slice(-6)
        : account.monthlyRevenue.slice(-3);

  useEffect(() => {
    if (canvasRef.current) {
      drawChart(canvasRef.current, chartData, "#2563eb");
    }
  }, [chartData, chartTab]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div className="compte-topbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px 0", flexShrink: 0 }}>
        <div className="breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--muted)" }}>
          <Link href="/comptes" style={{ color: "var(--muted)", cursor: "pointer", textDecoration: "none" }}>
            Comptes
          </Link>
          <span>&gt;</span>
          <span style={{ color: "var(--text)" }}>{account.company}</span>
        </div>
      </div>

      <div className="compte-header" style={{ padding: "14px 28px 0", flexShrink: 0 }}>
        <div className="compte-title-row" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7, flexWrap: "wrap" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
            {account.icon}
          </div>
          <h1 className="compte-title" style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>
            {account.company}
          </h1>
          <span className="tag" style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, border: "1px solid", background: account.statut === "premium" ? "#f0fdf4" : "#f8fafc", color: account.statut === "premium" ? "#15803d" : "#64748b", borderColor: account.statut === "premium" ? "#bbf7d0" : "#e2e8f0" }}>
            {account.statut === "premium" ? "Premium" : "Standard"}
          </span>
        </div>

        <div className="compte-meta" style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: "var(--muted)", flexWrap: "wrap" }}>
          <span className="compte-meta-item" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2 4L8 7L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 8L8 11L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12L8 15L14 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {account.email}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2 4C2 2.89543 2.89543 2 4 2H5.5C5.77614 2 6 2.22386 6 2.5V5.5C6 5.77614 5.77614 6 5.5 6H4C4 10 6 12 10 12V10.5C10 10.2239 10.2239 10 10.5 10H13.5C13.7761 10 14 10.2239 14 10.5V12C14 13.1046 13.1046 14 12 14H11C6.02944 14 2 9.97056 2 5V4Z" stroke="currentColor" strokeWidth="1.5"/></svg>
            {account.phone}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1C4.68629 1 2 3.68629 2 7C2 11 8 15 8 15C8 15 14 11 14 7C14 3.68629 11.3137 1 8 1Z" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="7" r="2" stroke="currentColor" strokeWidth="1.5"/></svg>
            {account.region}
          </span>
        </div>

        <div className="compte-actions-row" style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
          <button className="btn-outline" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", background: "white", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5, color: "#374151", cursor: "pointer", fontFamily: "Figtree, sans-serif", fontWeight: 500 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11 2H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M11 1H5V3H11V1Z" stroke="currentColor" strokeWidth="1.5"/></svg>
            Modifier
          </button>
          <button className="btn-outline" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", background: "white", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12.5, color: "#374151", cursor: "pointer", fontFamily: "Figtree, sans-serif", fontWeight: 500 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4L8 7L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 8L8 11L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12L8 15L14 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Contacter
          </button>
          <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", background: "var(--active)", border: "1px solid var(--active)", borderRadius: 8, fontSize: 12.5, color: "white", cursor: "pointer", fontFamily: "Figtree, sans-serif", fontWeight: 600 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M4 4V3C4 1.89543 4.89543 1 6 1H10C11.1046 1 12 1.89543 12 3V4" stroke="currentColor" strokeWidth="1.5"/></svg>
            Voir les commandes
          </button>
        </div>
      </div>

      <div className="compte-kpi-bar" style={{ display: "flex", margin: "14px 28px 0", background: "white", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
        <div className="compte-kpi" style={{ flex: 1, padding: "13px 14px", borderRight: "1px solid var(--border)" }}>
          <div className="ck-label" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>CA Total</div>
          <div className="ck-val" style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>€{account.caTotal.toLocaleString()}</div>
        </div>
        <div className="compte-kpi" style={{ flex: 1, padding: "13px 14px", borderRight: "1px solid var(--border)" }}>
          <div className="ck-label" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>Panier Moyen</div>
          <div className="ck-val" style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>€{account.panierMoyen}</div>
        </div>
        <div className="compte-kpi" style={{ flex: 1, padding: "13px 14px", borderRight: "1px solid var(--border)" }}>
          <div className="ck-label" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>Nbre Commandes</div>
          <div className="ck-val" style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{account.nbreCommandes}</div>
        </div>
        <div className="compte-kpi" style={{ flex: 1, padding: "13px 14px", borderRight: "1px solid var(--border)" }}>
          <div className="ck-label" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>Taux Rétention</div>
          <div className="ck-val" style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{account.tauxRetention}%</div>
        </div>
        <div className="compte-kpi" style={{ flex: 1, padding: "13px 14px", borderRight: "1px solid var(--border)" }}>
          <div className="ck-label" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>Score RFM</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="ck-val" style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{account.rfmScore}</span>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: account.rfmEvol >= 0 ? "var(--green)" : "var(--red)" }}>
              {account.rfmEvol >= 0 ? "+" : ""}{account.rfmEvol}%
            </span>
          </div>
        </div>
        <div className="compte-kpi" style={{ flex: 1, padding: "13px 14px" }}>
          <div className="ck-label" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>NPS</div>
          <div className="ck-val" style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{account.nps}</div>
        </div>
      </div>

      <div className="charts-row" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: 14, margin: "14px 28px 0", flexShrink: 0 }}>
        <div className="chart-card" style={{ background: "white", border: "1px solid var(--border)", borderRadius: 12, padding: 18, overflow: "hidden" }}>
          <div className="chart-title-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span className="chart-title" style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>Évolution du CA</span>
            <div className="chart-tabs" style={{ display: "flex", gap: 0, background: "#f1f5f9", borderRadius: 7, overflow: "hidden", padding: 2 }}>
              {(["12m", "6m", "3m"] as const).map((t) => (
                <button key={t} onClick={() => setChartTab(t)}
                  style={{ padding: "4px 11px", border: "none", background: chartTab === t ? "white" : "transparent", fontSize: 11.5, color: chartTab === t ? "var(--text)" : "var(--muted)", cursor: "pointer", borderRadius: 5, fontFamily: "Figtree, sans-serif", fontWeight: chartTab === t ? 600 : 500, boxShadow: chartTab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <canvas ref={canvasRef} style={{ width: "100%", height: 180 }} />
        </div>

        <div className="chart-card" style={{ background: "white", border: "1px solid var(--border)", borderRadius: 12, padding: 18, overflow: "hidden" }}>
          <div className="chart-title-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span className="chart-title" style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>Score RFM</span>
          </div>
          <div className="rfm-scores" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Récence", value: account.rfm.r, max: 5 },
              { label: "Fréquence", value: account.rfm.f, max: 5 },
              { label: "Montant", value: account.rfm.m, max: 5 },
            ].map((dim) => (
              <div key={dim.label} className="rfm-row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: "var(--muted)", width: 80, flexShrink: 0 }}>{dim.label}</span>
                <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 3, position: "relative" }}>
                  <div style={{ width: `${(dim.value / dim.max) * 100}%`, height: 6, background: "var(--active)", borderRadius: 3, transition: "width 0.5s" }} />
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)", minWidth: 24, textAlign: "right" }}>{dim.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span className="rfm-status-tag" style={{ display: "inline-block", padding: "3px 9px", borderRadius: 6, fontSize: 11.5, fontWeight: 600, background: account.rfmCategory === "champion" ? "#eff6ff" : account.rfmCategory === "loyal" ? "#f0fdf4" : account.rfmCategory === "risque" ? "#fff7ed" : "#fef2f2", color: account.rfmCategory === "champion" ? "#1d4ed8" : account.rfmCategory === "loyal" ? "#15803d" : account.rfmCategory === "risque" ? "#ea580c" : "#dc2626" }}>
              {account.rfmCategory === "champion" ? "Champion" : account.rfmCategory === "loyal" ? "Loyal" : account.rfmCategory === "risque" ? "À risque" : "Perdu"}
            </span>
            <span style={{ fontSize: 11.5, color: account.rfmEvol >= 0 ? "var(--green)" : "var(--red)", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              {account.rfmEvol >= 0 ? "↑" : "↓"} {Math.abs(account.rfmEvol)}% vs période précédente
            </span>
          </div>
        </div>
      </div>

      <div className="bottom-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "14px 28px 24px", flexShrink: 0 }}>
        <div className="bottom-card" style={{ background: "white", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
          <div className="bottom-title" style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>Top Produits</div>
          <table className="products-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "0 0 8px", borderBottom: "1px solid var(--border)" }}>#</th>
                <th style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "0 0 8px", borderBottom: "1px solid var(--border)" }}>Produit</th>
                <th style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "0 0 8px", borderBottom: "1px solid var(--border)" }}>CA</th>
                <th style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "0 0 8px", borderBottom: "1px solid var(--border)" }}>Part</th>
              </tr>
            </thead>
            <tbody>
              {account.topProduits.map((p) => (
                <tr key={p.rank}>
                  <td style={{ fontSize: 12.5, padding: "8px 0", borderBottom: "1px solid #f8fafc", verticalAlign: "middle", color: "var(--muted)", width: 18 }}>{p.rank}</td>
                  <td style={{ fontSize: 12.5, padding: "8px 0", borderBottom: "1px solid #f8fafc", verticalAlign: "middle", color: "var(--text)", fontWeight: 600 }}>{p.name}</td>
                  <td style={{ fontSize: 12.5, padding: "8px 0", borderBottom: "1px solid #f8fafc", verticalAlign: "middle", color: "var(--text)" }}>€{p.ca.toLocaleString()}</td>
                  <td style={{ fontSize: 12.5, padding: "8px 0", borderBottom: "1px solid #f8fafc", verticalAlign: "middle", color: "var(--text)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{p.share}%</span>
                      <div style={{ width: 50, height: 4, background: "#f1f5f9", borderRadius: 2 }}>
                        <div style={{ width: `${p.share}%`, height: 4, background: "var(--active)", borderRadius: 2 }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="see-all" style={{ textAlign: "center", fontSize: 12.5, color: "var(--blue)", fontWeight: 600, cursor: "pointer", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
            Voir tous les produits →
          </div>
        </div>

        <div className="bottom-card" style={{ background: "white", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
          <div className="bottom-title" style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>Commandes</div>
          <div className="cmd-total" style={{ marginBottom: 14 }}>
            <div className="cmd-total-label" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Répartition</div>
            <div className="cmd-total-val" style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>{account.nbreCommandes} commandes</div>
            <div className="split-bar" style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 2, marginBottom: 8 }}>
              <div style={{ width: `${account.commandes.reassort}%`, height: "100%", background: "var(--active)", borderRadius: 3 }} />
              <div style={{ width: `${account.commandes.nouvellesRef}%`, height: "100%", background: "#93c5fd", borderRadius: 3 }} />
            </div>
            <div className="split-legend" style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--muted)" }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--active)", flexShrink: 0 }} />
                Réassort ({account.commandes.reassort}%)
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--muted)" }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: "#93c5fd", flexShrink: 0 }} />
                Nouvelles réf ({account.commandes.nouvellesRef}%)
              </div>
            </div>
          </div>
          <div className="cmd-metrics" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
            <div className="cmd-metric" style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px" }}>
              <div className="cmd-metric-label" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 3 }}>Délai moyen</div>
              <div className="cmd-metric-val" style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{account.commandes.delaiMoyen} jours</div>
              <div className="cmd-metric-sub" style={{ fontSize: 10, color: "var(--light)", marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>vs 3.1j moy. catégorie</div>
            </div>
            <div className="cmd-metric" style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px" }}>
              <div className="cmd-metric-label" style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 3 }}>Taux de retour</div>
              <div className="cmd-metric-val" style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{account.commandes.tauxRetour}%</div>
              <div className="cmd-metric-sub" style={{ fontSize: 10, color: "var(--light)", marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>vs 5.2% moy. catégorie</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ margin: "0 28px 28px", flexShrink: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Forces & Faiblesses</div>
        {account.strengths.map((s) => (
          <div key={s.label} className="strength-row" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text)", flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: s.delta >= 0 ? "var(--green)" : "var(--red)" }}>
              {s.delta >= 0 ? "+" : ""}{s.delta}%
            </span>
            <div style={{ width: 80, height: 4, background: "#f1f5f9", borderRadius: 2 }}>
              <div style={{ width: `${Math.min(Math.abs(s.delta) * 3, 100)}%`, height: 4, background: s.delta >= 0 ? "var(--green)" : "var(--red)", borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
