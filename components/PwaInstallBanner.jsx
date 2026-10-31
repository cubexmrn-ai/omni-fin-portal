"use client";

// components/PwaInstallBanner.jsx
//
// Floating, dismissible bottom bar — the primary PWA install surface.
// Mounted once, globally, in app/layout.jsx (same pattern as
// GoogleAnalytics/AdSense: self-contained, renders nothing until the
// hook's effect runs on the client, and is a safe no-op everywhere it
// doesn't apply). Renders nothing at all unless:
//   - the visitor is on Android/Chrome and the browser has handed over
//     a real deferred `beforeinstallprompt` event, or
//   - the visitor is on iOS/iPadOS Safari (no native prompt exists
//     there, so this offers the manual-install guide instead)
// ...and even then, nothing if already running standalone or dismissed
// within the last 7 days.
//
// Positioned at `bottom-16` rather than flush with the viewport edge
// to clear components/StickyBottomTicker.jsx's single-row collapsed
// height (that ticker can also expand to two rows when open — a pixel
// -perfect handoff between the two would require coupling this to the
// ticker's own open/closed state, which isn't worth it for a dismissible
// banner the visitor can close in one tap; this fixed offset is a
// deliberate, accepted approximation).

import { useState } from "react";
import { usePwaInstall } from "@/lib/usePwaInstall";
import IosInstallGuideModal from "@/components/IosInstallGuideModal";
import { trackEvent } from "@/lib/gtag";

export default function PwaInstallBanner() {
  const { canPromptAndroid, canShowIosGuide, isDismissed, promptInstall, dismiss } = usePwaInstall();
  const [iosGuideOpen, setIosGuideOpen] = useState(false);

  if (isDismissed) return null;
  if (!canPromptAndroid && !canShowIosGuide) return null;

  async function handleInstallClick() {
    if (canPromptAndroid) {
      trackEvent("pwa_install_prompt_shown", { surface: "banner", platform: "android" });
      const choice = await promptInstall();
      trackEvent("pwa_install_prompt_outcome", {
        surface: "banner",
        outcome: choice?.outcome || "unknown",
      });
      return;
    }
    trackEvent("pwa_install_prompt_shown", { surface: "banner", platform: "ios" });
    setIosGuideOpen(true);
  }

  function handleDismiss() {
    trackEvent("pwa_install_banner_dismissed", {});
    dismiss();
  }

  return (
    <>
      <div
        role="dialog"
        aria-label="Install OmniFin Portal app"
        className="fixed inset-x-4 bottom-16 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg sm:inset-x-auto sm:right-4 sm:bottom-16"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path
              d="M12 3v12m0 0-4-4m4 4 4-4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">Install OmniFin App</p>
          <p className="truncate text-xs text-slate-500">Fast, full-screen access from your home screen.</p>
        </div>
        <button
          type="button"
          onClick={handleInstallClick}
          className="shrink-0 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
        >
          Install
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {iosGuideOpen && (
        <IosInstallGuideModal
          onClose={() => {
            setIosGuideOpen(false);
            dismiss();
          }}
        />
      )}
    </>
  );
}
