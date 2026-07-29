export type Compte = {
  id: string;
  displayId: string;
  company: string;
  icon: string;
  statut: "premium" | "standard";
  rfm: { score: number; label: string; category: "champion" | "loyal" | "risque" | "perdu" };
  ca: number;
  caEvolution: number;
  nps: number;
  email: boolean;
};

export const accounts: Compte[] = [
  { id: "C-001", displayId: "C-001", company: "Beauté Éclat", icon: "💄", statut: "premium", rfm: { score: 845, label: "Champion", category: "champion" }, ca: 12450, caEvolution: 12.5, nps: 72, email: true },
  { id: "C-002", displayId: "C-002", company: "TechNova", icon: "🖥️", statut: "standard", rfm: { score: 312, label: "Perdu", category: "perdu" }, ca: 5230, caEvolution: -8.3, nps: 34, email: true },
  { id: "C-003", displayId: "C-003", company: "GreenWave", icon: "🌱", statut: "premium", rfm: { score: 723, label: "Prometteur", category: "champion" }, ca: 8200, caEvolution: 22.1, nps: 68, email: true },
  { id: "C-004", displayId: "C-004", company: "Maison&Co", icon: "🏠", statut: "premium", rfm: { score: 654, label: "Loyal", category: "loyal" }, ca: 45600, caEvolution: 5.4, nps: 81, email: true },
  { id: "C-005", displayId: "C-005", company: "SportFit", icon: "🏋️", statut: "standard", rfm: { score: 523, label: "À risque", category: "risque" }, ca: 18700, caEvolution: -2.1, nps: 45, email: false },
  { id: "C-006", displayId: "C-006", company: "Saveurs du Monde", icon: "🍷", statut: "premium", rfm: { score: 891, label: "Champion", category: "champion" }, ca: 32100, caEvolution: 18.7, nps: 88, email: true },
  { id: "C-007", displayId: "C-007", company: "Zen & Co", icon: "🧘", statut: "standard", rfm: { score: 432, label: "À risque", category: "risque" }, ca: 6750, caEvolution: -5.9, nps: 39, email: true },
  { id: "C-008", displayId: "C-008", company: "Mode Urbaine", icon: "👟", statut: "premium", rfm: { score: 767, label: "Loyal", category: "loyal" }, ca: 28300, caEvolution: 9.2, nps: 76, email: true },
  { id: "C-009", displayId: "C-009", company: "BioDelice", icon: "🥑", statut: "standard", rfm: { score: 289, label: "Perdu", category: "perdu" }, ca: 3400, caEvolution: -15.4, nps: 22, email: false },
  { id: "C-010", displayId: "C-010", company: "Art&Lumière", icon: "🪔", statut: "premium", rfm: { score: 812, label: "Champion", category: "champion" }, ca: 19500, caEvolution: 14.8, nps: 85, email: true },
  { id: "C-011", displayId: "C-011", company: "Petit Patron", icon: "👔", statut: "standard", rfm: { score: 498, label: "À risque", category: "risque" }, ca: 8900, caEvolution: 3.2, nps: 51, email: true },
  { id: "C-012", displayId: "C-012", company: "Cosy Home", icon: "🛋️", statut: "standard", rfm: { score: 610, label: "Loyal", category: "loyal" }, ca: 14700, caEvolution: 7.6, nps: 63, email: true },
  { id: "C-013", displayId: "C-013", company: "EcoRider", icon: "🚲", statut: "premium", rfm: { score: 701, label: "Champion", category: "champion" }, ca: 11200, caEvolution: 31.2, nps: 79, email: true },
  { id: "C-014", displayId: "C-014", company: "PureWave", icon: "🎧", statut: "standard", rfm: { score: 345, label: "Perdu", category: "perdu" }, ca: 2100, caEvolution: -22.8, nps: 18, email: false },
  { id: "C-015", displayId: "C-015", company: "Éclat de Soie", icon: "🧣", statut: "premium", rfm: { score: 834, label: "Champion", category: "champion" }, ca: 38900, caEvolution: 11.3, nps: 90, email: true },
  { id: "C-016", displayId: "C-016", company: "Jardin Bio", icon: "🌻", statut: "standard", rfm: { score: 567, label: "À risque", category: "risque" }, ca: 7600, caEvolution: -1.5, nps: 48, email: true },
];

