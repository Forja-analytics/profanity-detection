// lib/llm.ts
import OpenAI from "openai";

export interface LlmMatch {
  word: string;
  severity: number; // 1-3
  start: number;
  end: number;
}

export interface LlmResult {
  contains_profanity: boolean;
  matches: LlmMatch[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function safeJson(s: string): any {
  try { return JSON.parse(s); } catch { return {}; }
}

function sanitizeMatch(original: string, m: any): LlmMatch | null {
  const word = String(m?.word ?? "").trim();
  let severity = Number(m?.severity ?? 0);
  let start = Number(m?.start ?? -1);
  let end = Number(m?.end ?? -1);

  if (!word) return null;
  if (!Number.isFinite(severity) || severity < 1 || severity > 3) severity = 2;

  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end <= start || end > original.length) {
    const idx = original.toLowerCase().indexOf(word.toLowerCase());
    if (idx >= 0) { start = idx; end = idx + word.length; } else { return null; }
  }

  return { word: original.slice(start, end), severity, start, end };
}

export async function llmDetect(
  text: string,
  whitelist: string[],
  blacklist: { phrase: string; severity: number }[],
): Promise<LlmResult> {
  const wlStr = (whitelist || []).filter(Boolean).join(", ") || "none";
  const blStr = (blacklist || []).length
    ? blacklist.map(b => `${b.phrase}(sev=${b.severity})`).join(", ")
    : "none";

  const system =
    "You are a strict profanity classifier. Return only valid JSON. " +
    "Use severity: 1 (mild), 2 (medium), 3 (strong insult). " +
    "Never flag whitelist terms. Always flag blacklist terms if present.";

  const user =
    `TEXT: """${text}"""\n\n` +
    `WHITELIST (do not flag): ${wlStr}\n` +
    `BLACKLIST (always flag): ${blStr}\n\n` +
    "Respond as JSON with keys: contains_profanity (boolean), " +
    "matches (array of {word, severity, start, end}). " +
    "Indexes must be 0-based positions in the ORIGINAL TEXT.";

  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const raw = resp.choices?.[0]?.message?.content ?? "{}";
    const parsed = safeJson(raw);

    const rawMatches: any[] = Array.isArray(parsed.matches) ? parsed.matches : [];
    const matches = rawMatches
      .map(m => sanitizeMatch(text, m))
      .filter(Boolean) as LlmMatch[];

    return {
      contains_profanity: Boolean(parsed.contains_profanity) || matches.length > 0,
      matches,
    };
  } catch (e) {
    console.warn("LLM detection failed, fallback to rule-based only.", e);
    return { contains_profanity: false, matches: [] };
  }
}
