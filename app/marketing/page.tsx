"use client";

import { useState } from "react";

type Campagne = {
  id: string;
  title: string;
  period: string;
  budget: number;
  status: "active" | "planning" | "done";
  progress: number;
  description: string;
};

type Dispositif = {
  id: string;
  name: string;
  description: string;
  type: string;
  available: boolean;
  icon: string;
};

type Animation = {
  id: string;
  title: string;
  date: string;
  location: string;
  type: string;
  status: "planifiée" | "confirmée" | "terminée";
  assignedTo: string;
};

const campagnes: Campagne[] = [
  { id: "C-001", title: "Campagne été 2024 — Sans sucre, sans limite", period: "Juin – Août 2024", budget: 18500, status: "active", progress: 65, description: "Campagne nationale grand public axée sur la fraîcheur et le lifestyle estival. Média : affichage digital, réseaux sociaux, PLV en magasin." },
  { id: "C-002", title: "Lancement nouvelles références Agrumes", period: "Mai – Juillet 2024", budget: 12000, status: "active", progress: 40, description: "Mise en avant des 3 nouvelles recettes agrumes (Citron Yuzu, Pamplemousse Rose, Orange Gingembre) en GMS et cavistes." },
  { id: "C-003", title: "Opération découverte cavistes indépendants", period: "Avril – Juin 2024", budget: 8400, status: "planning", progress: 0, description: "Offre de lancement dédiée aux cavistes de centre-ville : coffret découverte 6 bouteilles + présentoir offert." },
  { id: "C-004", title: "Campagne de Noël 2024", period: "Nov – Déc 2024", budget: 22400, status: "planning", progress: 0, description: "Campagne festive avec coffrets cadeaux, édition limitée et animations en point de vente. Budget inclut PLV et goodies." },
];

const dispositifs: Dispositif[] = [
  { id: "D-001", name: "Présentoir sol 6 faces VIVACE", description: "Display 6 colonnes pour bouteilles 75cl. Capacité 48 unités. Montage en 5 min. Carton rigide, impression quadri.", type: "Présentoir", available: true, icon: "🗃️" },
  { id: "D-002", name: "Kit PLV été — Stop rayon", description: "Stop rayon format A5 carton 400g avec visuel produit pleine gamme, double face. Version Agrumes, Fruits ou Mix.", type: "PLV", available: true, icon: "🪧" },
  { id: "D-003", name: "Affiche A2 été 2024", description: "Campagne estivale 'Sans sucre, sans limite'. Déclinaison portrait & paysage. Papier brillant 170g.", type: "Affichage", available: true, icon: "🖼️" },
  { id: "D-004", name: "Mini-display comptoir 6×33cl", description: "Présentoir plexiglas 30×20cm pour 6 packs 33cl. Idéal pour caisse, comptoir ou cave. Format épicerie fine.", type: "Présentoir", available: true, icon: "🧊" },
  { id: "D-005", name: "Tote bag VIVACE personnalisé", description: "Sac coton bio 42×38cm avec logo VIVACE. Lot de 50. Idéal événements et animations terrain.", type: "Goodie", available: false, icon: "🛍️" },
];

const animations: Animation[] = [
  { id: "AN-001", title: "Dégustation Marché Couvert — Bordeaux", date: "2024-06-15", location: "Bordeaux, Quartier Chartrons", type: "Dégustation", status: "confirmée", assignedTo: "Sophie M." },
  { id: "AN-002", title: "Animation caviste — À la Française", date: "2024-06-22", location: "Lyon, Presqu'île", type: "Atelier", status: "confirmée", assignedTo: "Thomas M." },
  { id: "AN-003", title: "Stand Festival de la Bière — Nantes", date: "2024-07-05", location: "Nantes, Cité des Congrès", type: "Stand", status: "planifiée", assignedTo: "Léa D." },
  { id: "AN-004", title: "Masterclass accords mets & bières", date: "2024-07-12", location: "Paris, Le Marais", type: "Masterclass", status: "planifiée", assignedTo: "Alexis B." },
  { id: "AN-005", title: "Opération portes ouvertes — Cave Coopérative", date: "2024-08-03", location: "Marseille, Cours Julien", type: "Événement", status: "planifiée", assignedTo: "Camille N." },
  { id: "AN-006", title: "Dégustation été — Galerie Marchande", date: "2024-08-17", location: "Toulouse, Centre-ville", type: "Dégustation", status: "planifiée", assignedTo: "Sophie M." },
];

const statusStyles: Record<string, { bg: string; color: string }> = {
  active: { bg: "#f0fdf4", color: "#15803d" },
  planning: { bg: "#fffbeb", color: "#b45309" },
  done: { bg: "#f1f5f9", color: "#64748b" },
};

const statusLabels: Record<string, string> = {
  active: "Active",
  planning: "En préparation",
  done: "Terminée",
};

