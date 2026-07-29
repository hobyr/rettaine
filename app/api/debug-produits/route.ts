import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products_sales")
    .select("*")
    .order("id", { ascending: true })

  return Response.json({
    env: {
      urlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      keyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    queryError: error
      ? { message: error.message, details: error.details, hint: error.hint, code: error.code }
      : null,
    rowCount: data?.length ?? 0,
    firstRow: data?.[0] ?? null,
    allRows: data ?? [],
  })
}
