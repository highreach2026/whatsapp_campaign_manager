import { NextRequest, NextResponse } from "next/server";

/* ---------------------------------------------------------------
   HighReach Chatbot – service-only knowledge base
   All responses are scoped strictly to HighReach services.
--------------------------------------------------------------- */

interface KBEntry {
  keywords: string[];
  answer: string;
}

const KNOWLEDGE_BASE: KBEntry[] = [
  {
    keywords: ["what is highreach", "about highreach", "who are you", "what do you do", "what is high reach"],
    answer:
      "**HighReach** is an official WhatsApp Business Platform campaign management tool. We help businesses send personalised marketing messages to opted-in contacts using Meta's Cloud API — the safe, compliant way to reach your audience on WhatsApp.",
  },
  {
    keywords: ["whatsapp campaign", "send campaign", "campaign manager", "marketing campaign", "run campaign"],
    answer:
      "With HighReach's **Campaign Manager** you can:\n- Import opted-in contacts via CSV\n- Choose an approved Meta message template\n- Personalise body text with contact fields (name, company, city, etc.)\n- Attach image, video, or PDF media\n- Send to up to 50 recipients per action (scalable with a queue)\n- Track delivered / read / failed status in real time",
  },
  {
    keywords: ["import contacts", "csv import", "upload contacts", "add contacts", "contact import"],
    answer:
      "HighReach accepts **CSV files** for contact import. The minimum required columns are `phone` and `opt_in`. Recommended columns: `name`, `company`, `city`, `opt_in_source`, `tags`.\n\nEvery row must have `opt_in=yes` — contacts without explicit opt-in are automatically rejected to protect your sender reputation.",
  },
  {
    keywords: ["opt-in", "optin", "opted in", "consent", "permission", "gdpr", "compliance", "opted out", "optout", "opt-out", "stop", "unsubscribe"],
    answer:
      "HighReach is **opt-in first**. We only send to contacts who have explicitly consented. Every CSV row must have `opt_in=yes`.\n\nOpt-outs are automatic — if a contact replies **STOP, UNSUBSCRIBE, CANCEL, OPT OUT,** or **REMOVE**, they are flagged and will never receive another message.",
  },
  {
    keywords: ["template", "message template", "approved template", "meta template", "template name", "language code"],
    answer:
      "HighReach uses **Meta-approved message templates only**. You need to:\n1. Create and get a template approved in Meta Business Manager.\n2. Enter the exact template name and language code in the dashboard.\n3. Map CSV columns to template body variables `{{1}}`, `{{2}}`, etc.\n\nExample: if your template is *Hi {{1}}, we'd love to help {{2}}*, map `name,company` in the variable fields.",
  },
  {
    keywords: ["media", "image", "video", "pdf", "upload media", "attach media", "header image", "header video"],
    answer:
      "HighReach supports **media headers** in campaigns. You can upload:\n- **Images**: JPG or PNG\n- **Videos**: MP4 or 3GP\n- **Documents**: PDF\n\nThe media is uploaded directly to the WhatsApp media endpoint and you'll get a Meta Media ID. The media type must match the approved template's header type.",
  },
  {
    keywords: ["analytics", "stats", "delivery", "delivered", "read", "failed", "logs", "report", "tracking"],
    answer:
      "HighReach tracks every message with **real-time delivery logs**:\n- **Sent** — message dispatched to Meta\n- **Delivered** — reached the recipient's device\n- **Read** — recipient opened the message\n- **Failed** — delivery error (logged with reason)\n\nAll activity is visible in the Recent Delivery Activity log on the dashboard.",
  },
  {
    keywords: ["phone number", "indian number", "phone format", "normalize phone", "country code"],
    answer:
      "HighReach **automatically normalises** Indian 10-digit numbers by prepending the country code `91`. Numbers in E.164 format (e.g. `919876543210`) are imported as-is.",
  },
  {
    keywords: ["pricing", "price", "cost", "plan", "subscription", "free", "paid"],
    answer:
      "For pricing and subscription details, please contact the **HighReach team directly**. The platform itself uses Meta's Cloud API, which has its own per-message pricing based on conversation type and country. Reach out to us for a tailored quote.",
  },
  {
    keywords: ["security", "safe", "credentials", "token", "api key", "env", "secret"],
    answer:
      "HighReach takes security seriously:\n- API credentials (WhatsApp access token, Supabase keys) are stored only in `.env.local` and never exposed client-side.\n- The dashboard is protected with basic authentication.\n- We recommend using HTTPS in production and keeping your environment file out of version control.",
  },
  {
    keywords: ["supabase", "database", "db", "schema", "storage"],
    answer:
      "HighReach uses **Supabase** as its database backend. The `supabase/schema.sql` file sets up all required tables (contacts, messages, campaigns). You can run it once in your Supabase project to get started immediately.",
  },
  {
    keywords: ["setup", "install", "get started", "quick start", "configure", "environment", "env"],
    answer:
      "To get started with HighReach:\n1. Read `docs/META_SETUP.md` for Meta API setup.\n2. Create a Supabase project and run `supabase/schema.sql`.\n3. Copy `.env.example` to `.env.local` and fill in your credentials.\n4. Run `npm install && npm run dev`.\n5. Open `http://localhost:3000`.\n6. Create and get a Meta marketing template approved.\n7. Test with your own opted-in number first!",
  },
  {
    keywords: ["webhook", "verify token", "webhook verification", "meta webhook"],
    answer:
      "HighReach includes a **WhatsApp webhook endpoint** for receiving delivery status updates (sent, delivered, read, failed) and opt-out signals from Meta. During setup you'll configure a Verify Token in both `.env.local` and your Meta App's webhook settings.",
  },
  {
    keywords: ["limit", "cap", "maximum", "how many", "batch", "recipients", "bulk"],
    answer:
      "HighReach defaults to a **safe send cap of 50 recipients per action** to protect your WhatsApp sender quality rating. For large-scale campaigns, a durable queue worker should be added. Always respect Meta's current messaging tier limits.",
  },
  {
    keywords: ["contact us", "support", "help", "reach out", "reach highreach", "email", "phone support"],
    answer:
      "For support, feel free to use the HighReach dashboard or contact the HighReach team directly. We're here to help you run compliant, effective WhatsApp campaigns.",
  },
  {
    keywords: ["what can you do", "what questions", "help me", "what can i ask", "features"],
    answer:
      "I can answer questions about **HighReach services**, including:\n- 📋 Contact import & opt-in management\n- 📢 WhatsApp campaign sending\n- 🖼️ Media uploads (image/video/PDF)\n- 📊 Delivery analytics & logs\n- 🔐 Security & credentials\n- ⚙️ Setup & configuration\n- 📝 Message templates & personalisation\n\nWhat would you like to know?",
  },
];

