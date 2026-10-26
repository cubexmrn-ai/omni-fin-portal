"use client";

// components/community/CreatePostModal.jsx
//
// "Share Trade Setup / Insight" trigger button + form modal. Submits via
// hooks/useCommunityPosts.js's addPost() — signed in, a post goes
// straight to the real community_posts table; signed out, it now also
// reaches that same table through a friction-free guest path (Oct
// 2026 — see that hook's header comment), using just the display
// handle below, never an email or password. Only on a deployment with
// no Supabase project configured at all does a post fall back to
// this browser's own local-only storage.

import { useState } from "react";
import Modal from "@/components/community/Modal";
import { CATEGORIES, ASSET_TAGS, BIAS_OPTIONS } from "@/lib/communityData";

const POSTABLE_CATEGORIES = CATEGORIES.filter((c) => c.id !== "all");
const MAX_HANDLE_LENGTH = 24;

function emptyForm() {
  return {
    title: "",
    category: POSTABLE_CATEGORIES[0]?.id || "setups",
    assetTag: "",
    bias: "none",
    entry: "",
    stopLoss: "",
    takeProfit: "",
    body: "",
  };
}

function toNullableNumber(value) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default function CreatePostModal({ onSubmit, isSignedIn, guestHandle, onGuestHandleChange }) {
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
    if (!form.title.trim()) {
      setError("Give your post a title.");
      return;
    }
    if (!form.body.trim()) {
      setError("Add a short description or thesis for your post.");
      return;
    }

    onSubmit({
      title: form.title.trim(),
      category: form.category,
      assetTags: form.assetTag ? [form.assetTag] : [],
      bias: form.bias === "none" ? "none" : form.bias,
      entry: form.bias === "none" ? null : toNullableNumber(form.entry),
      stopLoss: form.bias === "none" ? null : toNullableNumber(form.stopLoss),
      takeProfit:
        form.bias === "none" ? null : toNullableNumber(form.takeProfit),
      body: form.body.trim(),
    });

    handleClose();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
      >
        + Share Trade Setup / Insight
      </button>

      <Modal
        open={open}
        onClose={handleClose}
        title="Share a trade setup or insight"
        widthClassName="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSignedIn && (
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Post as
              </label>
              <input
                type="text"
                value={guestHandle || ""}
                onChange={(e) => onGuestHandleChange?.(e.target.value)}
                placeholder="Guest1234"
                maxLength={MAX_HANDLE_LENGTH}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                No account needed — this display name is remembered on this browser.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. XAU/USD reclaiming the 2,640 shelf"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
              maxLength={120}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
              >
                {POSTABLE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600">
                Asset Tag
              </label>
              <select
                value={form.assetTag}
                onChange={(e) => updateField("assetTag", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
              >
                <option value="">No tag</option>
                {ASSET_TAGS.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Bias
            </label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {BIAS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateField("bias", opt.id)}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                    form.bias === opt.id
                      ? opt.id === "long"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : opt.id === "short"
                        ? "border-rose-300 bg-rose-50 text-rose-700"
                        : "border-slate-300 bg-slate-100 text-slate-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {opt.id === "long"
                    ? "Long"
                    : opt.id === "short"
                    ? "Short"
                    : "Discussion"}
                </button>
              ))}
            </div>
          </div>

          {form.bias !== "none" && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Entry (optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.entry}
                  onChange={(e) => updateField("entry", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Stop Loss (optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.stopLoss}
                  onChange={(e) => updateField("stopLoss", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Take Profit (optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.takeProfit}
                  onChange={(e) => updateField("takeProfit", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600">
              Content
            </label>
            <textarea
              value={form.body}
              onChange={(e) => updateField("body", e.target.value)}
              placeholder="Share your thesis, what you&apos;re watching, or what would invalidate it..."
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
              maxLength={2000}
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-rose-600">{error}</p>
          )}

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
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Post
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
