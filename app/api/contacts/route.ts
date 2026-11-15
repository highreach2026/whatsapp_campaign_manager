import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const db = supabaseAdmin();
  if (!db) {
    return NextResponse.json({ contacts: [], optedIn: 0, unconfigured: true });
  }

  const { data, error } = await db
    .from("contacts")
    .select("id,phone,name,company,city,opt_in,opt_in_source,opt_in_at,opted_out_at,created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const optedIn = ((data as any[]) || []).filter((c: any) => c.opt_in && !c.opted_out_at).length;
  return NextResponse.json({ contacts: data || [], optedIn });
}

