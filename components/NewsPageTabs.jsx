"use client";

// components/NewsPageTabs.jsx
//
// Switches /ai-news between "Market News Feed" (the existing headline
// aggregator) and "Economic Calendar" (the new filterable calendar).
// Both tab bodies are rendered server-side in app/ai-news/page.jsx
// (the feed needs an async data fetch, the calendar is pure data) and
// passed in as plain JSX children — this wrapper only needs to be a
// client component to hold the toggle state; neither tab's own markup
// has to re-render on the server to switch between them.

import { useState } from "react";

const TABS = [
  { id: "feed", label: "Market News Feed" },
  { id: "calendar", label: "Economic Calendar" },
];

export default function NewsPageTabs({ feed, calendar }) {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="News page sections">
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {activeTab === "feed" ? feed : calendar}
      </div>
    </div>
  );
}
