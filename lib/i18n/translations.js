// lib/i18n/translations.js
//
// Translation dictionary for OmniFin Portal's core, site-wide UI
// terms — nav labels plus the trading vocabulary explicitly called out
// for this feature (Buy/Sell, Profit/Loss). Consumed by
// lib/i18n/LanguageContext.js's useLanguage()/t() and, for the
// zero-imports app/calculators/page.jsx, by an identical inline copy
// of just the keys that page needs (see that file's own comment).
//
// SCOPE NOTE: this is deliberately the core navigation/terminology
// layer, not a full line-by-line translation of every sentence on the
// site — that would be a much larger, ongoing effort. Every language
// here covers the same key set, so adding a new translatable string
// anywhere in the app just means adding one more key to each
// language's object below (missing keys fall back to English via
// useLanguage()'s t() helper, so a partially-translated addition never
// renders blank).
//
// Roman Urdu ("ur-Latn") is listed first after English, per the
// product requirement that it be a prominent option — most Pakistani
// users read and type Urdu in Latin script in everyday apps far more
// than the Nasta'liq script, so this isn't just "Urdu without the
// script," it's the dominant real-world register.

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "ur-Latn", label: "Roman Urdu", native: "Roman Urdu" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "tr", label: "Turkish", native: "Türkçe" },
  { code: "zh", label: "Chinese", native: "中文" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "ko", label: "Korean", native: "한국어" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "ru", label: "Russian", native: "Русский" },
  { code: "id", label: "Indonesian", native: "Bahasa Indonesia" },
  { code: "vi", label: "Vietnamese", native: "Tiếng Việt" },
];

export const DEFAULT_LANGUAGE = "en";

// Right-to-left languages — used to set dir="rtl" on anything that
// renders translated text blocks (the Header nav links read fine
// left-to-right as a list either way, but this is exported so any
// future translated content block can do the right thing).
export const RTL_LANGUAGES = new Set(["ar", "ur"]);

