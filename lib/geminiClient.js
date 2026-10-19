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
// the same reasons documented there: gemini-1.5-flash was RETIRED by
// Google ("models/gemini-1.5-flash is not found", 404) — it is NOT a
// safe "latest working version" to hardcode here, despite still being
// the name most documentation/examples reference from memory. The
// fallback chain below tries the two current Gemini Flash generations
// first and only drops to gemini-2.5-flash as a last resort, in case a
// given API key/project hasn't been migrated to the newer models yet.
//
// GEMINI_MODEL (optional env var, read fresh on every call — see
// getModelCandidates() below) lets a specific deployment pin an exact
// model string (e.g. whatever Google's current standard stable Flash
// release is at the time) WITHOUT a code change or redeploy, by trying
// it first, ahead of this file's own fallback chain. Unset by default.
//
// A 503 ("UNAVAILABLE" — transient overload) is retried once per
// model; any other non-OK status (404 not-found, 400 bad request, 403
// key/permission, 429 quota) moves on to the next model candidate
// immediately rather than wasting a retry on an error that won't
// resolve itself.

const GEMINI_MODEL_CANDIDATES = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-2.5-flash"];

function getModelCandidates() {
  const override = process.env.GEMINI_MODEL;
  if (!override || GEMINI_MODEL_CANDIDATES.includes(override)) return GEMINI_MODEL_CANDIDATES;
  return [override, ...GEMINI_MODEL_CANDIDATES];
}

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
 * blocked by a safety filter, or no text in the response) — callers
 * treat null as "AI unavailable right now" and should fail gracefully,
 * never throw a raw error up to the user. `apiKey` is whatever the
 * caller read from process.env.GEMINI_API_KEY (this file never reads
 * env vars for the key itself, only for the optional GEMINI_MODEL
 * override above, so a missing key is caught by the caller before
 * this function is ever invoked — see app/api/ai/process/route.js).
 */
export async function geminiComplete(prompt, apiKey, maxOutputTokens = 512) {
  for (const model of getModelCandidates()) {
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
          break; // 404/400/403/429 etc — this model/key won't recover; try the next candidate
        }
        const data = await res.json();
        // A response can be `ok` with zero candidates if the prompt or
        // output was blocked by Gemini's safety filters
        // (data.promptFeedback.blockReason) — that's not a transient
        // failure either, so it falls through to the next model
        // candidate exactly like any other "no usable text" case
        // rather than being retried.
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) break;
        return text;
      } catch {
        break; // network error or our own timeout — try the next candidate
      } finally {
        clearTimeout(timeout);
      }
    }
  }
  return null;
}
