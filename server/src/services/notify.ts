import { toE164 } from "./phone.js";

type Data = Record<string, string | number>;
const n = (v: string | number | undefined) => Number(v ?? 0).toLocaleString("en-US");

// All customer messages live here, so the wording is easy to change.
const TEXT = {
  booking_received: (d: Data) => `GIGO Garage: we received your booking. Car ID ${d.carId}, position ${d.position} in the queue. We will confirm shortly.`,
  booking_confirmed: (d: Data) => `GIGO Garage: your booking ${d.carId} is confirmed.`,
  booking_done: (d: Data) => `GIGO Garage: your car (${d.carId}) is fixed and ready for pick-up.`,
  booking_cancelled: (d: Data) => `GIGO Garage: your booking ${d.carId} was cancelled. Contact us if this is a mistake.`,
  order_received: (d: Data) => `GIGO Garage: order ${d.orderNo} received. Total due now ${n(d.total)} BIF. We will confirm your payment shortly.`,
  order_paid: (d: Data) => `GIGO Garage: payment received for order ${d.orderNo}. Thank you.`,
  order_cancelled: (d: Data) => `GIGO Garage: your order ${d.orderNo} was cancelled. Contact us if this is a mistake.`,
  china_quoted: (d: Data) => `GIGO Garage: your China request ${d.requestNo} has a quote of ${n(d.quote)} BIF. Deposit to pay now: ${n(d.deposit)} BIF. Pay by Lumicash ${d.lumicash} or bank transfer, then send us the reference.`,
  china_arrived: (d: Data) => `GIGO Garage: your China request ${d.requestNo} has arrived in Burundi.`,
  china_ready: (d: Data) => `GIGO Garage: your China request ${d.requestNo} is ready for you.`,
};
export type NotifyEvent = keyof typeof TEXT;

const mask = (to: string) => `${to.slice(0, 4)}***${to.slice(-2)}`;

// A public form can name any phone number, so cap messages per number to stop it being used to spam or run up the bill.
const sent = new Map<string, { count: number; resetAt: number }>();
const allowed = (to: string) => {
  const max = Number(process.env.NOTIFY_MAX_PER_PHONE_DAY ?? 6);
  const now = Date.now();
  const e = sent.get(to);
  if (!e || e.resetAt < now) { sent.set(to, { count: 1, resetAt: now + 86_400_000 }); return true; }
  return e.count++ < max;
};

/** Sends one message through Twilio (SMS or WhatsApp). */
async function sendTwilio(to: string, body: string, channel: "sms" | "whatsapp") {
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_FROM: smsFrom, TWILIO_WHATSAPP_FROM: waFrom } = process.env;
  const from = channel === "whatsapp" ? waFrom : smsFrom;
  if (!sid || !token || !from) throw new Error("Twilio is not configured");
  const wa = (num: string) => (num.startsWith("whatsapp:") ? num : `whatsapp:${num}`);
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}` },
    body: new URLSearchParams({ To: channel === "whatsapp" ? wa(to) : to, From: channel === "whatsapp" ? wa(from) : from, Body: body }),
  });
  if (!res.ok) throw new Error(`Twilio responded ${res.status}`);
}

/**
 * Tells a customer about their booking, order or request. Never throws and never blocks:
 * a missing config or a provider outage must not break the booking or order itself.
 * NOTIFY_CHANNEL = sms | whatsapp; anything else (the default) sends nothing.
 */
export async function notify(event: NotifyEvent, rawPhone: string | null | undefined, data: Data): Promise<void> {
  try {
    const channel = process.env.NOTIFY_CHANNEL;
    if (!rawPhone || (channel !== "sms" && channel !== "whatsapp")) return;
    const to = toE164(rawPhone);
    if (!to) return console.warn("notify: unusable phone number, message not sent");
    if (!allowed(to)) return console.warn(`notify: daily limit reached for ${mask(to)}`);
    await sendTwilio(to, TEXT[event](data), channel);
  } catch (e) {
    console.error("notify failed:", e instanceof Error ? e.message : e);
  }
}
