// components/tools/PasswordGeneratorTool.jsx
//
// 100% client-side password generator using crypto.getRandomValues
// (Web Crypto API) — a cryptographically secure random source, unlike
// Math.random(). Nothing is ever sent anywhere; the generated password
// exists only in this tab's memory.

"use client";

import { useState } from "react";

const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function generatePassword(length, options) {
  const pool = Object.keys(options)
    .filter((key) => options[key])
    .map((key) => CHAR_SETS[key])
    .join("");
  if (!pool) return "";

  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += pool[randomValues[i] % pool.length];
  }
  return result;
}

function getStrength(length, options) {
  const enabledSets = Object.values(options).filter(Boolean).length;
  if (length < 8 || enabledSets <= 1) return { label: "Weak", color: "bg-red-500", width: "25%" };
  if (length < 12 || enabledSets === 2) return { label: "Fair", color: "bg-yellow-500", width: "50%" };
  if (length < 16 || enabledSets === 3) return { label: "Strong", color: "bg-brand-500", width: "75%" };
  return { label: "Very strong", color: "bg-green-500", width: "100%" };
}

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [password, setPassword] = useState(() => generatePassword(16, { uppercase: true, lowercase: true, numbers: true, symbols: true }));
  const [copied, setCopied] = useState(false);

  const strength = getStrength(length, options);
  const noneSelected = !Object.values(options).some(Boolean);

  function regenerate(newLength = length, newOptions = options) {
    setPassword(generatePassword(newLength, newOptions));
    setCopied(false);
  }

  function toggleOption(key) {
    const next = { ...options, [key]: !options[key] };
    const stillHasOne = Object.values(next).some(Boolean);
    if (!stillHasOne) return; // never allow zero character sets selected
    setOptions(next);
    regenerate(length, next);
  }

  function handleLengthChange(value) {
    setLength(value);
    regenerate(value, options);
  }

  function copyPassword() {
    if (!password) return;
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-lg font-semibold text-slate-900">
          {password || "Select at least one character type"}
        </p>
        <button
          type="button"
          onClick={copyPassword}
          disabled={!password}
          className="shrink-0 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="mt-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className={`h-full ${strength.color} transition-all`} style={{ width: strength.width }} />
        </div>
        <p className="mt-1 text-xs font-medium text-slate-500">{strength.label}</p>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
          <span>Length</span>
          <span>{length} characters</span>
        </div>
        <input
          type="range"
          min={6}
          max={64}
          value={length}
          onChange={(e) => handleLengthChange(Number(e.target.value))}
          className="mt-2 w-full accent-brand-600"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Object.keys(CHAR_SETS).map((key) => (
          <label
            key={key}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium capitalize text-slate-700"
          >
            <input
              type="checkbox"
              checked={options[key]}
              onChange={() => toggleOption(key)}
              className="h-4 w-4 accent-brand-600"
            />
            {key}
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={() => regenerate()}
        disabled={noneSelected}
        className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
      >
        Generate new password
      </button>

      <p className="mt-3 text-xs text-slate-400">
        Generated with the Web Crypto API (crypto.getRandomValues) — nothing is sent over the network or stored anywhere.
      </p>
    </div>
  );
}
