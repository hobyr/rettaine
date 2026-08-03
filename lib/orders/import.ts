export type NormalizedOrderRow = {
  order_number: string;
  date: string;
  account_number: string;
  sku: string;
  quantity: number | string;
  unit_price_ex_vat: number | string;
}

export type NormalizationIssue = {
  line: number;
  order_number?: string;
  reason: string;
}

export type ParseResult = {
  headers: string[];
  rows: string[][];
  delimiter: string;
}

export type ImportSummary = {
  inserted: number;
  duplicates: number;
  invalid: number;
  total: number;
  errors: { line: number; order_number?: string; reason: string }[];
}

export type ColumnMap = Partial<Record<keyof NormalizedOrderRow, number>>

const HEADER_ALIASES: Record<keyof NormalizedOrderRow, string[]> = {
  order_number: [
    "ordernumber",
    "order",
    "ncommande",
    "nocommande",
    "numerodecommande",
    "ncommand",
    "document",
    "nord",
    "nordre",
    "command",
    "orderno",
    "noorder",
  ],
  date: ["date", "datecommande", "datedecommande", "dateordre", "jour"],
  account_number: [
    "accountnumber",
    "account",
    "compte",
    "ncompte",
    "nocompte",
    "numerodecompte",
    "client",
    "nclient",
    "noclient",
    "codeclient",
    "accountno",
  ],
  sku: ["sku", "article", "reference", "ref", "codearticle", "produit", "codedarticle", "refarticle", "code"],
  quantity: ["quantity", "quantite", "qte", "qty", "quantitevendue", "qt", "nombre", "qtevendue"],
  unit_price_ex_vat: [
    "unitpriceexvat",
    "prixunitaireht",
    "puht",
    "pu",
    "prixht",
    "prixunitaire",
    "prixunitairehorsstock",
  ],
}

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
}

function findSubstringMatch(normalized: string[], aliases: string[]): number {
  let bestIndex = -1
  let bestLength = 0
  for (let i = 0; i < normalized.length; i++) {
    const header = normalized[i]
    if (header.length < 4) continue
    for (const alias of aliases) {
      if (alias.length < 4) continue
      if (header.length > alias.length && (header.startsWith(alias) || header.endsWith(alias))) {
        if (alias.length > bestLength) {
          bestLength = alias.length
          bestIndex = i
        }
      }
    }
  }
  return bestIndex
}

export function guessColumnMap(headers: string[]): ColumnMap {
  const map: ColumnMap = {}
  const normalized = headers.map(normalizeHeader)

  for (const key of Object.keys(HEADER_ALIASES) as (keyof NormalizedOrderRow)[]) {
    let found = -1

    for (let i = 0; i < normalized.length; i++) {
      if (HEADER_ALIASES[key].includes(normalized[i])) {
        found = i
        break
      }
    }

    if (found === -1) {
      const best = findSubstringMatch(normalized, HEADER_ALIASES[key])
      if (best !== -1) found = best
    }

    if (found !== -1) map[key] = found
  }

  return map
}

function countChar(value: string, ch: string): number {
  let count = 0
  for (let i = 0; i < value.length; i++) {
    if (value[i] === ch) count++
  }
  return count
}

export function parseCsv(text: string): ParseResult {
  const cleaned = text.replace(/^\uFEFF/, "")
  const lines = cleaned.split(/\r\n|\r|\n/)
  const firstDataLine = lines.find((l) => l.trim().length > 0) ?? ""
  const delimiter = countChar(firstDataLine, ";") > countChar(firstDataLine, ",") ? ";" : ","

  const parsed: string[][] = []
  let field = ""
  let row: string[] = []
  let inQuotes = false

  const pushField = () => {
    row.push(field)
    field = ""
  }
  const pushRow = () => {
    pushField()
    parsed.push(row)
    row = []
  }

  for (const line of lines) {
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            field += '"'
            i++
          } else {
            inQuotes = false
          }
        } else {
          field += ch
        }
      } else if (ch === '"') {
        inQuotes = true
      } else if (ch === delimiter) {
        pushField()
      } else {
        field += ch
      }
    }
    if (inQuotes) {
      field += "\n"
    } else {
      pushRow()
    }
  }

  const rows = parsed.filter((r) => r.some((v) => v.trim().length > 0))
  const headers = rows[0] ?? []
  const dataRows = rows.slice(1)

  return { headers, rows: dataRows, delimiter }
}

