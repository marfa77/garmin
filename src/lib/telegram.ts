export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    console.warn("[telegram] skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing");
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await res.json()) as { ok?: boolean };
    return Boolean(data.ok);
  } catch (err) {
    console.error("[telegram] send failed:", err instanceof Error ? err.message : err);
    return false;
  }
}

export async function notifyWaitlistSignup(params: {
  email: string;
  locale: string;
  total?: number;
}): Promise<boolean> {
  const totalLine = params.total != null ? `\nВсего в листе: ${params.total}` : "";
  const text = [
    "🟢 Garmin Wellness — waitlist",
    `Email: ${params.email}`,
    `Язык: ${params.locale.toUpperCase()}`,
    "Тариф: $10/мес",
    totalLine,
  ]
    .filter(Boolean)
    .join("\n");

  return sendTelegramMessage(text);
}
