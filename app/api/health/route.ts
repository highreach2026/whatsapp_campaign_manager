import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    whatsappToken: Boolean(process.env.WHATSAPP_ACCESS_TOKEN),
    phoneNumberId: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID),
    wabaId: Boolean(process.env.WHATSAPP_WABA_ID),
    graphApiVersion: Boolean(process.env.GRAPH_API_VERSION && process.env.GRAPH_API_VERSION !== "vXX.X"),
    supabaseUrl: Boolean(process.env.SUPABASE_URL),
    supabaseServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    verifyToken: Boolean(process.env.WHATSAPP_VERIFY_TOKEN),
    metaAppSecret: Boolean(process.env.META_APP_SECRET),
  };
  return NextResponse.json({ ok: Object.values(checks).every(Boolean), checks });
}
