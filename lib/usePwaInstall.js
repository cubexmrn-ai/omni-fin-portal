"use client";

// lib/usePwaInstall.js
//
// Shared PWA-install state/logic, used by both components/
// PwaInstallBanner.jsx (the floating dismissible bar) and components/
// PwaInstallHeaderButton.jsx (the persistent header entry point) so
// neither duplicates the beforeinstallprompt capture, iOS detection,
// or dismissal persistence — both read from this one hook.
//
// THREE DEVICE PATHS, each genuinely different (no browser exposes a
// single unified "can this device install a PWA" API):
//   - Android/Chrome (and other Chromium browsers): fires a real
//     `beforeinstallprompt` event this hook captures and defers —
//     calling `.prompt()` later launches the native OS install dialog.
//   - iOS/iPadOS Safari: never fires `beforeinstallprompt` at all (not
//     supported), so there's nothing to defer — the only thing a page
//     can do is detect iOS and show a guide for the manual Share ->
//     Add to Home Screen flow. iPadOS 13+ reports its user-agent as a
//     desktop Mac, so `navigator.platform === "MacIntel"` alone can't
//     tell an iPad from a real Mac — `maxTouchPoints > 1` is the
//     standard disambiguator (a trackpad/mouse-only Mac reports 0).
//   - Already installed (standalone mode, any platform): nothing
//     should ever show. Checked via the standard
//     `(display-mode: standalone)` media query plus iOS Safari's own
//     non-standard `navigator.standalone` flag, since iOS doesn't
//     support the media-query form.
//
// Dismissal is a single localStorage timestamp ("show again after
// this time"), the same light per-viewer-convenience use of
// localStorage this project already uses elsewhere (e.g.
// NetWorthTracker's saved snapshot) — wrapped in try/catch since it
// can throw or silently no-op in a private window or with blocked
// site data, in which case this just re-prompts every session rather
// than breaking.

import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "omnifin_pwa_install_dismissed_until";
const DISMISS_DAYS = 7;

function isIosDevice() {
  const ua = window.navigator.userAgent || window.navigator.vendor || "";
  const isIphoneOrIpod = /iPad|iPhone|iPod/.test(ua);
  const isIpadOS13Plus = window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
  return isIphoneOrIpod || isIpadOS13Plus;
}

function isStandaloneMode() {
  const mediaQueryStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches === true;
  const iosStandalone = window.navigator.standalone === true; // iOS Safari only
  return mediaQueryStandalone || iosStandalone;
}

function readDismissedUntil() {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissedUntil, setDismissedUntil] = useState(0);
  const [installed, setInstalled] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setIsIOS(isIosDevice());
    setIsStandalone(isStandaloneMode());
    setDismissedUntil(readDismissedUntil());
    setNow(Date.now());

    function handleBeforeInstallPrompt(event) {
      // Chrome shows its own mini-infobar by default after this event
      // fires; preventDefault() suppresses that so this project's own
      // UI is the only install entry point, and the event is stashed
      // to fire later, on a real click rather than immediately.
      event.preventDefault();
      setDeferredPrompt(event);
    }
    function handleAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const isDismissed = now > 0 && now < dismissedUntil;
  // Android/Chrome path only counts as installable once the browser
  // has actually handed over a real deferred event — there is no
  // reliable earlier signal than that.
  const canPromptAndroid = Boolean(deferredPrompt) && !isStandalone && !installed;
  const canShowIosGuide = isIOS && !isStandalone && !installed;
  const canInstall = canPromptAndroid || canShowIosGuide;

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return null;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    // A BeforeInstallPromptEvent can only be prompted once — discard it
    // either way so a second click doesn't silently no-op.
    setDeferredPrompt(null);
    return choice;
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    try {
      window.localStorage.setItem(DISMISS_KEY, String(until));
    } catch {
      // Storage unavailable (private window, blocked site data) — the
      // in-memory state below still hides it for the rest of this tab's
      // session; it just won't persist across a reload.
    }
    setDismissedUntil(until);
  }, []);

  return {
    canPromptAndroid,
    canShowIosGuide,
    canInstall,
    isDismissed,
    isStandalone,
    installed,
    promptInstall,
    dismiss,
  };
}
