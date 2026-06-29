// Roam — serverless AI endpoint (runs on Vercel)
// Holds your Anthropic API key (set as an env var, never in the code)
// and makes the real AI call for the deployed site.

const hits = new Map();           // best-effort per-IP throttle
const WINDOW_MS = 60_000;         // 1 minute window
const MAX_CALLS_PER_WINDOW = 9;   // ~3 full trip generations / IP / minute

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // crude rate limit to protect your bill from abuse
  const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  const now = Date.now();
  const rec = hits.get(ip) || { count: 0, start: now };
  if (now - rec.start > WINDOW_MS) { rec.count = 0; rec.start = now; }
  rec.count += 1;
  hits.set(ip, rec);
  if (rec.count > MAX_CALLS_PER_WINDOW) {
    return res.status(429).json({ error: "Busy right now — please wait a moment and try again." });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "Server not configured (missing API key)." });

  // parse body (Vercel usually parses JSON, but be safe)
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const prompt = body && body.prompt;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing prompt." });
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",   // Sonnet — richer, more specific plans (the whole point). Haiku id: claude-haiku-4-5-20251001
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      return res.status(502).json({ error: (data && data.error && data.error.message) || "AI service error." });
    }
    const text = Array.isArray(data.content)
      ? data.content.map((b) => (b && b.type === "text" ? b.text : "")).join("")
      : "";
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
