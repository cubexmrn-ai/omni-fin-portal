// lib/i18n/academyBody/fr.js
//
// French (fr) full lesson-BODY translation pack — see
// lib/i18n/academyBodyContent.js's header comment for the exact scope
// and merge rules. Keyed by lessonId; `sections` entries are matched
// by ARRAY INDEX against the lesson's own `sections` array in
// lib/academyData.js, and quiz questions are matched by their stable `id`.

export const ACADEMY_BODY_FR = {
  "inflation-reality": {
    sections: [
      {
        heading: "Pourquoi un dollar d'aujourd'hui achète moins demain",
        body: "L'inflation est une hausse soutenue du niveau général des prix des biens et services — ce qui signifie que chaque unité de monnaie achète un peu moins avec le temps. Ce n'est pas un défaut ; dans la plupart des économies modernes, c'est un objectif de politique délibéré (généralement autour de 2% par an), car les banques centrales pensent qu'une inflation modérée et prévisible encourage les dépenses et l'investissement plutôt que la thésaurisation.",
      },
      {
        heading: "La taxe silencieuse sur l'épargne",
        body: "Si votre épargne reste en liquidités rapportant 0% pendant que les prix augmentent de 5% par an, votre richesse réelle (ajustée à l'inflation) diminue même si le chiffre sur votre compte reste identique. C'est pourquoi \"épargner\" et \"investir\" sont des objectifs différents : épargner préserve le montant nominal, investir vise à dépasser le taux d'inflation.",
        list: [
          "Valeur nominale : le chiffre imprimé sur le billet ou le relevé — ne baisse jamais d'elle-même.",
          "Valeur réelle : ce que ce chiffre peut réellement acheter — baisse chaque fois que l'inflation est positive.",
          "Pouvoir d'achat : un autre nom pour la valeur réelle, généralement suivi par rapport à un panier de biens (un indice des prix à la consommation).",
        ],
      },
      {
        body: "Comparez les prix, pas seulement les montants en monnaie, au fil du temps. \"Mon loyer n'a augmenté que de 20% en 5 ans\" semble correct jusqu'à ce que vous vérifiiez si les salaires moyens ou l'IPC ont augmenté plus ou moins que cela.",
      },
      {
        label: "Rendement Réel",
        note: "Un compte d'épargne rapportant 3% d'intérêt pendant une inflation de 6% vous fait quand même perdre environ 3% de pouvoir d'achat réel par an.",
      },
      {
        caption: "Le même billet de 100 $, achetant moins à chaque décennie qui passe avec un taux d'inflation annuel constant de 2%.",
      },
      {
        caption: "Essayez : voyez exactement combien un montant passé s'est érodé en pouvoir d'achat réel.",
      },
      {
        caption: "Essayez : projetez un plan d'investissement à cotisations mensuelles et voyez s'il dépasse l'inflation.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Que signifie fondamentalement l'\"inflation\" ?",
          options: [
            { id: "a", text: "Les taux d'intérêt augmentent" },
            { id: "b", text: "Le niveau général des prix des biens et services augmente avec le temps" },
            { id: "c", text: "Le marché boursier monte" },
            { id: "d", text: "Une monnaie a été dévaluée par rapport à l'or" },
          ],
          explanation: "L'inflation est spécifiquement une hausse soutenue du niveau général des prix — ce qui équivaut à une baisse de ce que chaque unité de monnaie peut acheter.",
        },
        {
          id: "q2",
          prompt: "Votre compte d'épargne rapporte 2% d'intérêt par an tandis que l'inflation est de 5%. Que se passe-t-il pour votre pouvoir d'achat réel ?",
          options: [
            { id: "a", text: "Il augmente d'environ 7% par an" },
            { id: "b", text: "Il reste inchangé, puisque le solde continue de croître" },
            { id: "c", text: "Il diminue d'environ 3% par an" },
            { id: "d", text: "Cela dépend uniquement du taux de change" },
          ],
          explanation: "Rendement Réel ≈ Rendement Nominal − Taux d'Inflation, donc 2% − 5% = −3%. Le chiffre sur le compte continue de croître, mais ce qu'il peut acheter diminue.",
        },
        {
          id: "q3",
          prompt: "La \"valeur nominale\" désigne :",
          options: [
            { id: "a", text: "Le pouvoir d'achat de l'argent ajusté à l'inflation" },
            { id: "b", text: "Le simple chiffre imprimé sur un billet ou affiché sur un relevé" },
            { id: "c", text: "La valeur de l'argent dans une monnaie étrangère" },
            { id: "d", text: "La valeur de l'or garantissant une monnaie" },
          ],
          explanation: "La valeur nominale n'est que le montant facial — elle ne baisse jamais d'elle-même. La valeur réelle est ce même montant ajusté à ce qu'il peut réellement acheter.",
        },
        {
          id: "q4",
          prompt: "Pourquoi la plupart des banques centrales visent-elles un petit taux d'inflation positif (comme 2%) plutôt que 0% ?",
          options: [
            { id: "a", text: "Pour rendre automatiquement les importations moins chères" },
            { id: "b", text: "Parce que la déflation (baisse des prix) est mathématiquement impossible" },
            { id: "c", text: "Pour dissuader la thésaurisation et encourager les dépenses/investissements" },
            { id: "d", text: "Il n'y a pas de vraie raison — c'est arbitraire" },
          ],
          explanation: "Une inflation modérée et prévisible est largement utilisée comme politique car elle pousse les gens à dépenser et investir plutôt qu'à garder des liquidités qui perdent lentement de la valeur de toute façon.",
        },
        {
          id: "q5",
          prompt: "Un panier de biens qui coûtait 100 $ il y a dix ans coûte maintenant 122 $. De quel pourcentage les prix ont-ils augmenté, et qu'est-ce que cela signifie pour 100 $ gardés en liquidités pendant tout ce temps ?",
          options: [
            { id: "a", text: "Les prix ont augmenté de 22% ; ces mêmes 100 $ achètent maintenant moins du panier qu'avant" },
            { id: "b", text: "Les prix ont baissé de 22% ; les 100 $ achètent plus maintenant" },
            { id: "c", text: "Les prix sont inchangés ; seuls les salaires comptent" },
            { id: "d", text: "Cela n'a aucun effet sur le pouvoir d'achat" },
          ],
          explanation: "Une hausse de 100 $ à 122 $ pour le même panier représente une inflation cumulée de 22% — ce même billet de 100 $ ne couvre plus ce panier.",
        },
      ],
    },
  },

  "money-vs-fiat": {
    sections: [
      {
        heading: "Qu'est-ce qui fait de quelque chose de la \"monnaie\" ?",
        body: "Les économistes s'accordent généralement sur le fait que la monnaie doit bien remplir trois fonctions : servir de moyen d'échange (les gens l'accepteront contre des biens/services), de réserve de valeur (elle garde sa valeur dans le temps) et d'unité de compte (les prix peuvent être cotés de manière significative dans cette unité). Historiquement, des choses comme l'or, l'argent, le sel et même de grands disques de pierre ont servi de monnaie à des degrés variables.",
      },
      {
        heading: "La monnaie fiduciaire : la monnaie par décret",
        body: "\"Fiat\" vient du latin pour \"qu'il soit fait\". La monnaie fiduciaire (comme le dollar américain, l'euro ou la roupie pakistanaise aujourd'hui) a de la valeur parce qu'un gouvernement la déclare cours légal et que les gens font confiance au fait qu'elle continuera d'être acceptée — pas parce qu'elle est garantie par une quantité fixe d'une matière physique. Depuis 1971, lorsque les États-Unis ont mis fin à la convertibilité du dollar en or (le \"choc Nixon\"), pratiquement toutes les grandes monnaies mondiales sont fiduciaires.",
        list: [
          "Monnaie-marchandise : la valeur vient du matériau lui-même (une pièce d'or vaut à peu près son contenu en or).",
          "Monnaie représentative : une créance papier remboursable contre une quantité fixe d'une marchandise (un ancien certificat d'or).",
          "Monnaie fiduciaire : la valeur vient du décret gouvernemental et de la confiance du public — non garantie par une marchandise remboursable.",
        ],
      },
      {
        body: "La plus grande force de la monnaie fiduciaire (les banques centrales peuvent rapidement étendre ou contracter la masse monétaire pour répondre à une crise) est aussi sa plus grande faiblesse à long terme (cette même flexibilité rend structurellement facile une dévaluation progressive de la monnaie).",
      },
      {
        caption: "Deux réponses très différentes à \"pourquoi ce morceau de papier a-t-il de la valeur ?\"",
      },
      {
        label: "Voir les taux de change des monnaies fiduciaires en direct dans le Convertisseur",
        note: "Comparez comment la valeur d'une monnaie fiduciaire flotte par rapport aux autres — et par rapport à l'or — en temps réel.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Laquelle des propositions suivantes n'est PAS une des trois fonctions classiques que la monnaie doit remplir ?",
          options: [
            { id: "a", text: "Moyen d'échange" },
            { id: "b", text: "Réserve de valeur" },
            { id: "c", text: "Unité de compte" },
            { id: "d", text: "Garantie d'un taux d'intérêt fixe" },
          ],
          explanation: "Les trois fonctions classiques sont le moyen d'échange, la réserve de valeur et l'unité de compte. Les taux d'intérêt sont un concept de politique monétaire distinct, pas une fonction définissant la monnaie.",
        },
        {
          id: "q2",
          prompt: "Qu'est-ce qui donne aujourd'hui sa valeur à une monnaie fiduciaire comme le dollar américain ?",
          options: [
            { id: "a", text: "Une quantité fixe et remboursable d'or détenue par la banque centrale" },
            { id: "b", text: "Le décret gouvernemental (statut de cours légal) et la confiance du public" },
            { id: "c", text: "Son poids en argent" },
            { id: "d", text: "Un taux de change fixe avec le Bitcoin" },
          ],
          explanation: "La monnaie fiduciaire est garantie par le décret gouvernemental et la confiance du public qu'elle continuera d'être acceptée — pas par une marchandise remboursable.",
        },
        {
          id: "q3",
          prompt: "Quel événement historique est couramment cité comme ayant mis fin à la convertibilité directe du dollar américain en or ?",
          options: [
            { id: "a", text: "La crise financière de 2008" },
            { id: "b", text: "L'Accord de Bretton Woods de 1944" },
            { id: "c", text: "Le \"choc Nixon\" de 1971" },
            { id: "d", text: "La création de l'euro" },
          ],
          explanation: "En 1971, le président Nixon a suspendu la convertibilité du dollar en or, faisant effectivement basculer les États-Unis (puis bientôt le reste du monde) vers un système entièrement fiduciaire.",
        },
        {
          id: "q4",
          prompt: "Quel est le principal risque structurel couramment associé aux systèmes de monnaie fiduciaire ?",
          options: [
            { id: "a", text: "Les banques centrales ne peuvent pas répondre rapidement aux crises économiques" },
            { id: "b", text: "La masse monétaire peut être étendue relativement facilement, risquant la dévaluation/inflation" },
            { id: "c", text: "Elle ne peut jamais être utilisée pour le commerce international" },
            { id: "d", text: "Elle doit toujours être imprimée physiquement, sans forme numérique" },
          ],
          explanation: "Comme l'offre fiduciaire n'est pas ancrée à une matière physique fixe, elle peut être étendue par des décisions politiques — ce qui est flexible en cas de crise, mais rend structurellement la dévaluation progressive plus facile que sous un système adossé à des matières premières.",
        },
        {
          id: "q5",
          prompt: "Un ancien billet de papier échangeable physiquement dans une banque contre une quantité fixe d'or est un exemple de :",
          options: [
            { id: "a", text: "Monnaie fiduciaire" },
            { id: "b", text: "Monnaie représentative" },
            { id: "c", text: "Cryptomonnaie" },
            { id: "d", text: "Un contrat dérivé" },
          ],
          explanation: "C'est de la monnaie représentative — une créance papier remboursable contre une quantité fixe d'une marchandise, distincte à la fois de la monnaie-marchandise pure et de la monnaie fiduciaire.",
        },
      ],
    },
  },

  "fractional-reserve-banking": {
    sections: [
      {
        heading: "Votre dépôt ne reste pas simplement dans un coffre-fort",
        body: "Lorsque vous déposez 1 000 $ dans une banque, celle-ci ne les enferme pas dans un coffre en attendant que vous les retiriez. Dans le système de réserves fractionnaires, elle ne garde qu'une fraction en réserve et prête le reste, gagnant des intérêts sur ces prêts. Historiquement, les régulateurs fixaient un ratio de réserve minimum spécifique ; en pratique, les cadres modernes (comme l'approche américaine post-2020) s'appuient souvent davantage sur des exigences de capital et de liquidité qu'un ratio de réserve unique fixe, mais le mécanisme central — les banques prêtant la majorité de ce qui est déposé — reste inchangé.",
      },
      {
        heading: "Comment cela crée de la nouvelle monnaie",
        body: "Cet argent prêté est généralement dépensé puis redéposé dans le système bancaire, où la banque receveuse prête à nouveau la majeure partie. Répété à travers tout le système, ce processus multiplie effectivement le dépôt initial en une quantité de monnaie en circulation bien plus importante — sans imprimer un seul nouveau billet.",
        list: [
          "Vous déposez 1 000 $. La banque garde une réserve et prête le reste.",
          "L'emprunteur le dépense ; le destinataire le dépose dans (peut-être) une autre banque.",
          "Cette banque garde à nouveau une réserve et prête le reste — et le cycle se répète.",
          "Le plafond théorique de la monnaie totale créée est approximativement le dépôt initial divisé par le ratio de réserve.",
        ],
      },
      {
        label: "Multiplicateur Monétaire Simple",
        note: "À un ratio de réserve de 10%, un dépôt de 1 000 $ peut théoriquement soutenir jusqu'à 10 000 $ de dépôts totaux à l'échelle du système. Les chiffres réels sont généralement plus bas en raison des avoirs en liquidités, des réserves excédentaires et de la demande de prêts.",
      },
      {
        body: "C'est exactement pourquoi une \"panique bancaire\" (tout le monde essayant de retirer en même temps) est dangereuse : la banque ne détient réellement pas le dépôt complet de tous en liquidités au même moment — c'est en grande partie prêté.",
      },
      {
        caption: "Comment un dépôt se répercute dans le système bancaire, élargissant la masse monétaire effective.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Dans le système de réserves fractionnaires, que fait une banque de la majorité du dépôt d'un client ?",
          options: [
            { id: "a", text: "Elle en garde 100% dans un coffre-fort" },
            { id: "b", text: "Elle en prête la majorité pour gagner des intérêts, ne gardant qu'une fraction en réserve" },
            { id: "c", text: "Elle le convertit entièrement en or" },
            { id: "d", text: "Elle l'envoie directement et de façon permanente à la banque centrale" },
          ],
          explanation: "Le système de réserves fractionnaires signifie que seule une fraction des dépôts est détenue en réserve ; le reste est prêté, ce qui est la façon dont les banques gagnent des revenus d'intérêts.",
        },
        {
          id: "q2",
          prompt: "À un ratio de réserve de 10%, combien d'argent total à l'échelle du système un seul dépôt de 1 000 $ pourrait-il théoriquement soutenir, avant de tenir compte des fuites du monde réel ?",
          options: [
            { id: "a", text: "1 000 $" },
            { id: "b", text: "1 100 $" },
            { id: "c", text: "10 000 $" },
            { id: "d", text: "100 000 $" },
          ],
          explanation: "Multiplicateur Monétaire Simple ≈ Dépôt Initial ÷ Ratio de Réserve = 1 000 $ ÷ 0,10 = 10 000 $ comme plafond théorique.",
        },
        {
          id: "q3",
          prompt: "Pourquoi une \"panique bancaire\" soudaine peut-elle être dangereuse pour une banque opérant sous réserves fractionnaires ?",
          options: [
            { id: "a", text: "Les banques sont légalement tenues de refuser tous les retraits pendant une panique" },
            { id: "b", text: "La banque ne détient pas le dépôt complet de tous en liquidités à la fois — une grande partie est prêtée" },
            { id: "c", text: "Les paniques bancaires causent toujours l'hyperinflation en quelques heures" },
            { id: "d", text: "Cela n'a aucun effet réel ; les réserves couvrent toujours 100% des dépôts" },
          ],
          explanation: "Comme la majorité de l'argent déposé a été prêté, une banque ne peut véritablement pas rendre instantanément 100% de tous les dépôts en liquidités si tout le monde l'exige simultanément.",
        },
        {
          id: "q4",
          prompt: "Dans le cycle d'expansion des dépôts, que se passe-t-il généralement juste après qu'un emprunteur dépense un prêt ?",
          options: [
            { id: "a", text: "L'argent quitte définitivement le système bancaire" },
            { id: "b", text: "Il est généralement redéposé quelque part dans le système bancaire, permettant un nouveau cycle de prêt" },
            { id: "c", text: "Il est détruit par la banque centrale" },
            { id: "d", text: "Il doit être converti en monnaie étrangère" },
          ],
          explanation: "Les produits d'un prêt dépensé sont généralement redéposés (par celui qui les a reçus), permettant à cette banque receveuse de répéter le processus de prêt de la majeure partie.",
        },
        {
          id: "q5",
          prompt: "Quel a été le changement général dans la façon dont de nombreux cadres réglementaires bancaires modernes abordent la sécurité bancaire, au-delà d'un ratio de réserve unique fixe ?",
          options: [
            { id: "a", text: "Une dépendance croissante aux exigences de capital et de liquidité en parallèle/à la place d'un ratio unique fixe" },
            { id: "b", text: "Élimination complète de toute exigence de réserve ou de capital" },
            { id: "c", text: "Un retour à une exigence de réserve 100% adossée à l'or partout" },
            { id: "d", text: "Exiger des banques qu'elles détiennent des réserves uniquement en cryptomonnaie" },
          ],
          explanation: "De nombreux cadres modernes (comme l'approche américaine post-2020) s'appuient davantage sur des exigences d'adéquation des fonds propres et de couverture de liquidité qu'un ratio de réserve historique unique, même si le mécanisme central de prêt fractionnaire demeure.",
        },
      ],
    },
  },

  "gold-vs-paper-money": {
    sections: [
      {
        heading: "Pourquoi l'or a conservé sa valeur pendant des millénaires",
        body: "L'or a été utilisé comme monnaie ou réserve de valeur dans presque toutes les grandes civilisations pendant des milliers d'années. Il est rare, presque indestructible, divisible et coûteux à produire davantage — des propriétés qui en ont fait naturellement une \"monnaie dure\" bien avant l'existence de la monnaie papier. Contrairement à un billet fiduciaire, la valeur de l'or ne dépend de la promesse d'aucun gouvernement unique.",
      },
      {
        heading: "Pourquoi la monnaie papier a quand même gagné",
        body: "Malgré la durabilité de l'or comme réserve de valeur, transporter et vérifier de l'or physique pour des transactions quotidiennes est peu pratique. La monnaie papier (et plus tard, les soldes numériques) a résolu le problème de commodité : elle est légère, facile à diviser en montants exacts et facile à déplacer électroniquement partout dans le monde en quelques secondes — des compromis que l'or ne peut intrinsèquement pas égaler.",
        list: [
          "Or : rare, durable, historiquement fiable — mais lourd, difficile à diviser précisément, lent à échanger physiquement.",
          "Papier/fiduciaire : pratique, transférable instantanément, programmable — mais son offre peut être étendue, l'exposant au risque d'inflation.",
          "De nombreux investisseurs détiennent aujourd'hui de l'or spécifiquement comme couverture contre l'inflation/la dévaluation monétaire, pas comme argent de dépense quotidienne.",
        ],
      },
      {
        body: "C'est exactement pourquoi le Calculateur de Métaux et Matières Premières existe sur cette plateforme — le prix de l'or/argent est cotée par once troy et converti dans votre monnaie locale et unité de poids, ce qui est le point de départ réel pour penser l'or comme réserve de valeur.",
      },
      {
        caption: "Essayez : voyez le prix en direct de l'or, de l'argent, du platine, du palladium ou du cuivre dans votre unité de poids et monnaie préférées.",
      },
      {
        caption: "Aucun n'est strictement \"meilleur\" — ils résolvent des problèmes différents. De nombreux portefeuilles utilisent les deux.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Quelle propriété a rendu l'or utile comme monnaie ou réserve de valeur à travers l'histoire ?",
          options: [
            { id: "a", text: "Il est facile de le produire en masse à la demande" },
            { id: "b", text: "Il est rare, durable et divisible" },
            { id: "c", text: "Sa valeur est fixée par un seul gouvernement" },
            { id: "d", text: "Il se dégrade rapidement, encourageant les dépenses" },
          ],
          explanation: "La rareté, la durabilité et la divisibilité de l'or (en plus d'être coûteux à produire davantage) expliquent exactement pourquoi il est devenu une réserve de valeur fiable longtemps avant l'existence de la monnaie fiduciaire.",
        },
        {
          id: "q2",
          prompt: "Quel est le principal désavantage pratique de l'or par rapport à l'argent papier/numérique pour les transactions quotidiennes ?",
          options: [
            { id: "a", text: "Il n'a aucune valeur" },
            { id: "b", text: "Il est lourd, plus difficile à diviser précisément, et lent à échanger physiquement" },
            { id: "c", text: "Il ne peut être utilisé que dans un seul pays" },
            { id: "d", text: "Il est illégal d'en posséder dans la plupart des pays" },
          ],
          explanation: "Les propriétés physiques de l'or le rendent peu pratique pour les dépenses rapides du quotidien — exactement le vide qu'ont comblé la monnaie papier et numérique.",
        },
        {
          id: "q3",
          prompt: "Pourquoi de nombreux investisseurs détiennent-ils de l'or spécifiquement comme couverture, même dans un monde de monnaie fiduciaire ?",
          options: [
            { id: "a", text: "L'or garantit un rendement annuel fixe" },
            { id: "b", text: "Son offre ne peut pas être étendue comme celle de la monnaie fiduciaire, ce qui aide historiquement à préserver le pouvoir d'achat" },
            { id: "c", text: "L'or est plus facile à dépenser que les liquidités" },
            { id: "d", text: "Il élimine tout risque d'investissement" },
          ],
          explanation: "L'offre fixe et difficile à étendre de l'or est la raison centrale pour laquelle il est utilisé comme couverture contre la dévaluation monétaire et l'inflation, pas parce qu'il offre un rendement garanti.",
        },
        {
          id: "q4",
          prompt: "Sur le Calculateur de Métaux et Matières Premières de cette plateforme, les prix de l'or et de l'argent sont cotés par :",
          options: [
            { id: "a", text: "Once troy" },
            { id: "b", text: "Baril" },
            { id: "c", text: "Tonne métrique uniquement" },
            { id: "d", text: "Carat uniquement" },
          ],
          explanation: "Les métaux précieux sur cette plateforme (or, argent, platine, palladium, cuivre) sont cotés par once troy, puis convertis dans l'unité de poids et la monnaie de votre choix.",
        },
        {
          id: "q5",
          prompt: "Quelle affirmation résume le mieux le compromis or contre monnaie papier ?",
          options: [
            { id: "a", text: "L'or est toujours strictement supérieur à la monnaie fiduciaire dans toute situation" },
            { id: "b", text: "La monnaie fiduciaire est toujours strictement supérieure à l'or dans toute situation" },
            { id: "c", text: "Ils résolvent des problèmes différents — l'or comme réserve de valeur à long terme, le fiduciaire pour la commodité et la liquidité quotidiennes" },
            { id: "d", text: "Il n'y a aucune différence significative entre les deux" },
          ],
          explanation: "Aucun ne l'emporte complètement — la force de l'or est la préservation de la valeur à long terme sans risque de contrepartie, tandis que la force du fiduciaire est la commodité et la liquidité pour les transactions quotidiennes.",
        },
      ],
    },
  },

  "candlestick-anatomy": {
    sections: [
      {
        heading: "Une bougie, quatre prix",
        body: "Une bougie résume l'évolution du prix sur une période choisie (une minute, une heure, un jour — quelle que soit l'\"unité de temps\" du graphique) à l'aide de quatre chiffres : l'Ouverture, le Plus Haut, le Plus Bas et la Clôture (souvent abrégés OHLC). La partie épaisse est le \"corps\" (l'écart entre ouverture et clôture) ; les fines lignes au-dessus et en dessous sont des \"mèches\" ou \"ombres\" (l'amplitude complète du plus haut/plus bas atteinte durant cette période).",
      },
      {
        heading: "Haussière vs. baissière",
        body: "Si la clôture est plus haute que l'ouverture, la bougie est haussière (le prix a monté pendant cette période) — généralement affichée en vert ou blanc, creuse/non remplie. Si la clôture est plus basse que l'ouverture, elle est baissière (le prix a baissé) — généralement affichée en rouge ou noir, remplie. La convention de couleur peut être personnalisée sur la plupart des plateformes, mais vert=hausse / rouge=baisse est la valeur par défaut la plus courante.",
        list: [
          "Ouverture : le premier prix échangé de la période",
          "Plus Haut : le prix le plus élevé échangé de la période",
          "Plus Bas : le prix le plus bas échangé de la période",
          "Clôture : le dernier prix échangé de la période",
          "Corps : la boîte entre l'Ouverture et la Clôture",
          "Mèche/Ombre : la/les fine(s) ligne(s) montrant le Plus Haut et le Plus Bas au-delà du corps",
        ],
      },
      {
        body: "Une longue mèche d'un côté d'une bougie raconte une histoire : le prix a fortement poussé dans cette direction, puis a été rejeté et a reculé avant la fin de la période — souvent le signe d'une lutte acheteurs/vendeurs à ce niveau.",
      },
      {
        caption: "Une bougie haussière : la clôture est au-dessus de l'ouverture, donc le corps est non rempli/vert, avec des mèches montrant l'amplitude complète du plus haut/plus bas.",
      },
      {
        caption: "Une bougie baissière : la clôture est en dessous de l'ouverture, donc le corps est rempli/rouge.",
      },
      {
        label: "Lisez des graphiques en bougies en direct sur Analyse de Marché",
        note: "Ouvrez un graphique TradingView interactif complet pour n'importe quel symbole et repérez ces motifs de bougies sur un graphique réel et en direct.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Quels quatre prix une seule bougie représente-t-elle ?",
          options: [
            { id: "a", text: "Ouverture, Plus Haut, Plus Bas, Clôture" },
            { id: "b", text: "Bid, Ask, Spread, Volume" },
            { id: "c", text: "Support, Résistance, Pivot, Tendance" },
            { id: "d", text: "Ouverture, Clôture, Volume, Spread" },
          ],
          explanation: "Une bougie est construite à partir des prix d'Ouverture, de Plus Haut, de Plus Bas et de Clôture (OHLC) de sa période.",
        },
        {
          id: "q2",
          prompt: "Une bougie clôture AU-DESSUS de son ouverture. De quel type de bougie s'agit-il ?",
          options: [
            { id: "a", text: "Baissière" },
            { id: "b", text: "Haussière" },
            { id: "c", text: "Neutre/Doji uniquement" },
            { id: "d", text: "On ne peut pas le déterminer avec cela seul" },
          ],
          explanation: "Clôture au-dessus de l'Ouverture signifie que le prix a monté durant cette période — c'est la définition d'une bougie haussière, conventionnellement affichée en vert/non remplie.",
        },
        {
          id: "q3",
          prompt: "Que représente le \"corps\" d'une bougie ?",
          options: [
            { id: "a", text: "L'écart complet entre le Plus Haut et le Plus Bas" },
            { id: "b", text: "L'écart entre l'Ouverture et la Clôture" },
            { id: "c", text: "Le prix moyen sur la période" },
            { id: "d", text: "Le volume échangé pour cette période" },
          ],
          explanation: "Le corps est spécifiquement l'écart Ouverture-Clôture ; l'amplitude Plus Haut/Plus Bas au-delà du corps est montrée par les mèches/ombres.",
        },
        {
          id: "q4",
          prompt: "Qu'est-ce qu'une longue mèche supérieure avec un petit corps suggère typiquement s'être produit durant cette période ?",
          options: [
            { id: "a", text: "Le prix a fortement poussé vers le haut, puis a été rejeté et a reculé avant la clôture" },
            { id: "b", text: "Il n'y a eu aucune activité d'échange" },
            { id: "c", text: "La clôture était le prix le plus élevé de la période" },
            { id: "d", text: "Cela garantit que la prochaine bougie sera haussière" },
          ],
          explanation: "Une longue mèche supérieure signifie que le prix a atteint bien au-dessus du sommet du corps avant d'être repoussé vers le bas à la clôture — un signe de rejet/pression vendeuse à ce niveau plus élevé.",
        },
        {
          id: "q5",
          prompt: "Sur la plupart des plateformes graphiques, quelle est la convention de couleur par défaut pour une bougie baissière (à la baisse) ?",
          options: [
            { id: "a", text: "Vert ou blanc, non remplie" },
            { id: "b", text: "Rouge ou noir, remplie" },
            { id: "c", text: "Bleu, rayée" },
            { id: "d", text: "Il n'existe aucune convention commune" },
          ],
          explanation: "Rouge/noir rempli est la valeur par défaut la plus courante pour une bougie baissière (clôture sous l'ouverture), bien que cela soit personnalisable sur la plupart des plateformes.",
        },
      ],
    },
  },

  "bid-ask-spread": {
    sections: [
      {
        heading: "Deux prix, toujours",
        body: "Tout instrument négociable a en réalité deux prix en direct simultanément : le Bid (le prix le plus élevé qu'un acheteur est actuellement prêt à payer — ce que vous obtiendriez en vendant maintenant) et l'Ask/Offre (le prix le plus bas qu'un vendeur est actuellement prêt à accepter — ce que vous paieriez en achetant maintenant). L'Ask est toujours égal ou supérieur au Bid.",
      },
      {
        heading: "Le spread est un coût intégré",
        body: "La différence entre l'Ask et le Bid est le spread — effectivement un coût de transaction payé à celui qui fournit cette liquidité (un courtier ou teneur de marché), distinct de toute commission. Au moment où vous ouvrez une position, vous êtes déjà légèrement \"dans le rouge\" à hauteur du spread, car vous achetez à l'Ask (plus élevé) et devriez vendre au Bid (plus bas) pour clôturer immédiatement.",
        list: [
          "Bid : prix auquel vous VENDEZ",
          "Ask (Offre) : prix auquel vous ACHETEZ",
          "Spread = Ask − Bid",
          "Spreads plus serrés = marchés généralement plus liquides (ex. EUR/USD) ; spreads plus larges = instruments typiquement moins liquides ou plus volatils",
        ],
      },
      {
        label: "Coût du Spread",
        note: "Une cotation EUR/USD de 1,0850 / 1,0852 a un spread de 2 pips — ce qui signifie que la paire devrait se déplacer de 2 pips en votre faveur juste pour atteindre le seuil de rentabilité à l'entrée.",
      },
      {
        body: "Les spreads s'élargissent pendant les périodes de faible liquidité — publications de nouvelles majeures, ouvertures/fermetures de marché et jours fériés. Une stratégie qui fonctionne bien avec un spread normal de 1 pip peut discrètement perdre son avantage si les spreads gonflent à 5-10 pips durant un pic d'actualités.",
      },
      {
        caption: "L'écart entre ce à quoi vous pouvez vendre (Bid) et acheter (Ask) est le spread.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Qu'est-ce que le prix \"Bid\" ?",
          options: [
            { id: "a", text: "Le prix que vous paieriez pour acheter maintenant" },
            { id: "b", text: "Le prix le plus élevé qu'un acheteur est actuellement prêt à payer (ce que vous obtiendriez en vendant maintenant)" },
            { id: "c", text: "La moyenne des 10 dernières transactions" },
            { id: "d", text: "Un taux de change fixe établi par le gouvernement" },
          ],
          explanation: "Le Bid est le prix auquel vous pouvez vendre immédiatement — le plus élevé qu'un acheteur offre actuellement.",
        },
        {
          id: "q2",
          prompt: "L'EUR/USD est coté à 1,0850 / 1,0853. Quel est le spread, en pips ?",
          options: [
            { id: "a", text: "0 pip" },
            { id: "b", text: "3 pips" },
            { id: "c", text: "30 pips" },
            { id: "d", text: "0,3 pip" },
          ],
          explanation: "Spread = Ask − Bid = 1,0853 − 1,0850 = 0,0003, soit 3 pips sur une paire cotée à 4 décimales.",
        },
        {
          id: "q3",
          prompt: "Pourquoi l'ouverture d'une nouvelle transaction vous met-elle immédiatement en légère perte notionnelle ?",
          options: [
            { id: "a", text: "Vous achetez à l'Ask (plus élevé), mais devriez vendre au Bid (plus bas) pour clôturer instantanément — cet écart est le spread" },
            { id: "b", text: "Tous les courtiers facturent des frais de perte obligatoires" },
            { id: "c", text: "Ce n'est pas le cas — les transactions s'ouvrent toujours au seuil de rentabilité" },
            { id: "d", text: "Vrai seulement pour les transactions d'actions, jamais pour le forex" },
          ],
          explanation: "Comme vous achetez à l'Ask et vendez au Bid, le spread est effectivement payé d'avance — le prix doit se déplacer en votre faveur d'au moins la taille du spread avant d'atteindre le seuil de rentabilité.",
        },
        {
          id: "q4",
          prompt: "Quand les spreads s'élargissent-ils typiquement le plus ?",
          options: [
            { id: "a", text: "Pendant les heures de trading les plus calmes et les plus liquides" },
            { id: "b", text: "Pendant les publications de nouvelles majeures, les ouvertures/fermetures de marché et les jours fériés — périodes de faible liquidité" },
            { id: "c", text: "Les spreads sont toujours parfaitement fixes et ne changent jamais" },
            { id: "d", text: "Seulement le week-end quand les marchés sont fermés" },
          ],
          explanation: "La faible liquidité autour des grands événements d'actualité, des ouvertures/fermetures de séance et des jours fériés est exactement quand les spreads tendent à s'élargir le plus.",
        },
        {
          id: "q5",
          prompt: "Quelle paire vous attendriez-vous généralement à avoir un spread typique plus serré ?",
          options: [
            { id: "a", text: "Une paire majeure très liquide comme l'EUR/USD" },
            { id: "b", text: "Une paire de devises exotique peu échangée" },
            { id: "c", text: "Les spreads ne sont pas liés à la liquidité" },
            { id: "d", text: "Ils sont toujours identiques sur toutes les paires" },
          ],
          explanation: "Les instruments plus liquides (comme l'EUR/USD, la paire la plus échangée au monde) ont généralement des spreads plus serrés que les exotiques peu échangées.",
        },
      ],
    },
  },

  "pips-and-lot-sizes": {
    sections: [
      {
        heading: "Qu'est-ce qu'un pip ?",
        body: "Un \"pip\" (Percentage In Point) est le plus petit incrément de prix significatif standard pour la plupart des paires forex — typiquement la 4e décimale (ex., EUR/USD passant de 1,0850 à 1,0851 est un mouvement de 1 pip). Les paires yen sont la principale exception, puisqu'elles sont cotées à seulement 2 décimales, faisant de la 2e décimale le pip (ex., USD/JPY 150,25 à 150,26).",
      },
      {
        heading: "Tailles de lot : combien vous échangez réellement",
        body: "Un \"lot\" est une taille de transaction standardisée. Un Lot Standard représente 100 000 unités de la devise de base ; un Mini Lot représente 10 000 unités (1/10e) ; un Micro Lot représente 1 000 unités (1/100e). La taille de lot que vous échangez déterminez directement combien d'argent chaque mouvement de pip vaut pour vous.",
        list: [
          "Lot Standard = 100 000 unités → environ 10 $/pip sur la plupart des paires cotées en USD",
          "Mini Lot = 10 000 unités → environ 1 $/pip",
          "Micro Lot = 1 000 unités → environ 0,10 $/pip",
          "La valeur exacte du pip varie légèrement selon la paire et la devise de cotation de votre compte.",
        ],
      },
      {
        label: "Valeur Approximative du Pip (paires cotées en USD)",
        note: "Pour un lot standard (100 000 unités) sur une paire cotée à 4 décimales, 1 pip (0,0001) × 100 000 = 10 $ par pip. Micro lot (1 000 unités) → 0,10 $ par pip.",
      },
      {
        body: "Les débutants font sauter des comptes bien plus souvent à cause de lots surdimensionnés que d'être \"dans l'erreur\" sur la direction. Une transaction correcte avec une taille de lot trop grande pour votre compte peut encore vous liquider sur un repli normal.",
      },
      {
        caption: "Le même mouvement de prix de 1 pip vaut des montants très différents selon votre taille de lot.",
      },
      {
        caption: "Essayez : entrez le solde de votre compte, le % de risque et la distance du stop-loss pour obtenir une taille de lot suggérée.",
      },
      {
        caption: "Essayez : voyez ce que vaut réellement un pip en USD et PKR pour une devise de cotation et une taille de lot données.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Sur une cotation standard EUR/USD (4 décimales), passer de 1,0850 à 1,0851 est :",
          options: [
            { id: "a", text: "1 pip" },
            { id: "b", text: "10 pips" },
            { id: "c", text: "0,1 pip" },
            { id: "d", text: "1 point seulement, pas un pip" },
          ],
          explanation: "Un changement sur la 4e décimale sur une paire standard est exactement 1 pip.",
        },
        {
          id: "q2",
          prompt: "Qu'y a-t-il de spécial dans la mesure des pips sur les paires Yen japonais comme l'USD/JPY ?",
          options: [
            { id: "a", text: "Les paires Yen n'ont aucun pip" },
            { id: "b", text: "Les paires Yen sont cotées à 2 décimales, donc le pip est la 2e décimale, pas la 4e" },
            { id: "c", text: "Les paires Yen utilisent une unité monétaire complètement différente" },
            { id: "d", text: "La valeur du pip est toujours de 100 $ sur les paires Yen" },
          ],
          explanation: "Comme les paires Yen sont cotées avec seulement 2 décimales, 1 pip y représente un mouvement sur la 2e décimale (ex. 150,25 → 150,26), pas la 4e.",
        },
        {
          id: "q3",
          prompt: "Combien d'unités représente un Lot Standard en forex ?",
          options: [
            { id: "a", text: "1 000 unités" },
            { id: "b", text: "10 000 unités" },
            { id: "c", text: "100 000 unités" },
            { id: "d", text: "1 000 000 d'unités" },
          ],
          explanation: "Un Lot Standard représente 100 000 unités de la devise de base — 10x un Mini Lot, 100x un Micro Lot.",
        },
        {
          id: "q4",
          prompt: "En échangeant 1 Micro Lot (1 000 unités) sur une paire cotée en USD, combien vaut approximativement chaque pip ?",
          options: [
            { id: "a", text: "≈ 10 $" },
            { id: "b", text: "≈ 1 $" },
            { id: "c", text: "≈ 0,10 $" },
            { id: "d", text: "≈ 100 $" },
          ],
          explanation: "Valeur du Pip ≈ Taille du Lot × Taille du Pip = 1 000 × 0,0001 = 0,10 $ par pip pour un Micro Lot.",
        },
        {
          id: "q5",
          prompt: "Quelle est la raison la plus courante pour laquelle les traders débutants font sauter leurs comptes, selon cette leçon ?",
          options: [
            { id: "a", text: "Toujours se tromper sur la direction du marché" },
            { id: "b", text: "Échanger une taille de lot trop grande pour leur compte, de sorte que même un repli normal cause des pertes disproportionnées" },
            { id: "c", text: "Échanger uniquement pendant les événements d'actualité" },
            { id: "d", text: "Utiliser trop d'indicateurs" },
          ],
          explanation: "Les tailles de lot surdimensionnées par rapport à la taille du compte sont le destructeur de compte classique — même des transactions directionnellement correctes peuvent liquider un compte si la taille de position est trop grande.",
        },
      ],
    },
  },

  "order-types": {
    sections: [
      {
        heading: "Ordres au marché : la vitesse avant le prix",
        body: "Un Ordre au Marché s'exécute immédiatement au meilleur prix actuellement disponible. Vous êtes assuré d'une exécution instantanée, mais pas d'un prix exact garanti — dans des conditions de mouvement rapide ou de faible liquidité, vous pourriez subir un \"glissement\" (slippage) vers un prix légèrement moins bon que celui vu au moment du clic.",
      },
      {
        heading: "Ordres à cours limité : le prix avant la vitesse",
        body: "Un Ordre à Cours Limité ne s'exécute qu'à votre prix spécifié ou mieux — il ne s'exécutera pas à un prix moins bon, mais pourrait ne jamais s'exécuter si le marché n'atteint jamais votre niveau. Un Achat Limité se situe en dessous du prix actuel (acheter moins cher) ; une Vente Limitée se situe au-dessus du prix actuel (vendre plus cher).",
        list: [
          "Ordre au Marché : s'exécute MAINTENANT, à n'importe quel prix actuel — vitesse garantie, prix non garanti.",
          "Ordre à Cours Limité : s'exécute uniquement à VOTRE prix ou mieux — prix garanti, exécution non garantie.",
          "Ordre Stop : devient un ordre au marché une fois que le prix atteint un niveau de déclenchement — souvent utilisé pour des entrées de cassure ou des stop-loss.",
          "Ordre Stop-Limite : devient un ordre à cours limité (pas au marché) une fois le niveau de déclenchement atteint — combine les deux comportements.",
        ],
      },
      {
        body: "Utilisez un Ordre au Marché quand vous devez entrer/sortir MAINTENANT (comme clôturer rapidement une transaction perdante). Utilisez un Ordre à Cours Limité quand vous avez un objectif de prix spécifique et préférez manquer la transaction plutôt que de payer un moins bon prix pour elle.",
      },
      {
        caption: "Les ordres à cours limité se situent loin du prix actuel, attendant que le marché vienne à eux.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Que garantit un Ordre au Marché ?",
          options: [
            { id: "a", text: "Un prix exact, mais pas une exécution rapide" },
            { id: "b", text: "Une exécution immédiate, mais pas un prix exact" },
            { id: "c", text: "À la fois un prix exact ET une exécution immédiate, toujours" },
            { id: "d", text: "Ni l'un ni l'autre — c'est purement théorique" },
          ],
          explanation: "Les ordres au marché privilégient la vitesse : ils s'exécutent immédiatement au meilleur prix actuellement disponible, qui peut légèrement différer du prix que vous avez vu un instant plus tôt (slippage).",
        },
        {
          id: "q2",
          prompt: "Vous placez un ordre d'Achat Limité sous le prix de marché actuel. Que se passe-t-il si le prix ne descend jamais à ce niveau ?",
          options: [
            { id: "a", text: "Il s'exécute automatiquement au prix de marché actuel quand même" },
            { id: "b", text: "L'ordre ne s'exécute simplement jamais" },
            { id: "c", text: "Il s'exécute au double du prix demandé" },
            { id: "d", text: "Cette situation est impossible par définition" },
          ],
          explanation: "Un ordre Limite ne s'exécute qu'à votre prix spécifié ou mieux — si le marché ne l'atteint jamais, l'ordre reste simplement non exécuté (jusqu'à son annulation ou expiration).",
        },
        {
          id: "q3",
          prompt: "Quel est le compromis clé entre les Ordres au Marché et à Cours Limité ?",
          options: [
            { id: "a", text: "Les ordres au marché garantissent le prix mais risquent de ne pas s'exécuter ; les ordres limités garantissent une exécution mais risquent un moins bon prix" },
            { id: "b", text: "Les ordres au marché garantissent une exécution rapide mais pas un prix exact ; les ordres limités garantissent le prix mais pas l'exécution" },
            { id: "c", text: "Il n'y a aucun compromis ; ils se comportent de façon identique" },
            { id: "d", text: "Les ordres limités sont toujours meilleurs dans toute situation" },
          ],
          explanation: "C'est le compromis central : Marché = vitesse garantie, prix non garanti. Limite = prix garanti (ou mieux), exécution non garantie.",
        },
        {
          id: "q4",
          prompt: "En quoi se transforme un Ordre Stop, une fois son prix de déclenchement atteint ?",
          options: [
            { id: "a", text: "Un ordre au marché" },
            { id: "b", text: "Un ordre annulé" },
            { id: "c", text: "Un ordre limité à exécution garantie" },
            { id: "d", text: "Il n'a aucun effet du tout" },
          ],
          explanation: "Un Ordre Stop reste dormant jusqu'à ce que le prix atteigne le niveau de déclenchement, moment auquel il se convertit en ordre au marché et s'exécute au prochain prix disponible.",
        },
        {
          id: "q5",
          prompt: "Quand un trader préférerait-il typiquement un Ordre au Marché à un Ordre à Cours Limité ?",
          options: [
            { id: "a", text: "Quand il a un objectif de prix très spécifique et accepte de manquer complètement la transaction" },
            { id: "b", text: "Quand il doit entrer ou sortir d'une position maintenant et que la vitesse compte plus que le prix exact" },
            { id: "c", text: "Les ordres au marché ne peuvent jamais être utilisés pour clôturer une position" },
            { id: "d", text: "Seulement en échangeant le week-end" },
          ],
          explanation: "Les ordres au marché sont l'outil approprié spécifiquement quand l'immédiateté compte plus que d'obtenir un prix exact — ex. clôturer urgemment une position perdante.",
        },
      ],
    },
  },

  "support-resistance": {
    sections: [
      {
        heading: "Les sols et plafonds invisibles du marché",
        body: "Le support est un niveau de prix (ou zone) où la pression d'achat a historiquement été assez forte pour arrêter une baisse et repousser le prix vers le haut. La résistance est l'image inverse — un niveau où la pression de vente a historiquement arrêté une avance et repoussé le prix vers le bas. Ces niveaux se forment parce que les traders se souviennent que le prix a réagi là auparavant, et placent des ordres en conséquence.",
      },
      {
        heading: "Des zones, pas des lignes exactes — et les rôles peuvent s'inverser",
        body: "En pratique, le support/résistance sont rarement un prix exact unique ; il est préférable de les considérer comme des zones, car le prix réagit souvent légèrement au-dessus ou en dessous du niveau \"de manuel\". De manière cruciale, une fois la résistance décisivement franchie, elle devient souvent un nouveau support (et inversement pour un support franchi devenant une nouvelle résistance) — c'est appelé une inversion de rôle.",
        list: [
          "Plus un niveau a été testé et a tenu, plus les traders le considèrent généralement comme significatif.",
          "Une \"cassure\" est le prix clôturant décisivement à travers un niveau de support/résistance, souvent avec un volume plus élevé.",
          "Une \"fausse cassure\" (ou \"fakeout\") se produit quand le prix franchit brièvement un niveau puis fait rapidement marche arrière — un piège courant.",
        ],
      },
      {
        body: "N'échangez pas le contact exact d'un niveau — attendez une confirmation (une clôture de bougie au-delà, ou un retest qui tient) plutôt que de deviner la première fois que le prix s'approche.",
      },
      {
        caption: "Le prix respecte la résistance deux fois, puis la franchit à la hausse — cette ancienne résistance devient souvent un nouveau support lors d'un retest.",
      },
      {
        label: "Voir le Support et la Résistance calculés en direct",
        note: "Le rapport d'Analyse Technique d'Analyse de Marché calcule de vrais niveaux de Support et de Résistance à partir du prix en direct actuel.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Qu'est-ce que le \"support\" en analyse technique ?",
          options: [
            { id: "a", text: "Un niveau où la pression de vente a historiquement arrêté une avance de prix" },
            { id: "b", text: "Un niveau où la pression d'achat a historiquement arrêté une baisse de prix" },
            { id: "c", text: "Le prix moyen de la dernière année" },
            { id: "d", text: "Un plancher de prix imposé par le gouvernement" },
          ],
          explanation: "Le support est là où les acheteurs sont historiquement intervenus assez fortement pour arrêter une baisse et repousser le prix vers le haut.",
        },
        {
          id: "q2",
          prompt: "Qu'arrive-t-il typiquement à un niveau de résistance une fois qu'il est décisivement franchi ?",
          options: [
            { id: "a", text: "Il disparaît complètement du graphique" },
            { id: "b", text: "Il devient souvent un nouveau support lors d'un retest (inversion de rôle)" },
            { id: "c", text: "Il devient impossible pour le prix d'y revenir un jour" },
            { id: "d", text: "Rien — les niveaux franchis n'ont plus aucune pertinence" },
          ],
          explanation: "Une inversion de rôle classique : une fois la résistance franchie, ce même niveau agit fréquemment comme nouveau support si le prix revient le tester.",
        },
        {
          id: "q3",
          prompt: "Qu'est-ce qu'une \"fausse cassure\" (fakeout) ?",
          options: [
            { id: "a", text: "Une cassure qui est plus tard confirmée par une tendance forte" },
            { id: "b", text: "Le prix franchissant brièvement un niveau, puis faisant rapidement marche arrière dans l'autre direction" },
            { id: "c", text: "Une cassure qui ne se produit que le week-end" },
            { id: "d", text: "Un niveau qui n'a jamais été testé" },
          ],
          explanation: "Une fausse cassure piège les traders entrés sur la cassure initiale, le prix revenant rapidement dans la fourchette précédente.",
        },
        {
          id: "q4",
          prompt: "Pourquoi est-il préférable de considérer le support/résistance comme des \"zones\" plutôt que des prix exacts uniques ?",
          options: [
            { id: "a", text: "Parce que le prix réagit typiquement légèrement au-dessus ou en dessous du niveau de manuel, pas à un tick exact" },
            { id: "b", text: "Parce que le support et la résistance n'existent pas réellement" },
            { id: "c", text: "Parce qu'ils ne s'appliquent qu'aux graphiques journaliers" },
            { id: "d", text: "Parce que les courtiers fixent manuellement ces niveaux" },
          ],
          explanation: "Les réactions réelles du marché se regroupent autour d'un niveau plutôt que de toucher exactement le même prix chaque fois, c'est pourquoi les traders les traitent comme des zones.",
        },
        {
          id: "q5",
          prompt: "Quelle approche est plus sûre que d'échanger le tout premier contact d'un niveau de support/résistance ?",
          options: [
            { id: "a", text: "Toujours entrer immédiatement au premier contact, sans exception" },
            { id: "b", text: "Attendre une confirmation — comme une clôture de bougie au-delà du niveau, ou un retest qui tient" },
            { id: "c", text: "Ignorer complètement le support/résistance" },
            { id: "d", text: "N'échanger que des niveaux jamais touchés auparavant" },
          ],
          explanation: "Attendre une confirmation (une clôture décisive à travers le niveau, ou un retest qui tient) réduit le risque d'être pris dans une fausse cassure ou un niveau qui tient simplement à nouveau.",
        },
      ],
    },
  },

  "rsi-indicator": {
    sections: [
      {
        heading: "Une jauge de momentum de 0 à 100",
        body: "L'Indice de Force Relative (RSI), développé par J. Welles Wilder, est un oscillateur de momentum qui mesure la vitesse et l'ampleur des changements de prix récents sur une échelle de 0 à 100. Il est typiquement calculé sur une période rétrospective de 14, comparant la taille moyenne des gains récents à la taille moyenne des pertes récentes.",
      },
      {
        heading: "Surachat, survente et divergence",
        body: "L'interprétation classique du RSI utilise 70 et 30 comme seuils : une lecture au-dessus de 70 suggère que l'instrument pourrait être en \"surachat\" (potentiellement dû à un repli), et en dessous de 30 suggère la \"survente\" (potentiellement due à un rebond). La divergence du RSI — où le prix fait un nouveau plus haut/bas mais le RSI ne le confirme pas — est souvent surveillée comme un signal d'alerte précoce d'affaiblissement du momentum.",
        list: [
          "RSI > 70 : souvent lu comme surachat",
          "RSI < 30 : souvent lu comme survente",
          "RSI autour de 50 : souvent lu comme momentum neutre/équilibré",
          "Dans une tendance forte, le RSI peut rester \"en surachat\" ou \"en survente\" longtemps — ce N'EST PAS par lui-même un signal de retournement automatique.",
        ],
      },
      {
        body: "La plus grande erreur avec le RSI : traiter le \"surachat\" comme \"vendre immédiatement\". Dans une forte tendance haussière, le RSI peut rester au-dessus de 70 pendant longtemps tandis que le prix continue de monter — surachat signifie étiré, pas garanti de retourner.",
      },
      {
        caption: "Le RSI poussant au-dessus de la ligne des 70 — une lecture de momentum étiré, pas un signal de vente automatique à lui seul.",
      },
      {
        label: "Consultez le rapport d'Analyse Technique en direct",
        note: "Note honnête : ce projet n'a que le prix en direct actuel, pas un historique de prix, donc la section RSI du rapport est explicitement marquée indisponible plutôt que de simuler une lecture — voyez pourquoi là-bas.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Dans quelle fourchette l'indicateur RSI oscille-t-il ?",
          options: [
            { id: "a", text: "-100 à +100" },
            { id: "b", text: "0 à 100" },
            { id: "c", text: "0 à 10" },
            { id: "d", text: "Il n'a aucune fourchette fixe" },
          ],
          explanation: "Le RSI est un oscillateur borné qui se lit toujours entre 0 et 100.",
        },
        {
          id: "q2",
          prompt: "Que suggère classiquement une lecture de RSI au-dessus de 70 ?",
          options: [
            { id: "a", text: "L'instrument pourrait être en \"surachat\" — potentiellement dû à un repli" },
            { id: "b", text: "L'instrument va garantiment s'effondrer dans l'heure" },
            { id: "c", text: "L'instrument a un momentum nul" },
            { id: "d", text: "Un signal d'achat sans analyse supplémentaire nécessaire" },
          ],
          explanation: "Au-dessus de 70 est le seuil classique de \"surachat\" — un signe que le momentum est étiré, pas une garantie de retournement imminent.",
        },
        {
          id: "q3",
          prompt: "Qu'est-ce que la divergence du RSI ?",
          options: [
            { id: "a", text: "Quand le RSI et le prix évoluent en parfait synchronisme" },
            { id: "b", text: "Quand le prix fait un nouveau plus haut/bas mais que le RSI échoue à le confirmer avec son propre nouveau plus haut/bas" },
            { id: "c", text: "Quand le RSI dépasse 100" },
            { id: "d", text: "Un type de motif en bougies" },
          ],
          explanation: "La divergence est spécifiquement un décalage entre l'action du prix et la lecture de momentum du RSI — souvent surveillée comme un indice précoce que le momentum s'affaiblit.",
        },
        {
          id: "q4",
          prompt: "Pourquoi traiter \"RSI au-dessus de 70 = vendre maintenant\" est-il considéré comme une erreur courante ?",
          options: [
            { id: "a", text: "Le RSI peut rester élevé longtemps pendant une forte tendance sans que le prix ne retourne" },
            { id: "b", text: "Le RSI au-dessus de 70 est en réalité un signal d'achat, pas de vente" },
            { id: "c", text: "Le RSI ne peut pas dépasser 70 sur les marchés réels" },
            { id: "d", text: "Une lecture de surachat n'existe pas" },
          ],
          explanation: "Dans une forte tendance haussière, le RSI peut rester en surachat pendant une période prolongée tandis que le prix continue de monter — c'est un signal de momentum étiré, pas un déclencheur de retournement automatique.",
        },
        {
          id: "q5",
          prompt: "Le RSI est typiquement calculé en comparant :",
          options: [
            { id: "a", text: "Le prix actuel au prix de clôture de la veille uniquement" },
            { id: "b", text: "La taille moyenne des gains récents à la taille moyenne des pertes récentes sur une période rétrospective (généralement 14)" },
            { id: "c", text: "Le volume d'échange à l'intérêt ouvert" },
            { id: "d", text: "Le prix bid au prix ask" },
          ],
          explanation: "Le calcul central du RSI compare les gains moyens récents aux pertes moyennes récentes sur une période rétrospective choisie (14 périodes étant la valeur par défaut la plus courante) pour produire sa lecture de 0 à 100.",
        },
      ],
    },
  },

  "moving-averages": {
    sections: [
      {
        heading: "Lisser le bruit",
        body: "Une moyenne mobile (MM) lisse les données de prix brutes en une seule ligne fluide en moyennant le prix sur un nombre choisi de périodes récentes, se mettant à jour continuellement à mesure que de nouvelles données arrivent. Cela rend la direction de la tendance sous-jacente plus facile à voir à travers le bruit quotidien des bougies individuelles.",
      },
      {
        heading: "SMA vs. EMA, et croisements",
        body: "Une Moyenne Mobile Simple (SMA) pondère également chaque période de sa période rétrospective. Une Moyenne Mobile Exponentielle (EMA) pondère plus fortement les périodes récentes, la rendant plus réactive à la nouvelle action du prix. Un signal courant est un \"croisement\" : quand une MM plus rapide (période plus courte) croise au-dessus d'une MM plus lente (période plus longue), on appelle cela une \"Croix Dorée\" (haussière) ; croiser en dessous est une \"Croix de la Mort\" (baissière).",
        list: [
          "SMA : poids égal à chaque période de la période rétrospective — plus lisse, plus lente à réagir.",
          "EMA : plus de poids sur les périodes récentes — plus rapide à réagir, mais peut donner plus de faux signaux sur des marchés agités.",
          "Croix Dorée : la MM plus courte croise au-dessus de la MM plus longue — souvent lue comme haussière.",
          "Croix de la Mort : la MM plus courte croise en dessous de la MM plus longue — souvent lue comme baissière.",
        ],
      },
      {
        body: "Les moyennes mobiles sont des indicateurs retardés par nature — elles sont construites à partir de prix passés, donc les croisements confirment un changement de tendance après qu'il soit déjà en cours, pas avant. Elles fonctionnent mieux pour confirmer une tendance, pas pour des entrées précises.",
      },
      {
        caption: "Une \"Croix Dorée\" : la moyenne mobile de période plus courte croise au-dessus de celle de période plus longue.",
      },
      {
        label: "Consultez le rapport d'Analyse Technique en direct",
        note: "Même note d'honnêteté que pour le RSI — les moyennes mobiles ont besoin de clôtures historiques, donc cette section est explicitement marquée indisponible là plutôt qu'inventée.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Quel est l'objectif principal d'une moyenne mobile ?",
          options: [
            { id: "a", text: "Lisser les données de prix en une seule ligne, rendant la tendance sous-jacente plus facile à voir" },
            { id: "b", text: "Prédire des prix futurs exacts avec certitude" },
            { id: "c", text: "Mesurer le volume d'échange" },
            { id: "d", text: "Calculer le spread bid/ask" },
          ],
          explanation: "Les moyennes mobiles existent pour lisser le bruit à court terme, rendant la direction de la tendance plus large plus facile à lire.",
        },
        {
          id: "q2",
          prompt: "Quelle est la différence clé entre une SMA et une EMA ?",
          options: [
            { id: "a", text: "La SMA pondère toutes les périodes de façon égale ; l'EMA pondère plus fortement les périodes récentes et réagit plus vite" },
            { id: "b", text: "L'EMA ignore complètement les prix récents" },
            { id: "c", text: "La SMA ne peut être utilisée que sur des graphiques journaliers" },
            { id: "d", text: "Il n'y a aucune différence réelle" },
          ],
          explanation: "La pondération supplémentaire de l'EMA sur les données récentes la rend plus réactive à la nouvelle action du prix que la SMA, pondérée de façon égale.",
        },
        {
          id: "q3",
          prompt: "Une moyenne mobile de période plus courte croisant AU-DESSUS d'une de période plus longue est communément appelée :",
          options: [
            { id: "a", text: "Une Croix de la Mort" },
            { id: "b", text: "Une Croix Dorée" },
            { id: "c", text: "Une extension de Fibonacci" },
            { id: "d", text: "Une cassure de pivot" },
          ],
          explanation: "Une MM plus courte croisant au-dessus d'une MM plus longue est le signal haussier classique de la \"Croix Dorée\".",
        },
        {
          id: "q4",
          prompt: "Pourquoi les moyennes mobiles sont-elles décrites comme des indicateurs \"retardés\" ?",
          options: [
            { id: "a", text: "Elles sont construites à partir de données de prix passées, donc confirment des changements de tendance après qu'ils ont déjà commencé" },
            { id: "b", text: "Elles prédisent les mouvements de prix avant qu'ils ne se produisent" },
            { id: "c", text: "Elles se mettent à jour plus vite que le prix en temps réel" },
            { id: "d", text: "Elles ne fonctionnent que sur des graphiques hebdomadaires" },
          ],
          explanation: "Comme une MM est calculée à partir de prix historiques, tout signal de croisement apparaît nécessairement après que le changement sous-jacent dans le comportement du prix a déjà commencé.",
        },
        {
          id: "q5",
          prompt: "Une MM de période plus courte croisant EN DESSOUS d'une MM de période plus longue est communément appelée :",
          options: [
            { id: "a", text: "Une Croix Dorée" },
            { id: "b", text: "Une Croix de la Mort" },
            { id: "c", text: "Une cassure de support" },
            { id: "d", text: "Une divergence de RSI" },
          ],
          explanation: "La contrepartie baissière de la Croix Dorée — une MM plus courte croisant en dessous d'une MM plus longue — est appelée Croix de la Mort.",
        },
      ],
    },
  },

  "fibonacci-retracements": {
    sections: [
      {
        heading: "Des ratios empruntés à une séquence du 13e siècle",
        body: "Les niveaux de retracement de Fibonacci sont dérivés de ratios trouvés dans la séquence numérique de Fibonacci (0, 1, 1, 2, 3, 5, 8, 13, 21...), où diviser certains nombres par d'autres dans la séquence produit des ratios récurrents comme 0,618 et 0,382. Les traders appliquent ces ratios à un mouvement de prix récent (un plus haut et un plus bas clairs) pour marquer des zones potentielles de support/résistance pendant un repli.",
      },
      {
        heading: "Le tracer et les niveaux clés",
        body: "Pour tracer un retracement de Fibonacci, vous sélectionnez un plus bas et un plus haut de swing significatifs (ou l'inverse pour une tendance baissière), et l'outil marque automatiquement des lignes horizontales aux niveaux de ratio standard entre eux. Ceux-ci sont surveillés comme des zones où une tendance en repli pourrait marquer une pause ou retourner avant de potentiellement continuer dans la direction originale.",
        list: [
          "23,6% — un niveau de retracement peu profond",
          "38,2% — un niveau de repli courant dans les tendances fortes",
          "50,0% — pas techniquement un ratio de Fibonacci, mais universellement inclus comme point médian psychologique",
          "61,8% — le niveau du \"ratio d'or\", souvent surveillé comme la zone de repli plus profonde",
          "78,6% — un retracement profond, proche d'un aller-retour complet du swing",
        ],
      },
      {
        body: "Les niveaux de Fibonacci fonctionnent mieux lorsqu'ils s'alignent avec une autre forme de confirmation — comme une zone de support/résistance ronde ou un point de swing précédent — plutôt que d'être échangés isolément.",
      },
      {
        caption: "Niveaux de retracement de Fibonacci standard tracés sur un mouvement de prix du plus bas au plus haut.",
      },
      {
        label: "Voir les ratios de Fibonacci appliqués en direct",
        note: "Le rapport d'Analyse Technique applique ces ratios exacts (23,6% / 38,2% / 50% / 61,8% / 78,6%) à une bande de prix illustrative en direct et explicitement étiquetée.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Les ratios de retracement de Fibonacci sont dérivés de :",
          options: [
            { id: "a", text: "Un générateur de nombres aléatoires" },
            { id: "b", text: "Des ratios trouvés dans la séquence numérique de Fibonacci" },
            { id: "c", text: "Des décisions gouvernementales sur les taux d'intérêt" },
            { id: "d", text: "Des données de volume d'échange uniquement" },
          ],
          explanation: "Les pourcentages de retracement (23,6%, 38,2%, 61,8%, etc.) proviennent directement de ratios entre des nombres de la séquence de Fibonacci.",
        },
        {
          id: "q2",
          prompt: "Quels deux points devez-vous sélectionner pour tracer un retracement de Fibonacci ?",
          options: [
            { id: "a", text: "Un plus haut et un plus bas de swing d'un mouvement de prix significatif" },
            { id: "b", text: "Le bid et l'ask actuels" },
            { id: "c", text: "L'ouverture d'aujourd'hui et la clôture d'hier" },
            { id: "d", text: "Deux bougies aléatoires" },
          ],
          explanation: "Un retracement de Fibonacci est ancré à un plus bas et un plus haut de swing clairs (ou plus haut à plus bas pour une tendance baissière), à partir desquels l'outil trace les niveaux de ratio.",
        },
        {
          id: "q3",
          prompt: "Lequel de ces niveaux de Fibonacci couramment affichés n'est PAS réellement dérivé de la séquence de Fibonacci elle-même ?",
          options: [
            { id: "a", text: "23,6%" },
            { id: "b", text: "38,2%" },
            { id: "c", text: "50,0%" },
            { id: "d", text: "61,8%" },
          ],
          explanation: "50% est inclus par convention comme point médian psychologiquement significatif, mais n'est pas lui-même un ratio dérivé de Fibonacci comme le sont 23,6/38,2/61,8/78,6%.",
        },
        {
          id: "q4",
          prompt: "Quel est le niveau de retracement du \"ratio d'or\", souvent surveillé comme une zone de repli plus profonde ?",
          options: [
            { id: "a", text: "23,6%" },
            { id: "b", text: "50,0%" },
            { id: "c", text: "61,8%" },
            { id: "d", text: "100%" },
          ],
          explanation: "61,8% est dérivé du ratio d'or et c'est l'un des niveaux de retracement de Fibonacci les plus surveillés.",
        },
        {
          id: "q5",
          prompt: "Qu'est-ce qui rend un niveau de Fibonacci plus fiable, selon cette leçon ?",
          options: [
            { id: "a", text: "L'utiliser complètement isolé de toute autre analyse" },
            { id: "b", text: "Quand il s'aligne avec une autre forme de confirmation, comme une zone de support/résistance ronde" },
            { id: "c", text: "N'utiliser que le niveau 100%" },
            { id: "d", text: "Le tracer uniquement sur un graphique en 1 minute" },
          ],
          explanation: "La confluence — un niveau de Fibonacci coïncidant avec un autre signal indépendant comme une zone de support/résistance connue — est généralement considérée comme plus significative que le niveau de Fibonacci seul.",
        },
      ],
    },
  },

  "gann-basics": {
    sections: [
      {
        heading: "L'idée centrale de W.D. Gann : le temps compte autant que le prix",
        body: "W.D. Gann était un trader du début du 20e siècle dont les techniques sont construites sur l'idée que les marchés évoluent selon des relations géométriques basées sur le temps — pas seulement basées sur le prix. Là où la plupart des indicateurs n'analysent que le prix, la théorie de Gann traite le passage du TEMPS lui-même comme une variable clé qui peut signaler des points de retournement potentiels, indépendamment de la distance parcourue par le prix.",
      },
      {
        heading: "Angles de Gann : la ligne 1x1",
        body: "L'outil de Gann le plus connu est l'angle de Gann (ou \"éventail de Gann\") — des lignes de tendance diagonales tracées depuis un pivot de prix significatif à des pentes géométriques fixes. La plus célèbre est l'angle 1x1 (parfois appelée la \"ligne à 45 degrés\"), représentant un taux équilibré d'une unité de prix par unité de temps ; des angles plus raides ou plus plats (2x1, 4x1, 1x2, 1x4, etc.) représentent des taux d'avancement plus rapides ou plus lents.",
        list: [
          "Angles de Gann : lignes diagonales à des ratios prix/temps fixes depuis un point de pivot, utilisées comme support/résistance dynamique.",
          "Carré de Neuf de Gann : une grille numérique en spirale utilisée pour projeter des points de retournement potentiels de prix/temps.",
          "Cycles temporels : Gann mettait fortement l'accent sur les anniversaires des plus hauts/bas passés et des comptages de jours spécifiques se répétant dans le futur.",
        ],
      },
      {
        body: "Les méthodes de Gann sont véritablement complexes et largement débattues — beaucoup de traders trouvent une réelle valeur dans l'idée centrale (le temps compte, pas seulement le prix), sans adopter littéralement tout le système historique. Considérez cette leçon comme une introduction conceptuelle, pas une méthode de trading complète.",
      },
      {
        caption: "Une grille simplifiée de style Gann : des angles diagonaux s'étalent en éventail depuis un pivot à des ratios prix/temps fixes.",
      },
      {
        label: "Consultez le rapport d'Analyse Technique en direct",
        note: "La Théorie de Gann nécessite des points de swing historiques et des cycles temporels que ce projet ne stocke pas — le rapport explique exactement pourquoi cette section est marquée indisponible plutôt que simulée.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Quelle est l'idée centrale qui distingue la théorie de Gann de la plupart des autres outils techniques ?",
          options: [
            { id: "a", text: "Elle ne regarde que le volume d'échange" },
            { id: "b", text: "Elle traite le passage du TEMPS comme une variable clé, pas seulement le mouvement de prix" },
            { id: "c", text: "Elle ignore complètement le prix" },
            { id: "d", text: "Elle est basée purement sur les événements d'actualité" },
          ],
          explanation: "La prémisse centrale de Gann est que les cycles et relations basés sur le temps comptent autant que le mouvement de prix — un écart par rapport à l'analyse purement basée sur le prix.",
        },
        {
          id: "q2",
          prompt: "Que représente l'angle 1x1 de Gann ?",
          options: [
            { id: "a", text: "Une ligne de support verticale" },
            { id: "b", text: "Un taux équilibré d'une unité de prix de mouvement par unité de temps, tracé depuis un pivot" },
            { id: "c", text: "Le prix de clôture exact de la journée" },
            { id: "d", text: "Une ligne horizontale fixe à 90 degrés" },
          ],
          explanation: "L'angle 1x1 (souvent appelé l'angle à 45 degrés) représente un taux équilibré d'avancement prix-temps depuis un point de pivot significatif.",
        },
        {
          id: "q3",
          prompt: "À quoi sert généralement le Carré de Neuf de Gann ?",
          options: [
            { id: "a", text: "Calculer le spread bid/ask" },
            { id: "b", text: "Projeter des points de retournement futurs potentiels de prix/temps via une grille numérique en spirale" },
            { id: "c", text: "Fixer des tailles de lot standard" },
            { id: "d", text: "Déterminer les taux d'intérêt de la banque centrale" },
          ],
          explanation: "Le Carré de Neuf est une grille en spirale de nombres utilisée par les praticiens de Gann pour projeter où le prix et le temps pourraient s'aligner pour un retournement potentiel.",
        },
        {
          id: "q4",
          prompt: "Comment cette leçon présente-t-elle le rôle de la théorie de Gann pour un apprenant ?",
          options: [
            { id: "a", text: "Comme la méthode de trading unique la plus fiable et universellement prouvée" },
            { id: "b", text: "Comme une introduction conceptuelle à une approche véritablement complexe et débattue — pas une méthode complète en elle-même" },
            { id: "c", text: "Comme complètement discréditée et ne valant jamais la peine d'être étudiée" },
            { id: "d", text: "Comme identique à un croisement de moyenne mobile standard" },
          ],
          explanation: "La leçon est explicite sur le fait que les méthodes de Gann sont complexes et débattues, et ceci est pensé comme un point de départ conceptuel plutôt qu'un système complet prêt à l'emploi.",
        },
        {
          id: "q5",
          prompt: "Sur quoi Gann mettait-il fortement l'accent concernant les cycles temporels ?",
          options: [
            { id: "a", text: "Les anniversaires des plus hauts/bas passés et des comptages de jours spécifiques se répétant" },
            { id: "b", text: "Uniquement le volume d'échange du jour actuel" },
            { id: "c", text: "Ignorer toutes les données de prix historiques" },
            { id: "d", text: "Uniquement des trimestres calendaires fixes" },
          ],
          explanation: "Le travail de Gann sur les cycles temporels se concentrait fortement sur des comptages de jours spécifiques et des anniversaires de plus hauts/bas significatifs précédents se répétant dans le futur.",
        },
      ],
    },
  },

  "central-bank-rates": {
    sections: [
      {
        heading: "Le plus grand levier individuel des marchés macro",
        body: "Le taux d'intérêt de référence d'une banque centrale (comme le taux des fonds fédéraux de la Réserve fédérale américaine) influence le coût de l'emprunt dans toute une économie. Augmenter les taux tend à refroidir les dépenses/emprunts et à renforcer la monnaie (un rendement plus élevé attire des capitaux étrangers) ; baisser les taux tend à encourager l'emprunt/les dépenses et peut affaiblir la monnaie.",
      },
      {
        heading: "Pourquoi les traders sont obsédés par les décisions de taux",
        body: "Les différentiels de taux d'intérêt entre deux pays sont l'un des principaux moteurs à long terme de la direction d'une paire de devises — les capitaux tendent à circuler vers la monnaie offrant de meilleurs rendements ajustés au risque. C'est pourquoi les réunions programmées des banques centrales (comme les réunions du FOMC aux États-Unis) sont parmi les événements de la plus haute volatilité du calendrier économique.",
        list: [
          "Hausse de taux : généralement positive pour la monnaie (toutes choses égales) — un rendement plus élevé attire des entrées de capitaux.",
          "Baisse de taux : généralement négative pour la monnaie (toutes choses égales) — rendement plus bas, moins d'incitation à détenir cette monnaie.",
          "Les marchés réagissent à la DÉCISION par rapport aux ATTENTES, pas à la décision isolée — une hausse déjà totalement attendue peut causer peu de mouvement, ou même un retournement.",
          "Les indications prospectives (ce qu'une banque centrale signale sur ses mouvements futurs) comptent souvent plus que la décision actuelle elle-même.",
        ],
      },
      {
        body: "\"Acheter la rumeur, vendre la nouvelle\" est courant autour des décisions de taux : si une hausse était fortement attendue et déjà intégrée dans les prix au préalable, l'annonce réelle peut déclencher un retournement plutôt qu'une continuation, car le véritable moteur était la surprise (ou son absence) par rapport à ce que le marché avait déjà intégré.",
      },
      {
        caption: "La chaîne logique classique reliant une hausse de taux à la force de la monnaie — toutes choses égales.",
      },
      {
        label: "Suivez les vrais mouvements des banques centrales sur le Calendrier Économique",
        note: "Un calendrier économique TradingView en direct couvre les décisions de taux de USD, EUR, GBP, JPY, AUD, CAD, CHF et CNY et d'autres publications à fort impact.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Toutes choses égales, qu'est-ce qu'une HAUSSE de taux d'intérêt d'une banque centrale tend à faire à la monnaie de ce pays ?",
          options: [
            { id: "a", text: "L'affaiblir, car emprunter devient plus coûteux" },
            { id: "b", text: "La renforcer, car un rendement plus élevé tend à attirer des capitaux étrangers" },
            { id: "c", text: "N'avoir aucun effet du tout" },
            { id: "d", text: "Causer immédiatement de l'hyperinflation" },
          ],
          explanation: "Des taux plus élevés rendent généralement une monnaie plus attrayante à détenir (meilleur rendement), ce qui tend à attirer des capitaux étrangers et à soutenir la monnaie — toutes choses égales.",
        },
        {
          id: "q2",
          prompt: "Pourquoi une hausse de taux largement attendue pourrait-elle causer PEU de réaction du marché, ou même un retournement ?",
          options: [
            { id: "a", text: "Parce que les marchés réagissent à la décision par rapport à ce qui était déjà attendu/intégré, pas à la décision seule" },
            { id: "b", text: "Parce que les décisions de taux ne bougent en réalité jamais les marchés" },
            { id: "c", text: "Parce que les banques centrales annoncent toujours leurs décisions le week-end" },
            { id: "d", text: "Parce que les hausses sont toujours négatives pour la monnaie" },
          ],
          explanation: "Si une hausse était déjà totalement intégrée au préalable, l'élément de \"surprise\" disparaît — le mouvement réel peut déclencher une réaction de type \"vendre la nouvelle\" plutôt qu'une continuation.",
        },
        {
          id: "q3",
          prompt: "À quoi se réfèrent les \"indications prospectives\" dans un contexte de banque centrale ?",
          options: [
            { id: "a", text: "Le chiffre exact du PIB du dernier trimestre" },
            { id: "b", text: "Ce qu'une banque centrale signale sur ses probables mouvements de politique FUTURS, pas seulement la décision actuelle" },
            { id: "c", text: "Un type d'ordre à cours limité" },
            { id: "d", text: "Un calendrier de taux d'intérêt fixe établi 10 ans à l'avance" },
          ],
          explanation: "Les indications prospectives sont les perspectives communiquées de la banque centrale sur sa politique future — souvent plus influentes sur le marché que la décision de taux actuelle elle-même.",
        },
        {
          id: "q4",
          prompt: "Que décrit \"acheter la rumeur, vendre la nouvelle\" ?",
          options: [
            { id: "a", text: "Un moyen garanti de profiter de chaque décision de taux" },
            { id: "b", text: "Le prix évoluant en anticipation d'un événement attendu, puis retournant une fois l'événement confirmé comme attendu" },
            { id: "c", text: "Une règle qui ne s'applique qu'aux cryptomonnaies" },
            { id: "d", text: "Ignorer complètement toutes les nouvelles économiques" },
          ],
          explanation: "Cela décrit le positionnement en amont d'un résultat anticipé, puis le retournement qui peut suivre une fois ce résultat réellement confirmé et pleinement \"intégré\".",
        },
        {
          id: "q5",
          prompt: "Aux États-Unis, quelles réunions programmées sont le principal lieu pour les décisions sur le taux des fonds fédéraux ?",
          options: [
            { id: "a", text: "Les réunions du FOMC (Comité fédéral de l'open market)" },
            { id: "b", text: "Les appels de résultats trimestriels" },
            { id: "c", text: "L'Assemblée générale des Nations Unies" },
            { id: "d", text: "Les discours sur l'état de l'Union" },
          ],
          explanation: "Les réunions du FOMC sont précisément là où la Réserve fédérale américaine fixe son taux de référence des fonds fédéraux — parmi les événements programmés de la plus haute volatilité pour les paires USD.",
        },
      ],
    },
  },

  "nfp-and-news-trading": {
    sections: [
      {
        heading: "Pourquoi un seul rapport sur l'emploi fait bouger toutes les paires USD",
        body: "Le rapport américain sur les Emplois Non Agricoles (NFP), publié mensuellement, mesure le changement du nombre de personnes employées aux États-Unis (excluant les travailleurs agricoles, les employés gouvernementaux et quelques autres catégories). C'est l'une des publications économiques les plus surveillées car les données d'emploi alimentent directement les décisions de politique de la Réserve fédérale — une forte croissance de l'emploi peut soutenir un argument pour une politique plus stricte, une croissance faible l'inverse.",
      },
      {
        heading: "Ce qui rend le trading d'actualités particulièrement risqué",
        body: "Dans les secondes/minutes autour d'une publication à fort impact, les spreads peuvent s'élargir dramatiquement, le prix peut s'envoler violemment dans les deux directions avant de se stabiliser, et le slippage sur les stop-loss peut être bien pire que la normale. C'est un environnement de risque fondamentalement différent des heures de trading habituelles.",
        list: [
          "Réel vs. Prévision vs. Précédent : les marchés réagissent le plus à la façon dont le chiffre RÉEL se compare à la PRÉVISION (attente du consensus), pas au chiffre brut seul.",
          "Un gros \"dépassement\" (réel bien au-dessus de la prévision) est typiquement positif pour la monnaie ; un gros \"manquement\" est typiquement négatif — mais les mouvements initiaux peuvent se retourner rapidement.",
          "La volatilité fait souvent un pic sur une courte fenêtre puis peut se retourner ou s'étendre de manière imprévisible — ce n'est pas un moment pour un dimensionnement de position décontracté.",
        ],
      },
      {
        body: "Beaucoup de traders expérimentés évitent délibérément d'ouvrir de NOUVELLES positions dans les minutes immédiatement autour d'actualités à fort impact, spécifiquement en raison du risque d'élargissement du spread et de slippage — pas parce que le mouvement n'est pas réel, mais parce que le ratio risque-récompense d'échanger le pic initial est souvent médiocre.",
      },
      {
        caption: "La séquence typique d'une publication d'actualités à fort impact et pourquoi les premières minutes sont particulièrement risquées à échanger.",
      },
      {
        label: "Voir le Calendrier Économique et le Fil d'Actualités en direct",
        note: "Consultez les publications à venir à fort impact (incluant le NFP) et plus de 60 titres en direct sur le Forex, les Cryptos, les Matières Premières et les Actions.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Que mesure le rapport américain sur les Emplois Non Agricoles (NFP) ?",
          options: [
            { id: "a", text: "Le changement du nombre de personnes employées aux États-Unis, excluant les travailleurs agricoles et quelques autres catégories" },
            { id: "b", text: "Le prix de clôture du S&P 500" },
            { id: "c", text: "La dette totale du gouvernement américain" },
            { id: "d", text: "La production d'or aux États-Unis" },
          ],
          explanation: "Le NFP suit spécifiquement le changement mensuel de l'emploi aux États-Unis, excluant les travailleurs agricoles (et les employés gouvernementaux/sans but lucratif/de ménages privés), alimentant directement les considérations de politique de la Fed.",
        },
        {
          id: "q2",
          prompt: "Les marchés réagissent typiquement le plus fortement à :",
          options: [
            { id: "a", text: "Le chiffre brut seul, indépendamment des attentes" },
            { id: "b", text: "La façon dont le chiffre RÉEL se compare à la PRÉVISION (attente du consensus)" },
            { id: "c", text: "Le rapport d'exactement il y a un an" },
            { id: "d", text: "Seulement le chiffre révisé du mois précédent" },
          ],
          explanation: "La surprise par rapport à la prévision du consensus — pas le chiffre absolu lui-même — est généralement ce qui provoque la réaction immédiate la plus forte.",
        },
        {
          id: "q3",
          prompt: "Que se passe-t-il typiquement avec les spreads pendant une publication d'actualités à fort impact comme le NFP ?",
          options: [
            { id: "a", text: "Ils se resserrent significativement" },
            { id: "b", text: "Ils s'élargissent souvent dramatiquement en raison d'une liquidité réduite et d'une incertitude accrue" },
            { id: "c", text: "Ils sont légalement fixes et ne peuvent pas changer" },
            { id: "d", text: "Les spreads ne sont pas liés aux événements d'actualité" },
          ],
          explanation: "Les publications à fort impact voient typiquement les spreads s'élargir fortement à mesure que les fournisseurs de liquidité intègrent une incertitude et une volatilité supplémentaires.",
        },
        {
          id: "q4",
          prompt: "Pourquoi beaucoup de traders expérimentés évitent-ils d'ouvrir de nouvelles positions dans les minutes juste autour d'une publication d'actualité majeure ?",
          options: [
            { id: "a", text: "Parce que les actualités n'ont en réalité jamais d'importance" },
            { id: "b", text: "Parce que les spreads élargis et le risque de slippage rendent souvent médiocre le ratio risque-récompense d'échanger le pic initial" },
            { id: "c", text: "Parce qu'il est illégal d'échanger pendant les événements d'actualité" },
            { id: "d", text: "Parce que les prix ne bougent jamais pendant les publications d'actualités" },
          ],
          explanation: "C'est une décision de gestion des risques, pas une croyance que les actualités n'ont pas d'importance — le pic de volatilité initial a souvent un ratio risque-récompense médiocre en raison des spreads élargis et du slippage.",
        },
        {
          id: "q5",
          prompt: "Un gros \"dépassement\" du NFP (réel bien au-dessus de la prévision) est typiquement, toutes choses égales :",
          options: [
            { id: "a", text: "Négatif pour la monnaie pour l'USD" },
            { id: "b", text: "Positif pour la monnaie pour l'USD, bien que le mouvement initial puisse encore se retourner" },
            { id: "c", text: "Complètement sans pertinence pour les marchés des devises" },
            { id: "d", text: "Seulement pertinent pour le marché boursier, jamais le forex" },
          ],
          explanation: "Un fort dépassement est généralement lu comme positif pour l'USD (économie plus forte, politique de la Fed potentiellement plus ferme), bien que la leçon note que les réactions initiales aux actualités à fort impact peuvent encore se retourner.",
        },
      ],
    },
  },

  "market-sentiment": {
    sections: [
      {
        heading: "Ce que le \"sentiment\" signifie réellement",
        body: "Le sentiment de marché est l'attitude globale des traders/investisseurs envers un actif ou marché particulier — largement haussière (optimiste, s'attendant à ce que les prix montent) ou baissière (pessimiste, s'attendant à ce que les prix baissent). Contrairement à un prix concret ou une lecture d'indicateur, le sentiment concerne intrinsèquement l'humeur collective de la foule, c'est pourquoi il est mesuré à travers des proxys plutôt qu'un seul chiffre définitif.",
      },
      {
        heading: "Lire le sentiment sans fabriquer de certitude",
        body: "Les proxys de sentiment courants incluent le ton des titres d'actualités (la couverture est-elle encadrée positivement ou négativement), le bavardage sur les réseaux sociaux, et les données de positionnement (combien de traders sont nets longs vs. nets courts). Ceux-ci sont véritablement utiles comme jauge de psychologie de masse, mais aucun ne prédit le prix avec certitude — le sentiment est une entrée parmi plusieurs, pas un système de trading autonome.",
        list: [
          "Un sentiment extrême et unilatéral (presque tout le monde haussier, ou presque tout le monde baissier) est parfois lu comme un signal d'avertissement contrariant — quand presque tout le monde s'est déjà positionné d'une façon, il peut rester peu d'acheteurs/vendeurs pour pousser davantage.",
          "Le sentiment peut rester unilatéral et être quand même correct longtemps — les signaux contrariants sont un drapeau de prudence, pas un outil de timing.",
          "Combiner le sentiment avec l'action du prix et les fondamentaux tend à être plus robuste que de se fier au sentiment seul.",
        ],
      },
      {
        body: "Méfiez-vous de tout chiffre de sentiment présenté avec une fausse précision (\"73,2% haussier\"). À moins de savoir exactement ce qui est mesuré et comment (comptages de mots-clés dans les titres ? répondants à des enquêtes ? positionnement sur les futures ?), traitez-le comme une jauge directionnelle approximative, pas une lecture scientifique.",
      },
      {
        caption: "Une jauge de sentiment est un proxy approximatif de l'humeur de la foule — un contexte utile, jamais un signal de trading autonome.",
      },
      {
        label: "Voir le Sentiment de Marché en direct sur Analyse de Marché",
        note: "Le Biais Global de Marché du rapport d'Analyse Technique combine le Biais Technique et Fondamental en direct, notant s'ils s'accordent ou entrent en conflit.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "À quoi se réfère le \"sentiment de marché\" ?",
          options: [
            { id: "a", text: "Le spread bid/ask exact actuel" },
            { id: "b", text: "L'attitude globale (haussière ou baissière) des traders/investisseurs envers un actif" },
            { id: "c", text: "Une réglementation gouvernementale sur le trading" },
            { id: "d", text: "Le taux d'intérêt actuel" },
          ],
          explanation: "Le sentiment concerne spécifiquement l'humeur/attitude collective de la foule — optimiste (haussière) ou pessimiste (baissière) — pas un chiffre concret de prix ou de taux.",
        },
        {
          id: "q2",
          prompt: "Lequel de ces éléments est un proxy de sentiment couramment utilisé ?",
          options: [
            { id: "a", text: "Les données de positionnement — combien de traders sont nets longs vs. nets courts" },
            { id: "b", text: "Le chiffre exact du PIB historique d'il y a 10 ans" },
            { id: "c", text: "Un score de sentiment fixe publié par le gouvernement" },
            { id: "d", text: "La couleur du thème de la plateforme de trading" },
          ],
          explanation: "Les données de positionnement net long/court sont un proxy de sentiment largement utilisé, avec des choses comme le ton des actualités et le bavardage sur les réseaux sociaux.",
        },
        {
          id: "q3",
          prompt: "Pourquoi certains traders voient-ils un sentiment extrême unilatéral comme un signal d'avertissement contrariant ?",
          options: [
            { id: "a", text: "Parce que cela garantit un retournement immédiat" },
            { id: "b", text: "Parce que quand presque tout le monde s'est déjà positionné d'une façon, il peut rester peu d'acheteurs/vendeurs pour pousser davantage dans cette direction" },
            { id: "c", text: "Parce que les données de sentiment sont toujours fausses" },
            { id: "d", text: "Parce que mesurer un sentiment extrême est illégal" },
          ],
          explanation: "La logique contrariante concerne l'épuisement du positionnement unilatéral, pas une garantie — la leçon est explicite sur le fait qu'un sentiment unilatéral peut persister et rester correct longtemps.",
        },
        {
          id: "q4",
          prompt: "Quelle est la façon recommandée d'utiliser les données de sentiment, selon cette leçon ?",
          options: [
            { id: "a", text: "Comme un système de trading autonome en lui-même" },
            { id: "b", text: "Combiné avec l'action du prix et les fondamentaux, comme une entrée parmi plusieurs" },
            { id: "c", text: "Jamais — le sentiment n'a aucune valeur" },
            { id: "d", text: "Seulement sur les marchés de cryptomonnaies" },
          ],
          explanation: "La leçon présente le sentiment comme un contexte véritablement utile qui est plus robuste quand combiné avec d'autres analyses, pas comme un signal autonome.",
        },
        {
          id: "q5",
          prompt: "Pourquoi un trader devrait-il se méfier d'une lecture de sentiment présentée avec une fausse précision (comme \"73,2% haussier\") ?",
          options: [
            { id: "a", text: "Parce qu'une telle précision est toujours fabriquée et sans signification" },
            { id: "b", text: "Parce que sans savoir exactement ce qui est mesuré et comment, cette précision peut exagérer à quel point la lecture est vraiment scientifique" },
            { id: "c", text: "Parce que le sentiment ne peut jamais être mesuré qu'en nombres entiers" },
            { id: "d", text: "Parce que les décimales ne sont pas autorisées en finance" },
          ],
          explanation: "La prudence concerne la compréhension de la méthodologie derrière un chiffre avant de faire confiance à sa précision apparente — pas que tous ces chiffres soient faux, mais qu'ils ne devraient pas être pris comme plus rigoureux qu'ils ne le sont réellement.",
        },
      ],
    },
  },

  "position-sizing-math": {
    sections: [
      {
        heading: "Le calcul dont chaque transaction a besoin",
        body: "Le dimensionnement de position répond à une question avant chaque transaction : étant donné combien vous êtes prêt à perdre si vous avez tort, quelle taille de position pouvez-vous réellement prendre ? Bien faire cela est sans doute plus important qu'avoir raison sur la direction du marché — c'est ce qui empêche une série de transactions perdantes de jamais mettre fin au compte.",
      },
      {
        heading: "Les trois entrées",
        body: "La taille de position dépend exactement de trois choses : le solde de votre compte, le pourcentage de celui-ci que vous êtes prêt à risquer sur cette transaction (communément 1-2% pour les traders disciplinés), et la distance (en pips ou unités de prix) entre votre entrée et votre stop-loss.",
        list: [
          "Montant de Risque = Solde du Compte × % de Risque — le montant en dollars réel que vous êtes prêt à perdre sur cette transaction.",
          "Distance du Stop-Loss = à quelle distance (en pips) votre stop se trouve de votre entrée.",
          "Taille de Position = Montant de Risque ÷ (Distance du Stop-Loss × Valeur par pip par unité) — résolu à l'envers à partir de combien vous êtes prêt à perdre.",
        ],
      },
      {
        label: "Formule de Dimensionnement de Position",
        note: "Un compte de 10 000 $ risquant 1% (100 $) avec un stop de 20 pips sur une paire où un lot standard = 10 $/pip nécessite : 100 $ ÷ (20 × 10 $) = 0,5 lot standard.",
      },
      {
        body: "Remarquez que la formule ne demande jamais \"quelle confiance avez-vous dans cette transaction ?\". Le dimensionnement de position est délibérément indépendant de la confiance — il s'agit de survivre à une erreur, pas d'augmenter la taille parce qu'une configuration \"semble\" imparable.",
      },
      {
        body: "Un effet de levier élevé vous permet d'ouvrir une position bien plus grande que ce que le solde de votre compte pourrait normalement supporter — ce qui signifie qu'un mouvement de prix petit et ordinaire contre vous peut éliminer une part bien plus importante de votre compte qu'il ne le ferait sans levier. Le levier ne change pas votre avantage sur le marché ; il ne change que la vitesse à laquelle une erreur devient coûteuse.",
      },
      {
        caption: "Essayez : entrez votre propre solde de compte, % de risque et distance de stop-loss.",
      },
      {
        caption: "Essayez : voyez combien de marge une position nécessite réellement à un effet de levier donné, et combien de marge libre il reste.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Quelles trois entrées un calcul de dimensionnement de position nécessite-t-il ?",
          options: [
            { id: "a", text: "Solde du compte, % de risque et distance de stop-loss" },
            { id: "b", text: "RSI actuel, moyenne mobile et niveau de Fibonacci" },
            { id: "c", text: "Nom du courtier, ratio de levier et sentiment des actualités" },
            { id: "d", text: "Couleur de la bougie, longueur de mèche et taille de corps" },
          ],
          explanation: "Le dimensionnement de position est purement une fonction du solde du compte, du % que vous risquez, et de la distance entre votre stop-loss et votre entrée — rien sur l'analyse de marché elle-même.",
        },
        {
          id: "q2",
          prompt: "Un compte de 10 000 $ risque 1% par transaction. Quel est le Montant de Risque en dollars pour une transaction ?",
          options: [
            { id: "a", text: "10 $" },
            { id: "b", text: "100 $" },
            { id: "c", text: "1 000 $" },
            { id: "d", text: "10 000 $" },
          ],
          explanation: "Montant de Risque = Solde du Compte × % de Risque = 10 000 $ × 1% = 100 $.",
        },
        {
          id: "q3",
          prompt: "En utilisant ce même montant de risque de 100 $ avec un stop de 20 pips, sur une paire où un lot standard vaut 10 $/pip, quelle taille de lot maintient le risque à exactement 100 $ ?",
          options: [
            { id: "a", text: "0,05 lot" },
            { id: "b", text: "0,5 lot" },
            { id: "c", text: "5 lots" },
            { id: "d", text: "50 lots" },
          ],
          explanation: "Taille de Lot ≈ Montant de Risque ÷ (Pips de Stop × Valeur du Pip par Lot) = 100 $ ÷ (20 × 10 $) = 0,5 lot standard.",
        },
        {
          id: "q4",
          prompt: "Pourquoi la leçon dit-elle que le dimensionnement de position est délibérément \"indépendant de la confiance\" ?",
          options: [
            { id: "a", text: "Parce qu'il devrait augmenter chaque fois qu'une transaction semble être une chose sûre" },
            { id: "b", text: "Parce que la formule concerne la survie à une erreur, indépendamment du niveau de confiance ressenti à l'entrée" },
            { id: "c", text: "Parce que la confiance est la seule entrée qui compte" },
            { id: "d", text: "Parce que le dimensionnement de position n'affecte en réalité pas les résultats" },
          ],
          explanation: "Tout l'intérêt du dimensionnement de position discipliné est qu'il limite votre perte si vous avez tort — il n'est pas censé fluctuer selon un ressenti sur la probabilité de réussite de la transaction.",
        },
        {
          id: "q5",
          prompt: "Quelle fourchette de risque par transaction couramment citée beaucoup de traders disciplinés utilisent-ils ?",
          options: [
            { id: "a", text: "1-2% du solde du compte par transaction" },
            { id: "b", text: "25-50% du solde du compte par transaction" },
            { id: "c", text: "100% du solde du compte par transaction" },
            { id: "d", text: "Il n'existe aucune fourchette couramment citée" },
          ],
          explanation: "1-2% par transaction est une directive de gestion des risques largement citée, maintenant chaque perte individuelle petite par rapport au compte global.",
        },
      ],
    },
  },

  "risk-to-reward-ratio": {
    sections: [
      {
        heading: "Vous n'avez pas besoin d'avoir raison la plupart du temps",
        body: "Le ratio Risque-Récompense (R:R) compare combien vous risquez de perdre si une transaction se passe mal (risque, c'est-à-dire la distance jusqu'au stop-loss) contre combien vous pourriez gagner si elle se passe bien (récompense, c'est-à-dire la distance jusqu'au take-profit). Un ratio de 1:2 signifie risquer 1 unité pour potentiellement en gagner 2 ; 1:3 signifie risquer 1 pour potentiellement en gagner 3.",
      },
      {
        heading: "Pourquoi cela change les mathématiques du taux de réussite",
        body: "Avec un R:R constant de 1:2, vous pouvez être rentable globalement même en gagnant seulement 40% des transactions, car chaque gain récupère plus de la valeur de deux pertes. C'est la raison individuelle la plus importante pour laquelle les traders professionnels s'obsèdent du R:R avant de jamais placer une transaction — cela dissocie la rentabilité à long terme de la nécessité d'avoir raison la plupart du temps.",
        list: [
          "À un R:R de 1:1, vous avez besoin d'un taux de réussite > 50% juste pour être rentable (en ignorant les coûts).",
          "À un R:R de 1:2, un taux de réussite d'environ 34%+ peut être rentable.",
          "À un R:R de 1:3, un taux de réussite d'environ 25%+ peut être rentable.",
          "Ce sont des seuils simplifiés de seuil de rentabilité ignorant le spread/la commission — les coûts réels relèvent légèrement la barre.",
        ],
      },
      {
        label: "Ratio Risque-Récompense",
        note: "Entrée à 1,1000, stop-loss à 1,0950 (risque de 50 pips), take-profit à 1,1100 (récompense de 100 pips) → R:R = 100 ÷ 50 = 1:2.",
      },
      {
        body: "Une transaction avec un mauvais R:R (comme 1:0,5 — risquant plus que ce que vous pourriez gagner) nécessite un taux de réussite irréalistement élevé juste pour atteindre le seuil de rentabilité. Avant de demander \"cette transaction va-t-elle gagner ?\", demandez \"le R:R de cette transaction vaut-il même la peine d'être pris si j'ai tort la moitié du temps ?\"",
      },
      {
        body: "Un excellent R:R sur papier ne vous protège pas si vous déplacez votre stop-loss plus loin en cours de transaction pour \"lui donner plus d'espace\" une fois qu'elle perd. Cette seule habitude — élargir un stop après l'entrée — transforme silencieusement une transaction planifiée 1:2 en une non planifiée et illimitée, et c'est une des façons les plus rapides dont le dimensionnement de position discipliné perd tout son sens.",
      },
      {
        caption: "Une configuration risque-récompense de 1:2 : le gain potentiel (vert) est deux fois la taille de la perte potentielle (rouge).",
      },
      {
        caption: "Essayez : entrez votre propre entrée, stop-loss et take-profit pour voir le risque en dollars, la récompense en dollars et le ratio R:R.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Une transaction risque 40 pips pour potentiellement gagner 120 pips. Quel est le ratio Risque-Récompense ?",
          options: [
            { id: "a", text: "1:2" },
            { id: "b", text: "1:3" },
            { id: "c", text: "3:1" },
            { id: "d", text: "1:1" },
          ],
          explanation: "R:R = Récompense ÷ Risque = 120 ÷ 40 = 3, donc c'est un ratio de 1:3 — risquant 1 unité pour un potentiel de 3.",
        },
        {
          id: "q2",
          prompt: "À un ratio risque-récompense constant de 1:2, quel taux de réussite est approximativement nécessaire pour être rentable globalement (en ignorant les coûts) ?",
          options: [
            { id: "a", text: "Au-dessus de 50%" },
            { id: "b", text: "Environ 34% ou plus" },
            { id: "c", text: "Exactement 100%" },
            { id: "d", text: "Le taux de réussite est sans importance pour la rentabilité" },
          ],
          explanation: "Avec chaque gain valant 2x chaque perte, vous pouvez être net rentable en ne gagnant qu'environ un tiers des transactions — une raison centrale pour laquelle la discipline du R:R compte autant.",
        },
        {
          id: "q3",
          prompt: "Que nécessite un ratio risque-récompense de 1:1, en ignorant les coûts de trading, pour être rentable avec le temps ?",
          options: [
            { id: "a", text: "Un taux de réussite au-dessus de 50%" },
            { id: "b", text: "Un taux de réussite au-dessus de 90%" },
            { id: "c", text: "N'importe quel taux de réussite fonctionne aussi bien" },
            { id: "d", text: "Un taux de réussite d'exactement 0%" },
          ],
          explanation: "À 1:1, les gains et les pertes sont de même taille, donc vous devez gagner plus de la moitié de vos transactions (en tenant compte des coûts cela augmente encore plus) juste pour vous en sortir avantageux.",
        },
        {
          id: "q4",
          prompt: "Pourquoi les traders professionnels mettent-ils l'accent sur le R:R avant de placer une transaction, selon cette leçon ?",
          options: [
            { id: "a", text: "Parce que cela garantit que chaque transaction individuelle gagnera" },
            { id: "b", text: "Parce qu'un R:R favorable dissocie la rentabilité à long terme de la nécessité d'avoir raison la plupart du temps" },
            { id: "c", text: "Parce que le R:R n'a rien à voir avec la rentabilité" },
            { id: "d", text: "Parce qu'il élimine le besoin de stop-loss" },
          ],
          explanation: "Un bon R:R signifie que vous n'avez pas besoin d'un taux de réussite élevé pour être rentable globalement — c'est précisément pourquoi il est traité comme une gestion des risques fondamentale.",
        },
        {
          id: "q5",
          prompt: "Une transaction a un ratio risque-récompense de 1:0,5 (risquant plus que le gain potentiel). Qu'est-ce que cela signifie pour le taux de réussite nécessaire pour atteindre le seuil de rentabilité ?",
          options: [
            { id: "a", text: "Elle nécessite un taux de réussite bien au-dessus de 50% juste pour atteindre le seuil de rentabilité" },
            { id: "b", text: "Elle n'a presque besoin d'aucune transaction gagnante" },
            { id: "c", text: "Le taux de réussite n'a pas d'importance à ce ratio" },
            { id: "d", text: "Ce ratio garantit toujours une perte quel que soit le taux de réussite" },
          ],
          explanation: "Quand la perte potentielle est plus grande que le gain potentiel, vous devez gagner une proportion disproportionnée de transactions juste pour éviter une perte nette avec le temps.",
        },
      ],
    },
  },

  "trading-journal": {
    sections: [
      {
        heading: "Vous ne pouvez pas améliorer ce que vous n'enregistrez pas",
        body: "Un journal de trading est un registre structuré de chaque transaction que vous faites — pas seulement le résultat, mais le raisonnement derrière elle. Sans cela, les traders tendent à se souvenir vivement de leurs meilleures transactions et à oublier ou rationaliser commodément leurs pires, ce qui rend presque impossible l'auto-évaluation honnête.",
      },
      {
        heading: "Ce qui appartient réellement à une entrée de journal utile",
        body: "Une entrée de journal qui vaut la peine d'être conservée capture plus que simplement \"gagné\" ou \"perdu\" — elle capture le contexte de prise de décision, de sorte que les motifs (bons et mauvais) deviennent visibles sur des dizaines d'entrées au lieu de rester invisibles dans la mémoire.",
        list: [
          "La configuration/raison d'entrer (quel signal ou analyse a déclenché la transaction)",
          "Prix d'entrée, stop-loss, take-profit et taille de position",
          "Le résultat réel et le R:R atteint",
          "Votre état émotionnel à l'entrée et à la sortie (calme ? anxieux ? poursuivant une perte ?)",
          "Une courte note honnête : que feriez-vous différemment, s'il y a quelque chose ?",
        ],
      },
      {
        body: "Consignez vos transactions même — surtout — les pertes ennuyeuses et correctes dans le processus où vous avez suivi votre plan exactement et avez quand même perdu. Celles-ci sont la preuve que votre processus peut être sain même quand une transaction spécifique n'est pas rentable, ce qui est une leçon différente (et plus saine) que \"j'avais tort\".",
      },
      {
        caption: "Un journal de trading transforme des transactions individuelles dispersées en un motif visible et améliorable.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Pourquoi un journal de trading est-il important, au-delà du simple suivi des gains et pertes ?",
          options: [
            { id: "a", text: "C'est une exigence légale dans tous les pays" },
            { id: "b", text: "Il enregistre le contexte de prise de décision, rendant visibles des motifs que la mémoire seule manquerait ou rationaliserait" },
            { id: "c", text: "Il augmente automatiquement votre taux de réussite" },
            { id: "d", text: "Il remplace le besoin d'un stop-loss" },
          ],
          explanation: "La valeur centrale est l'auto-évaluation honnête et structurée — la mémoire seule tend à surpondérer les grands gains et à rationaliser les pertes, ce qu'un journal corrige.",
        },
        {
          id: "q2",
          prompt: "Lequel de ces éléments appartient à une entrée de journal bien structurée, selon cette leçon ?",
          options: [
            { id: "a", text: "Seulement si la transaction a gagné ou perdu" },
            { id: "b", text: "La configuration/raisonnement, les niveaux d'entrée/stop/cible, le résultat et votre état émotionnel" },
            { id: "c", text: "Seulement le nom du courtier" },
            { id: "d", text: "Rien — tenir un journal est un travail de routine optionnel" },
          ],
          explanation: "Une entrée utile capture le contexte complet de décision — pas seulement le résultat binaire — incluant l'état émotionnel à l'entrée/sortie.",
        },
        {
          id: "q3",
          prompt: "Pourquoi devriez-vous consigner une transaction où vous avez suivi votre plan exactement et avez quand même perdu ?",
          options: [
            { id: "a", text: "Vous ne devriez pas — seules les transactions gagnantes valent d'être enregistrées" },
            { id: "b", text: "Parce que c'est une preuve que votre processus peut être sain même quand une transaction individuelle n'est pas rentable — une leçon différente de \"j'avais tort\"" },
            { id: "c", text: "Parce que les pertes doivent toujours être supprimées du registre" },
            { id: "d", text: "Parce que cela garantit que la prochaine transaction gagnera" },
          ],
          explanation: "Une perte correcte dans le processus est une donnée précieuse : elle montre que le plan peut encore perdre parfois même lorsqu'il est bien exécuté, ce qui est une distinction plus saine que de traiter chaque perte comme une erreur personnelle.",
        },
        {
          id: "q4",
          prompt: "Que tend-il à arriver à la mémoire d'un trader sur son propre historique de trading sans journal ?",
          options: [
            { id: "a", text: "Elle reste parfaitement précise et impartiale" },
            { id: "b", text: "Elle tend à se souvenir vivement des grands gains tout en oubliant ou rationalisant les pertes" },
            { id: "c", text: "Elle devient automatiquement plus détaillée avec le temps" },
            { id: "d", text: "Il n'y a aucune différence avec ou sans journal" },
          ],
          explanation: "Ce biais de mémoire sélective est exactement pourquoi un registre externe et structuré compte — c'est une vérification contre le souvenir auto-complaisant.",
        },
        {
          id: "q5",
          prompt: "Quel est l'objectif ultime de la revue d'un journal de trading avec le temps ?",
          options: [
            { id: "a", text: "Gagner chaque future transaction individuelle" },
            { id: "b", text: "Repérer des motifs récurrents (bons et mauvais) à travers de nombreuses transactions et affiner votre processus" },
            { id: "c", text: "Calculer la commission de votre courtier" },
            { id: "d", text: "Prédire des prix futurs exacts" },
          ],
          explanation: "La valeur du journal s'accumule sur de nombreuses entrées — faisant ressortir des motifs dans votre propre comportement et prise de décision qu'un seul résultat de transaction ne pourrait jamais révéler.",
        },
      ],
    },
  },

  "fomo-and-greed": {
    sections: [
      {
        heading: "Les deux émotions qui ruinent des plans par ailleurs solides",
        body: "Le FOMO (Peur de Manquer Quelque Chose) est l'envie anxieuse de sauter dans un mouvement déjà en cours, habituellement sans que vos critères de configuration normaux ne soient remplis, parce que \"ça bouge sans moi\". L'avidité est l'envie de conserver une position gagnante au-delà de votre objectif planifié, de surdimensionner une position parce qu'une transaction \"semble\" imparable, ou de rentrer immédiatement après un gros gain en poursuivant plus.",
      },
      {
        heading: "Pourquoi celles-ci ciblent spécifiquement votre processus",
        body: "Les deux émotions partagent un mécanisme commun : elles vous convaincent d'abandonner une règle que vous avez établie à l'avance (calmement, avec un esprit clair) en faveur d'une impulsion du moment (sous pression émotionnelle). La règle existait précisément parce que votre moi calme et planificateur savait que votre moi du moment ne pouvait pas être digne de confiance pour bien prendre cette décision.",
        list: [
          "Entrée FOMO : entrer tard, poursuivre un mouvement sans plan de stop-loss ou avec une position surdimensionnée, parce que la configuration semble déjà \"évidemment\" correcte.",
          "Abandon d'objectif par avidité : déplacer votre take-profit plus loin en cours de transaction parce que le mouvement \"pourrait continuer\", transformant un gain planifié en un pari non planifié.",
          "Trading de vengeance : rentrer immédiatement après une perte pour \"la récupérer\", habituellement avec un jugement altéré et souvent surdimensionné.",
          "La solution commune aux trois : s'engager à l'avance sur des règles d'entrée/sortie AVANT le moment émotionnel, et traiter tout écart par rapport à elles comme un échec de processus indépendamment du fait que cet écart spécifique se soit avéré fonctionner.",
        ],
      },
      {
        body: "Une transaction qui enfreint vos règles mais qui réussit à gagner est plus dangereuse à long terme qu'une qui suit vos règles et perd — l'infraction gagnante vous enseigne la mauvaise leçon (\"ça a fonctionné, donc c'est acceptable\") et rend l'infraction suivante plus facile.",
      },
      {
        caption: "La séquence de détournement émotionnel que les règles engagées à l'avance existent spécifiquement pour interrompre.",
      },
      {
        body: "Le trading de vengeance est le plus dangereux des trois car il s'amplifie : une perte déclenche une rentrée impulsive et surdimensionnée, qui est statistiquement plus susceptible de perdre également, ce qui déclenche une envie encore plus forte de \"la récupérer\". Chaque cycle augmente à la fois la taille de position et les enjeux émotionnels — c'est ainsi qu'une seule perte gérable devient une perte qui met fin au compte.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Qu'est-ce que le FOMO (Peur de Manquer Quelque Chose) pousse typiquement un trader à faire ?",
          options: [
            { id: "a", text: "Attendre patiemment que ses critères de configuration normaux soient remplis" },
            { id: "b", text: "Sauter dans un mouvement déjà en cours, souvent sans que ses critères de configuration normaux ne soient remplis" },
            { id: "c", text: "Réduire automatiquement la taille de position" },
            { id: "d", text: "Fermer immédiatement toutes les positions ouvertes" },
          ],
          explanation: "Le FOMO est spécifiquement l'envie anxieuse de poursuivre un mouvement déjà en cours, contournant habituellement les propres règles d'entrée normales du trader.",
        },
        {
          id: "q2",
          prompt: "Qu'est-ce que le \"trading de vengeance\" ?",
          options: [
            { id: "a", text: "Examiner calmement une perte dans son journal de trading" },
            { id: "b", text: "Rentrer immédiatement sur le marché après une perte pour essayer de \"la récupérer\", habituellement avec un jugement altéré" },
            { id: "c", text: "Un type d'ordre à cours limité" },
            { id: "d", text: "Réduire le risque après une série de pertes" },
          ],
          explanation: "Le trading de vengeance est la tentative impulsive de récupérer immédiatement une perte, amplifiant typiquement l'erreur originale avec une mauvaise prise de décision sous pression émotionnelle.",
        },
        {
          id: "q3",
          prompt: "Quel mécanisme commun le FOMO et l'avidité partagent-ils, selon cette leçon ?",
          options: [
            { id: "a", text: "Les deux impliquent l'abandon d'une règle fixée calmement à l'avance, en faveur d'une impulsion émotionnelle du moment" },
            { id: "b", text: "Les deux n'affectent que les traders débutants, jamais les expérimentés" },
            { id: "c", text: "Les deux sont nécessaires pour une rentabilité constante" },
            { id: "d", text: "Aucun n'a de véritable effet sur les résultats de trading" },
          ],
          explanation: "Le motif central est le même : une règle engagée à l'avance et à l'esprit clair est annulée par une impulsion émotionnelle du moment — c'est exactement ce que l'engagement préalable est censé prévenir.",
        },
        {
          id: "q4",
          prompt: "Pourquoi une transaction qui enfreint les règles mais qui réussit à GAGNER est-elle considérée dangereuse à long terme ?",
          options: [
            { id: "a", text: "Elle ne l'est pas — toute transaction gagnante est bonne" },
            { id: "b", text: "Elle renforce la mauvaise leçon (\"enfreindre la règle a fonctionné\"), rendant l'infraction suivante plus facile" },
            { id: "c", text: "Les transactions gagnantes doivent toujours être signalées à un régulateur" },
            { id: "d", text: "Elle garantit que la prochaine transaction enfreindra aussi les règles" },
          ],
          explanation: "Une infraction gagnante enseigne à un trader que la règle n'avait pas d'importance cette fois, ce qui érode la discipline pour les transactions futures même si le résultat était bon purement par hasard.",
        },
        {
          id: "q5",
          prompt: "Quelle est la solution générale recommandée pour le FOMO, l'avidité et le trading de vengeance à la fois ?",
          options: [
            { id: "a", text: "S'engager à l'avance sur des règles d'entrée/sortie avant le moment émotionnel, et traiter tout écart par rapport à elles comme un échec de processus indépendamment du résultat" },
            { id: "b", text: "Échanger exclusivement sur instinct émotionnel, puisque les règles limitent le potentiel de profit" },
            { id: "c", text: "N'échanger que lorsqu'on se sent extrêmement confiant" },
            { id: "d", text: "Augmenter la taille de position après chaque perte pour récupérer plus vite" },
          ],
          explanation: "La solution centrale de la leçon est l'engagement préalable : décider des règles dans un état calme, avant la pression émotionnelle d'une transaction en direct, et s'y tenir indépendamment du fait qu'un écart spécifique aurait fonctionné.",
        },
      ],
    },
  },
};
