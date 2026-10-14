// lib/i18n/academyBody/urLatn.js
//
// Roman Urdu (ur-Latn — Urdu likhi gayi Latin/English script mein)
// full lesson-BODY translation pack — dekhen lib/i18n/academyBodyContent.js
// ka header comment exact scope ke liye (konse section fields translate
// hotay hain vs. English notation mein chhorey jaatay hain) aur yeh object
// kaise lib/academyData.js ke English lesson objects per merge hota hai.
// LessonId se keyed hai; har `sections` entry us lesson ke apne `sections`
// array se ARRAY INDEX se match hoti hai, aur har quiz question apni
// stable `id` se match hota hai.

export const ACADEMY_BODY_UR_LATN = {
  "inflation-reality": {
    sections: [
      {
        heading: "Aaj ka dollar kal kam kyun khareedta hai",
        body: "Inflation goods aur services ke general price level mein aik sustained rise hai — iska matlab hai ke currency ki har unit waqt ke sath thori kam cheez khareed sakti hai. Yeh koi glitch nahi hai; zyada tar modern economies mein yeh aik deliberate policy target hota hai (aam taur per 2% per year ke qareeb), kyunke central banks ka khayal hai ke mild aur predictable inflation cash hoard karne ke bajaye spending aur investment ko encourage karti hai.",
      },
      {
        heading: "Savings per khamosh tax",
        body: "Agar aap ki savings cash mein 0% earn kar rahi hain jabke prices 5% per year ki raftar se barh rahay hain, to aap ki real (inflation-adjusted) wealth kam ho jati hai chahe account mein number wohi rahay. Isi liye \"saving\" aur \"investing\" alag goals hain: saving nominal amount ko preserve karti hai, investing ka maqsad inflation rate ko beat karna hota hai.",
        list: [
          "Nominal value: note ya statement per likha number — khud se kabhi kam nahi hota.",
          "Real value: woh number asal mein kya khareed sakta hai — jab bhi inflation positive ho, yeh kam hoti hai.",
          "Purchasing power: real value ka doosra naam, aam taur per goods ki aik basket (Consumer Price Index) ke against track kiya jata hai.",
        ],
      },
      {
        body: "Sirf currency amounts nahi, waqt ke sath prices compare karein. \"Meri rent 5 saal mein sirf 20% barhi hai\" sunne mein theek lagta hai jab tak aap check nahi karte ke average wages ya CPI is se zyada ya kam barha.",
      },
      {
        label: "Real Return",
        note: "6% inflation ke doran 3% interest dene wala savings account aap ko har saal taqreeban 3% real purchasing power mein ganwa raha hota hai.",
      },
      {
        caption: "Wohi $100 note, 2% annual inflation rate per har guzarnay wali decade mein kam khareedta hai.",
      },
      {
        caption: "Try karein — dekhen ke past amount ne real purchasing power mein kitna erode kiya hai.",
      },
      {
        caption: "Try karein — monthly-contribution investment plan ko forward project karein aur dekhen ke yeh inflation se aage nikalta hai ya nahi.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "\"Inflation\" ka fundamentally kya matlab hai?",
          options: [
            { id: "a", text: "Interest rates barh rahi hain" },
            { id: "b", text: "Goods aur services ka general price level waqt ke sath barh raha hai" },
            { id: "c", text: "Stock market barh raha hai" },
            { id: "d", text: "Aik currency gold ke against devalue ho gayi hai" },
          ],
          explanation: "Inflation specifically general price level mein aik sustained rise hai — jo isi tarah hai jaise currency ki har unit ke khareedne ki quwwat mein kami.",
        },
        {
          id: "q2",
          prompt: "Aap ka savings account 2% interest per year deta hai jabke inflation 5% chal rahi hai. Aap ki real purchasing power ko kya ho raha hai?",
          options: [
            { id: "a", text: "Taqreeban 7% per year barh rahi hai" },
            { id: "b", text: "Unchanged hai, kyunke balance barhta hi rahta hai" },
            { id: "c", text: "Taqreeban 3% per year kam ho rahi hai" },
            { id: "d", text: "Sirf exchange rate per depend karti hai" },
          ],
          explanation: "Real Return ≈ Nominal Return − Inflation Rate, to 2% − 5% = −3%. Account mein number barhta hi rahta hai, magar yeh kya khareed sakta hai woh kam ho jata hai.",
        },
        {
          id: "q3",
          prompt: "\"Nominal value\" se kya murad hai:",
          options: [
            { id: "a", text: "Paisay ki inflation-adjusted buying power" },
            { id: "b", text: "Note per likha ya statement mein dikhaya gaya plain number" },
            { id: "c", text: "Paisay ki value kisi foreign currency mein" },
            { id: "d", text: "Currency ko support karne wale gold ki value" },
          ],
          explanation: "Nominal value sirf face amount hai — yeh khud se kabhi kam nahi hoti. Real value wohi amount hai jo adjust ki gayi ho ke yeh asal mein kya khareed sakti hai.",
        },
        {
          id: "q4",
          prompt: "Zyada tar central banks 0% ke bajaye aik small positive inflation rate (jaise 2%) kyun target karte hain?",
          options: [
            { id: "a", text: "Imports ko automatically sasta karne ke liye" },
            { id: "b", text: "Kyunke deflation (girtay prices) mathematically impossible hai" },
            { id: "c", text: "Cash hoard karne ko discourage karne aur spending/investment ko encourage karne ke liye" },
            { id: "d", text: "Koi real wajah nahi hai — yeh arbitrary hai" },
          ],
          explanation: "Mild, predictable inflation policy ke tor per widely use hoti hai kyunke yeh logon ko us cash per baithne ke bajaye, jo waise bhi value kho rahi hoti hai, spending aur investment ki taraf nudge karti hai.",
        },
        {
          id: "q5",
          prompt: "Goods ki aik basket jo das saal pehle $100 ki thi ab $122 ki hai. Prices kitne percent barhay hain, aur is se us poore waqt cash mein rakhay gaye $100 ke liye kya matlab hai?",
          options: [
            { id: "a", text: "Prices 22% barhay; wohi $100 ab pehle se kam basket khareedta hai" },
            { id: "b", text: "Prices 22% giray; $100 ab zyada khareedta hai" },
            { id: "c", text: "Prices unchanged hain; sirf wages matter karti hain" },
            { id: "d", text: "Is ka purchasing power per koi effect nahi" },
          ],
          explanation: "Isi basket ke liye $100 se $122 tak ka rise 22% cumulative inflation hai — wohi $100 ka note ab us basket ko cover karne mein kam reh jata hai.",
        },
      ],
    },
  },

  "money-vs-fiat": {
    sections: [
      {
        heading: "Kis cheez se koi shay \"money\" banti hai?",
        body: "Economists aam taur per is per agree karte hain ke money teen kaam achay se karni chahiye: medium of exchange ke tor per serve karna (log goods/services ke badle isay accept karein), store of value (waqt ke sath apni worth rakhay), aur unit of account (prices meaningfully isi mein quote ho sakein). Historically gold, silver, salt, aur bari stone discs jaisi cheezen bhi mukhtalif had tak money ke tor per serve karti rahi hain.",
      },
      {
        heading: "Fiat currency: decree se banii hui money",
        body: "\"Fiat\" Latin ke us lafz se aaya hai jiska matlab hai \"let it be done\". Fiat currency (jaise aaj ka US Dollar, Euro, ya Pakistani Rupee) ki value is liye hai kyunke government isay legal tender declare karti hai aur log trust karte hain ke yeh accepted rehti rahegi — na ke is liye ke yeh kisi physical commodity ki fixed amount se backed hai. 1971 se, jab US ne dollar ki gold mein convertibility khatam ki (\"Nixon Shock\"), taqreeban har major world currency fiat ban gayi hai.",
        list: [
          "Commodity money: value material se khud aati hai (aik gold coin ki value taqreeban us ke gold content jitni hoti hai).",
          "Representative money: paper claim jo kisi commodity ki fixed amount ke badle redeemable ho (purana gold certificate).",
          "Fiat money: value government decree aur public trust/confidence se aati hai — kisi redeemable commodity se backed nahi.",
        ],
      },
      {
        body: "Fiat currency ki sabse bari strength (central banks crisis ke jawab mein money supply ko tezi se expand ya contract kar saktay hain) hi uski long-run ki sabse bari weakness bhi hai (wohi flexibility gradual currency devaluation ko structurally easy bana deti hai).",
      },
      {
        caption: "\"Yeh kagaz ka tukra kyun qeemti hai?\" ke do bohat mukhtalif jawab.",
      },
      {
        label: "Converter mein live fiat currency rates dekhen",
        note: "Dekhen ke kaise aik fiat currency ki value doosron ke against — aur gold ke against — real time mein float karti hai.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "In mein se kaunsa money ke teen classic functions mein se NAHI hai jo money ko serve karni chahiye?",
          options: [
            { id: "a", text: "Medium of exchange" },
            { id: "b", text: "Store of value" },
            { id: "c", text: "Unit of account" },
            { id: "d", text: "Fixed interest rate ki guarantee" },
          ],
          explanation: "Teen classic functions hain medium of exchange, store of value, aur unit of account. Interest rates aik alag monetary-policy concept hain, money ki defining function nahi.",
        },
        {
          id: "q2",
          prompt: "US Dollar jaisi fiat currency ko aaj value kya deti hai?",
          options: [
            { id: "a", text: "Central bank ke paas gold ki fixed, redeemable amount" },
            { id: "b", text: "Government decree (legal tender status) aur public trust/confidence" },
            { id: "c", text: "Iska silver mein weight" },
            { id: "d", text: "Bitcoin ke sath fixed exchange rate" },
          ],
          explanation: "Fiat currency government decree aur public ke is confidence se backed hai ke yeh accepted rehti rahegi — na ke kisi redeemable commodity se.",
        },
        {
          id: "q3",
          prompt: "Kaunsa historical event aam taur per US Dollar ki gold mein direct convertibility khatam karne ki wajah ke tor per quote hota hai?",
          options: [
            { id: "a", text: "2008 ki financial crisis" },
            { id: "b", text: "1944 ka Bretton Woods Agreement" },
            { id: "c", text: "1971 ka \"Nixon Shock\"" },
            { id: "d", text: "Euro ki creation" },
          ],
          explanation: "1971 mein, President Nixon ne dollar ki gold mein convertibility suspend ki, jis se effectively US (aur jald hi baqi duniya) aik fully fiat system per chali gayi.",
        },
        {
          id: "q4",
          prompt: "Fiat currency systems se aam taur per associated main structural risk kya hai?",
          options: [
            { id: "a", text: "Central banks economic crises per tezi se respond nahi kar saktay" },
            { id: "b", text: "Money supply relatively aasani se expand ho sakti hai, jis se devaluation/inflation ka risk hota hai" },
            { id: "c", text: "Yeh international trade ke liye kabhi use nahi ho sakti" },
            { id: "d", text: "Isay hamesha physically print hona zaroori hai, digital form nahi ho sakti" },
          ],
          explanation: "Kyunke fiat supply kisi fixed physical commodity se anchored nahi hoti, yeh policy decisions se expand ho sakti hai — jo crisis mein flexible hai, magar commodity-backed system ke mukablay structurally gradual devaluation ko aasan banata hai.",
        },
        {
          id: "q5",
          prompt: "Aik purana paper note jo physically bank mein gold ki fixed amount ke badle exchange ho sakta tha, yeh kis ki example hai:",
          options: [
            { id: "a", text: "Fiat money" },
            { id: "b", text: "Representative money" },
            { id: "c", text: "Cryptocurrency" },
            { id: "d", text: "Aik derivative contract" },
          ],
          explanation: "Yeh representative money hai — paper claim jo kisi commodity ki fixed quantity ke badle redeemable ho, pure commodity money aur fiat money se dono alag.",
        },
      ],
    },
  },

  "fractional-reserve-banking": {
    sections: [
      {
        heading: "Aap ki deposit sirf vault mein nahi baithi hoti",
        body: "Jab aap bank mein $1,000 deposit karte hain, bank isay vault mein lock karke aap ke withdraw karne ka intezar nahi karta. Fractional reserve banking ke under, yeh sirf aik fraction reserve ke tor per rakhta hai aur baqi loan per de deta hai, un loans per interest earn karta hai. Historically regulators aik specific minimum reserve ratio set karte thay; practically, modern frameworks (jaise US ka post-2020 approach) aksar single fixed reserve ratio se zyada capital aur liquidity requirements per rely karte hain, magar core mechanism — banks jo deposit hua uska zyada tar loan per dena — unchanged hai.",
      },
      {
        heading: "Yeh naya paisa kaise banata hai",
        body: "Woh loan per diya gaya paisa aam taur per spend ho kar banking system mein wapis deposit ho jata hai, jahan receiving bank us ka bhi zyada tar hissa loan per de deta hai. Poore system mein repeat hote hote, yeh process original deposit ko total circulating money ki aik bohat bari amount mein multiply kar deta hai — bina koi naya banknote print kiye.",
        list: [
          "Aap $1,000 deposit karte hain. Bank aik reserve rakhta hai aur baqi loan per de deta hai.",
          "Borrower isay spend karta hai; receiver isay (ho sakta hai) kisi doosray bank mein deposit karta hai.",
          "Woh bank phir aik reserve rakhta hai aur baqi loan per deta hai — aur cycle repeat hota rehta hai.",
          "Total money creation ki theoretical ceiling taqreeban original deposit ko reserve ratio se divide karne jaisi hoti hai.",
        ],
      },
      {
        label: "Simple Money Multiplier",
        note: "10% reserve ratio per, $1,000 ki deposit theoretically system-wide $10,000 tak total deposits ko support kar sakti hai. Real-world figures cash holdings, excess reserves, aur loan demand ki wajah se usually kam hoti hain.",
      },
      {
        body: "Isi wajah se \"bank run\" (jab sab aik sath withdraw karne ki koshish karen) khatarnak hota hai: bank waqai sab ka full deposit aik hi waqt per cash mein nahi rakhta — bohat sa hissa loans ke tor per bahar hota hai.",
      },
      {
        caption: "Kaise aik deposit banking system mein ripple karti hai, effective money supply ko expand karte hue.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Fractional reserve banking ke under, bank customer ki deposit ke zyada tar hisse ke sath kya karta hai?",
          options: [
            { id: "a", text: "Isay 100% vault mein rakhta hai" },
            { id: "b", text: "Interest earn karne ke liye zyada tar loan per de deta hai, sirf aik fraction reserve ke tor per rakhta hai" },
            { id: "c", text: "Isay mukammal tor per gold mein convert kar deta hai" },
            { id: "d", text: "Isay permanently seedha central bank ko bhej deta hai" },
          ],
          explanation: "Fractional reserve banking ka matlab hai sirf deposits ka aik fraction reserve ke tor per rakha jata hai; baqi loan per de diya jata hai, jo bank ke interest income ka zariya hai.",
        },
        {
          id: "q2",
          prompt: "10% reserve ratio per, real-world leakages ko consider karne se pehle, aik single $1,000 deposit taqreeban kitna total system-wide money theoretically support kar sakti hai?",
          options: [
            { id: "a", text: "$1,000" },
            { id: "b", text: "$1,100" },
            { id: "c", text: "$10,000" },
            { id: "d", text: "$100,000" },
          ],
          explanation: "Simple Money Multiplier ≈ Initial Deposit ÷ Reserve Ratio = $1,000 ÷ 0.10 = $10,000 bataur theoretical ceiling.",
        },
        {
          id: "q3",
          prompt: "Fractional reserves per operate karne wale bank ke liye aik sudden \"bank run\" kyun khatarnak ho sakta hai?",
          options: [
            { id: "a", text: "Banks legally run ke doran sab withdrawals refuse karne ke liye obliged hain" },
            { id: "b", text: "Bank aik hi waqt per sab ka full deposit cash mein nahi rakhta — zyada tar loans ke tor per bahar hota hai" },
            { id: "c", text: "Bank runs hamesha ghanton mein hyperinflation cause karti hain" },
            { id: "d", text: "Is ka koi real effect nahi; reserves hamesha 100% deposits cover karti hain" },
          ],
          explanation: "Kyunke zyada tar deposited money loan per di jati hai, aik bank waqai turant 100% sab deposits cash mein wapis nahi kar sakta agar sab aik sath yeh demand karen.",
        },
        {
          id: "q4",
          prompt: "Deposit-expansion cycle mein, borrower ke loan spend karne ke theek baad aam taur per kya hota hai?",
          options: [
            { id: "a", text: "Paisa permanently banking system se bahar chala jata hai" },
            { id: "b", text: "Yeh usually banking system mein kahin dobara deposit ho jata hai, jo lending ka aik further round enable karta hai" },
            { id: "c", text: "Isay central bank destroy kar deta hai" },
            { id: "d", text: "Isay foreign currency mein convert karna zaroori hai" },
          ],
          explanation: "Spent loan proceeds usually dobara deposit ho jatay hain (jis ne woh paisa receive kiya us se), jis se woh receiving bank zyada tar hissa loan per dene ka process repeat kar sakta hai.",
        },
        {
          id: "q5",
          prompt: "Many modern banking regulatory frameworks ne bank safety ke approach mein, aik single fixed reserve ratio se aage, general tor per kya shift dikhaya hai?",
          options: [
            { id: "a", text: "Aik single fixed ratio ke sath/ke bajaye capital aur liquidity requirements per barhti reliance" },
            { id: "b", text: "Har reserve ya capital requirement ka mukammal khatma" },
            { id: "c", text: "Har jagah 100% gold-backed reserve requirement ki taraf wapsi" },
            { id: "d", text: "Banks ko reserves sirf cryptocurrency mein rakhne ki requirement" },
          ],
          explanation: "Bohat se modern frameworks (jaise US ka post-2020 approach) aik historical single reserve ratio se zyada capital adequacy aur liquidity coverage requirements per lean karte hain, chahe core fractional-lending mechanism waisa hi rehta hai.",
        },
      ],
    },
  },

  "gold-vs-paper-money": {
    sections: [
      {
        heading: "Gold ne hazaron saal apni value kyun rakhi hai",
        body: "Gold tahreeban har major civilization mein hazaron saal se money ya store of value ke tor per use hota raha hai. Yeh scarce, almost indestructible, divisible, aur zyada produce karna costly hai — yeh properties isay paper currency se bohat pehle aik natural \"hard money\" bana dein. Aik fiat note ke bar-khilaf, gold ki value kisi single government ke promise per depend nahi karti.",
      },
      {
        heading: "Phir bhi paper money kyun jeeta",
        body: "Gold ki store-of-value ki durability ke bawajood, daily transactions ke liye physical gold carry aur verify karna impractical hai. Paper currency (aur baad mein digital balances) ne convenience ke problem ko solve kiya: yeh light hai, exact amounts mein divide karna aasan hai, aur chandon second mein poori duniya mein electronically move karna aasan hai — yeh trade-offs gold inherently match nahi kar sakta.",
        list: [
          "Gold: scarce, durable, historically trusted — magar heavy, precisely divide karna mushkil, physically transact karna slow.",
          "Paper/fiat: convenient, instantly transferable, programmable — magar iska supply expand ho sakta hai, jis se inflation risk hota hai.",
          "Aaj kal bohat se investors specifically inflation/currency-devaluation hedge ke tor per thora gold rakhte hain, daily spending money ke tor per nahi.",
        ],
      },
      {
        body: "Isi wajah se is platform per Metals & Commodities Calculator maujood hai — gold/silver pricing troy ounce per quote hoti hai aur aap ki local currency aur weight unit mein convert ki jati hai, jo gold ko store of value ke tor per sochne ka real-world starting point hai.",
      },
      {
        caption: "Try karein: gold, silver, platinum, palladium ya copper ki live price apni preferred weight unit aur currency mein dekhen.",
      },
      {
        caption: "Koi bhi strictly \"behtar\" nahi hai — yeh mukhtalif problems solve karte hain. Bohat se portfolios dono use karte hain.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Kaunsi property ne gold ko history mein money ya store of value ke tor per useful banaya hai?",
          options: [
            { id: "a", text: "Yeh demand per aasani se mass-produce ho sakta hai" },
            { id: "b", text: "Yeh scarce, durable, aur divisible hai" },
            { id: "c", text: "Iski value aik single government set karti hai" },
            { id: "d", text: "Yeh tezi se degrade hota hai, spending ko encourage karte hue" },
          ],
          explanation: "Gold ki scarcity, durability, aur divisibility (plus zyada produce karna costly hona) exactly wajah hai ke yeh fiat currency se bohat pehle aik trusted store of value ban gaya.",
        },
        {
          id: "q2",
          prompt: "Daily transactions ke liye paper/digital money ke mukablay gold ka main practical disadvantage kya hai?",
          options: [
            { id: "a", text: "Iski koi value nahi hai" },
            { id: "b", text: "Yeh heavy hai, precisely divide karna mushkil hai, aur physically transact karna slow hai" },
            { id: "c", text: "Yeh sirf aik country mein use ho sakta hai" },
            { id: "d", text: "Zyada tar countries mein isay rakhna illegal hai" },
          ],
          explanation: "Gold ki physical properties isay fast, daily spending ke liye impractical banati hain — yahi gap paper aur digital currency ne fill kiya.",
        },
        {
          id: "q3",
          prompt: "Fiat currency ki duniya mein bhi, bohat se investors specifically gold ko hedge ke tor per kyun rakhte hain?",
          options: [
            { id: "a", text: "Gold aik fixed annual return guarantee karta hai" },
            { id: "b", text: "Iska supply fiat currency supply jaisa expand nahi ho sakta, jo historically purchasing power preserve karne mein help karta hai" },
            { id: "c", text: "Gold cash se spend karna aasan hai" },
            { id: "d", text: "Yeh sab investment risk khatam kar deta hai" },
          ],
          explanation: "Gold ka fixed, expand karna mushkil supply usko currency devaluation aur inflation ke against hedge ke tor per use karne ki core wajah hai, na ke yeh koi guaranteed return deta hai.",
        },
        {
          id: "q4",
          prompt: "Is platform ke Metals & Commodities Calculator mein, gold aur silver prices kis unit mein quote hoti hain?",
          options: [
            { id: "a", text: "Troy ounce" },
            { id: "b", text: "Barrel" },
            { id: "c", text: "Sirf metric ton" },
            { id: "d", text: "Sirf carat" },
          ],
          explanation: "Is platform per precious metals (gold, silver, platinum, palladium, copper) troy ounce per priced hain, phir aap ki choice ki weight unit aur currency mein convert hoti hain.",
        },
        {
          id: "q5",
          prompt: "Gold aur paper money ke trade-off ko kaunsa statement best summarize karta hai?",
          options: [
            { id: "a", text: "Gold har situation mein hamesha fiat currency se strictly superior hai" },
            { id: "b", text: "Fiat currency har situation mein hamesha gold se strictly superior hai" },
            { id: "c", text: "Yeh mukhtalif problems solve karte hain — gold long-term store of value ke tor per, fiat daily convenience aur liquidity ke liye" },
            { id: "d", text: "Dono mein koi meaningful farq nahi hai" },
          ],
          explanation: "Koi bhi outright nahi jeetta — gold ki strength bina counterparty risk ke long-term value preservation hai, jabke fiat ki strength daily transactions ke liye convenience aur liquidity hai.",
        },
      ],
    },
  },

  "candlestick-anatomy": {
    sections: [
      {
        heading: "Aik candle, chaar prices",
        body: "Aik candlestick chuna hua time period (aik minute, aik hour, aik din — jo bhi chart ka \"timeframe\" set ho) chaar numbers se summarize karti hai: Open, High, Low, aur Close (aksar OHLC kaha jata hai). Thick part \"body\" hoti hai (open aur close ke darmiyan ka range); upar aur neechay thin lines \"wicks\" ya \"shadows\" hoti hain (us period mein pahuncha gaya full high/low range).",
      },
      {
        heading: "Bullish vs. bearish",
        body: "Agar close open se zyada ho, to candle bullish hoti hai (us period mein price barha) — typically green ya white, hollow/unfilled dikhayi jati hai. Agar close open se kam ho, to yeh bearish hoti hai (price gira) — typically red ya black, filled solid dikhayi jati hai. Color convention zyada tar platforms per customize ho sakti hai, magar green=up / red=down sab se common default hai.",
        list: [
          "Open: period ki pehli traded price",
          "High: period ki sab se zyada traded price",
          "Low: period ki sab se kam traded price",
          "Close: period ki aakhri traded price",
          "Body: Open aur Close ke darmiyan ka box",
          "Wick/Shadow: thin line(s) jo body se aage High aur Low dikhati hain",
        ],
      },
      {
        body: "Candle ki aik side per lambi wick aik story batati hai: price us direction mein strongly push hui, phir reject ho kar period ke end tak wapis khinch gayi — aksar us level per buyer/seller struggle ki nishani hoti hai.",
      },
      {
        caption: "Aik bullish candle: close open se upar hai, is liye body unfilled/green hai, wicks full high/low range dikhati hain.",
      },
      {
        caption: "Aik bearish candle: close open se neeche hai, is liye body filled/red hai.",
      },
      {
        label: "Market Analysis per live candlestick charts parhen",
        note: "Kisi bhi symbol ke liye full interactive TradingView chart khol kar yeh candle patterns real, live chart per spot karen.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Aik single candlestick kaunsi chaar prices represent karti hai?",
          options: [
            { id: "a", text: "Open, High, Low, Close" },
            { id: "b", text: "Bid, Ask, Spread, Volume" },
            { id: "c", text: "Support, Resistance, Pivot, Trend" },
            { id: "d", text: "Open, Close, Volume, Spread" },
          ],
          explanation: "Candlestick apne time period ki Open, High, Low, aur Close (OHLC) prices se banti hai.",
        },
        {
          id: "q2",
          prompt: "Aik candle wahan se UPAR close hoti hai jahan se woh open hui. Yeh kaunsi candle hai?",
          options: [
            { id: "a", text: "Bearish" },
            { id: "b", text: "Bullish" },
            { id: "c", text: "Sirf neutral/Doji" },
            { id: "d", text: "Sirf isi se determine nahi ho sakta" },
          ],
          explanation: "Close Open se upar hona matlab hai us period mein price barhi — yehi bullish candle ki definition hai, conventionally green/unfilled dikhayi jati hai.",
        },
        {
          id: "q3",
          prompt: "Candlestick ka \"body\" kya represent karta hai?",
          options: [
            { id: "a", text: "High aur Low ke darmiyan ka full range" },
            { id: "b", text: "Open aur Close ke darmiyan ka range" },
            { id: "c", text: "Period ki average price" },
            { id: "d", text: "Us period ka trading volume" },
          ],
          explanation: "Body specifically Open-to-Close range hai; body se aage High/Low range wicks/shadows se dikhaya jata hai.",
        },
        {
          id: "q4",
          prompt: "Aik small body ke sath lambi upper wick typically us period mein kya hone ki suggest karti hai?",
          options: [
            { id: "a", text: "Price strongly upar push hui, phir reject ho kar close tak wapis aa gayi" },
            { id: "b", text: "Koi trading activity nahi hui" },
            { id: "c", text: "Close us period ki highest price thi" },
            { id: "d", text: "Yeh guarantee karti hai ke next candle bullish hogi" },
          ],
          explanation: "Lambi upper wick ka matlab hai price body ki top se bohat upar pahunchi, phir close tak wapis push hui — us higher level per rejection/selling pressure ki nishani.",
        },
        {
          id: "q5",
          prompt: "Zyada tar charting platforms per, bearish (down) candle ka default color convention kya hai?",
          options: [
            { id: "a", text: "Green ya white, unfilled" },
            { id: "b", text: "Red ya black, filled" },
            { id: "c", text: "Blue, striped" },
            { id: "d", text: "Koi common convention nahi hai" },
          ],
          explanation: "Red/black filled bearish candle (close open se neeche) ka sab se common default hai, chahe yeh zyada tar platforms per customizable hai.",
        },
      ],
    },
  },

  "bid-ask-spread": {
    sections: [
      {
        heading: "Do prices, hamesha",
        body: "Har tradable instrument ki asal mein aik hi waqt per do live prices hoti hain: Bid (sab se zyada price jo aik buyer abhi dene ke liye willing hai — agar abhi bechen to aap ko yeh milegi) aur Ask/Offer (sab se kam price jo aik seller abhi accept karne ke liye willing hai — agar abhi khareedein to aap yeh denge). Ask hamesha Bid ke equal ya us se zyada hoti hai.",
      },
      {
        heading: "Spread aik built-in cost hai",
        body: "Ask aur Bid ka farq spread hai — effectively aik transaction cost jo us ko di jati hai jo liquidity provide karta hai (aik broker ya market maker), yeh kisi commission se alag hoti hai. Jis moment aap position khol tay hain, aap already spread ke size jitna thora \"underwater\" hotay hain, kyunke aap (higher) Ask per khareedte hain aur turant close karne ke liye (lower) Bid per bechna parega.",
        list: [
          "Bid: wo price jis per aap SELL karte hain",
          "Ask (Offer): wo price jis per aap BUY karte hain",
          "Spread = Ask − Bid",
          "Tight spreads = generally zyada liquid markets (jaise EUR/USD); wide spreads = typically kam liquid ya zyada volatile instruments",
        ],
      },
      {
        label: "Spread Cost",
        note: "1.0850 / 1.0852 ka EUR/USD quote 2-pip spread rakhta hai — iska matlab hai pair ko entry per breakeven karne ke liye aap ke favor mein sirf 2 pips move karna parega.",
      },
      {
        body: "Low-liquidity periods ke doran spreads wide ho jatay hain — major news releases, market opens/closes, aur holidays. Aik strategy jo normal 1-pip spread per theek chalti hai, news spike ke doran agar spreads 5-10 pips tak balloon ho jayen to apni edge khamoshi se kho sakti hai.",
      },
      {
        caption: "Jo aap bech saktay hain (Bid) aur jo khareed saktay hain (Ask) ke darmiyan ka gap spread hai.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "\"Bid\" price kya hai?",
          options: [
            { id: "a", text: "Wo price jo aap abhi khareedne ke liye dengay" },
            { id: "b", text: "Sab se zyada price jo aik buyer currently dene ke liye willing hai (abhi bechne par aap ko yeh milegi)" },
            { id: "c", text: "Pichli 10 trades ka average" },
            { id: "d", text: "Government ka fixed exchange rate" },
          ],
          explanation: "Bid wo price hai jis per aap turant bech saktay hain — sab se zyada jo koi buyer currently offer kar raha hai.",
        },
        {
          id: "q2",
          prompt: "EUR/USD 1.0850 / 1.0853 per quote hai. Pips mein spread kya hai?",
          options: [
            { id: "a", text: "0 pips" },
            { id: "b", text: "3 pips" },
            { id: "c", text: "30 pips" },
            { id: "d", text: "0.3 pips" },
          ],
          explanation: "Spread = Ask − Bid = 1.0853 − 1.0850 = 0.0003, jo 4 decimal places per quoted pair per 3 pips hai.",
        },
        {
          id: "q3",
          prompt: "Nayi trade kholna aap ko turant chhoti notional loss mein kyun daal deta hai?",
          options: [
            { id: "a", text: "Aap (higher) Ask per khareedte hain, magar turant close karne ke liye (lower) Bid per bechna parega — wo gap spread hai" },
            { id: "b", text: "Sab brokers mandatory loss fee charge karte hain" },
            { id: "c", text: "Aisa nahi hota — trades hamesha breakeven per open hoti hain" },
            { id: "d", text: "Yeh sirf stock trades ke liye true hai, forex ke liye kabhi nahi" },
          ],
          explanation: "Kyunke aap Ask per khareedte hain aur Bid per bechte hain, spread effectively pehle hi pay ho jata hai — breakeven tak pahunchnay se pehle price ko aap ke favor mein kam az kam spread ke size jitna move karna hota hai.",
        },
        {
          id: "q4",
          prompt: "Spreads typically sab se zyada kab wide hotay hain?",
          options: [
            { id: "a", text: "Sab se calm, sab se liquid trading hours ke doran" },
            { id: "b", text: "Major news releases, market opens/closes, aur holidays ke doran — lower-liquidity periods" },
            { id: "c", text: "Spreads hamesha perfectly fixed hotay hain aur kabhi change nahi hotay" },
            { id: "d", text: "Sirf weekends per jab markets closed hotay hain" },
          ],
          explanation: "Big news events, session opens/closes, aur holidays ke around kam liquidity exactly wo waqt hai jab spreads sab se zyada wide hote hain.",
        },
        {
          id: "q5",
          prompt: "Aap generally kis pair se tighter typical spread expect karenge?",
          options: [
            { id: "a", text: "EUR/USD jaisa highly liquid major pair" },
            { id: "b", text: "Aik thinly-traded exotic currency pair" },
            { id: "c", text: "Spreads liquidity se unrelated hain" },
            { id: "d", text: "Yeh har pair mein hamesha identical hotay hain" },
          ],
          explanation: "Zyada liquid instruments (jaise EUR/USD, duniya ka sab se zyada traded pair) generally thinly-traded exotics se tighter spreads rakhte hain.",
        },
      ],
    },
  },

  "pips-and-lot-sizes": {
    sections: [
      {
        heading: "Pip kya hai?",
        body: "Aik \"pip\" (Percentage In Point) zyada tar forex pairs ke liye standard smallest meaningful price increment hai — typically 4th decimal place (jaise, EUR/USD ka 1.0850 se 1.0851 tak move hona 1-pip move hai). Yen pairs main exception hain, kyunke yeh sirf 2 decimal places per quote hotay hain, jis se 2nd decimal pip ban jata hai (jaise, USD/JPY 150.25 se 150.26).",
      },
      {
        heading: "Lot sizes: aap actually kitna trade kar rahay hain",
        body: "\"Lot\" aik standardized trade size hai. Standard Lot base currency ke 100,000 units hotay hain; Mini Lot 10,000 units (1/10th) hota hai; Micro Lot 1,000 units (1/100th) hota hai. Jo lot size aap trade karte hain, yeh directly determine karta hai ke aap ke liye har pip movement ki qeemat kya hai.",
        list: [
          "Standard Lot = 100,000 units → zyada tar USD-quoted pairs per taqreeban $10/pip",
          "Mini Lot = 10,000 units → taqreeban $1/pip",
          "Micro Lot = 1,000 units → taqreeban $0.10/pip",
          "Exact pip value pair aur aap ke account ki quote currency se thori alag hoti hai.",
        ],
      },
      {
        label: "Approximate Pip Value (USD-quoted pairs)",
        note: "4 decimals per quoted pair per aik standard lot (100,000 units) ke liye, 1 pip (0.0001) × 100,000 = $10 per pip. Micro lot (1,000 units) → $0.10 per pip.",
      },
      {
        body: "Beginners direction ke bare mein \"wrong\" hone se zyada oversized lots ki wajah se accounts blow up karte hain. Aik correct trade jis ka lot size account ke liye bohat bara ho, aik normal pullback per bhi aap ko wipe out kar sakti hai.",
      },
      {
        caption: "Wohi 1-pip price move aap ke lot size ke hisaab se bohat mukhtalif amounts ki worth hoti hai.",
      },
      {
        caption: "Try karein: suggested lot size paane ke liye apna account balance, risk %, aur stop-loss distance enter karen.",
      },
      {
        caption: "Try karein: dekhen ke aik given quote currency aur lot size ke liye aik pip USD aur PKR mein asal mein kitni worth hai.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Aik standard EUR/USD quote (4 decimal places) per, 1.0850 se 1.0851 tak move hona kya hai:",
          options: [
            { id: "a", text: "1 pip" },
            { id: "b", text: "10 pips" },
            { id: "c", text: "0.1 pip" },
            { id: "d", text: "Sirf 1 point, pip nahi" },
          ],
          explanation: "Aik standard pair per 4th decimal place mein change exactly 1 pip hota hai.",
        },
        {
          id: "q2",
          prompt: "USD/JPY jaisi Japanese Yen pairs per pip measurement mein kya khaas hai?",
          options: [
            { id: "a", text: "Yen pairs mein pips bilkul nahi hotay" },
            { id: "b", text: "Yen pairs 2 decimal places per quote hotay hain, is liye pip 2nd decimal hota hai, 4th nahi" },
            { id: "c", text: "Yen pairs aik mukammal mukhtalif currency unit use karte hain" },
            { id: "d", text: "Yen pairs per pip value hamesha $100 hoti hai" },
          ],
          explanation: "Kyunke Yen pairs sirf 2 decimal places per quote hotay hain, wahan 1 pip 2nd decimal mein move hai (jaise 150.25 → 150.26), 4th mein nahi.",
        },
        {
          id: "q3",
          prompt: "Forex mein aik Standard Lot kitne units hota hai?",
          options: [
            { id: "a", text: "1,000 units" },
            { id: "b", text: "10,000 units" },
            { id: "c", text: "100,000 units" },
            { id: "d", text: "1,000,000 units" },
          ],
          explanation: "Standard Lot base currency ke 100,000 units hotay hain — Mini Lot ka 10x, Micro Lot ka 100x.",
        },
        {
          id: "q4",
          prompt: "USD-quoted pair per 1 Micro Lot (1,000 units) trade karte hue, har pip taqreeban kitni worth hai?",
          options: [
            { id: "a", text: "≈ $10" },
            { id: "b", text: "≈ $1" },
            { id: "c", text: "≈ $0.10" },
            { id: "d", text: "≈ $100" },
          ],
          explanation: "Pip Value ≈ Lot Size × Pip Size = 1,000 × 0.0001 = $0.10 per pip Micro Lot ke liye.",
        },
        {
          id: "q5",
          prompt: "Is lesson ke mutabiq, beginner traders apne accounts blow up karne ki sab se common wajah kya hai?",
          options: [
            { id: "a", text: "Market direction ke bare mein hamesha wrong hona" },
            { id: "b", text: "Account ke liye bohat bara lot size trade karna, jis se aik normal pullback bhi outsized losses cause karta hai" },
            { id: "c", text: "Sirf news events ke doran trade karna" },
            { id: "d", text: "Bohat zyada indicators use karna" },
          ],
          explanation: "Account size ke mukablay oversized lot sizes classic account-killer hain — agar position size bohat bara ho to directionally correct trades bhi account ko wipe out kar sakti hain.",
        },
      ],
    },
  },

  "order-types": {
    sections: [
      {
        heading: "Market orders: price se zyada speed",
        body: "Market Order immediately currently available best price per execute hoti hai. Aap ko instant fill guaranteed hai, magar koi exact price guaranteed nahi — fast-moving ya illiquid conditions mein, aap ko click karte waqt dekhi gayi price se thori worse price per \"slip\" kiya ja sakta hai.",
      },
      {
        heading: "Limit orders: speed se zyada price",
        body: "Limit Order sirf aap ki specified price ya us se behtar per execute hoti hai — yeh worse price per fill nahi hogi, magar agar market aap ke level tak kabhi na pahunchi to yeh shayad kabhi fill na ho. Buy Limit current price ke neeche set hoti hai (sasti khareedna); Sell Limit current price ke upar set hoti hai (zyada qeemat per bechna).",
        list: [
          "Market Order: ABHI fill hoti hai, jo bhi current price ho — speed guaranteed, price guaranteed nahi.",
          "Limit Order: sirf AAP ki price ya us se behtar per fill hoti hai — price guaranteed, fill guaranteed nahi.",
          "Stop Order: price jab trigger level tak pahunch jaye to yeh market order ban jati hai — aksar breakout entries ya stop-losses ke liye use hoti hai.",
          "Stop-Limit Order: trigger level hit hone per yeh limit order (market nahi) ban jati hai — dono behaviors combine karti hai.",
        ],
      },
      {
        body: "Jab aap ko ABHI in/out hona ho (jaise losing trade jaldi close karna) to Market Order use karen. Jab aap ke paas specific price target ho aur aap trade miss karna behtar samjhein bajaye us ke liye worse price pay karne se, to Limit Order use karen.",
      },
      {
        caption: "Limit orders current price se door rakhi jati hain, market ke un tak aane ka intezar karte hue.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Market Order kya guarantee karti hai?",
          options: [
            { id: "a", text: "Exact price, magar fast fill nahi" },
            { id: "b", text: "Immediate fill, magar exact price nahi" },
            { id: "c", text: "Dono exact price AUR immediate fill, hamesha" },
            { id: "d", text: "Dono mein se koi nahi — yeh purely theoretical hai" },
          ],
          explanation: "Market orders speed ko priority dete hain: yeh turant currently available best price per fill hoti hain, jo aap ne thori der pehle dekhi gayi price se thora alag ho sakti hai (slippage).",
        },
        {
          id: "q2",
          prompt: "Aap current market price se neeche Buy Limit order place karte hain. Agar price us level tak kabhi na girey to kya hota hai?",
          options: [
            { id: "a", text: "Yeh waise bhi automatically current market price per fill ho jati hai" },
            { id: "b", text: "Order simply kabhi fill nahi hoti" },
            { id: "c", text: "Yeh requested price ke double per fill hoti hai" },
            { id: "d", text: "Yeh situation definition se impossible hai" },
          ],
          explanation: "Limit order sirf aap ki specified price ya us se behtar per fill hoti hai — agar market us tak kabhi na pahunchi to order simply unfilled baithi rehti hai (jab tak cancel na ho ya expire na ho).",
        },
        {
          id: "q3",
          prompt: "Market aur Limit orders ke darmiyan key trade-off kya hai?",
          options: [
            { id: "a", text: "Market orders price guarantee karti hain magar no fill ka risk hota hai; Limit orders fill guarantee karti hain magar worse price ka risk hota hai" },
            { id: "b", text: "Market orders fast fill guarantee karti hain magar exact price nahi; Limit orders price guarantee karti hain magar fill hona guarantee nahi" },
            { id: "c", text: "Koi trade-off nahi hai; yeh identical behave karte hain" },
            { id: "d", text: "Limit orders har situation mein hamesha behtar hoti hain" },
          ],
          explanation: "Yeh core trade-off hai: Market = speed guaranteed, price guaranteed nahi. Limit = price guaranteed (ya behtar), fill guaranteed nahi.",
        },
        {
          id: "q4",
          prompt: "Stop Order ka trigger price pahunchne ke baad yeh kya ban jati hai?",
          options: [
            { id: "a", text: "Aik market order" },
            { id: "b", text: "Aik cancelled order" },
            { id: "c", text: "Aik guaranteed-fill limit order" },
            { id: "d", text: "Iska koi effect nahi hota" },
          ],
          explanation: "Stop Order dormant baithi rehti hai jab tak price trigger level tak na pahunchay, is point per yeh market order mein convert ho jati hai aur next available price per fill hoti hai.",
        },
        {
          id: "q5",
          prompt: "Trader typically Limit Order se zyada Market Order kab prefer karega?",
          options: [
            { id: "a", text: "Jab unka koi bohat specific price target ho aur trade mukammal miss ho jaye to unhe farq na parta ho" },
            { id: "b", text: "Jab unhe abhi position mein enter ya exit hona ho aur speed exact price se zyada matter karti ho" },
            { id: "c", text: "Market orders kabhi position close karne ke liye use nahi ho saktay" },
            { id: "d", text: "Sirf weekends per trading karte waqt" },
          ],
          explanation: "Market orders specifically wahan right tool hain jab exact price nikalnay se zyada immediacy matter karti ho — jaise aik losing position urgently close karna.",
        },
      ],
    },
  },

  "support-resistance": {
    sections: [
      {
        heading: "Market ke invisible floors aur ceilings",
        body: "Support aik price level (ya zone) hai jahan buying pressure historically kaafi strong rahi hai ke decline ko rok kar price ko wapis upar push kar dey. Resistance iska mirror image hai — aik level jahan selling pressure historically advance ko rok kar price ko wapis neeche push karti rahi hai. Yeh levels is liye banti hain kyunke traders yaad rakhte hain ke price pehle wahan react kar chuki hai, aur us hisaab se orders place karte hain.",
      },
      {
        heading: "Zones, exact lines nahi — aur roles flip ho saktay hain",
        body: "Practically, support/resistance shayad hi kabhi single exact price hoti hain; inhe zones ke tor per sochna behtar hai, kyunke price aksar \"textbook\" level se thora upar ya neeche react karti hai. Critically, aik baar resistance decisively break ho jaye to yeh aksar naya support ban jati hai (aur broken support naya resistance ban jata hai vice versa) — isay role reversal kaha jata hai.",
        list: [
          "Koi level jitni zyada baar test hui aur hold ki, traders usay utna zyada significant samajhte hain.",
          "\"Breakout\" wo hota hai jab price support/resistance level ko decisively cross karte hue close ho, aksar higher volume ke sath.",
          "\"False breakout\" (ya \"fakeout\") wo hota hai jab price briefly level break karti hai phir jaldi wapis revert ho jati hai — aik common trap.",
        ],
      },
      {
        body: "Level ke exact touch per trade na karen — confirmation ka intezar karen (level se aage candle close, ya aik retest jo hold karey) is bajaye ke guess karen jab pehli dafa price us ke paas aaye.",
      },
      {
        caption: "Price resistance ko do baar respect karti hai, phir us se upar break out ho jati hai — purani resistance aksar retest per nayi support ban jati hai.",
      },
      {
        label: "Live computed Support aur Resistance dekhen",
        note: "Market Analysis ka Technical Analysis report current live price se real Support aur Resistance levels compute karta hai.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Technical analysis mein \"support\" kya hai?",
          options: [
            { id: "a", text: "Aik level jahan selling pressure ne historically price advance ko roka ho" },
            { id: "b", text: "Aik level jahan buying pressure ne historically price decline ko roka ho" },
            { id: "c", text: "Pichle saal ki average price" },
            { id: "d", text: "Government-mandated price floor" },
          ],
          explanation: "Support wahan hai jahan buyers historically kaafi strongly step in karte hain ke decline rok kar price ko wapis upar push karen.",
        },
        {
          id: "q2",
          prompt: "Resistance level ke decisively break hone ke baad typically kya hota hai?",
          options: [
            { id: "a", text: "Yeh chart se mukammal tor per disappear ho jati hai" },
            { id: "b", text: "Yeh aksar retest per naya support ban jati hai (role reversal)" },
            { id: "c", text: "Price ka wapis wahan jana impossible ho jata hai" },
            { id: "d", text: "Kuch nahi — broken levels ki koi further relevance nahi hoti" },
          ],
          explanation: "Aik classic role reversal: resistance break hone ke baad, wohi level aksar naya support ki tarah act karti hai agar price wapis neeche aa kar isay test karey.",
        },
        {
          id: "q3",
          prompt: "\"False breakout\" (fakeout) kya hai?",
          options: [
            { id: "a", text: "Aik breakout jo baad mein aik strong trend se confirm ho" },
            { id: "b", text: "Price briefly level break karti hai, phir jaldi doosri direction mein reverse ho jati hai" },
            { id: "c", text: "Aik breakout jo sirf weekends per hota hai" },
            { id: "d", text: "Aik level jo kabhi test nahi hui" },
          ],
          explanation: "False breakout un traders ko trap karta hai jo initial break per enter huay, jab price jaldi wapis prior range ke andar aa jati hai.",
        },
        {
          id: "q4",
          prompt: "Support/resistance ko single exact prices ke bajaye \"zones\" ke tor per sochna behtar kyun hai?",
          options: [
            { id: "a", text: "Kyunke price typically textbook level se thora upar ya neeche react karti hai, aik exact tick per nahi" },
            { id: "b", text: "Kyunke support aur resistance asal mein exist nahi karte" },
            { id: "c", text: "Kyunke yeh sirf daily charts per apply hotay hain" },
            { id: "d", text: "Kyunke brokers manually yeh levels set karte hain" },
          ],
          explanation: "Real market reactions har baar aik exact price hit karne ke bajaye aik level ke around cluster hoti hain, isi liye traders inhe zones ke tor per treat karte hain.",
        },
        {
          id: "q5",
          prompt: "Support/resistance level ke bilkul pehlay touch per trade karne se safer approach kya hai?",
          options: [
            { id: "a", text: "Hamesha first touch per immediately enter karen, no exceptions" },
            { id: "b", text: "Confirmation ka intezar karen — jaise level se aage candle close, ya aik retest jo hold karey" },
            { id: "c", text: "Support/resistance ko mukammal tor per ignore karen" },
            { id: "d", text: "Sirf wo levels trade karen jo pehle kabhi touch nahi huay" },
          ],
          explanation: "Confirmation ka intezar karna (level se aage decisive close, ya hold karti retest) false breakout ya dobara hold karti level mein phasnay ka risk kam karta hai.",
        },
      ],
    },
  },

  "rsi-indicator": {
    sections: [
      {
        heading: "0-100 ka aik momentum gauge",
        body: "Relative Strength Index (RSI), jo J. Welles Wilder ne develop kiya, aik momentum oscillator hai jo recent price changes ki speed aur magnitude ko 0 se 100 ki scale per measure karta hai. Yeh typically 14-period lookback per calculate hota hai, recent gains ke average size ko recent losses ke average size se compare karte hue.",
      },
      {
        heading: "Overbought, oversold, aur divergence",
        body: "Classic RSI interpretation 70 aur 30 ko thresholds ke tor per use karti hai: 70 se upar ki reading suggest karti hai ke instrument \"overbought\" ho sakta hai (potentially pullback due ho), aur 30 se neeche \"oversold\" suggest karti hai (potentially bounce due ho). RSI divergence — jahan price naya high/low banaye magar RSI usay confirm na karey — aksar weakening momentum ki early warning ke tor per watch ki jati hai.",
        list: [
          "RSI > 70: aksar overbought parha jata hai",
          "RSI < 30: aksar oversold parha jata hai",
          "RSI 50 ke around: aksar neutral/balanced momentum parha jata hai",
          "Aik strong trend mein, RSI kaafi der tak \"overbought\" ya \"oversold\" reh sakta hai — yeh apni jagah par automatic reversal signal NAHI hai.",
        ],
      },
      {
        body: "RSI ki sab se bari mistake: \"overbought\" ko \"abhi sell karo\" samajhna. Strong uptrend mein, RSI lambay waqt tak 70 se upar reh sakta hai jabke price upar climb karta rahe — overbought ka matlab hai stretched, reverse hone ki guarantee nahi.",
      },
      {
        caption: "RSI 70 ki line se upar push ho raha hai — yeh stretched-momentum reading hai, apni jagah par automatic sell signal nahi.",
      },
      {
        label: "Live Technical Analysis report check karen",
        note: "Honest heads-up: is project ke paas sirf current live price hai, price history nahi, is liye report ka RSI section explicitly unavailable marked hai bajaye koi reading fake karne ke — wajah wahan dekhen.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "RSI indicator kis range mein oscillate karta hai?",
          options: [
            { id: "a", text: "-100 se +100" },
            { id: "b", text: "0 se 100" },
            { id: "c", text: "0 se 10" },
            { id: "d", text: "Iski koi fixed range nahi" },
          ],
          explanation: "RSI aik bounded oscillator hai jo hamesha 0 aur 100 ke darmiyan reh kar read hota hai.",
        },
        {
          id: "q2",
          prompt: "70 se upar ki RSI reading classically kya suggest karti hai?",
          options: [
            { id: "a", text: "Instrument \"overbought\" ho sakta hai — potentially pullback due ho" },
            { id: "b", text: "Instrument aik ghante ke andar guaranteed crash karega" },
            { id: "c", text: "Instrument ka momentum zero hai" },
            { id: "d", text: "Further analysis ke bina buy signal" },
          ],
          explanation: "70 se upar classic \"overbought\" threshold hai — yeh nishani hai ke momentum stretched hai, imminent reversal ki guarantee nahi.",
        },
        {
          id: "q3",
          prompt: "RSI divergence kya hai?",
          options: [
            { id: "a", text: "Jab RSI aur price perfect lockstep mein move karen" },
            { id: "b", text: "Jab price naya high/low banaye magar RSI apne naye high/low se usay confirm na karey" },
            { id: "c", text: "Jab RSI 100 se cross kar jaye" },
            { id: "d", text: "Aik candlestick pattern ki qisam" },
          ],
          explanation: "Divergence specifically price action aur RSI ki momentum reading ke darmiyan mismatch hai — aksar yeh early hint ke tor per watch hoti hai ke momentum fade ho raha hai.",
        },
        {
          id: "q4",
          prompt: "\"RSI 70 se upar = abhi sell karo\" ko common mistake kyun samjha jata hai?",
          options: [
            { id: "a", text: "RSI strong trend ke doran bina price reverse huay lambi der tak elevated reh sakta hai" },
            { id: "b", text: "RSI 70 se upar asal mein buy signal hai, sell signal nahi" },
            { id: "c", text: "RSI real markets mein 70 se upar nahi ja sakta" },
            { id: "d", text: "Overbought reading jaisi koi cheez exist nahi karti" },
          ],
          explanation: "Strong uptrend mein, RSI extended period tak overbought reh sakta hai jabke price climb karta rahe — yeh stretched-momentum signal hai, automatic reversal trigger nahi.",
        },
        {
          id: "q5",
          prompt: "RSI typically kya compare karke calculate hota hai:",
          options: [
            { id: "a", text: "Current price ko sirf previous din ki closing price se" },
            { id: "b", text: "Lookback period (commonly 14) mein recent gains ke average size ko recent losses ke average size se" },
            { id: "c", text: "Trading volume ko open interest se" },
            { id: "d", text: "Bid price ko ask price se" },
          ],
          explanation: "RSI ka core calculation chuni gayi lookback (14 periods sab se common default hai) mein average recent gains vs. average recent losses compare karta hai apni 0-100 reading dene ke liye.",
        },
      ],
    },
  },

  "moving-averages": {
    sections: [
      {
        heading: "Noise ko smooth karna",
        body: "Moving average (MA) chuni gayi tadaad mein recent periods per price ka average nikal kar raw price data ko aik single flowing line mein smooth karti hai, naya data aate hi continuously update hoti hai. Yeh underlying trend direction ko individual candles ke daily noise ke through dekhna aasan banata hai.",
      },
      {
        heading: "SMA vs. EMA, aur crossovers",
        body: "Simple Moving Average (SMA) apni lookback mein har period ko equal weight deta hai. Exponential Moving Average (EMA) recent periods ko zyada weight deta hai, jis se yeh naye price action per zyada tezi se react karta hai. Aik common signal \"crossover\" hai: jab aik faster (shorter-period) MA aik slower (longer-period) MA ke upar cross kare, isay \"Golden Cross\" (bullish) kaha jata hai; neeche cross karna \"Death Cross\" (bearish) hai.",
        list: [
          "SMA: lookback ke har period ko equal weight — smoother, react karne mein slow.",
          "EMA: recent periods per zyada weight — react karne mein faster, magar choppy markets mein zyada false signals de sakta hai.",
          "Golden Cross: shorter MA longer MA ke upar cross karti hai — aksar bullish parha jata hai.",
          "Death Cross: shorter MA longer MA se neeche cross karti hai — aksar bearish parha jata hai.",
        ],
      },
      {
        body: "Moving averages apni nature se lagging indicators hain — yeh past prices se banti hain, is liye crossovers trend change ko usky already shuru ho jane ke baad confirm karte hain, pehlay nahi. Yeh trend confirmation ke liye sab se behtar kaam karti hain, pinpoint entries ke liye nahi.",
      },
      {
        caption: "Aik \"Golden Cross\": shorter-period moving average longer-period wali ke upar cross karti hai.",
      },
      {
        label: "Live Technical Analysis report check karen",
        note: "RSI jaisa hi honesty note — moving averages ko historical closes ki zaroorat hoti hai, is liye wahan yeh section explicitly unavailable marked hai bajaye invent karne ke.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Moving average ka main purpose kya hai?",
          options: [
            { id: "a", text: "Price data ko single line mein smooth karna, underlying trend ko dekhna aasan banana" },
            { id: "b", text: "Future prices ko exact certainty ke sath predict karna" },
            { id: "c", text: "Trading volume measure karna" },
            { id: "d", text: "Bid/ask spread calculate karna" },
          ],
          explanation: "Moving averages short-term noise ko smooth karne ke liye hoti hain, jis se broader trend direction parhna aasan hota hai.",
        },
        {
          id: "q2",
          prompt: "SMA aur EMA ke darmiyan key difference kya hai?",
          options: [
            { id: "a", text: "SMA sab periods ko equal weight deta hai; EMA recent periods ko zyada weight deta hai aur faster react karta hai" },
            { id: "b", text: "EMA recent prices ko mukammal tor per ignore karta hai" },
            { id: "c", text: "SMA sirf daily charts per use ho sakta hai" },
            { id: "d", text: "Koi real difference nahi hai" },
          ],
          explanation: "EMA ki recent data per extra weighting isay equally-weighted SMA se naye price action ke liye zyada responsive banati hai.",
        },
        {
          id: "q3",
          prompt: "Shorter-period moving average ka longer-period wali ke UPAR cross hona commonly kya kehlata hai:",
          options: [
            { id: "a", text: "Aik Death Cross" },
            { id: "b", text: "Aik Golden Cross" },
            { id: "c", text: "Aik Fibonacci extension" },
            { id: "d", text: "Aik pivot breakout" },
          ],
          explanation: "Shorter MA ka longer MA ke upar cross karna classic bullish \"Golden Cross\" signal hai.",
        },
        {
          id: "q4",
          prompt: "Moving averages ko \"lagging\" indicators kyun kaha jata hai?",
          options: [
            { id: "a", text: "Yeh past price data se banti hain, is liye yeh trend changes ko unke already shuru hone ke baad confirm karti hain" },
            { id: "b", text: "Yeh price moves hone se pehlay unhe predict kar leti hain" },
            { id: "c", text: "Yeh real-time price se zyada tezi update hoti hain" },
            { id: "d", text: "Yeh sirf weekly charts per kaam karti hain" },
          ],
          explanation: "Kyunke MA historical prices se compute hoti hai, koi bhi crossover signal zaroori tor per us underlying shift ke already shuru hone ke baad dikhayi deta hai.",
        },
        {
          id: "q5",
          prompt: "Shorter-period MA ka longer-period MA se NEECHE cross hona commonly kya kehlata hai:",
          options: [
            { id: "a", text: "Aik Golden Cross" },
            { id: "b", text: "Aik Death Cross" },
            { id: "c", text: "Aik support breakout" },
            { id: "d", text: "Aik RSI divergence" },
          ],
          explanation: "Golden Cross ka bearish counterpart — shorter MA ka longer MA se neeche cross hona — Death Cross kehlata hai.",
        },
      ],
    },
  },

  "fibonacci-retracements": {
    sections: [
      {
        heading: "13th-century ki aik sequence se liye gaye ratios",
        body: "Fibonacci retracement levels Fibonacci number sequence (0, 1, 1, 2, 3, 5, 8, 13, 21...) mein milnay wale ratios se derive hotay hain, jahan sequence ke kuch numbers ko doosron se divide karne per 0.618 aur 0.382 jaisay recurring ratios bantay hain. Traders yeh ratios aik recent price swing (aik clear high aur low) per apply karte hain pullback ke doran potential support/resistance zones mark karne ke liye.",
      },
      {
        heading: "Isay draw karna aur key levels",
        body: "Fibonacci retracement draw karne ke liye, aap aik significant swing low aur swing high select karte hain (ya downtrend ke liye ultaa), aur tool automatically un ke darmiyan standard ratio levels per horizontal lines mark kar deta hai. Yeh zones watch ki jati hain jahan pullback karta trend potentially original direction mein continue karne se pehle pause ya reverse ho sakta hai.",
        list: [
          "23.6% — aik shallow retracement level",
          "38.2% — strong trends mein aik common pullback level",
          "50.0% — technically Fibonacci ratio nahi hai, magar psychological midpoint ke tor per universally include hota hai",
          "61.8% — \"golden ratio\" level, aksar deeper pullback zone ke tor per watch kiya jata hai",
          "78.6% — aik deep retracement, swing ke full round-trip ke qareeb",
        ],
      },
      {
        body: "Fibonacci levels sab se behtar kaam karte hain jab yeh confirmation ki kisi doosri form ke sath align ho jayen — jaise round-number support/resistance zone ya prior swing point — isolation mein trade karne ke bajaye.",
      },
      {
        caption: "Low se high tak price swing per drawn standard Fibonacci retracement levels.",
      },
      {
        label: "Fibonacci ratios ko live applied dekhen",
        note: "Technical Analysis report yeh exact ratios (23.6% / 38.2% / 50% / 61.8% / 78.6%) aik live, explicitly-labeled illustrative price band per apply karta hai.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Fibonacci retracement ratios kahan se derive hotay hain:",
          options: [
            { id: "a", text: "Aik random number generator se" },
            { id: "b", text: "Fibonacci number sequence mein milnay wale ratios se" },
            { id: "c", text: "Government ke interest rate decisions se" },
            { id: "d", text: "Sirf trading volume data se" },
          ],
          explanation: "Retracement percentages (23.6%, 38.2%, 61.8%, etc.) directly Fibonacci sequence ke numbers ke darmiyan ratios se aatay hain.",
        },
        {
          id: "q2",
          prompt: "Fibonacci retracement draw karne ke liye aap ko kaunsay do points select karne hain?",
          options: [
            { id: "a", text: "Aik significant price move ki swing high aur swing low" },
            { id: "b", text: "Current bid aur ask" },
            { id: "c", text: "Aaj ki open aur kal ki close" },
            { id: "d", text: "Do random candles" },
          ],
          explanation: "Fibonacci retracement aik clear swing low aur swing high per anchor hoti hai (ya downtrend ke liye high-to-low), jahan se tool ratio levels plot karta hai.",
        },
        {
          id: "q3",
          prompt: "Yeh commonly-shown Fibonacci levels mein se kaunsa asal mein Fibonacci sequence se khud derive nahi hota?",
          options: [
            { id: "a", text: "23.6%" },
            { id: "b", text: "38.2%" },
            { id: "c", text: "50.0%" },
            { id: "d", text: "61.8%" },
          ],
          explanation: "50% convention se aik psychologically significant midpoint ke tor per include hota hai, magar yeh khud 23.6/38.2/61.8/78.6% jaisa Fibonacci-derived ratio nahi hai.",
        },
        {
          id: "q4",
          prompt: "\"Golden ratio\" retracement level, jo aksar deeper pullback zone ke tor per watch hota hai, kya hai?",
          options: [
            { id: "a", text: "23.6%" },
            { id: "b", text: "50.0%" },
            { id: "c", text: "61.8%" },
            { id: "d", text: "100%" },
          ],
          explanation: "61.8% golden ratio se derive hota hai aur sab se zyada watch kiye jane wale Fibonacci retracement levels mein se aik hai.",
        },
        {
          id: "q5",
          prompt: "Is lesson ke mutabiq, Fibonacci level ko zyada reliable kya banata hai?",
          options: [
            { id: "a", text: "Isay kisi bhi doosray analysis se mukammal tor per isolation mein use karna" },
            { id: "b", text: "Jab yeh confirmation ki kisi doosri form ke sath align ho, jaise round-number support/resistance zone" },
            { id: "c", text: "Sirf 100% level use karna" },
            { id: "d", text: "Isay sirf 1-minute chart per draw karna" },
          ],
          explanation: "Confluence — jab Fibonacci level kisi doosray independent signal jaise known support/resistance zone se match ho jaye — generally sirf aik Fibonacci level se zyada meaningful samjha jata hai.",
        },
      ],
    },
  },

  "gann-basics": {
    sections: [
      {
        heading: "W.D. Gann ka core idea: time price jitna hi matter karta hai",
        body: "W.D. Gann aik early-20th-century trader thay jin ki techniques is idea per based hain ke markets geometric, time-based relationships mein move karte hain — sirf price-based nahi. Jahan zyada tar indicators sirf price analyze karte hain, Gann theory TIME ke guzarne ko khud aik key variable treat karti hai jo potential turning points signal kar sakta hai, chahe price kitna bhi move hua ho.",
      },
      {
        heading: "Gann angles: 1x1 line",
        body: "Sab se maroof Gann tool Gann angle (ya \"Gann fan\") hai — diagonal trendlines jo kisi significant price pivot se fixed geometric slopes per draw ki jati hain. Sab se famous 1x1 angle hai (kabhi \"45-degree line\" kaha jata hai), jo one price unit per one time unit ki aik balanced rate represent karta hai; steeper ya shallower angles (2x1, 4x1, 1x2, 1x4, etc.) advance ki faster ya slower rates represent karte hain.",
        list: [
          "Gann angles: pivot point se fixed price/time ratios per diagonal lines, dynamic support/resistance ke tor per use hoti hain.",
          "Gann Square of Nine: aik spiral numeric grid jo potential price/time turning points project karne ke liye use hota hai.",
          "Time cycles: Gann ne past highs/lows ki anniversaries aur future mein repeat hone wale specific day counts per bohat emphasis diya.",
        ],
      },
      {
        body: "Gann methods genuinely complex hain aur heavily debated hain — bohat se traders core idea (time matter karta hai, sirf price nahi) mein real value paatay hain, bina poore historical system ko literally adopt kiye. Is lesson ko aik conceptual introduction samjhein, complete trading method nahi.",
      },
      {
        caption: "Aik simplified Gann-style grid: pivot se diagonal angles fixed price/time ratios per fan ho kar khulte hain.",
      },
      {
        label: "Live Technical Analysis report check karen",
        note: "Gann Theory ko historical swing points aur time cycles ki zaroorat hoti hai jo yeh project store nahi karta — report explain karta hai ke wahan yeh section fake karne ke bajaye kyun unavailable marked hai.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Kaunsa central idea Gann theory ko zyada tar doosray technical tools se alag karta hai?",
          options: [
            { id: "a", text: "Yeh sirf trading volume dekhta hai" },
            { id: "b", text: "Yeh TIME ke guzarne ko aik key variable treat karta hai, sirf price movement nahi" },
            { id: "c", text: "Yeh price ko mukammal tor per ignore karta hai" },
            { id: "d", text: "Yeh purely news events per based hai" },
          ],
          explanation: "Gann ka core premise yeh hai ke time-based cycles aur relationships price movement jitna hi matter karte hain — yeh purely price-based analysis se aik departure hai.",
        },
        {
          id: "q2",
          prompt: "Gann ka 1x1 angle kya represent karta hai?",
          options: [
            { id: "a", text: "Aik vertical support line" },
            { id: "b", text: "Pivot se draw hoti one time unit per one price unit movement ki balanced rate" },
            { id: "c", text: "Din ki exact closing price" },
            { id: "d", text: "Aik fixed 90-degree horizontal line" },
          ],
          explanation: "1x1 angle (aksar 45-degree kaha jata hai) aik significant pivot point se price-to-time advance ki balanced rate represent karta hai.",
        },
        {
          id: "q3",
          prompt: "Gann ka Square of Nine generally kis liye use hota hai?",
          options: [
            { id: "a", text: "Bid/ask spread calculate karne ke liye" },
            { id: "b", text: "Spiral numeric grid ke zariye potential future price/time turning points project karne ke liye" },
            { id: "c", text: "Standard lot sizes set karne ke liye" },
            { id: "d", text: "Central bank interest rates determine karne ke liye" },
          ],
          explanation: "Square of Nine numbers ka aik spiral grid hai jo Gann practitioners use karte hain yeh project karne ke liye ke price aur time kahan potential turning point ke liye align ho saktay hain.",
        },
        {
          id: "q4",
          prompt: "Yeh lesson aik learner ke liye Gann theory ka role kaise frame karta hai?",
          options: [
            { id: "a", text: "Sab se zyada reliable, universally-proven single trading method ke tor per" },
            { id: "b", text: "Aik genuinely complex, debated approach ke conceptual introduction ke tor per — khud mein complete method nahi" },
            { id: "c", text: "Mukammal tor per discredited aur kabhi study karne layak nahi" },
            { id: "d", text: "Standard moving average crossover ke identical" },
          ],
          explanation: "Lesson explicit hai ke Gann methods complex aur debated hain, aur yeh aik ready-to-use complete system ke bajaye aik conceptual starting point ke tor per meant hai.",
        },
        {
          id: "q5",
          prompt: "Gann ne time cycles ke bare mein kis per bohat emphasis diya?",
          options: [
            { id: "a", text: "Past highs/lows ki anniversaries aur specific repeating day counts" },
            { id: "b", text: "Sirf current din ka trading volume" },
            { id: "c", text: "Sab historical price data ko ignore karna" },
            { id: "d", text: "Sirf fixed calendar quarters" },
          ],
          explanation: "Gann ka time-cycle work specific day counts aur prior significant highs/lows ki future mein repeat hone wali anniversaries per heavily focused tha.",
        },
      ],
    },
  },

  "central-bank-rates": {
    sections: [
      {
        heading: "Macro markets mein sab se bara single lever",
        body: "Central bank ki benchmark interest rate (jaise US Federal Reserve ki federal funds rate) poori economy mein borrowing ki cost ko influence karti hai. Rates barhana aam taur per spending/borrowing ko cool karta hai aur currency ko strengthen karta hai (higher yield foreign capital attract karta hai); rates kam karna aam taur per borrowing/spending ko encourage karta hai aur currency ko weaken kar sakta hai.",
      },
      {
        heading: "Traders rate decisions per itne obsess kyun hotay hain",
        body: "Do countries ke darmiyan interest rate differentials currency pair ki direction ke primary long-term drivers mein se aik hain — capital us currency ki taraf flow karta hai jo better risk-adjusted returns offer kare. Isi liye scheduled central bank meetings (jaise US ke liye FOMC meetings) economic calendar ke highest-volatility events mein shamil hoti hain.",
        list: [
          "Rate hike: generally currency-positive (baqi sab equal) — higher yield capital inflows attract karta hai.",
          "Rate cut: generally currency-negative (baqi sab equal) — lower yield, us currency ko hold karne ka kam incentive.",
          "Markets EXPECTATIONS ke against DECISION per react karte hain, isolation mein decision per nahi — aik hike jo already fully expected thi kam movement cause kar sakti hai, ya reversal bhi.",
          "Forward guidance (central bank future moves ke bare mein kya signal karta hai) aksar current decision se zyada matter karti hai.",
        ],
      },
      {
        body: "Rate decisions ke around \"buy the rumor, sell the news\" common hai: agar hike heavily expected thi aur pehlay se priced in thi, to actual announcement aik continuation ke bajaye reversal trigger kar sakta hai, kyunke real driver market ne jo already priced in kar rakha tha us ke against surprise (ya iski kami) thi.",
      },
      {
        caption: "Rate hike ko currency strength se link karne wali textbook logic chain — baqi sab equal hone per.",
      },
      {
        label: "Economic Calendar per real central bank moves track karen",
        note: "Aik live TradingView economic calendar USD, EUR, GBP, JPY, AUD, CAD, CHF aur CNY ke rate decisions aur doosri high-impact releases cover karta hai.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Baqi sab equal hone per, central bank interest rate HIKE us country ki currency ke sath aam taur per kya karti hai?",
          options: [
            { id: "a", text: "Isay weaken karti hai, kyunke borrowing expensive ho jati hai" },
            { id: "b", text: "Isay strengthen karti hai, kyunke higher yield foreign capital attract karti hai" },
            { id: "c", text: "Koi effect nahi karti" },
            { id: "d", text: "Immediately hyperinflation cause karti hai" },
          ],
          explanation: "Higher rates generally currency ko hold karne ke liye zyada attractive banati hain (better yield), jo foreign capital attract karti hai aur currency ko support karti hai — baqi sab equal hone per.",
        },
        {
          id: "q2",
          prompt: "Widely-expected rate hike LITTLE market reaction, ya reversal, kyun cause kar sakti hai?",
          options: [
            { id: "a", text: "Kyunke markets jo already expected/priced in tha us ke against decision per react karte hain, decision alone per nahi" },
            { id: "b", text: "Kyunke rate decisions asal mein kabhi markets move nahi karte" },
            { id: "c", text: "Kyunke central banks hamesha weekends per decisions announce karte hain" },
            { id: "d", text: "Kyunke hikes hamesha currency-negative hoti hain" },
          ],
          explanation: "Agar hike pehlay se fully priced in thi, to \"surprise\" element khatam ho jata hai — actual move continuation ke bajaye \"sell the news\" type reaction trigger kar sakta hai.",
        },
        {
          id: "q3",
          prompt: "Central bank ke context mein \"forward guidance\" se kya murad hai?",
          options: [
            { id: "a", text: "Pichle quarter ka exact GDP figure" },
            { id: "b", text: "Central bank apni likely FUTURE policy moves ke bare mein kya signal karta hai, sirf current decision nahi" },
            { id: "c", text: "Aik tarah ki limit order" },
            { id: "d", text: "10 saal pehlay set ki gayi aik fixed interest rate schedule" },
          ],
          explanation: "Forward guidance central bank ka future policy per communicated outlook hai — aksar current rate decision se zyada market-moving hoti hai.",
        },
        {
          id: "q4",
          prompt: "\"Buy the rumor, sell the news\" kya describe karta hai?",
          options: [
            { id: "a", text: "Har rate decision se profit karne ka aik guaranteed tareeqa" },
            { id: "b", text: "Price ka aik expected event ki anticipation mein move karna, phir event expected confirm hote hi reverse ho jana" },
            { id: "c", text: "Aik rule jo sirf cryptocurrency per apply hota hai" },
            { id: "d", text: "Sab economic news ko mukammal tor per ignore karna" },
          ],
          explanation: "Yeh aik anticipated outcome se pehle position lena, phir woh outcome actually confirm aur \"priced in\" ho jane ke baad follow hone wala reversal describe karta hai.",
        },
        {
          id: "q5",
          prompt: "US mein, federal funds rate decisions ke liye primary venue kaunsi scheduled meetings hain?",
          options: [
            { id: "a", text: "FOMC (Federal Open Market Committee) meetings" },
            { id: "b", text: "Quarterly earnings calls" },
            { id: "c", text: "United Nations General Assembly" },
            { id: "d", text: "State of the Union addresses" },
          ],
          explanation: "FOMC meetings specifically wahan hain jahan US Federal Reserve apni benchmark federal funds rate set karta hai — USD pairs ke liye highest-volatility scheduled events mein se aik.",
        },
      ],
    },
  },

  "nfp-and-news-trading": {
    sections: [
      {
        heading: "Aik jobs report har USD pair ko kyun move karti hai",
        body: "US Non-Farm Payrolls (NFP) report, jo monthly release hoti hai, US mein employed logon ki tadaad mein change measure karti hai (farm workers, government employees, aur chand doosri categories ko exclude karte hue). Yeh sab se closely watched economic releases mein se aik hai kyunke employment data directly Federal Reserve ke policy decisions mein feed karti hai — strong jobs growth tighter policy ke case ko support kar sakti hai, weak growth iska opposite.",
      },
      {
        heading: "News trading ko uniquely risky kya banata hai",
        body: "High-impact release ke around seconds/minutes mein, spreads dramatically wide ho saktay hain, price settle hone se pehlay dono directions mein violently spike kar sakta hai, aur stop-losses per slippage normal se bohat worse ho sakti hai. Yeh regular trading hours se fundamentally different risk environment hai.",
        list: [
          "Actual vs. Forecast vs. Previous: markets ACTUAL figure ke FORECAST (consensus expectation) se compare per zyada react karte hain, sirf raw number per nahi.",
          "Aik bara \"beat\" (actual forecast se well above) typically currency-positive hota hai; aik bara \"miss\" typically currency-negative hota hai — magar initial moves jaldi reverse ho saktay hain.",
          "Volatility aksar aik short window ke liye spike karti hai phir unpredictably reverse ya extend ho sakti hai — yeh casual position sizing ka waqt nahi hai.",
        ],
      },
      {
        body: "Bohat se experienced traders deliberately high-impact news ke immediately around minutes mein NEW positions kholne se bachtay hain, specifically spread-widening aur slippage risk ki wajah se — na ke move real nahi hai, balke initial spike ko trade karne ka risk-to-reward aksar poor hota hai.",
      },
      {
        caption: "High-impact news release ki typical sequence aur pehlay chand minutes ko trade karna kyun uniquely risky hai.",
      },
      {
        label: "Live Economic Calendar aur News Feed dekhen",
        note: "Forex, Crypto, Commodities aur Stocks mein aane wali high-impact releases (NFP shamil) aur 60+ live headlines check karen.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "US Non-Farm Payrolls (NFP) report kya measure karta hai?",
          options: [
            { id: "a", text: "US mein employed logon ki tadaad mein change, farm workers aur chand doosri categories ko exclude karte hue" },
            { id: "b", text: "S&P 500 ki closing price" },
            { id: "c", text: "US government ka total debt" },
            { id: "d", text: "US mein gold production" },
          ],
          explanation: "NFP specifically US employment mein monthly change track karta hai, farm workers (aur government/nonprofit/private household employees) ko exclude karte hue, aur Fed policy considerations mein directly feed karta hai.",
        },
        {
          id: "q2",
          prompt: "Markets typically kis per sab se strongly react karte hain:",
          options: [
            { id: "a", text: "Sirf raw number per, expectations ke baghair" },
            { id: "b", text: "ACTUAL figure FORECAST (consensus expectation) se kaisi compare hoti hai" },
            { id: "c", text: "Exactly aik saal pehlay ki report" },
            { id: "d", text: "Sirf previous month ka revised figure" },
          ],
          explanation: "Consensus forecast ke against surprise — sirf absolute number nahi — usually sharpest immediate reaction drive karti hai.",
        },
        {
          id: "q3",
          prompt: "NFP jaisi high-impact news release ke doran spreads ke sath typically kya hota hai?",
          options: [
            { id: "a", text: "Yeh significantly narrow ho jatay hain" },
            { id: "b", text: "Yeh aksar reduced liquidity aur increased uncertainty ki wajah se dramatically wide ho jatay hain" },
            { id: "c", text: "Yeh legally fixed hotay hain aur change nahi ho saktay" },
            { id: "d", text: "Spreads news events se unrelated hotay hain" },
          ],
          explanation: "High-impact releases typically spreads ko sharply wide hote dekhti hain jab liquidity providers extra uncertainty aur volatility price karte hain.",
        },
        {
          id: "q4",
          prompt: "Bohat se experienced traders major news release ke bilkul around minutes mein new positions kholne se kyun bachtay hain?",
          options: [
            { id: "a", text: "Kyunke news asal mein kabhi matter nahi karti" },
            { id: "b", text: "Kyunke widened spreads aur slippage risk aksar initial spike ko trade karne ka risk-to-reward poor bana dete hain" },
            { id: "c", text: "Kyunke news events ke doran trade karna illegal hai" },
            { id: "d", text: "Kyunke news releases ke doran prices kabhi move nahi hotay" },
          ],
          explanation: "Yeh aik risk-management decision hai, yeh belief nahi ke news matter nahi karti — initial volatility spike aksar widened spreads aur slippage ki wajah se poor risk-to-reward carry karta hai.",
        },
        {
          id: "q5",
          prompt: "Aik bara NFP \"beat\" (actual forecast se well above) typically, baqi sab equal hone per, kya hota hai:",
          options: [
            { id: "a", text: "USD ke liye currency-negative" },
            { id: "b", text: "USD ke liye currency-positive, chahe initial move phir bhi reverse ho sakti hai" },
            { id: "c", text: "Currency markets ke liye mukammal tor per irrelevant" },
            { id: "d", text: "Sirf stock market ke liye relevant, forex ke liye kabhi nahi" },
          ],
          explanation: "Aik strong beat generally USD-positive parha jata hai (stronger economy, potentially firmer Fed policy), chahe lesson note karta hai ke high-impact news per initial reactions phir bhi reverse ho sakti hain.",
        },
      ],
    },
  },

  "market-sentiment": {
    sections: [
      {
        heading: "\"Sentiment\" ka asal matlab kya hai",
        body: "Market sentiment traders/investors ka kisi particular asset ya market ki taraf overall attitude hai — broadly bullish (optimistic, expecting ke prices barhein) ya bearish (pessimistic, expecting ke prices girein). Aik hard price ya indicator reading ke bar-khilaf, sentiment inherently crowd ke collective mood ke bare mein hai, isi liye yeh single definitive number ke bajaye proxies ke through measure hota hai.",
      },
      {
        heading: "Certainty fabricate kiye baghair sentiment parhna",
        body: "Common sentiment proxies mein news headlines ka tone (coverage positively ya negatively frame hua hai?), social media chatter, aur positioning data (kitne traders net long vs. net short hain) shamil hain. Yeh crowd-psychology gauge ke tor per genuinely useful hain, magar koi bhi certainty ke sath price predict nahi karta — sentiment aik input hai kai mein se, koi standalone trading system nahi.",
        list: [
          "Extreme one-sided sentiment (taqreeban sab bullish, ya taqreeban sab bearish) kabhi kabhi aik contrarian warning sign ke tor per parha jata hai — jab taqreeban har koi already aik tarah position le chuka ho, to aage push karne ke liye kam buyers/sellers reh sakte hain.",
          "Sentiment one-sided reh kar bhi lambay waqt tak correct reh sakta hai — contrarian signals aik caution flag hain, timing tool nahi.",
          "Sentiment ko price action aur fundamentals ke sath combine karna sirf sentiment per rely karne se zyada robust hota hai.",
        ],
      },
      {
        body: "False precision ke sath presented kisi bhi sentiment number (\"73.2% bullish\") se skeptical rahen. Jab tak aap exactly na jaanen ke kya measure ho raha hai aur kaise (headline keyword counts? survey respondents? futures positioning?), isay aik scientific reading nahi, aik rough directional gauge samajhein.",
      },
      {
        caption: "Aik sentiment gauge crowd-mood ka aik rough proxy hai — useful context, kabhi standalone trading signal nahi.",
      },
      {
        label: "Market Analysis per live Market Sentiment dekhen",
        note: "Technical Analysis report ka Overall Market Sentiment live Technical aur Fundamental Bias ko blend karta hai, note karta hai ke yeh agree karte hain ya conflict.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "\"Market sentiment\" se kya murad hai?",
          options: [
            { id: "a", text: "Current exact bid/ask spread" },
            { id: "b", text: "Asset ki taraf traders/investors ka overall attitude (bullish ya bearish)" },
            { id: "c", text: "Trading per aik government regulation" },
            { id: "d", text: "Current interest rate" },
          ],
          explanation: "Sentiment specifically crowd ke collective mood/attitude ke bare mein hai — optimistic (bullish) ya pessimistic (bearish) — koi hard price ya rate figure nahi.",
        },
        {
          id: "q2",
          prompt: "In mein se kaunsa aik commonly used sentiment proxy hai?",
          options: [
            { id: "a", text: "Positioning data — kitne traders net long vs. net short hain" },
            { id: "b", text: "10 saal pehlay ka exact historical GDP figure" },
            { id: "c", text: "Aik fixed government-published sentiment score" },
            { id: "d", text: "Trading platform ke theme ka color" },
          ],
          explanation: "Net long/short positioning data aik widely used sentiment proxy hai, news tone aur social media chatter jaisi cheezon ke sath.",
        },
        {
          id: "q3",
          prompt: "Kuch traders EXTREME one-sided sentiment ko contrarian warning sign ke tor per kyun dekhtay hain?",
          options: [
            { id: "a", text: "Kyunke yeh immediate reversal ki guarantee deta hai" },
            { id: "b", text: "Kyunke jab taqreeban har koi already aik tarah position le chuka ho, to us direction mein aage push karne ke liye kam buyers/sellers reh sakte hain" },
            { id: "c", text: "Kyunke sentiment data hamesha wrong hota hai" },
            { id: "d", text: "Kyunke extreme sentiment measure karna illegal hai" },
          ],
          explanation: "Contrarian logic one-sided positioning ke exhaustion ke bare mein hai, guarantee nahi — lesson explicit hai ke one-sided sentiment persist kar sakta hai aur lambay waqt tak correct reh sakta hai.",
        },
        {
          id: "q4",
          prompt: "Is lesson ke mutabiq, sentiment data use karne ka recommended tareeqa kya hai?",
          options: [
            { id: "a", text: "Apni jagah per aik standalone trading system ke tor per" },
            { id: "b", text: "Price action aur fundamentals ke sath combine kiya gaya, kai inputs mein se aik ke tor per" },
            { id: "c", text: "Kabhi nahi — sentiment ki koi value nahi" },
            { id: "d", text: "Sirf cryptocurrency markets per" },
          ],
          explanation: "Lesson sentiment ko genuinely useful context ke tor per frame karta hai jo doosray analysis ke sath combine hone per zyada robust hota hai, standalone signal nahi.",
        },
        {
          id: "q5",
          prompt: "Trader ko false precision ke sath presented sentiment reading (jaise \"73.2% bullish\") se skeptical kyun hona chahiye?",
          options: [
            { id: "a", text: "Kyunke aisi precision hamesha fabricated aur meaningless hoti hai" },
            { id: "b", text: "Kyunke yeh jaane baghair ke exactly kya aur kaise measure ho raha hai, woh precision reading ke kitni scientific hone ko overstate kar sakti hai" },
            { id: "c", text: "Kyunke sentiment sirf whole numbers mein measure ho sakta hai" },
            { id: "d", text: "Kyunke finance mein decimal points allowed nahi hain" },
          ],
          explanation: "Yeh caution kisi number ke apparent precision per trust karne se pehlay us ke peechay methodology samajhne ke bare mein hai — yeh nahi ke sab aisay numbers fake hain, balke inhe jitna rigorous yeh nahi hain usse zyada nahi lena chahiye.",
        },
      ],
    },
  },

  "position-sizing-math": {
    sections: [
      {
        heading: "Har trade ko zaroorat wala aik calculation",
        body: "Position sizing har trade se pehlay aik sawal ka jawab deta hai: agar aap wrong huay to aap kitna lose karne ke liye willing hain, is ko dekhtay huay aap actually kitni bari position le saktay hain? Isay sahi karna shayad market direction ke bare mein correct hone se zyada important hai — yehi hai jo losing trades ki aik series ko account-ending banne se rokta hai.",
      },
      {
        heading: "Teen inputs",
        body: "Position size exactly teen cheezon per depend karta hai: aap ka account balance, iska wo percentage jo aap is aik trade per risk karne ke liye willing hain (disciplined traders ke liye commonly 1-2%), aur aap ki entry aur stop-loss ke darmiyan distance (pips ya price units mein).",
        list: [
          "Risk Amount = Account Balance × Risk % — actual dollar amount jo aap is trade per lose karne ke liye willing hain.",
          "Stop-Loss Distance = aap ka stop entry se (pips mein) kitna door hai.",
          "Position Size = Risk Amount ÷ (Stop-Loss Distance × Value per pip per unit) — is se backward solve hota hai ke aap kitna lose karne ke liye willing hain.",
        ],
      },
      {
        label: "Position Sizing Formula",
        note: "Aik $10,000 account jo 1% ($100) risk kar raha hai, 20-pip stop ke sath aik pair per jahan standard lot = $10/pip, isay chahiye: $100 ÷ (20 × $10) = 0.5 standard lots.",
      },
      {
        body: "Note karen ke formula kabhi nahi puchta \"aap is trade ke bare mein kitne confident hain?\". Position sizing deliberately confidence se independent hai — yeh wrong hone se survive karne ke bare mein hai, size up karne ke bare mein nahi kyunke koi setup \"feel\" kar raha hai great.",
      },
      {
        body: "High leverage aap ko aik aisi position kholne deta hai jo aap ke account balance normally support kar sakta us se bohat zyada bari ho — iska matlab hai ke aap ke against aik small, ordinary price move unleveraged hone se kahin zyada bara hissa aap ke account ka wipe out kar sakta hai. Leverage market mein aap ka edge nahi change karta; yeh sirf change karta hai ke mistake kitni tezi se expensive ban jati hai.",
      },
      {
        caption: "Try karein: apna khud ka account balance, risk %, aur stop-loss distance plug karen.",
      },
      {
        caption: "Try karein: dekhen ke aik given leverage per position asal mein kitna margin require karti hai, aur kitna free margin baaqi reh jata hai.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Position-sizing calculation ko kaunsay teen inputs ki zaroorat hoti hai?",
          options: [
            { id: "a", text: "Account balance, risk %, aur stop-loss distance" },
            { id: "b", text: "Current RSI, moving average, aur Fibonacci level" },
            { id: "c", text: "Broker ka naam, leverage ratio, aur news sentiment" },
            { id: "d", text: "Candle ka color, wick ki length, aur body size" },
          ],
          explanation: "Position sizing purely account balance, aap jo % risk kar rahay hain, aur aap ka stop-loss entry se kitna door hai, is ka function hai — market analysis ke bare mein kuch nahi.",
        },
        {
          id: "q2",
          prompt: "Aik $10,000 account per trade 1% risk karta hai. Aik trade ke liye dollar Risk Amount kya hai?",
          options: [
            { id: "a", text: "$10" },
            { id: "b", text: "$100" },
            { id: "c", text: "$1,000" },
            { id: "d", text: "$10,000" },
          ],
          explanation: "Risk Amount = Account Balance × Risk % = $10,000 × 1% = $100.",
        },
        {
          id: "q3",
          prompt: "Wohi $100 risk amount use karte hue 20-pip stop ke sath, aik pair per jahan aik standard lot $10/pip ki worth hai, kaunsa lot size risk ko exactly $100 per rakhta hai?",
          options: [
            { id: "a", text: "0.05 lots" },
            { id: "b", text: "0.5 lots" },
            { id: "c", text: "5 lots" },
            { id: "d", text: "50 lots" },
          ],
          explanation: "Lot Size ≈ Risk Amount ÷ (Stop Pips × Pip Value per Lot) = $100 ÷ (20 × $10) = 0.5 standard lots.",
        },
        {
          id: "q4",
          prompt: "Lesson kyun kehta hai ke position sizing deliberately \"confidence-independent\" hai?",
          options: [
            { id: "a", text: "Kyunke jab bhi trade sure thing jaisi feel ho, isay scale up hona chahiye" },
            { id: "b", text: "Kyunke formula wrong hone se survive karne ke bare mein hai, aap enter karte waqt kitne confident feel kar rahay hain is se farq nahi parta" },
            { id: "c", text: "Kyunke confidence hi sirf aik input hai jo matter karti hai" },
            { id: "d", text: "Kyunke position sizing asal mein outcomes per affect nahi karta" },
          ],
          explanation: "Disciplined position sizing ka poora point yeh hai ke yeh aap ka loss cap karta hai agar aap wrong ho — yeh kisi gut feeling ke hisaab se flex karne ke liye nahi hai ke trade kitni likely hai ke work karey.",
        },
        {
          id: "q5",
          prompt: "Bohat se disciplined traders kaunsi commonly-cited risk-per-trade range use karte hain?",
          options: [
            { id: "a", text: "Per trade account balance ka 1-2%" },
            { id: "b", text: "Per trade account balance ka 25-50%" },
            { id: "c", text: "Per trade account balance ka 100%" },
            { id: "d", text: "Koi commonly-cited range nahi hai" },
          ],
          explanation: "1-2% per trade aik widely cited risk-management guideline hai, jo kisi individual loss ko overall account ke mukablay small rakhti hai.",
        },
      ],
    },
  },

  "risk-to-reward-ratio": {
    sections: [
      {
        heading: "Aap ko zyada tar waqt correct hone ki zaroorat nahi",
        body: "Risk-Reward (R:R) ratio compare karta hai ke agar trade wrong ho jaye to aap kitna lose karne ke liye willing hain (risk, matlab stop-loss ki distance) us ke against agar trade theek ho jaye to aap kitna earn karne ke liye willing hain (reward, matlab take-profit ki distance). Aik 1:2 ratio ka matlab hai 1 unit risk karna potentially 2 earn karne ke liye; 1:3 ka matlab hai 1 risk karna potentially 3 earn karne ke liye.",
      },
      {
        heading: "Yeh win-rate ki math ko kaise change karta hai",
        body: "Consistent 1:2 R:R ke sath, aap sirf 40% trades jeet kar bhi overall profitable ho saktay hain, kyunke har win do losses ki value se zyada recover karti hai. Yehi single sab se important wajah hai ke professional traders koi bhi trade place karne se pehlay R:R per itna focus karte hain — yeh long-term profitability ko zyada tar waqt correct hone ki zaroorat se de-link kar deta hai.",
        list: [
          "1:1 ke R:R per, aap ko profitable hone ke liye sirf > 50% win rate ki zaroorat hai (costs ignore karte huay).",
          "1:2 ke R:R per, taqreeban 34%+ win rate profitable ho sakti hai.",
          "1:3 ke R:R per, taqreeban 25%+ win rate profitable ho sakti hai.",
          "Yeh spread/commission ignore karte huay simplified breakeven thresholds hain — real costs threshold ko thora barha dete hain.",
        ],
      },
      {
        label: "Risk-Reward Ratio",
        note: "Entry 1.1000 per, stop-loss 1.0950 per (50-pip risk), take-profit 1.1100 per (100-pip reward) → R:R = 100 ÷ 50 = 1:2.",
      },
      {
        body: "Aik poor R:R wali trade (jaise 1:0.5 — jo aap earn karne ke liye willing hain us se zyada risk karna) breakeven tak pahunchne ke liye bhi unrealistically high win rate ki zaroorat rakhti hai. \"Kya yeh trade jeetegi?\" puchnay se pehlay, puchen \"agar main half time wrong hun to bhi kya is trade ka R:R worth hai?\"",
      },
      {
        body: "Paper per bara R:R aap ko protect nahi karta agar trade ke beech mein, losing hone per \"zyada space dene\" ke liye aap apna stop-loss aur door move kar dein. Yehi aik habit — entry ke baad stop ko widen karna — aik planned 1:2 trade ko khamoshi se aik unplanned, unlimited trade mein convert kar deti hai, aur yeh un sab se fast tareeqon mein se aik hai jis se disciplined position sizing ka matlab khatam ho jata hai.",
      },
      {
        caption: "Aik 1:2 risk-reward setup: potential gain (green) potential loss (red) ke size se double hai.",
      },
      {
        caption: "Try karein: dollar risk, dollar reward, aur R:R ratio dekhne ke liye apni khud ki entry, stop-loss, aur take-profit enter karen.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Aik trade potentially 120 pips earn karne ke liye 40 pips risk karti hai. Risk-Reward ratio kya hai?",
          options: [
            { id: "a", text: "1:2" },
            { id: "b", text: "1:3" },
            { id: "c", text: "3:1" },
            { id: "d", text: "1:1" },
          ],
          explanation: "R:R = Reward ÷ Risk = 120 ÷ 40 = 3, is liye yeh 1:3 ka ratio hai — 3 ke potential ke liye 1 unit risk karna.",
        },
        {
          id: "q2",
          prompt: "Consistent 1:2 risk-reward ratio per, overall profitable hone ke liye taqreeban kaunsi win rate ki zaroorat hoti hai (costs ignore karte huay)?",
          options: [
            { id: "a", text: "50% se zyada" },
            { id: "b", text: "Taqreeban 34% ya zyada" },
            { id: "c", text: "Exactly 100%" },
            { id: "d", text: "Win rate profitability ke liye irrelevant hai" },
          ],
          explanation: "Har win har loss se 2x worth hone ke sath, aap sirf taqreeban aik tihai trades jeet kar net profitable ho saktay hain — yeh aik core wajah hai ke R:R discipline itna matter karti hai.",
        },
        {
          id: "q3",
          prompt: "Trading costs ko ignore karte huay, 1:1 risk-reward ratio ko waqt ke sath profitable hone ke liye kya chahiye?",
          options: [
            { id: "a", text: "50% se zyada win rate" },
            { id: "b", text: "90% se zyada win rate" },
            { id: "c", text: "Koi bhi win rate equally theek kaam karti hai" },
            { id: "d", text: "Exactly 0% win rate" },
          ],
          explanation: "1:1 per, wins aur losses same size ke hotay hain, is liye sirf aage nikalne ke liye aap ko apni half se zyada trades jeetnay ki zaroorat hai (costs count karen to yeh aur bhi upar jata hai).",
        },
        {
          id: "q4",
          prompt: "Is lesson ke mutabiq, professional traders koi trade place karne se pehlay R:R per kyun emphasis dete hain?",
          options: [
            { id: "a", text: "Kyunke yeh guarantee karta hai ke har single trade jeetegi" },
            { id: "b", text: "Kyunke aik favorable R:R long-term profitability ko zyada tar waqt correct hone ki zaroorat se de-link kar deta hai" },
            { id: "c", text: "Kyunke R:R ka profitability se koi lena-dena nahi" },
            { id: "d", text: "Kyunke yeh stop-losses ki zaroorat khatam kar deta hai" },
          ],
          explanation: "Aik achi R:R ka matlab hai aap ko overall profitable hone ke liye high win rate ki zaroorat nahi — isi liye isay fundamental risk management samjha jata hai.",
        },
        {
          id: "q5",
          prompt: "Aik trade ka risk-reward ratio 1:0.5 hai (potential gain se zyada risk karte huay). Breakeven tak pahunchne ke liye zaroori win rate ke liye is ka kya matlab hai?",
          options: [
            { id: "a", text: "Sirf breakeven tak pahunchne ke liye 50% se kahin zyada win rate ki zaroorat hai" },
            { id: "b", text: "Mushkil se koi winning trade ki zaroorat hai" },
            { id: "c", text: "Is ratio per win rate matter nahi karti" },
            { id: "d", text: "Yeh ratio win rate se qata-nazar hamesha loss guarantee karta hai" },
          ],
          explanation: "Jab potential loss potential gain se zyada ho, to sirf waqt ke sath net loss se bachnay ke liye aap ko disproportionately high proportion trades jeetnay ki zaroorat hoti hai.",
        },
      ],
    },
  },

  "trading-journal": {
    sections: [
      {
        heading: "Jo aap record nahi karte usay improve nahi kar saktay",
        body: "Trading journal aap ki har trade ka aik structured record hai — sirf outcome nahi, balke us ke peechay ki reasoning. Iske baghair, traders apni best trades ko vividly yaad rakhne aur worst trades ko conveniently bhool jane ya rationalize karne ki tendency rakhte hain, jis se honest self-assessment taqreeban impossible ho jati hai.",
      },
      {
        heading: "Aik useful journal entry mein asal mein kya hona chahiye",
        body: "Rakhne layak journal entry sirf \"jeeta\" ya \"hara\" se zyada capture karti hai — yeh decision-making ka context capture karti hai, is liye patterns (achay aur buray) dozens entries ke daran visible ho jatay hain bajaye memory mein invisible rehnay ke.",
        list: [
          "Setup/reason enter karne ka (kaunsa signal ya analysis ne trade trigger ki)",
          "Entry price, stop-loss, take-profit, aur position size",
          "Actual outcome aur achieved R:R",
          "Entry aur exit ke waqt aap ki emotional state (calm? anxious? loss chase kar rahay thay?)",
          "Aik short, honest note: aap kya alag karenge, agar kuch?",
        ],
      },
      {
        body: "Apni trades record karen chahe — especially — boring, correct-in-process losses jahan aap ne apna plan exactly follow kiya aur phir bhi loss hui. Yeh proof hain ke aap ka process sound ho sakta hai chahe aik specific trade profitable na ho, jo aik alag (aur zyada healthy) lesson hai \"main wrong tha\" se.",
      },
      {
        caption: "Aik trading journal scattered individual trades ko aik visible, improvable pattern mein convert kar deta hai.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Trading journal sirf wins aur losses track karne se aage, kyun important hai?",
          options: [
            { id: "a", text: "Yeh har country mein aik legal requirement hai" },
            { id: "b", text: "Yeh decision-making ka context record karta hai, un patterns ko visible banata hai jinhe memory alone miss ya rationalize kar deti" },
            { id: "c", text: "Yeh automatically aap ki win rate barha deta hai" },
            { id: "d", text: "Yeh stop-loss ki zaroorat ko replace kar deta hai" },
          ],
          explanation: "Core value honest, structured self-assessment hai — memory alone bari wins ko overvalue karne aur losses ko rationalize karne ki tendency rakhti hai, jo journal correct kar deta hai.",
        },
        {
          id: "q2",
          prompt: "Is lesson ke mutabiq, aik well-structured journal entry mein in mein se kya hona chahiye?",
          options: [
            { id: "a", text: "Sirf yeh ke trade jeeti ya haari" },
            { id: "b", text: "Setup/reasoning, entry/stop/target levels, outcome, aur aap ki emotional state" },
            { id: "c", text: "Sirf broker ka naam" },
            { id: "d", text: "Kuch nahi — journal rakhna aik unnecessary optional kaam hai" },
          ],
          explanation: "Aik useful entry mukammal decision context capture karti hai — sirf binary outcome nahi — jis mein entry/exit ke waqt emotional state bhi shamil hai.",
        },
        {
          id: "q3",
          prompt: "Jahan aap ne plan exactly follow kiya aur phir bhi loss hui wo trade record karna kyun chahiye?",
          options: [
            { id: "a", text: "Nahi karni chahiye — sirf winning trades record karne layak hain" },
            { id: "b", text: "Kyunke yeh evidence hai ke aap ka process sound ho sakta hai chahe aik individual trade profitable na ho — jo \"main wrong tha\" se aik alag lesson hai" },
            { id: "c", text: "Kyunke losses hamesha record se remove honi chahiye" },
            { id: "d", text: "Kyunke yeh guarantee karta hai ke next trade jeetegi" },
          ],
          explanation: "Aik process-correct loss aik valuable data point hai: yeh dikhata hai ke plan achi execution ke bawajood kabhi kabhi loss kar sakta hai, jo har loss ko personal mistake samajhne se zyada healthy distinction hai.",
        },
        {
          id: "q4",
          prompt: "Bina journal ke, trader ki apni trading history ki memory ke sath aam taur per kya hone ki tendency hoti hai?",
          options: [
            { id: "a", text: "Yeh perfectly accurate aur unbiased reh jati hai" },
            { id: "b", text: "Bari wins vividly yaad rehnay aur losses ko bhool ya rationalize karne ki tendency hoti hai" },
            { id: "c", text: "Yeh automatically waqt ke sath zyada detailed ho jati hai" },
            { id: "d", text: "Journal ke sath ya baghair koi farq nahi parta" },
          ],
          explanation: "Yeh selective-memory bias exactly wajah hai ke aik external, structured record kyun matter karta hai — yeh self-serving recall ke against aik check hai.",
        },
        {
          id: "q5",
          prompt: "Waqt ke sath trading journal review karne ka ultimate goal kya hai?",
          options: [
            { id: "a", text: "Har future individual trade jeetna" },
            { id: "b", text: "Bohat se trades mein recurring patterns (achay aur buray) spot karna aur apna process refine karna" },
            { id: "c", text: "Apne broker ka commission calculate karna" },
            { id: "d", text: "Exact future prices predict karna" },
          ],
          explanation: "Journal ki value bohat se entries mein accumulate hoti hai — aap ke apnay behavior aur decision-making mein patterns ko ujagar karte hue jo koi single trade ka outcome kabhi reveal nahi kar sakta.",
        },
      ],
    },
  },

  "fomo-and-greed": {
    sections: [
      {
        heading: "Do emotions jo otherwise solid plans barbaad kar dete hain",
        body: "FOMO (Fear Of Missing Out) aik already chal rahe move mein kood parne ka anxious impulse hai, usually apne normal setup criteria ke pooray huay baghair, kyunke \"yeh mere baghair move kar raha hai\". Greed aik winning position ko apne planned target se aage hold karne ka, aik position ko oversize karne ka kyunke trade \"unstoppable\" feel kar rahi hai, ya aik bari win ke baad turant reenter kar ke aur paane ki koshish karne ka impulse hai.",
      },
      {
        heading: "Yeh specifically aap ke process per kyun attack karte hain",
        body: "Dono emotions aik common mechanism share karte hain: yeh aap ko convince karte hain ke aik rule chhor dein jo aap ne pehlay se (calmly, clear mind se) set kiya tha, us lamhay ke impulse ke favor mein (emotional pressure ke under). Rule precisely is liye exist karta tha kyunke aap ka calm, planning wala self jaanta tha ke aap ka in-the-moment self us decision ko achay se lene ke liye trust nahi kiya ja sakta.",
        list: [
          "FOMO entry: late enter karna, bina stop-loss plan ke ya oversized position ke sath move chase karna, kyunke setup already \"obviously\" correct lag rahi hai.",
          "Greed se target abandonment: trade ke beech mein apna take-profit aur door move karna kyunke move \"continue\" ho sakta hai, aik planned win ko unplanned gamble mein convert karte huay.",
          "Revenge trading: loss \"recover\" karne ke liye turant doosri trade mein reenter karna, usually impaired judgment ke sath aur aksar oversized.",
          "Teenon ka common solution: emotional moment se PEHLAY entry/exit rules ko commit karna, aur unse deviate hone ko aik process failure treat karna chahe yeh specific deviation work kar gaya ho ya nahi.",
        ],
      },
      {
        body: "Aik trade jo aap ke rules todti hai magar jeet jati hai, long-term mein us se zyada dangerous hai jo aap ke rules follow karti hai aur harti hai — winning rule-break aap ko wrong lesson sikhata hai (\"yeh work kar gaya, is liye theek hai\") aur next rule-break ko aasan bana deta hai.",
      },
      {
        caption: "Emotional hijack ki wo sequence jisko interrupt karne ke liye pehlay se committed rules exist karti hain.",
      },
      {
        body: "Revenge trading teenon mein sab se zyada dangerous hai kyunke yeh compound hota hai: aik loss aik impulsive, oversized reentry trigger karta hai, jo statistically zyada likely hai ke phir se lose karey, jo \"usay recover karne\" ka aik aur zyada strong impulse trigger karta hai. Har cycle position size aur emotional stakes dono ko barha deta hai — isi tarah aik manageable loss account-ending ban jati hai.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "FOMO (Fear Of Missing Out) usually trader ko kya karne ki taraf drive karta hai?",
          options: [
            { id: "a", text: "Apne normal setup criteria pooray hone ka patiently intezar karna" },
            { id: "b", text: "Already chal rahe move mein kood parna, aksar apne normal setup criteria pooray huay baghair" },
            { id: "c", text: "Automatically position size kam karna" },
            { id: "d", text: "Sab open positions ko immediately close karna" },
          ],
          explanation: "FOMO specifically aik already ho rahi move ko chase karne ka anxious impulse hai, usually trader ke apne normal entry rules ko bypass karte huay.",
        },
        {
          id: "q2",
          prompt: "\"Revenge trading\" kya hai?",
          options: [
            { id: "a", text: "Apni trading journal mein calmly aik loss review karna" },
            { id: "b", text: "Loss ke baad turant market mein reenter karna isay \"recover\" karne ki koshish karne ke liye, usually impaired judgment ke sath" },
            { id: "c", text: "Aik tarah ki limit order" },
            { id: "d", text: "Losing streak ke baad risk kam karna" },
          ],
          explanation: "Revenge trading aik loss ko immediately recover karne ki impulsive koshish hai, typically emotional pressure ke under bad decision-making se original mistake ko aggravate karte huay.",
        },
        {
          id: "q3",
          prompt: "Is lesson ke mutabiq, FOMO aur greed kaunsa common mechanism share karte hain?",
          options: [
            { id: "a", text: "Dono mein pehlay se calmly set ki gayi rule ko chhorna shamil hai, us lamhay ke emotional impulse ke favor mein" },
            { id: "b", text: "Dono sirf beginner traders ko affect karte hain, experienced ko kabhi nahi" },
            { id: "c", text: "Dono consistent profitability ke liye zaroori hain" },
            { id: "d", text: "Dono mein se koi bhi trading outcomes per real effect nahi rakhta" },
          ],
          explanation: "Core pattern same hai: aik pehlay se committed, clear-mind rule us lamhay ke emotional impulse se override hoti hai — yehi exactly woh cheez hai jis se pehlay-se-commitment protect karne ke liye bani hai.",
        },
        {
          id: "q4",
          prompt: "Aik rule-breaking trade jo JEET jati hai, long-term mein kyun dangerous samjhi jati hai?",
          options: [
            { id: "a", text: "Yeh dangerous nahi hai — koi bhi winning trade achi hoti hai" },
            { id: "b", text: "Yeh wrong lesson reinforce karti hai (\"rule todna work kar gaya\"), jo next rule-break ko aasan bana deta hai" },
            { id: "c", text: "Winning trades hamesha regulator ko report honi chahiye" },
            { id: "d", text: "Yeh guarantee karti hai ke next trade bhi rules todegi" },
          ],
          explanation: "Aik winning rule-break trader ko sikhata hai ke rule us baar matter nahi karti, jo future trades ke liye discipline erode karta hai chahe outcome purely chance se achcha tha.",
        },
        {
          id: "q5",
          prompt: "FOMO, greed, aur revenge trading teenon ke liye recommended general solution kya hai?",
          options: [
            { id: "a", text: "Emotional moment se pehlay entry/exit rules ko commit karna, aur outcome se qata-nazar unse deviate hone ko process failure treat karna" },
            { id: "b", text: "Purely emotional instinct per trade karna, kyunke rules profit potential ko limit karte hain" },
            { id: "c", text: "Sirf tab trade karen jab aap extremely confident feel karen" },
            { id: "d", text: "Jaldi recover hone ke liye har loss ke baad position size barhana" },
          ],
          explanation: "Lesson ka core solution pre-commitment hai: live trade ke emotional pressure se pehlay, calm state mein rules decide karna, aur unhe maintain karna chahe aik specific deviation work kar gayi ho ya na ho.",
        },
      ],
    },
  },
};
