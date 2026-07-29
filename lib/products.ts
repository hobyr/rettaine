import { createClient } from "@/lib/supabase/server"

export type ProductRow = {
  id: number
  SKU: string
  designation: string
  category: string
  format: string
  unit_price_cents_default: number | null
  tax_rate: number | null
  total_sales_cents: number
  total_quantity_sold: number
  order_count: number
}

export type ProductFormat = {
  name: string
  sku: string
  price: number
}

export type Produit = {
  id: string
  name: string
  flavor: string
  emoji: string
  category: string
  categoryColor: string
  formats: ProductFormat[]
  ca: number
  evolution: number
  stock: number
  badge?: "new" | "hot" | "eco"
  visualBg: string
  penetration: number
}

export type Categorie = {
  name: string
  emoji: string
  color: string
  count: number
  ca: number
  evolution: number
  topProducts: { name: string; share: number; color: string }[]
}

const CATEGORY_META: Record<string, { emoji: string; color: string }> = {
  Agrumes: { emoji: "🍊", color: "#f97316" },
  Fruits: { emoji: "🍇", color: "#e11d48" },
  Exotique: { emoji: "🥭", color: "#d946ef" },
  Floral: { emoji: "🌸", color: "#ec4899" },
  Fraîcheur: { emoji: "🌿", color: "#14b8a6" },
}

const CATEGORY_BG: Record<string, string> = {
  Agrumes: "#fff7ed",
  Fruits: "#fef2f2",
  Exotique: "#faf5ff",
  Floral: "#fdf2f8",
  Fraîcheur: "#f0fdfa",
}

function parseProductKey(designation: string): { name: string; flavor: string } {
  const parts = designation.split(" — ")
  const productPart = parts[0] ?? ""
  const flavor = parts[1] ?? ""
  const name = productPart.split(/\s/)[0] ?? productPart
  return { name, flavor }
}

function formatPrice(cents: number): number {
  return Math.round(cents) / 100
}

function groupProducts(rows: ProductRow[]): Produit[] {
  const groups = new Map<string, { rows: ProductRow[]; name: string; flavor: string; category: string }>()

  for (const row of rows) {
    const { name, flavor } = parseProductKey(row.designation)
    const key = `${name}::${flavor}`
    const existing = groups.get(key)
    if (existing) {
      existing.rows.push(row)
    } else {
      groups.set(key, { rows: [row], name, flavor, category: row.category })
    }
  }

  const produits: Produit[] = []
  let counter = 1

  for (const [, group] of groups) {
    const catMeta = CATEGORY_META[group.category] ?? { emoji: "📦", color: "#64748b" }
    const bg = CATEGORY_BG[group.category] ?? "#f8fafc"
    const formats: ProductFormat[] = group.rows
      .filter((r) => r.unit_price_cents_default != null)
      .map((r) => ({
        name: r.format,
        sku: r.SKU,
        price: formatPrice(r.unit_price_cents_default!),
      }))

    const totalSalesCents = group.rows.reduce((s, r) => s + (r.total_sales_cents ?? 0), 0)
    const totalQuantitySold = group.rows.reduce(
      (s, r) => s + Number(r.total_quantity_sold ?? 0), 0
    )

    produits.push({
      id: `P-${String(counter).padStart(3, "0")}`,
      name: group.name,
      flavor: group.flavor,
      emoji: catMeta.emoji,
      category: group.category,
      categoryColor: catMeta.color,
      formats,
      ca: totalSalesCents,
      evolution: 0,
      stock: totalQuantitySold,
      visualBg: bg,
      penetration: 0,
    })

    counter++
  }

  return produits
}

function computeCategories(produits: Produit[]): Categorie[] {
  const catMap = new Map<string, { produits: Produit[]; meta: { emoji: string; color: string } }>()

  for (const p of produits) {
    const meta = CATEGORY_META[p.category] ?? { emoji: "📦", color: "#64748b" }
    const existing = catMap.get(p.category)
    if (existing) {
      existing.produits.push(p)
    } else {
      catMap.set(p.category, { produits: [p], meta })
    }
  }

  const categories: Categorie[] = []

  for (const [catName, group] of catMap) {
    const totalCatCa = group.produits.reduce((s, p) => s + p.ca, 0)
    const sorted = [...group.produits].sort((a, b) => b.ca - a.ca)
    const top = sorted.slice(0, 3)
    const topTotal = top.reduce((s, p) => s + p.ca, 0)

    categories.push({
      name: catName,
      emoji: group.meta.emoji,
      color: group.meta.color,
      count: group.produits.reduce((s, p) => s + p.formats.length, 0),
      ca: totalCatCa,
      evolution: 0,
      topProducts: top.map((p) => ({
        name: `${p.name} — ${p.flavor}`,
        share: topTotal > 0 ? Math.round((p.ca / topTotal) * 100) : 0,
        color: group.meta.color,
      })),
    })
  }

  return categories
}

export async function getProduits(): Promise<{ produits: Produit[]; categories: Categorie[] }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products_sales")
    .select("*")
    .order("id", { ascending: true })

  if (error) {
    console.error("Erreur lors de la récupération des produits:", error)
    return { produits: [], categories: [] }
  }

  const produits = groupProducts(data as ProductRow[])
  const categories = computeCategories(produits)

  return { produits, categories }
}