export type Produit = {
  id: string;
  name: string;
  flavor: string;
  emoji: string;
  category: string;
  categoryColor: string;
  formats: { name: string; sku: string; price: number }[];
  ca: number;
  evolution: number;
  stock: number;
  badge?: "new" | "hot" | "eco";
  visualBg: string;
  penetration: number;
};

export const produits: Produit[] = [
  { id: "P-001", name: "Sérum Hydratation Intensive", flavor: "Vitamine C + Acide Hyaluronique", emoji: "✨", category: "Soins", categoryColor: "#3b82f6", formats: [{ name: "30ml", sku: "SER-30", price: 39 }, { name: "50ml", sku: "SER-50", price: 54 }, { name: "100ml", sku: "SER-100", price: 82 }], ca: 12450, evolution: 18.5, stock: 342, badge: "hot", visualBg: "#eff6ff", penetration: 68 },
  { id: "P-002", name: "Crème Régénérante Nuit", flavor: "Rétinol + Peptides", emoji: "🌙", category: "Soins", categoryColor: "#3b82f6", formats: [{ name: "50ml", sku: "CRN-50", price: 62 }, { name: "75ml", sku: "CRN-75", price: 84 }], ca: 9800, evolution: 12.3, stock: 215, badge: "hot", visualBg: "#f0fdf4", penetration: 55 },
  { id: "P-003", name: "Nettoyant Douceur", flavor: "Aloe Vera + Camomille", emoji: "🧴", category: "Soins", categoryColor: "#3b82f6", formats: [{ name: "200ml", sku: "ND-200", price: 24 }], ca: 5200, evolution: 5.8, stock: 528, visualBg: "#f8fafc", penetration: 42 },
  { id: "P-004", name: "Pack Découverte Zéro Déchet", flavor: "Kit complet 5 pièces", emoji: "🌱", category: "Éco", categoryColor: "#16a34a", formats: [{ name: "Kit Standard", sku: "ZD-KIT", price: 49 }, { name: "Kit Premium", sku: "ZD-PRE", price: 79 }], ca: 8900, evolution: 32.1, stock: 167, badge: "new", visualBg: "#f0fdf4", penetration: 38 },
  { id: "P-005", name: "Recharge Concentrée Multi-usage", flavor: "Vinaigre Blanc + Agrumes", emoji: "🫧", category: "Éco", categoryColor: "#16a34a", formats: [{ name: "500ml", sku: "RCH-500", price: 12 }, { name: "1L", sku: "RCH-1L", price: 18 }, { name: "5L", sku: "RCH-5L", price: 45 }], ca: 6700, evolution: 24.7, stock: 890, badge: "eco", visualBg: "#f0fdf4", penetration: 45 },
  { id: "P-006", name: "Kit Compostage Balcon", flavor: "Bac 40L + Activateur", emoji: "🪴", category: "Éco", categoryColor: "#16a34a", formats: [{ name: "40L", sku: "KCP-40", price: 59 }, { name: "80L", sku: "KCP-80", price: 89 }], ca: 4100, evolution: -2.3, stock: 73, visualBg: "#f8fafc", penetration: 22 },
  { id: "P-007", name: "Canapé Modulable Oslo", flavor: "Tissu Bouclé 100% recyclé", emoji: "🛋️", category: "Décoration", categoryColor: "#8b5cf6", formats: [{ name: "2 places", sku: "OSL-2", price: 1290 }, { name: "3 places", sku: "OSL-3", price: 1690 }, { name: "Angle", sku: "OSL-ANG", price: 2190 }], ca: 15200, evolution: 8.9, stock: 24, visualBg: "#faf5ff", penetration: 31 },
  { id: "P-008", name: "Table Basse Scandi", flavor: "Chêne massif + Métal noir", emoji: "🪑", category: "Décoration", categoryColor: "#8b5cf6", formats: [{ name: "120x60", sku: "TB-120", price: 490 }, { name: "140x70", sku: "TB-140", price: 590 }], ca: 9800, evolution: 4.2, stock: 18, visualBg: "#faf5ff", penetration: 28 },
  { id: "P-009", name: "Lampe Design Luna", flavor: "Verre soufflé + Laiton", emoji: "💡", category: "Décoration", categoryColor: "#8b5cf6", formats: [{ name: "Petite", sku: "LUN-P", price: 169 }, { name: "Grande", sku: "LUN-G", price: 249 }], ca: 6700, evolution: 15.6, stock: 42, badge: "hot", visualBg: "#fdf2f8", penetration: 35 },
  { id: "P-010", name: "Legging Performance Pro", flavor: "Tissu respirant haute compression", emoji: "🏋️", category: "Sport", categoryColor: "#ea580c", formats: [{ name: "Taille S", sku: "LPP-S", price: 69 }, { name: "Taille M", sku: "LPP-M", price: 69 }, { name: "Taille L", sku: "LPP-L", price: 69 }], ca: 6800, evolution: 22.4, stock: 156, badge: "new", visualBg: "#fff7ed", penetration: 48 },
  { id: "P-011", name: "Tapis de Yoga Premium", flavor: "Liège naturel 6mm", emoji: "🧘", category: "Sport", categoryColor: "#ea580c", formats: [{ name: "Standard", sku: "TYP-S", price: 89 }, { name: "Extra Large", sku: "TYP-XL", price: 119 }], ca: 4200, evolution: 11.8, stock: 89, visualBg: "#fff7ed", penetration: 41 },
  { id: "P-012", name: "Set Élastiques Résistance", flavor: "5 niveaux + Sac de transport", emoji: "💪", category: "Sport", categoryColor: "#ea580c", formats: [{ name: "Kit 5", sku: "ELA-5", price: 34 }], ca: 3100, evolution: -1.5, stock: 234, visualBg: "#fff7ed", penetration: 33 },
];

