"use client";

// components/journal/JournalHub.jsx
//
// The interactive body of the Trading & Asset Journal (app/journal/
// page.jsx): category tabs (Forex & Crypto / Stocks / Real Estate),
// an "add entry" form generated from lib/journalSchema.js, a table of
// that category's entries with computed figures (P&L, cap rate, etc.),
// a running summary, and CSV/JSON export + import. Split out as its
// own "use client" component so app/journal/page.jsx itself can stay a
// plain server component with its own metadata export — same pattern
// as components/dashboard/DashboardHub.jsx and components/academy/
// AcademyHub.jsx.
//
// Everything here is read from and written to this browser's own
// localStorage via hooks/useTradingJournal.js — there is no account
// system on this site, so nothing syncs across devices today; the
// "Cloud Sync" panel below says that plainly instead of hiding it or
// faking a working toggle.

import { useRef, useState } from "react";
import { useTradingJournal } from "@/hooks/useTradingJournal";
import { JOURNAL_CATEGORIES, getCategory, COLUMN_LABELS } from "@/lib/journalSchema";
import {
  exportJournalAsJson,
  exportCategoryAsCsv,
  parseCsv,
  readFileAsText,
} from "@/lib/journalExport";

function emptyFormState(category) {
  const state = {};
  for (const field of category.fields) state[field.key] = "";
  return state;
}

function formatCell(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") return Number.isFinite(value) ? value.toFixed(2) : "—";
  return String(value);
}

function EntryForm({ category, onSubmit }) {
  const [form, setForm] = useState(() => emptyFormState(category));

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const missing = category.fields.filter((f) => f.required && !String(form[f.key] || "").trim());
    if (missing.length > 0) return;
    onSubmit(form);
    setForm(emptyFormState(category));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:grid-cols-2 lg:grid-cols-3"
    >
      {category.fields.map((field) => (
        <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2 lg:col-span-3" : ""}>
          <label className="block text-xs font-semibold text-slate-500">
            {field.label}
            {field.required && <span className="text-rose-500"> *</span>}
          </label>
          {field.type === "select" ? (
            <select
              value={form[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              <option value="">—</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : field.type === "textarea" ? (
            <textarea
              value={form[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            />
          ) : (
            <input
              type={field.type}
              step={field.step}
              placeholder={field.placeholder}
              value={form[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            />
          )}
        </div>
      ))}
      <div className="flex items-end sm:col-span-2 lg:col-span-3">
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Add Entry
        </button>
      </div>
    </form>
  );
}

function SummaryRow({ category, entries }) {
  const stats = category.summarize(entries);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{stat.label}</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function EntriesTable({ category, entries, onDelete }) {
  if (entries.length === 0) {
    return <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">No entries yet — add your first one above.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            {category.tableColumns.map((col) => (
              <th key={col} className="whitespace-nowrap px-3 py-2">
                {COLUMN_LABELS[col] || col}
              </th>
            ))}
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {entries
            .slice()
            .reverse()
            .map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50">
                {category.tableColumns.map((col) => (
                  <td key={col} className="whitespace-nowrap px-3 py-2 text-slate-700">
                    {formatCell(entry[col] ?? entry.derived?.[col])}
                  </td>
                ))}
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => onDelete(entry.id)}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function ExportImportBar({ allEntries, category, categoryEntries, onImport, importMessage }) {
  const fileInputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      let incoming = [];
      if (file.name.toLowerCase().endsWith(".json")) {
        const parsed = JSON.parse(text);
        incoming = Array.isArray(parsed) ? parsed : parsed.entries || [];
      } else {
        incoming = parseCsv(text).map((row) => ({ ...row, category: row.category || category.id }));
      }
      onImport(incoming);
    } catch {
      onImport([], "Could not read that file — make sure it's a JSON or CSV export from this Journal.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <button
        type="button"
        onClick={() => exportJournalAsJson(allEntries)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
      >
        Export All (JSON)
      </button>
      <button
        type="button"
        onClick={() => exportCategoryAsCsv(category, categoryEntries)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
      >
        Export {category.shortLabel} (CSV)
      </button>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
      >
        Import JSON/CSV
      </button>
      <input ref={fileInputRef} type="file" accept=".json,.csv" className="hidden" onChange={handleFileChange} />
      {importMessage && <span className="text-xs font-medium text-slate-500">{importMessage}</span>}
    </div>
  );
}

export default function JournalHub() {
  const journal = useTradingJournal();
  const [activeCategory, setActiveCategory] = useState(JOURNAL_CATEGORIES[0].id);
  const [importMessage, setImportMessage] = useState("");

  const category = getCategory(activeCategory);
  const categoryEntries = journal.entriesByCategory(activeCategory);

  function handleImport(incoming, errorMessage) {
    if (errorMessage) {
      setImportMessage(errorMessage);
      return;
    }
    const count = journal.importEntries(incoming);
    setImportMessage(count > 0 ? `Imported ${count} entr${count === 1 ? "y" : "ies"}.` : "Nothing to import.");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-2">
        {JOURNAL_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveCategory(c.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              activeCategory === c.id
                ? "bg-brand-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {!journal.hydrated ? (
        <p className="mt-6 text-sm text-slate-400">Loading your journal…</p>
      ) : (
        <div className="mt-5 space-y-5">
          <SummaryRow category={category} entries={categoryEntries} />
          <EntryForm category={category} onSubmit={(fields) => journal.addEntry(category.id, fields)} />
          <EntriesTable category={category} entries={categoryEntries} onDelete={journal.deleteEntry} />
          <ExportImportBar
            allEntries={journal.entries}
            category={category}
            categoryEntries={categoryEntries}
            onImport={handleImport}
            importMessage={importMessage}
          />

          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Cloud Sync</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              OmniFin Portal doesn&apos;t have an account/sign-in system yet, so there&apos;s nothing
              to sync this journal to across devices right now — everything above lives only in this
              browser&apos;s local storage. Use <strong>Export All (JSON)</strong> to back up or move
              your entries to another device in the meantime; cloud sync will land here once an
              account system exists.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
