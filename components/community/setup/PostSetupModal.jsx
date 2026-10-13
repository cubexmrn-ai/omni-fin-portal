"use client";

// components/community/setup/PostSetupModal.jsx
//
// "Post a Setup" trigger + form modal for the Setup Sharing Board.
// Submits via hooks/useTradeSetups.js's addSetup(), which prepends the
// new setup to an in-memory + localStorage-backed list so it renders
// on the board immediately — no backend required, same "local storage
// submission fallback" convention as components/community/
// CreatePostModal.jsx. Reuses the project's existing Modal shell.

import { useState } from "react";
import Modal from "@/components/community/Modal";
import { INSTRUMENT_OPTIONS } from "@/lib/tradeSetupsData";

function emptyForm() {
  return {
    instrumentCode: INSTRUMENT_OPTIONS[0]?.code || "XAU",
    bias: "buy",
    entry: "",
    stopLoss: "",
    takeProfit: "",
    rationale: "",
  };
}

export default function PostSetupModal({ onSubmit }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleClose() {
    setOpen(false);
    setError("");
    setForm(emptyForm());
  }

  function handleSubmit(e) {
    e.preventDefault();

    const entry = Number(form.entry);
    const stopLoss = Number(form.stopLoss);
    const takeProfit = Number(form.takeProfit);

    if (!Number.isFinite(entry) || !Number.isFinite(stopLoss) || !Number.isFinite(takeProfit)) {
      setError("Entry, Stop Loss and Take Profit must all be numbers.");
      return;
    }
    if (!form.rationale.trim()) {
      setError("Add a short technical rationale for this setup.");
      return;
    }

    onSubmit({
      instrumentCode: form.instrumentCode,
      bias: form.bias,
      entry,
      stopLoss,
      takeProfit,
      rationale: form.rationale.trim(),
    });

    handleClose();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
      >
        + Post a Setup
      </button>

      <Modal open={open} onClose={handleClose} title="Post a trade setup" widthClassName="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600">Asset</label>
              <select
                value={form.instrumentCode}
                onChange={(e) => updateField("instrumentCode", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                {INSTRUMENT_OPTIONS.map((instrument) => (
                  <option key={instrument.code} value={instrument.code}>
                    {instrument.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">Bias</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateField("bias", "buy")}
                  className={`rounded-lg border px-2 py-2 text-xs font-bold transition ${
                    form.bias === "buy"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => updateField("bias", "sell")}
                  className={`rounded-lg border px-2 py-2 text-xs font-bold transition ${
                    form.bias === "sell"
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  Sell
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600">Entry</label>
              <input
                type="number"
                step="any"
                value={form.entry}
                onChange={(e) => updateField("entry", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">Stop Loss</label>
              <input
                type="number"
                step="any"
                value={form.stopLoss}
                onChange={(e) => updateField("stopLoss", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">Take Profit</label>
              <input
                type="number"
                step="any"
                value={form.takeProfit}
                onChange={(e) => updateField("takeProfit", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Technical Rationale / Analysis
            </label>
            <textarea
              value={form.rationale}
              onChange={(e) => updateField("rationale", e.target.value)}
              placeholder="What's the setup, and what would invalidate it?"
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              maxLength={2000}
            />
          </div>

          {error && <p className="text-xs font-medium text-rose-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Post Setup
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
