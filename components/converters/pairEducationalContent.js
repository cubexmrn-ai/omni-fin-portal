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

  // --- Nov 17 2026 GSC export: next batch of real-evidence pairs ------
  // These weren't guessed — they're the highest-impression,
  // zero-click pairs in that date's live Pages.csv export (see
  // /areas/omnifin-portal.md), the same category of evidence that
  // justified the batch above. USD-EUR in particular is the reverse
  // direction of the already-curated EUR-USD — NOT the same page (this
  // map is explicitly non-bidirectional, per this file's own header
  // comment) and was sitting uncurated despite more impressions
  // (1,101) than almost every other pair on the site.
  "USD-EUR": {
    context:
      "This is the reverse direction of the world's most-traded currency pair, and it's searched by a different audience than EUR/USD: mainly US-based travellers, students and businesses converting dollars into Euros for European spending or invoicing, rather than Europeans pricing things in dollars. The underlying rate is identical either way — only which side of the divide the search is coming from differs.",
    faqs: [
      {
        question: "Is USD to EUR a different rate from EUR to USD?",
        answer:
          "No — it's mathematically the same exchange rate, just expressed from the other side: USD/EUR is simply 1 divided by EUR/USD. This page exists separately because people converting dollars into Euros for a trip or invoice naturally search \"dollars to euros,\" not the other way around.",
      },
    ],
  },
  "EUR-SEK": {
    context:
      "Sweden is a long-standing EU member but, unlike most of the eurozone, has kept the Krona rather than adopting the Euro, so anyone trading, travelling or invoicing between Sweden and the eurozone — its largest trading partner bloc — needs this conversion regularly. The Krona floats freely and is set by the Riksbank's own monetary policy, which can diverge from the European Central Bank's, so this pair often moves on Swedish-specific rate decisions and inflation data as much as on anything happening in the eurozone.",
    faqs: [
      {
        question: "Why doesn't Sweden just use the Euro like its neighbors?",
        answer:
          "Sweden is an EU member but never adopted the Euro — a 2003 referendum rejected membership in the currency, and Sweden has stayed outside the eurozone since, keeping its own currency and its own central bank setting independent interest-rate policy.",
      },
    ],
  },
  "CNY-VND": {
    context:
      "China is Vietnam's largest trading partner, and heavy cross-border trade through Vietnam's northern provinces — plus a large volume of Chinese cross-border e-commerce reselling into Vietnam — keeps genuine, recurring demand behind this pair. The Vietnamese Dong is a high-denomination currency (it takes thousands of Dong to equal a single Yuan), which is why the numbers on this page look large even for everyday amounts.",
    faqs: [
      {
        question: "Why are Vietnamese Dong amounts always such large numbers?",
        answer:
          "The Dong has never been redenominated despite decades of past inflation, so its unit value stayed small — it now takes thousands of Dong to equal roughly one US cent. That's purely a matter of how the currency's unit is sized, not a sign of unusual current instability.",
      },
    ],
  },
  "EUR-INR": {
    context:
      "The European Union is one of India's largest trading-partner blocs, and a sizeable Indian diaspora working across Germany, the Netherlands, France and other eurozone countries sends Euro-denominated remittances home — both of which drive real, recurring demand for this pair beyond the more commonly covered USD/INR.",
    faqs: [
      {
        question: "Is Euro to INR more or less stable than Dollar to INR?",
        answer:
          "Broadly similar — both are managed by the Reserve Bank of India's own interventions on the Rupee side, so EUR/INR mostly reflects the same Rupee dynamics as USD/INR, layered with whatever EUR/USD is doing independently on any given day.",
      },
    ],
  },
  "USD-PHP": {
    context:
      "The Philippines has one of the largest overseas-worker remittance economies in the world, with millions of OFWs (Overseas Filipino Workers) based in the US sending wages home regularly, which makes this one of the most practically important pairs on this site rather than a pair watched mainly by traders.",
    faqs: [
      {
        question: "Why is the US Dollar to Philippine Peso rate checked so often by ordinary people, not just traders?",
        answer:
          "Remittances from the millions of Overseas Filipino Workers abroad, a large share of them in the US, make up a significant part of the Philippine economy — families back home checking this rate before a transfer arrives is one of the single biggest real-world uses of any currency pair on this site.",
      },
    ],
  },
  "AED-EUR": {
    context:
      "The UAE Dirham has been pegged to the US Dollar for decades, so AED/EUR effectively just tracks EUR/USD from the other side — this pair is checked mainly by the large European expatriate community in Dubai and Abu Dhabi, and by UAE businesses invoicing with eurozone partners.",
    faqs: [
      {
        question: "Does AED to EUR move independently of the Dollar?",
        answer:
          "Not really — because the Dirham is pegged to the US Dollar, AED/EUR's movement is almost entirely a reflection of EUR/USD. If this rate moves, the more informative question is usually what the Euro is doing against the Dollar that day.",
      },
    ],
  },
  "USD-ILS": {
    context:
      "The Israeli Shekel floats freely and is one of the more actively managed developed-market currencies by its own central bank, but what really keeps this pair relevant is the scale of US-Israel economic ties — heavy US venture-capital investment into Israeli technology companies, substantial bilateral trade, and an American-Israeli diaspora moving money in both directions.",
    faqs: [
      {
        question: "Why does USD to ILS get meaningful search volume for a relatively small economy?",
        answer:
          "Israel's technology sector draws outsized US investment relative to the country's size, and that cross-border capital flow — alongside trade and a sizeable American-Israeli community sending money both ways — creates genuine, recurring demand for this conversion well beyond what the economy's size alone would suggest.",
      },
    ],
  },
  "USD-IDR": {
    context:
      "Indonesia is Southeast Asia's largest economy and a major commodity exporter, so the Rupiah — managed by Bank Indonesia in a loose float — tends to move with global commodity price cycles and US interest-rate expectations as much as with anything domestic. Like the Vietnamese Dong, the Rupiah is a high-denomination currency, so converted amounts look large in everyday use.",
    faqs: [
      {
        question: "Why does the Indonesian Rupiah trade at thousands per US Dollar?",
        answer:
          "The Rupiah has never undergone a redenomination despite a history of high inflation decades ago, so its per-unit value stayed small — it now takes thousands of Rupiah to equal a single US Dollar, which is a legacy of currency unit sizing, not a current-day instability signal on its own.",
      },
    ],
  },
  "INR-CAD": {
    context:
      "Canada hosts one of the largest populations of Indian international students and recent immigrants outside India itself, and this is the direction they search in: people in India estimating what Canadian tuition, living costs or a money transfer to Canada will actually cost in Rupees, rather than the reverse.",
    faqs: [
      {
        question: "Why check Indian Rupees to Canadian Dollars instead of the other way around?",
        answer:
          "Most of the real-world need runs from India toward Canada — students and families in India budgeting for Canadian tuition, living costs or a transfer abroad — so this page is built around the direction people actually search in, even though the underlying rate works identically either way.",
      },
    ],
  },
  "USD-AED": {
    context:
      "The UAE Dirham has been fixed to the US Dollar at the same rate since 1997, making this one of the most predictable, lowest-volatility conversions anywhere on this site — useful precisely because travellers, remittance senders and UAE-based businesses can treat the rate as essentially constant rather than something that needs daily checking for surprises.",
    faqs: [
      {
        question: "Does the US Dollar to UAE Dirham rate ever actually change?",
        answer:
          "Only within a very narrow technical band — the Dirham has been formally pegged to the Dollar since 1997, so day-to-day movement here is minimal compared with a freely floating currency. Any meaningful change would reflect a deliberate policy decision by the UAE central bank, not ordinary market fluctuation.",
      },
    ],
  },
  "EUR-PHP": {
    context:
      "Alongside the larger USD/PHP remittance corridor, a significant number of Overseas Filipino Workers are based across the eurozone — in healthcare, shipping and domestic work roles particularly — which keeps real demand behind the Euro side of the same remittance story.",
    faqs: [
      {
        question: "Is the Euro to Philippine Peso corridor as large as the Dollar one?",
        answer:
          "Smaller, but still substantial — the US hosts more Overseas Filipino Workers than any single eurozone country, but the eurozone collectively is still home to a meaningful share of the OFW population, enough to make this a real, actively-used remittance pair rather than a niche one.",
      },
    ],
  },
  "AED-GBP": {
    context:
      "Dubai and the wider UAE host one of the largest British expatriate communities in the Gulf, and because the Dirham is pegged to the US Dollar while the Pound floats freely, this cross-rate effectively moves with GBP/USD — a British expat's Dirham salary buys more or fewer Pounds back home depending on what the Pound is doing against the Dollar, not on anything happening to the Dirham itself.",
    faqs: [
      {
        question: "Why does AED to GBP move even though the Dirham is pegged?",
        answer:
          "The peg is only between the Dirham and the US Dollar — the British Pound still floats freely against the Dollar, so this cross-rate moves whenever GBP/USD does, even though the Dirham side of the equation stays effectively fixed.",
      },
    ],
  },
  "EUR-AZN": {
    context:
      "Azerbaijan is a significant oil and natural gas exporter to Europe, including via the Southern Gas Corridor pipeline route, which ties its economy closely to European energy demand and investment even though the Manat itself is managed in a tight band against the US Dollar by Azerbaijan's central bank.",
    faqs: [
      {
        question: "What drives demand for the Euro to Azerbaijani Manat rate?",
        answer:
          "Mostly Azerbaijan's energy trade with Europe — it's a meaningful gas and oil supplier to European markets — plus European investment tied to that energy sector, rather than retail currency trading, since the Manat itself is closely managed rather than freely floating.",
      },
    ],
  },
  "USD-MXN": {
    context:
      "USD/MXN is one of the most actively traded emerging-market currency pairs in the world, reflecting the sheer scale of US-Mexico trade under their free-trade agreement and one of the largest remittance corridors globally, as millions of Mexican workers in the US send wages home. The Peso is also unusually liquid for an emerging-market currency, which keeps its spreads tighter than most EM peers.",
    faqs: [
      {
        question: "Why is the Mexican Peso more liquid than most other emerging-market currencies?",
        answer:
          "The sheer volume of US-Mexico trade and investment under their free-trade agreement, combined with one of the world's largest remittance corridors, means USD/MXN trades in far greater volume than most other emerging-market pairs — which is exactly what keeps its bid-ask spreads tighter and the rate more continuously liquid.",
      },
    ],
  },
  "SAR-PHP": {
    context:
      "Saudi Arabia hosts the largest Overseas Filipino Worker population of any single country, concentrated in healthcare, domestic work and construction, which makes this corridor's search volume driven almost entirely by remittances rather than trade or investment flows.",
    faqs: [
      {
        question: "Why is this pair searched so much relative to how small Saudi-Philippine trade actually is?",
        answer:
          "It isn't trade driving this — Saudi Arabia is home to more Overseas Filipino Workers than any other single country, and this page exists mainly to serve that remittance-checking need, the same pattern as this site's other Gulf-to-home-country currency pairs.",
      },
    ],
  },
  "INR-GBP": {
    context:
      "The United Kingdom has a large, long-established Indian diaspora and remains a top destination for Indian students, so — like INR/CAD — this page is built around people in India budgeting for UK tuition, living costs or a transfer abroad in Rupee terms, rather than the reverse direction.",
    faqs: [
      {
        question: "Why does this page focus on converting Rupees into Pounds rather than Pounds into Rupees?",
        answer:
          "The larger real-world need runs from India toward the UK — students and families budgeting for UK costs in familiar Rupee terms — which is the direction this page and its default amount are built around, even though the same live rate works for converting in either direction.",
      },
    ],
  },
  "USD-NGN": {
    context:
      "Nigeria's Naira has gone through several major managed devaluations and policy shifts in recent years as the Central Bank of Nigeria worked to narrow the historical gap between its official and parallel-market rates, and Nigeria's oil-export-dependent economy means the Naira is sensitive to global oil prices as well as domestic monetary policy. A large Nigerian diaspora in the US sending remittances home adds further steady demand for this pair.",
    faqs: [
      {
        question: "Why has the US Dollar to Naira rate been so volatile in recent years?",
        answer:
          "Nigeria's central bank has made several significant policy changes aimed at unifying its official exchange rate with the rate seen in parallel currency markets, and as an oil-export-dependent economy the Naira is also exposed to swings in global oil prices — both of which have driven larger, more frequent rate moves than in a typical pegged or tightly-managed currency.",
      },
    ],
  },
  "GBP-PKR": {
    context:
      "The United Kingdom is home to one of the largest Pakistani diaspora communities in the world, heavily concentrated in cities like Birmingham, Bradford and parts of London, and this pair serves the same remittance-checking need as USD/PKR and the Gulf-to-Pakistan corridors on this site — just from UK-based senders instead.",
    faqs: [
      {
        question: "Does GBP to PKR move the same way as USD to PKR?",
        answer:
          "Broadly in the same direction over time, since both ultimately reflect the Pakistani Rupee's own managed float, but not identically day-to-day — GBP/PKR also carries whatever GBP/USD is doing independently, so the two rates can diverge noticeably over short periods even while trending together longer-term.",
      },
    ],
  },
  "USD-EGP": {
    context:
      "The Egyptian Pound has undergone several large, deliberate devaluations in recent years as part of IMF-backed economic reform programs, moving from a long-managed peg toward a more flexible rate — a shift driven by Egypt's reliance on dollar-denominated imports, tourism revenue and external financing. That history is exactly why checking the current live rate matters more here than for a stable pegged currency.",
    faqs: [
      {
        question: "Why has the Egyptian Pound lost so much value against the Dollar in recent years?",
        answer:
          "Egypt moved away from a long-standing managed peg toward a more market-determined rate as part of IMF-supported reform programs, in steps rather than gradually — each step produced a sharp one-time devaluation rather than a smooth decline, which is why the rate's history looks like a staircase rather than a steady slope.",
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
