"use client";

// components/IosInstallGuideModal.jsx
//
// iOS/iPadOS Safari never fires `beforeinstallprompt` (not supported by
// the platform at all), so there is no native dialog to launch — the
// only thing a page can do is walk the visitor through the manual
// Share -> Add to Home Screen flow. Shared by both PwaInstallBanner.jsx
// and PwaInstallHeaderButton.jsx so the instructions stay identical
// wherever the visitor triggers them from.

export default function IosInstallGuideModal({ onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Install OmniFin Portal on iOS"
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Install OmniFin Portal</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-600">
          Safari on iPhone and iPad installs apps through the Share menu, not an app store. Add
          OmniFin Portal to your Home Screen for full-screen, one-tap access:
        </p>

        <ol className="mt-4 space-y-3 text-sm text-slate-700">
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
              1
            </span>
            <span className="pt-0.5">
              Tap the <strong>Share</strong> icon{" "}
              <svg viewBox="0 0 24 24" fill="none" className="mx-0.5 inline-block h-4 w-4 align-text-bottom" aria-hidden="true">
                <path
                  d="M12 3v12m0-12 4 4m-4-4-4 4M6 11v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>{" "}
              in Safari&apos;s toolbar.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
              2
            </span>
            <span className="pt-0.5">
              Scroll down and tap <strong>Add to Home Screen</strong>.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
              3
            </span>
            <span className="pt-0.5">
              Tap <strong>Add</strong> in the top-right corner to finish.
            </span>
          </li>
        </ol>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
