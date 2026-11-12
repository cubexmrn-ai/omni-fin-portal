// components/converters/pairEducationalContent.js
//
// Replaces app/converters/[pair]/page.jsx's old single generic "About
// this pair" paragraph (identical boilerplate regardless of which two
// assets were involved) with real, asset-class-aware educational
// content — genuinely different copy for a fiat<->fiat pair vs. a
// crypto<->fiat pair vs. a metals<->fiat pair, since what's actually
// true and useful to say differs by class: forex market hours and
// quoting convention, crypto's 24/7 trading and higher volatility, and
// metals' troy-ounce/gram/tola pricing basis. This is what keeps the
// now much larger FEATURED_PAIRS list (lib/pairSlugs.js) from reading
// as duplicate boilerplate across 40+ pages — the page differs because
// the real content differs, not because of per-pair filler text.
//
// No invented numbers: every fact here is a general, verifiable
// property of how that asset class trades, never a specific rate,
// percentage, or claim that would need to be kept up to date.
//
// Nov 2026 GSC indexing-drop audit: the CLASS_NOTES copy above is the
// same for every pair sharing a class combination (e.g. every one of
// the ~240 fiat<->fiat pairs in FEATURED_PAIRS got the exact same two
// sentences, with only the currency names/codes swapped). That's
// template content, not pair-specific content, and it's the leading
// suspect for why Google is crawling-but-not-indexing roughly 40% of
// this project's pSEO pages (see /areas/omnifin-portal.md's Nov 12
// indexing audit). PAIR_SPECIFIC_CONTENT below adds a second,
// genuinely pair-specific paragraph plus 2 custom FAQs for a curated
// set of pairs — prioritized by real evidence already on record in
// this codebase (the "this site's single highest-volume corridor"
// comment on USD->PKR in lib/pairSlugs.js, and the GSC-confirmed
// impression/position figures cited throughout that file's Phase 5-9
// comments: cny-to-tjs at 326 impressions, eur-to-uzs at 98, cny-to-kzt
// at 27, "exchange rate usd to eur" at 129, "1 gbp to sar" at 22) —
// not a guess at which pairs matter. Every pair NOT in this map still
// gets the unchanged class-level content above; this is purely
// additive, so there's no regression risk for the long tail.
//
// Extending this list: add an entry keyed "<FROMCODE>-<TOCODE>" (the
// same direction FEATURED_PAIRS already lists that pair in — this is
// NOT bidirectional, since e.g. USD->PKR and PKR->USD are asked about
// by different audiences for different reasons). Keep every claim
// structural/evergreen (how the rate behaves, who searches it and why,
// what drives it) rather than a number that goes stale.

const CLASS_NOTES = {
  fiat: {
    marketNote:
      "the global foreign exchange (forex) market — the world's largest and most liquid financial market, open nearly 24 hours a day on weekdays across overlapping Asian, European and US trading sessions, though it's closed on weekends",
    quoteNote:
      "quoted as how many units of the second currency one unit of the first currency buys",
  },
  crypto: {
    marketNote:
      "cryptocurrency exchanges, which — unlike forex or stock markets — never close: trading runs 24 hours a day, 7 days a week, including weekends and holidays",
    quoteNote:
      "typically more volatile over short periods than fiat currency pairs, since crypto markets trade continuously and react immediately to news",
  },
  metals: {
    marketNote:
      "the global spot bullion market, where precious metals are traditionally priced per troy ounce (31.1034768 grams) in US dollars, then converted to other units and currencies",
    quoteNote:
      "also commonly quoted per gram or, in South Asian markets, per Tola (11.6638038 grams) — see OmniFin Portal's dedicated Metals & Commodities Calculator for those unit conversions",
  },
};

// Shared narrative for the four Gulf-currency -> PKR remittance
// corridors (AED, SAR, QAR, KWD all to PKR). The underlying economic
// reality genuinely is shared — these are expatriate-wage corridors,
// and AED/SAR/QAR/KWD all trade in a tight, centrally-managed band
// against the US dollar, so in practice almost all of the day-to-day
// movement in e.g. AED-PKR comes from the PKR side, not the AED side
// — but each pair's paragraph below is still its own distinct
// sentence, not a copy-paste of the others, since that's exactly the
// pattern that got this project into the indexing-drop situation in
// the first place.
function gulfCorridorFaqs(fromName, fromCode) {
  return [
    {
      question: `Why does ${fromCode} to PKR move almost exactly like USD to PKR?`,
      answer: `${fromName} is pegged (or very tightly managed) against the US dollar, so it barely moves on its own — almost all of the day-to-day change you see in this rate is actually the Pakistani Rupee moving against the dollar, not ${fromCode} itself. If you also track USD to PKR, you'll notice the two move in near lock-step.`,
    },
  ];
}

