"use client";

import { useState, useMemo } from "react";

type ActionItem = {
  id: string;
  description: string;
  company: string;
  icon: string;
  type: "Relance" | "Rendez-vous" | "Appel" | "Email";
  priority: "Haute" | "Moyenne" | "Basse";
  dueDate: string;
  status: "À faire" | "En cours" | "Terminée";
  assignedTo: string;
};

const actions: ActionItem[] = [
  { id: "A-001", description: "Relancer sur devis envoyé — pack Premium 6 mois", company: "Beauté Éclat", icon: "💄", type: "Relance", priority: "Haute", dueDate: "2024-06-05", status: "À faire", assignedTo: "Thomas M." },
  { id: "A-002", description: "Préparer proposition gamme Éco pour réassort", company: "GreenWave", icon: "🌱", type: "Rendez-vous", priority: "Haute", dueDate: "2024-06-07", status: "En cours", assignedTo: "Sophie M." },
  { id: "A-003", description: "Appel de suivi post-demo nouvelle référence", company: "TechNova", icon: "🖥️", type: "Appel", priority: "Moyenne", dueDate: "2024-06-10", status: "À faire", assignedTo: "Marc L." },
  { id: "A-004", description: "Envoyer catalogue été + conditions promo", company: "Maison&Co", icon: "🏠", type: "Email", priority: "Moyenne", dueDate: "2024-06-08", status: "Terminée", assignedTo: "Léa D." },
  { id: "A-005", description: "Relance client inactif — dernière commande il y a 90j", company: "SportFit", icon: "🏋️", type: "Relance", priority: "Haute", dueDate: "2024-06-03", status: "En cours", assignedTo: "Thomas M." },
  { id: "A-006", description: "Planifier rendez-vous bilan semestriel", company: "Saveurs du Monde", icon: "🍷", type: "Rendez-vous", priority: "Basse", dueDate: "2024-06-20", status: "À faire", assignedTo: "Alexis B." },
  { id: "A-007", description: "Appel confirmatif pour animation terrain juin", company: "Mode Urbaine", icon: "👟", type: "Appel", priority: "Moyenne", dueDate: "2024-06-12", status: "À faire", assignedTo: "Sophie M." },
  { id: "A-008", description: "Suivi devis formation équipe commerciale", company: "Art&Lumière", icon: "🪔", type: "Email", priority: "Basse", dueDate: "2024-06-18", status: "Terminée", assignedTo: "Camille N." },
  { id: "A-009", description: "Négociation conditions tarifaires N+1", company: "Éclat de Soie", icon: "🧣", type: "Rendez-vous", priority: "Haute", dueDate: "2024-06-06", status: "En cours", assignedTo: "Thomas M." },
  { id: "A-010", description: "Relance échantillons envoyés — pas de retour", company: "Zen & Co", icon: "🧘", type: "Relance", priority: "Moyenne", dueDate: "2024-06-14", status: "À faire", assignedTo: "Léa D." },
  { id: "A-011", description: "Mail d'introduction nouvelle gamme Sport", company: "EcoRider", icon: "🚲", type: "Email", priority: "Basse", dueDate: "2024-06-22", status: "À faire", assignedTo: "Marc L." },
  { id: "A-012", description: "Appel SAV — réclamation lot défectueux", company: "BioDelice", icon: "🥑", type: "Appel", priority: "Haute", dueDate: "2024-06-04", status: "Terminée", assignedTo: "Camille N." },
];

const typeColors: Record<string, { bg: string; color: string }> = {
  Relance: { bg: "#fff7ed", color: "#ea580c" },
  "Rendez-vous": { bg: "#eff6ff", color: "#1d4ed8" },
  Appel: { bg: "#faf5ff", color: "#7c3aed" },
  Email: { bg: "#f0fdf4", color: "#15803d" },
};

const priorityColors: Record<string, { bg: string; color: string }> = {
  Haute: { bg: "#fef2f2", color: "#dc2626" },
  Moyenne: { bg: "#fffbeb", color: "#b45309" },
  Basse: { bg: "#f1f5f9", color: "#64748b" },
};

const statusColors: Record<string, { bg: string; color: string }> = {
  "À faire": { bg: "#f8fafc", color: "#64748b" },
  "En cours": { bg: "#eff6ff", color: "#1d4ed8" },
  Terminée: { bg: "#f0fdf4", color: "#15803d" },
};

const filterTabs = [
  { key: "all", label: "Toutes" },
  { key: "À faire", label: "À faire" },
  { key: "En cours", label: "En cours" },
  { key: "Terminée", label: "Terminées" },
];

const PAGE_SIZE = 6;

export default function ActionsPage() {
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (tab === "all") return actions;
    return actions.filter((a) => a.status === tab);
  }, [tab]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div style={{ padding: "24px 28px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>Actions</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "3px 0 0" }}>Tâches et relances commerciales</p>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "var(--active)", border: "1px solid var(--active)", borderRadius: 8, fontSize: 12.5, color: "white", cursor: "pointer", fontFamily: "Figtree, sans-serif", fontWeight: 600 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            Nouvelle action
          </button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "16px 28px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", background: "white", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          {filterTabs.map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); setPage(0); }}
              style={{ padding: "7px 14px", border: "none", borderRight: "1px solid var(--border)", background: tab === t.key ? "#f1f5f9" : "transparent", fontSize: 12.5, color: tab === t.key ? "var(--text)" : "var(--muted)", cursor: "pointer", fontFamily: "Figtree, sans-serif", fontWeight: tab === t.key ? 600 : 500, whiteSpace: "nowrap" }}>
              {t.label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{filtered.length} action{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div style={{ margin: "14px 28px 24px", background: "white", border: "1px solid var(--border)", borderRadius: 12, overflowX: "auto", flex: 1 }}>
        <table style={{ width: "100%", minWidth: 800, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--border)" }}>
              <th style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "11px 16px" }}>Action</th>
              <th style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "11px 16px" }}>Compte</th>
              <th style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "11px 16px" }}>Type</th>
              <th style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "11px 16px" }}>Priorité</th>
              <th style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "11px 16px" }}>Échéance</th>
              <th style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, textAlign: "left", padding: "11px 16px" }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((a) => (
              <tr key={a.id} style={{ cursor: "pointer", transition: "background 0.12s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", maxWidth: 280 }}>{a.description}</div>
                  <div style={{ fontSize: 11, color: "var(--light)", marginTop: 2 }}>{a.assignedTo}</div>
                </td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{a.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{a.company}</span>
                  </div>
                </td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                  <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, ...typeColors[a.type] }}>
                    {a.type}
                  </span>
                </td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                  <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, ...priorityColors[a.priority] }}>
                    {a.priority}
                  </span>
                </td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                  <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{a.dueDate}</span>
                </td>
                <td style={{ padding: "13px 16px", borderBottom: "1px solid #f8fafc", verticalAlign: "middle" }}>
                  <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700, ...statusColors[a.status] }}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
                  Aucune action {tab !== "all" ? `(${tab.toLowerCase()})` : ""}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid var(--border)", fontSize: 12.5, color: "var(--muted)" }}>
            <span>{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} sur {filtered.length}</span>
            <div style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  style={{ padding: "4px 10px", borderRadius: 6, border: i === page ? "1px solid var(--active)" : "1px solid var(--border)", background: i === page ? "var(--active)" : "white", fontSize: 12, cursor: "pointer", fontFamily: "Figtree, sans-serif", color: i === page ? "white" : "var(--muted)" }}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
