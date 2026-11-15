export function normalizePhone(input: string): string {
  const digits = String(input || "").replace(/\D/g, "");
  if (!digits) return "";

  // Default 10-digit Indian numbers to country code 91.
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

export function looksLikePhone(phone: string): boolean {
  return /^\d{10,15}$/.test(phone);
}
