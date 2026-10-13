// lib/i18n/academyLocalized.js
//
// WEEK/PHASE 5 — extends the Academy's translation coverage from Roman
// Urdu only (the former lib/i18n/academyUrLatn.js) to all 17 languages
// listed in lib/i18n/translations.js's LANGUAGES array.
//
// SCOPE, unchanged from the original Roman-Urdu-only version and kept
// deliberately: this covers the Academy's navigational/structural
// METADATA — level title/subtitle/description and lesson titles — not
// the lesson body itself. The lesson body in lib/academyData.js is
// ~2,300 lines of substantive financial education (explanations,
// worked formulas, quizzes). Machine-translating that much technical
// material in one pass, without a subject-matter review, risks
// introducing subtle errors into content that teaches people how to
// size trading positions and manage risk — the one place on this site
// where a translation mistake could cost someone real money. So lesson
// bodies stay in their single authoritative English version (same
// principle as the Privacy/Terms/Disclaimer pages — see
// components/LegalNoticeBanner.jsx), while the parts a learner uses to
// navigate and recognize topics are translated here, for every
// supported language.
//
// LEVEL TITLES stay in English in every language, by design — "Rookie",
// "Apprentice", "Analyst", "Strategist", "Pro Trader" are the rank
// names used throughout the UI (progress badges, URLs' conceptual
// hierarchy) and are treated as proper nouns, exactly like the original
// Roman Urdu file did. Only each level's subtitle/description and each
// lesson's title are translated per language below.
//
// BRACKET CONVENTION (kept from the original file): a specialized
// trading/technical term keeps its standard English form in brackets
// alongside the translated phrase — e.g. Spanish
// "Precisión Técnica e Indicadores" stays close to literal, while a
// less direct term like "Market Sentiment" is rendered as
// "Sentimiento (Sentiment) del Mercado" — because a learner who later
// reads English trading material, broker platforms, or this same site
// in English needs to recognize the exact term, not a translated
// paraphrase of it.

