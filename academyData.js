// lib/academyData.js
//
// Curriculum data for the OmniFin Academy (/learn) — a BabyPips-style
// "School of Pipsology" progression: 5 skill levels, each a handful of
// bite-sized lessons, each lesson a short list of typed content
// "sections" (text / proTip / formula / visual / tool) plus a 4-5
// question end-of-module quiz.
//
// DESIGN NOTE: this file is pure data (no React, no browser APIs) so it
// can be imported from both server components (app/learn/page.jsx,
// app/learn/[level]/[lesson]/page.jsx) and client components
// (components/academy/*) without any "use client" boundary issues, and
// so generateStaticParams() can walk it directly at build time.
//
// Section types rendered by components/academy/LessonViewer.jsx:
//   - "text"    { heading?, body, list? }      — a normal content block
//   - "proTip"  { body }                        — emerald-accent highlighted callout
//   - "risk"    { body }                        — rose-accent risk-warning callout
//                                                 (leverage, revenge trading, moved
//                                                 stops, etc. — genuinely dangerous
//                                                 habits, not just "be careful")
//   - "formula" { label, formula, note? }       — blue-accent key formula/concept card
//   - "visual"  { diagram: {kind, ...}, caption } — rendered by LessonVisualCard
//   - "tool"    { toolId, caption }             — rendered by EmbeddedTool
//
// Diagram kinds rendered by components/academy/LessonVisualCard.jsx:
// "candlestick", "support-resistance", "risk-reward", "bid-ask",
// "ma-crossover", "rsi", "fibonacci", "timeline", "comparison", "flow",
// "gauge", "grid", "ladder" — each a small parameterized SVG, reused
// across lessons rather than one hand-drawn image per lesson.
//
// Categories (for the hub's topic filter): "forex", "metals", "crypto",
// "personal-finance", "technicals".

export const CATEGORIES = [
  { id: "forex", label: "Forex" },
  { id: "metals", label: "Metals" },
  { id: "crypto", label: "Crypto" },
  { id: "personal-finance", label: "Personal Finance" },
  { id: "technicals", label: "Technicals" },
];

// A short intro blurb per category, used by
// components/academy/AcademyHub.jsx's Focused Track View. None of the
// curriculum's actual Level 1 (Rookie) lessons are tagged "forex",
// "metals", "crypto", or "technicals" (Rookie is deliberately
// personal-finance-only — see ACADEMY_LEVELS below). Every card in a
// category track is clickable regardless of lock status: an unlocked
// card navigates straight to the real lesson, while a still-locked
// card opens a "Locked Module" modal (components/academy/AcademyHub.jsx's
// LockedModuleModal) that uses this blurb as the topic's "Basic Concept
// & Introduction" copy, alongside a CTA pointing the visitor at Level 1
// for the real deep-dive lesson, diagrams, and quiz.
export const CATEGORY_OVERVIEWS = {
  forex: "Forex (foreign exchange) is the global market for trading one currency against another — EUR/USD, GBP/JPY, USD/PKR, and thousands of other pairs — open across overlapping global sessions nearly 24 hours a day on weekdays.",
  metals: "Precious metals and commodities — gold (XAU), silver (XAG), platinum, and crude oil — are traded both as physical assets and as price contracts, and are often used as a hedge against inflation or currency weakness.",
  crypto: "Cryptocurrencies are decentralized digital assets — Bitcoin, Ethereum, and others — that trade 24/7 on their own exchanges, with no central bank, and no market close.",
  "personal-finance": "Personal finance covers the everyday money concepts that apply whether or not you ever place a single trade — inflation, compounding, saving, and budgeting.",
  technicals: "Technical analysis studies price charts and indicators — support/resistance, RSI, moving averages, Fibonacci — to read market structure, rather than analyzing a company's or economy's underlying fundamentals.",
};

// A quiz question is always { id, prompt, options: [{id, text}], correctOptionId, explanation }.
const PASS_PERCENT = 80; // 4 of 5 correct

