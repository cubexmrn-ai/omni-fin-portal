"use client";

// components/PwaInstallHeaderButton.jsx
//
// Small, persistent header entry point for installing the PWA —
// mounted in components/Header.jsx next to the "Open Calculator"
// button. Unlike PwaInstallBanner.jsx, this never self-dismisses:
// a visitor who closed the floating banner still has this one
// always-available re-entry point, since it's a single unobtrusive
// button rather than something that competes for attention. Hidden
// entirely (renders null) whenever installing isn't currently
// possible — not installable yet, already installed, or already
// running standalone.

import { useState } from "react";
import { usePwaInstall } from "@/lib/usePwaInstall";
import IosInstallGuideModal from "@/components/IosInstallGuideModal";
import { trackEvent } from "@/lib/gtag";

export default function PwaInstallHeaderButton() {
  const { canPromptAndroid, canShowIosGuide, promptInstall } = usePwaInstall();
  const [iosGuideOpen, setIosGuideOpen] = useState(false);

  if (!canPromptAndroid && !canShowIosGuide) return null;

  async function handleClick() {
    if (canPromptAndroid) {
      trackEvent("pwa_install_prompt_shown", { surface: "header", platform: "android" });
      const choice = await promptInstall();
      trackEvent("pwa_install_prompt_outcome", {
        surface: "header",
        outcome: choice?.outcome || "unknown",
      });
      return;
    }
    trackEvent("pwa_install_prompt_shown", { surface: "header", platform: "ios" });
    setIosGuideOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title="Install OmniFin Portal as an app"
        className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-700 sm:inline-flex"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path
            d="M12 3v12m0 0-4-4m4 4 4-4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="hidden lg:inline">Install App</span>
      </button>

      {iosGuideOpen && <IosInstallGuideModal onClose={() => setIosGuideOpen(false)} />}
    </>
  );
}