export type Categorie = {
  name: string;
  emoji: string;
  color: string;
  count: number;
  ca: number;
  evolution: number;
  topProducts: { name: string; share: number; color: string }[];
};

export const categories: Categorie[] = [
  { name: "Soins", emoji: "✨", color: "#3b82f6", count: 3, ca: 27450, evolution: 12.8, topProducts: [{ name: "Sérum Hydratation Intensive", share: 45.4, color: "#3b82f6" }, { name: "Crème Régénérante Nuit", share: 35.7, color: "#60a5fa" }, { name: "Nettoyant Douceur", share: 18.9, color: "#93c5fd" }] },
  { name: "Éco", emoji: "🌱", color: "#16a34a", count: 3, ca: 19700, evolution: 21.4, topProducts: [{ name: "Pack Découverte Zéro Déchet", share: 45.2, color: "#16a34a" }, { name: "Recharge Concentrée", share: 34.0, color: "#4ade80" }, { name: "Kit Compostage Balcon", share: 20.8, color: "#86efac" }] },
  { name: "Décoration", emoji: "🛋️", color: "#8b5cf6", count: 3, ca: 31700, evolution: 7.8, topProducts: [{ name: "Canapé Modulable Oslo", share: 47.9, color: "#8b5cf6" }, { name: "Table Basse Scandi", share: 30.9, color: "#a78bfa" }, { name: "Lampe Design Luna", share: 21.2, color: "#c4b5fd" }] },
  { name: "Sport", emoji: "🏋️", color: "#ea580c", count: 3, ca: 14100, evolution: 14.2, topProducts: [{ name: "Legging Performance Pro", share: 48.2, color: "#ea580c" }, { name: "Tapis de Yoga Premium", share: 29.8, color: "#f97316" }, { name: "Set Élastiques Résistance", share: 22.0, color: "#fb923c" }] },
];

export const badgeStyles: Record<string, { bg: string; color: string; label: string }> = {
  new: { bg: "#eff6ff", color: "#1d4ed8", label: "Nouveau" },
  hot: { bg: "#fff7ed", color: "#ea580c", label: "🔥 Populaire" },
  eco: { bg: "#f0fdf4", color: "#15803d", label: "Éco" },
};