const PAIR_SPECIFIC_CONTENT = {
  // --- Gulf -> Pakistan remittance corridor -------------------------
  // This project's own comments call USD->PKR "this site's single
  // highest-volume corridor" (lib/pairSlugs.js, FEATURED_AMOUNT_PAIRS
  // header), and AED/SAR/QAR/KWD->PKR are the same real-world
  // audience — Gulf-based expatriate workers sending wages home.
  "USD-PKR": {
    context:
      "This is OmniFin Portal's single most-searched pair, used daily by overseas Pakistani workers and their families to check what a remittance is worth. The rate trades on Pakistan's managed-float interbank market, where the State Bank of Pakistan intervenes periodically, so it moves with the country's trade and current-account balance, foreign reserve levels, and the timing of IMF program disbursements — not purely with global dollar strength the way a EUR/USD move does.",
    faqs: [
      {
        question: "Why does the US Dollar to PKR rate move in sudden jumps instead of smoothly?",
        answer:
          "Pakistan runs a managed float: the State Bank of Pakistan allows the rate to trade freely day-to-day but steps in — directly, or through guidance to banks — when it judges the move is too fast or reserves are under pressure. That's why USD/PKR can sit quiet for weeks and then move noticeably in a short window, unlike a fully free-floating pair like EUR/USD.",
      },
      {
        question: "Has the Pakistani Rupee historically strengthened or weakened against the Dollar?",
        answer:
          "Over the long run the Rupee has trended weaker against the Dollar, reflecting Pakistan's persistent trade deficit, higher domestic inflation than the US, and periodic step-devaluations tied to IMF program conditions. That's a long-term historical pattern, not a forecast — short-term moves can and do go either direction, which is exactly why this page shows the live current rate rather than a prediction.",
      },
    ],
  },
  "AED-PKR": {
    context:
      "The UAE hosts one of the largest Pakistani expatriate communities in the Gulf, and this pair is checked mainly by workers in Dubai, Abu Dhabi and Sharjah sending money home. The UAE Dirham has been pegged to the US Dollar at a fixed rate for decades, so almost every bit of movement you see here actually comes from the Pakistani Rupee's own float, not from the Dirham.",
    faqs: gulfCorridorFaqs("the UAE Dirham", "AED"),
  },
  "SAR-PKR": {
    context:
      "Saudi Arabia is home to one of the largest overseas Pakistani workforces, concentrated in construction, healthcare and services, and this pair exists mainly to serve that remittance corridor. Like the Dirham, the Saudi Riyal has been pegged to the US Dollar since the 1980s, so the Riyal side of this rate is effectively fixed — the Rupee side is what actually moves.",
    faqs: gulfCorridorFaqs("the Saudi Riyal", "SAR"),
  },
  "QAR-PKR": {
    context:
      "Qatar's Pakistani workforce, much of it tied to the country's construction and energy sectors, drives most of the search volume behind this pair. The Qatari Riyal has traded in a narrow fixed band against the US Dollar for years, so — as with the other Gulf currencies on this site — the Rupee side does almost all of the moving.",
    faqs: gulfCorridorFaqs("the Qatari Riyal", "QAR"),
  },
  "KWD-PKR": {
    context:
      "The Kuwaiti Dinar is unusual among Gulf currencies in that it's pegged to a basket of currencies rather than the Dollar alone, which is also why it's consistently one of the highest-valued currency units in the world — a single Dinar converts to several hundred Pakistani Rupees. Even so, the Dinar trades in a very tight band day to day, so this rate still moves mostly on the Rupee side.",
    faqs: gulfCorridorFaqs("the Kuwaiti Dinar", "KWD"),
  },

  // --- Other major South Asia corridor -------------------------------
  "USD-INR": {
    context:
      "USD/INR is this site's other major South Asia corridor, but it behaves differently from USD/PKR — India's economy is far more export- and services-driven (notably IT and outsourcing dollar earnings), which offsets its oil-import dollar demand, so the Reserve Bank of India manages a comparatively smoother, more liquid float than Pakistan's. It's one of the most actively traded emerging-market currency pairs globally, not just a remittance-check pair.",
    faqs: [
      {
        question: "Why is USD to INR less volatile day-to-day than USD to PKR?",
        answer:
          "India's foreign exchange reserves are substantially larger relative to its import bill, and its IT/services export earnings provide a steady offsetting dollar inflow that Pakistan's economy doesn't have at the same scale. The Reserve Bank of India also intervenes more routinely in smaller amounts to smooth the rate, rather than letting pressure build up and correcting it in a larger step, which is the pattern more often seen with the Rupee's Pakistani counterpart.",
      },
    ],
  },

  // --- Major global pairs ---------------------------------------------
  "EUR-USD": {
    context:
      "EUR/USD is the single most-traded currency pair on Earth, accounting for a large share of all global forex turnover, which is why its spreads are the tightest of any pair on this site. It moves primarily on the policy gap between the European Central Bank and the US Federal Reserve — whichever side is raising, holding, or cutting rates faster — and on relative eurozone-vs-US growth and inflation data.",
    faqs: [
      {
        question: "Why is EUR to USD considered the most important currency pair to watch?",
        answer:
          "It's the most heavily traded pair in the world by a wide margin, which makes it the most liquid and the hardest for any single actor to move — its price action is widely treated as a real-time read on relative confidence in the US versus eurozone economies, and it's the reference point many other currency pairs are priced against indirectly.",
      },
    ],
  },
  "GBP-USD": {
    context:
      "Traders have nicknamed GBP/USD \"cable\" since the 19th century, when the rate was first transmitted between London and New York by transatlantic telegraph cable. It has a long-standing reputation as one of the more volatile major pairs, since it's sensitive both to Bank of England policy and to UK-specific political and economic data surprises relative to the US.",
    faqs: [
      {
        question: "Why is GBP to USD called \"cable\"?",
        answer:
          "The name dates back to the 1800s, when the exchange rate between London and New York was relayed by a transatlantic telegraph cable — the nickname stuck in trading circles and is still used today, even though the rate now updates electronically in real time.",
      },
    ],
  },
  "GBP-SAR": {
    context:
      "Because the Saudi Riyal is pegged to the US Dollar, GBP/SAR's day-to-day movement is effectively driven by GBP/USD — this pair is checked mainly by UK-based travellers, Gulf-based British expatriates, and businesses invoicing between the two currencies, rather than by active currency traders.",
    faqs: [
      {
        question: "Does GBP to SAR move independently of the Dollar?",
        answer:
          "Not really — the Saudi Riyal has been pegged to the US Dollar since 1986, so GBP/SAR's movements track GBP/USD almost exactly. If you want to understand why this rate moved, the GBP/USD page is usually the more informative place to look.",
      },
    ],
  },

  // --- Belt & Road / frontier-currency corridors ------------------------
  // These three are, by this project's own GSC exports (cited in
  // lib/pairSlugs.js's Phase 5/6 comments), among the highest-
  // impression pairs on the entire site — underserved on Google
  // because few other finance sites bother covering these corridors at
  // all, which is exactly why real, specific context here is worth
  // writing.
  "CNY-TJS": {
    context:
      "China is Tajikistan's largest trading partner and a major source of infrastructure investment, and a large Tajik labor-migrant population works in Chinese-linked construction and trade projects — both of which drive real demand for this pair well beyond what its small market size would suggest. Few currency sites cover this corridor in any depth, which is a large part of why this page performs unusually well for its niche.",
    faqs: [
      {
        question: "Why does a currency pair as niche as Yuan to Somoni get meaningful search traffic?",
        answer:
          "Tajikistan's trade and labor-migration ties to China are substantial relative to its economy's size, so people actually invoicing, trading or sending wages between the two countries need this rate regularly — it's a real, recurring need that most general-purpose currency sites simply don't bother to serve well, leaving the field open.",
      },
    ],
  },
  "CNY-KZT": {
    context:
      "Kazakhstan sits on the main overland China-Europe rail trade route, and China is one of its largest trading partners for both imports and oil-sector investment, which keeps steady, genuine demand behind this pair from traders and cross-border shoppers alike.",
    faqs: [
      {
        question: "What drives the Yuan to Tenge exchange rate?",
        answer:
          "Mostly the flow of Kazakhstan-China trade (Kazakhstan is a key transit point on China's overland European trade route) and relative monetary policy between the People's Bank of China and the National Bank of Kazakhstan — it's a trade-driven pair rather than one dominated by speculative currency trading.",
      },
    ],
  },
  "EUR-UZS": {
    context:
      "Uzbekistan's trade and labor-migration ties run heavily through Europe and Russia, and a meaningful share of its import invoicing is Euro-denominated, which keeps real, recurring demand behind this otherwise rarely-covered pair.",
    faqs: [
      {
        question: "Why check the Euro to Uzbekistani Som rate specifically?",
        answer:
          "A meaningful share of Uzbekistan's import trade is priced in Euros, and workers abroad in Europe send remittances back in Euros, so this is a real working-currency pair for businesses and families — not just a theoretical conversion most general finance sites bother to list.",
      },
    ],
  },

  // --- Flagship crypto & metals -----------------------------------------
  "BTC-USD": {
    context:
      "As the original and still-largest cryptocurrency by market value, Bitcoin's dollar price is widely treated as a barometer for the broader crypto market's mood. Unlike a managed fiat pair, there's no central bank or peg involved at all — price moves purely on supply (a fixed, algorithmically-capped issuance schedule), demand (retail and institutional buying, including spot ETF flows), and macro risk sentiment.",
    faqs: [
      {
        question: "Why is Bitcoin's price so much more volatile than a currency pair like EUR to USD?",
        answer:
          "Bitcoin trades on a 24/7 global market with no central bank smoothing its moves and a much smaller total market value than the foreign exchange market, so the same-sized trade moves its price proportionally much more. It also has no peg or managed band of any kind, unlike most of the fiat pairs on this site.",
      },
    ],
  },
  "XAU-USD": {
    context:
      "Gold's dollar price is driven mainly by real (inflation-adjusted) US interest rates, the strength of the dollar itself, and its role as a traditional safe-haven asset during geopolitical or financial stress — central banks have also been net buyers of gold in recent years as a reserve-diversification move, which adds a steady source of demand distinct from investor trading. See OmniFin Portal's guide on central-bank gold buying for more on that specific driver.",
    faqs: [
      {
        question: "Why does gold's price sometimes rise when stock markets fall?",
        answer:
          "Gold is widely treated as a safe-haven asset — during periods of financial or geopolitical stress, demand for it as a store of value tends to rise even as investors sell riskier assets like stocks, though this relationship isn't guaranteed to hold in every single episode.",
      },
    ],
  },
  "XAU-PKR": {
    context:
      "Gold's Pakistani Rupee price is really two numbers multiplied together: the international US-dollar gold price, and the prevailing USD/PKR exchange rate. That means gold in Pakistan can get more expensive even on a day when the global dollar gold price doesn't move at all, purely because the Rupee weakened against the Dollar — a distinction worth knowing before assuming a local gold-price rise means gold itself became more valuable globally.",
    faqs: [
      {
        question: "Why did gold get more expensive in Pakistan when the international gold price didn't change?",
        answer:
          "Local gold prices are the international US-dollar gold price converted at the day's USD/PKR exchange rate. If the Rupee weakens against the Dollar, the Rupee price of gold rises even with the dollar gold price completely flat — the two moves (global gold price, and the currency conversion) are separate and it's worth checking both before drawing a conclusion.",
      },
    ],
  },
};

