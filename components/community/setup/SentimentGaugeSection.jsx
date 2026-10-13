"use client";

// components/community/setup/SentimentGaugeSection.jsx
//
// "Live Community Sentiment Gauge" section of the Trader Community &
// Setup Hub: one voting block per tracked asset (Gold, Bitcoin,
// EUR/USD), backed by hooks/useSentimentVotes.js.

import { SENTIMENT_ASSET_CODES } from "@/lib/tradeSetupsData";
import { INSTRUMENT_BY_CODE } from "@/lib/technicalAnalysis";
import { useSentimentVotes } from "@/hooks/useSentimentVotes";
import SentimentGaugeCard from "@/components/community/setup/SentimentGaugeCard";

export default function SentimentGaugeSection() {
  const { castVote, getCounts } = useSentimentVotes();

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">Live Community Sentiment Gauge</h2>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Cast a Bullish or Bearish vote on each asset — your vote is added to a seeded demo
        baseline (this deployment has no backend to tally votes across visitors), and you can
        switch your vote any time.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SENTIMENT_ASSET_CODES.map((code) => (
          <SentimentGaugeCard
            key={code}
            label={INSTRUMENT_BY_CODE[code]?.label || code}
            counts={getCounts(code)}
            onVote={(side) => castVote(code, side)}
          />
        ))}
      </div>
    </section>
  );
}
