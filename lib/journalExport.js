// lib/journalExport.js
//
// CSV/JSON export + import for the Trading & Asset Journal — the
// actual, working way to move entries to another device or back them
// up today, since there's no account/cloud-sync system on this site
// (see hooks/useTradingJournal.js's header note).
//
// Browser-only (Blob + <a download>), so every export function is a
// no-op outside the browser — fine here since components/journal/
// JournalHub.jsx ("use client") is the only caller.

function triggerDownload(filename, content, mimeType) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

/** Exports ALL journal entries (every category) as one JSON file —
 * the lossless format, since it round-trips every raw field exactly,
 * including ones a CSV export might not have a column for. */
export function exportJournalAsJson(entries) {
  const payload = {
    exportedAt: new Date().toISOString(),
    source: "OmniFin Portal Trading & Asset Journal",
    entries,
  };
  triggerDownload(
    `omnifin-journal-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(payload, null, 2),
    "application/json"
  );
}

/** Exports one category's entries as CSV — human/spreadsheet-friendly,
 * with a fixed column set per category (raw fields only; the derived
 * P&L/cap-rate figures are recomputed from those raw fields on import
 * or on any later view, so they're left out of the file itself to
 * avoid two sources of truth for the same number). */
export function exportCategoryAsCsv(category, entries) {
  const fieldKeys = category.fields.map((f) => f.key);
  const header = ["id", "createdAt", ...fieldKeys];
  const rows = entries.map((entry) =>
    header.map((key) => csvEscape(entry[key])).join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");
  triggerDownload(
    `omnifin-journal-${category.id}-${new Date().toISOString().slice(0, 10)}.csv`,
    csv,
    "text/csv"
  );
}

/** Parses a small, well-formed CSV (quoted-field aware) back into an
 * array of row objects keyed by its header row. Intentionally simple —
 * this only needs to round-trip files this same export function
 * produced, not arbitrary third-party CSVs. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && next === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  if (rows.length === 0) return [];

  const header = rows[0];
  return rows.slice(1).filter((r) => r.length > 1 || r[0] !== "").map((r) => {
    const obj = {};
    header.forEach((key, i) => {
      obj[key] = r[i] ?? "";
    });
    return obj;
  });
}

/** Reads a File (from an <input type="file"> change event) as text,
 * returning a promise — used by JournalHub for both JSON and CSV
 * imports. */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Could not read file"));
    reader.readAsText(file);
  });
}