export const statutStyles = {
  premium: { background: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" },
  standard: { background: "#f8fafc", color: "#64748b", borderColor: "#e2e8f0" },
};

export const rfmStyles: Record<string, { background: string; color: string }> = {
  champion: { background: "#eff6ff", color: "#1d4ed8" },
  loyal: { background: "#f0fdf4", color: "#15803d" },
  risque: { background: "#fff7ed", color: "#ea580c" },
  perdu: { background: "#fef2f2", color: "#dc2626" },
};

export type CardData = {
  id: string;
  company: string;
  icon: string;
  region: string;
  category: string;
  alertType: "relancer" | "risque" | "opportunite" | "signal";
  alertReason: string;
  alertDetail: string;
  metrics: {
    ca: string;
    panierMoyen: string;
    retention: string;
    rfmScore: number;
    rfmLabel: string;
  };
  comment: string;
  commentMeta: string;
  daysSinceContact: number;
};

export const flashCards: CardData[] = [
  {
    id: "1",
    company: "Beauté Éclat",
    icon: "💄",
    region: "Paris, Île-de-France",
    category: "Cosmétique",
    alertType: "relancer",
    alertReason: "Panier abandonné il y a 7 jours — 3 relances sans réponse",
    alertDetail: "Cliente à fort potentiel (panier moyen €89) qui a abandonné un panier de €134 après avoir visité la page produit 4 fois.",
    metrics: { ca: "€12,450", panierMoyen: "€89", retention: "68%", rfmScore: 845, rfmLabel: "Champion" },
    comment: "Je pense qu'un appel personnalisé pourrait débloquer la situation.",
    commentMeta: "Sophie M. · Commercial · Il y a 2h",
    daysSinceContact: 7,
  },
  {
    id: "2",
    company: "TechNova",
    icon: "🖥️",
    region: "Lyon, Auvergne-Rhône-Alpes",
    category: "Électronique",
    alertType: "risque",
    alertReason: "Baisse d'activité de 40% sur 3 mois",
    alertDetail: "Client historique (€230k CA cumulé) mais plus aucune commande depuis 90 jours. Score RFM en chute libre.",
    metrics: { ca: "€230,000", panierMoyen: "€1,250", retention: "22%", rfmScore: 312, rfmLabel: "Perdu" },
    comment: "À relancer en urgence avec une offre dédiée.",
    commentMeta: "Marc L. · Account Manager · Il y a 1j",
    daysSinceContact: 14,
  },
  {
    id: "3",
    company: "GreenWave",
    icon: "🌱",
    region: "Bordeaux, Nouvelle-Aquitaine",
    category: "Éco-responsable",
    alertType: "opportunite",
    alertReason: "Demande de devis pour 500 unités — nouvelle référence",
    alertDetail: "Lead chaud issu du salon Pro-Durable. Besoin d'une réponse sous 48h pour sécuriser la commande.",
    metrics: { ca: "€8,200", panierMoyen: "€45", retention: "55%", rfmScore: 723, rfmLabel: "Prometteur" },
    comment: "Gros potentiel de récurrence mensuelle.",
    commentMeta: "Léa D. · Support Client · Il y a 3h",
    daysSinceContact: 0,
  },
  {
    id: "4",
    company: "Maison&Co",
    icon: "🏠",
    region: "Nantes, Pays de la Loire",
    category: "Décoration",
    alertType: "signal",
    alertReason: "Taux d'ouverture des emails en baisse de 15%",
    alertDetail: "Client fidèle (2 ans) mais l'engagement email diminue progressivement. Risque d'endormissement à surveiller.",
    metrics: { ca: "€45,600", panierMoyen: "€156", retention: "78%", rfmScore: 654, rfmLabel: "Loyal" },
    comment: "Peut-être changer le canal de communication.",
    commentMeta: "Paul R. · Marketing · Il y a 5j",
    daysSinceContact: 5,
  },
  {
    id: "5",
    company: "SportFit",
    icon: "🏋️",
    region: "Marseille, Provence-Alpes-Côte d'Azur",
    category: "Sport & Fitness",
    alertType: "relancer",
    alertReason: "Abonnement arrivé à terme — non renouvelé",
    alertDetail: "Client abonné pendant 11 mois consécutifs. Panier moyen €67. À reconquérir avec offre de réengagement.",
    metrics: { ca: "€18,700", panierMoyen: "€67", retention: "45%", rfmScore: 523, rfmLabel: "À risque" },
    comment: "Tenter un appel + email personnalisé.",
    commentMeta: "Camille N. · Relation Client · Il y a 3j",
    daysSinceContact: 6,
  },
  {
    id: "6",
    company: "Saveurs du Monde",
    icon: "🍷",
    region: "Bordeaux, Nouvelle-Aquitaine",
    category: "Alimentation & Boissons",
    alertType: "opportunite",
    alertReason: "Upsell possible sur gamme premium",
    alertDetail: "Achète régulièrement (tous les 21 jours) mais jamais la gamme haut de gamme. Potentiel d'upsell de +35%.",
    metrics: { ca: "€32,100", panierMoyen: "€52", retention: "88%", rfmScore: 891, rfmLabel: "Champion" },
    comment: "Préparer un coffret découverte premium.",
    commentMeta: "Alexis B. · Commercial · Il y a 1j",
    daysSinceContact: 2,
  },
  {
    id: "7",
    company: "Zen & Co",
    icon: "🧘",
    region: "Grenoble, Auvergne-Rhône-Alpes",
    category: "Bien-être",
    alertType: "signal",
    alertReason: "Fréquence d'achat en baisse de 30% sur 2 mois",
    alertDetail: "Client régulier (1 commande/mois) passé à 1 commande en 2 mois. Panier moyen stable mais risque d'endormissement.",
    metrics: { ca: "€6,750", panierMoyen: "€48", retention: "62%", rfmScore: 432, rfmLabel: "À risque" },
    comment: "Relancer avec une offre bien-être printanière.",
    commentMeta: "Sophie M. · Commercial · Il y a 4j",
    daysSinceContact: 10,
  },
  {
    id: "8",
    company: "Mode Urbaine",
    icon: "👟",
    region: "Lille, Hauts-de-France",
    category: "Mode & Accessoires",
    alertType: "risque",
    alertReason: "Retards de paiement récurrents — 2 factures impayées",
    alertDetail: "Compte premium avec €28k CA annuel mais 2 factures à J+45 et J+60. Score de crédit en dégradation.",
    metrics: { ca: "€28,300", panierMoyen: "€112", retention: "71%", rfmScore: 467, rfmLabel: "À risque" },
    comment: "Contacter la comptabilité pour un plan d'apurement.",
    commentMeta: "Marc L. · Account Manager · Il y a 1j",
    daysSinceContact: 3,
  },
  {
    id: "9",
    company: "Art&Lumière",
    icon: "🪔",
    region: "Lyon, Auvergne-Rhône-Alpes",
    category: "Décoration",
    alertType: "opportunite",
    alertReason: "Demande de catalogue pour nouvelle boutique — 2e établissement",
    alertDetail: "Client existant (1 boutique, €19k CA) ouvre un second point de vente. Opportunité de doubler le volume.",
    metrics: { ca: "€19,500", panierMoyen: "€210", retention: "85%", rfmScore: 812, rfmLabel: "Champion" },
    comment: "Préparer un pack d'ouverture spécial nouvelle boutique.",
    commentMeta: "Léa D. · Support Client · Il y a 6h",
    daysSinceContact: 1,
  },
  {
    id: "10",
    company: "EcoRider",
    icon: "🚲",
    region: "Strasbourg, Grand Est",
    category: "Mobilité durable",
    alertType: "relancer",
    alertReason: "Aucune commande depuis 60 jours — ancien client fidèle",
    alertDetail: "Commandait tous les 20 jours pendant 14 mois. Arrêt brutal sans raison connue. Potentiel de réactivation.",
    metrics: { ca: "€11,200", panierMoyen: "€39", retention: "48%", rfmScore: 401, rfmLabel: "À risque" },
    comment: "Envoyer une offre de bienvenue réactivation.",
    commentMeta: "Camille N. · Relation Client · Il y a 2j",
    daysSinceContact: 8,
  },
  {
    id: "11",
    company: "Éclat de Soie",
    icon: "🧣",
    region: "Lyon, Auvergne-Rhône-Alpes",
    category: "Textile & Luxe",
    alertType: "signal",
    alertReason: "Panier moyen en baisse de 22% sur 3 mois",
    alertDetail: "Client premium avec €38k CA annuel mais panier moyen passé de €145 à €113. Tend à commander des articles moins chers.",
    metrics: { ca: "€38,900", panierMoyen: "€113", retention: "90%", rfmScore: 834, rfmLabel: "Champion" },
    comment: "Proposer une sélection de nouveautés gamme haute.",
    commentMeta: "Alexis B. · Commercial · Il y a 5j",
    daysSinceContact: 4,
  },
  {
    id: "12",
    company: "Cosy Home",
    icon: "🛋️",
    region: "Toulouse, Occitanie",
    category: "Ameublement",
    alertType: "opportunite",
    alertReason: "Projet d'aménagement complet — budget estimé €15k",
    alertDetail: "Nouveau contact issu d'un salon professionnel. Projet d'équipement complet pour 3 résidences locatives. À sécuriser rapidement.",
    metrics: { ca: "€14,700", panierMoyen: "€320", retention: "63%", rfmScore: 610, rfmLabel: "Loyal" },
    comment: "Planifier un rendez-vous showroom avec le responsable.",
    commentMeta: "Thomas M. · Commercial · Il y a 1j",
    daysSinceContact: 0,
  },
];