export const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard", toolsCalculators: "Tools & Calculators", converters: "Converters",
    calculators: "Calculators", academy: "Academy", marketAnalysis: "Market Analysis", news: "News",
    community: "Community", about: "About", openCalculator: "Open Calculator", baseCurrency: "Base Currency",
    language: "Language", rates: "Rates", buy: "Buy", sell: "Sell", profit: "Profit", loss: "Loss",
  },
  "ur-Latn": {
    dashboard: "Dashboard", toolsCalculators: "Tools & Calculator", converters: "Converter",
    calculators: "Calculator", academy: "Academy", marketAnalysis: "Market Analysis", news: "Khabrain",
    community: "Community", about: "Hamare Baray Mein", openCalculator: "Calculator Kholain",
    baseCurrency: "Asal Currency", language: "Zaban", rates: "Rates", buy: "Khareedna", sell: "Bechna",
    profit: "Nafa", loss: "Nuqsan",
  },
  ur: {
    dashboard: "ڈیش بورڈ", toolsCalculators: "ٹولز اور کیلکولیٹرز", converters: "کنورٹرز",
    calculators: "کیلکولیٹرز", academy: "اکیڈمی", marketAnalysis: "مارکیٹ تجزیہ", news: "خبریں",
    community: "کمیونٹی", about: "ہمارے بارے میں", openCalculator: "کیلکولیٹر کھولیں",
    baseCurrency: "بنیادی کرنسی", language: "زبان", rates: "ریٹس", buy: "خریدیں", sell: "بیچیں",
    profit: "نفع", loss: "نقصان",
  },
  hi: {
    dashboard: "डैशबोर्ड", toolsCalculators: "टूल्स और कैलकुलेटर", converters: "कन्वर्टर",
    calculators: "कैलकुलेटर", academy: "एकेडमी", marketAnalysis: "मार्केट विश्लेषण", news: "समाचार",
    community: "समुदाय", about: "हमारे बारे में", openCalculator: "कैलकुलेटर खोलें",
    baseCurrency: "आधार मुद्रा", language: "भाषा", rates: "दरें", buy: "खरीदें", sell: "बेचें",
    profit: "लाभ", loss: "हानि",
  },
  ar: {
    dashboard: "لوحة التحكم", toolsCalculators: "الأدوات والحاسبات", converters: "المحولات",
    calculators: "الحاسبات", academy: "الأكاديمية", marketAnalysis: "تحليل السوق", news: "الأخبار",
    community: "المجتمع", about: "حول", openCalculator: "افتح الحاسبة", baseCurrency: "العملة الأساسية",
    language: "اللغة", rates: "الأسعار", buy: "شراء", sell: "بيع", profit: "ربح", loss: "خسارة",
  },
  es: {
    dashboard: "Panel", toolsCalculators: "Herramientas y Calculadoras", converters: "Conversores",
    calculators: "Calculadoras", academy: "Academia", marketAnalysis: "Análisis de Mercado", news: "Noticias",
    community: "Comunidad", about: "Acerca de", openCalculator: "Abrir Calculadora", baseCurrency: "Moneda Base",
    language: "Idioma", rates: "Tasas", buy: "Comprar", sell: "Vender", profit: "Ganancia", loss: "Pérdida",
  },
  fr: {
    dashboard: "Tableau de bord", toolsCalculators: "Outils et Calculatrices", converters: "Convertisseurs",
    calculators: "Calculatrices", academy: "Académie", marketAnalysis: "Analyse du Marché", news: "Actualités",
    community: "Communauté", about: "À propos", openCalculator: "Ouvrir la Calculatrice",
    baseCurrency: "Devise de Base", language: "Langue", rates: "Taux", buy: "Acheter", sell: "Vendre",
    profit: "Profit", loss: "Perte",
  },
  de: {
    dashboard: "Übersicht", toolsCalculators: "Tools & Rechner", converters: "Umrechner",
    calculators: "Rechner", academy: "Akademie", marketAnalysis: "Marktanalyse", news: "Nachrichten",
    community: "Community", about: "Über uns", openCalculator: "Rechner öffnen", baseCurrency: "Basiswährung",
    language: "Sprache", rates: "Kurse", buy: "Kaufen", sell: "Verkaufen", profit: "Gewinn", loss: "Verlust",
  },
  tr: {
    dashboard: "Pano", toolsCalculators: "Araçlar ve Hesaplayıcılar", converters: "Dönüştürücüler",
    calculators: "Hesaplayıcılar", academy: "Akademi", marketAnalysis: "Piyasa Analizi", news: "Haberler",
    community: "Topluluk", about: "Hakkında", openCalculator: "Hesaplayıcıyı Aç",
    baseCurrency: "Temel Para Birimi", language: "Dil", rates: "Kurlar", buy: "Al", sell: "Sat",
    profit: "Kâr", loss: "Zarar",
  },
  zh: {
    dashboard: "仪表盘", toolsCalculators: "工具与计算器", converters: "转换器", calculators: "计算器",
    academy: "学院", marketAnalysis: "市场分析", news: "新闻", community: "社区", about: "关于",
    openCalculator: "打开计算器", baseCurrency: "基础货币", language: "语言", rates: "汇率",
    buy: "买入", sell: "卖出", profit: "盈利", loss: "亏损",
  },
  ja: {
    dashboard: "ダッシュボード", toolsCalculators: "ツールと計算機", converters: "コンバーター",
    calculators: "計算機", academy: "アカデミー", marketAnalysis: "マーケット分析", news: "ニュース",
    community: "コミュニティ", about: "概要", openCalculator: "計算機を開く", baseCurrency: "基準通貨",
    language: "言語", rates: "レート", buy: "買い", sell: "売り", profit: "利益", loss: "損失",
  },
  ko: {
    dashboard: "대시보드", toolsCalculators: "도구 및 계산기", converters: "변환기", calculators: "계산기",
    academy: "아카데미", marketAnalysis: "시장 분석", news: "뉴스", community: "커뮤니티", about: "소개",
    openCalculator: "계산기 열기", baseCurrency: "기준 화폐", language: "언어", rates: "환율",
    buy: "매수", sell: "매도", profit: "수익", loss: "손실",
  },
  pt: {
    dashboard: "Painel", toolsCalculators: "Ferramentas e Calculadoras", converters: "Conversores",
    calculators: "Calculadoras", academy: "Academia", marketAnalysis: "Análise de Mercado", news: "Notícias",
    community: "Comunidade", about: "Sobre", openCalculator: "Abrir Calculadora", baseCurrency: "Moeda Base",
    language: "Idioma", rates: "Taxas", buy: "Comprar", sell: "Vender", profit: "Lucro", loss: "Perda",
  },
  ru: {
    dashboard: "Панель", toolsCalculators: "Инструменты и Калькуляторы", converters: "Конвертеры",
    calculators: "Калькуляторы", academy: "Академия", marketAnalysis: "Анализ Рынка", news: "Новости",
    community: "Сообщество", about: "О нас", openCalculator: "Открыть Калькулятор",
    baseCurrency: "Базовая Валюта", language: "Язык", rates: "Курсы", buy: "Купить", sell: "Продать",
    profit: "Прибыль", loss: "Убыток",
  },
  id: {
    dashboard: "Dasbor", toolsCalculators: "Alat & Kalkulator", converters: "Konverter",
    calculators: "Kalkulator", academy: "Akademi", marketAnalysis: "Analisis Pasar", news: "Berita",
    community: "Komunitas", about: "Tentang", openCalculator: "Buka Kalkulator",
    baseCurrency: "Mata Uang Dasar", language: "Bahasa", rates: "Kurs", buy: "Beli", sell: "Jual",
    profit: "Untung", loss: "Rugi",
  },
  vi: {
    dashboard: "Bảng điều khiển", toolsCalculators: "Công cụ & Máy tính", converters: "Bộ chuyển đổi",
    calculators: "Máy tính", academy: "Học viện", marketAnalysis: "Phân tích Thị trường", news: "Tin tức",
    community: "Cộng đồng", about: "Giới thiệu", openCalculator: "Mở Máy tính",
    baseCurrency: "Tiền tệ Cơ sở", language: "Ngôn ngữ", rates: "Tỷ giá", buy: "Mua", sell: "Bán",
    profit: "Lợi nhuận", loss: "Lỗ",
  },
};

export function translate(languageCode, key) {
  const dict = TRANSLATIONS[languageCode] || TRANSLATIONS[DEFAULT_LANGUAGE];
  return dict[key] ?? TRANSLATIONS[DEFAULT_LANGUAGE][key] ?? key;
}