function parseDateToIso(value: string): string | null {
  const v = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v

  const match = v.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/)
  if (!match) return null

  const [, a, b, y] = match
  const year = y.length === 2 ? 2000 + Number(y) : Number(y)
  const day = Number(a)
  const month = Number(b)

  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function parseQuantity(value: string): number | null {
  const v = value.trim().replace(/\s/g, "")
  if (!/^\d+$/.test(v)) return null
  const n = Number(v)
  return n > 0 ? n : null
}

function parsePriceToCents(value: string): number | null {
  let v = value.trim().replace(/\s/g, "")
  if (v === "") return null

  if (v.includes(",") && v.includes(".")) {
    const lastComma = v.lastIndexOf(",")
    const lastDot = v.lastIndexOf(".")
    if (lastComma > lastDot) {
      v = v.replace(/\./g, "").replace(",", ".")
    } else {
      v = v.replace(/,/g, "")
    }
  } else if (v.includes(",")) {
    v = v.replace(",", ".")
  }

  const n = Number(v)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n * 100)
}

export type NormalizeResult = {
  rows: NormalizedOrderRow[];
  issues: NormalizationIssue[];
  duplicateLines: number[];
}

export function normalizeOrderRows(headers: string[], dataRows: string[][], colMap?: ColumnMap): NormalizeResult {
  const col = colMap ?? guessColumnMap(headers)
  const rows: NormalizedOrderRow[] = []
  const issues: NormalizationIssue[] = []
  const duplicateLines: number[] = []
  const seen = new Set<string>()

  const get = (key: keyof NormalizedOrderRow, fields: string[]): string => {
    const index = col[key]
    if (index === undefined) return ""
    return (fields[index] ?? "").trim()
  }

  dataRows.forEach((fields, idx) => {
    const line = idx + 1

    const order_number = get("order_number", fields)
    const account_number = get("account_number", fields)
    const sku = get("sku", fields).toUpperCase()
    const rawDate = get("date", fields)
    const rawQty = get("quantity", fields)
    const rawPrice = get("unit_price_ex_vat", fields)

    const parsedDate = parseDateToIso(rawDate)
    const parsedQty = parseQuantity(rawQty)
    const parsedPrice = parsePriceToCents(rawPrice)

    rows.push({
      order_number,
      date: parsedDate ?? rawDate,
      account_number,
      sku,
      quantity: parsedQty ?? rawQty,
      unit_price_ex_vat: parsedPrice ?? rawPrice,
    })

    if (!order_number) {
      issues.push({ line, reason: "order_number manquant" })
    } else if (!account_number) {
      issues.push({ line, order_number, reason: "compte manquant" })
    } else if (!sku) {
      issues.push({ line, order_number, reason: "SKU manquant" })
    } else if (parsedDate === null) {
      issues.push({ line, order_number, reason: "date invalide" })
    } else if (parsedQty === null) {
      issues.push({ line, order_number, reason: "quantité invalide" })
    } else if (parsedPrice === null) {
      issues.push({ line, order_number, reason: "prix invalide" })
    }

    if (order_number && sku) {
      const key = `${order_number}\u0000${sku}`
      if (seen.has(key)) {
        duplicateLines.push(line)
      } else {
        seen.add(key)
      }
    }
  })

  return { rows, issues, duplicateLines }
}

export async function importOrders(csvText: string, mapping?: ColumnMap): Promise<ImportSummary> {
  const response = await fetch("/api/orders/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ csv: csvText, mapping: mapping ?? {} }),
  })

  const payload = (await response.json().catch(() => ({}))) as ImportSummary & { error?: string }

  if (!response.ok) {
    throw new Error(payload.error ?? "Erreur lors de l'import des commandes")
  }

  return payload
}
