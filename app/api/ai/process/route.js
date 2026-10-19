// app/api/ai/process/route.js
//
// Shared lightweight AI endpoint for the Utility Tools Suite's AI
// tools (Phase 2 of the suite roadmap). POST { task, text } ->
// { ok, status, result? }. Currently supports task: "summarize"
// (components/tools/DocumentSummarizerTool.jsx) — more tasks (e.g. a
// future regex generator) can be added as additional `case`s below
// without a new route, keeping all server-side Gemini calls for this
// suite behind one endpoint.
//
// GRACEFUL FALLBACK (required by the roadmap): if GEMINI_API_KEY isn't
// configured, this ALWAYS returns HTTP 200 with
// { ok: false, status: "not_configured" } rather than a 4xx/5xx —
// same "always valid JSON, never rely on the HTTP status for an
// expected/known state" convention as app/api/news-ai/route.js. The
// calling tool component renders a clean inline notice for that exact
// status rather than a generic error — see
// components/tools/DocumentSummarizerTool.jsx.
//
// Every static, client-side tool in app/tools/* has zero dependency on
// this route — a missing key only affects the small number of AI
// tools that explicitly call it.

import { geminiComplete } from "@/lib/geminiClient";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Keep the prompt (and therefore cost/latency) bounded regardless of
// what a user pastes in — a document far longer than this is
// truncated before being sent to Gemini at all.
const MAX_INPUT_CHARS = 20000;

function buildSummarizePrompt(text) {
  return [
    "Summarize the following document for a busy reader.",
    "Return 4-6 concise bullet points covering only the key facts, decisions, or takeaways actually present in the text.",
    "Do not add information, opinions, or facts that are not in the text itself. Do not include a preamble like 'Here is a summary' — return only the bullet points.",
    "",
    "Document:",
    text,
  ].join("\n");
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, status: "bad_request", message: "Invalid JSON body." }, { status: 200 });
  }

  const { task, text } = body || {};

  if (!text || typeof text !== "string" || !text.trim()) {
    return Response.json(
      { ok: false, status: "bad_request", message: "No text provided." },
      { status: 200 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        ok: false,
        status: "not_configured",
        message:
          "AI features aren't configured on this deployment yet — a GEMINI_API_KEY environment variable is required. See env.example.",
      },
      { status: 200 }
    );
  }

  const trimmedText = text.slice(0, MAX_INPUT_CHARS);

  let prompt;
  switch (task) {
    case "summarize":
      prompt = buildSummarizePrompt(trimmedText);
      break;
    default:
      return Response.json(
        { ok: false, status: "bad_request", message: `Unknown task: "${task}".` },
        { status: 200 }
      );
  }

  const result = await geminiComplete(prompt, apiKey, 600);

  if (!result) {
    return Response.json(
      {
        ok: false,
        status: "ai_unavailable",
        message: "The AI model didn't return a result just now — please try again in a moment.",
      },
      { status: 200 }
    );
  }

  return Response.json({
    ok: true,
    status: "success",
    result,
    truncated: text.length > MAX_INPUT_CHARS,
  });
}
