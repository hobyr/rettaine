import { createClient } from "@/lib/supabase/server";
import { parseCsv, normalizeOrderRows, type ImportSummary } from "@/lib/orders/import";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const csvText = await request.text();

  const { headers, rows } = parseCsv(csvText);

  if (rows.length === 0) {
    return Response.json({ inserted: 0, duplicates: 0, invalid: 0, total: 0, errors: [] } satisfies ImportSummary);
  }

  const { rows: normalized } = normalizeOrderRows(headers, rows);

  const { data, error } = await supabase.rpc("import_orders", { p_rows: normalized });

  if (error) {
    return Response.json({ error: `Erreur lors de l'import : ${error.message}` }, { status: 500 });
  }

  return Response.json(data as ImportSummary);
}
