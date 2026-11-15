import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { normalizePhone } from "@/lib/phone";

export const runtime = "nodejs";

const STOP_WORDS = new Set(["stop", "unsubscribe", "cancel", "opt out", "optout", "remove"]);

function validMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !signatureHeader?.startsWith("sha256=")) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) { 
    return new NextResponse(challenge || "", { status: 200 });
  }
  return new NextResponse("Verification failed", { status: 403 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!validMetaSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const db = supabaseAdmin();
  if (!db) return new NextResponse("Server unconfigured", { status: 500 });

  try {
    for (const entry of payload?.entry || []) {
      for (const change of entry?.changes || []) {
        const value = change?.value || {};

        for (const status of value.statuses || []) {
          const id = status.id;
          const state = status.status;
          const now = new Date().toISOString();
          const update: Record<string, any> = { status: state };
          if (state === "delivered") update.delivered_at = now;
          if (state === "read") update.read_at = now;
          if (state === "failed") {
            update.failed_at = now;
            update.error = status?.errors?.[0]?.title || status?.errors?.[0]?.message || "Delivery failed";
          }
          if (id) await (db.from("message_logs") as any).update(update as any).eq("meta_message_id", id);
        }

        for (const message of value.messages || []) {
          const phone = normalizePhone(message.from || "");
          const text = String(message?.text?.body || "").trim().toLowerCase();
          if (phone && STOP_WORDS.has(text)) {
            await (db.from("contacts") as any).update({
              opt_in: false,
              opted_out_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as any).eq("phone", phone);
          }
        }
      }
    }
  } catch (error) {
    console.error("Webhook processing error", error);
  }

  return NextResponse.json({ received: true });
}
