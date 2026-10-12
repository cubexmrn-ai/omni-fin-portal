// lib/currencies.js
//
// Master fiat currency reference list, parallel to lib/crypto.js
// (crypto) and lib/metals.js (precious metals). Consumed by:
//   - lib/marketData.js's fetchFiatRates(), which iterates
//     CURRENCY_CODES generically against the live ExchangeRate-API /
//     open.er-api.com payload — so this list, not marketData.js, is
//     what actually controls how many currencies the site supports.
//   - lib/assetConversion.js's buildUnifiedAssetList(), which feeds
//     the searchable From/To picker in components/CurrencyConverter.jsx.
//   - components/GoldCalculator.jsx's "Local Currency" dropdown.
//   - components/Header.jsx's global Base Currency switcher.
//   - app/page.jsx's homepage "Supported Currencies" section.
//
// Expanded to 140+ ISO 4217 fiat currencies covering every populated
// region, so no dropdown in the app is artificially limited to a
// short hand-picked list. `fallbackRate` is an approximate,
// occasionally-stale USD-base rate used ONLY when every live rate
// provider is unreachable (see lib/marketData.js's static-fallback
// path) — it exists purely so a converter never shows a blank result,
// not as a source of truth, since real conversions always prefer the
// live ExchangeRate-API/open.er-api.com payload first.
export const CURRENCIES = [
  // --- Majors ---------------------------------------------------------
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", fallbackRate: 1 },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", fallbackRate: 0.92 },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", fallbackRate: 0.79 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", fallbackRate: 149.5 },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭", fallbackRate: 0.88 },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦", fallbackRate: 1.36 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", fallbackRate: 1.52 },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿", fallbackRate: 1.66 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", fallbackRate: 7.24 },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰", fallbackRate: 7.82 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", fallbackRate: 1.34 },

  // --- South & Southeast Asia ------------------------------------------
  { code: "PKR", name: "Pakistani Rupee", symbol: "Rs", flag: "🇵🇰", fallbackRate: 278.5 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", fallbackRate: 83.9 },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", flag: "🇧🇩", fallbackRate: 119.5 },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", flag: "🇱🇰", fallbackRate: 304 },
  { code: "NPR", name: "Nepalese Rupee", symbol: "Rs", flag: "🇳🇵", fallbackRate: 134 },
  { code: "BTN", name: "Bhutanese Ngultrum", symbol: "Nu.", flag: "🇧🇹", fallbackRate: 83.9 },
  { code: "MVR", name: "Maldivian Rufiyaa", symbol: "Rf", flag: "🇲🇻", fallbackRate: 15.4 },
  { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭", fallbackRate: 34.8 },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩", fallbackRate: 15750 },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭", fallbackRate: 56.8 },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", flag: "🇻🇳", fallbackRate: 25400 },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾", fallbackRate: 4.47 },
  { code: "MMK", name: "Myanmar Kyat", symbol: "K", flag: "🇲🇲", fallbackRate: 2100 },
  { code: "KHR", name: "Cambodian Riel", symbol: "៛", flag: "🇰🇭", fallbackRate: 4100 },
  { code: "LAK", name: "Lao Kip", symbol: "₭", flag: "🇱🇦", fallbackRate: 21700 },
  { code: "BND", name: "Brunei Dollar", symbol: "B$", flag: "🇧🇳", fallbackRate: 1.34 },

  // --- East Asia / Pacific ---------------------------------------------
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷", fallbackRate: 1365 },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$", flag: "🇹🇼", fallbackRate: 32.4 },
  { code: "MOP", name: "Macanese Pataca", symbol: "MOP$", flag: "🇲🇴", fallbackRate: 8.05 },
  { code: "MNT", name: "Mongolian Tugrik", symbol: "₮", flag: "🇲🇳", fallbackRate: 3450 },
  { code: "FJD", name: "Fijian Dollar", symbol: "FJ$", flag: "🇫🇯", fallbackRate: 2.27 },
  { code: "PGK", name: "Papua New Guinea Kina", symbol: "K", flag: "🇵🇬", fallbackRate: 4.0 },
  { code: "WST", name: "Samoan Tala", symbol: "WS$", flag: "🇼🇸", fallbackRate: 2.75 },
  { code: "TOP", name: "Tongan Pa'anga", symbol: "T$", flag: "🇹🇴", fallbackRate: 2.37 },
  { code: "SBD", name: "Solomon Islands Dollar", symbol: "SI$", flag: "🇸🇧", fallbackRate: 8.45 },
  { code: "VUV", name: "Vanuatu Vatu", symbol: "VT", flag: "🇻🇺", fallbackRate: 119 },

  // --- Central Asia / Caucasus ------------------------------------------
  { code: "KZT", name: "Kazakhstani Tenge", symbol: "₸", flag: "🇰🇿", fallbackRate: 480 },
  { code: "UZS", name: "Uzbekistani Som", symbol: "сўм", flag: "🇺🇿", fallbackRate: 12800 },
  { code: "TJS", name: "Tajikistani Somoni", symbol: "SM", flag: "🇹🇯", fallbackRate: 10.6 },
  { code: "KGS", name: "Kyrgystani Som", symbol: "с", flag: "🇰🇬", fallbackRate: 87.5 },
  { code: "TMT", name: "Turkmenistani Manat", symbol: "m", flag: "🇹🇲", fallbackRate: 3.5 },
  { code: "AMD", name: "Armenian Dram", symbol: "֏", flag: "🇦🇲", fallbackRate: 387 },
  { code: "AZN", name: "Azerbaijani Manat", symbol: "₼", flag: "🇦🇿", fallbackRate: 1.7 },
  { code: "GEL", name: "Georgian Lari", symbol: "₾", flag: "🇬🇪", fallbackRate: 2.66 },

  // --- Middle East -------------------------------------------------------
  { code: "AED", name: "UAE Dirham", symbol: "AED", flag: "🇦🇪", fallbackRate: 3.6725 },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR", flag: "🇸🇦", fallbackRate: 3.75 },
  { code: "QAR", name: "Qatari Riyal", symbol: "QR", flag: "🇶🇦", fallbackRate: 3.64 },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "KD", flag: "🇰🇼", fallbackRate: 0.307 },
  { code: "OMR", name: "Omani Rial", symbol: "OMR", flag: "🇴🇲", fallbackRate: 0.385 },
  { code: "BHD", name: "Bahraini Dinar", symbol: "BHD", flag: "🇧🇭", fallbackRate: 0.376 },
  { code: "ILS", name: "Israeli New Shekel", symbol: "₪", flag: "🇮🇱", fallbackRate: 3.7 },
  { code: "JOD", name: "Jordanian Dinar", symbol: "JD", flag: "🇯🇴", fallbackRate: 0.709 },
  { code: "LBP", name: "Lebanese Pound", symbol: "L£", flag: "🇱🇧", fallbackRate: 89500 },
  { code: "IQD", name: "Iraqi Dinar", symbol: "ع.د", flag: "🇮🇶", fallbackRate: 1310 },
  { code: "IRR", name: "Iranian Rial", symbol: "﷼", flag: "🇮🇷", fallbackRate: 42000 },
  { code: "YER", name: "Yemeni Rial", symbol: "﷼", flag: "🇾🇪", fallbackRate: 250 },
  { code: "AFN", name: "Afghan Afghani", symbol: "؋", flag: "🇦🇫", fallbackRate: 70 },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "🇹🇷", fallbackRate: 34.1 },

  // --- Africa --------------------------------------------------------
  { code: "EGP", name: "Egyptian Pound", symbol: "E£", flag: "🇪🇬", fallbackRate: 48.5 },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", fallbackRate: 1550 },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", fallbackRate: 18.3 },
  { code: "DZD", name: "Algerian Dinar", symbol: "DA", flag: "🇩🇿", fallbackRate: 134.5 },
  { code: "AOA", name: "Angolan Kwanza", symbol: "Kz", flag: "🇦🇴", fallbackRate: 920 },
  { code: "XOF", name: "West African CFA Franc", symbol: "CFA", flag: "🇧🇫", fallbackRate: 610 },
  { code: "XAF", name: "Central African CFA Franc", symbol: "FCFA", flag: "🇨🇲", fallbackRate: 610 },
  { code: "BWP", name: "Botswana Pula", symbol: "P", flag: "🇧🇼", fallbackRate: 13.6 },
  { code: "CDF", name: "Congolese Franc", symbol: "FC", flag: "🇨🇩", fallbackRate: 2850 },
  { code: "DJF", name: "Djiboutian Franc", symbol: "Fdj", flag: "🇩🇯", fallbackRate: 177.7 },
  { code: "ETB", name: "Ethiopian Birr", symbol: "Br", flag: "🇪🇹", fallbackRate: 123 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", flag: "🇬🇭", fallbackRate: 15.6 },
  { code: "GNF", name: "Guinean Franc", symbol: "FG", flag: "🇬🇳", fallbackRate: 8600 },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪", fallbackRate: 129 },
  { code: "LSL", name: "Lesotho Loti", symbol: "L", flag: "🇱🇸", fallbackRate: 18.3 },
  { code: "LYD", name: "Libyan Dinar", symbol: "LD", flag: "🇱🇾", fallbackRate: 4.85 },
  { code: "MAD", name: "Moroccan Dirham", symbol: "DH", flag: "🇲🇦", fallbackRate: 10.0 },
  { code: "MGA", name: "Malagasy Ariary", symbol: "Ar", flag: "🇲🇬", fallbackRate: 4550 },
  { code: "MUR", name: "Mauritian Rupee", symbol: "Rs", flag: "🇲🇺", fallbackRate: 46.5 },
  { code: "MWK", name: "Malawian Kwacha", symbol: "MK", flag: "🇲🇼", fallbackRate: 1740 },
  { code: "MZN", name: "Mozambican Metical", symbol: "MT", flag: "🇲🇿", fallbackRate: 63.9 },
  { code: "NAD", name: "Namibian Dollar", symbol: "N$", flag: "🇳🇦", fallbackRate: 18.3 },
  { code: "RWF", name: "Rwandan Franc", symbol: "FRw", flag: "🇷🇼", fallbackRate: 1390 },
  { code: "SCR", name: "Seychellois Rupee", symbol: "Rs", flag: "🇸🇨", fallbackRate: 13.6 },
  { code: "SDG", name: "Sudanese Pound", symbol: "ج.س.", flag: "🇸🇩", fallbackRate: 601 },
  { code: "SLL", name: "Sierra Leonean Leone", symbol: "Le", flag: "🇸🇱", fallbackRate: 22700 },
  { code: "SOS", name: "Somali Shilling", symbol: "Sh", flag: "🇸🇴", fallbackRate: 571 },
  { code: "SSP", name: "South Sudanese Pound", symbol: "£", flag: "🇸🇸", fallbackRate: 4500 },
  { code: "SZL", name: "Swazi Lilangeni", symbol: "L", flag: "🇸🇿", fallbackRate: 18.3 },
  { code: "TND", name: "Tunisian Dinar", symbol: "DT", flag: "🇹🇳", fallbackRate: 3.11 },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", flag: "🇹🇿", fallbackRate: 2520 },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh", flag: "🇺🇬", fallbackRate: 3700 },
  { code: "XPF", name: "CFP Franc", symbol: "₣", flag: "🇵🇫", fallbackRate: 109 },
  { code: "ZMW", name: "Zambian Kwacha", symbol: "ZK", flag: "🇿🇲", fallbackRate: 26.8 },
  { code: "ZWL", name: "Zimbabwean Dollar", symbol: "Z$", flag: "🇿🇼", fallbackRate: 26.8 },
  { code: "CVE", name: "Cape Verdean Escudo", symbol: "Esc", flag: "🇨🇻", fallbackRate: 101 },
  { code: "GMD", name: "Gambian Dalasi", symbol: "D", flag: "🇬🇲", fallbackRate: 72 },
  { code: "KMF", name: "Comorian Franc", symbol: "CF", flag: "🇰🇲", fallbackRate: 450 },
  { code: "MRU", name: "Mauritanian Ouguiya", symbol: "UM", flag: "🇲🇷", fallbackRate: 39.8 },
  { code: "STN", name: "São Tomé & Príncipe Dobra", symbol: "Db", flag: "🇸🇹", fallbackRate: 22.3 },
  { code: "ERN", name: "Eritrean Nakfa", symbol: "Nfk", flag: "🇪🇷", fallbackRate: 15 },
  { code: "BIF", name: "Burundian Franc", symbol: "FBu", flag: "🇧🇮", fallbackRate: 2890 },

  // --- Europe ----------------------------------------------------------
  { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "🇸🇪", fallbackRate: 10.4 },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴", fallbackRate: 10.7 },
  { code: "DKK", name: "Danish Krone", symbol: "kr", flag: "🇩🇰", fallbackRate: 6.86 },
  { code: "ISK", name: "Icelandic Krona", symbol: "kr", flag: "🇮🇸", fallbackRate: 138 },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", flag: "🇵🇱", fallbackRate: 4.0 },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč", flag: "🇨🇿", fallbackRate: 23.5 },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft", flag: "🇭🇺", fallbackRate: 385 },
  { code: "RON", name: "Romanian Leu", symbol: "lei", flag: "🇷🇴", fallbackRate: 4.58 },
  { code: "BGN", name: "Bulgarian Lev", symbol: "лв", flag: "🇧🇬", fallbackRate: 1.80 },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴", flag: "🇺🇦", fallbackRate: 41.5 },
  { code: "RSD", name: "Serbian Dinar", symbol: "дин.", flag: "🇷🇸", fallbackRate: 108 },
  { code: "ALL", name: "Albanian Lek", symbol: "L", flag: "🇦🇱", fallbackRate: 94 },
  { code: "MKD", name: "Macedonian Denar", symbol: "ден", flag: "🇲🇰", fallbackRate: 56.8 },
  { code: "BAM", name: "Bosnia-Herzegovina Convertible Mark", symbol: "KM", flag: "🇧🇦", fallbackRate: 1.80 },
  { code: "MDL", name: "Moldovan Leu", symbol: "L", flag: "🇲🇩", fallbackRate: 17.7 },
  { code: "BYN", name: "Belarusian Ruble", symbol: "Br", flag: "🇧🇾", fallbackRate: 3.3 },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", flag: "🇷🇺", fallbackRate: 96.5 },

  // --- Americas ----------------------------------------------------------
  { code: "MXN", name: "Mexican Peso", symbol: "MX$", flag: "🇲🇽", fallbackRate: 18.2 },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷", fallbackRate: 5.65 },
  { code: "ARS", name: "Argentine Peso", symbol: "AR$", flag: "🇦🇷", fallbackRate: 990 },
  { code: "CLP", name: "Chilean Peso", symbol: "CLP$", flag: "🇨🇱", fallbackRate: 970 },
  { code: "COP", name: "Colombian Peso", symbol: "COL$", flag: "🇨🇴", fallbackRate: 4300 },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/", flag: "🇵🇪", fallbackRate: 3.78 },
  { code: "UYU", name: "Uruguayan Peso", symbol: "$U", flag: "🇺🇾", fallbackRate: 42.5 },
  { code: "BOB", name: "Bolivian Boliviano", symbol: "Bs", flag: "🇧🇴", fallbackRate: 6.91 },
  { code: "PYG", name: "Paraguayan Guarani", symbol: "₲", flag: "🇵🇾", fallbackRate: 7850 },
  { code: "VES", name: "Venezuelan Bolívar", symbol: "Bs.", flag: "🇻🇪", fallbackRate: 50 },
  { code: "GYD", name: "Guyanese Dollar", symbol: "G$", flag: "🇬🇾", fallbackRate: 209 },
  { code: "SRD", name: "Surinamese Dollar", symbol: "Sr$", flag: "🇸🇷", fallbackRate: 36.5 },
  { code: "TTD", name: "Trinidad & Tobago Dollar", symbol: "TT$", flag: "🇹🇹", fallbackRate: 6.78 },
  { code: "JMD", name: "Jamaican Dollar", symbol: "J$", flag: "🇯🇲", fallbackRate: 158 },
  { code: "BSD", name: "Bahamian Dollar", symbol: "B$", flag: "🇧🇸", fallbackRate: 1.0 },
  { code: "BBD", name: "Barbadian Dollar", symbol: "Bds$", flag: "🇧🇧", fallbackRate: 2.0 },
  { code: "BZD", name: "Belize Dollar", symbol: "BZ$", flag: "🇧🇿", fallbackRate: 2.02 },
  { code: "XCD", name: "East Caribbean Dollar", symbol: "EC$", flag: "🇱🇨", fallbackRate: 2.70 },
  { code: "HTG", name: "Haitian Gourde", symbol: "G", flag: "🇭🇹", fallbackRate: 132 },
  { code: "DOP", name: "Dominican Peso", symbol: "RD$", flag: "🇩🇴", fallbackRate: 60.0 },
  { code: "CRC", name: "Costa Rican Colón", symbol: "₡", flag: "🇨🇷", fallbackRate: 505 },
  { code: "GTQ", name: "Guatemalan Quetzal", symbol: "Q", flag: "🇬🇹", fallbackRate: 7.72 },
  { code: "HNL", name: "Honduran Lempira", symbol: "L", flag: "🇭🇳", fallbackRate: 24.8 },
  { code: "NIO", name: "Nicaraguan Córdoba", symbol: "C$", flag: "🇳🇮", fallbackRate: 36.8 },
  { code: "PAB", name: "Panamanian Balboa", symbol: "B/.", flag: "🇵🇦", fallbackRate: 1.0 },
  { code: "CUP", name: "Cuban Peso", symbol: "$MN", flag: "🇨🇺", fallbackRate: 24.0 },
];

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

export const CURRENCY_BY_CODE = CURRENCIES.reduce((acc, c) => {
  acc[c.code] = c;
  return acc;
}, {});

export const FALLBACK_RATES = CURRENCIES.reduce((acc, c) => {
  acc[c.code] = c.fallbackRate;
  return acc;
}, {});

export function getCurrency(code) {
  return CURRENCY_BY_CODE[code?.toUpperCase()] || null;
}

export function formatCurrencyLabel(code) {
  const c = getCurrency(code);
  return c ? `${c.code} — ${c.name}` : code;
}

// A short, curated subset for UI spots that need a compact "most
// commonly used" list rather than the full 140+ (e.g. the Base
// Currency switcher's "Popular" group in components/Header.jsx).
// Everything in the full CURRENCIES list above remains selectable —
// this is a display grouping, never a restriction.
export const POPULAR_CURRENCY_CODES = [
  "USD",
  "EUR",
  "GBP",
  "INR",
  "PKR",
  "AED",
  "AUD",
  "CAD",
  "SAR",
  "CNY",
];