export const ACADEMY_LEVELS = [
  // ===========================================================================
  // LEVEL 1 — ROOKIE: Foundations of Money & Wealth
  // ===========================================================================
  {
    id: "rookie",
    order: 1,
    title: "Rookie",
    subtitle: "Foundations of Money & Wealth",
    description:
      "Start here. Before charts and trades, understand what money actually is, why it loses value over time, and how banks create credit.",
    theme: "emerald",
    lessons: [
      {
        id: "inflation-reality",
        title: "The Inflation Reality",
        categories: ["personal-finance"],
        estMinutes: 6,
        sections: [
          {
            type: "text",
            heading: "Why a dollar today buys less tomorrow",
            body: "Inflation is a sustained rise in the general price level of goods and services — which means every unit of currency buys a little less over time. It isn't a glitch; in most modern economies it's a deliberate policy target (commonly around 2% per year), because central banks believe mild, predictable inflation encourages spending and investment over hoarding cash.",
          },
          {
            type: "text",
            heading: "The silent tax on savings",
            body: "If your savings sit in cash earning 0% while prices rise 5% a year, your real (inflation-adjusted) wealth shrinks even though the number in your account stays the same. This is why \"saving\" and \"investing\" are different goals: saving preserves nominal amount, investing aims to beat the inflation rate.",
            list: [
              "Nominal value: the number printed on the note or statement — never falls on its own.",
              "Real value: what that number can actually buy — falls whenever inflation is positive.",
              "Purchasing power: another name for real value, usually tracked against a basket of goods (a Consumer Price Index).",
            ],
          },
          {
            type: "proTip",
            body: "Compare prices, not just currency amounts, across time. \"My rent is only 20% higher than 5 years ago\" sounds fine until you check whether average wages or the CPI rose by more or less than that.",
          },
          {
            type: "formula",
            label: "Real Return",
            formula: "Real Return ≈ Nominal Return − Inflation Rate",
            note: "A savings account paying 3% interest during 6% inflation is still losing you about 3% in real purchasing power per year.",
          },
          {
            type: "visual",
            diagram: {
              kind: "timeline",
              steps: [
                { label: "Year 0", caption: "$100 buys a full basket of goods" },
                { label: "Year 10", caption: "$100 buys ~82% of that basket (at 2%/yr)" },
                { label: "Year 25", caption: "$100 buys ~60% of that basket" },
                { label: "Year 40", caption: "$100 buys ~45% of that basket" },
              ],
            },
            caption: "The same $100 note, buying less with every passing decade at a steady 2% annual inflation rate.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "What does \"inflation\" fundamentally mean?",
              options: [
                { id: "a", text: "Interest rates are rising" },
                { id: "b", text: "The general price level of goods and services is rising over time" },
                { id: "c", text: "The stock market is going up" },
                { id: "d", text: "A currency has been devalued against gold" },
              ],
              correctOptionId: "b",
              explanation: "Inflation is specifically a sustained rise in the general price level — which is the same thing as a fall in what each unit of currency can buy.",
            },
            {
              id: "q2",
              prompt: "Your savings account pays 2% interest per year while inflation runs at 5%. What's happening to your real purchasing power?",
              options: [
                { id: "a", text: "It's growing by about 7% a year" },
                { id: "b", text: "It's unchanged, since the balance keeps growing" },
                { id: "c", text: "It's shrinking by about 3% a year" },
                { id: "d", text: "It depends only on the exchange rate" },
              ],
              correctOptionId: "c",
              explanation: "Real Return ≈ Nominal Return − Inflation Rate, so 2% − 5% = −3%. The number in the account still grows, but what it can buy shrinks.",
            },
            {
              id: "q3",
              prompt: "\"Nominal value\" refers to:",
              options: [
                { id: "a", text: "The inflation-adjusted buying power of money" },
                { id: "b", text: "The plain number printed on a note or shown in a statement" },
                { id: "c", text: "The value of money in a foreign currency" },
                { id: "d", text: "The value of gold backing a currency" },
              ],
              correctOptionId: "b",
              explanation: "Nominal value is just the face amount — it never falls on its own. Real value is the same amount adjusted for what it can actually buy.",
            },
            {
              id: "q4",
              prompt: "Why do most central banks target a small positive inflation rate (like 2%) rather than 0%?",
              options: [
                { id: "a", text: "To make imports cheaper automatically" },
                { id: "b", text: "Because deflation (falling prices) is mathematically impossible" },
                { id: "c", text: "To discourage hoarding cash and encourage spending/investment" },
                { id: "d", text: "There is no real reason — it's arbitrary" },
              ],
              correctOptionId: "c",
              explanation: "Mild, predictable inflation is widely used as policy because it nudges people toward spending and investing money rather than sitting on cash that slowly loses value either way.",
            },
            {
              id: "q5",
              prompt: "A basket of goods that cost $100 ten years ago now costs $122. Prices have risen by what percentage, and what does that mean for $100 held in cash that whole time?",
              options: [
                { id: "a", text: "Prices rose 22%; that same $100 now buys less of the basket than before" },
                { id: "b", text: "Prices fell 22%; the $100 buys more now" },
                { id: "c", text: "Prices are unchanged; only wages matter" },
                { id: "d", text: "This has no effect on purchasing power" },
              ],
              correctOptionId: "a",
              explanation: "A rise from $100 to $122 for the same basket is 22% cumulative inflation — the same $100 bill now falls short of covering that basket.",
            },
          ],
        },
      },
      {
        id: "money-vs-fiat",
        title: "Money vs. Fiat Currency",
        categories: ["personal-finance"],
        estMinutes: 7,
        sections: [
          {
            type: "text",
            heading: "What makes something \"money\"?",
            body: "Economists generally agree money needs to do three jobs well: serve as a medium of exchange (people will accept it for goods/services), a store of value (it holds its worth over time), and a unit of account (prices can be meaningfully quoted in it). Historically, things like gold, silver, salt, and even large stone discs have served as money to varying degrees.",
          },
          {
            type: "text",
            heading: "Fiat currency: money by decree",
            body: "\"Fiat\" comes from Latin for \"let it be done.\" Fiat currency (like the US Dollar, Euro, or Pakistani Rupee today) has value because a government declares it legal tender and people trust it'll keep being accepted — not because it's backed by a fixed amount of a physical commodity. Since 1971, when the US ended the dollar's convertibility to gold (the \"Nixon Shock\"), essentially every major world currency has been fiat.",
            list: [
              "Commodity money: value comes from the material itself (a gold coin is worth roughly its gold content).",
              "Representative money: a paper claim redeemable for a fixed amount of a commodity (an old gold certificate).",
              "Fiat money: value comes from government decree and public trust/confidence — not backed by a redeemable commodity.",
            ],
          },
          {
            type: "proTip",
            body: "Fiat currency's biggest strength (central banks can expand or contract the money supply quickly to respond to a crisis) is also its biggest long-run weakness (that same flexibility makes gradual currency devaluation structurally easy).",
          },
          {
            type: "visual",
            diagram: {
              kind: "comparison",
              columns: [
                {
                  title: "Commodity-Backed Money",
                  points: [
                    "Value tied to a physical asset (e.g. gold)",
                    "Supply grows only as fast as that commodity is mined/found",
                    "Historically more resistant to sudden devaluation",
                    "Much harder for a government to expand supply at will",
                  ],
                },
                {
                  title: "Fiat Currency",
                  points: [
                    "Value from government decree + public trust",
                    "Supply can be expanded by central bank policy",
                    "Enables fast crisis response (stimulus, rate cuts)",
                    "Vulnerable to inflation if supply grows faster than output",
                  ],
                },
              ],
            },
            caption: "Two very different answers to \"why does this piece of paper have value?\"",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "Which of the following is NOT one of the three classic functions money needs to serve?",
              options: [
                { id: "a", text: "Medium of exchange" },
                { id: "b", text: "Store of value" },
                { id: "c", text: "Unit of account" },
                { id: "d", text: "Guarantee of a fixed interest rate" },
              ],
              correctOptionId: "d",
              explanation: "The three classic functions are medium of exchange, store of value, and unit of account. Interest rates are a separate monetary-policy concept, not a defining function of money.",
            },
            {
              id: "q2",
              prompt: "What gives a fiat currency like the US Dollar its value today?",
              options: [
                { id: "a", text: "A fixed, redeemable amount of gold held by the central bank" },
                { id: "b", text: "Government decree (legal tender status) and public trust/confidence" },
                { id: "c", text: "Its weight in silver" },
                { id: "d", text: "A fixed exchange rate to Bitcoin" },
              ],
              correctOptionId: "b",
              explanation: "Fiat currency is backed by government decree and the public's confidence that it will keep being accepted — not by a redeemable commodity.",
            },
            {
              id: "q3",
              prompt: "What historical event is commonly cited as ending the US Dollar's direct convertibility to gold?",
              options: [
                { id: "a", text: "The 2008 financial crisis" },
                { id: "b", text: "The 1944 Bretton Woods Agreement" },
                { id: "c", text: "The 1971 \"Nixon Shock\"" },
                { id: "d", text: "The creation of the Euro" },
              ],
              correctOptionId: "c",
              explanation: "In 1971, President Nixon suspended the dollar's convertibility into gold, effectively moving the US (and soon the rest of the world) onto a fully fiat system.",
            },
            {
              id: "q4",
              prompt: "What is the main structural risk commonly associated with fiat currency systems?",
              options: [
                { id: "a", text: "Central banks cannot respond quickly to economic crises" },
                { id: "b", text: "The money supply can be expanded relatively easily, risking devaluation/inflation" },
                { id: "c", text: "It can never be used for international trade" },
                { id: "d", text: "It must always be physically printed, with no digital form" },
              ],
              correctOptionId: "b",
              explanation: "Because fiat supply isn't anchored to a fixed physical commodity, it can be expanded by policy decisions — which is flexible in a crisis, but structurally makes gradual devaluation easier than under a commodity-backed system.",
            },
            {
              id: "q5",
              prompt: "An old paper note that could be physically exchanged at a bank for a fixed amount of gold is an example of:",
              options: [
                { id: "a", text: "Fiat money" },
                { id: "b", text: "Representative money" },
                { id: "c", text: "Cryptocurrency" },
                { id: "d", text: "A derivative contract" },
              ],
              correctOptionId: "b",
              explanation: "That's representative money — a paper claim redeemable for a fixed quantity of a commodity, distinct from both pure commodity money and fiat money.",
            },
          ],
        },
      },
      {
        id: "fractional-reserve-banking",
        title: "Fractional Reserve Banking",
        categories: ["personal-finance"],
        estMinutes: 7,
        sections: [
          {
            type: "text",
            heading: "Your deposit isn't just sitting in a vault",
            body: "When you deposit $1,000 in a bank, the bank doesn't lock it in a vault waiting for you to withdraw it. Under fractional reserve banking, it keeps only a fraction as reserves and lends the rest out, earning interest on those loans. Historically regulators set a specific minimum reserve ratio; in practice, modern frameworks (like the US's post-2020 approach) often rely more on capital and liquidity requirements than a single fixed reserve ratio, but the core mechanism — banks lending out most of what's deposited — is unchanged.",
          },
          {
            type: "text",
            heading: "How this creates new money",
            body: "That loaned-out money typically gets spent and re-deposited into the banking system, where the receiving bank again lends out most of it. Repeated across the whole system, this process effectively multiplies the original deposit into a much larger amount of total money in circulation — without printing a single new banknote.",
            list: [
              "You deposit $1,000. The bank keeps a reserve and lends out the rest.",
              "The borrower spends it; the recipient deposits it in (possibly) another bank.",
              "That bank again keeps a reserve and lends out the rest — and the cycle repeats.",
              "The theoretical ceiling on total money created is roughly the original deposit divided by the reserve ratio.",
            ],
          },
          {
            type: "formula",
            label: "Simple Money Multiplier",
            formula: "Max New Money ≈ Initial Deposit ÷ Reserve Ratio",
            note: "At a 10% reserve ratio, a $1,000 deposit can theoretically support up to $10,000 of total deposits system-wide. Real-world figures are usually lower due to cash holdings, excess reserves, and loan demand.",
          },
          {
            type: "proTip",
            body: "This is exactly why a \"bank run\" (everyone trying to withdraw at once) is dangerous: the bank genuinely does not hold everyone's full deposit in cash at the same time — it's largely out as loans.",
          },
          {
            type: "visual",
            diagram: {
              kind: "flow",
              steps: [
                { label: "Deposit $1,000" },
                { label: "Bank keeps reserve, lends rest" },
                { label: "Borrower spends it" },
                { label: "Re-deposited elsewhere" },
                { label: "Cycle repeats, system-wide" },
              ],
            },
            caption: "How one deposit ripples through the banking system, expanding the effective money supply.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "Under fractional reserve banking, what does a bank do with most of a customer's deposit?",
              options: [
                { id: "a", text: "Holds 100% of it in a vault" },
                { id: "b", text: "Lends most of it out to earn interest, keeping only a fraction as reserves" },
                { id: "c", text: "Converts it entirely into gold" },
                { id: "d", text: "Sends it directly to the central bank permanently" },
              ],
              correctOptionId: "b",
              explanation: "Fractional reserve banking means only a fraction of deposits are held as reserves; the rest is lent out, which is how banks earn interest income.",
            },
            {
              id: "q2",
              prompt: "At a 10% reserve ratio, roughly how much total system-wide money could a single $1,000 deposit theoretically support, before accounting for real-world leakages?",
              options: [
                { id: "a", text: "$1,000" },
                { id: "b", text: "$1,100" },
                { id: "c", text: "$10,000" },
                { id: "d", text: "$100,000" },
              ],
              correctOptionId: "c",
              explanation: "Max New Money ≈ Initial Deposit ÷ Reserve Ratio = $1,000 ÷ 0.10 = $10,000 as a theoretical ceiling.",
            },
            {
              id: "q3",
              prompt: "Why can a sudden \"bank run\" be dangerous for a bank operating under fractional reserves?",
              options: [
                { id: "a", text: "Banks are legally required to refuse all withdrawals during a run" },
                { id: "b", text: "The bank doesn't hold everyone's full deposit in cash at once — much of it is out as loans" },
                { id: "c", text: "Bank runs always cause hyperinflation within hours" },
                { id: "d", text: "It has no real effect; reserves always cover 100% of deposits" },
              ],
              correctOptionId: "b",
              explanation: "Because most deposited money has been lent out, a bank genuinely cannot instantly return 100% of all deposits in cash if everyone demands it simultaneously.",
            },
            {
              id: "q4",
              prompt: "In the deposit-expansion cycle, what typically happens right after a borrower spends a loan?",
              options: [
                { id: "a", text: "The money permanently leaves the banking system" },
                { id: "b", text: "It is usually re-deposited somewhere in the banking system, enabling a further round of lending" },
                { id: "c", text: "It is destroyed by the central bank" },
                { id: "d", text: "It must be converted to a foreign currency" },
              ],
              correctOptionId: "b",
              explanation: "Spent loan proceeds are typically deposited again (by whoever received them), letting that receiving bank repeat the lend-most-of-it-out process.",
            },
            {
              id: "q5",
              prompt: "What has been the general shift in how many modern banking regulatory frameworks approach bank safety, beyond a single fixed reserve ratio?",
              options: [
                { id: "a", text: "A growing reliance on capital and liquidity requirements alongside/instead of one fixed ratio" },
                { id: "b", text: "Complete elimination of any reserve or capital requirements" },
                { id: "c", text: "A return to a 100% gold-backed reserve requirement everywhere" },
                { id: "d", text: "Requiring banks to hold reserves only in cryptocurrency" },
              ],
              correctOptionId: "a",
              explanation: "Many modern frameworks (such as the US's post-2020 approach) lean more on capital adequacy and liquidity coverage requirements than a single historical reserve ratio, even though the core fractional-lending mechanism remains.",
            },
          ],
        },
      },
      {
        id: "gold-vs-paper-money",
        title: "Gold vs. Paper Money",
        categories: ["personal-finance", "metals"],
        estMinutes: 6,
        sections: [
          {
            type: "text",
            heading: "Why gold has held value for millennia",
            body: "Gold has been used as money or a store of value across nearly every major civilization for thousands of years. It's scarce, nearly indestructible, divisible, and costly to produce more of — properties that made it a natural \"hard money\" long before paper currency existed. Unlike a fiat note, gold's value isn't dependent on any single government's promise.",
          },
          {
            type: "text",
            heading: "Why paper money won anyway",
            body: "Despite gold's durability as a store of value, carrying and verifying physical gold for everyday transactions is impractical. Paper currency (and later, digital balances) solved the convenience problem: it's light, easy to divide into exact amounts, and easy to move electronically across the planet in seconds — trade-offs gold inherently can't match.",
            list: [
              "Gold: scarce, durable, historically trusted — but heavy, hard to divide precisely, slow to transact with physically.",
              "Paper/fiat: convenient, instantly transferable, programmable — but its supply can be expanded, exposing it to inflation risk.",
              "Many investors today hold some gold specifically as an inflation/currency-devaluation hedge, not as everyday spending money.",
            ],
          },
          {
            type: "proTip",
            body: "This is exactly why the Metals & Commodities Calculator on this platform exists — gold/silver pricing is quoted per troy ounce and converted into your local currency and weight unit, which is the real-world starting point for thinking about gold as a store of value.",
          },
          {
            type: "tool",
            toolId: "metals-calculator",
            caption: "Try it: see the live price of gold, silver, platinum, palladium or copper in your preferred weight unit and currency.",
          },
          {
            type: "visual",
            diagram: {
              kind: "comparison",
              columns: [
                {
                  title: "Gold",
                  points: [
                    "Finite physical supply — can't be printed",
                    "No counterparty/government default risk",
                    "Historically preserves purchasing power over long periods",
                    "Impractical for instant, everyday transactions",
                  ],
                },
                {
                  title: "Paper / Fiat Money",
                  points: [
                    "Instantly transferable, highly divisible",
                    "Backed by government decree, not a hard asset",
                    "Supply can expand, risking devaluation",
                    "The practical choice for day-to-day spending",
                  ],
                },
              ],
            },
            caption: "Neither is strictly \"better\" — they solve different problems. Many portfolios use both.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "What property has made gold useful as money or a store of value across history?",
              options: [
                { id: "a", text: "It's easy to mass-produce on demand" },
                { id: "b", text: "It's scarce, durable, and divisible" },
                { id: "c", text: "Its value is set by a single government" },
                { id: "d", text: "It degrades quickly, encouraging spending" },
              ],
              correctOptionId: "b",
              explanation: "Gold's scarcity, durability, and divisibility (plus being costly to produce more of) are exactly why it became a trusted store of value long before fiat currency existed.",
            },
            {
              id: "q2",
              prompt: "What is the main practical disadvantage of gold compared to paper/digital money for everyday transactions?",
              options: [
                { id: "a", text: "It has no value at all" },
                { id: "b", text: "It's heavy, harder to divide precisely, and slow to transact with physically" },
                { id: "c", text: "It can only be used in one country" },
                { id: "d", text: "It is illegal to own in most countries" },
              ],
              correctOptionId: "b",
              explanation: "Gold's physical properties make it impractical for fast, everyday spending — which is exactly the gap paper and digital currency filled.",
            },
            {
              id: "q3",
              prompt: "Why do many investors hold gold specifically as a hedge, even in a world of fiat currency?",
              options: [
                { id: "a", text: "Gold guarantees a fixed annual return" },
                { id: "b", text: "Its supply can't be expanded the way fiat currency supply can, which historically helps preserve purchasing power" },
                { id: "c", text: "Gold is easier to spend than cash" },
                { id: "d", text: "It eliminates all investment risk" },
              ],
              correctOptionId: "b",
              explanation: "Gold's fixed, hard-to-expand supply is the core reason it's used as a hedge against currency devaluation and inflation, not because it offers any guaranteed return.",
            },
            {
              id: "q4",
              prompt: "On this platform's Metals & Commodities Calculator, gold and silver prices are quoted per:",
              options: [
                { id: "a", text: "Troy ounce" },
                { id: "b", text: "Barrel" },
                { id: "c", text: "Metric ton only" },
                { id: "d", text: "Carat only" },
              ],
              correctOptionId: "a",
              explanation: "Precious metals on this platform (gold, silver, platinum, palladium, copper) are priced per troy ounce, then converted into whichever weight unit and currency you choose.",
            },
            {
              id: "q5",
              prompt: "Which statement best summarizes the gold-vs-paper-money trade-off?",
              options: [
                { id: "a", text: "Gold is always strictly superior to fiat currency in every situation" },
                { id: "b", text: "Fiat currency is always strictly superior to gold in every situation" },
                { id: "c", text: "They solve different problems — gold as a long-term store of value, fiat for everyday convenience and liquidity" },
                { id: "d", text: "There is no meaningful difference between the two" },
              ],
              correctOptionId: "c",
              explanation: "Neither wins outright — gold's strength is long-term value preservation without counterparty risk, while fiat's strength is convenience and liquidity for daily transactions.",
            },
          ],
        },
      },
    ],
  },

  // ===========================================================================
  // LEVEL 2 — APPRENTICE: Market Mechanics & Charting
  // ===========================================================================
  {
    id: "apprentice",
    order: 2,
    title: "Apprentice",
    subtitle: "Market Mechanics & Charting",
    description:
      "Learn how markets actually quote prices and execute trades — candlesticks, spreads, pips, lots, and order types.",
    theme: "blue",
    lessons: [
      {
        id: "candlestick-anatomy",
        title: "Candlestick Anatomy",
        categories: ["technicals", "forex"],
        estMinutes: 7,
        sections: [
          {
            type: "text",
            heading: "One candle, four prices",
            body: "A candlestick summarizes price action over a chosen time period (a minute, an hour, a day — whatever the chart's \"timeframe\" is set to) using four numbers: the Open, High, Low, and Close (often abbreviated OHLC). The thick part is the \"body\" (the range between open and close); the thin lines above and below are \"wicks\" or \"shadows\" (the full high/low range reached during that period).",
          },
          {
            type: "text",
            heading: "Bullish vs. bearish",
            body: "If the close is higher than the open, the candle is bullish (price rose during that period) — typically shown green or white, hollow/unfilled. If the close is lower than the open, it's bearish (price fell) — typically shown red or black, filled solid. The color convention can be customized on most platforms, but green=up / red=down is the most common default.",
            list: [
              "Open: the first traded price of the period",
              "High: the highest traded price of the period",
              "Low: the lowest traded price of the period",
              "Close: the last traded price of the period",
              "Body: the box between Open and Close",
              "Wick/Shadow: the thin line(s) showing the High and Low beyond the body",
            ],
          },
          {
            type: "proTip",
            body: "A long wick on one side of a candle tells a story: price pushed hard in that direction, then got rejected and pulled back by the end of the period — often a sign of buyer/seller struggle at that level.",
          },
          {
            type: "visual",
            diagram: { kind: "candlestick", bullish: true },
            caption: "A bullish candle: the close is above the open, so the body is unfilled/green, with wicks showing the full high/low range.",
          },
          {
            type: "visual",
            diagram: { kind: "candlestick", bullish: false },
            caption: "A bearish candle: the close is below the open, so the body is filled/red.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "What four prices does a single candlestick represent?",
              options: [
                { id: "a", text: "Open, High, Low, Close" },
                { id: "b", text: "Bid, Ask, Spread, Volume" },
                { id: "c", text: "Support, Resistance, Pivot, Trend" },
                { id: "d", text: "Open, Close, Volume, Spread" },
              ],
              correctOptionId: "a",
              explanation: "A candlestick is built from the Open, High, Low, and Close (OHLC) prices of its time period.",
            },
            {
              id: "q2",
              prompt: "A candle closes ABOVE where it opened. What kind of candle is this?",
              options: [
                { id: "a", text: "Bearish" },
                { id: "b", text: "Bullish" },
                { id: "c", text: "Neutral/Doji only" },
                { id: "d", text: "It can't be determined from this alone" },
              ],
              correctOptionId: "b",
              explanation: "Close above Open means price rose over that period — that's the definition of a bullish candle, conventionally shown green/unfilled.",
            },
            {
              id: "q3",
              prompt: "What does the \"body\" of a candlestick represent?",
              options: [
                { id: "a", text: "The full range between the High and the Low" },
                { id: "b", text: "The range between the Open and the Close" },
                { id: "c", text: "The average price over the period" },
                { id: "d", text: "The trading volume for that period" },
              ],
              correctOptionId: "b",
              explanation: "The body is specifically the Open-to-Close range; the High/Low range beyond the body is shown by the wicks/shadows.",
            },
            {
              id: "q4",
              prompt: "What does a long upper wick with a small body typically suggest happened during that period?",
              options: [
                { id: "a", text: "Price pushed up strongly, then was rejected and pulled back by the close" },
                { id: "b", text: "There was zero trading activity" },
                { id: "c", text: "The close was the highest price of the period" },
                { id: "d", text: "It guarantees the next candle will be bullish" },
              ],
              correctOptionId: "a",
              explanation: "A long upper wick means price reached well above the body's top before being pushed back down by the close — a sign of rejection/selling pressure at that higher level.",
            },
            {
              id: "q5",
              prompt: "On most charting platforms, what is the default color convention for a bearish (down) candle?",
              options: [
                { id: "a", text: "Green or white, unfilled" },
                { id: "b", text: "Red or black, filled" },
                { id: "c", text: "Blue, striped" },
                { id: "d", text: "There is no common convention at all" },
              ],
              correctOptionId: "b",
              explanation: "Red/black filled is the most common default for a bearish candle (close below open), though this is customizable on most platforms.",
            },
          ],
        },
      },
      {
        id: "bid-ask-spread",
        title: "Bid/Ask Spreads",
        categories: ["forex", "technicals"],
        estMinutes: 6,
        sections: [
          {
            type: "text",
            heading: "Two prices, always",
            body: "Every tradable instrument actually has two live prices at once: the Bid (the highest price a buyer is currently willing to pay — what you'd get if you sold right now) and the Ask/Offer (the lowest price a seller is currently willing to accept — what you'd pay if you bought right now). The Ask is always equal to or higher than the Bid.",
          },
          {
            type: "text",
            heading: "The spread is a built-in cost",
            body: "The difference between Ask and Bid is the spread — effectively a transaction cost paid to whoever provides that liquidity (a broker or market maker), separate from any commission. The moment you open a position, you're already slightly \"underwater\" by the size of the spread, because you buy at the (higher) Ask and would have to sell at the (lower) Bid to close immediately.",
            list: [
              "Bid: price you SELL at",
              "Ask (Offer): price you BUY at",
              "Spread = Ask − Bid",
              "Tighter spreads = generally more liquid markets (e.g. EUR/USD); wider spreads = typically less liquid or more volatile instruments",
            ],
          },
          {
            type: "formula",
            label: "Spread Cost",
            formula: "Spread = Ask Price − Bid Price",
            note: "A EUR/USD quote of 1.0850 / 1.0852 has a 2-pip spread — meaning the pair would need to move 2 pips in your favor just to break even on entry.",
          },
          {
            type: "proTip",
            body: "Spreads widen during low-liquidity periods — major news releases, market opens/closes, and holidays. A strategy that works fine on a normal 1-pip spread can quietly lose its edge if spreads balloon to 5-10 pips during a news spike.",
          },
          {
            type: "visual",
            diagram: { kind: "bid-ask", bid: 1.085, ask: 1.0852 },
            caption: "The gap between what you can sell at (Bid) and buy at (Ask) is the spread.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "What is the \"Bid\" price?",
              options: [
                { id: "a", text: "The price you would pay to buy right now" },
                { id: "b", text: "The highest price a buyer is currently willing to pay (what you'd get selling now)" },
                { id: "c", text: "The average of the last 10 trades" },
                { id: "d", text: "A fixed government-set exchange rate" },
              ],
              correctOptionId: "b",
              explanation: "The Bid is the price at which you can sell immediately — the highest a buyer is currently offering.",
            },
            {
              id: "q2",
              prompt: "EUR/USD is quoted at 1.0850 / 1.0853. What is the spread, in pips?",
              options: [
                { id: "a", text: "0 pips" },
                { id: "b", text: "3 pips" },
                { id: "c", text: "30 pips" },
                { id: "d", text: "0.3 pips" },
              ],
              correctOptionId: "b",
              explanation: "Spread = Ask − Bid = 1.0853 − 1.0850 = 0.0003, which is 3 pips on a pair quoted to 4 decimal places.",
            },
            {
              id: "q3",
              prompt: "Why does opening a new trade immediately put you at a small notional loss?",
              options: [
                { id: "a", text: "You buy at the (higher) Ask, but would have to sell at the (lower) Bid to close instantly — that gap is the spread" },
                { id: "b", text: "All brokers charge a mandatory loss fee" },
                { id: "c", text: "It doesn't — trades always open at breakeven" },
                { id: "d", text: "Only true for stock trades, never for forex" },
              ],
              correctOptionId: "a",
              explanation: "Because you buy at Ask and sell at Bid, the spread is effectively paid upfront — price needs to move in your favor by at least the spread size before you're at breakeven.",
            },
            {
              id: "q4",
              prompt: "When do spreads typically widen the most?",
              options: [
                { id: "a", text: "During the calmest, most liquid trading hours" },
                { id: "b", text: "During major news releases, market opens/closes, and holidays — lower-liquidity periods" },
                { id: "c", text: "Spreads are always perfectly fixed and never change" },
                { id: "d", text: "Only on weekends when markets are closed" },
              ],
              correctOptionId: "b",
              explanation: "Lower liquidity around big news events, session opens/closes, and holidays is exactly when spreads tend to widen the most.",
            },
            {
              id: "q5",
              prompt: "Which pair would you generally expect to have a tighter typical spread?",
              options: [
                { id: "a", text: "A highly liquid major pair like EUR/USD" },
                { id: "b", text: "A thinly-traded exotic currency pair" },
                { id: "c", text: "Spreads are unrelated to liquidity" },
                { id: "d", text: "They're always identical across all pairs" },
              ],
              correctOptionId: "a",
              explanation: "More liquid instruments (like EUR/USD, the most heavily traded pair in the world) generally have tighter spreads than thinly-traded exotics.",
            },
          ],
        },
      },
      {
        id: "pips-and-lot-sizes",
        title: "Pips & Lot Sizes",
        categories: ["forex"],
        estMinutes: 8,
        sections: [
          {
            type: "text",
            heading: "What is a pip?",
            body: "A \"pip\" (Percentage In Point) is the standard smallest meaningful price increment for most forex pairs — typically the 4th decimal place (e.g., EUR/USD moving from 1.0850 to 1.0851 is a 1-pip move). Yen pairs are the main exception, since they're quoted to only 2 decimal places, making the 2nd decimal the pip (e.g., USD/JPY 150.25 to 150.26).",
          },
          {
            type: "text",
            heading: "Lot sizes: how much you're actually trading",
            body: "A \"lot\" is a standardized trade size. A Standard Lot is 100,000 units of the base currency; a Mini Lot is 10,000 units (1/10th); a Micro Lot is 1,000 units (1/100th). The lot size you trade directly determines how much money each pip movement is worth to you.",
            list: [
              "Standard Lot = 100,000 units → roughly $10/pip on most USD-quoted pairs",
              "Mini Lot = 10,000 units → roughly $1/pip",
              "Micro Lot = 1,000 units → roughly $0.10/pip",
              "Exact pip value varies slightly by pair and by your account's quote currency.",
            ],
          },
          {
            type: "formula",
            label: "Approximate Pip Value (USD-quoted pairs)",
            formula: "Pip Value ≈ (Lot Size × Pip Size) in quote currency",
            note: "For a standard lot (100,000 units) on a pair quoted to 4 decimals, 1 pip (0.0001) × 100,000 = $10 per pip. Micro lot (1,000 units) → $0.10 per pip.",
          },
          {
            type: "proTip",
            body: "Beginners blow up accounts far more often from oversized lots than from being \"wrong\" about direction. A correct trade with a lot size too large for your account can still wipe you out on a normal pullback.",
          },
          {
            type: "visual",
            diagram: {
              kind: "ladder",
              items: [
                { label: "Standard Lot", value: "100,000 units ≈ $10/pip" },
                { label: "Mini Lot", value: "10,000 units ≈ $1/pip" },
                { label: "Micro Lot", value: "1,000 units ≈ $0.10/pip" },
              ],
            },
            caption: "The same 1-pip price move is worth very different amounts depending on your lot size.",
          },
          {
            type: "tool",
            toolId: "lot-size-calculator",
            caption: "Try it: enter your account balance, risk %, and stop-loss distance to get a suggested lot size.",
          },
          {
            type: "tool",
            toolId: "pip-value-calculator",
            caption: "Try it: see what one pip is actually worth in USD and PKR for a given quote currency and lot size.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "On a standard EUR/USD quote (4 decimal places), moving from 1.0850 to 1.0851 is:",
              options: [
                { id: "a", text: "1 pip" },
                { id: "b", text: "10 pips" },
                { id: "c", text: "0.1 pip" },
                { id: "d", text: "1 point only, not a pip" },
              ],
              correctOptionId: "a",
              explanation: "A change in the 4th decimal place on a standard pair is exactly 1 pip.",
            },
            {
              id: "q2",
              prompt: "What is special about pip measurement on Japanese Yen pairs like USD/JPY?",
              options: [
                { id: "a", text: "Yen pairs have no pips at all" },
                { id: "b", text: "Yen pairs are quoted to 2 decimal places, so the pip is the 2nd decimal, not the 4th" },
                { id: "c", text: "Yen pairs use a completely different currency unit" },
                { id: "d", text: "Pip value is always $100 on Yen pairs" },
              ],
              correctOptionId: "b",
              explanation: "Because Yen pairs are quoted with only 2 decimal places, 1 pip there is a move in the 2nd decimal (e.g. 150.25 → 150.26), not the 4th.",
            },
            {
              id: "q3",
              prompt: "How many units is one Standard Lot in forex?",
              options: [
                { id: "a", text: "1,000 units" },
                { id: "b", text: "10,000 units" },
                { id: "c", text: "100,000 units" },
                { id: "d", text: "1,000,000 units" },
              ],
              correctOptionId: "c",
              explanation: "A Standard Lot is 100,000 units of the base currency — 10x a Mini Lot, 100x a Micro Lot.",
            },
            {
              id: "q4",
              prompt: "Trading 1 Micro Lot (1,000 units) on a USD-quoted pair, roughly how much is each pip worth?",
              options: [
                { id: "a", text: "≈ $10" },
                { id: "b", text: "≈ $1" },
                { id: "c", text: "≈ $0.10" },
                { id: "d", text: "≈ $100" },
              ],
              correctOptionId: "c",
              explanation: "Pip Value ≈ Lot Size × Pip Size = 1,000 × 0.0001 = $0.10 per pip for a Micro Lot.",
            },
            {
              id: "q5",
              prompt: "What's the most common reason beginner traders blow up their accounts, according to this lesson?",
              options: [
                { id: "a", text: "Always being wrong about market direction" },
                { id: "b", text: "Trading a lot size too large for their account, so even a normal pullback causes outsized losses" },
                { id: "c", text: "Only trading during news events" },
                { id: "d", text: "Using too many indicators" },
              ],
              correctOptionId: "b",
              explanation: "Oversized lot sizes relative to account size are the classic account-killer — even directionally correct trades can wipe out an account if position size is too large.",
            },
          ],
        },
      },
      {
        id: "order-types",
        title: "Order Types: Market vs. Limit",
        categories: ["forex", "technicals"],
        estMinutes: 6,
        sections: [
          {
            type: "text",
            heading: "Market orders: speed over price",
            body: "A Market Order executes immediately at the best currently available price. You're guaranteed an instant fill, but not a guaranteed exact price — in fast-moving or illiquid conditions, you might get \"slipped\" to a slightly worse price than what you saw when clicking.",
          },
          {
            type: "text",
            heading: "Limit orders: price over speed",
            body: "A Limit Order only executes at your specified price or better — it won't fill at a worse price, but it might not fill at all if the market never reaches your level. A Buy Limit sits below the current price (buy cheaper); a Sell Limit sits above the current price (sell higher).",
            list: [
              "Market Order: fills NOW, at whatever the current price is — speed guaranteed, price not guaranteed.",
              "Limit Order: fills only at YOUR price or better — price guaranteed, fill not guaranteed.",
              "Stop Order: becomes a market order once price reaches a trigger level — often used for breakout entries or stop-losses.",
              "Stop-Limit Order: becomes a limit order (not market) once the trigger level is hit — combines both behaviors.",
            ],
          },
          {
            type: "proTip",
            body: "Use a Market Order when you need to be in/out NOW (like closing a losing trade fast). Use a Limit Order when you have a specific price target and would rather miss the trade than pay a worse price for it.",
          },
          {
            type: "visual",
            diagram: {
              kind: "ladder",
              items: [
                { label: "Sell Limit (above market)", value: "Fills only at this price or better (higher)" },
                { label: "Current Market Price", value: "Market Order fills here instantly" },
                { label: "Buy Limit (below market)", value: "Fills only at this price or better (lower)" },
              ],
            },
            caption: "Limit orders sit away from the current price, waiting for the market to come to them.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "What does a Market Order guarantee?",
              options: [
                { id: "a", text: "An exact price, but not a fast fill" },
                { id: "b", text: "An immediate fill, but not an exact price" },
                { id: "c", text: "Both an exact price AND an immediate fill, always" },
                { id: "d", text: "Neither — it's purely theoretical" },
              ],
              correctOptionId: "b",
              explanation: "Market orders prioritize speed: they fill right away at the best currently available price, which can differ slightly from the price you saw a moment earlier (slippage).",
            },
            {
              id: "q2",
              prompt: "You place a Buy Limit order below the current market price. What happens if price never falls to that level?",
              options: [
                { id: "a", text: "It automatically fills at the current market price anyway" },
                { id: "b", text: "The order simply never fills" },
                { id: "c", text: "It fills at double the requested price" },
                { id: "d", text: "This situation is impossible by definition" },
              ],
              correctOptionId: "b",
              explanation: "A Limit order only fills at your specified price or better — if the market never reaches it, the order just sits unfilled (until cancelled or it expires).",
            },
            {
              id: "q3",
              prompt: "What's the key trade-off between Market and Limit orders?",
              options: [
                { id: "a", text: "Market orders guarantee price but risk no fill; Limit orders guarantee a fill but risk a worse price" },
                { id: "b", text: "Market orders guarantee a fast fill but not an exact price; Limit orders guarantee the price but not that it fills" },
                { id: "c", text: "There is no trade-off; they behave identically" },
                { id: "d", text: "Limit orders are always better in every situation" },
              ],
              correctOptionId: "b",
              explanation: "This is the core trade-off: Market = speed guaranteed, price not guaranteed. Limit = price guaranteed (or better), fill not guaranteed.",
            },
            {
              id: "q4",
              prompt: "A Stop Order becomes what, once its trigger price is reached?",
              options: [
                { id: "a", text: "A market order" },
                { id: "b", text: "A cancelled order" },
                { id: "c", text: "A guaranteed-fill limit order" },
                { id: "d", text: "It has no effect at all" },
              ],
              correctOptionId: "a",
              explanation: "A Stop Order sits dormant until price reaches the trigger level, at which point it converts into a market order and fills at the next available price.",
            },
            {
              id: "q5",
              prompt: "When would a trader typically prefer a Market Order over a Limit Order?",
              options: [
                { id: "a", text: "When they have a very specific price target and are fine missing the trade entirely" },
                { id: "b", text: "When they need to enter or exit a position right now and speed matters more than exact price" },
                { id: "c", text: "Market orders can never be used to close a position" },
                { id: "d", text: "Only when trading on weekends" },
              ],
              correctOptionId: "b",
              explanation: "Market orders are the right tool specifically when immediacy matters more than squeezing out an exact price — e.g. urgently closing a losing position.",
            },
          ],
        },
      },
    ],
  },

  // ===========================================================================
  // LEVEL 3 — ANALYST: Technical Precision & Indicators
  // ===========================================================================
  {
    id: "analyst",
    order: 3,
    title: "Analyst",
    subtitle: "Technical Precision & Indicators",
    description:
      "Learn the core toolkit chart analysts actually use: support/resistance zones, RSI, moving averages, Fibonacci retracements, and Gann basics.",
    theme: "violet",
    lessons: [
      {
        id: "support-resistance",
        title: "Support & Resistance Zones",
        categories: ["technicals", "forex"],
        estMinutes: 7,
        sections: [
          {
            type: "text",
            heading: "The market's invisible floors and ceilings",
            body: "Support is a price level (or zone) where buying pressure has historically been strong enough to stop a decline and push price back up. Resistance is the mirror image — a level where selling pressure has historically stopped an advance and pushed price back down. These levels form because traders remember price reacting there before, and place orders accordingly.",
          },
          {
            type: "text",
            heading: "Zones, not exact lines — and roles can flip",
            body: "In practice, support/resistance are rarely a single exact price; they're better thought of as zones, since price often reacts slightly above or below the \"textbook\" level. Critically, once resistance is decisively broken, it often becomes new support (and vice versa for broken support becoming new resistance) — this is called a role reversal.",
            list: [
              "The more times a level has been tested and held, the more significant traders generally consider it.",
              "A \"breakout\" is price decisively closing through a support/resistance level, often on higher volume.",
              "A \"false breakout\" (or \"fakeout\") is when price briefly breaks a level then quickly reverses back — a common trap.",
            ],
          },
          {
            type: "proTip",
            body: "Don't trade the exact touch of a level — wait for confirmation (a candle close beyond it, or a retest that holds) rather than guessing the first time price approaches.",
          },
          {
            type: "visual",
            diagram: { kind: "support-resistance", breakout: "up" },
            caption: "Price respects resistance twice, then breaks out above it — that old resistance often becomes new support on a retest.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "What is \"support\" in technical analysis?",
              options: [
                { id: "a", text: "A level where selling pressure has historically stopped a price advance" },
                { id: "b", text: "A level where buying pressure has historically stopped a price decline" },
                { id: "c", text: "The average price over the last year" },
                { id: "d", text: "A government-mandated price floor" },
              ],
              correctOptionId: "b",
              explanation: "Support is where buyers have historically stepped in strongly enough to halt a decline and push price back up.",
            },
            {
              id: "q2",
              prompt: "What typically happens to a resistance level once it is decisively broken?",
              options: [
                { id: "a", text: "It disappears from the chart entirely" },
                { id: "b", text: "It often becomes new support on a retest (role reversal)" },
                { id: "c", text: "It becomes impossible for price to ever return to" },
                { id: "d", text: "Nothing — broken levels have no further relevance" },
              ],
              correctOptionId: "b",
              explanation: "A classic role reversal: once resistance is broken, that same level frequently acts as new support if price comes back down to test it.",
            },
            {
              id: "q3",
              prompt: "What is a \"false breakout\" (fakeout)?",
              options: [
                { id: "a", text: "A breakout that is later confirmed by a strong trend" },
                { id: "b", text: "Price briefly breaking a level, then quickly reversing back the other way" },
                { id: "c", text: "A breakout that only happens on weekends" },
                { id: "d", text: "A level that has never been tested" },
              ],
              correctOptionId: "b",
              explanation: "A false breakout traps traders who entered on the initial break, as price quickly snaps back inside the prior range.",
            },
            {
              id: "q4",
              prompt: "Why are support/resistance better thought of as \"zones\" rather than exact single prices?",
              options: [
                { id: "a", text: "Because price typically reacts slightly above or below the textbook level, not at one exact tick" },
                { id: "b", text: "Because support and resistance don't actually exist" },
                { id: "c", text: "Because they only apply to daily charts" },
                { id: "d", text: "Because brokers manually set these levels" },
              ],
              correctOptionId: "a",
              explanation: "Real market reactions cluster around a level rather than hitting one exact price every time, which is why traders treat them as zones.",
            },
            {
              id: "q5",
              prompt: "What's a safer approach than trading the very first touch of a support/resistance level?",
              options: [
                { id: "a", text: "Always enter immediately on first touch, no exceptions" },
                { id: "b", text: "Wait for confirmation — like a candle close beyond the level, or a retest that holds" },
                { id: "c", text: "Ignore support/resistance entirely" },
                { id: "d", text: "Only trade levels that have never been touched before" },
              ],
              correctOptionId: "b",
              explanation: "Waiting for confirmation (a decisive close through the level, or a retest holding) reduces the risk of being caught in a false breakout or a level that simply holds again.",
            },
          ],
        },
      },
      {
        id: "rsi-indicator",
        title: "RSI (Relative Strength Index)",
        categories: ["technicals"],
        estMinutes: 7,
        sections: [
          {
            type: "text",
            heading: "A 0-100 momentum gauge",
            body: "The Relative Strength Index (RSI), developed by J. Welles Wilder, is a momentum oscillator that measures the speed and magnitude of recent price changes on a scale of 0 to 100. It's typically calculated over a 14-period lookback, comparing the average size of recent gains to the average size of recent losses.",
          },
          {
            type: "text",
            heading: "Overbought, oversold, and divergence",
            body: "Classic RSI interpretation uses 70 and 30 as thresholds: a reading above 70 suggests the instrument may be \"overbought\" (potentially due for a pullback), and below 30 suggests \"oversold\" (potentially due for a bounce). RSI divergence — where price makes a new high/low but RSI doesn't confirm it — is often watched as an early warning of weakening momentum.",
            list: [
              "RSI > 70: often read as overbought",
              "RSI < 30: often read as oversold",
              "RSI around 50: often read as neutral/balanced momentum",
              "In a strong trend, RSI can stay \"overbought\" or \"oversold\" for a long time — it is NOT an automatic reversal signal by itself.",
            ],
          },
          {
            type: "proTip",
            body: "The single biggest RSI mistake: treating \"overbought\" as \"sell immediately.\" In a strong uptrend, RSI can sit above 70 for a long stretch while price keeps climbing — overbought means stretched, not guaranteed to reverse.",
          },
          {
            type: "visual",
            diagram: { kind: "rsi", zone: "overbought" },
            caption: "RSI pushing above the 70 line — a stretched-momentum reading, not an automatic sell signal on its own.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "What range does the RSI indicator oscillate within?",
              options: [
                { id: "a", text: "-100 to +100" },
                { id: "b", text: "0 to 100" },
                { id: "c", text: "0 to 10" },
                { id: "d", text: "It has no fixed range" },
              ],
              correctOptionId: "b",
              explanation: "RSI is a bounded oscillator that always reads between 0 and 100.",
            },
            {
              id: "q2",
              prompt: "What does an RSI reading above 70 classically suggest?",
              options: [
                { id: "a", text: "The instrument may be \"overbought\" — potentially due for a pullback" },
                { id: "b", text: "The instrument is guaranteed to crash within the hour" },
                { id: "c", text: "The instrument has zero momentum" },
                { id: "d", text: "A buy signal with no further analysis needed" },
              ],
              correctOptionId: "a",
              explanation: "Above 70 is the classic \"overbought\" threshold — a sign momentum is stretched, not a guarantee of an imminent reversal.",
            },
            {
              id: "q3",
              prompt: "What is RSI divergence?",
              options: [
                { id: "a", text: "When RSI and price move in perfect lockstep" },
                { id: "b", text: "When price makes a new high/low but RSI fails to confirm it with its own new high/low" },
                { id: "c", text: "When RSI exceeds 100" },
                { id: "d", text: "A type of candlestick pattern" },
              ],
              correctOptionId: "b",
              explanation: "Divergence is specifically a mismatch between price action and RSI's momentum reading — often watched as an early hint that momentum is fading.",
            },
            {
              id: "q4",
              prompt: "Why is treating \"RSI above 70 = sell now\" considered a common mistake?",
              options: [
                { id: "a", text: "RSI can stay elevated for a long time during a strong trend without price reversing" },
                { id: "b", text: "RSI above 70 is actually a buy signal, not a sell signal" },
                { id: "c", text: "RSI cannot go above 70 in real markets" },
                { id: "d", text: "There is no such thing as an overbought reading" },
              ],
              correctOptionId: "a",
              explanation: "In a strong uptrend, RSI can remain overbought for an extended period while price keeps climbing — it's a stretched-momentum signal, not an automatic reversal trigger.",
            },
            {
              id: "q5",
              prompt: "RSI is typically calculated by comparing:",
              options: [
                { id: "a", text: "The current price to the previous day's closing price only" },
                { id: "b", text: "The average size of recent gains to the average size of recent losses over a lookback period (commonly 14)" },
                { id: "c", text: "Trading volume to open interest" },
                { id: "d", text: "The bid price to the ask price" },
              ],
              correctOptionId: "b",
              explanation: "RSI's core calculation compares average recent gains vs. average recent losses over a chosen lookback (14 periods is the most common default) to produce its 0-100 reading.",
            },
          ],
        },
      },
      {
        id: "moving-averages",
        title: "Moving Averages",
        categories: ["technicals"],
        estMinutes: 7,
        sections: [
          {
            type: "text",
            heading: "Smoothing out the noise",
            body: "A moving average (MA) smooths raw price data into a single flowing line by averaging price over a chosen number of recent periods, continuously updating as new data comes in. This makes the underlying trend direction easier to see through the day-to-day noise of individual candles.",
          },
          {
            type: "text",
            heading: "SMA vs. EMA, and crossovers",
            body: "A Simple Moving Average (SMA) weights every period in its lookback equally. An Exponential Moving Average (EMA) weights recent periods more heavily, making it react faster to new price action. A common signal is a \"crossover\": when a faster (shorter-period) MA crosses above a slower (longer-period) MA, it's called a \"Golden Cross\" (bullish); crossing below is a \"Death Cross\" (bearish).",
            list: [
              "SMA: equal weight to every period in the lookback — smoother, slower to react.",
              "EMA: more weight on recent periods — faster to react, but can give more false signals in choppy markets.",
              "Golden Cross: shorter MA crosses above longer MA — often read as bullish.",
              "Death Cross: shorter MA crosses below longer MA — often read as bearish.",
            ],
          },
          {
            type: "proTip",
            body: "Moving averages are lagging indicators by nature — they're built from past prices, so crossovers confirm a trend change after it's already underway, not before. They work best for trend confirmation, not pinpoint entries.",
          },
          {
            type: "visual",
            diagram: { kind: "ma-crossover", crossType: "golden" },
            caption: "A \"Golden Cross\": the shorter-period moving average crosses above the longer-period one.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "What is the main purpose of a moving average?",
              options: [
                { id: "a", text: "To smooth price data into a single line, making the underlying trend easier to see" },
                { id: "b", text: "To predict exact future prices with certainty" },
                { id: "c", text: "To measure trading volume" },
                { id: "d", text: "To calculate the bid/ask spread" },
              ],
              correctOptionId: "a",
              explanation: "Moving averages exist to smooth out short-term noise, making the broader trend direction easier to read.",
            },
            {
              id: "q2",
              prompt: "What's the key difference between an SMA and an EMA?",
              options: [
                { id: "a", text: "SMA weights all periods equally; EMA weights recent periods more heavily and reacts faster" },
                { id: "b", text: "EMA ignores recent prices entirely" },
                { id: "c", text: "SMA can only be used on daily charts" },
                { id: "d", text: "There is no real difference" },
              ],
              correctOptionId: "a",
              explanation: "EMA's extra weighting on recent data makes it more responsive to new price action than the equally-weighted SMA.",
            },
            {
              id: "q3",
              prompt: "A shorter-period moving average crossing ABOVE a longer-period one is commonly called:",
              options: [
                { id: "a", text: "A Death Cross" },
                { id: "b", text: "A Golden Cross" },
                { id: "c", text: "A Fibonacci extension" },
                { id: "d", text: "A pivot breakout" },
              ],
              correctOptionId: "b",
              explanation: "A shorter MA crossing above a longer MA is the classic bullish \"Golden Cross\" signal.",
            },
            {
              id: "q4",
              prompt: "Why are moving averages described as \"lagging\" indicators?",
              options: [
                { id: "a", text: "They are built from past price data, so they confirm trend changes after they've already begun" },
                { id: "b", text: "They predict price moves before they happen" },
                { id: "c", text: "They update faster than real-time price" },
                { id: "d", text: "They only work on weekly charts" },
              ],
              correctOptionId: "a",
              explanation: "Since an MA is computed from historical prices, any crossover signal necessarily shows up after the underlying shift in price behavior has already started.",
            },
            {
              id: "q5",
              prompt: "A shorter-period MA crossing BELOW a longer-period MA is commonly called:",
              options: [
                { id: "a", text: "A Golden Cross" },
                { id: "b", text: "A Death Cross" },
                { id: "c", text: "A support breakout" },
                { id: "d", text: "An RSI divergence" },
              ],
              correctOptionId: "b",
              explanation: "The bearish counterpart to the Golden Cross — a shorter MA crossing below a longer MA — is called a Death Cross.",
            },
          ],
        },
      },
      {
        id: "fibonacci-retracements",
        title: "Fibonacci Retracements",
        categories: ["technicals"],
        estMinutes: 7,
        sections: [
          {
            type: "text",
            heading: "Ratios borrowed from a 13th-century sequence",
            body: "Fibonacci retracement levels are derived from ratios found in the Fibonacci number sequence (0, 1, 1, 2, 3, 5, 8, 13, 21...), where dividing certain numbers by others in the sequence produces recurring ratios like 0.618 and 0.382. Traders apply these ratios to a recent price swing (a clear high and low) to mark potential support/resistance zones during a pullback.",
          },
          {
            type: "text",
            heading: "Drawing it and the key levels",
            body: "To draw a Fibonacci retracement, you select a significant swing low and swing high (or vice versa for a downtrend), and the tool automatically marks horizontal lines at the standard ratio levels in between. These are watched as zones where a pulling-back trend might pause or reverse before potentially continuing in the original direction.",
            list: [
              "23.6% — a shallow retracement level",
              "38.2% — a common pullback level in strong trends",
              "50.0% — not technically a Fibonacci ratio, but universally included as a psychological midpoint",
              "61.8% — the \"golden ratio\" level, often watched as the deeper pullback zone",
              "78.6% — a deep retracement, close to a full round-trip of the swing",
            ],
          },
          {
            type: "proTip",
            body: "Fibonacci levels work best when they line up with another form of confirmation — like a round-number support/resistance zone or a prior swing point — rather than being traded in isolation.",
          },
          {
            type: "visual",
            diagram: { kind: "fibonacci" },
            caption: "Standard Fibonacci retracement levels drawn over a price swing from low to high.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "Fibonacci retracement ratios are derived from:",
              options: [
                { id: "a", text: "A random number generator" },
                { id: "b", text: "Ratios found within the Fibonacci number sequence" },
                { id: "c", text: "Government interest rate decisions" },
                { id: "d", text: "Trading volume data only" },
              ],
              correctOptionId: "b",
              explanation: "The retracement percentages (23.6%, 38.2%, 61.8%, etc.) come directly from ratios between numbers in the Fibonacci sequence.",
            },
            {
              id: "q2",
              prompt: "What two points do you need to select to draw a Fibonacci retracement?",
              options: [
                { id: "a", text: "A swing high and a swing low of a significant price move" },
                { id: "b", text: "The current bid and ask" },
                { id: "c", text: "Today's open and yesterday's close" },
                { id: "d", text: "Two random candles" },
              ],
              correctOptionId: "a",
              explanation: "A Fibonacci retracement is anchored to a clear swing low and swing high (or high-to-low for a downtrend), from which the tool plots the ratio levels.",
            },
            {
              id: "q3",
              prompt: "Which commonly-shown Fibonacci level is NOT actually derived from the Fibonacci sequence itself?",
              options: [
                { id: "a", text: "23.6%" },
                { id: "b", text: "38.2%" },
                { id: "c", text: "50.0%" },
                { id: "d", text: "61.8%" },
              ],
              correctOptionId: "c",
              explanation: "50% is included by convention as a psychologically significant midpoint, but it isn't itself a Fibonacci-derived ratio the way 23.6/38.2/61.8/78.6% are.",
            },
            {
              id: "q4",
              prompt: "What is the \"golden ratio\" retracement level, often watched as a deeper pullback zone?",
              options: [
                { id: "a", text: "23.6%" },
                { id: "b", text: "50.0%" },
                { id: "c", text: "61.8%" },
                { id: "d", text: "100%" },
              ],
              correctOptionId: "c",
              explanation: "61.8% is derived from the golden ratio and is one of the most closely watched Fibonacci retracement levels.",
            },
            {
              id: "q5",
              prompt: "What makes a Fibonacci level more reliable, according to this lesson?",
              options: [
                { id: "a", text: "Using it completely in isolation from any other analysis" },
                { id: "b", text: "When it lines up with another form of confirmation, like a round-number support/resistance zone" },
                { id: "c", text: "Only using the 100% level" },
                { id: "d", text: "Drawing it on a 1-minute chart only" },
              ],
              correctOptionId: "b",
              explanation: "Confluence — a Fibonacci level coinciding with another independent signal like a known support/resistance zone — is generally considered more meaningful than the Fibonacci level alone.",
            },
          ],
        },
      },
      {
        id: "gann-basics",
        title: "Gann Time & Price Basics",
        categories: ["technicals"],
        estMinutes: 6,
        sections: [
          {
            type: "text",
            heading: "W.D. Gann's core idea: time matters as much as price",
            body: "W.D. Gann was an early-20th-century trader whose techniques are built on the idea that markets move in geometric, time-based relationships — not just price-based ones. Where most indicators only analyze price, Gann theory treats the passage of TIME itself as a key variable that can signal potential turning points, independent of how far price has moved.",
          },
          {
            type: "text",
            heading: "Gann angles: the 1x1 line",
            body: "The best-known Gann tool is the Gann angle (or \"Gann fan\") — diagonal trendlines drawn from a significant price pivot at fixed geometric slopes. The most famous is the 1x1 angle (sometimes called the \"45-degree line\"), representing a balanced rate of one price unit per one time unit; steeper or shallower angles (2x1, 4x1, 1x2, 1x4, etc.) represent faster or slower rates of advance.",
            list: [
              "Gann angles: diagonal lines at fixed price/time ratios from a pivot point, used as dynamic support/resistance.",
              "Gann Square of Nine: a spiral numeric grid used to project potential price/time turning points.",
              "Time cycles: Gann placed heavy emphasis on anniversaries of past highs/lows and specific day counts repeating in the future.",
            ],
          },
          {
            type: "proTip",
            body: "Gann methods are genuinely complex and heavily debated — many traders find real value in the core idea (time matters, not just price), without adopting the full historical system literally. Treat this lesson as a conceptual introduction, not a complete trading method.",
          },
          {
            type: "visual",
            diagram: { kind: "grid" },
            caption: "A simplified Gann-style grid: diagonal angles fan out from a pivot at fixed price/time ratios.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "What's the central idea that distinguishes Gann theory from most other technical tools?",
              options: [
                { id: "a", text: "It only looks at trading volume" },
                { id: "b", text: "It treats the passage of TIME as a key variable, not just price movement" },
                { id: "c", text: "It ignores price entirely" },
                { id: "d", text: "It is based purely on news events" },
              ],
              correctOptionId: "b",
              explanation: "Gann's core premise is that time-based cycles and relationships matter as much as price movement — a departure from purely price-based analysis.",
            },
            {
              id: "q2",
              prompt: "What does the Gann 1x1 angle represent?",
              options: [
                { id: "a", text: "A vertical support line" },
                { id: "b", text: "A balanced rate of one price unit of movement per one time unit, drawn from a pivot" },
                { id: "c", text: "The exact closing price of the day" },
                { id: "d", text: "A fixed 90-degree horizontal line" },
              ],
              correctOptionId: "b",
              explanation: "The 1x1 (often called the 45-degree) angle represents a balanced price-to-time rate of advance from a significant pivot point.",
            },
            {
              id: "q3",
              prompt: "What is the Gann Square of Nine generally used for?",
              options: [
                { id: "a", text: "Calculating the bid/ask spread" },
                { id: "b", text: "Projecting potential future price/time turning points via a spiral numeric grid" },
                { id: "c", text: "Setting standard lot sizes" },
                { id: "d", text: "Determining central bank interest rates" },
              ],
              correctOptionId: "b",
              explanation: "The Square of Nine is a spiral grid of numbers used by Gann practitioners to project where price and time might align for a potential turning point.",
            },
            {
              id: "q4",
              prompt: "How does this lesson frame Gann theory's role for a learner?",
              options: [
                { id: "a", text: "As the single most reliable, universally-proven trading method" },
                { id: "b", text: "As a conceptual introduction to a genuinely complex, debated approach — not a complete method on its own" },
                { id: "c", text: "As completely discredited and never worth studying" },
                { id: "d", text: "As identical to a standard moving average crossover" },
              ],
              correctOptionId: "b",
              explanation: "The lesson is explicit that Gann methods are complex and debated, and this is meant as a conceptual starting point rather than a full, ready-to-use system.",
            },
            {
              id: "q5",
              prompt: "What did Gann place heavy emphasis on regarding time cycles?",
              options: [
                { id: "a", text: "Anniversaries of past highs/lows and specific repeating day counts" },
                { id: "b", text: "Only the current day's trading volume" },
                { id: "c", text: "Ignoring all historical price data" },
                { id: "d", text: "Fixed calendar quarters only" },
              ],
              correctOptionId: "a",
              explanation: "Gann's time-cycle work focused heavily on specific day counts and anniversaries of prior significant highs/lows repeating into the future.",
            },
          ],
        },
      },
    ],
  },

  // ===========================================================================
  // LEVEL 4 — STRATEGIST: Macro Fundamentals & Sentiment
  // ===========================================================================
  {
    id: "strategist",
    order: 4,
    title: "Strategist",
    subtitle: "Macro Fundamentals & Sentiment",
    description:
      "Zoom out from the chart: central bank policy, the economic calendar, and how the crowd's mood moves markets.",
    theme: "amber",
    lessons: [
      {
        id: "central-bank-rates",
        title: "Central Bank Interest Rates",
        categories: ["forex", "personal-finance"],
        estMinutes: 7,
        sections: [
          {
            type: "text",
            heading: "The single biggest lever in macro markets",
            body: "A central bank's benchmark interest rate (like the US Federal Reserve's federal funds rate) influences the cost of borrowing throughout an entire economy. Raising rates tends to cool spending/borrowing and strengthen the currency (higher yield attracts foreign capital); cutting rates tends to encourage borrowing/spending and can weaken the currency.",
          },
          {
            type: "text",
            heading: "Why traders obsess over rate decisions",
            body: "Interest rate differentials between two countries are one of the primary long-term drivers of currency pair direction — capital tends to flow toward the currency offering better risk-adjusted returns. This is why scheduled central bank meetings (like FOMC meetings for the US) are among the highest-volatility events on the economic calendar.",
            list: [
              "Rate hike: generally currency-positive (all else equal) — higher yield attracts capital inflows.",
              "Rate cut: generally currency-negative (all else equal) — lower yield, less incentive to hold that currency.",
              "Markets react to the DECISION relative to EXPECTATIONS, not the decision in isolation — a hike that was already fully expected can cause little movement, or even a reversal.",
              "Forward guidance (what a central bank signals about future moves) often matters more than the current decision itself.",
            ],
          },
          {
            type: "proTip",
            body: "\"Buy the rumor, sell the news\" is common around rate decisions: if a hike was heavily expected and priced in beforehand, the actual announcement can trigger a reversal rather than a continuation, because the real driver was the surprise (or lack of it) relative to what the market had already priced in.",
          },
          {
            type: "visual",
            diagram: {
              kind: "flow",
              steps: [
                { label: "Central bank raises rates" },
                { label: "Currency yield becomes more attractive" },
                { label: "Foreign capital flows in" },
                { label: "Currency tends to strengthen" },
              ],
            },
            caption: "The textbook chain of logic linking a rate hike to currency strength — all else being equal.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "All else equal, what does a central bank interest rate HIKE tend to do to that country's currency?",
              options: [
                { id: "a", text: "Weaken it, since borrowing becomes more expensive" },
                { id: "b", text: "Strengthen it, since higher yield tends to attract foreign capital" },
                { id: "c", text: "Have no effect whatsoever" },
                { id: "d", text: "Immediately cause hyperinflation" },
              ],
              correctOptionId: "b",
              explanation: "Higher rates generally make a currency more attractive to hold (better yield), which tends to draw in foreign capital and support the currency — all else equal.",
            },
            {
              id: "q2",
              prompt: "Why might a widely-expected rate hike cause LITTLE market reaction, or even a reversal?",
              options: [
                { id: "a", text: "Because markets react to the decision relative to what was already expected/priced in, not the decision alone" },
                { id: "b", text: "Because rate decisions never actually move markets" },
                { id: "c", text: "Because central banks always announce decisions on weekends" },
                { id: "d", text: "Because hikes are always currency-negative" },
              ],
              correctOptionId: "a",
              explanation: "If a hike was fully priced in beforehand, the 'surprise' element is gone — the actual move can trigger a 'sell the news' type reaction instead of a continuation.",
            },
            {
              id: "q3",
              prompt: "What does \"forward guidance\" refer to in a central bank context?",
              options: [
                { id: "a", text: "The exact GDP figure for last quarter" },
                { id: "b", text: "What a central bank signals about its likely FUTURE policy moves, not just the current decision" },
                { id: "c", text: "A type of limit order" },
                { id: "d", text: "A fixed interest rate schedule set 10 years in advance" },
              ],
              correctOptionId: "b",
              explanation: "Forward guidance is the central bank's communicated outlook on future policy — often more market-moving than the current rate decision itself.",
            },
            {
              id: "q4",
              prompt: "What does \"buy the rumor, sell the news\" describe?",
              options: [
                { id: "a", text: "A guaranteed way to profit from every rate decision" },
                { id: "b", text: "Price moving in anticipation of an expected event, then reversing once the event is confirmed as expected" },
                { id: "c", text: "A rule that only applies to cryptocurrency" },
                { id: "d", text: "Ignoring all economic news entirely" },
              ],
              correctOptionId: "b",
              explanation: "This describes positioning ahead of an anticipated outcome, then the reversal that can follow once that outcome is actually confirmed and 'priced in' fully.",
            },
            {
              id: "q5",
              prompt: "In the US, which scheduled meetings are the primary venue for federal funds rate decisions?",
              options: [
                { id: "a", text: "FOMC (Federal Open Market Committee) meetings" },
                { id: "b", text: "Quarterly earnings calls" },
                { id: "c", text: "The United Nations General Assembly" },
                { id: "d", text: "State of the Union addresses" },
              ],
              correctOptionId: "a",
              explanation: "FOMC meetings are specifically where the US Federal Reserve sets its benchmark federal funds rate — among the highest-volatility scheduled events for USD pairs.",
            },
          ],
        },
      },
      {
        id: "nfp-and-news-trading",
        title: "Non-Farm Payrolls & News Trading",
        categories: ["forex"],
        estMinutes: 7,
        sections: [
          {
            type: "text",
            heading: "Why one jobs report moves every USD pair",
            body: "The US Non-Farm Payrolls (NFP) report, released monthly, measures the change in the number of employed people in the US (excluding farm workers, government employees, and a few other categories). It's one of the most closely watched economic releases because employment data feeds directly into the Federal Reserve's policy decisions — strong jobs growth can support a case for tighter policy, weak growth the opposite.",
          },
          {
            type: "text",
            heading: "What makes news trading uniquely risky",
            body: "In the seconds/minutes around a high-impact release, spreads can widen dramatically, price can spike violently in both directions before settling, and slippage on stop-losses can be far worse than normal. This is a fundamentally different risk environment from regular trading hours.",
            list: [
              "Actual vs. Forecast vs. Previous: markets react most to how the ACTUAL figure compares to the FORECAST (consensus expectation), not the raw number alone.",
              "A big \"beat\" (actual well above forecast) is typically currency-positive; a big \"miss\" is typically currency-negative — but initial moves can reverse quickly.",
              "Volatility often spikes for a short window then can reverse or extend unpredictably — this is not a time for casual position sizing.",
            ],
          },
          {
            type: "proTip",
            body: "Many experienced traders deliberately avoid opening NEW positions in the minutes immediately around high-impact news, specifically because of the spread-widening and slippage risk — not because the move isn't real, but because the risk-to-reward of trading the initial spike is often poor.",
          },
          {
            type: "visual",
            diagram: { kind: "flow", steps: [
              { label: "NFP release" },
              { label: "Actual vs. Forecast compared" },
              { label: "Spread widens, volatility spikes" },
              { label: "Initial move — may reverse or extend" },
            ] },
            caption: "The typical sequence of a high-impact news release and why the first few minutes are uniquely risky to trade.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "What does the US Non-Farm Payrolls (NFP) report measure?",
              options: [
                { id: "a", text: "The change in the number of employed people in the US, excluding farm workers and a few other categories" },
                { id: "b", text: "The S&P 500's closing price" },
                { id: "c", text: "The US government's total debt" },
                { id: "d", text: "Gold production in the US" },
              ],
              correctOptionId: "a",
              explanation: "NFP specifically tracks the monthly change in US employment, excluding farm workers (and government/nonprofit/private household employees), feeding directly into Fed policy considerations.",
            },
            {
              id: "q2",
              prompt: "Markets typically react most strongly to:",
              options: [
                { id: "a", text: "The raw number alone, regardless of expectations" },
                { id: "b", text: "How the ACTUAL figure compares to the FORECAST (consensus expectation)" },
                { id: "c", text: "The report from exactly one year ago" },
                { id: "d", text: "Only the previous month's revised figure" },
              ],
              correctOptionId: "b",
              explanation: "The surprise relative to consensus forecast — not the absolute number by itself — is usually what drives the sharpest immediate reaction.",
            },
            {
              id: "q3",
              prompt: "What typically happens to spreads during a high-impact news release like NFP?",
              options: [
                { id: "a", text: "They narrow significantly" },
                { id: "b", text: "They often widen dramatically due to reduced liquidity and increased uncertainty" },
                { id: "c", text: "They are legally fixed and cannot change" },
                { id: "d", text: "Spreads are unrelated to news events" },
              ],
              correctOptionId: "b",
              explanation: "High-impact releases typically see spreads widen sharply as liquidity providers price in extra uncertainty and volatility.",
            },
            {
              id: "q4",
              prompt: "Why do many experienced traders avoid opening new positions in the minutes right around a major news release?",
              options: [
                { id: "a", text: "Because the news never actually matters" },
                { id: "b", text: "Because widened spreads and slippage risk often make the risk-to-reward of trading the initial spike poor" },
                { id: "c", text: "Because it's illegal to trade during news events" },
                { id: "d", text: "Because prices never move during news releases" },
              ],
              correctOptionId: "b",
              explanation: "It's a risk-management decision, not a belief that news doesn't matter — the initial volatility spike often carries poor risk-to-reward due to widened spreads and slippage.",
            },
            {
              id: "q5",
              prompt: "A big NFP \"beat\" (actual well above forecast) is typically, all else equal:",
              options: [
                { id: "a", text: "Currency-negative for the USD" },
                { id: "b", text: "Currency-positive for the USD, though the initial move can still reverse" },
                { id: "c", text: "Completely irrelevant to currency markets" },
                { id: "d", text: "Only relevant to the stock market, never forex" },
              ],
              correctOptionId: "b",
              explanation: "A strong beat is generally read as USD-positive (stronger economy, potentially firmer Fed policy), though the lesson notes initial reactions to high-impact news can still reverse.",
            },
          ],
        },
      },
      {
        id: "market-sentiment",
        title: "Market Sentiment Interpretation",
        categories: ["forex", "crypto", "technicals"],
        estMinutes: 6,
        sections: [
          {
            type: "text",
            heading: "What \"sentiment\" actually means",
            body: "Market sentiment is the overall attitude of traders/investors toward a particular asset or market — broadly bullish (optimistic, expecting prices to rise) or bearish (pessimistic, expecting prices to fall). Unlike a hard price or indicator reading, sentiment is inherently about the crowd's collective mood, which is why it's measured through proxies rather than a single definitive number.",
          },
          {
            type: "text",
            heading: "Reading sentiment without fabricating certainty",
            body: "Common sentiment proxies include news headline tone (is coverage framed positively or negatively), social media chatter, and positioning data (how many traders are net long vs. net short). These are genuinely useful as a crowd-psychology gauge, but none of them predicts price with certainty — sentiment is one input among several, not a standalone trading system.",
            list: [
              "Extreme one-sided sentiment (nearly everyone bullish, or nearly everyone bearish) is sometimes read as a contrarian warning sign — when almost everyone has already positioned one way, there may be few buyers/sellers left to push further.",
              "Sentiment can stay one-sided and still be correct for a long time — contrarian signals are a caution flag, not a timing tool.",
              "Combining sentiment with price action and fundamentals tends to be more robust than relying on sentiment alone.",
            ],
          },
          {
            type: "proTip",
            body: "Be skeptical of any sentiment number presented with false precision (\"73.2% bullish\"). Unless you know exactly what's being measured and how (headline keyword counts? survey respondents? futures positioning?), treat it as a rough directional gauge, not a scientific reading.",
          },
          {
            type: "visual",
            diagram: { kind: "gauge", value: 68, min: -100, max: 100, label: "Example Sentiment Reading" },
            caption: "A sentiment gauge is a rough crowd-mood proxy — useful context, never a standalone trading signal.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "What does \"market sentiment\" refer to?",
              options: [
                { id: "a", text: "The exact current bid/ask spread" },
                { id: "b", text: "The overall attitude (bullish or bearish) of traders/investors toward an asset" },
                { id: "c", text: "A government regulation on trading" },
                { id: "d", text: "The current interest rate" },
              ],
              correctOptionId: "b",
              explanation: "Sentiment is specifically about the crowd's collective mood/attitude — optimistic (bullish) or pessimistic (bearish) — not a hard price or rate figure.",
            },
            {
              id: "q2",
              prompt: "Which of these is a commonly used sentiment proxy?",
              options: [
                { id: "a", text: "Positioning data — how many traders are net long vs. net short" },
                { id: "b", text: "The exact historical GDP figure from 10 years ago" },
                { id: "c", text: "A fixed government-published sentiment score" },
                { id: "d", text: "The color of the trading platform's theme" },
              ],
              correctOptionId: "a",
              explanation: "Net long/short positioning data is a widely used sentiment proxy, alongside things like news tone and social media chatter.",
            },
            {
              id: "q3",
              prompt: "Why do some traders view EXTREME one-sided sentiment as a contrarian warning sign?",
              options: [
                { id: "a", text: "Because it guarantees an immediate reversal" },
                { id: "b", text: "Because when almost everyone has already positioned one way, there may be few buyers/sellers left to push further in that direction" },
                { id: "c", text: "Because sentiment data is always wrong" },
                { id: "d", text: "Because extreme sentiment is illegal to measure" },
              ],
              correctOptionId: "b",
              explanation: "The contrarian logic is about exhaustion of one-sided positioning, not a guarantee — the lesson is explicit that one-sided sentiment can persist and still be correct for a long time.",
            },
            {
              id: "q4",
              prompt: "What's the recommended way to use sentiment data, according to this lesson?",
              options: [
                { id: "a", text: "As a standalone trading system on its own" },
                { id: "b", text: "Combined with price action and fundamentals, as one input among several" },
                { id: "c", text: "Never — sentiment has no value at all" },
                { id: "d", text: "Only on cryptocurrency markets" },
              ],
              correctOptionId: "b",
              explanation: "The lesson frames sentiment as genuinely useful context that's more robust when combined with other analysis, not a standalone signal.",
            },
            {
              id: "q5",
              prompt: "Why should a trader be skeptical of a sentiment reading presented with false precision (like \"73.2% bullish\")?",
              options: [
                { id: "a", text: "Because such precision is always fabricated and meaningless" },
                { id: "b", text: "Because without knowing exactly what's being measured and how, that precision can overstate how scientific the reading really is" },
                { id: "c", text: "Because sentiment can only ever be measured in whole numbers" },
                { id: "d", text: "Because decimal points are not allowed in finance" },
              ],
              correctOptionId: "b",
              explanation: "The caution is about understanding the methodology behind a number before trusting its apparent precision — not that all such numbers are fake, but that they shouldn't be taken as more rigorous than they are.",
            },
          ],
        },
      },
    ],
  },

  // ===========================================================================
  // LEVEL 5 — PRO TRADER: Risk Management & Psychology
  // ===========================================================================
  {
    id: "pro-trader",
    order: 5,
    title: "Pro Trader",
    subtitle: "Risk Management & Psychology",
    description:
      "The level that actually separates long-term survivors from blown accounts: position sizing, risk-to-reward discipline, journaling, and emotional control.",
    theme: "rose",
    lessons: [
      {
        id: "position-sizing-math",
        title: "Position Sizing Math",
        categories: ["forex", "personal-finance"],
        estMinutes: 8,
        sections: [
          {
            type: "text",
            heading: "The one calculation every trade needs",
            body: "Position sizing answers one question before every trade: given how much you're willing to lose if you're wrong, how large a position can you actually take? Getting this right is arguably more important than being right about market direction — it's what keeps a string of losing trades from ever becoming account-ending.",
          },
          {
            type: "text",
            heading: "The three inputs",
            body: "Position size depends on exactly three things: your account balance, the percentage of it you're willing to risk on this one trade (commonly 1-2% for disciplined traders), and the distance (in pips or price units) between your entry and your stop-loss.",
            list: [
              "Risk Amount = Account Balance × Risk % — the actual dollar amount you're willing to lose on this trade.",
              "Stop-Loss Distance = how far (in pips) your stop is from your entry.",
              "Position Size = Risk Amount ÷ (Stop-Loss Distance × Value per pip per unit) — solved backward from how much you're willing to lose.",
            ],
          },
          {
            type: "formula",
            label: "Position Sizing Formula",
            formula: "Lot Size ≈ (Account Balance × Risk %) ÷ (Stop-Loss in Pips × Pip Value per Lot)",
            note: "A $10,000 account risking 1% ($100) with a 20-pip stop on a pair where a standard lot = $10/pip needs: $100 ÷ (20 × $10) = 0.5 standard lots.",
          },
          {
            type: "proTip",
            body: "Notice the formula never asks \"how confident are you in this trade?\" Position sizing is deliberately confidence-independent — it's about surviving being wrong, not about sizing up because a setup \"feels\" great.",
          },
          {
            type: "risk",
            body: "High leverage lets you open a position far larger than your account balance could normally support — which means a small, ordinary price move against you can wipe out a much larger share of your account than it would unleveraged. Leverage doesn't change your edge in the market; it only changes how fast a mistake becomes expensive.",
          },
          {
            type: "tool",
            toolId: "lot-size-calculator",
            caption: "Try it: plug in your own account balance, risk %, and stop-loss distance.",
          },
          {
            type: "tool",
            toolId: "margin-calculator",
            caption: "Try it: see how much margin a position actually requires at a given leverage, and how much free margin is left.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "What three inputs does a position-sizing calculation need?",
              options: [
                { id: "a", text: "Account balance, risk %, and stop-loss distance" },
                { id: "b", text: "Current RSI, moving average, and Fibonacci level" },
                { id: "c", text: "Broker name, leverage ratio, and news sentiment" },
                { id: "d", text: "Candlestick color, wick length, and body size" },
              ],
              correctOptionId: "a",
              explanation: "Position sizing is purely a function of account balance, the % you're risking, and how far your stop-loss sits from entry — nothing about market analysis itself.",
            },
            {
              id: "q2",
              prompt: "A $10,000 account risks 1% per trade. What's the dollar Risk Amount for one trade?",
              options: [
                { id: "a", text: "$10" },
                { id: "b", text: "$100" },
                { id: "c", text: "$1,000" },
                { id: "d", text: "$10,000" },
              ],
              correctOptionId: "b",
              explanation: "Risk Amount = Account Balance × Risk % = $10,000 × 1% = $100.",
            },
            {
              id: "q3",
              prompt: "Using that same $100 risk amount with a 20-pip stop, on a pair where a standard lot is worth $10/pip, what lot size keeps the risk at exactly $100?",
              options: [
                { id: "a", text: "0.05 lots" },
                { id: "b", text: "0.5 lots" },
                { id: "c", text: "5 lots" },
                { id: "d", text: "50 lots" },
              ],
              correctOptionId: "b",
              explanation: "Lot Size ≈ Risk Amount ÷ (Stop Pips × Pip Value per Lot) = $100 ÷ (20 × $10) = 0.5 standard lots.",
            },
            {
              id: "q4",
              prompt: "Why does the lesson say position sizing is deliberately \"confidence-independent\"?",
              options: [
                { id: "a", text: "Because it should scale up whenever a trade feels like a sure thing" },
                { id: "b", text: "Because the formula is about surviving being wrong, regardless of how confident you feel going in" },
                { id: "c", text: "Because confidence is the only input that matters" },
                { id: "d", text: "Because position sizing doesn't actually affect outcomes" },
              ],
              correctOptionId: "b",
              explanation: "The whole point of disciplined position sizing is that it caps your loss if you're wrong — it isn't meant to flex based on a gut feeling about how likely the trade is to work.",
            },
            {
              id: "q5",
              prompt: "What commonly-cited risk-per-trade range do many disciplined traders use?",
              options: [
                { id: "a", text: "1-2% of account balance per trade" },
                { id: "b", text: "25-50% of account balance per trade" },
                { id: "c", text: "100% of account balance per trade" },
                { id: "d", text: "There is no commonly cited range" },
              ],
              correctOptionId: "a",
              explanation: "1-2% per trade is a widely cited risk-management guideline, keeping any single loss small relative to the overall account.",
            },
          ],
        },
      },
      {
        id: "risk-to-reward-ratio",
        title: "Risk-to-Reward Ratio",
        categories: ["forex", "personal-finance"],
        estMinutes: 6,
        sections: [
          {
            type: "text",
            heading: "You don't need to be right most of the time",
            body: "Risk-to-Reward (R:R) ratio compares how much you stand to lose if a trade goes wrong (risk, i.e. distance to stop-loss) against how much you stand to gain if it goes right (reward, i.e. distance to take-profit). A 1:2 ratio means risking 1 unit to potentially gain 2; 1:3 means risking 1 to potentially gain 3.",
          },
          {
            type: "text",
            heading: "Why this changes the win-rate math",
            body: "With a consistent 1:2 R:R, you can be profitable overall even winning only 40% of trades, because each win recovers more than two losses' worth. This is the single most important reason professional traders obsess over R:R before ever placing a trade — it decouples long-term profitability from needing to be right most of the time.",
            list: [
              "At 1:1 R:R, you need > 50% win rate just to be profitable (ignoring costs).",
              "At 1:2 R:R, roughly 34%+ win rate can be profitable.",
              "At 1:3 R:R, roughly 25%+ win rate can be profitable.",
              "These are simplified break-even thresholds ignoring spread/commission — real costs raise the bar slightly.",
            ],
          },
          {
            type: "formula",
            label: "Risk-to-Reward Ratio",
            formula: "R:R = Potential Reward ÷ Potential Risk",
            note: "Entry at 1.1000, stop-loss at 1.0950 (50-pip risk), take-profit at 1.1100 (100-pip reward) → R:R = 100 ÷ 50 = 1:2.",
          },
          {
            type: "proTip",
            body: "A trade with a poor R:R (like 1:0.5 — risking more than you stand to gain) needs an unrealistically high win rate just to break even. Before asking \"will this trade win?\", ask \"is this trade's R:R even worth taking if I'm wrong half the time?\"",
          },
          {
            type: "risk",
            body: "A great R:R on paper doesn't protect you if you move your stop-loss further away mid-trade to \"give it more room\" once it's losing. That single habit — widening a stop after entry — quietly turns a planned 1:2 trade into an unplanned, unbounded one, and is one of the fastest ways disciplined position sizing stops meaning anything.",
          },
          {
            type: "visual",
            diagram: { kind: "risk-reward", riskUnits: 1, rewardUnits: 2 },
            caption: "A 1:2 risk-to-reward setup: the potential gain (green) is twice the size of the potential loss (red).",
          },
          {
            type: "tool",
            toolId: "risk-reward-calculator",
            caption: "Try it: enter your own entry, stop-loss, and take-profit to see the dollar risk, dollar reward, and R:R ratio.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "A trade risks 40 pips to potentially gain 120 pips. What is the Risk-to-Reward ratio?",
              options: [
                { id: "a", text: "1:2" },
                { id: "b", text: "1:3" },
                { id: "c", text: "3:1" },
                { id: "d", text: "1:1" },
              ],
              correctOptionId: "b",
              explanation: "R:R = Reward ÷ Risk = 120 ÷ 40 = 3, so this is a 1:3 ratio — risking 1 unit for a potential 3.",
            },
            {
              id: "q2",
              prompt: "At a consistent 1:2 risk-to-reward ratio, roughly what win rate is needed to be profitable overall (ignoring costs)?",
              options: [
                { id: "a", text: "Above 50%" },
                { id: "b", text: "Roughly 34% or higher" },
                { id: "c", text: "Exactly 100%" },
                { id: "d", text: "Win rate is irrelevant to profitability" },
              ],
              correctOptionId: "b",
              explanation: "With each win worth 2x each loss, you can be net profitable winning only about a third of trades — a core reason R:R discipline matters so much.",
            },
            {
              id: "q3",
              prompt: "What does a 1:1 risk-to-reward ratio require, ignoring trading costs, to be profitable over time?",
              options: [
                { id: "a", text: "A win rate above 50%" },
                { id: "b", text: "A win rate above 90%" },
                { id: "c", text: "Any win rate works equally well" },
                { id: "d", text: "A win rate of exactly 0%" },
              ],
              correctOptionId: "a",
              explanation: "At 1:1, wins and losses are the same size, so you need to win more than half your trades (accounting for costs pushes this even higher) just to come out ahead.",
            },
            {
              id: "q4",
              prompt: "Why do professional traders emphasize R:R before placing a trade, according to this lesson?",
              options: [
                { id: "a", text: "Because it guarantees every individual trade will win" },
                { id: "b", text: "Because a favorable R:R decouples long-term profitability from needing to be right most of the time" },
                { id: "c", text: "Because R:R has nothing to do with profitability" },
                { id: "d", text: "Because it eliminates the need for stop-losses" },
              ],
              correctOptionId: "b",
              explanation: "A good R:R means you don't need a high win rate to be profitable overall — that's precisely why it's treated as foundational risk management.",
            },
            {
              id: "q5",
              prompt: "A trade has a 1:0.5 risk-to-reward ratio (risking more than the potential gain). What does this mean for the required win rate to break even?",
              options: [
                { id: "a", text: "It needs a win rate well above 50% just to break even" },
                { id: "b", text: "It needs almost no winning trades at all" },
                { id: "c", text: "Win rate doesn't matter at this ratio" },
                { id: "d", text: "This ratio always guarantees a loss regardless of win rate" },
              ],
              correctOptionId: "a",
              explanation: "When the potential loss is larger than the potential gain, you need to win a disproportionately high share of trades just to avoid a net loss over time.",
            },
          ],
        },
      },
      {
        id: "trading-journal",
        title: "Keeping a Trading Journal",
        categories: ["forex", "personal-finance"],
        estMinutes: 5,
        sections: [
          {
            type: "text",
            heading: "You can't improve what you don't record",
            body: "A trading journal is a structured log of every trade you take — not just the outcome, but the reasoning behind it. Without one, traders tend to remember their best trades vividly and conveniently forget or rationalize their worst ones, which makes honest self-assessment almost impossible.",
          },
          {
            type: "text",
            heading: "What actually belongs in a useful journal entry",
            body: "A journal entry worth keeping captures more than just \"won\" or \"lost\" — it captures the decision-making context, so patterns (good and bad) become visible over dozens of entries instead of staying invisible in memory.",
            list: [
              "The setup/reason for entering (what signal or analysis triggered the trade)",
              "Entry price, stop-loss, take-profit, and position size",
              "The actual outcome and R:R achieved",
              "Your emotional state at entry and exit (calm? anxious? chasing a loss?)",
              "A short honest note: what would you do differently, if anything?",
            ],
          },
          {
            type: "proTip",
            body: "Journal your trades even — especially — the boring, process-correct losses where you followed your plan exactly and still lost. Those are proof your process can be sound even when a specific trade isn't profitable, which is a different (and healthier) lesson than \"I was wrong.\"",
          },
          {
            type: "visual",
            diagram: { kind: "flow", steps: [
              { label: "Take the trade" },
              { label: "Log setup, levels, emotion" },
              { label: "Record the outcome" },
              { label: "Review patterns over time" },
              { label: "Refine your process" },
            ] },
            caption: "A trading journal turns scattered individual trades into a visible, improvable pattern.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "Why is a trading journal important, beyond simply tracking wins and losses?",
              options: [
                { id: "a", text: "It's a legal requirement in every country" },
                { id: "b", text: "It records the decision-making context, making patterns visible that memory alone would miss or rationalize away" },
                { id: "c", text: "It automatically increases your win rate" },
                { id: "d", text: "It replaces the need for a stop-loss" },
              ],
              correctOptionId: "b",
              explanation: "The core value is honest, structured self-assessment — memory alone tends to overweight big wins and rationalize losses, which a journal corrects.",
            },
            {
              id: "q2",
              prompt: "Which of these belongs in a well-structured journal entry, according to this lesson?",
              options: [
                { id: "a", text: "Only whether the trade won or lost" },
                { id: "b", text: "The setup/reasoning, entry/stop/target levels, outcome, and your emotional state" },
                { id: "c", text: "Only the broker's name" },
                { id: "d", text: "Nothing — journaling is optional busywork" },
              ],
              correctOptionId: "b",
              explanation: "A useful entry captures the full decision context — not just the binary outcome — including the emotional state at entry/exit.",
            },
            {
              id: "q3",
              prompt: "Why should you journal a trade where you followed your plan exactly and still lost?",
              options: [
                { id: "a", text: "You shouldn't — only winning trades are worth recording" },
                { id: "b", text: "Because it's evidence your process can be sound even when an individual trade isn't profitable — a different lesson than \"I was wrong\"" },
                { id: "c", text: "Because losses must always be deleted from the record" },
                { id: "d", text: "Because it guarantees the next trade will win" },
              ],
              correctOptionId: "b",
              explanation: "A process-correct loss is valuable data: it shows the plan can still lose sometimes even when executed well, which is a healthier distinction than treating every loss as a personal mistake.",
            },
            {
              id: "q4",
              prompt: "What tends to happen to a trader's memory of their own trading history without a journal?",
              options: [
                { id: "a", text: "It stays perfectly accurate and unbiased" },
                { id: "b", text: "It tends to remember big wins vividly while forgetting or rationalizing losses" },
                { id: "c", text: "It becomes more detailed over time automatically" },
                { id: "d", text: "There is no difference with or without a journal" },
              ],
              correctOptionId: "b",
              explanation: "This selective memory bias is exactly why an external, structured record matters — it's a check against self-serving recall.",
            },
            {
              id: "q5",
              prompt: "What is the ultimate goal of reviewing a trading journal over time?",
              options: [
                { id: "a", text: "To win every single future trade" },
                { id: "b", text: "To spot recurring patterns (good and bad) across many trades and refine your process" },
                { id: "c", text: "To calculate your broker's commission" },
                { id: "d", text: "To predict exact future prices" },
              ],
              correctOptionId: "b",
              explanation: "The journal's value compounds over many entries — surfacing patterns in your own behavior and decision-making that a single trade's outcome could never reveal.",
            },
          ],
        },
      },
      {
        id: "fomo-and-greed",
        title: "Controlling FOMO & Greed",
        categories: ["forex", "crypto", "personal-finance"],
        estMinutes: 6,
        sections: [
          {
            type: "text",
            heading: "The two emotions that wreck otherwise-sound plans",
            body: "FOMO (Fear Of Missing Out) is the anxious urge to jump into a move that's already underway, usually without your normal setup criteria being met, because \"it's moving without me.\" Greed is the urge to hold a winning position past your planned target, oversize a position because a trade \"feels\" unstoppable, or re-enter immediately after a big win chasing more.",
          },
          {
            type: "text",
            heading: "Why these specifically target your process",
            body: "Both emotions share a common mechanism: they convince you to abandon a rule you set in advance (calmly, with a clear head) in favor of an in-the-moment impulse (under emotional pressure). The rule existed precisely because your calm, planning-self knew your in-the-moment self couldn't be trusted to make that call well.",
            list: [
              "FOMO entry: jumping in late, chasing a move with no stop-loss plan or oversized position, because the setup already looks \"obviously\" right.",
              "Greed-driven target abandonment: moving your take-profit further away mid-trade because the move \"could keep going,\" turning a planned win into an unplanned gamble.",
              "Revenge trading: immediately re-entering after a loss to \"win it back,\" usually with impaired judgment and often oversized.",
              "The common fix for all three: pre-commit to entry/exit rules BEFORE the emotional moment, and treat deviating from them as a process failure regardless of whether that specific deviation happened to work out.",
            ],
          },
          {
            type: "proTip",
            body: "A trade that breaks your rules but happens to win is more dangerous long-term than one that follows your rules and loses — the winning rule-break teaches you the wrong lesson (\"it worked, so it's fine\") and makes the next rule-break easier.",
          },
          {
            type: "visual",
            diagram: { kind: "flow", steps: [
              { label: "Price moves without you" },
              { label: "FOMO/greed impulse" },
              { label: "Rule abandoned mid-decision" },
              { label: "Outcome is now a gamble, not a plan" },
            ] },
            caption: "The emotional hijack sequence that pre-committed rules exist specifically to interrupt.",
          },
          {
            type: "risk",
            body: "Revenge trading is the most dangerous of the three because it compounds: a loss triggers an oversized, impulsive re-entry, which is statistically more likely to lose too, which triggers an even stronger urge to \"win it back.\" Each cycle raises both the position size and the emotional stakes — this is how a single manageable loss turns into an account-ending one.",
          },
        ],
        quiz: {
          passPercent: PASS_PERCENT,
          questions: [
            {
              id: "q1",
              prompt: "What does FOMO (Fear Of Missing Out) typically drive a trader to do?",
              options: [
                { id: "a", text: "Wait patiently for their normal setup criteria to be met" },
                { id: "b", text: "Jump into a move already underway, often without their normal setup criteria being met" },
                { id: "c", text: "Reduce position size automatically" },
                { id: "d", text: "Close all open positions immediately" },
              ],
              correctOptionId: "b",
              explanation: "FOMO is specifically the anxious urge to chase a move that's already happening, usually bypassing the trader's own normal entry rules.",
            },
            {
              id: "q2",
              prompt: "What is \"revenge trading\"?",
              options: [
                { id: "a", text: "Calmly reviewing a loss in your trading journal" },
                { id: "b", text: "Immediately re-entering the market after a loss to try to \"win it back,\" usually with impaired judgment" },
                { id: "c", text: "A type of limit order" },
                { id: "d", text: "Reducing risk after a losing streak" },
              ],
              correctOptionId: "b",
              explanation: "Revenge trading is the impulsive attempt to immediately recover a loss, typically compounding the original mistake with poor decision-making under emotional pressure.",
            },
            {
              id: "q3",
              prompt: "What common mechanism do FOMO and greed share, according to this lesson?",
              options: [
                { id: "a", text: "Both involve abandoning a rule set calmly in advance, in favor of an in-the-moment emotional impulse" },
                { id: "b", text: "Both only affect beginner traders, never experienced ones" },
                { id: "c", text: "Both are required for consistent profitability" },
                { id: "d", text: "Neither has any real effect on trading outcomes" },
              ],
              correctOptionId: "a",
              explanation: "The core pattern is the same: a pre-committed, clear-headed rule gets overridden by an emotional impulse in the moment — that's exactly what pre-commitment is meant to guard against.",
            },
            {
              id: "q4",
              prompt: "Why is a rule-breaking trade that happens to WIN considered dangerous in the long run?",
              options: [
                { id: "a", text: "It isn't dangerous — any winning trade is good" },
                { id: "b", text: "It reinforces the wrong lesson (\"breaking the rule worked\"), making the next rule-break easier" },
                { id: "c", text: "Winning trades always have to be reported to a regulator" },
                { id: "d", text: "It guarantees the next trade will also break the rules" },
              ],
              correctOptionId: "b",
              explanation: "A winning rule-break teaches a trader that the rule didn't matter that time, which erodes discipline for future trades even though the outcome was good purely by chance.",
            },
            {
              id: "q5",
              prompt: "What is the recommended general fix for FOMO, greed, and revenge trading alike?",
              options: [
                { id: "a", text: "Pre-commit to entry/exit rules before the emotional moment, and treat deviating from them as a process failure regardless of outcome" },
                { id: "b", text: "Trade exclusively on emotional instinct, since rules limit profit potential" },
                { id: "c", text: "Only trade when feeling extremely confident" },
                { id: "d", text: "Increase position size after every loss to recover faster" },
              ],
              correctOptionId: "a",
              explanation: "The lesson's core fix is pre-commitment: deciding the rules in a calm state, before the emotional pressure of a live trade, and holding to them regardless of whether a specific deviation would have worked out.",
            },
          ],
        },
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper functions — pure, no browser APIs, safe for server or client use.
// ---------------------------------------------------------------------------

export function getLevel(levelId) {
  return ACADEMY_LEVELS.find((l) => l.id === levelId) || null;
}

export function getLesson(levelId, lessonId) {
  const level = getLevel(levelId);
  if (!level) return null;
  const lesson = level.lessons.find((l) => l.id === lessonId) || null;
  return lesson ? { level, lesson } : null;
}

/** Flat, ordered list of every lesson across every level, each tagged
 * with its parent level — used for prev/next navigation and for the
 * hub's search/filter. */
export function getAllLessonsFlat() {
  const flat = [];
  for (const level of ACADEMY_LEVELS) {
    for (const lesson of level.lessons) {
      flat.push({ level, lesson });
    }
  }
  return flat;
}

/** The lesson immediately before/after a given one, across level
 * boundaries (e.g. the last lesson of Level 1 -> first lesson of Level 2). */
export function getAdjacentLessons(levelId, lessonId) {
  const flat = getAllLessonsFlat();
  const index = flat.findIndex((e) => e.level.id === levelId && e.lesson.id === lessonId);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? flat[index - 1] : null,
    next: index < flat.length - 1 ? flat[index + 1] : null,
  };
}

/** Lesson/quiz counts and total estimated reading time for one level. */
export function getLevelStats(level) {
  const lessonCount = level.lessons.length;
  const quizCount = level.lessons.filter((l) => l.quiz).length;
  const totalMinutes = level.lessons.reduce((sum, l) => sum + (l.estMinutes || 0), 0);
  return { lessonCount, quizCount, totalMinutes };
}

export function getAllCategoriesInLevel(level) {
  const set = new Set();
  for (const lesson of level.lessons) {
    for (const c of lesson.categories || []) set.add(c);
  }
  return [...set];
}
