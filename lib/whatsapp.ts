import { optionalEnv, requireEnv } from "./env";

function apiBase() {
  const version = optionalEnv("GRAPH_API_VERSION");
  if (!version || version === "vXX.X") {
    throw new Error("Set GRAPH_API_VERSION to the version shown in your Meta app dashboard, e.g. vXX.X.");
  }
  return `https://graph.facebook.com/${version}`;
}

async function metaFetch(path: string, init: RequestInit) {
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireEnv("WHATSAPP_ACCESS_TOKEN")}`,
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const message = data?.error?.message || `Meta API request failed (${response.status})`;
    const err = new Error(message) as Error & { meta?: any; status?: number };
    err.meta = data;
    err.status = response.status;
    throw err;
  }
  return data;
}

export async function uploadWhatsAppMedia(file: File) {
  const phoneNumberId = requireEnv("WHATSAPP_PHONE_NUMBER_ID");
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("file", file, file.name);

  return metaFetch(`/${phoneNumberId}/media`, {
    method: "POST",
    body: form,
  });
}

type TemplateSendInput = {
  to: string;
  templateName: string;
  languageCode: string;
  bodyValues?: string[];
  headerMediaId?: string;
  headerType?: "image" | "video" | "document";
};

export async function sendTemplateMessage(input: TemplateSendInput) {
  const phoneNumberId = requireEnv("WHATSAPP_PHONE_NUMBER_ID");
  const components: any[] = [];

  if (input.headerMediaId && input.headerType) {
    components.push({
      type: "header",
      parameters: [
        {
          type: input.headerType,
          [input.headerType]: { id: input.headerMediaId },
        },
      ],
    });
  }

  if (input.bodyValues?.length) {
    components.push({
      type: "body",
      parameters: input.bodyValues.map((text) => ({ type: "text", text })),
    });
  }

  return metaFetch(`/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: input.to,
      type: "template",
      template: {
        name: input.templateName,
        language: { code: input.languageCode },
        ...(components.length ? { components } : {}),
      },
    }),
  });
}
