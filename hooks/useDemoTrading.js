"use client";

// hooks/useDemoTrading.js
//
// localStorage-backed state engine for the Academy's Interactive Demo
// Trading Lab (components/academy/TradingLab.jsx) — a virtual MT4/5-
// style paper-trading account, entirely client-side. Same persistence
// pattern as hooks/useAcademyProgress.js: versioned storage shape,
// safe read/write wrappers that never throw, a `hydrated` flag so the
// server/first-render always shows the empty default (avoids an SSR/
// client markup mismatch), and a single `persist(updater)` callback
// that atomically updates React state + localStorage together.
//
// STORAGE SHAPE (v1):
// {
//   version: 1,
//   closedPnl: number,               // sum of realized PnL across all closed trades
//   positions: [{
//     id, instrumentCode, side, lots, entryPrice, sl, tp, openedAt,
//   }],
//   history: [{
//     id, instrumentCode, side, lots, entryPrice, closePrice, pnl,
//     openedAt, closedAt, usedSl, usedTp, closeReason, // "manual" | "sl" | "tp"
//   }],
//   riskManagerBadgeClaimed: boolean,
// }
//
// ACCOUNT MODEL (standard CFD/forex paper-account convention — see
// lib/demoTradingInstruments.js's header for the honesty note on why
// contract size/leverage here are simplified teaching conventions, not
// quoted real-world broker terms):
//   balance     = DEMO_STARTING_BALANCE + closedPnl         (realized cash only)
//   usedMargin  = sum of each open position's required margin
//   floatingPnl = sum of each open position's unrealized PnL at current mark price
//   equity      = balance + floatingPnl
//   freeMargin  = equity - usedMargin
//
// "Risk Manager" badge: unlocked once 3 PROFITABLE trades have been
// closed that were opened with a Stop Loss set (usedSl) — rewards using
// SL as a risk-management habit, not just being profitable.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEMO_STARTING_BALANCE,
  computePnl,
  computeRequiredMargin,
  getDemoLabInstrument,
} from "@/lib/demoTradingInstruments";

const STORAGE_KEY = "omnifin.academy.demoTrading.v1";
const RISK_MANAGER_BADGE_TARGET = 3;

function emptyState() {
  return {
    version: 1,
    closedPnl: 0,
    positions: [],
    history: [],
    riskManagerBadgeClaimed: false,
  };
}

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Reads and lightly validates the stored demo-account blob. Never
 * throws — a corrupted/missing/blocked localStorage just falls back to
 * a fresh $10,000 account, since this is a learning sandbox, not real
 * money. */
function readStoredAccount() {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyState();
    return {
      version: 1,
      closedPnl: Number.isFinite(parsed.closedPnl) ? parsed.closedPnl : 0,
      positions: Array.isArray(parsed.positions) ? parsed.positions : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
      riskManagerBadgeClaimed: Boolean(parsed.riskManagerBadgeClaimed),
    };
  } catch {
    return emptyState();
  }
}

function writeStoredAccount(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort only — the in-memory React state still works for the
    // rest of this session even if persistence silently fails.
  }
}

/**
 * React hook exposing the person's Demo Trading Lab account, backed by
 * localStorage. Safe to call from any client component; on the server
 * (or before the client has hydrated) it reads as a fresh $10,000
 * account and syncs from localStorage once mounted.
 *
 * `livePrices` is a `{ [instrumentCode]: number }` map of the latest
 * resolved mark prices (see components/academy/TradingLab.jsx), used
 * to compute floating PnL/equity/margin and to auto-close positions
 * whose SL/TP has been touched.
 */
