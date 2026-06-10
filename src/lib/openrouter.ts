const DEFAULT_MODEL = process.env.OPENROUTER_COACH_MODEL || "google/gemini-2.5-flash";

export async function callOpenRouter(
  system: string,
  user: string,
  model = DEFAULT_MODEL
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://garmin-wellness.local",
      "X-Title": "Garmin Wellness Dashboard",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 280,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${text.slice(0, 200)}`);
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenRouter returned empty content");
  return content;
}
