import { createClient } from "@/lib/supabase/server";
import { parseCsv, normalizeOrderRows, type ImportSummary, type ColumnMap } from "@/lib/orders/import";

const FIELD_KEYS = ["order_number", "date", "account_number", "sku", "quantity", "unit_price_ex_vat"] as const;

function sanitizeMapping(mapping: unknown, headerCount: number): ColumnMap {
  const out: ColumnMap = {};
  if (typeof mapping !== "object" || mapping === null) return out;

  for (const key of FIELD_KEYS) {
    const value = (mapping as Record<string, unknown>)[key];
    if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value < headerCount) {
      out[key] = value;
    }
  }

  return out;
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { csv?: string; mapping?: unknown } | null;
  const csvText = typeof body?.csv === "string" ? body.csv : "";

  if (!csvText) {
    return Response.json({ error: "Fichier vide" }, { status: 400 });
  }

  const { headers, rows } = parseCsv(csvText);

  if (rows.length === 0) {
    return Response.json({ inserted: 0, duplicates: 0, invalid: 0, total: 0, errors: [] } satisfies ImportSummary);
  }

  const mapping = sanitizeMapping(body?.mapping, headers.length);
  const { rows: normalized } = normalizeOrderRows(headers, rows, mapping);

  const { data, error } = await supabase.rpc("import_orders", { p_rows: normalized });

  if (error) {
    return Response.json({ error: `Erreur lors de l'import : ${error.message}` }, { status: 500 });
  }

  return Response.json(data as ImportSummary);
}
