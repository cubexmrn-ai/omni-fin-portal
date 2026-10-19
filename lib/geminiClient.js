// lib/geminiClient.js
//
// Minimal, standalone Gemini REST client for the Utility Tools Suite's
// AI endpoint (app/api/ai/process/route.js). Deliberately a SEPARATE,
// self-contained copy rather than importing the private geminiComplete()
// helpers already living inside lib/newsAggregator.js / lib/sentimentEngine.js
// — those two files are load-bearing for existing, already-shipped
// features (headline summaries, macro sentiment), and this file's job
// (free-form document summarization) has different prompt shape and
// output-length needs. Duplicating this small, well-understood
// request/retry shape costs far less than risking a regression in
// either of those two files for an unrelated new feature.
//
// Same model-fallback list and 503-retry logic as those two files, for
// the same reasons documented there: gemini-1.5-flash was retired by
// Google ("model not found", 404), and gemini-2.5-flash is kept as the
// last-resort candidate in case a given API key/region hasn't been
// migrated to the newer models yet. A 503 ("UNAVAILABLE" — transient
// overload) is retried once per model; any other non-OK status moves
// on to the next model candidate immediately.

const GEMINI_MODEL_CANDIDATES = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-2.5-flash"];

const GEMINI_API_URL_FOR = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const GEMINI_RETRY_DELAY_MS = 1000;
const GEMINI_MAX_ATTEMPTS_PER_MODEL = 2;
const GEMINI_TIMEOUT_MS = 20000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generic Gemini text completion. Returns the generated text, or null
 * if every model candidate failed (quota, not-found, network error,
 * or no text in the response) — callers treat null as "AI unavailable
 * right now" and should fail gracefully, never throw a raw error up
 * to the user.
 */
export async function geminiComplete(prompt, apiKey, maxOutputTokens = 512) {
  for (const model of GEMINI_MODEL_CANDIDATES) {
    for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS_PER_MODEL; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
      try {
        const res = await fetch(`${GEMINI_API_URL_FOR(model)}?key=${apiKey}`, {
          method: "POST",
          signal: controller.signal,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens },
          }),
        });
        if (!res.ok) {
          if (res.status === 503 && attempt < GEMINI_MAX_ATTEMPTS_PER_MODEL) {
            await sleep(GEMINI_RETRY_DELAY_MS * attempt);
            continue;
          }
          break; // try next model candidate
        }
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) break;
        return text;
      } catch {
        break;
      } finally {
        clearTimeout(timeout);
      }
    }
  }
  return null;
}