export function useDemoTrading(livePrices) {
  const [state, setState] = useState(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStoredAccount());
    setHydrated(true);
  }, []);

  const persist = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      writeStoredAccount(next);
      return next;
    });
  }, []);

  /** Opens a new position. Returns { ok: true, position } on success,
   * or { ok: false, error } if free margin can't cover it or inputs
   * are invalid — the caller (ExecutionPanel) surfaces `error` inline
   * rather than silently failing. */
  const openPosition = useCallback(
    ({ instrumentCode, side, lots, sl, tp }) => {
      const instrument = getDemoLabInstrument(instrumentCode);
      const price = livePrices?.[instrumentCode];

      if (!instrument) return { ok: false, error: "Unknown instrument." };
      if (!Number.isFinite(price)) {
        return { ok: false, error: "Live price unavailable right now — try again shortly." };
      }
      const lotSize = Number(lots);
      if (!Number.isFinite(lotSize) || lotSize < instrument.minLots) {
        return { ok: false, error: `Enter a lot size of at least ${instrument.minLots}.` };
      }

      const requiredMargin = computeRequiredMargin(instrument, lotSize, price);

      let result = null;
      persist((prev) => {
        const usedMargin = prev.positions.reduce(
          (sum, pos) =>
            sum +
            computeRequiredMargin(
              getDemoLabInstrument(pos.instrumentCode),
              pos.lots,
              pos.entryPrice
            ),
          0
        );
        const floatingPnl = prev.positions.reduce((sum, pos) => {
          const markPrice = livePrices?.[pos.instrumentCode];
          if (!Number.isFinite(markPrice)) return sum;
          return (
            sum +
            computePnl(
              getDemoLabInstrument(pos.instrumentCode),
              pos.side,
              pos.lots,
              pos.entryPrice,
              markPrice
            )
          );
        }, 0);
        const balance = DEMO_STARTING_BALANCE + prev.closedPnl;
        const equity = balance + floatingPnl;
        const freeMargin = equity - usedMargin;

        if (requiredMargin > freeMargin) {
          result = {
            ok: false,
            error: `Not enough free margin. This trade needs ~$${requiredMargin.toFixed(
              2
            )}, but only $${freeMargin.toFixed(2)} is free.`,
          };
          return prev; // no state change
        }

        const position = {
          id: makeId(),
          instrumentCode: instrument.code,
          side: side === "sell" ? "sell" : "buy",
          lots: lotSize,
          entryPrice: price,
          sl: Number.isFinite(Number(sl)) && Number(sl) > 0 ? Number(sl) : null,
          tp: Number.isFinite(Number(tp)) && Number(tp) > 0 ? Number(tp) : null,
          openedAt: new Date().toISOString(),
        };
        result = { ok: true, position };

        return { ...prev, positions: [...prev.positions, position] };
      });

      return result || { ok: false, error: "Could not open the position." };
    },
    [livePrices, persist]
  );

  /** Closes an open position at its current mark price (or an
   * explicit `closePrice` when auto-closing on a SL/TP touch, so the
   * logged exit price is the exact SL/TP level rather than whatever
   * the next poll happens to show). */
  const closePosition = useCallback(
    (positionId, { closePrice, closeReason = "manual" } = {}) => {
      persist((prev) => {
        const position = prev.positions.find((p) => p.id === positionId);
        if (!position) return prev;

        const instrument = getDemoLabInstrument(position.instrumentCode);
        const exitPrice = Number.isFinite(closePrice) ? closePrice : livePrices?.[position.instrumentCode];
        if (!Number.isFinite(exitPrice)) return prev;

        const pnl = computePnl(instrument, position.side, position.lots, position.entryPrice, exitPrice);

        const closedTrade = {
          id: position.id,
          instrumentCode: position.instrumentCode,
          side: position.side,
          lots: position.lots,
          entryPrice: position.entryPrice,
          closePrice: exitPrice,
          pnl,
          openedAt: position.openedAt,
          closedAt: new Date().toISOString(),
          usedSl: Boolean(position.sl),
          usedTp: Boolean(position.tp),
          closeReason,
        };

        return {
          ...prev,
          closedPnl: prev.closedPnl + pnl,
          positions: prev.positions.filter((p) => p.id !== positionId),
          history: [closedTrade, ...prev.history],
        };
      });
    },
    [livePrices, persist]
  );

  /** Call whenever livePrices updates: auto-closes any open position
   * whose mark price has reached its Stop Loss or Take Profit, exactly
   * like a real broker's order engine would. Runs from an effect in
   * the consuming component (TradingLab.jsx), not on every render. */
  const checkStopsAndTargets = useCallback(() => {
    if (!livePrices) return;
    for (const position of state.positions) {
      const markPrice = livePrices[position.instrumentCode];
      if (!Number.isFinite(markPrice)) continue;

      const hitSl =
        Number.isFinite(position.sl) &&
        (position.side === "buy" ? markPrice <= position.sl : markPrice >= position.sl);
      const hitTp =
        Number.isFinite(position.tp) &&
        (position.side === "buy" ? markPrice >= position.tp : markPrice <= position.tp);

      if (hitSl) {
        closePosition(position.id, { closePrice: position.sl, closeReason: "sl" });
      } else if (hitTp) {
        closePosition(position.id, { closePrice: position.tp, closeReason: "tp" });
      }
    }
  }, [livePrices, state.positions, closePosition]);

  const resetAccount = useCallback(() => {
    persist(emptyState());
  }, [persist]);

  const claimRiskManagerBadge = useCallback(() => {
    persist((prev) => ({ ...prev, riskManagerBadgeClaimed: true }));
  }, [persist]);

  // --- Derived, real-time account stats -----------------------------
  const balance = DEMO_STARTING_BALANCE + state.closedPnl;

  const positionsWithPnl = useMemo(
    () =>
      state.positions.map((position) => {
        const instrument = getDemoLabInstrument(position.instrumentCode);
        const markPrice = livePrices?.[position.instrumentCode];
        const pnl = Number.isFinite(markPrice)
          ? computePnl(instrument, position.side, position.lots, position.entryPrice, markPrice)
          : null;
        return { ...position, instrument, markPrice: markPrice ?? null, pnl };
      }),
    [state.positions, livePrices]
  );

  const usedMargin = useMemo(
    () =>
      state.positions.reduce(
        (sum, pos) =>
          sum + computeRequiredMargin(getDemoLabInstrument(pos.instrumentCode), pos.lots, pos.entryPrice),
        0
      ),
    [state.positions]
  );

  const floatingPnl = useMemo(
    () => positionsWithPnl.reduce((sum, pos) => sum + (pos.pnl ?? 0), 0),
    [positionsWithPnl]
  );

  const equity = balance + floatingPnl;
  const freeMargin = equity - usedMargin;

  const riskManagerProgress = useMemo(() => {
    const qualifyingTrades = state.history.filter((trade) => trade.pnl > 0 && trade.usedSl).length;
    return {
      count: Math.min(qualifyingTrades, RISK_MANAGER_BADGE_TARGET),
      target: RISK_MANAGER_BADGE_TARGET,
      eligible: qualifyingTrades >= RISK_MANAGER_BADGE_TARGET,
    };
  }, [state.history]);

  const historyStats = useMemo(() => {
    const total = state.history.length;
    const wins = state.history.filter((t) => t.pnl > 0).length;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    const totalPnl = state.history.reduce((sum, t) => sum + t.pnl, 0);
    return { total, wins, losses: total - wins, winRate, totalPnl };
  }, [state.history]);

  return {
    hydrated,
    startingBalance: DEMO_STARTING_BALANCE,
    balance,
    equity,
    usedMargin,
    freeMargin,
    floatingPnl,
    closedPnl: state.closedPnl,
    positions: positionsWithPnl,
    history: state.history,
    historyStats,
    riskManagerBadgeClaimed: state.riskManagerBadgeClaimed,
    riskManagerProgress,
    openPosition,
    closePosition,
    checkStopsAndTargets,
    claimRiskManagerBadge,
    resetAccount,
  };
}
