import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { supabaseAdmin } from "@/lib/supabase";
import { looksLikePhone, normalizePhone } from "@/lib/phone";

function boolValue(value: unknown) {
  const v = String(value ?? "").trim().toLowerCase();
  return ["1", "true", "yes", "y", "opted-in", "opted_in"].includes(v);
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file");
  const confirmed = form.get("confirmedOptIn") === "true";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "CSV file is required." }, { status: 400 });
  }
  if (!confirmed) {
    return NextResponse.json({ error: "You must confirm these contacts gave High Reach permission to message them on WhatsApp." }, { status: 400 });
  }

  const csv = await file.text();
  const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) {
    return NextResponse.json({ error: parsed.errors[0].message }, { status: 400 });
  }

  const rows = parsed.data;
  const valid: any[] = [];
  const rejected: any[] = [];

  for (const row of rows) {
    const phone = normalizePhone(row.phone || row.mobile || row.whatsapp || "");
    if (!looksLikePhone(phone)) {
      rejected.push({ phone: row.phone || row.mobile || row.whatsapp || "", reason: "Invalid phone" });
      continue;
    }

    // Require a per-row opt-in marker as a second safety check.
    if (!boolValue(row.opt_in || row.optin || row.consent || "")) {
      rejected.push({ phone, reason: "Missing opt_in=true/yes consent marker" });
      continue;
    }

    const standard = new Set(["phone", "mobile", "whatsapp", "name", "company", "city", "tags", "opt_in", "optin", "consent", "opt_in_source"]);
    const customFields: Record<string, string> = {};
    Object.entries(row).forEach(([k, v]) => {
      if (!standard.has(k) && v) customFields[k] = v;
    });

    valid.push({
      phone,
      name: row.name || null,
      company: row.company || null,
      city: row.city || null,
      tags: (row.tags || "").split(",").map((x) => x.trim()).filter(Boolean),
      custom_fields: customFields,
      opt_in: true,
      opt_in_source: row.opt_in_source || "csv_import",
      opt_in_at: new Date().toISOString(),
      opted_out_at: null,
      updated_at: new Date().toISOString(),
    });
  }

  if (valid.length) {
    const db = supabaseAdmin();
    if (!db) {
      return NextResponse.json({ error: "Supabase database connection is not configured yet. Please update SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local." }, { status: 400 });
    }
    const { error } = await db.from("contacts").upsert(valid as any, { onConflict: "phone" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ imported: valid.length, rejected: rejected.length, rejectedRows: rejected.slice(0, 50) });
}

