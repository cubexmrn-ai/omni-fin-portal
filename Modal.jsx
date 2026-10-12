"use client";

// components/community/Modal.jsx
//
// A reusable fixed-overlay modal shell — the first true overlay modal in
// this codebase (components/academy/QuizModule.jsx's "ScoreCard" is an
// inline swapped-in card, not a position:fixed overlay with a backdrop).
// Used by both CreatePostModal.jsx (the "Share Trade Setup / Insight"
// form) and TradePostCard.jsx (the "Expand Setup" detail view).
//
// Deliberately minimal: no portal, no focus trap library — just a fixed
// backdrop + centered panel, Escape-to-close, backdrop-click-to-close,
// and body-scroll locking while open. Good enough for this app's scope
// without pulling in a new dependency.

import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, widthClassName }) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
    >
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6 ${
          widthClassName || "max-w-lg"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          {title && (
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
