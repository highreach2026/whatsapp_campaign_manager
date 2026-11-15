import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const db = supabaseAdmin();
  if (!db) {
    return NextResponse.json({ messages: [], unconfigured: true });
  }

  const { data, error } = await db
    .from("message_logs")
    .select("id,phone,template_name,status,error,sent_at,delivered_at,read_at,failed_at,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data || [] });
}

