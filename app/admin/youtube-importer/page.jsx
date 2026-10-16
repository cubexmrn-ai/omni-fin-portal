"use client";

// app/admin/youtube-importer/page.jsx
//
// Admin control panel for the YouTube-to-Financial-Blog pipeline (see
// lib/youtubeBlogPipeline.js for the full backend). Deliberately
// simple — a passkey gate (not real multi-user auth, per spec), a
// bulk URL textarea, and a queue status table. Not linked from any
// public nav; reachable only by typing the URL directly. The passkey
// is kept in sessionStorage only (cleared when the tab closes) so it
// survives a page refresh but never persists like a real session
// would — this is an informal gate, not a security boundary.

import { useEffect, useState } from "react";

const SESSION_KEY = "omnifin-admin-youtube-passkey";

const STATUS_STYLES = {
  pending: "bg-slate-100 text-slate-600 border-slate-200",
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
};

const FAILURE_LABELS = {
  invalid_url: "Failed: Invalid URL",
  no_transcript: "Failed: No Transcript",
  no_gemini_key: "Failed: No Gemini Key Configured",
  generation_failed: "Failed: AI Generation Error",
};

function StatusBadge({ row }) {
  const status = row.status || "pending";
  const label =
    status === "failed"
      ? row.failure_label || FAILURE_LABELS[row.failure_reason] || "Failed"
      : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        STATUS_STYLES[status] || STATUS_STYLES.pending
      }`}
    >
      {label}
    </span>
  );
}

export default function YoutubeImporterAdminPage() {
  const [passkeyInput, setPasskeyInput] = useState("");
  const [passkey, setPasskey] = useState(null);
  const [authError, setAuthError] = useState("");

  const [urlsText, setUrlsText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [notice, setNotice] = useState("");

  // Restore a passkey saved earlier this tab session, if any.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) setPasskey(saved);
    } catch {
      // sessionStorage can throw in some private-browsing contexts —
      // just means the gate has to be re-entered, nothing breaks.
    }
  }, []);

  async function loadRows(key) {
    setLoadingRows(true);
    try {
      const res = await fetch("/api/admin/youtube-importer", {
        headers: { "x-admin-passkey": key },
        cache: "no-store",
      });
      if (res.status === 401) {
        setAuthError("Incorrect passkey.");
        setPasskey(null);
        try {
          sessionStorage.removeItem(SESSION_KEY);
        } catch {
          // ignore
        }
        return;
      }
      const data = await res.json();
      setRows(Array.isArray(data.rows) ? data.rows : []);
    } catch {
      setNotice("Couldn't load the queue right now — try refreshing.");
    } finally {
      setLoadingRows(false);
    }
  }

  useEffect(() => {
    if (passkey) loadRows(passkey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passkey]);

  function handleUnlock(e) {
    e.preventDefault();
    setAuthError("");
    const key = passkeyInput.trim();
    if (!key) return;
    try {
      sessionStorage.setItem(SESSION_KEY, key);
    } catch {
      // ignore — the gate still works for this page load either way.
    }
    setPasskey(key);
  }

  async function handleSubmitUrls(e) {
    e.preventDefault();
    const urls = urlsText
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    if (urls.length === 0 || !passkey) return;

    setSubmitting(true);
    setNotice(`Processing ${urls.length} URL${urls.length === 1 ? "" : "s"} — fetching transcripts and generating articles. This can take a minute or two per video.`);
    try {
      const res = await fetch("/api/admin/youtube-importer", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-passkey": passkey },
        body: JSON.stringify({ urls }),
      });
      if (res.status === 401) {
        setAuthError("Incorrect passkey.");
        setPasskey(null);
        return;
      }
      const data = await res.json();
      if (data.error) {
        setNotice(data.error);
      } else {
        const publishedCount = (data.results || []).filter((r) => r.status === "published").length;
        const failedCount = (data.results || []).filter((r) => r.status === "failed").length;
        setNotice(`Done — ${publishedCount} published, ${failedCount} failed.`);
        setUrlsText("");
      }
      await loadRows(passkey);
    } catch {
      setNotice("Something went wrong submitting the batch — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!passkey) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-950 px-4">
        <form
          onSubmit={handleUnlock}
          className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        >
          <h1 className="text-lg font-bold text-slate-50">Admin Access</h1>
          <p className="mt-1 text-sm text-slate-400">
            YouTube-to-Financial-Blog Importer — enter the admin passkey to continue.
          </p>
          <input
            type="password"
            value={passkeyInput}
            onChange={(e) => setPasskeyInput(e.target.value)}
            placeholder="Admin passkey"
            autoFocus
            className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          {authError && <p className="mt-2 text-xs font-semibold text-rose-400">{authError}</p>}
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Unlock
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-xl font-bold text-slate-50">YouTube-to-Financial-Blog Importer</h1>
        <p className="mt-1 text-sm text-slate-400">
          Paste YouTube URLs below. Each one gets a real transcript check, then a Gemini-generated
          SEO article — videos with no available transcript are rejected automatically, never
          published with a placeholder.
        </p>

        <form onSubmit={handleSubmitUrls} className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <label htmlFor="yt-urls" className="mb-1.5 block text-sm font-semibold text-slate-200">
            Paste YouTube URLs (one per line)
          </label>
          <textarea
            id="yt-urls"
            value={urlsText}
            onChange={(e) => setUrlsText(e.target.value)}
            rows={6}
            placeholder={"https://www.youtube.com/watch?v=...\nhttps://youtu.be/..."}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting || !urlsText.trim()}
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Processing…" : "Process & Add to Queue"}
            </button>
            {notice && <p className="text-xs text-slate-400">{notice}</p>}
          </div>
        </form>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-50">Queue Status</h2>
            <button
              type="button"
              onClick={() => loadRows(passkey)}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300"
            >
              {loadingRows ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-2.5">Title / URL</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-sm text-slate-500">
                      No submissions yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-2.5 text-slate-200">
                        <p className="font-medium">{row.video_title || row.url}</p>
                        {row.video_title && <p className="text-xs text-slate-500">{row.url}</p>}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge row={row} />
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">
                        {row.submitted_at ? new Date(row.submitted_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
