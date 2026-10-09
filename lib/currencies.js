// lib/currencies.js
//
// Master currency reference list shared by the FX Currency Converter,
// the Gold Calculator, and the /api/rates route. Keeping this in one
// file means adding a currency anywhere in the app is a one-line change.
//
// `fallbackRate` is an approximate USD-base rate used only when every
// live rate provider is unreachable (see app/api/rates/route.js), so the
// converter never shows a blank/zero result.

export const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", fallbackRate: 1 },
  { code: "PKR", name: "Pakistani Rupee", symbol: "Rs", flag: "🇵🇰", fallbackRate: 278.5 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", fallbackRate: 83.9 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", fallbackRate: 1.52 },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", fallbackRate: 0.92 },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", fallbackRate: 0.79 },
  { code: "AED", name: "UAE Dirham", symbol: "AED", flag: "🇦🇪", fallbackRate: 3.6725 },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR", flag: "🇸🇦", fallbackRate: 3.75 },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦", fallbackRate: 1.36 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", fallbackRate: 149.5 },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", fallbackRate: 1550 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", fallbackRate: 7.24 },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭", fallbackRate: 0.88 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", fallbackRate: 1.34 },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾", fallbackRate: 4.47 },
  { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭", fallbackRate: 34.8 },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "🇹🇷", fallbackRate: 34.1 },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", fallbackRate: 18.3 },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿", fallbackRate: 1.66 },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰", fallbackRate: 7.82 },
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷", fallbackRate: 1365 },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩", fallbackRate: 15750 },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", flag: "🇧🇩", fallbackRate: 119.5 },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", flag: "🇱🇰", fallbackRate: 304 },
  { code: "QAR", name: "Qatari Riyal", symbol: "QR", flag: "🇶🇦", fallbackRate: 3.64 },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "KD", flag: "🇰🇼", fallbackRate: 0.307 },
  { code: "OMR", name: "Omani Rial", symbol: "OMR", flag: "🇴🇲", fallbackRate: 0.385 },
  { code: "BHD", name: "Bahraini Dinar", symbol: "BHD", flag: "🇧🇭", fallbackRate: 0.376 },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£", flag: "🇪🇬", fallbackRate: 48.5 },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭", fallbackRate: 56.8 },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", flag: "🇻🇳", fallbackRate: 25400 },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷", fallbackRate: 5.65 },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$", flag: "🇲🇽", fallbackRate: 18.2 },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", flag: "🇷🇺", fallbackRate: 96.5 },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "🇸🇪", fallbackRate: 10.4 },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴", fallbackRate: 10.7 },
  { code: "DKK", name: "Danish Krone", symbol: "kr", flag: "🇩🇰", fallbackRate: 6.86 },
];

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

export const CURRENCY_BY_CODE = CURRENCIES.reduce((acc, c) => {
  acc[c.code] = c;
  return acc;
}, {});

/** Static USD-base fallback rates, derived from CURRENCIES above. */
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