/**
 * Returns the curated pair-specific content for one direction of a
 * pair (e.g. "USD-PKR"), or null if this pair isn't curated yet —
 * callers should treat null as "use the class-level content only",
 * never substitute anything invented in its place.
 */
export function getPairSpecificContent(fromCode, toCode) {
  return PAIR_SPECIFIC_CONTENT[`${fromCode}-${toCode}`] || null;
}

/**
 * Returns { intro, formulaNote, pairFaqs } — two short paragraphs of
 * genuinely distinct, class-aware copy for a given pair, the universal
 * conversion formula (always true, regardless of asset class), and
 * 0-2 extra pair-specific FAQ items for the curated pairs above.
 *
 * `intro` is the original class-level paragraph with the pair-specific
 * paragraph appended when one exists — additive, not a replacement,
 * so every page keeps the market-context sentence it already had and
 * curated pairs simply get more.
 */
export function getPairEducationalContent({ fromClass, toClass, from, to }) {
  const fromNotes = CLASS_NOTES[fromClass] || CLASS_NOTES.fiat;
  const toNotes = CLASS_NOTES[toClass] || CLASS_NOTES.fiat;

  // When both sides are the same class, state its market context once
  // rather than repeating the same sentence twice with different names.
  const sameClass = fromClass === toClass;

  const classIntro = sameClass
    ? `${from.name} (${from.code}) and ${to.name} (${to.code}) both trade on ${fromNotes.marketNote}. This rate is ${fromNotes.quoteNote}.`
    : `${from.name} (${from.code}) trades on ${fromNotes.marketNote}, while ${to.name} (${to.code}) trades on ${toNotes.marketNote}. OmniFin Portal's live rates feed bridges both, so this conversion updates the same way whichever side you're converting from.`;

  const specific = getPairSpecificContent(from.code, to.code);
  const intro = specific ? `${classIntro} ${specific.context}` : classIntro;

  return {
    intro,
    formulaNote:
      "Result = Amount × Exchange Rate. The rate shown above is 1 " +
      from.code +
      " in " +
      to.code +
      " — multiply any amount by that rate to convert, or divide by it to convert the other direction.",
    pairFaqs: specific?.faqs ?? [],
  };
}