export const ACADEMY_LEVELS_I18N = {
  "ur-Latn": {
    rookie: {
      subtitle: "Paisay aur Dolat ki Bunyadain (Foundations of Money & Wealth)",
      description:
        "Yahan se shuru karen. Charts aur trades se pehlay, samjhein ke paisa asal mein kya hai, yeh waqt ke sath apni value kyun kho deta hai, aur banks kis tarah credit banate hain.",
    },
    apprentice: {
      subtitle: "Market Mechanics (Market Mechanics) aur Charting",
      description:
        "Seekhen ke markets asal mein prices kaise quote karti hain aur trades kaise execute hoti hain — candlesticks, spreads, pips, lots, aur order types (Order Types).",
    },
    analyst: {
      subtitle: "Technical Precision (Technical Precision) aur Indicators",
      description:
        "Woh core toolkit seekhen jo chart analysts asal mein use karte hain: Support/Resistance zones, RSI, Moving Averages, Fibonacci Retracements, aur Gann basics.",
    },
    strategist: {
      subtitle: "Macro Fundamentals aur Market Sentiment (Market Sentiment)",
      description:
        "Chart se thora zoom out karen: central bank policy, economic calendar, aur crowd ka mood markets ko kaise move karta hai.",
    },
    "pro-trader": {
      subtitle: "Risk Management (Risk Management) aur Psychology",
      description:
        "Woh level jo asal mein long-term survivors ko blown accounts se alag karta hai: Position Sizing (Position Sizing), Risk-to-Reward discipline, journaling, aur emotional control.",
    },
  },
  ur: {
    rookie: {
      subtitle: "پیسے اور دولت کی بنیادیں",
      description:
        "یہاں سے شروع کریں۔ چارٹس اور ٹریڈز سے پہلے سمجھیں کہ پیسہ اصل میں کیا ہے، یہ وقت کے ساتھ اپنی ویلیو کیوں کھو دیتا ہے، اور بینک کس طرح کریڈٹ بناتے ہیں۔",
    },
    apprentice: {
      subtitle: "مارکیٹ میکینکس (Market Mechanics) اور چارٹنگ",
      description:
        "سیکھیں کہ مارکیٹس اصل میں قیمتیں کیسے طے کرتی ہیں اور ٹریڈز کیسے execute ہوتی ہیں — کینڈل سٹکس (Candlestick)، سپریڈز، پپس، لاٹس، اور آرڈر ٹائپس (Order Types)۔",
    },
    analyst: {
      subtitle: "ٹیکنیکل پریسیژن (Technical Precision) اور انڈیکیٹرز",
      description:
        "وہ بنیادی ٹول کٹ سیکھیں جو چارٹ اینالسٹس اصل میں استعمال کرتے ہیں: سپورٹ/ریزسٹنس زونز، RSI، موونگ ایوریجز، فبوناتچی ریٹریسمنٹس، اور گین (Gann) بیسکس۔",
    },
    strategist: {
      subtitle: "میکرو فنڈامینٹلز اور مارکیٹ سینٹیمنٹ (Sentiment)",
      description:
        "چارٹ سے تھوڑا زوم آؤٹ کریں: سینٹرل بینک پالیسی، اکنامک کیلنڈر، اور ہجوم کا موڈ مارکیٹس کو کیسے move کرتا ہے۔",
    },
    "pro-trader": {
      subtitle: "رسک مینجمنٹ (Risk Management) اور نفسیات",
      description:
        "وہ لیول جو اصل میں لانگ ٹرم سروائیورز کو بلون اکاؤنٹس سے الگ کرتا ہے: پوزیشن سائزنگ (Position Sizing)، رسک ٹو ریوارڈ ڈسپلن، جرنلنگ، اور ایموشنل کنٹرول۔",
    },
  },
  hi: {
    rookie: {
      subtitle: "पैसे और संपत्ति की बुनियाद",
      description:
        "यहाँ से शुरू करें। चार्ट्स और ट्रेड्स से पहले, समझें कि पैसा वास्तव में क्या है, यह समय के साथ अपनी वैल्यू क्यों खो देता है, और बैंक किस तरह क्रेडिट बनाते हैं।",
    },
    apprentice: {
      subtitle: "मार्केट मेकैनिक्स (Market Mechanics) और चार्टिंग",
      description:
        "जानें कि मार्केट्स वास्तव में कीमतें कैसे तय करते हैं और ट्रेड कैसे execute होते हैं — कैंडलस्टिक (Candlestick), स्प्रेड्स, पिप्स, लॉट्स, और ऑर्डर टाइप्स (Order Types)।",
    },
    analyst: {
      subtitle: "तकनीकी सटीकता और इंडिकेटर्स",
      description:
        "वह मुख्य टूलकिट सीखें जो चार्ट एनालिस्ट वास्तव में इस्तेमाल करते हैं: सपोर्ट/रेसिस्टेंस ज़ोन, RSI, मूविंग एवरेज, फिबोनाची रिट्रेसमेंट्स, और गैन (Gann) बेसिक्स।",
    },
    strategist: {
      subtitle: "मैक्रो फंडामेंटल्स और मार्केट सेंटिमेंट (Sentiment)",
      description:
        "चार्ट से थोड़ा ज़ूम आउट करें: सेंट्रल बैंक पॉलिसी, इकोनॉमिक कैलेंडर, और भीड़ का मूड मार्केट्स को कैसे मूव करता है।",
    },
    "pro-trader": {
      subtitle: "रिस्क मैनेजमेंट (Risk Management) और मनोविज्ञान",
      description:
        "वह लेवल जो असल में लॉन्ग-टर्म सर्वाइवर्स को ब्लोन अकाउंट्स से अलग करता है: पोज़िशन साइज़िंग (Position Sizing), रिस्क-टू-रिवॉर्ड डिसिप्लिन, जर्नलिंग, और इमोशनल कंट्रोल।",
    },
  },
  ar: {
    rookie: {
      subtitle: "أساسيات المال والثروة",
      description:
        "ابدأ من هنا. قبل الرسوم البيانية والصفقات، افهم ما هو المال في الحقيقة، ولماذا يفقد قيمته مع مرور الوقت، وكيف تُنشئ البنوك الائتمان.",
    },
    apprentice: {
      subtitle: "آليات السوق (Market Mechanics) والتحليل البياني",
      description:
        "تعلّم كيف تُسعّر الأسواق فعليًا وتنفّذ الصفقات: الشموع اليابانية (Candlestick)، الفروق السعرية (Spreads)، النقاط (Pips)، حجم العقد (Lots)، وأنواع الأوامر (Order Types).",
    },
    analyst: {
      subtitle: "الدقة التقنية والمؤشرات",
      description:
        "تعلّم الأدوات الأساسية التي يستخدمها محللو الرسوم البيانية فعليًا: مناطق الدعم والمقاومة، مؤشر RSI، المتوسطات المتحركة، تصحيحات فيبوناتشي، وأساسيات غان (Gann).",
    },
    strategist: {
      subtitle: "الأساسيات الكلية ومعنويات السوق (Sentiment)",
      description:
        "تراجع عن الرسم البياني: سياسة البنوك المركزية، التقويم الاقتصادي، وكيف يحرّك مزاج الجمهور الأسواق.",
    },
    "pro-trader": {
      subtitle: "إدارة المخاطر (Risk Management) وعلم النفس",
      description:
        "المستوى الذي يفصل فعليًا بين الناجين على المدى الطويل والحسابات المحروقة: تحديد حجم المركز (Position Sizing)، انضباط نسبة المخاطرة إلى العائد، تدوين يوميات التداول، والتحكم العاطفي.",
    },
  },
  es: {
    rookie: {
      subtitle: "Fundamentos del Dinero y la Riqueza",
      description:
        "Empieza aquí. Antes de los gráficos y las operaciones, entiende qué es realmente el dinero, por qué pierde valor con el tiempo y cómo los bancos crean crédito.",
    },
    apprentice: {
      subtitle: "Mecánica del Mercado (Market Mechanics) y Gráficos",
      description:
        "Aprende cómo los mercados cotizan precios y ejecutan operaciones: velas (candlesticks), spreads, pips, lotes y tipos de órdenes (order types).",
    },
    analyst: {
      subtitle: "Precisión Técnica e Indicadores",
      description:
        "Aprende el conjunto de herramientas que realmente usan los analistas de gráficos: zonas de soporte/resistencia, RSI, medias móviles, retrocesos de Fibonacci y los fundamentos de Gann.",
    },
    strategist: {
      subtitle: "Fundamentos Macroeconómicos y Sentimiento (Sentiment)",
      description:
        "Aléjate del gráfico: la política de los bancos centrales, el calendario económico y cómo el estado de ánimo de la multitud mueve los mercados.",
    },
    "pro-trader": {
      subtitle: "Gestión de Riesgo (Risk Management) y Psicología",
      description:
        "El nivel que realmente separa a los sobrevivientes a largo plazo de las cuentas quemadas: tamaño de posición (position sizing), disciplina de riesgo-beneficio, diario de trading y control emocional.",
    },
  },
  fr: {
    rookie: {
      subtitle: "Fondations de l'Argent et de la Richesse",
      description:
        "Commencez ici. Avant les graphiques et les trades, comprenez ce qu'est réellement l'argent, pourquoi il perd de la valeur avec le temps, et comment les banques créent du crédit.",
    },
    apprentice: {
      subtitle: "Mécanique du Marché (Market Mechanics) et Analyse Graphique",
      description:
        "Apprenez comment les marchés cotent réellement les prix et exécutent les trades : chandeliers (candlesticks), spreads, pips, lots et types d'ordres (order types).",
    },
    analyst: {
      subtitle: "Précision Technique et Indicateurs",
      description:
        "Apprenez la boîte à outils que les analystes graphiques utilisent réellement : zones de support/résistance, RSI, moyennes mobiles, retracements de Fibonacci et les bases de Gann.",
    },
    strategist: {
      subtitle: "Fondamentaux Macroéconomiques et Sentiment (Sentiment)",
      description:
        "Prenez du recul : la politique des banques centrales, le calendrier économique, et comment l'humeur de la foule fait bouger les marchés.",
    },
    "pro-trader": {
      subtitle: "Gestion du Risque (Risk Management) et Psychologie",
      description:
        "Le niveau qui sépare réellement les survivants à long terme des comptes explosés : dimensionnement des positions (position sizing), discipline risque/rendement, tenue d'un journal, et contrôle émotionnel.",
    },
  },
  de: {
    rookie: {
      subtitle: "Grundlagen von Geld und Wohlstand",
      description:
        "Beginnen Sie hier. Bevor es um Charts und Trades geht, verstehen Sie, was Geld eigentlich ist, warum es mit der Zeit an Wert verliert, und wie Banken Kredit schaffen.",
    },
    apprentice: {
      subtitle: "Marktmechanik (Market Mechanics) und Chartanalyse",
      description:
        "Lernen Sie, wie Märkte Preise stellen und Trades ausführen: Kerzen (Candlesticks), Spreads, Pips, Lots und Ordertypen (Order Types).",
    },
    analyst: {
      subtitle: "Technische Präzision und Indikatoren",
      description:
        "Lernen Sie das Kern-Werkzeug, das Chartanalysten wirklich nutzen: Unterstützungs-/Widerstandszonen, RSI, gleitende Durchschnitte, Fibonacci-Retracements und Gann-Grundlagen.",
    },
    strategist: {
      subtitle: "Makro-Fundamentaldaten und Sentiment (Sentiment)",
      description:
        "Zoomen Sie vom Chart heraus: Zentralbankpolitik, der Wirtschaftskalender, und wie die Stimmung der Masse die Märkte bewegt.",
    },
    "pro-trader": {
      subtitle: "Risikomanagement (Risk Management) und Psychologie",
      description:
        "Die Stufe, die langfristige Überlebende wirklich von gesprengten Konten trennt: Positionsgröße (Position Sizing), Risiko-Ertrags-Disziplin, Trading-Tagebuch und emotionale Kontrolle.",
    },
  },
  it: {
    rookie: {
      subtitle: "Fondamenti di Denaro e Ricchezza",
      description:
        "Inizia qui. Prima dei grafici e delle operazioni, capisci cos'è realmente il denaro, perché perde valore nel tempo e come le banche creano credito.",
    },
    apprentice: {
      subtitle: "Meccanica di Mercato (Market Mechanics) e Analisi Grafica",
      description:
        "Scopri come i mercati quotano i prezzi ed eseguono le operazioni: candele (candlestick), spread, pip, lotti e tipi di ordine (order types).",
    },
    analyst: {
      subtitle: "Precisione Tecnica e Indicatori",
      description:
        "Impara gli strumenti che gli analisti grafici usano davvero: zone di supporto/resistenza, RSI, medie mobili, ritracciamenti di Fibonacci e le basi di Gann.",
    },
    strategist: {
      subtitle: "Fondamentali Macro e Sentiment (Sentiment)",
      description:
        "Allontanati dal grafico: la politica delle banche centrali, il calendario economico e come l'umore della massa muove i mercati.",
    },
    "pro-trader": {
      subtitle: "Gestione del Rischio (Risk Management) e Psicologia",
      description:
        "Il livello che separa davvero i sopravvissuti a lungo termine dai conti bruciati: dimensionamento della posizione (position sizing), disciplina rischio/rendimento, diario di trading e controllo emotivo.",
    },
  },
  tr: {
    rookie: {
      subtitle: "Para ve Zenginliğin Temelleri",
      description:
        "Buradan başlayın. Grafikler ve işlemlerden önce, paranın gerçekte ne olduğunu, zamanla neden değer kaybettiğini ve bankaların krediyi nasıl yarattığını anlayın.",
    },
    apprentice: {
      subtitle: "Piyasa Mekaniği (Market Mechanics) ve Grafik Analizi",
      description:
        "Piyasaların fiyatları nasıl kote ettiğini ve işlemleri nasıl yürüttüğünü öğrenin: mum çubukları (candlestick), spreadler, pipler, lotlar ve emir türleri (order types).",
    },
    analyst: {
      subtitle: "Teknik Hassasiyet ve Göstergeler",
      description:
        "Grafik analistlerinin gerçekten kullandığı temel araç setini öğrenin: destek/direnç bölgeleri, RSI, hareketli ortalamalar, Fibonacci düzeltmeleri ve Gann temelleri.",
    },
    strategist: {
      subtitle: "Makro Temeller ve Piyasa Duyarlılığı (Sentiment)",
      description:
        "Grafikten uzaklaşın: merkez bankası politikası, ekonomik takvim ve kitlenin ruh halinin piyasaları nasıl hareket ettirdiği.",
    },
    "pro-trader": {
      subtitle: "Risk Yönetimi (Risk Management) ve Psikoloji",
      description:
        "Uzun vadeli hayatta kalanları patlayan hesaplardan gerçekten ayıran seviye: pozisyon büyüklüğü (position sizing), risk-ödül disiplini, günlük tutma ve duygusal kontrol.",
    },
  },
  pt: {
    rookie: {
      subtitle: "Fundamentos do Dinheiro e da Riqueza",
      description:
        "Comece aqui. Antes dos gráficos e das operações, entenda o que o dinheiro realmente é, por que ele perde valor com o tempo e como os bancos criam crédito.",
    },
    apprentice: {
      subtitle: "Mecânica de Mercado (Market Mechanics) e Análise Gráfica",
      description:
        "Aprenda como os mercados realmente cotam preços e executam operações: candles (candlestick), spreads, pips, lotes e tipos de ordem (order types).",
    },
    analyst: {
      subtitle: "Precisão Técnica e Indicadores",
      description:
        "Aprenda o conjunto de ferramentas que os analistas gráficos realmente usam: zonas de suporte/resistência, RSI, médias móveis, retrações de Fibonacci e os fundamentos de Gann.",
    },
    strategist: {
      subtitle: "Fundamentos Macro e Sentimento (Sentiment)",
      description:
        "Dê um passo atrás do gráfico: a política dos bancos centrais, o calendário econômico e como o humor da multidão move os mercados.",
    },
    "pro-trader": {
      subtitle: "Gestão de Risco (Risk Management) e Psicologia",
      description:
        "O nível que realmente separa os sobreviventes de longo prazo das contas estouradas: dimensionamento de posição (position sizing), disciplina de risco-retorno, diário de trading e controle emocional.",
    },
  },
  id: {
    rookie: {
      subtitle: "Dasar-Dasar Uang dan Kekayaan",
      description:
        "Mulai di sini. Sebelum grafik dan transaksi, pahami apa sebenarnya uang itu, mengapa nilainya berkurang seiring waktu, dan bagaimana bank menciptakan kredit.",
    },
    apprentice: {
      subtitle: "Mekanika Pasar (Market Mechanics) dan Analisis Grafik",
      description:
        "Pelajari bagaimana pasar benar-benar menentukan harga dan mengeksekusi transaksi: candlestick, spread, pip, lot, dan jenis order (order types).",
    },
    analyst: {
      subtitle: "Presisi Teknis dan Indikator",
      description:
        "Pelajari perangkat inti yang benar-benar digunakan analis grafik: zona support/resistance, RSI, moving average, Fibonacci retracement, dan dasar-dasar Gann.",
    },
    strategist: {
      subtitle: "Fundamental Makro dan Sentimen (Sentiment) Pasar",
      description:
        "Perbesar sudut pandang dari grafik: kebijakan bank sentral, kalender ekonomi, dan bagaimana suasana hati pasar menggerakkan harga.",
    },
    "pro-trader": {
      subtitle: "Manajemen Risiko (Risk Management) dan Psikologi",
      description:
        "Level yang benar-benar membedakan trader yang bertahan jangka panjang dari akun yang hangus: position sizing, disiplin risk-to-reward, jurnal trading, dan kontrol emosi.",
    },
  },
  vi: {
    rookie: {
      subtitle: "Nền Tảng về Tiền và Tài Sản",
      description:
        "Bắt đầu từ đây. Trước khi xem biểu đồ và giao dịch, hãy hiểu tiền thực chất là gì, tại sao nó mất giá trị theo thời gian, và cách ngân hàng tạo ra tín dụng.",
    },
    apprentice: {
      subtitle: "Cơ Chế Thị Trường (Market Mechanics) và Phân Tích Biểu Đồ",
      description:
        "Học cách thị trường báo giá và thực hiện giao dịch: nến (candlestick), spread, pip, lot và các loại lệnh (order types).",
    },
    analyst: {
      subtitle: "Độ Chính Xác Kỹ Thuật và Chỉ Báo",
      description:
        "Học bộ công cụ cốt lõi mà các nhà phân tích biểu đồ thực sự sử dụng: vùng hỗ trợ/kháng cự, RSI, đường trung bình động, thoái lui Fibonacci và kiến thức cơ bản về Gann.",
    },
    strategist: {
      subtitle: "Yếu Tố Vĩ Mô và Tâm Lý Thị Trường (Sentiment)",
      description:
        "Nhìn rộng hơn biểu đồ: chính sách ngân hàng trung ương, lịch kinh tế, và cách tâm lý đám đông tác động đến thị trường.",
    },
    "pro-trader": {
      subtitle: "Quản Lý Rủi Ro (Risk Management) và Tâm Lý",
      description:
        "Cấp độ thực sự phân biệt người sống sót dài hạn với tài khoản bị cháy: xác định khối lượng vị thế (position sizing), kỷ luật rủi ro-lợi nhuận, ghi nhật ký giao dịch, và kiểm soát cảm xúc.",
    },
  },
  ru: {
    rookie: {
      subtitle: "Основы Денег и Богатства",
      description:
        "Начните здесь. Прежде чем смотреть на графики и торговать, поймите, что такое деньги на самом деле, почему они теряют ценность со временем, и как банки создают кредит.",
    },
    apprentice: {
      subtitle: "Механика Рынка (Market Mechanics) и Анализ Графиков",
      description:
        "Узнайте, как рынки формируют цены и исполняют сделки: свечи (candlestick), спреды, пипсы, лоты и типы ордеров (order types).",
    },
    analyst: {
      subtitle: "Техническая Точность и Индикаторы",
      description:
        "Изучите базовый набор инструментов, которые реально используют технические аналитики: зоны поддержки/сопротивления, RSI, скользящие средние, уровни Фибоначчи и основы Ганна.",
    },
    strategist: {
      subtitle: "Макроэкономические Основы и Настроения (Sentiment) Рынка",
      description:
        "Отойдите от графика: политика центральных банков, экономический календарь, и как настроение толпы двигает рынки.",
    },
    "pro-trader": {
      subtitle: "Управление Рисками (Risk Management) и Психология",
      description:
        "Уровень, который на самом деле отличает выживших в долгосрочной перспективе от слитых счетов: расчёт размера позиции (position sizing), дисциплина риск/прибыль, ведение журнала и контроль эмоций.",
    },
  },
  zh: {
    rookie: {
      subtitle: "金钱与财富的基础",
      description:
        "从这里开始。在接触图表和交易之前，先理解金钱到底是什么，为什么它会随时间贬值，以及银行如何创造信贷。",
    },
    apprentice: {
      subtitle: "市场机制（Market Mechanics）与图表分析",
      description:
        "学习市场如何报价并执行交易：K线（Candlestick）、价差（Spread）、点数（Pips）、手数（Lots）和订单类型（Order Types）。",
    },
    analyst: {
      subtitle: "技术精度与指标",
      description:
        "学习图表分析师真正使用的核心工具：支撑/阻力位、RSI、移动平均线、斐波那契回撤以及江恩（Gann）基础。",
    },
    strategist: {
      subtitle: "宏观基本面与市场情绪（Sentiment）",
      description: "从图表中跳出来：央行政策、经济日历，以及大众情绪如何推动市场。",
    },
    "pro-trader": {
      subtitle: "风险管理（Risk Management）与心理",
      description:
        "真正区分长期生存者与爆仓账户的层级：仓位规模（Position Sizing）、风险回报纪律、交易日志记录，以及情绪控制。",
    },
  },
  ja: {
    rookie: {
      subtitle: "お金と富の基礎",
      description:
        "ここから始めましょう。チャートや取引の前に、お金とは実際に何か、なぜ時間とともに価値を失うのか、銀行がどのように信用を創造するのかを理解しましょう。",
    },
    apprentice: {
      subtitle: "マーケットの仕組み（Market Mechanics）とチャート分析",
      description:
        "市場が実際にどのように価格を提示し、取引を執行するかを学びます：ローソク足（Candlestick）、スプレッド、ピップス、ロット、注文タイプ（Order Types）。",
    },
    analyst: {
      subtitle: "テクニカルの精度と指標",
      description:
        "チャートアナリストが実際に使う中心的なツールを学びます：サポート/レジスタンスゾーン、RSI、移動平均線、フィボナッチ・リトレースメント、ギャン（Gann）の基礎。",
    },
    strategist: {
      subtitle: "マクロファンダメンタルズと市場センチメント（Sentiment）",
      description:
        "チャートから視野を広げましょう：中央銀行の政策、経済カレンダー、そして大衆の心理が市場をどう動かすか。",
    },
    "pro-trader": {
      subtitle: "リスク管理（Risk Management）と心理",
      description:
        "長期的に生き残る人と資金を失う人を実際に分けるレベルです：ポジションサイジング（Position Sizing）、リスクリワードの規律、トレード日記、そして感情のコントロール。",
    },
  },
  ko: {
    rookie: {
      subtitle: "돈과 부의 기초",
      description:
        "여기서 시작하세요. 차트와 거래 전에, 돈이 실제로 무엇인지, 왜 시간이 지나면서 가치를 잃는지, 그리고 은행이 어떻게 신용을 창출하는지 이해하세요.",
    },
    apprentice: {
      subtitle: "시장 메커니즘(Market Mechanics)과 차트 분석",
      description:
        "시장이 실제로 가격을 호가하고 거래를 체결하는 방법을 배우세요: 캔들스틱(Candlestick), 스프레드, 핍(Pips), 랏(Lots), 주문 유형(Order Types).",
    },
    analyst: {
      subtitle: "기술적 정밀도와 지표",
      description:
        "차트 분석가가 실제로 사용하는 핵심 도구를 배우세요: 지지/저항 구간, RSI, 이동평균선, 피보나치 되돌림, 그리고 갠(Gann) 이론의 기초.",
    },
    strategist: {
      subtitle: "매크로 기초와 시장 심리(Sentiment)",
      description:
        "차트에서 한 걸음 물러서세요: 중앙은행 정책, 경제 캘린더, 그리고 대중의 심리가 시장을 움직이는 방식.",
    },
    "pro-trader": {
      subtitle: "리스크 관리(Risk Management)와 심리",
      description:
        "장기 생존자와 계좌가 터진 사람을 실제로 구분하는 단계: 포지션 사이징(Position Sizing), 리스크 대비 보상 원칙, 매매일지 작성, 감정 조절.",
    },
  },
};

