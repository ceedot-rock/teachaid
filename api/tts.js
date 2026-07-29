/**
 * TEACHAiD Pro neural TTS.
 * Basic tier never hits this route (browser speech only).
 *
 * Env (optional — first match wins for provider):
 *   OPENAI_API_KEY  → OpenAI / compatible audio/speech
 *   OPENAI_TTS_BASE → default https://api.openai.com/v1
 *   ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID (optional)
 *
 * POST { text, model, tier }
 * model examples:
 *   openai:alloy | openai:nova | openai:shimmer | openai:echo | openai:fable | openai:onyx
 *   elevenlabs:default
 */
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") {
    return res.status(200).json({
      openai: Boolean(process.env.OPENAI_API_KEY),
      elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY),
      note: "Basic tier uses on-device speech; Pro cloud models need keys above.",
    });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }

  const tier = String(body?.tier || "basic");
  if (tier !== "pro") {
    return res.status(403).json({
      error: "Neural voices are Pro only. Basic uses on-device speech.",
    });
  }

  const text = String(body?.text || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 900);
  if (!text) return res.status(400).json({ error: "Missing text" });

  const model = String(body?.model || "openai:nova");
  const [provider, voice] = model.includes(":")
    ? model.split(":", 2)
    : ["openai", model];

  try {
    if (provider === "elevenlabs") {
      return await elevenlabs(res, text, voice);
    }
    // default openai-compatible
    return await openaiTts(res, text, voice || "nova");
  } catch (e) {
    return res.status(502).json({ error: e.message || "TTS failed" });
  }
};

async function openaiTts(res, text, voice) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return res.status(503).json({
      error:
        "Pro neural voices need OPENAI_API_KEY on the server (Vercel env). Basic voice still works on-device.",
      fallback: "browser",
    });
  }
  const base = (process.env.OPENAI_TTS_BASE || "https://api.openai.com/v1").replace(
    /\/$/,
    ""
  );
  const allowed = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
  const v = allowed.includes(voice) ? voice : "nova";
  const r = await fetch(`${base}/audio/speech`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL || "tts-1-hd",
      voice: v,
      input: text,
      response_format: "mp3",
    }),
  });
  if (!r.ok) {
    const err = await r.text();
    return res.status(r.status).json({
      error: err.slice(0, 300) || r.statusText,
      fallback: "browser",
    });
  }
  const buf = Buffer.from(await r.arrayBuffer());
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).send(buf);
}

async function elevenlabs(res, text, voiceId) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: "ELEVENLABS_API_KEY not set",
      fallback: "browser",
    });
  }
  const vid =
    voiceId && voiceId !== "default"
      ? voiceId
      : process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  const r = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${vid}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2",
      }),
    }
  );
  if (!r.ok) {
    const err = await r.text();
    return res.status(r.status).json({
      error: err.slice(0, 300) || r.statusText,
      fallback: "browser",
    });
  }
  const buf = Buffer.from(await r.arrayBuffer());
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).send(buf);
}
