/**
 * TEACHAiD TTS — xAI / SpaceXAI Grok voices (primary).
 * Env: XAI_API_KEY (same as chat)
 *
 * POST { text, model, tier, speed? }
 * model: xai:eve | xai:ara | xai:leo | xai:rex | xai:sal | xai:celeste | …
 *        (prefix xai: optional — bare voice id also works)
 *
 * Basic tier should not call this (on-device speech).
 * Pro tier uses Grok TTS: POST https://api.x.ai/v1/tts
 */
const XAI_VOICES = new Set([
  "altair",
  "ara",
  "atlas",
  "carina",
  "castor",
  "celeste",
  "cosmo",
  "eve",
  "helios",
  "helix",
  "iris",
  "kepler",
  "leo",
  "rex",
  "sal",
]);

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "GET") {
    return res.status(200).json({
      provider: "xai",
      xai: Boolean(process.env.XAI_API_KEY),
      voices: [...XAI_VOICES],
      note: "Pro uses Grok TTS via XAI_API_KEY. Basic uses on-device speech.",
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
      error: "Grok neural voices are Pro only. Basic uses on-device speech.",
    });
  }

  const key = process.env.XAI_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: "XAI_API_KEY not set on server for Grok TTS",
      fallback: "browser",
    });
  }

  const text = String(body?.text || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);
  if (!text) return res.status(400).json({ error: "Missing text" });

  let model = String(body?.model || body?.voice_id || "xai:eve").toLowerCase();
  if (model.startsWith("xai:")) model = model.slice(4);
  if (model.startsWith("openai:")) {
    // map old openai ids → xai voices
    const map = {
      nova: "eve",
      shimmer: "ara",
      alloy: "celeste",
      echo: "leo",
      fable: "sal",
      onyx: "rex",
    };
    model = map[model.slice(7)] || "eve";
  }
  if (model.startsWith("elevenlabs:")) model = "eve";
  const voiceId = XAI_VOICES.has(model) ? model : "eve";

  let speed = Number(body?.speed);
  if (!Number.isFinite(speed)) speed = 1.0;
  speed = Math.min(1.5, Math.max(0.7, speed));

  try {
    const r = await fetch("https://api.x.ai/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voice_id: voiceId,
        language: "en",
        speed,
        text_normalization: true,
        output_format: {
          codec: "mp3",
          sample_rate: 24000,
          bit_rate: 128000,
        },
      }),
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(r.status).json({
        error: err.slice(0, 400) || r.statusText,
        fallback: "browser",
      });
    }

    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-TEACHAiD-Voice", voiceId);
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(502).json({
      error: e.message || "xAI TTS failed",
      fallback: "browser",
    });
  }
};