const animStatusStyles: Record<string, { bg: string; color: string }> = {
  planifiée: { bg: "#fffbeb", color: "#b45309" },
  confirmée: { bg: "#eff6ff", color: "#1d4ed8" },
  terminée: { bg: "#f1f5f9", color: "#64748b" },
};

const tabs = [
  { key: "campagnes", label: "🎯 Campagnes trade", count: campagnes.length },
  { key: "dispositifs", label: "🤝 Dispositifs trade", count: dispositifs.length },
  { key: "animations", label: "📍 Animations terrain", count: animations.length },
];

const kpiData = [
  { label: "Campagnes actives", value: "2", evol: "+1", color: "var(--green)" },
  { label: "Animations planifiées", value: "6", evol: "+3", color: "var(--blue)" },
  { label: "Budget alloué (YTD)", value: "€48K", evol: "+12%", color: "var(--green)" },
  { label: "ROI moyen", value: "3.2x", evol: "+0.4x", color: "var(--purple)" },
];

export default function MarketingPage() {
  const [tab, setTab] = useState("campagnes");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div style={{ padding: "24px 28px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>Marketing & Trade Marketing</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "3px 0 0" }}>Campagnes, animations terrain et activations clients</p>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "var(--active)", border: "1px solid var(--active)", borderRadius: 8, fontSize: 12.5, color: "white", cursor: "pointer", fontFamily: "Figtree, sans-serif", fontWeight: 600 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            Nouvelle campagne
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, margin: "16px 28px 0", flexShrink: 0 }}>
        {kpiData.map((kpi) => (
          <div key={kpi.label} style={{ flex: 1, background: "white", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{kpi.value}</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: kpi.color }}>{kpi.evol}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, margin: "16px 28px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", background: "white", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: "7px 14px", border: "none", borderRight: "1px solid var(--border)", background: tab === t.key ? "#f1f5f9" : "transparent", fontSize: 12.5, color: tab === t.key ? "var(--text)" : "var(--muted)", cursor: "pointer", fontFamily: "Figtree, sans-serif", fontWeight: tab === t.key ? 600 : 500, whiteSpace: "nowrap" }}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>
      </div>

      <div style={{ margin: "14px 28px 24px", flex: 1, minHeight: 0 }}>
        {tab === "campagnes" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {campagnes.map((c) => (
              <div key={c.id} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", flex: 1 }}>{c.title}</div>
                  <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, marginLeft: 10, ...statusStyles[c.status] }}>
                    {statusLabels[c.status]}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 12, lineHeight: 1.5 }}>{c.description}</div>
                <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 12.5, color: "var(--muted)" }}>
                  <span>📅 {c.period}</span>
                  <span>💰 €{c.budget.toLocaleString()}</span>
                </div>
                {c.status === "active" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--muted)", marginBottom: 4 }}>
                      <span>Progression</span>
                      <span style={{ fontWeight: 600, color: "var(--text)" }}>{c.progress}%</span>
                    </div>
                    <div style={{ width: "100%", height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${c.progress}%`, height: 6, background: "var(--active)", borderRadius: 3 }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "dispositifs" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {dispositifs.map((d) => (
              <div key={d.id} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 12, padding: 18, display: "flex", gap: 14 }}>
                <div style={{ fontSize: 28, width: 44, height: 44, background: "#f8fafc", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{d.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{d.name}</div>
                    <span style={{ display: "inline-flex", padding: "2px 7px", borderRadius: 8, fontSize: 10.5, fontWeight: 600, background: d.available ? "#f0fdf4" : "#fef2f2", color: d.available ? "#15803d" : "#dc2626", marginLeft: 8 }}>
                      {d.available ? "En stock" : "Indisponible"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, marginBottom: 6 }}>{d.description}</div>
                  <div style={{ fontSize: 11.5, color: "var(--light)" }}>Type : {d.type}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "animations" && (
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 700, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "11px 16px" }}>Animation</th>
                  <th style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "11px 16px" }}>Date</th>
                  <th style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "11px 16px" }}>Lieu</th>
                  <th style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "11px 16px" }}>Type</th>
                  <th style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "11px 16px" }}>Statut</th>
                  <th style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "11px 16px" }}>Responsable</th>
                </tr>
              </thead>
              <tbody>
                {animations.map((a) => (
                  <tr key={a.id} style={{ cursor: "pointer", transition: "background 0.12s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                    <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{a.title}</div>
                    </td>
                    <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                      <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{a.date}</span>
                    </td>
                    <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>{a.location}</span>
                    </td>
                    <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                      <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: "#f1f5f9", color: "#64748b" }}>{a.type}</span>
                    </td>
                    <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                      <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700, ...animStatusStyles[a.status] }}>
                        {a.status}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                      <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{a.assignedTo}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
