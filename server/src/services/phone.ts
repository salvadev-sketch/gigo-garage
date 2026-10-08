/** Turns what a customer typed ("79 123 456", "+257 79 123 456", "0025779123456") into +25779123456, or null if it is not a usable number. */
export function toE164(raw: string, countryCode = process.env.DEFAULT_COUNTRY_CODE ?? "257"): string | null {
  let p = raw.replace(/[\s\-().]/g, "");
  if (p.startsWith("00")) p = `+${p.slice(2)}`;
  if (!p.startsWith("+")) {
    p = p.replace(/^0+/, "");
    p = p.startsWith(countryCode) && p.length >= countryCode.length + 8 ? `+${p}` : `+${countryCode}${p}`;
  }
  return /^\+[1-9]\d{7,14}$/.test(p) ? p : null;
}