const OUT_OF_SCOPE_REPLY =
  "I'm sorry, I can only answer questions about **HighReach services and the WhatsApp Campaign Manager platform**. For anything else, please contact the HighReach team directly. Is there something about our services I can help with?";

function findAnswer(userMessage: string): string {
  const lower = userMessage.toLowerCase().trim();

  // Greeting handling
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|sup|greetings)[\s!?.,]*$/.test(lower)) {
    return "👋 Hello! I'm the **HighReach Assistant**. I can answer questions about our WhatsApp Campaign Manager and related services. What would you like to know?";
  }

  // Thank you handling
  if (/^(thanks?|thank you|cheers|great|awesome|perfect|got it|ok|okay|cool|nice)[\s!?.]*$/.test(lower)) {
    return "You're welcome! 😊 Feel free to ask if you have any other questions about HighReach services.";
  }

  // Find best matching KB entry
  let bestMatch: KBEntry | null = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        score += kw.split(" ").length; // longer keyword phrases score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore > 0) {
    return bestMatch.answer;
  }

  return OUT_OF_SCOPE_REPLY;
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }
    if (message.trim().length > 500) {
      return NextResponse.json({ error: "Message too long." }, { status: 400 });
    }

    const answer = findAnswer(message);

    // Small simulated delay for realism (50-150ms)
    await new Promise((r) => setTimeout(r, 80));

    return NextResponse.json({ reply: answer });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