export const ACADEMY_LESSONS_I18N = {
  "ur-Latn": {
    "inflation-reality": { title: "Inflation (Inflation) ki Haqeeqat" },
    "money-vs-fiat": { title: "Paisa vs. Fiat Currency (Fiat Currency)" },
    "fractional-reserve-banking": { title: "Fractional Reserve Banking (Fractional Reserve Banking)" },
    "gold-vs-paper-money": { title: "Gold vs. Paper Money (Paper Money)" },
    "candlestick-anatomy": { title: "Candlestick (Candlestick) ki Anatomy" },
    "bid-ask-spread": { title: "Bid/Ask Spreads (Bid/Ask Spreads)" },
    "pips-and-lot-sizes": { title: "Pips & Lot Sizes (Pips & Lot Sizes)" },
    "order-types": { title: "Order Types (Order Types): Market vs. Limit" },
    "support-resistance": { title: "Support & Resistance (Support & Resistance) Zones" },
    "rsi-indicator": { title: "RSI (Relative Strength Index)" },
    "moving-averages": { title: "Moving Averages (Moving Averages)" },
    "fibonacci-retracements": { title: "Fibonacci Retracements (Fibonacci Retracements)" },
    "gann-basics": { title: "Gann Time & Price (Gann Time & Price) Basics" },
    "central-bank-rates": { title: "Central Bank Interest Rates (Interest Rates)" },
    "nfp-and-news-trading": { title: "Non-Farm Payrolls (NFP) aur News Trading" },
    "market-sentiment": { title: "Market Sentiment (Market Sentiment) ki Tashreeh" },
    "position-sizing-math": { title: "Position Sizing (Position Sizing) ka Math" },
    "risk-to-reward-ratio": { title: "Risk-to-Reward Ratio (Risk-to-Reward Ratio)" },
    "trading-journal": { title: "Trading Journal (Trading Journal) Rakhna" },
    "fomo-and-greed": { title: "FOMO aur Greed (FOMO & Greed) Par Qabu" },
  },
  ur: {
    "inflation-reality": { title: "افراط زر (Inflation) کی حقیقت" },
    "money-vs-fiat": { title: "پیسہ بمقابلہ فیاٹ کرنسی (Fiat Currency)" },
    "fractional-reserve-banking": { title: "فریکشنل ریزرو بینکنگ (Fractional Reserve Banking)" },
    "gold-vs-paper-money": { title: "سونا بمقابلہ کاغذی کرنسی" },
    "candlestick-anatomy": { title: "کینڈل سٹک (Candlestick) کی اناٹومی" },
    "bid-ask-spread": { title: "بڈ/آسک سپریڈز (Bid/Ask Spreads)" },
    "pips-and-lot-sizes": { title: "پپس اور لاٹ سائزز (Lot Sizes)" },
    "order-types": { title: "آرڈر ٹائپس: مارکیٹ بمقابلہ لمٹ" },
    "support-resistance": { title: "سپورٹ اور ریزسٹنس زونز" },
    "rsi-indicator": { title: "RSI (ریلیٹو سٹرینگتھ انڈیکس)" },
    "moving-averages": { title: "موونگ ایوریجز (Moving Averages)" },
    "fibonacci-retracements": { title: "فبوناتچی ریٹریسمنٹس" },
    "gann-basics": { title: "گین (Gann) ٹائم اینڈ پرائس بیسکس" },
    "central-bank-rates": { title: "سینٹرل بینک انٹرسٹ ریٹس" },
    "nfp-and-news-trading": { title: "نان فارم پے رولز (NFP) اور نیوز ٹریڈنگ" },
    "market-sentiment": { title: "مارکیٹ سینٹیمنٹ (Market Sentiment) کی تشریح" },
    "position-sizing-math": { title: "پوزیشن سائزنگ (Position Sizing) کا میتھ" },
    "risk-to-reward-ratio": { title: "رسک ٹو ریوارڈ ریشو (Risk-to-Reward Ratio)" },
    "trading-journal": { title: "ٹریڈنگ جرنل (Trading Journal) رکھنا" },
    "fomo-and-greed": { title: "FOMO اور لالچ (Greed) پر قابو" },
  },
  hi: {
    "inflation-reality": { title: "महंगाई (Inflation) की हकीकत" },
    "money-vs-fiat": { title: "पैसा vs. फिएट करेंसी (Fiat Currency)" },
    "fractional-reserve-banking": { title: "फ्रैक्शनल रिज़र्व बैंकिंग (Fractional Reserve Banking)" },
    "gold-vs-paper-money": { title: "सोना vs. कागज़ी मुद्रा" },
    "candlestick-anatomy": { title: "कैंडलस्टिक (Candlestick) की एनाटॉमी" },
    "bid-ask-spread": { title: "बिड/आस्क स्प्रेड्स (Bid/Ask Spreads)" },
    "pips-and-lot-sizes": { title: "पिप्स और लॉट साइज़ेज़ (Lot Sizes)" },
    "order-types": { title: "ऑर्डर टाइप्स: मार्केट vs. लिमिट" },
    "support-resistance": { title: "सपोर्ट और रेसिस्टेंस ज़ोन" },
    "rsi-indicator": { title: "RSI (रिलेटिव स्ट्रेंथ इंडेक्स)" },
    "moving-averages": { title: "मूविंग एवरेज (Moving Averages)" },
    "fibonacci-retracements": { title: "फिबोनाची रिट्रेसमेंट्स (Fibonacci Retracements)" },
    "gann-basics": { title: "गैन टाइम एंड प्राइस (Gann) बेसिक्स" },
    "central-bank-rates": { title: "सेंट्रल बैंक इंटरेस्ट रेट्स" },
    "nfp-and-news-trading": { title: "नॉन-फार्म पेरोल्स (NFP) और न्यूज़ ट्रेडिंग" },
    "market-sentiment": { title: "मार्केट सेंटिमेंट (Market Sentiment) की व्याख्या" },
    "position-sizing-math": { title: "पोज़िशन साइज़िंग (Position Sizing) का मैथ" },
    "risk-to-reward-ratio": { title: "रिस्क-टू-रिवॉर्ड रेशियो (Risk-to-Reward Ratio)" },
    "trading-journal": { title: "ट्रेडिंग जर्नल (Trading Journal) रखना" },
    "fomo-and-greed": { title: "FOMO और लालच (Greed) पर काबू" },
  },
  ar: {
    "inflation-reality": { title: "حقيقة التضخم (Inflation)" },
    "money-vs-fiat": { title: "المال مقابل العملة الورقية (Fiat Currency)" },
    "fractional-reserve-banking": { title: "نظام الاحتياطي الجزئي (Fractional Reserve Banking)" },
    "gold-vs-paper-money": { title: "الذهب مقابل النقود الورقية" },
    "candlestick-anatomy": { title: "تشريح الشموع اليابانية (Candlestick)" },
    "bid-ask-spread": { title: "فروق العرض والطلب (Bid/Ask Spread)" },
    "pips-and-lot-sizes": { title: "النقاط وحجم العقد (Pips & Lot Sizes)" },
    "order-types": { title: "أنواع الأوامر: السوق مقابل الحد" },
    "support-resistance": { title: "مناطق الدعم والمقاومة" },
    "rsi-indicator": { title: "مؤشر القوة النسبية RSI" },
    "moving-averages": { title: "المتوسطات المتحركة (Moving Averages)" },
    "fibonacci-retracements": { title: "تصحيحات فيبوناتشي (Fibonacci Retracements)" },
    "gann-basics": { title: "أساسيات غان (Gann) - الزمن والسعر" },
    "central-bank-rates": { title: "أسعار الفائدة للبنوك المركزية" },
    "nfp-and-news-trading": { title: "تقرير الوظائف غير الزراعية (NFP) وتداول الأخبار" },
    "market-sentiment": { title: "تفسير معنويات السوق (Market Sentiment)" },
    "position-sizing-math": { title: "رياضيات تحديد حجم المركز (Position Sizing)" },
    "risk-to-reward-ratio": { title: "نسبة المخاطرة إلى العائد (Risk-to-Reward)" },
    "trading-journal": { title: "الاحتفاظ بيوميات التداول" },
    "fomo-and-greed": { title: "التحكم في FOMO والطمع (Greed)" },
  },
  es: {
    "inflation-reality": { title: "La Realidad de la Inflación (Inflation)" },
    "money-vs-fiat": { title: "Dinero vs. Moneda Fiat (Fiat Currency)" },
    "fractional-reserve-banking": { title: "Banca de Reserva Fraccionaria (Fractional Reserve Banking)" },
    "gold-vs-paper-money": { title: "Oro vs. Dinero en Papel" },
    "candlestick-anatomy": { title: "Anatomía de las Velas (Candlestick)" },
    "bid-ask-spread": { title: "Spreads de Compra/Venta (Bid/Ask)" },
    "pips-and-lot-sizes": { title: "Pips y Tamaños de Lote (Lot Sizes)" },
    "order-types": { title: "Tipos de Órdenes: Mercado vs. Límite" },
    "support-resistance": { title: "Zonas de Soporte y Resistencia" },
    "rsi-indicator": { title: "RSI (Índice de Fuerza Relativa)" },
    "moving-averages": { title: "Medias Móviles (Moving Averages)" },
    "fibonacci-retracements": { title: "Retrocesos de Fibonacci" },
    "gann-basics": { title: "Fundamentos de Gann (Tiempo y Precio)" },
    "central-bank-rates": { title: "Tasas de Interés de los Bancos Centrales" },
    "nfp-and-news-trading": { title: "Nóminas No Agrícolas (NFP) y Trading de Noticias" },
    "market-sentiment": { title: "Interpretación del Sentimiento del Mercado (Market Sentiment)" },
    "position-sizing-math": { title: "Matemáticas del Tamaño de Posición (Position Sizing)" },
    "risk-to-reward-ratio": { title: "Ratio de Riesgo-Beneficio (Risk-to-Reward)" },
    "trading-journal": { title: "Llevar un Diario de Trading (Trading Journal)" },
    "fomo-and-greed": { title: "Controlar el FOMO y la Codicia (Greed)" },
  },
  fr: {
    "inflation-reality": { title: "La Réalité de l'Inflation" },
    "money-vs-fiat": { title: "Argent vs. Monnaie Fiduciaire (Fiat Currency)" },
    "fractional-reserve-banking": { title: "Réserves Fractionnaires (Fractional Reserve Banking)" },
    "gold-vs-paper-money": { title: "Or vs. Monnaie Papier" },
    "candlestick-anatomy": { title: "Anatomie des Chandeliers (Candlestick)" },
    "bid-ask-spread": { title: "Spreads Bid/Ask" },
    "pips-and-lot-sizes": { title: "Pips et Tailles de Lot (Lot Sizes)" },
    "order-types": { title: "Types d'Ordres : Marché vs. Limite" },
    "support-resistance": { title: "Zones de Support et Résistance" },
    "rsi-indicator": { title: "RSI (Indice de Force Relative)" },
    "moving-averages": { title: "Moyennes Mobiles (Moving Averages)" },
    "fibonacci-retracements": { title: "Retracements de Fibonacci" },
    "gann-basics": { title: "Bases de Gann (Temps et Prix)" },
    "central-bank-rates": { title: "Taux d'Intérêt des Banques Centrales" },
    "nfp-and-news-trading": { title: "Non-Farm Payrolls (NFP) et Trading de News" },
    "market-sentiment": { title: "Interprétation du Sentiment de Marché" },
    "position-sizing-math": { title: "Calcul de la Taille de Position (Position Sizing)" },
    "risk-to-reward-ratio": { title: "Ratio Risque/Rendement (Risk-to-Reward)" },
    "trading-journal": { title: "Tenir un Journal de Trading" },
    "fomo-and-greed": { title: "Maîtriser le FOMO et l'Avidité (Greed)" },
  },
  de: {
    "inflation-reality": { title: "Die Realität der Inflation" },
    "money-vs-fiat": { title: "Geld vs. Fiatgeld (Fiat Currency)" },
    "fractional-reserve-banking": { title: "Teilreserve-Banking (Fractional Reserve Banking)" },
    "gold-vs-paper-money": { title: "Gold vs. Papiergeld" },
    "candlestick-anatomy": { title: "Anatomie der Kerzen (Candlestick)" },
    "bid-ask-spread": { title: "Geld-/Briefkurs-Spreads (Bid/Ask)" },
    "pips-and-lot-sizes": { title: "Pips und Lot-Größen (Lot Sizes)" },
    "order-types": { title: "Ordertypen: Market vs. Limit" },
    "support-resistance": { title: "Unterstützungs- und Widerstandszonen" },
    "rsi-indicator": { title: "RSI (Relative-Stärke-Index)" },
    "moving-averages": { title: "Gleitende Durchschnitte (Moving Averages)" },
    "fibonacci-retracements": { title: "Fibonacci-Retracements" },
    "gann-basics": { title: "Gann-Grundlagen (Zeit und Preis)" },
    "central-bank-rates": { title: "Leitzinsen der Zentralbanken" },
    "nfp-and-news-trading": { title: "Non-Farm Payrolls (NFP) und News-Trading" },
    "market-sentiment": { title: "Interpretation der Marktstimmung (Market Sentiment)" },
    "position-sizing-math": { title: "Positionsgrößen-Mathematik (Position Sizing)" },
    "risk-to-reward-ratio": { title: "Risiko-Ertrags-Verhältnis (Risk-to-Reward)" },
    "trading-journal": { title: "Ein Trading-Tagebuch führen" },
    "fomo-and-greed": { title: "FOMO und Gier (Greed) kontrollieren" },
  },
  it: {
    "inflation-reality": { title: "La Realtà dell'Inflazione" },
    "money-vs-fiat": { title: "Denaro vs. Moneta Fiat (Fiat Currency)" },
    "fractional-reserve-banking": { title: "Riserva Frazionaria (Fractional Reserve Banking)" },
    "gold-vs-paper-money": { title: "Oro vs. Moneta Cartacea" },
    "candlestick-anatomy": { title: "Anatomia delle Candele (Candlestick)" },
    "bid-ask-spread": { title: "Spread Bid/Ask" },
    "pips-and-lot-sizes": { title: "Pip e Dimensioni del Lotto (Lot Sizes)" },
    "order-types": { title: "Tipi di Ordine: Market vs. Limit" },
    "support-resistance": { title: "Zone di Supporto e Resistenza" },
    "rsi-indicator": { title: "RSI (Indice di Forza Relativa)" },
    "moving-averages": { title: "Medie Mobili (Moving Averages)" },
    "fibonacci-retracements": { title: "Ritracciamenti di Fibonacci" },
    "gann-basics": { title: "Basi di Gann (Tempo e Prezzo)" },
    "central-bank-rates": { title: "Tassi d'Interesse delle Banche Centrali" },
    "nfp-and-news-trading": { title: "Non-Farm Payrolls (NFP) e News Trading" },
    "market-sentiment": { title: "Interpretazione del Sentiment di Mercato" },
    "position-sizing-math": { title: "Matematica del Dimensionamento della Posizione (Position Sizing)" },
    "risk-to-reward-ratio": { title: "Rapporto Rischio/Rendimento (Risk-to-Reward)" },
    "trading-journal": { title: "Tenere un Diario di Trading" },
    "fomo-and-greed": { title: "Controllare FOMO e Avidità (Greed)" },
  },
  tr: {
    "inflation-reality": { title: "Enflasyonun Gerçekliği (Inflation)" },
    "money-vs-fiat": { title: "Para vs. Fiat Para (Fiat Currency)" },
    "fractional-reserve-banking": { title: "Kısmi Rezerv Bankacılığı (Fractional Reserve Banking)" },
    "gold-vs-paper-money": { title: "Altın vs. Kağıt Para" },
    "candlestick-anatomy": { title: "Mum Çubuğu (Candlestick) Anatomisi" },
    "bid-ask-spread": { title: "Alış/Satış Spreadleri (Bid/Ask)" },
    "pips-and-lot-sizes": { title: "Pipler ve Lot Büyüklükleri (Lot Sizes)" },
    "order-types": { title: "Emir Türleri: Piyasa vs. Limit" },
    "support-resistance": { title: "Destek ve Direnç Bölgeleri" },
    "rsi-indicator": { title: "RSI (Relative Strength Index)" },
    "moving-averages": { title: "Hareketli Ortalamalar (Moving Averages)" },
    "fibonacci-retracements": { title: "Fibonacci Düzeltmeleri" },
    "gann-basics": { title: "Gann Temelleri (Zaman ve Fiyat)" },
    "central-bank-rates": { title: "Merkez Bankası Faiz Oranları" },
    "nfp-and-news-trading": { title: "Tarım Dışı İstihdam (NFP) ve Haber Ticareti" },
    "market-sentiment": { title: "Piyasa Duyarlılığı Yorumlama (Market Sentiment)" },
    "position-sizing-math": { title: "Pozisyon Büyüklüğü Matematiği (Position Sizing)" },
    "risk-to-reward-ratio": { title: "Risk-Ödül Oranı (Risk-to-Reward)" },
    "trading-journal": { title: "Trading Günlüğü Tutmak" },
    "fomo-and-greed": { title: "FOMO ve Hırsı (Greed) Kontrol Etmek" },
  },
  pt: {
    "inflation-reality": { title: "A Realidade da Inflação" },
    "money-vs-fiat": { title: "Dinheiro vs. Moeda Fiduciária (Fiat Currency)" },
    "fractional-reserve-banking": { title: "Reserva Fracionária (Fractional Reserve Banking)" },
    "gold-vs-paper-money": { title: "Ouro vs. Dinheiro em Papel" },
    "candlestick-anatomy": { title: "Anatomia dos Candles (Candlestick)" },
    "bid-ask-spread": { title: "Spreads de Compra/Venda (Bid/Ask)" },
    "pips-and-lot-sizes": { title: "Pips e Tamanhos de Lote (Lot Sizes)" },
    "order-types": { title: "Tipos de Ordem: Mercado vs. Limite" },
    "support-resistance": { title: "Zonas de Suporte e Resistência" },
    "rsi-indicator": { title: "RSI (Índice de Força Relativa)" },
    "moving-averages": { title: "Médias Móveis (Moving Averages)" },
    "fibonacci-retracements": { title: "Retrações de Fibonacci" },
    "gann-basics": { title: "Fundamentos de Gann (Tempo e Preço)" },
    "central-bank-rates": { title: "Taxas de Juros dos Bancos Centrais" },
    "nfp-and-news-trading": { title: "Payroll Não-Agrícola (NFP) e Trading de Notícias" },
    "market-sentiment": { title: "Interpretação do Sentimento de Mercado (Market Sentiment)" },
    "position-sizing-math": { title: "Matemática do Dimensionamento de Posição (Position Sizing)" },
    "risk-to-reward-ratio": { title: "Relação Risco-Retorno (Risk-to-Reward)" },
    "trading-journal": { title: "Manter um Diário de Trading" },
    "fomo-and-greed": { title: "Controlando o FOMO e a Avidez (Greed)" },
  },
  id: {
    "inflation-reality": { title: "Realita Inflasi (Inflation)" },
    "money-vs-fiat": { title: "Uang vs. Mata Uang Fiat (Fiat Currency)" },
    "fractional-reserve-banking": { title: "Perbankan Cadangan Sebagian (Fractional Reserve Banking)" },
    "gold-vs-paper-money": { title: "Emas vs. Uang Kertas" },
    "candlestick-anatomy": { title: "Anatomi Candlestick" },
    "bid-ask-spread": { title: "Spread Bid/Ask" },
    "pips-and-lot-sizes": { title: "Pip dan Ukuran Lot (Lot Sizes)" },
    "order-types": { title: "Jenis Order: Market vs. Limit" },
    "support-resistance": { title: "Zona Support dan Resistance" },
    "rsi-indicator": { title: "RSI (Relative Strength Index)" },
    "moving-averages": { title: "Moving Average" },
    "fibonacci-retracements": { title: "Fibonacci Retracement" },
    "gann-basics": { title: "Dasar-Dasar Gann (Waktu dan Harga)" },
    "central-bank-rates": { title: "Suku Bunga Bank Sentral" },
    "nfp-and-news-trading": { title: "Non-Farm Payrolls (NFP) dan Trading Berita" },
    "market-sentiment": { title: "Interpretasi Sentimen Pasar (Market Sentiment)" },
    "position-sizing-math": { title: "Matematika Position Sizing" },
    "risk-to-reward-ratio": { title: "Rasio Risk-to-Reward" },
    "trading-journal": { title: "Menjaga Jurnal Trading" },
    "fomo-and-greed": { title: "Mengendalikan FOMO dan Keserakahan (Greed)" },
  },
  vi: {
    "inflation-reality": { title: "Thực Trạng Lạm Phát (Inflation)" },
    "money-vs-fiat": { title: "Tiền vs. Tiền Pháp Định (Fiat Currency)" },
    "fractional-reserve-banking": { title: "Ngân Hàng Dự Trữ Một Phần (Fractional Reserve Banking)" },
    "gold-vs-paper-money": { title: "Vàng vs. Tiền Giấy" },
    "candlestick-anatomy": { title: "Cấu Tạo Nến (Candlestick)" },
    "bid-ask-spread": { title: "Spread Bid/Ask" },
    "pips-and-lot-sizes": { title: "Pip và Khối Lượng Lot (Lot Sizes)" },
    "order-types": { title: "Các Loại Lệnh: Market vs. Limit" },
    "support-resistance": { title: "Vùng Hỗ Trợ và Kháng Cự" },
    "rsi-indicator": { title: "RSI (Chỉ Số Sức Mạnh Tương Đối)" },
    "moving-averages": { title: "Đường Trung Bình Động (Moving Averages)" },
    "fibonacci-retracements": { title: "Thoái Lui Fibonacci" },
    "gann-basics": { title: "Kiến Thức Cơ Bản về Gann (Thời Gian và Giá)" },
    "central-bank-rates": { title: "Lãi Suất Ngân Hàng Trung Ương" },
    "nfp-and-news-trading": { title: "Báo Cáo Việc Làm Phi Nông Nghiệp (NFP) và Giao Dịch Theo Tin Tức" },
    "market-sentiment": { title: "Giải Thích Tâm Lý Thị Trường (Market Sentiment)" },
    "position-sizing-math": { title: "Toán Học Xác Định Khối Lượng Vị Thế (Position Sizing)" },
    "risk-to-reward-ratio": { title: "Tỷ Lệ Rủi Ro-Lợi Nhuận (Risk-to-Reward)" },
    "trading-journal": { title: "Ghi Nhật Ký Giao Dịch" },
    "fomo-and-greed": { title: "Kiểm Soát FOMO và Lòng Tham (Greed)" },
  },
  ru: {
    "inflation-reality": { title: "Реальность Инфляции (Inflation)" },
    "money-vs-fiat": { title: "Деньги vs. Фиатная Валюта (Fiat Currency)" },
    "fractional-reserve-banking": { title: "Банкинг с Частичным Резервированием (Fractional Reserve Banking)" },
    "gold-vs-paper-money": { title: "Золото vs. Бумажные Деньги" },
    "candlestick-anatomy": { title: "Анатомия Свечей (Candlestick)" },
    "bid-ask-spread": { title: "Спреды Bid/Ask" },
    "pips-and-lot-sizes": { title: "Пипсы и Размеры Лота (Lot Sizes)" },
    "order-types": { title: "Типы Ордеров: Market vs. Limit" },
    "support-resistance": { title: "Зоны Поддержки и Сопротивления" },
    "rsi-indicator": { title: "RSI (Индекс Относительной Силы)" },
    "moving-averages": { title: "Скользящие Средние (Moving Averages)" },
    "fibonacci-retracements": { title: "Уровни Фибоначчи (Fibonacci Retracements)" },
    "gann-basics": { title: "Основы Ганна (Время и Цена)" },
    "central-bank-rates": { title: "Процентные Ставки Центральных Банков" },
    "nfp-and-news-trading": { title: "Non-Farm Payrolls (NFP) и Торговля на Новостях" },
    "market-sentiment": { title: "Интерпретация Настроений Рынка (Market Sentiment)" },
    "position-sizing-math": { title: "Математика Расчёта Размера Позиции (Position Sizing)" },
    "risk-to-reward-ratio": { title: "Соотношение Риск/Прибыль (Risk-to-Reward)" },
    "trading-journal": { title: "Ведение Торгового Журнала" },
    "fomo-and-greed": { title: "Контроль FOMO и Жадности (Greed)" },
  },
  zh: {
    "inflation-reality": { title: "通胀的真相（Inflation）" },
    "money-vs-fiat": { title: "货币 vs. 法定货币（Fiat Currency）" },
    "fractional-reserve-banking": { title: "部分准备金银行制度（Fractional Reserve Banking）" },
    "gold-vs-paper-money": { title: "黄金 vs. 纸币" },
    "candlestick-anatomy": { title: "K线（Candlestick）解析" },
    "bid-ask-spread": { title: "买卖价差（Bid/Ask Spread）" },
    "pips-and-lot-sizes": { title: "点数与手数（Pips & Lot Sizes）" },
    "order-types": { title: "订单类型：市价单 vs. 限价单" },
    "support-resistance": { title: "支撑与阻力位" },
    "rsi-indicator": { title: "RSI（相对强弱指数）" },
    "moving-averages": { title: "移动平均线（Moving Averages）" },
    "fibonacci-retracements": { title: "斐波那契回撤（Fibonacci Retracements）" },
    "gann-basics": { title: "江恩理论基础（时间与价格）" },
    "central-bank-rates": { title: "央行利率" },
    "nfp-and-news-trading": { title: "非农就业数据（NFP）与新闻交易" },
    "market-sentiment": { title: "市场情绪解读（Market Sentiment）" },
    "position-sizing-math": { title: "仓位规模数学（Position Sizing）" },
    "risk-to-reward-ratio": { title: "风险回报比（Risk-to-Reward）" },
    "trading-journal": { title: "记交易日志" },
    "fomo-and-greed": { title: "控制FOMO与贪婪（Greed）" },
  },
  ja: {
    "inflation-reality": { title: "インフレの実態（Inflation）" },
    "money-vs-fiat": { title: "お金 vs. フィアット通貨（Fiat Currency）" },
    "fractional-reserve-banking": { title: "部分準備銀行制度（Fractional Reserve Banking）" },
    "gold-vs-paper-money": { title: "金 vs. 紙幣" },
    "candlestick-anatomy": { title: "ローソク足（Candlestick）の構造" },
    "bid-ask-spread": { title: "ビッド・アスク・スプレッド（Bid/Ask Spread）" },
    "pips-and-lot-sizes": { title: "ピップスとロットサイズ（Pips & Lot Sizes）" },
    "order-types": { title: "注文タイプ：マーケット vs. リミット" },
    "support-resistance": { title: "サポート＆レジスタンスゾーン" },
    "rsi-indicator": { title: "RSI（相対力指数）" },
    "moving-averages": { title: "移動平均線（Moving Averages）" },
    "fibonacci-retracements": { title: "フィボナッチ・リトレースメント" },
    "gann-basics": { title: "ギャン（Gann）理論の基礎（時間と価格）" },
    "central-bank-rates": { title: "中央銀行の政策金利" },
    "nfp-and-news-trading": { title: "雇用統計（NFP）とニュース・トレーディング" },
    "market-sentiment": { title: "市場センチメントの解釈（Market Sentiment）" },
    "position-sizing-math": { title: "ポジションサイジングの数学（Position Sizing）" },
    "risk-to-reward-ratio": { title: "リスクリワード比率（Risk-to-Reward）" },
    "trading-journal": { title: "トレード日記のつけ方" },
    "fomo-and-greed": { title: "FOMOと欲望（Greed）のコントロール" },
  },
  ko: {
    "inflation-reality": { title: "인플레이션의 현실(Inflation)" },
    "money-vs-fiat": { title: "돈 vs. 법정화폐(Fiat Currency)" },
    "fractional-reserve-banking": { title: "부분준비제도(Fractional Reserve Banking)" },
    "gold-vs-paper-money": { title: "금 vs. 지폐" },
    "candlestick-anatomy": { title: "캔들스틱(Candlestick)의 구조" },
    "bid-ask-spread": { title: "매수/매도 스프레드(Bid/Ask Spread)" },
    "pips-and-lot-sizes": { title: "핍과 랏 사이즈(Pips & Lot Sizes)" },
    "order-types": { title: "주문 유형: 시장가 vs. 제한가" },
    "support-resistance": { title: "지지와 저항 구간" },
    "rsi-indicator": { title: "RSI(상대강도지수)" },
    "moving-averages": { title: "이동평균선(Moving Averages)" },
    "fibonacci-retracements": { title: "피보나치 되돌림(Fibonacci Retracements)" },
    "gann-basics": { title: "갠(Gann) 이론 기초(시간과 가격)" },
    "central-bank-rates": { title: "중앙은행 기준금리" },
    "nfp-and-news-trading": { title: "비농업고용지수(NFP)와 뉴스 트레이딩" },
    "market-sentiment": { title: "시장 심리 해석(Market Sentiment)" },
    "position-sizing-math": { title: "포지션 사이징 계산법(Position Sizing)" },
    "risk-to-reward-ratio": { title: "리스크 대비 보상 비율(Risk-to-Reward)" },
    "trading-journal": { title: "매매일지 작성하기" },
    "fomo-and-greed": { title: "FOMO와 탐욕(Greed) 조절하기" },
  },
};

/**
 * Returns a level's localized {title, subtitle, description} for the
 * given language, falling back to the English original for "en" or
 * any language/level this dictionary doesn't (yet) cover. `title`
 * always comes from the English original — see the header comment on
 * why rank names intentionally stay untranslated.
 */
export function getLocalizedLevel(language, levelId, fallbackLevel) {
  const entry = ACADEMY_LEVELS_I18N[language]?.[levelId];
  return {
    title: fallbackLevel?.title,
    subtitle: entry?.subtitle || fallbackLevel?.subtitle,
    description: entry?.description || fallbackLevel?.description,
  };
}

/**
 * Returns a lesson's localized {title} for the given language, falling
 * back to the English original for "en" or any language/lesson this
 * dictionary doesn't (yet) cover.
 */
export function getLocalizedLesson(language, lessonId, fallbackLesson) {
  const entry = ACADEMY_LESSONS_I18N[language]?.[lessonId];
  return { title: entry?.title || fallbackLesson?.title };
}
