// lib/i18n/academyBody/es.js
//
// Spanish (es) full lesson-BODY translation pack — see
// lib/i18n/academyBodyContent.js's header comment for the exact scope
// (which section fields are translated vs. left as English notation)
// and how this object is merged onto lib/academyData.js's English
// lesson objects. Keyed by lessonId; each `sections` entry is matched
// by ARRAY INDEX against that lesson's own `sections` array, and each
// quiz question is matched by its stable `id`.

export const ACADEMY_BODY_ES = {
  "inflation-reality": {
    sections: [
      {
        heading: "Por qué un dólar de hoy compra menos mañana",
        body: "La inflación es un aumento sostenido del nivel general de precios de bienes y servicios, lo que significa que cada unidad de moneda compra un poco menos con el tiempo. No es un fallo; en la mayoría de las economías modernas es un objetivo de política deliberado (normalmente alrededor del 2% anual), porque los bancos centrales creen que una inflación suave y predecible fomenta el gasto y la inversión frente a acumular efectivo.",
      },
      {
        heading: "El impuesto silencioso sobre los ahorros",
        body: "Si tus ahorros están en efectivo ganando 0% mientras los precios suben un 5% al año, tu riqueza real (ajustada por inflación) se reduce aunque el número en tu cuenta se mantenga igual. Por eso \"ahorrar\" e \"invertir\" son objetivos distintos: ahorrar preserva el monto nominal, invertir busca superar la tasa de inflación.",
        list: [
          "Valor nominal: el número impreso en el billete o extracto — nunca cae por sí solo.",
          "Valor real: lo que ese número realmente puede comprar — cae siempre que la inflación es positiva.",
          "Poder de compra: otro nombre para el valor real, normalmente medido frente a una canasta de bienes (un Índice de Precios al Consumidor).",
        ],
      },
      {
        body: "Compara precios, no solo montos de moneda, a lo largo del tiempo. \"Mi renta solo subió un 20% en 5 años\" suena bien hasta que revisas si los salarios promedio o el IPC subieron más o menos que eso.",
      },
      {
        label: "Rendimiento Real",
        note: "Una cuenta de ahorro que paga 3% de interés durante una inflación del 6% te sigue haciendo perder cerca del 3% de poder de compra real al año.",
      },
      {
        caption: "El mismo billete de $100, comprando menos en cada década que pasa con una inflación anual constante del 2%.",
      },
      {
        caption: "Pruébalo: mira exactamente cuánto ha erosionado una cantidad pasada en poder de compra real.",
      },
      {
        caption: "Pruébalo: proyecta un plan de inversión con aportes mensuales y comprueba si supera a la inflación.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "¿Qué significa fundamentalmente la \"inflación\"?",
          options: [
            { id: "a", text: "Las tasas de interés están subiendo" },
            { id: "b", text: "El nivel general de precios de bienes y servicios sube con el tiempo" },
            { id: "c", text: "El mercado de valores está subiendo" },
            { id: "d", text: "Una moneda se ha devaluado frente al oro" },
          ],
          explanation: "La inflación es específicamente un aumento sostenido del nivel general de precios — lo mismo que una caída en lo que cada unidad de moneda puede comprar.",
        },
        {
          id: "q2",
          prompt: "Tu cuenta de ahorros paga 2% de interés al año mientras la inflación es del 5%. ¿Qué pasa con tu poder de compra real?",
          options: [
            { id: "a", text: "Crece alrededor de un 7% al año" },
            { id: "b", text: "No cambia, porque el saldo sigue creciendo" },
            { id: "c", text: "Se reduce alrededor de un 3% al año" },
            { id: "d", text: "Depende solo del tipo de cambio" },
          ],
          explanation: "Rendimiento Real ≈ Rendimiento Nominal − Tasa de Inflación, entonces 2% − 5% = −3%. El número en la cuenta sigue creciendo, pero lo que puede comprar se reduce.",
        },
        {
          id: "q3",
          prompt: "El \"valor nominal\" se refiere a:",
          options: [
            { id: "a", text: "El poder de compra ajustado por inflación del dinero" },
            { id: "b", text: "El simple número impreso en un billete o mostrado en un extracto" },
            { id: "c", text: "El valor del dinero en una moneda extranjera" },
            { id: "d", text: "El valor del oro que respalda una moneda" },
          ],
          explanation: "El valor nominal es solo el monto nominal — nunca cae por sí solo. El valor real es ese mismo monto ajustado por lo que realmente puede comprar.",
        },
        {
          id: "q4",
          prompt: "¿Por qué la mayoría de los bancos centrales tienen como objetivo una inflación positiva pequeña (como 2%) en lugar de 0%?",
          options: [
            { id: "a", text: "Para abaratar automáticamente las importaciones" },
            { id: "b", text: "Porque la deflación (caída de precios) es matemáticamente imposible" },
            { id: "c", text: "Para desincentivar acumular efectivo y fomentar el gasto/inversión" },
            { id: "d", text: "No hay una razón real — es arbitrario" },
          ],
          explanation: "Una inflación suave y predecible se usa ampliamente como política porque empuja a las personas a gastar e invertir dinero en lugar de guardar efectivo que pierde valor con el tiempo de todos modos.",
        },
        {
          id: "q5",
          prompt: "Una canasta de bienes que costaba $100 hace diez años ahora cuesta $122. ¿En qué porcentaje han subido los precios, y qué significa eso para $100 mantenidos en efectivo todo ese tiempo?",
          options: [
            { id: "a", text: "Los precios subieron 22%; esos mismos $100 ahora compran menos de la canasta que antes" },
            { id: "b", text: "Los precios cayeron 22%; los $100 compran más ahora" },
            { id: "c", text: "Los precios no cambiaron; solo importan los salarios" },
            { id: "d", text: "Esto no afecta el poder de compra" },
          ],
          explanation: "Un aumento de $100 a $122 por la misma canasta es una inflación acumulada del 22% — ese mismo billete de $100 ya no alcanza para cubrir esa canasta.",
        },
      ],
    },
  },

  "money-vs-fiat": {
    sections: [
      {
        heading: "¿Qué hace que algo sea \"dinero\"?",
        body: "Los economistas generalmente coinciden en que el dinero debe cumplir bien tres funciones: servir como medio de intercambio (la gente lo aceptará por bienes/servicios), depósito de valor (mantiene su valor con el tiempo) y unidad de cuenta (los precios pueden cotizarse de forma significativa en él). Históricamente, cosas como el oro, la plata, la sal e incluso grandes discos de piedra han funcionado como dinero en distinta medida.",
      },
      {
        heading: "Moneda fiduciaria: dinero por decreto",
        body: "\"Fiat\" viene del latín para \"hágase\". La moneda fiduciaria (como el Dólar estadounidense, el Euro o la Rupia pakistaní hoy) tiene valor porque un gobierno la declara de curso legal y la gente confía en que seguirá siendo aceptada — no porque esté respaldada por una cantidad fija de un bien físico. Desde 1971, cuando EE.UU. terminó la convertibilidad del dólar en oro (el \"Shock de Nixon\"), prácticamente toda moneda mundial importante ha sido fiduciaria.",
        list: [
          "Dinero mercancía: el valor viene del material mismo (una moneda de oro vale aproximadamente su contenido de oro).",
          "Dinero representativo: un comprobante de papel redimible por una cantidad fija de un bien (un antiguo certificado de oro).",
          "Dinero fiduciario: el valor viene del decreto gubernamental y la confianza pública — no respaldado por un bien redimible.",
        ],
      },
      {
        body: "La mayor fortaleza de la moneda fiduciaria (los bancos centrales pueden expandir o contraer la oferta monetaria rápidamente para responder a una crisis) es también su mayor debilidad a largo plazo (esa misma flexibilidad hace estructuralmente fácil la devaluación gradual de la moneda).",
      },
      {
        caption: "Dos respuestas muy distintas a \"¿por qué este papel tiene valor?\"",
      },
      {
        label: "Ver tasas de moneda fiduciaria en vivo en el Conversor",
        note: "Compara cómo el valor de una moneda fiduciaria flota frente a otras — y frente al oro — en tiempo real.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "¿Cuál de las siguientes NO es una de las tres funciones clásicas que debe cumplir el dinero?",
          options: [
            { id: "a", text: "Medio de intercambio" },
            { id: "b", text: "Depósito de valor" },
            { id: "c", text: "Unidad de cuenta" },
            { id: "d", text: "Garantía de una tasa de interés fija" },
          ],
          explanation: "Las tres funciones clásicas son medio de intercambio, depósito de valor y unidad de cuenta. Las tasas de interés son un concepto de política monetaria aparte, no una función definitoria del dinero.",
        },
        {
          id: "q2",
          prompt: "¿Qué le da valor hoy a una moneda fiduciaria como el Dólar estadounidense?",
          options: [
            { id: "a", text: "Una cantidad fija y redimible de oro en poder del banco central" },
            { id: "b", text: "El decreto gubernamental (curso legal) y la confianza pública" },
            { id: "c", text: "Su peso en plata" },
            { id: "d", text: "Un tipo de cambio fijo con Bitcoin" },
          ],
          explanation: "La moneda fiduciaria está respaldada por decreto gubernamental y la confianza del público en que seguirá siendo aceptada — no por un bien redimible.",
        },
        {
          id: "q3",
          prompt: "¿Qué hecho histórico se cita comúnmente como el fin de la convertibilidad directa del Dólar estadounidense en oro?",
          options: [
            { id: "a", text: "La crisis financiera de 2008" },
            { id: "b", text: "El Acuerdo de Bretton Woods de 1944" },
            { id: "c", text: "El \"Shock de Nixon\" de 1971" },
            { id: "d", text: "La creación del Euro" },
          ],
          explanation: "En 1971, el presidente Nixon suspendió la convertibilidad del dólar en oro, lo que efectivamente llevó a EE.UU. (y pronto al resto del mundo) a un sistema totalmente fiduciario.",
        },
        {
          id: "q4",
          prompt: "¿Cuál es el principal riesgo estructural comúnmente asociado a los sistemas de moneda fiduciaria?",
          options: [
            { id: "a", text: "Los bancos centrales no pueden responder rápido a crisis económicas" },
            { id: "b", text: "La oferta monetaria puede expandirse con relativa facilidad, arriesgando devaluación/inflación" },
            { id: "c", text: "Nunca puede usarse para comercio internacional" },
            { id: "d", text: "Siempre debe imprimirse físicamente, sin forma digital" },
          ],
          explanation: "Como la oferta fiduciaria no está anclada a un bien físico fijo, puede expandirse por decisiones de política — lo cual es flexible en una crisis, pero estructuralmente facilita la devaluación gradual más que bajo un sistema respaldado por mercancías.",
        },
        {
          id: "q5",
          prompt: "Un antiguo billete de papel que podía cambiarse físicamente en un banco por una cantidad fija de oro es un ejemplo de:",
          options: [
            { id: "a", text: "Dinero fiduciario" },
            { id: "b", text: "Dinero representativo" },
            { id: "c", text: "Criptomoneda" },
            { id: "d", text: "Un contrato derivado" },
          ],
          explanation: "Eso es dinero representativo — un comprobante de papel redimible por una cantidad fija de un bien, distinto tanto del dinero mercancía puro como del dinero fiduciario.",
        },
      ],
    },
  },

  "fractional-reserve-banking": {
    sections: [
      {
        heading: "Tu depósito no solo está guardado en una bóveda",
        body: "Cuando depositas $1,000 en un banco, el banco no lo encierra en una bóveda esperando que lo retires. Bajo el sistema de reserva fraccionaria, el banco guarda solo una fracción como reservas y presta el resto, ganando interés sobre esos préstamos. Históricamente los reguladores fijaban un coeficiente mínimo de reserva; en la práctica, los marcos modernos (como el enfoque de EE.UU. tras 2020) a menudo dependen más de requisitos de capital y liquidez que de un único coeficiente fijo, pero el mecanismo central — los bancos prestando la mayor parte de lo depositado — no ha cambiado.",
      },
      {
        heading: "Cómo esto crea nuevo dinero",
        body: "Ese dinero prestado normalmente se gasta y se vuelve a depositar en el sistema bancario, donde el banco receptor nuevamente presta la mayor parte. Repetido en todo el sistema, este proceso multiplica efectivamente el depósito original en una cantidad mucho mayor de dinero total en circulación — sin imprimir un solo billete nuevo.",
        list: [
          "Depositas $1,000. El banco guarda una reserva y presta el resto.",
          "El prestatario lo gasta; el receptor lo deposita en (posiblemente) otro banco.",
          "Ese banco de nuevo guarda una reserva y presta el resto — y el ciclo se repite.",
          "El techo teórico del dinero total creado es aproximadamente el depósito original dividido por el coeficiente de reserva.",
        ],
      },
      {
        label: "Multiplicador Monetario Simple",
        note: "Con un coeficiente de reserva del 10%, un depósito de $1,000 puede teóricamente sostener hasta $10,000 de depósitos totales en todo el sistema. Las cifras reales suelen ser menores por tenencias de efectivo, reservas excedentes y demanda de préstamos.",
      },
      {
        body: "Por esto exactamente una \"corrida bancaria\" (todos intentando retirar a la vez) es peligrosa: el banco realmente no tiene el depósito completo de todos en efectivo al mismo tiempo — en gran parte está prestado.",
      },
      {
        caption: "Cómo un depósito se propaga por el sistema bancario, expandiendo la oferta monetaria efectiva.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Bajo el sistema de reserva fraccionaria, ¿qué hace un banco con la mayor parte del depósito de un cliente?",
          options: [
            { id: "a", text: "Guarda el 100% en una bóveda" },
            { id: "b", text: "Presta la mayor parte para ganar interés, guardando solo una fracción como reservas" },
            { id: "c", text: "Lo convierte íntegramente en oro" },
            { id: "d", text: "Lo envía directamente al banco central de forma permanente" },
          ],
          explanation: "La reserva fraccionaria significa que solo una fracción de los depósitos se mantiene como reservas; el resto se presta, que es como los bancos ganan ingresos por intereses.",
        },
        {
          id: "q2",
          prompt: "Con un coeficiente de reserva del 10%, ¿aproximadamente cuánto dinero total en todo el sistema podría sostener teóricamente un único depósito de $1,000, antes de considerar fugas del mundo real?",
          options: [
            { id: "a", text: "$1,000" },
            { id: "b", text: "$1,100" },
            { id: "c", text: "$10,000" },
            { id: "d", text: "$100,000" },
          ],
          explanation: "Multiplicador Monetario Simple ≈ Depósito Inicial ÷ Coeficiente de Reserva = $1,000 ÷ 0.10 = $10,000 como techo teórico.",
        },
        {
          id: "q3",
          prompt: "¿Por qué puede ser peligrosa una \"corrida bancaria\" repentina para un banco que opera bajo reserva fraccionaria?",
          options: [
            { id: "a", text: "Los bancos están legalmente obligados a rechazar todos los retiros durante una corrida" },
            { id: "b", text: "El banco no tiene el depósito completo de todos en efectivo a la vez — gran parte está prestada" },
            { id: "c", text: "Las corridas bancarias siempre causan hiperinflación en horas" },
            { id: "d", text: "No tiene efecto real; las reservas siempre cubren el 100% de los depósitos" },
          ],
          explanation: "Como la mayor parte del dinero depositado ha sido prestado, un banco genuinamente no puede devolver al instante el 100% de todos los depósitos en efectivo si todos lo exigen simultáneamente.",
        },
        {
          id: "q4",
          prompt: "En el ciclo de expansión de depósitos, ¿qué suele pasar justo después de que un prestatario gasta un préstamo?",
          options: [
            { id: "a", text: "El dinero sale permanentemente del sistema bancario" },
            { id: "b", text: "Suele volver a depositarse en algún lugar del sistema bancario, habilitando una nueva ronda de préstamos" },
            { id: "c", text: "Lo destruye el banco central" },
            { id: "d", text: "Debe convertirse a una moneda extranjera" },
          ],
          explanation: "Los ingresos de préstamos gastados suelen volver a depositarse (por quien los recibió), permitiendo que ese banco receptor repita el proceso de prestar la mayor parte.",
        },
        {
          id: "q5",
          prompt: "¿Cuál ha sido el cambio general en cómo muchos marcos regulatorios bancarios modernos abordan la seguridad bancaria, más allá de un único coeficiente de reserva fijo?",
          options: [
            { id: "a", text: "Una dependencia creciente de requisitos de capital y liquidez junto a/en lugar de un único coeficiente fijo" },
            { id: "b", text: "Eliminación completa de cualquier requisito de reserva o capital" },
            { id: "c", text: "Un retorno a un requisito de reserva 100% respaldado en oro en todas partes" },
            { id: "d", text: "Exigir a los bancos mantener reservas solo en criptomonedas" },
          ],
          explanation: "Muchos marcos modernos (como el enfoque de EE.UU. tras 2020) se apoyan más en requisitos de adecuación de capital y cobertura de liquidez que en un único coeficiente de reserva histórico, aunque el mecanismo central de préstamo fraccionario permanece.",
        },
      ],
    },
  },

  "gold-vs-paper-money": {
    sections: [
      {
        heading: "Por qué el oro ha mantenido su valor durante milenios",
        body: "El oro se ha usado como dinero o depósito de valor en casi toda gran civilización durante miles de años. Es escaso, casi indestructible, divisible y costoso de producir más — propiedades que lo convirtieron en un \"dinero duro\" natural mucho antes de que existiera la moneda de papel. A diferencia de un billete fiduciario, el valor del oro no depende de la promesa de un solo gobierno.",
      },
      {
        heading: "Por qué el papel moneda ganó de todos modos",
        body: "A pesar de la durabilidad del oro como depósito de valor, llevar y verificar oro físico para transacciones diarias es poco práctico. La moneda de papel (y luego los saldos digitales) resolvió el problema de conveniencia: es ligera, fácil de dividir en cantidades exactas y fácil de mover electrónicamente por todo el planeta en segundos — compensaciones que el oro inherentemente no puede igualar.",
        list: [
          "Oro: escaso, duradero, históricamente confiable — pero pesado, difícil de dividir con precisión, lento para transaccionar físicamente.",
          "Papel/fiduciario: conveniente, transferible al instante, programable — pero su oferta puede expandirse, exponiéndolo al riesgo de inflación.",
          "Muchos inversionistas hoy tienen algo de oro específicamente como cobertura contra inflación/devaluación de moneda, no como dinero para gastar a diario.",
        ],
      },
      {
        body: "Por esto exactamente existe la Calculadora de Metales y Materias Primas en esta plataforma — el precio del oro/plata se cotiza por onza troy y se convierte a tu moneda local y unidad de peso, que es el punto de partida real para pensar en el oro como depósito de valor.",
      },
      {
        caption: "Pruébalo: mira el precio en vivo del oro, plata, platino, paladio o cobre en tu unidad de peso y moneda preferidas.",
      },
      {
        caption: "Ninguno es estrictamente \"mejor\" — resuelven problemas distintos. Muchas carteras usan ambos.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "¿Qué propiedad ha hecho útil al oro como dinero o depósito de valor a lo largo de la historia?",
          options: [
            { id: "a", text: "Es fácil de producir en masa a demanda" },
            { id: "b", text: "Es escaso, duradero y divisible" },
            { id: "c", text: "Su valor lo fija un solo gobierno" },
            { id: "d", text: "Se degrada rápido, fomentando el gasto" },
          ],
          explanation: "La escasez, durabilidad y divisibilidad del oro (además de ser costoso producir más) son exactamente por qué se convirtió en un depósito de valor confiable mucho antes de que existiera la moneda fiduciaria.",
        },
        {
          id: "q2",
          prompt: "¿Cuál es la principal desventaja práctica del oro frente al dinero en papel/digital para transacciones diarias?",
          options: [
            { id: "a", text: "No tiene ningún valor" },
            { id: "b", text: "Es pesado, más difícil de dividir con precisión y lento para transaccionar físicamente" },
            { id: "c", text: "Solo puede usarse en un país" },
            { id: "d", text: "Es ilegal poseerlo en la mayoría de los países" },
          ],
          explanation: "Las propiedades físicas del oro lo hacen poco práctico para gastar rápido a diario — exactamente el vacío que llenó la moneda de papel y digital.",
        },
        {
          id: "q3",
          prompt: "¿Por qué muchos inversionistas tienen oro específicamente como cobertura, incluso en un mundo de moneda fiduciaria?",
          options: [
            { id: "a", text: "El oro garantiza un rendimiento anual fijo" },
            { id: "b", text: "Su oferta no puede expandirse como la oferta de moneda fiduciaria, lo que históricamente ayuda a preservar el poder de compra" },
            { id: "c", text: "El oro es más fácil de gastar que el efectivo" },
            { id: "d", text: "Elimina todo riesgo de inversión" },
          ],
          explanation: "La oferta fija y difícil de expandir del oro es la razón central por la que se usa como cobertura contra la devaluación de la moneda y la inflación, no porque ofrezca algún rendimiento garantizado.",
        },
        {
          id: "q4",
          prompt: "En la Calculadora de Metales y Materias Primas de esta plataforma, los precios de oro y plata se cotizan por:",
          options: [
            { id: "a", text: "Onza troy" },
            { id: "b", text: "Barril" },
            { id: "c", text: "Solo tonelada métrica" },
            { id: "d", text: "Solo quilate" },
          ],
          explanation: "Los metales preciosos en esta plataforma (oro, plata, platino, paladio, cobre) se cotizan por onza troy, y luego se convierten a la unidad de peso y moneda que elijas.",
        },
        {
          id: "q5",
          prompt: "¿Qué afirmación resume mejor la relación entre oro y papel moneda?",
          options: [
            { id: "a", text: "El oro siempre es estrictamente superior a la moneda fiduciaria en toda situación" },
            { id: "b", text: "La moneda fiduciaria siempre es estrictamente superior al oro en toda situación" },
            { id: "c", text: "Resuelven problemas distintos — el oro como depósito de valor a largo plazo, lo fiduciario para conveniencia y liquidez diarias" },
            { id: "d", text: "No hay diferencia significativa entre ambos" },
          ],
          explanation: "Ninguno gana rotundamente — la fortaleza del oro es preservar valor a largo plazo sin riesgo de contraparte, mientras que la fortaleza de lo fiduciario es la conveniencia y liquidez para transacciones diarias.",
        },
      ],
    },
  },

  "candlestick-anatomy": {
    sections: [
      {
        heading: "Una vela, cuatro precios",
        body: "Una vela resume la acción del precio durante un período elegido (un minuto, una hora, un día — lo que sea que marque el \"marco temporal\" del gráfico) usando cuatro números: Apertura, Máximo, Mínimo y Cierre (a menudo abreviados OHLC). La parte gruesa es el \"cuerpo\" (el rango entre apertura y cierre); las líneas finas arriba y abajo son \"mechas\" o \"sombras\" (el rango completo de máximo/mínimo alcanzado durante ese período).",
      },
      {
        heading: "Alcista vs. bajista",
        body: "Si el cierre es más alto que la apertura, la vela es alcista (el precio subió durante ese período) — típicamente mostrada en verde o blanco, hueca/sin rellenar. Si el cierre es más bajo que la apertura, es bajista (el precio bajó) — típicamente mostrada en rojo o negro, rellena. La convención de colores se puede personalizar en la mayoría de plataformas, pero verde=sube / rojo=baja es la predeterminada más común.",
        list: [
          "Apertura: el primer precio operado del período",
          "Máximo: el precio más alto operado del período",
          "Mínimo: el precio más bajo operado del período",
          "Cierre: el último precio operado del período",
          "Cuerpo: la caja entre Apertura y Cierre",
          "Mecha/Sombra: la(s) línea(s) finas que muestran el Máximo y Mínimo más allá del cuerpo",
        ],
      },
      {
        body: "Una mecha larga de un lado de una vela cuenta una historia: el precio empujó fuerte en esa dirección, luego fue rechazado y retrocedió al cierre del período — a menudo señal de lucha entre compradores/vendedores en ese nivel.",
      },
      {
        caption: "Una vela alcista: el cierre está por encima de la apertura, así que el cuerpo está sin rellenar/verde, con mechas mostrando el rango completo de máximo/mínimo.",
      },
      {
        caption: "Una vela bajista: el cierre está por debajo de la apertura, así que el cuerpo está relleno/rojo.",
      },
      {
        label: "Lee gráficos de velas en vivo en Análisis de Mercado",
        note: "Abre un gráfico interactivo completo de TradingView para cualquier símbolo y detecta estos patrones de velas en un gráfico real y en vivo.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "¿Qué cuatro precios representa una sola vela?",
          options: [
            { id: "a", text: "Apertura, Máximo, Mínimo, Cierre" },
            { id: "b", text: "Compra, Venta, Spread, Volumen" },
            { id: "c", text: "Soporte, Resistencia, Pivote, Tendencia" },
            { id: "d", text: "Apertura, Cierre, Volumen, Spread" },
          ],
          explanation: "Una vela se construye a partir de los precios de Apertura, Máximo, Mínimo y Cierre (OHLC) de su período.",
        },
        {
          id: "q2",
          prompt: "Una vela cierra POR ENCIMA de donde abrió. ¿Qué tipo de vela es esta?",
          options: [
            { id: "a", text: "Bajista" },
            { id: "b", text: "Alcista" },
            { id: "c", text: "Solo Doji neutral" },
            { id: "d", text: "No se puede determinar solo con esto" },
          ],
          explanation: "Cierre por encima de Apertura significa que el precio subió en ese período — eso es la definición de una vela alcista, convencionalmente mostrada verde/sin relleno.",
        },
        {
          id: "q3",
          prompt: "¿Qué representa el \"cuerpo\" de una vela?",
          options: [
            { id: "a", text: "El rango completo entre el Máximo y el Mínimo" },
            { id: "b", text: "El rango entre la Apertura y el Cierre" },
            { id: "c", text: "El precio promedio durante el período" },
            { id: "d", text: "El volumen operado durante ese período" },
          ],
          explanation: "El cuerpo es específicamente el rango de Apertura a Cierre; el rango de Máximo/Mínimo más allá del cuerpo se muestra con las mechas/sombras.",
        },
        {
          id: "q4",
          prompt: "¿Qué sugiere típicamente una mecha superior larga con un cuerpo pequeño sobre lo que ocurrió durante ese período?",
          options: [
            { id: "a", text: "El precio empujó fuerte hacia arriba y luego fue rechazado y retrocedió al cierre" },
            { id: "b", text: "No hubo actividad de negociación" },
            { id: "c", text: "El cierre fue el precio más alto del período" },
            { id: "d", text: "Garantiza que la siguiente vela será alcista" },
          ],
          explanation: "Una mecha superior larga significa que el precio llegó bien por encima de la parte superior del cuerpo antes de ser empujado hacia abajo al cierre — señal de rechazo/presión vendedora en ese nivel más alto.",
        },
        {
          id: "q5",
          prompt: "En la mayoría de plataformas de gráficos, ¿cuál es la convención de color predeterminada para una vela bajista (a la baja)?",
          options: [
            { id: "a", text: "Verde o blanco, sin relleno" },
            { id: "b", text: "Rojo o negro, relleno" },
            { id: "c", text: "Azul, a rayas" },
            { id: "d", text: "No hay ninguna convención común" },
          ],
          explanation: "Rojo/negro relleno es la convención predeterminada más común para una vela bajista (cierre por debajo de la apertura), aunque es personalizable en la mayoría de plataformas.",
        },
      ],
    },
  },

  "bid-ask-spread": {
    sections: [
      {
        heading: "Dos precios, siempre",
        body: "Todo instrumento negociable en realidad tiene dos precios en vivo al mismo tiempo: el Bid (el precio más alto que un comprador está dispuesto a pagar ahora — lo que recibirías si vendieras ahora mismo) y el Ask/Oferta (el precio más bajo que un vendedor está dispuesto a aceptar ahora — lo que pagarías si compraras ahora mismo). El Ask siempre es igual o mayor que el Bid.",
      },
      {
        heading: "El spread es un costo integrado",
        body: "La diferencia entre Ask y Bid es el spread — efectivamente un costo de transacción pagado a quien provee esa liquidez (un bróker o creador de mercado), separado de cualquier comisión. En el momento en que abres una posición, ya estás ligeramente \"bajo el agua\" por el tamaño del spread, porque compras al Ask (más alto) y tendrías que vender al Bid (más bajo) para cerrar de inmediato.",
        list: [
          "Bid: precio al que VENDES",
          "Ask (Oferta): precio al que COMPRAS",
          "Spread = Ask − Bid",
          "Spreads más estrechos = generalmente mercados más líquidos (ej. EUR/USD); spreads más amplios = típicamente instrumentos menos líquidos o más volátiles",
        ],
      },
      {
        label: "Costo del Spread",
        note: "Una cotización de EUR/USD de 1.0850 / 1.0852 tiene un spread de 2 pips — lo que significa que el par necesitaría moverse 2 pips a tu favor solo para llegar al punto de equilibrio en la entrada.",
      },
      {
        body: "Los spreads se amplían durante períodos de baja liquidez — publicaciones de noticias importantes, aperturas/cierres de mercado y festivos. Una estrategia que funciona bien con un spread normal de 1 pip puede perder silenciosamente su ventaja si los spreads se disparan a 5-10 pips durante un pico de noticias.",
      },
      {
        caption: "La brecha entre lo que puedes vender (Bid) y comprar (Ask) es el spread.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "¿Qué es el precio \"Bid\"?",
          options: [
            { id: "a", text: "El precio que pagarías para comprar ahora mismo" },
            { id: "b", text: "El precio más alto que un comprador está dispuesto a pagar actualmente (lo que recibirías vendiendo ahora)" },
            { id: "c", text: "El promedio de las últimas 10 operaciones" },
            { id: "d", text: "Un tipo de cambio fijo establecido por el gobierno" },
          ],
          explanation: "El Bid es el precio al que puedes vender de inmediato — el más alto que un comprador está ofreciendo actualmente.",
        },
        {
          id: "q2",
          prompt: "EUR/USD se cotiza a 1.0850 / 1.0853. ¿Cuál es el spread, en pips?",
          options: [
            { id: "a", text: "0 pips" },
            { id: "b", text: "3 pips" },
            { id: "c", text: "30 pips" },
            { id: "d", text: "0.3 pips" },
          ],
          explanation: "Spread = Ask − Bid = 1.0853 − 1.0850 = 0.0003, que son 3 pips en un par cotizado a 4 decimales.",
        },
        {
          id: "q3",
          prompt: "¿Por qué abrir una nueva operación te pone de inmediato en una pequeña pérdida nominal?",
          options: [
            { id: "a", text: "Compras al Ask (más alto), pero tendrías que vender al Bid (más bajo) para cerrar de inmediato — esa brecha es el spread" },
            { id: "b", text: "Todos los brókers cobran una comisión de pérdida obligatoria" },
            { id: "c", text: "No es así — las operaciones siempre abren en equilibrio" },
            { id: "d", text: "Solo es cierto para operaciones de acciones, nunca para forex" },
          ],
          explanation: "Como compras al Ask y vendes al Bid, el spread se paga efectivamente por adelantado — el precio necesita moverse a tu favor al menos el tamaño del spread antes de llegar al punto de equilibrio.",
        },
        {
          id: "q4",
          prompt: "¿Cuándo suelen ampliarse más los spreads?",
          options: [
            { id: "a", text: "Durante las horas de negociación más tranquilas y líquidas" },
            { id: "b", text: "Durante publicaciones de noticias importantes, aperturas/cierres de mercado y festivos — períodos de menor liquidez" },
            { id: "c", text: "Los spreads siempre son perfectamente fijos y nunca cambian" },
            { id: "d", text: "Solo los fines de semana cuando los mercados están cerrados" },
          ],
          explanation: "La menor liquidez alrededor de grandes eventos de noticias, aperturas/cierres de sesión y festivos es exactamente cuando los spreads tienden a ampliarse más.",
        },
        {
          id: "q5",
          prompt: "¿Qué par esperarías generalmente que tenga un spread típico más estrecho?",
          options: [
            { id: "a", text: "Un par mayor muy líquido como EUR/USD" },
            { id: "b", text: "Un par de moneda exótico poco negociado" },
            { id: "c", text: "Los spreads no están relacionados con la liquidez" },
            { id: "d", text: "Siempre son idénticos en todos los pares" },
          ],
          explanation: "Los instrumentos más líquidos (como EUR/USD, el par más operado del mundo) generalmente tienen spreads más estrechos que los exóticos poco negociados.",
        },
      ],
    },
  },

  "pips-and-lot-sizes": {
    sections: [
      {
        heading: "¿Qué es un pip?",
        body: "Un \"pip\" (Percentage In Point) es el incremento de precio significativo más pequeño estándar para la mayoría de los pares de forex — típicamente el 4to decimal (ej., EUR/USD moviéndose de 1.0850 a 1.0851 es un movimiento de 1 pip). Los pares de yen son la principal excepción, ya que se cotizan a solo 2 decimales, haciendo que el 2do decimal sea el pip (ej., USD/JPY 150.25 a 150.26).",
      },
      {
        heading: "Tamaños de lote: cuánto estás realmente operando",
        body: "Un \"lote\" es un tamaño de operación estandarizado. Un Lote Estándar son 100,000 unidades de la moneda base; un Mini Lote son 10,000 unidades (1/10); un Micro Lote son 1,000 unidades (1/100). El tamaño de lote que operas determina directamente cuánto dinero vale cada movimiento de pip para ti.",
        list: [
          "Lote Estándar = 100,000 unidades → aproximadamente $10/pip en la mayoría de pares cotizados en USD",
          "Mini Lote = 10,000 unidades → aproximadamente $1/pip",
          "Micro Lote = 1,000 unidades → aproximadamente $0.10/pip",
          "El valor exacto del pip varía ligeramente según el par y la moneda de cotización de tu cuenta.",
        ],
      },
      {
        label: "Valor Aproximado del Pip (pares cotizados en USD)",
        note: "Para un lote estándar (100,000 unidades) en un par cotizado a 4 decimales, 1 pip (0.0001) × 100,000 = $10 por pip. Micro lote (1,000 unidades) → $0.10 por pip.",
      },
      {
        body: "Los principiantes destruyen cuentas mucho más por lotes sobredimensionados que por estar \"equivocados\" sobre la dirección. Una operación correcta con un tamaño de lote demasiado grande para tu cuenta todavía puede liquidarte en un retroceso normal.",
      },
      {
        caption: "El mismo movimiento de precio de 1 pip vale cantidades muy distintas según tu tamaño de lote.",
      },
      {
        caption: "Pruébalo: ingresa tu saldo de cuenta, % de riesgo y distancia de stop-loss para obtener un tamaño de lote sugerido.",
      },
      {
        caption: "Pruébalo: mira cuánto vale realmente un pip en USD y PKR para una moneda de cotización y tamaño de lote dados.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "En una cotización estándar de EUR/USD (4 decimales), moverse de 1.0850 a 1.0851 es:",
          options: [
            { id: "a", text: "1 pip" },
            { id: "b", text: "10 pips" },
            { id: "c", text: "0.1 pip" },
            { id: "d", text: "Solo 1 punto, no un pip" },
          ],
          explanation: "Un cambio en el 4to decimal en un par estándar es exactamente 1 pip.",
        },
        {
          id: "q2",
          prompt: "¿Qué es especial sobre la medición de pips en pares de Yen japonés como USD/JPY?",
          options: [
            { id: "a", text: "Los pares de Yen no tienen pips en absoluto" },
            { id: "b", text: "Los pares de Yen se cotizan a 2 decimales, así que el pip es el 2do decimal, no el 4to" },
            { id: "c", text: "Los pares de Yen usan una unidad monetaria completamente distinta" },
            { id: "d", text: "El valor del pip siempre es $100 en pares de Yen" },
          ],
          explanation: "Como los pares de Yen se cotizan con solo 2 decimales, 1 pip ahí es un movimiento en el 2do decimal (ej. 150.25 → 150.26), no el 4to.",
        },
        {
          id: "q3",
          prompt: "¿Cuántas unidades es un Lote Estándar en forex?",
          options: [
            { id: "a", text: "1,000 unidades" },
            { id: "b", text: "10,000 unidades" },
            { id: "c", text: "100,000 unidades" },
            { id: "d", text: "1,000,000 unidades" },
          ],
          explanation: "Un Lote Estándar son 100,000 unidades de la moneda base — 10x un Mini Lote, 100x un Micro Lote.",
        },
        {
          id: "q4",
          prompt: "Operando 1 Micro Lote (1,000 unidades) en un par cotizado en USD, ¿aproximadamente cuánto vale cada pip?",
          options: [
            { id: "a", text: "≈ $10" },
            { id: "b", text: "≈ $1" },
            { id: "c", text: "≈ $0.10" },
            { id: "d", text: "≈ $100" },
          ],
          explanation: "Valor del Pip ≈ Tamaño de Lote × Tamaño del Pip = 1,000 × 0.0001 = $0.10 por pip para un Micro Lote.",
        },
        {
          id: "q5",
          prompt: "¿Cuál es la razón más común por la que los traders principiantes liquidan sus cuentas, según esta lección?",
          options: [
            { id: "a", text: "Estar siempre equivocados sobre la dirección del mercado" },
            { id: "b", text: "Operar un tamaño de lote demasiado grande para su cuenta, así que incluso un retroceso normal causa pérdidas desproporcionadas" },
            { id: "c", text: "Operar solo durante eventos de noticias" },
            { id: "d", text: "Usar demasiados indicadores" },
          ],
          explanation: "Los tamaños de lote sobredimensionados en relación al tamaño de la cuenta son el clásico destructor de cuentas — incluso operaciones direccionalmente correctas pueden liquidar una cuenta si el tamaño de posición es demasiado grande.",
        },
      ],
    },
  },

  "order-types": {
    sections: [
      {
        heading: "Órdenes de mercado: velocidad sobre precio",
        body: "Una Orden de Mercado se ejecuta inmediatamente al mejor precio disponible actualmente. Tienes garantizada una ejecución instantánea, pero no un precio exacto garantizado — en condiciones de movimiento rápido o poca liquidez, podrías sufrir \"slippage\" hacia un precio ligeramente peor que el que viste al hacer clic.",
      },
      {
        heading: "Órdenes límite: precio sobre velocidad",
        body: "Una Orden Límite solo se ejecuta a tu precio especificado o mejor — no se ejecutará a un precio peor, pero podría no ejecutarse nunca si el mercado nunca alcanza tu nivel. Una Compra Límite se ubica por debajo del precio actual (comprar más barato); una Venta Límite se ubica por encima del precio actual (vender más caro).",
        list: [
          "Orden de Mercado: se ejecuta AHORA, al precio actual que sea — velocidad garantizada, precio no garantizado.",
          "Orden Límite: se ejecuta solo a TU precio o mejor — precio garantizado, ejecución no garantizada.",
          "Orden Stop: se convierte en orden de mercado una vez que el precio alcanza un nivel de activación — usada a menudo para entradas de ruptura o stop-losses.",
          "Orden Stop-Límite: se convierte en orden límite (no de mercado) una vez que se alcanza el nivel de activación — combina ambos comportamientos.",
        ],
      },
      {
        body: "Usa una Orden de Mercado cuando necesites entrar/salir AHORA (como cerrar rápido una operación perdedora). Usa una Orden Límite cuando tengas un precio objetivo específico y prefieras perder la operación a pagar un peor precio por ella.",
      },
      {
        caption: "Las órdenes límite se colocan lejos del precio actual, esperando que el mercado llegue a ellas.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "¿Qué garantiza una Orden de Mercado?",
          options: [
            { id: "a", text: "Un precio exacto, pero no una ejecución rápida" },
            { id: "b", text: "Una ejecución inmediata, pero no un precio exacto" },
            { id: "c", text: "Tanto un precio exacto COMO una ejecución inmediata, siempre" },
            { id: "d", text: "Ninguna de las dos — es puramente teórico" },
          ],
          explanation: "Las órdenes de mercado priorizan la velocidad: se ejecutan de inmediato al mejor precio disponible actualmente, que puede diferir ligeramente del precio que viste un momento antes (slippage).",
        },
        {
          id: "q2",
          prompt: "Colocas una orden de Compra Límite por debajo del precio de mercado actual. ¿Qué pasa si el precio nunca baja a ese nivel?",
          options: [
            { id: "a", text: "Se ejecuta automáticamente al precio de mercado actual de todos modos" },
            { id: "b", text: "La orden simplemente nunca se ejecuta" },
            { id: "c", text: "Se ejecuta al doble del precio solicitado" },
            { id: "d", text: "Esta situación es imposible por definición" },
          ],
          explanation: "Una orden Límite solo se ejecuta a tu precio especificado o mejor — si el mercado nunca lo alcanza, la orden simplemente queda sin ejecutar (hasta que se cancele o expire).",
        },
        {
          id: "q3",
          prompt: "¿Cuál es la compensación clave entre las Órdenes de Mercado y Límite?",
          options: [
            { id: "a", text: "Las órdenes de mercado garantizan el precio pero arriesgan no ejecutarse; las órdenes límite garantizan la ejecución pero arriesgan un peor precio" },
            { id: "b", text: "Las órdenes de mercado garantizan una ejecución rápida pero no un precio exacto; las órdenes límite garantizan el precio pero no que se ejecute" },
            { id: "c", text: "No hay compensación; se comportan de forma idéntica" },
            { id: "d", text: "Las órdenes límite siempre son mejores en toda situación" },
          ],
          explanation: "Esta es la compensación central: Mercado = velocidad garantizada, precio no garantizado. Límite = precio garantizado (o mejor), ejecución no garantizada.",
        },
        {
          id: "q4",
          prompt: "¿En qué se convierte una Orden Stop, una vez que se alcanza su precio de activación?",
          options: [
            { id: "a", text: "Una orden de mercado" },
            { id: "b", text: "Una orden cancelada" },
            { id: "c", text: "Una orden límite de ejecución garantizada" },
            { id: "d", text: "No tiene ningún efecto en absoluto" },
          ],
          explanation: "Una Orden Stop permanece inactiva hasta que el precio alcanza el nivel de activación, momento en el cual se convierte en orden de mercado y se ejecuta al siguiente precio disponible.",
        },
        {
          id: "q5",
          prompt: "¿Cuándo preferiría típicamente un trader una Orden de Mercado sobre una Orden Límite?",
          options: [
            { id: "a", text: "Cuando tiene un objetivo de precio muy específico y no le importa perder la operación por completo" },
            { id: "b", text: "Cuando necesita entrar o salir de una posición ahora mismo y la velocidad importa más que el precio exacto" },
            { id: "c", text: "Las órdenes de mercado nunca pueden usarse para cerrar una posición" },
            { id: "d", text: "Solo al operar los fines de semana" },
          ],
          explanation: "Las órdenes de mercado son la herramienta correcta específicamente cuando la inmediatez importa más que conseguir un precio exacto — ej. cerrar urgentemente una posición perdedora.",
        },
      ],
    },
  },

  "support-resistance": {
    sections: [
      {
        heading: "Los pisos y techos invisibles del mercado",
        body: "El soporte es un nivel de precio (o zona) donde la presión de compra ha sido históricamente lo suficientemente fuerte para detener una caída y empujar el precio hacia arriba de nuevo. La resistencia es la imagen especular — un nivel donde la presión de venta ha detenido históricamente un avance y empujado el precio hacia abajo de nuevo. Estos niveles se forman porque los traders recuerdan que el precio reaccionó ahí antes, y colocan órdenes en consecuencia.",
      },
      {
        heading: "Zonas, no líneas exactas — y los roles pueden invertirse",
        body: "En la práctica, el soporte/resistencia rara vez son un precio exacto único; es mejor pensarlos como zonas, ya que el precio a menudo reacciona un poco por encima o por debajo del nivel \"de manual\". De forma crucial, una vez que la resistencia se rompe decisivamente, a menudo se convierte en nuevo soporte (y viceversa para el soporte roto convirtiéndose en nueva resistencia) — esto se llama una inversión de rol.",
        list: [
          "Cuantas más veces se haya probado y sostenido un nivel, más significativo lo consideran generalmente los traders.",
          "Una \"ruptura\" es el precio cerrando decisivamente a través de un nivel de soporte/resistencia, a menudo con mayor volumen.",
          "Una \"falsa ruptura\" (o \"fakeout\") es cuando el precio rompe brevemente un nivel y luego revierte rápidamente — una trampa común.",
        ],
      },
      {
        body: "No operes el toque exacto de un nivel — espera confirmación (un cierre de vela más allá de él, o un reintento que se sostenga) en lugar de adivinar la primera vez que el precio se acerca.",
      },
      {
        caption: "El precio respeta la resistencia dos veces, luego rompe por encima de ella — esa antigua resistencia a menudo se convierte en nuevo soporte en un reintento.",
      },
      {
        label: "Ver Soporte y Resistencia calculados en vivo",
        note: "El reporte de Análisis Técnico de Análisis de Mercado calcula niveles reales de Soporte y Resistencia a partir del precio en vivo actual.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "¿Qué es el \"soporte\" en análisis técnico?",
          options: [
            { id: "a", text: "Un nivel donde la presión de venta ha detenido históricamente un avance de precio" },
            { id: "b", text: "Un nivel donde la presión de compra ha detenido históricamente una caída de precio" },
            { id: "c", text: "El precio promedio del último año" },
            { id: "d", text: "Un piso de precio establecido por el gobierno" },
          ],
          explanation: "El soporte es donde los compradores han intervenido históricamente con suficiente fuerza para detener una caída y empujar el precio hacia arriba de nuevo.",
        },
        {
          id: "q2",
          prompt: "¿Qué suele pasar con un nivel de resistencia una vez que se rompe decisivamente?",
          options: [
            { id: "a", text: "Desaparece del gráfico por completo" },
            { id: "b", text: "A menudo se convierte en nuevo soporte en un reintento (inversión de rol)" },
            { id: "c", text: "Se vuelve imposible que el precio regrese alguna vez" },
            { id: "d", text: "Nada — los niveles rotos no tienen relevancia adicional" },
          ],
          explanation: "Una inversión de rol clásica: una vez rota la resistencia, ese mismo nivel frecuentemente actúa como nuevo soporte si el precio vuelve a bajar a probarlo.",
        },
        {
          id: "q3",
          prompt: "¿Qué es una \"falsa ruptura\" (fakeout)?",
          options: [
            { id: "a", text: "Una ruptura que luego se confirma con una tendencia fuerte" },
            { id: "b", text: "El precio rompiendo brevemente un nivel, luego revirtiendo rápidamente en la otra dirección" },
            { id: "c", text: "Una ruptura que solo ocurre los fines de semana" },
            { id: "d", text: "Un nivel que nunca ha sido probado" },
          ],
          explanation: "Una falsa ruptura atrapa a los traders que entraron en la ruptura inicial, cuando el precio regresa rápidamente dentro del rango anterior.",
        },
        {
          id: "q4",
          prompt: "¿Por qué es mejor pensar el soporte/resistencia como \"zonas\" en lugar de precios exactos únicos?",
          options: [
            { id: "a", text: "Porque el precio típicamente reacciona un poco por encima o por debajo del nivel de manual, no en un tick exacto" },
            { id: "b", text: "Porque el soporte y la resistencia realmente no existen" },
            { id: "c", text: "Porque solo aplican a gráficos diarios" },
            { id: "d", text: "Porque los brókers fijan manualmente estos niveles" },
          ],
          explanation: "Las reacciones reales del mercado se agrupan alrededor de un nivel en lugar de tocar exactamente el mismo precio cada vez, por eso los traders los tratan como zonas.",
        },
        {
          id: "q5",
          prompt: "¿Cuál es un enfoque más seguro que operar el primer toque de un nivel de soporte/resistencia?",
          options: [
            { id: "a", text: "Entrar siempre de inmediato al primer toque, sin excepciones" },
            { id: "b", text: "Esperar confirmación — como un cierre de vela más allá del nivel, o un reintento que se sostenga" },
            { id: "c", text: "Ignorar el soporte/resistencia por completo" },
            { id: "d", text: "Solo operar niveles que nunca han sido tocados antes" },
          ],
          explanation: "Esperar confirmación (un cierre decisivo a través del nivel, o un reintento que se sostenga) reduce el riesgo de quedar atrapado en una falsa ruptura o un nivel que simplemente se sostiene de nuevo.",
        },
      ],
    },
  },

  "rsi-indicator": {
    sections: [
      {
        heading: "Un medidor de impulso de 0 a 100",
        body: "El Índice de Fuerza Relativa (RSI), desarrollado por J. Welles Wilder, es un oscilador de impulso que mide la velocidad y magnitud de los cambios recientes de precio en una escala de 0 a 100. Típicamente se calcula sobre un período retrospectivo de 14, comparando el tamaño promedio de las ganancias recientes con el tamaño promedio de las pérdidas recientes.",
      },
      {
        heading: "Sobrecompra, sobreventa y divergencia",
        body: "La interpretación clásica del RSI usa 70 y 30 como umbrales: una lectura por encima de 70 sugiere que el instrumento podría estar \"sobrecomprado\" (potencialmente debido a un retroceso), y por debajo de 30 sugiere \"sobreventa\" (potencialmente debido a un rebote). La divergencia del RSI — donde el precio hace un nuevo máximo/mínimo pero el RSI no lo confirma — a menudo se vigila como una advertencia temprana de impulso debilitándose.",
        list: [
          "RSI > 70: a menudo leído como sobrecompra",
          "RSI < 30: a menudo leído como sobreventa",
          "RSI alrededor de 50: a menudo leído como impulso neutral/balanceado",
          "En una tendencia fuerte, el RSI puede permanecer \"sobrecomprado\" o \"sobrevendido\" por mucho tiempo — NO es por sí solo una señal automática de reversión.",
        ],
      },
      {
        body: "El error más grande con el RSI: tratar \"sobrecompra\" como \"vender de inmediato\". En una tendencia alcista fuerte, el RSI puede mantenerse por encima de 70 durante un largo tramo mientras el precio sigue subiendo — sobrecompra significa estirado, no garantiza reversión.",
      },
      {
        caption: "El RSI empujando por encima de la línea de 70 — una lectura de impulso estirado, no una señal automática de venta por sí sola.",
      },
      {
        label: "Revisa el reporte de Análisis Técnico en vivo",
        note: "Aviso honesto: este proyecto solo tiene el precio en vivo actual, no un historial de precios, por lo que la sección de RSI del reporte está explícitamente marcada como no disponible en lugar de simular una lectura — mira por qué ahí.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "¿En qué rango oscila el indicador RSI?",
          options: [
            { id: "a", text: "-100 a +100" },
            { id: "b", text: "0 a 100" },
            { id: "c", text: "0 a 10" },
            { id: "d", text: "No tiene un rango fijo" },
          ],
          explanation: "El RSI es un oscilador acotado que siempre se lee entre 0 y 100.",
        },
        {
          id: "q2",
          prompt: "¿Qué sugiere clásicamente una lectura de RSI por encima de 70?",
          options: [
            { id: "a", text: "El instrumento podría estar \"sobrecomprado\" — potencialmente debido a un retroceso" },
            { id: "b", text: "El instrumento colapsará garantizadamente dentro de la hora" },
            { id: "c", text: "El instrumento tiene impulso cero" },
            { id: "d", text: "Una señal de compra sin necesidad de más análisis" },
          ],
          explanation: "Por encima de 70 es el umbral clásico de \"sobrecompra\" — una señal de que el impulso está estirado, no una garantía de reversión inminente.",
        },
        {
          id: "q3",
          prompt: "¿Qué es la divergencia del RSI?",
          options: [
            { id: "a", text: "Cuando el RSI y el precio se mueven en perfecta sincronía" },
            { id: "b", text: "Cuando el precio hace un nuevo máximo/mínimo pero el RSI falla en confirmarlo con su propio nuevo máximo/mínimo" },
            { id: "c", text: "Cuando el RSI supera 100" },
            { id: "d", text: "Un tipo de patrón de velas" },
          ],
          explanation: "La divergencia es específicamente una discrepancia entre la acción del precio y la lectura de impulso del RSI — a menudo vigilada como una pista temprana de que el impulso se está debilitando.",
        },
        {
          id: "q4",
          prompt: "¿Por qué se considera un error común tratar \"RSI por encima de 70 = vender ahora\"?",
          options: [
            { id: "a", text: "El RSI puede permanecer elevado durante mucho tiempo durante una tendencia fuerte sin que el precio revierta" },
            { id: "b", text: "El RSI por encima de 70 es en realidad una señal de compra, no de venta" },
            { id: "c", text: "El RSI no puede superar 70 en mercados reales" },
            { id: "d", text: "No existe tal cosa como una lectura de sobrecompra" },
          ],
          explanation: "En una tendencia alcista fuerte, el RSI puede permanecer sobrecomprado durante un período extendido mientras el precio sigue subiendo — es una señal de impulso estirado, no un disparador automático de reversión.",
        },
        {
          id: "q5",
          prompt: "El RSI típicamente se calcula comparando:",
          options: [
            { id: "a", text: "El precio actual con el precio de cierre del día anterior solamente" },
            { id: "b", text: "El tamaño promedio de las ganancias recientes con el tamaño promedio de las pérdidas recientes en un período retrospectivo (comúnmente 14)" },
            { id: "c", text: "El volumen de negociación con el interés abierto" },
            { id: "d", text: "El precio bid con el precio ask" },
          ],
          explanation: "El cálculo central del RSI compara las ganancias promedio recientes vs. las pérdidas promedio recientes en un período retrospectivo elegido (14 períodos es el predeterminado más común) para producir su lectura de 0 a 100.",
        },
      ],
    },
  },

  "moving-averages": {
    sections: [
      {
        heading: "Suavizando el ruido",
        body: "Una media móvil (MA) suaviza los datos de precio en bruto en una sola línea fluida al promediar el precio durante un número elegido de períodos recientes, actualizándose continuamente a medida que llegan nuevos datos. Esto hace que la dirección de la tendencia subyacente sea más fácil de ver a través del ruido diario de las velas individuales.",
      },
      {
        heading: "SMA vs. EMA, y cruces",
        body: "Una Media Móvil Simple (SMA) pondera igual cada período en su retrospectiva. Una Media Móvil Exponencial (EMA) pondera más fuertemente los períodos recientes, haciéndola reaccionar más rápido a la nueva acción del precio. Una señal común es un \"cruce\": cuando una MA más rápida (período más corto) cruza por encima de una MA más lenta (período más largo), se llama \"Cruce Dorado\" (alcista); cruzar por debajo es un \"Cruce de la Muerte\" (bajista).",
        list: [
          "SMA: igual peso a cada período en la retrospectiva — más suave, más lenta para reaccionar.",
          "EMA: más peso en períodos recientes — más rápida para reaccionar, pero puede dar más señales falsas en mercados agitados.",
          "Cruce Dorado: la MA más corta cruza por encima de la MA más larga — a menudo leído como alcista.",
          "Cruce de la Muerte: la MA más corta cruza por debajo de la MA más larga — a menudo leído como bajista.",
        ],
      },
      {
        body: "Las medias móviles son indicadores rezagados por naturaleza — se construyen a partir de precios pasados, así que los cruces confirman un cambio de tendencia después de que ya está en marcha, no antes. Funcionan mejor para confirmar tendencias, no para entradas precisas.",
      },
      {
        caption: "Un \"Cruce Dorado\": la media móvil de período más corto cruza por encima de la de período más largo.",
      },
      {
        label: "Revisa el reporte de Análisis Técnico en vivo",
        note: "Misma nota de honestidad que con el RSI — las medias móviles necesitan cierres históricos, así que esa sección está explícitamente marcada como no disponible ahí en lugar de inventada.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "¿Cuál es el propósito principal de una media móvil?",
          options: [
            { id: "a", text: "Suavizar los datos de precio en una sola línea, haciendo la tendencia subyacente más fácil de ver" },
            { id: "b", text: "Predecir precios futuros exactos con certeza" },
            { id: "c", text: "Medir el volumen de negociación" },
            { id: "d", text: "Calcular el spread bid/ask" },
          ],
          explanation: "Las medias móviles existen para suavizar el ruido de corto plazo, haciendo más fácil leer la dirección general de la tendencia.",
        },
        {
          id: "q2",
          prompt: "¿Cuál es la diferencia clave entre una SMA y una EMA?",
          options: [
            { id: "a", text: "La SMA pondera todos los períodos igual; la EMA pondera más fuertemente los períodos recientes y reacciona más rápido" },
            { id: "b", text: "La EMA ignora por completo los precios recientes" },
            { id: "c", text: "La SMA solo puede usarse en gráficos diarios" },
            { id: "d", text: "No hay una diferencia real" },
          ],
          explanation: "La ponderación extra de la EMA en datos recientes la hace más reactiva a la nueva acción del precio que la SMA, ponderada igualmente.",
        },
        {
          id: "q3",
          prompt: "Una media móvil de período más corto cruzando POR ENCIMA de una de período más largo se llama comúnmente:",
          options: [
            { id: "a", text: "Un Cruce de la Muerte" },
            { id: "b", text: "Un Cruce Dorado" },
            { id: "c", text: "Una extensión de Fibonacci" },
            { id: "d", text: "Una ruptura de pivote" },
          ],
          explanation: "Una MA más corta cruzando por encima de una MA más larga es la clásica señal alcista del \"Cruce Dorado\".",
        },
        {
          id: "q4",
          prompt: "¿Por qué se describe a las medias móviles como indicadores \"rezagados\"?",
          options: [
            { id: "a", text: "Se construyen a partir de datos de precio pasados, así que confirman cambios de tendencia después de que ya han comenzado" },
            { id: "b", text: "Predicen movimientos de precio antes de que ocurran" },
            { id: "c", text: "Se actualizan más rápido que el precio en tiempo real" },
            { id: "d", text: "Solo funcionan en gráficos semanales" },
          ],
          explanation: "Como una MA se calcula a partir de precios históricos, cualquier señal de cruce necesariamente aparece después de que el cambio subyacente en el comportamiento del precio ya ha comenzado.",
        },
        {
          id: "q5",
          prompt: "Una MA de período más corto cruzando POR DEBAJO de una MA de período más largo se llama comúnmente:",
          options: [
            { id: "a", text: "Un Cruce Dorado" },
            { id: "b", text: "Un Cruce de la Muerte" },
            { id: "c", text: "Una ruptura de soporte" },
            { id: "d", text: "Una divergencia de RSI" },
          ],
          explanation: "La contraparte bajista del Cruce Dorado — una MA más corta cruzando por debajo de una MA más larga — se llama Cruce de la Muerte.",
        },
      ],
    },
  },

  "fibonacci-retracements": {
    sections: [
      {
        heading: "Ratios tomados de una secuencia del siglo XIII",
        body: "Los niveles de retroceso de Fibonacci se derivan de ratios encontrados en la secuencia numérica de Fibonacci (0, 1, 1, 2, 3, 5, 8, 13, 21...), donde dividir ciertos números por otros en la secuencia produce ratios recurrentes como 0.618 y 0.382. Los traders aplican estos ratios a un movimiento de precio reciente (un máximo y mínimo claros) para marcar zonas potenciales de soporte/resistencia durante un retroceso.",
      },
      {
        heading: "Dibujándolo y los niveles clave",
        body: "Para dibujar un retroceso de Fibonacci, seleccionas un mínimo y máximo de swing significativos (o al revés para una tendencia bajista), y la herramienta marca automáticamente líneas horizontales en los niveles de ratio estándar entre ellos. Estos se vigilan como zonas donde una tendencia en retroceso podría pausar o revertir antes de potencialmente continuar en la dirección original.",
        list: [
          "23.6% — un nivel de retroceso superficial",
          "38.2% — un nivel de retroceso común en tendencias fuertes",
          "50.0% — técnicamente no es un ratio de Fibonacci, pero se incluye universalmente como punto medio psicológico",
          "61.8% — el nivel de \"ratio dorado\", a menudo vigilado como la zona de retroceso más profunda",
          "78.6% — un retroceso profundo, cercano a un recorrido completo del movimiento",
        ],
      },
      {
        body: "Los niveles de Fibonacci funcionan mejor cuando se alinean con otra forma de confirmación — como una zona de soporte/resistencia en número redondo o un punto de swing previo — en lugar de operarse de forma aislada.",
      },
      {
        caption: "Niveles estándar de retroceso de Fibonacci dibujados sobre un movimiento de precio de mínimo a máximo.",
      },
      {
        label: "Ver ratios de Fibonacci aplicados en vivo",
        note: "El reporte de Análisis Técnico aplica estos ratios exactos (23.6% / 38.2% / 50% / 61.8% / 78.6%) a una banda de precio ilustrativa en vivo y explícitamente etiquetada.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Los ratios de retroceso de Fibonacci se derivan de:",
          options: [
            { id: "a", text: "Un generador de números aleatorios" },
            { id: "b", text: "Ratios encontrados dentro de la secuencia numérica de Fibonacci" },
            { id: "c", text: "Decisiones de tasas de interés del gobierno" },
            { id: "d", text: "Solo datos de volumen de negociación" },
          ],
          explanation: "Los porcentajes de retroceso (23.6%, 38.2%, 61.8%, etc.) provienen directamente de ratios entre números de la secuencia de Fibonacci.",
        },
        {
          id: "q2",
          prompt: "¿Qué dos puntos necesitas seleccionar para dibujar un retroceso de Fibonacci?",
          options: [
            { id: "a", text: "Un máximo de swing y un mínimo de swing de un movimiento de precio significativo" },
            { id: "b", text: "El bid y ask actuales" },
            { id: "c", text: "La apertura de hoy y el cierre de ayer" },
            { id: "d", text: "Dos velas al azar" },
          ],
          explanation: "Un retroceso de Fibonacci se ancla a un mínimo y máximo de swing claros (o máximo a mínimo para una tendencia bajista), a partir de los cuales la herramienta traza los niveles de ratio.",
        },
        {
          id: "q3",
          prompt: "¿Cuál de estos niveles de Fibonacci comúnmente mostrados NO se deriva realmente de la secuencia de Fibonacci misma?",
          options: [
            { id: "a", text: "23.6%" },
            { id: "b", text: "38.2%" },
            { id: "c", text: "50.0%" },
            { id: "d", text: "61.8%" },
          ],
          explanation: "El 50% se incluye por convención como un punto medio psicológicamente significativo, pero no es en sí mismo un ratio derivado de Fibonacci como lo son 23.6/38.2/61.8/78.6%.",
        },
        {
          id: "q4",
          prompt: "¿Cuál es el nivel de retroceso de \"ratio dorado\", a menudo vigilado como una zona de retroceso más profunda?",
          options: [
            { id: "a", text: "23.6%" },
            { id: "b", text: "50.0%" },
            { id: "c", text: "61.8%" },
            { id: "d", text: "100%" },
          ],
          explanation: "El 61.8% se deriva del ratio dorado y es uno de los niveles de retroceso de Fibonacci más vigilados.",
        },
        {
          id: "q5",
          prompt: "¿Qué hace que un nivel de Fibonacci sea más confiable, según esta lección?",
          options: [
            { id: "a", text: "Usarlo completamente aislado de cualquier otro análisis" },
            { id: "b", text: "Cuando se alinea con otra forma de confirmación, como una zona de soporte/resistencia en número redondo" },
            { id: "c", text: "Solo usar el nivel 100%" },
            { id: "d", text: "Dibujarlo solo en un gráfico de 1 minuto" },
          ],
          explanation: "La confluencia — un nivel de Fibonacci coincidiendo con otra señal independiente como una zona de soporte/resistencia conocida — generalmente se considera más significativa que el nivel de Fibonacci solo.",
        },
      ],
    },
  },

  "gann-basics": {
    sections: [
      {
        heading: "La idea central de W.D. Gann: el tiempo importa tanto como el precio",
        body: "W.D. Gann fue un trader de principios del siglo XX cuyas técnicas se basan en la idea de que los mercados se mueven en relaciones geométricas basadas en el tiempo — no solo en el precio. Donde la mayoría de los indicadores solo analizan el precio, la teoría de Gann trata el paso del TIEMPO mismo como una variable clave que puede señalar potenciales puntos de giro, independientemente de cuánto se haya movido el precio.",
      },
      {
        heading: "Ángulos de Gann: la línea 1x1",
        body: "La herramienta de Gann más conocida es el ángulo de Gann (o \"abanico de Gann\") — líneas de tendencia diagonales dibujadas desde un pivote de precio significativo a pendientes geométricas fijas. La más famosa es el ángulo 1x1 (a veces llamado la \"línea de 45 grados\"), representando una tasa balanceada de una unidad de precio por una unidad de tiempo; ángulos más empinados o más suaves (2x1, 4x1, 1x2, 1x4, etc.) representan tasas de avance más rápidas o más lentas.",
        list: [
          "Ángulos de Gann: líneas diagonales a ratios fijos de precio/tiempo desde un punto de pivote, usadas como soporte/resistencia dinámico.",
          "Cuadrado de Nueve de Gann: una cuadrícula numérica en espiral usada para proyectar potenciales puntos de giro de precio/tiempo.",
          "Ciclos de tiempo: Gann puso gran énfasis en aniversarios de máximos/mínimos pasados y conteos de días específicos repitiéndose en el futuro.",
        ],
      },
      {
        body: "Los métodos de Gann son genuinamente complejos y muy debatidos — muchos traders encuentran valor real en la idea central (el tiempo importa, no solo el precio), sin adoptar literalmente el sistema histórico completo. Trata esta lección como una introducción conceptual, no un método de trading completo.",
      },
      {
        caption: "Una cuadrícula simplificada estilo Gann: ángulos diagonales se abren en abanico desde un pivote a ratios fijos de precio/tiempo.",
      },
      {
        label: "Revisa el reporte de Análisis Técnico en vivo",
        note: "La Teoría de Gann necesita puntos de swing históricos y ciclos de tiempo que este proyecto no almacena — el reporte explica exactamente por qué esa sección está marcada como no disponible en lugar de simularla.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "¿Cuál es la idea central que distingue a la teoría de Gann de la mayoría de las demás herramientas técnicas?",
          options: [
            { id: "a", text: "Solo mira el volumen de negociación" },
            { id: "b", text: "Trata el paso del TIEMPO como una variable clave, no solo el movimiento de precio" },
            { id: "c", text: "Ignora el precio por completo" },
            { id: "d", text: "Se basa puramente en eventos de noticias" },
          ],
          explanation: "La premisa central de Gann es que los ciclos y relaciones basados en el tiempo importan tanto como el movimiento de precio — un apartamiento del análisis puramente basado en precio.",
        },
        {
          id: "q2",
          prompt: "¿Qué representa el ángulo 1x1 de Gann?",
          options: [
            { id: "a", text: "Una línea de soporte vertical" },
            { id: "b", text: "Una tasa balanceada de una unidad de precio de movimiento por una unidad de tiempo, dibujada desde un pivote" },
            { id: "c", text: "El precio de cierre exacto del día" },
            { id: "d", text: "Una línea horizontal fija de 90 grados" },
          ],
          explanation: "El ángulo 1x1 (a menudo llamado el de 45 grados) representa una tasa balanceada de avance precio-tiempo desde un punto de pivote significativo.",
        },
        {
          id: "q3",
          prompt: "¿Para qué se usa generalmente el Cuadrado de Nueve de Gann?",
          options: [
            { id: "a", text: "Calcular el spread bid/ask" },
            { id: "b", text: "Proyectar potenciales puntos futuros de giro de precio/tiempo mediante una cuadrícula numérica en espiral" },
            { id: "c", text: "Fijar tamaños de lote estándar" },
            { id: "d", text: "Determinar tasas de interés del banco central" },
          ],
          explanation: "El Cuadrado de Nueve es una cuadrícula en espiral de números usada por practicantes de Gann para proyectar dónde podrían alinearse el precio y el tiempo para un potencial punto de giro.",
        },
        {
          id: "q4",
          prompt: "¿Cómo enmarca esta lección el papel de la teoría de Gann para un estudiante?",
          options: [
            { id: "a", text: "Como el método de trading único más confiable y universalmente probado" },
            { id: "b", text: "Como una introducción conceptual a un enfoque genuinamente complejo y debatido — no un método completo por sí solo" },
            { id: "c", text: "Como completamente desacreditado y nunca vale la pena estudiar" },
            { id: "d", text: "Como idéntico a un cruce de media móvil estándar" },
          ],
          explanation: "La lección es explícita en que los métodos de Gann son complejos y debatidos, y esto está pensado como un punto de partida conceptual en lugar de un sistema completo listo para usar.",
        },
        {
          id: "q5",
          prompt: "¿En qué puso Gann gran énfasis respecto a los ciclos de tiempo?",
          options: [
            { id: "a", text: "Aniversarios de máximos/mínimos pasados y conteos de días específicos que se repiten" },
            { id: "b", text: "Solo el volumen de negociación del día actual" },
            { id: "c", text: "Ignorar todos los datos de precio históricos" },
            { id: "d", text: "Solo trimestres calendario fijos" },
          ],
          explanation: "El trabajo de ciclos de tiempo de Gann se centró fuertemente en conteos de días específicos y aniversarios de máximos/mínimos significativos previos repitiéndose hacia el futuro.",
        },
      ],
    },
  },

  "central-bank-rates": {
    sections: [
      {
        heading: "La palanca individual más grande en los mercados macro",
        body: "La tasa de interés de referencia de un banco central (como la tasa de fondos federales de la Reserva Federal de EE.UU.) influye en el costo del endeudamiento en toda una economía. Subir las tasas tiende a enfriar el gasto/endeudamiento y fortalecer la moneda (un mayor rendimiento atrae capital extranjero); bajar las tasas tiende a fomentar el endeudamiento/gasto y puede debilitar la moneda.",
      },
      {
        heading: "Por qué los traders se obsesionan con las decisiones de tasas",
        body: "Los diferenciales de tasas de interés entre dos países son uno de los principales impulsores a largo plazo de la dirección de un par de divisas — el capital tiende a fluir hacia la moneda que ofrece mejores rendimientos ajustados al riesgo. Por esto las reuniones programadas de bancos centrales (como las reuniones del FOMC en EE.UU.) están entre los eventos de mayor volatilidad en el calendario económico.",
        list: [
          "Alza de tasas: generalmente positiva para la moneda (todo lo demás igual) — un mayor rendimiento atrae entradas de capital.",
          "Baja de tasas: generalmente negativa para la moneda (todo lo demás igual) — menor rendimiento, menos incentivo para mantener esa moneda.",
          "Los mercados reaccionan a la DECISIÓN en relación con las EXPECTATIVAS, no a la decisión aislada — un alza ya totalmente esperada puede causar poco movimiento, o incluso una reversión.",
          "La guía futura (lo que un banco central señala sobre movimientos futuros) a menudo importa más que la decisión actual misma.",
        ],
      },
      {
        body: "\"Compra el rumor, vende la noticia\" es común alrededor de decisiones de tasas: si un alza era muy esperada y ya estaba descontada antes, el anuncio real puede desencadenar una reversión en lugar de una continuación, porque el impulsor real era la sorpresa (o su ausencia) en relación con lo que el mercado ya había descontado.",
      },
      {
        caption: "La cadena lógica de manual que vincula un alza de tasas con la fortaleza de la moneda — todo lo demás igual.",
      },
      {
        label: "Rastrea movimientos reales de bancos centrales en el Calendario Económico",
        note: "Un calendario económico de TradingView en vivo cubre decisiones de tasas de USD, EUR, GBP, JPY, AUD, CAD, CHF y CNY y otras publicaciones de alto impacto.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Todo lo demás igual, ¿qué tiende a hacer un ALZA de tasas de interés del banco central a la moneda de ese país?",
          options: [
            { id: "a", text: "Debilitarla, ya que endeudarse se vuelve más caro" },
            { id: "b", text: "Fortalecerla, ya que un mayor rendimiento tiende a atraer capital extranjero" },
            { id: "c", text: "No tener ningún efecto" },
            { id: "d", text: "Causar hiperinflación de inmediato" },
          ],
          explanation: "Tasas más altas generalmente hacen una moneda más atractiva de mantener (mejor rendimiento), lo que tiende a atraer capital extranjero y apoyar la moneda — todo lo demás igual.",
        },
        {
          id: "q2",
          prompt: "¿Por qué un alza de tasas ampliamente esperada podría causar POCA reacción del mercado, o incluso una reversión?",
          options: [
            { id: "a", text: "Porque los mercados reaccionan a la decisión en relación con lo que ya estaba esperado/descontado, no a la decisión aislada" },
            { id: "b", text: "Porque las decisiones de tasas en realidad nunca mueven los mercados" },
            { id: "c", text: "Porque los bancos centrales siempre anuncian decisiones los fines de semana" },
            { id: "d", text: "Porque las alzas siempre son negativas para la moneda" },
          ],
          explanation: "Si un alza ya estaba totalmente descontada antes, el elemento 'sorpresa' desaparece — el movimiento real puede desencadenar una reacción tipo 'vende la noticia' en lugar de una continuación.",
        },
        {
          id: "q3",
          prompt: "¿A qué se refiere la \"guía futura\" en el contexto de un banco central?",
          options: [
            { id: "a", text: "La cifra exacta del PIB del trimestre pasado" },
            { id: "b", text: "Lo que un banco central señala sobre sus probables movimientos de política FUTUROS, no solo la decisión actual" },
            { id: "c", text: "Un tipo de orden límite" },
            { id: "d", text: "Un calendario de tasas de interés fijo establecido con 10 años de anticipación" },
          ],
          explanation: "La guía futura es la perspectiva comunicada del banco central sobre política futura — a menudo más influyente en el mercado que la decisión de tasas actual misma.",
        },
        {
          id: "q4",
          prompt: "¿Qué describe \"compra el rumor, vende la noticia\"?",
          options: [
            { id: "a", text: "Una forma garantizada de ganar dinero con cada decisión de tasas" },
            { id: "b", text: "El precio moviéndose en anticipación de un evento esperado, luego revirtiendo una vez que el evento se confirma como lo esperado" },
            { id: "c", text: "Una regla que solo aplica a las criptomonedas" },
            { id: "d", text: "Ignorar por completo todas las noticias económicas" },
          ],
          explanation: "Esto describe posicionarse antes de un resultado anticipado, y luego la reversión que puede seguir una vez que ese resultado se confirma realmente y queda totalmente 'descontado'.",
        },
        {
          id: "q5",
          prompt: "En EE.UU., ¿cuáles reuniones programadas son el principal foro para las decisiones de tasa de fondos federales?",
          options: [
            { id: "a", text: "Reuniones del FOMC (Comité Federal de Mercado Abierto)" },
            { id: "b", text: "Llamadas trimestrales de resultados" },
            { id: "c", text: "La Asamblea General de las Naciones Unidas" },
            { id: "d", text: "Discursos del Estado de la Unión" },
          ],
          explanation: "Las reuniones del FOMC son específicamente donde la Reserva Federal de EE.UU. fija su tasa de fondos federales de referencia — entre los eventos programados de mayor volatilidad para los pares de USD.",
        },
      ],
    },
  },

  "nfp-and-news-trading": {
    sections: [
      {
        heading: "Por qué un solo reporte de empleo mueve a todos los pares de USD",
        body: "El reporte de Nóminas No Agrícolas (NFP) de EE.UU., publicado mensualmente, mide el cambio en el número de personas empleadas en EE.UU. (excluyendo trabajadores agrícolas, empleados del gobierno y algunas otras categorías). Es una de las publicaciones económicas más vigiladas porque los datos de empleo alimentan directamente las decisiones de política de la Reserva Federal — un crecimiento fuerte de empleo puede respaldar un caso de política más estricta, un crecimiento débil lo contrario.",
      },
      {
        heading: "Qué hace que operar noticias sea especialmente riesgoso",
        body: "En los segundos/minutos alrededor de una publicación de alto impacto, los spreads pueden ampliarse dramáticamente, el precio puede saltar violentamente en ambas direcciones antes de estabilizarse, y el slippage en los stop-losses puede ser mucho peor que lo normal. Este es un entorno de riesgo fundamentalmente distinto de las horas normales de negociación.",
        list: [
          "Real vs. Pronóstico vs. Previo: los mercados reaccionan más a cómo se compara la cifra REAL con el PRONÓSTICO (expectativa de consenso), no al número bruto solo.",
          "Una gran \"sorpresa positiva\" (real muy por encima del pronóstico) suele ser positiva para la moneda; una gran \"sorpresa negativa\" suele ser negativa — pero los movimientos iniciales pueden revertirse rápido.",
          "La volatilidad a menudo se dispara durante una ventana corta y luego puede revertirse o extenderse de forma impredecible — este no es momento para un tamaño de posición casual.",
        ],
      },
      {
        body: "Muchos traders experimentados evitan deliberadamente abrir posiciones NUEVAS en los minutos inmediatamente alrededor de noticias de alto impacto, específicamente por el riesgo de ampliación de spread y slippage — no porque el movimiento no sea real, sino porque la relación riesgo-recompensa de operar el pico inicial a menudo es pobre.",
      },
      {
        caption: "La secuencia típica de una publicación de noticias de alto impacto y por qué los primeros minutos son especialmente riesgosos de operar.",
      },
      {
        label: "Ver el Calendario Económico y Feed de Noticias en vivo",
        note: "Revisa las próximas publicaciones de alto impacto (incluyendo NFP) y más de 60 titulares en vivo en Forex, Cripto, Materias Primas y Acciones.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "¿Qué mide el reporte de Nóminas No Agrícolas (NFP) de EE.UU.?",
          options: [
            { id: "a", text: "El cambio en el número de personas empleadas en EE.UU., excluyendo trabajadores agrícolas y algunas otras categorías" },
            { id: "b", text: "El precio de cierre del S&P 500" },
            { id: "c", text: "La deuda total del gobierno de EE.UU." },
            { id: "d", text: "La producción de oro en EE.UU." },
          ],
          explanation: "El NFP rastrea específicamente el cambio mensual en el empleo de EE.UU., excluyendo trabajadores agrícolas (y empleados de gobierno/sin fines de lucro/hogares privados), alimentando directamente las consideraciones de política de la Fed.",
        },
        {
          id: "q2",
          prompt: "Los mercados típicamente reaccionan más fuertemente a:",
          options: [
            { id: "a", text: "El número bruto solo, sin importar las expectativas" },
            { id: "b", text: "Cómo se compara la cifra REAL con el PRONÓSTICO (expectativa de consenso)" },
            { id: "c", text: "El reporte de hace exactamente un año" },
            { id: "d", text: "Solo la cifra revisada del mes anterior" },
          ],
          explanation: "La sorpresa en relación al pronóstico de consenso — no el número absoluto en sí — es usualmente lo que impulsa la reacción inmediata más fuerte.",
        },
        {
          id: "q3",
          prompt: "¿Qué suele pasar con los spreads durante una publicación de noticias de alto impacto como el NFP?",
          options: [
            { id: "a", text: "Se estrechan significativamente" },
            { id: "b", text: "A menudo se amplían dramáticamente debido a menor liquidez y mayor incertidumbre" },
            { id: "c", text: "Son legalmente fijos y no pueden cambiar" },
            { id: "d", text: "Los spreads no están relacionados con eventos de noticias" },
          ],
          explanation: "Las publicaciones de alto impacto típicamente ven los spreads ampliarse bruscamente mientras los proveedores de liquidez descuentan incertidumbre y volatilidad extra.",
        },
        {
          id: "q4",
          prompt: "¿Por qué muchos traders experimentados evitan abrir nuevas posiciones en los minutos justo alrededor de una publicación de noticias importante?",
          options: [
            { id: "a", text: "Porque las noticias en realidad nunca importan" },
            { id: "b", text: "Porque los spreads ampliados y el riesgo de slippage a menudo hacen pobre la relación riesgo-recompensa de operar el pico inicial" },
            { id: "c", text: "Porque es ilegal operar durante eventos de noticias" },
            { id: "d", text: "Porque los precios nunca se mueven durante publicaciones de noticias" },
          ],
          explanation: "Es una decisión de gestión de riesgo, no una creencia de que las noticias no importan — el pico de volatilidad inicial a menudo tiene una relación riesgo-recompensa pobre debido a spreads ampliados y slippage.",
        },
        {
          id: "q5",
          prompt: "Una gran \"sorpresa positiva\" del NFP (real muy por encima del pronóstico) es típicamente, todo lo demás igual:",
          options: [
            { id: "a", text: "Negativa para la moneda para el USD" },
            { id: "b", text: "Positiva para la moneda para el USD, aunque el movimiento inicial todavía puede revertirse" },
            { id: "c", text: "Completamente irrelevante para los mercados de divisas" },
            { id: "d", text: "Solo relevante para el mercado de acciones, nunca forex" },
          ],
          explanation: "Una sorpresa positiva fuerte generalmente se lee como positiva para el USD (economía más fuerte, política de la Fed potencialmente más firme), aunque la lección señala que las reacciones iniciales a noticias de alto impacto todavía pueden revertirse.",
        },
      ],
    },
  },

  "market-sentiment": {
    sections: [
      {
        heading: "Qué significa realmente \"sentimiento\"",
        body: "El sentimiento de mercado es la actitud general de los traders/inversionistas hacia un activo o mercado particular — ampliamente alcista (optimista, esperando que los precios suban) o bajista (pesimista, esperando que los precios bajen). A diferencia de un precio duro o una lectura de indicador, el sentimiento es inherentemente sobre el estado de ánimo colectivo de la multitud, por eso se mide a través de proxies en lugar de un único número definitivo.",
      },
      {
        heading: "Leer el sentimiento sin fabricar certeza",
        body: "Los proxies comunes de sentimiento incluyen el tono de los titulares de noticias (¿la cobertura se enmarca positiva o negativamente?), la conversación en redes sociales y datos de posicionamiento (cuántos traders están netos largos vs. netos cortos). Estos son genuinamente útiles como medidor de psicología de masas, pero ninguno predice el precio con certeza — el sentimiento es una entrada entre varias, no un sistema de trading independiente.",
        list: [
          "El sentimiento extremo unilateral (casi todos alcistas, o casi todos bajistas) a veces se lee como una señal de advertencia contraria — cuando casi todos ya se posicionaron de una forma, puede quedar pocos compradores/vendedores para empujar más.",
          "El sentimiento puede mantenerse unilateral y seguir siendo correcto por mucho tiempo — las señales contrarias son una bandera de precaución, no una herramienta de temporización.",
          "Combinar el sentimiento con la acción del precio y los fundamentos tiende a ser más robusto que depender del sentimiento solo.",
        ],
      },
      {
        body: "Sé escéptico de cualquier número de sentimiento presentado con falsa precisión (\"73.2% alcista\"). A menos que sepas exactamente qué se está midiendo y cómo (¿conteos de palabras clave en titulares? ¿encuestados? ¿posicionamiento en futuros?), trátalo como un medidor direccional aproximado, no una lectura científica.",
      },
      {
        caption: "Un medidor de sentimiento es un proxy aproximado del estado de ánimo de la multitud — contexto útil, nunca una señal de trading independiente.",
      },
      {
        label: "Ver el Sentimiento de Mercado en vivo en Análisis de Mercado",
        note: "El Sesgo General de Mercado del reporte de Análisis Técnico combina el Sesgo Técnico y Fundamental en vivo, señalando si coinciden o entran en conflicto.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "¿A qué se refiere el \"sentimiento de mercado\"?",
          options: [
            { id: "a", text: "El spread bid/ask exacto actual" },
            { id: "b", text: "La actitud general (alcista o bajista) de los traders/inversionistas hacia un activo" },
            { id: "c", text: "Una regulación gubernamental sobre el trading" },
            { id: "d", text: "La tasa de interés actual" },
          ],
          explanation: "El sentimiento trata específicamente sobre el estado de ánimo/actitud colectiva de la multitud — optimista (alcista) o pesimista (bajista) — no una cifra dura de precio o tasa.",
        },
        {
          id: "q2",
          prompt: "¿Cuál de estos es un proxy de sentimiento comúnmente usado?",
          options: [
            { id: "a", text: "Datos de posicionamiento — cuántos traders están netos largos vs. netos cortos" },
            { id: "b", text: "La cifra exacta del PIB histórico de hace 10 años" },
            { id: "c", text: "Un puntaje de sentimiento fijo publicado por el gobierno" },
            { id: "d", text: "El color del tema de la plataforma de trading" },
          ],
          explanation: "Los datos de posicionamiento neto largo/corto son un proxy de sentimiento ampliamente usado, junto con cosas como el tono de noticias y la conversación en redes sociales.",
        },
        {
          id: "q3",
          prompt: "¿Por qué algunos traders ven el sentimiento extremo unilateral como una señal de advertencia contraria?",
          options: [
            { id: "a", text: "Porque garantiza una reversión inmediata" },
            { id: "b", text: "Porque cuando casi todos ya se posicionaron de una forma, puede quedar pocos compradores/vendedores para empujar más en esa dirección" },
            { id: "c", text: "Porque los datos de sentimiento siempre están equivocados" },
            { id: "d", text: "Porque medir sentimiento extremo es ilegal" },
          ],
          explanation: "La lógica contraria trata sobre el agotamiento del posicionamiento unilateral, no una garantía — la lección es explícita en que el sentimiento unilateral puede persistir y seguir siendo correcto por mucho tiempo.",
        },
        {
          id: "q4",
          prompt: "¿Cuál es la forma recomendada de usar los datos de sentimiento, según esta lección?",
          options: [
            { id: "a", text: "Como un sistema de trading independiente por sí solo" },
            { id: "b", text: "Combinado con la acción del precio y los fundamentos, como una entrada entre varias" },
            { id: "c", text: "Nunca — el sentimiento no tiene ningún valor" },
            { id: "d", text: "Solo en mercados de criptomonedas" },
          ],
          explanation: "La lección enmarca el sentimiento como contexto genuinamente útil que es más robusto cuando se combina con otro análisis, no como una señal independiente.",
        },
        {
          id: "q5",
          prompt: "¿Por qué un trader debería ser escéptico de una lectura de sentimiento presentada con falsa precisión (como \"73.2% alcista\")?",
          options: [
            { id: "a", text: "Porque tal precisión siempre es fabricada y sin sentido" },
            { id: "b", text: "Porque sin saber exactamente qué se está midiendo y cómo, esa precisión puede exagerar lo científica que realmente es la lectura" },
            { id: "c", text: "Porque el sentimiento solo puede medirse en números enteros" },
            { id: "d", text: "Porque los decimales no están permitidos en finanzas" },
          ],
          explanation: "La precaución trata sobre entender la metodología detrás de un número antes de confiar en su aparente precisión — no que todos esos números sean falsos, sino que no deberían tomarse como más rigurosos de lo que realmente son.",
        },
      ],
    },
  },

  "position-sizing-math": {
    sections: [
      {
        heading: "El cálculo que necesita toda operación",
        body: "El dimensionamiento de posición responde una pregunta antes de cada operación: dado cuánto estás dispuesto a perder si te equivocas, ¿cuán grande puedes realmente hacer tu posición? Hacer esto bien es discutiblemente más importante que estar en lo correcto sobre la dirección del mercado — es lo que evita que una serie de operaciones perdedoras termine la cuenta.",
      },
      {
        heading: "Las tres entradas",
        body: "El tamaño de posición depende exactamente de tres cosas: tu saldo de cuenta, el porcentaje de este que estás dispuesto a arriesgar en esta operación (comúnmente 1-2% para traders disciplinados), y la distancia (en pips o unidades de precio) entre tu entrada y tu stop-loss.",
        list: [
          "Monto de Riesgo = Saldo de Cuenta × % de Riesgo — la cantidad real en dólares que estás dispuesto a perder en esta operación.",
          "Distancia de Stop-Loss = cuán lejos (en pips) está tu stop de tu entrada.",
          "Tamaño de Posición = Monto de Riesgo ÷ (Distancia de Stop-Loss × Valor por pip por unidad) — resuelto hacia atrás desde cuánto estás dispuesto a perder.",
        ],
      },
      {
        label: "Fórmula de Dimensionamiento de Posición",
        note: "Una cuenta de $10,000 arriesgando 1% ($100) con un stop de 20 pips en un par donde un lote estándar = $10/pip necesita: $100 ÷ (20 × $10) = 0.5 lotes estándar.",
      },
      {
        body: "Nota que la fórmula nunca pregunta \"¿qué tan seguro estás de esta operación?\". El dimensionamiento de posición es deliberadamente independiente de la confianza — se trata de sobrevivir estando equivocado, no de aumentar el tamaño porque una configuración se \"siente\" genial.",
      },
      {
        body: "El apalancamiento alto te permite abrir una posición mucho más grande de lo que normalmente podría soportar el saldo de tu cuenta — lo que significa que un movimiento de precio pequeño y ordinario en tu contra puede eliminar una porción mucho mayor de tu cuenta de lo que lo haría sin apalancamiento. El apalancamiento no cambia tu ventaja en el mercado; solo cambia qué tan rápido un error se vuelve costoso.",
      },
      {
        caption: "Pruébalo: ingresa tu propio saldo de cuenta, % de riesgo y distancia de stop-loss.",
      },
      {
        caption: "Pruébalo: mira cuánto margen requiere realmente una posición a un apalancamiento dado, y cuánto margen libre queda.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "¿Qué tres entradas necesita un cálculo de dimensionamiento de posición?",
          options: [
            { id: "a", text: "Saldo de cuenta, % de riesgo y distancia de stop-loss" },
            { id: "b", text: "RSI actual, media móvil y nivel de Fibonacci" },
            { id: "c", text: "Nombre del bróker, ratio de apalancamiento y sentimiento de noticias" },
            { id: "d", text: "Color de la vela, longitud de mecha y tamaño de cuerpo" },
          ],
          explanation: "El dimensionamiento de posición es puramente una función del saldo de cuenta, el % que estás arriesgando, y cuán lejos está tu stop-loss de la entrada — nada sobre el análisis de mercado mismo.",
        },
        {
          id: "q2",
          prompt: "Una cuenta de $10,000 arriesga 1% por operación. ¿Cuál es el Monto de Riesgo en dólares para una operación?",
          options: [
            { id: "a", text: "$10" },
            { id: "b", text: "$100" },
            { id: "c", text: "$1,000" },
            { id: "d", text: "$10,000" },
          ],
          explanation: "Monto de Riesgo = Saldo de Cuenta × % de Riesgo = $10,000 × 1% = $100.",
        },
        {
          id: "q3",
          prompt: "Usando ese mismo monto de riesgo de $100 con un stop de 20 pips, en un par donde un lote estándar vale $10/pip, ¿qué tamaño de lote mantiene el riesgo en exactamente $100?",
          options: [
            { id: "a", text: "0.05 lotes" },
            { id: "b", text: "0.5 lotes" },
            { id: "c", text: "5 lotes" },
            { id: "d", text: "50 lotes" },
          ],
          explanation: "Tamaño de Lote ≈ Monto de Riesgo ÷ (Pips de Stop × Valor del Pip por Lote) = $100 ÷ (20 × $10) = 0.5 lotes estándar.",
        },
        {
          id: "q4",
          prompt: "¿Por qué dice la lección que el dimensionamiento de posición es deliberadamente \"independiente de la confianza\"?",
          options: [
            { id: "a", text: "Porque debería aumentar siempre que una operación se sienta como algo seguro" },
            { id: "b", text: "Porque la fórmula trata sobre sobrevivir estando equivocado, sin importar cuán confiado te sientas al entrar" },
            { id: "c", text: "Porque la confianza es la única entrada que importa" },
            { id: "d", text: "Porque el dimensionamiento de posición en realidad no afecta los resultados" },
          ],
          explanation: "El punto completo del dimensionamiento de posición disciplinado es que limita tu pérdida si te equivocas — no está pensado para ajustarse según una corazonada sobre qué tan probable es que funcione la operación.",
        },
        {
          id: "q5",
          prompt: "¿Qué rango de riesgo por operación comúnmente citado usan muchos traders disciplinados?",
          options: [
            { id: "a", text: "1-2% del saldo de cuenta por operación" },
            { id: "b", text: "25-50% del saldo de cuenta por operación" },
            { id: "c", text: "100% del saldo de cuenta por operación" },
            { id: "d", text: "No hay un rango comúnmente citado" },
          ],
          explanation: "1-2% por operación es una guía de gestión de riesgo ampliamente citada, manteniendo cualquier pérdida individual pequeña en relación a la cuenta general.",
        },
      ],
    },
  },

  "risk-to-reward-ratio": {
    sections: [
      {
        heading: "No necesitas estar en lo correcto la mayoría del tiempo",
        body: "El ratio de Riesgo-Recompensa (R:R) compara cuánto estás dispuesto a perder si una operación sale mal (riesgo, es decir, distancia al stop-loss) contra cuánto estás dispuesto a ganar si sale bien (recompensa, es decir, distancia al take-profit). Un ratio de 1:2 significa arriesgar 1 unidad para potencialmente ganar 2; 1:3 significa arriesgar 1 para potencialmente ganar 3.",
      },
      {
        heading: "Por qué esto cambia la matemática de la tasa de aciertos",
        body: "Con un R:R consistente de 1:2, puedes ser rentable en general ganando solo el 40% de las operaciones, porque cada ganancia recupera más del valor de dos pérdidas. Esta es la razón individual más importante por la que los traders profesionales se obsesionan con el R:R antes de colocar cualquier operación — desvincula la rentabilidad a largo plazo de la necesidad de estar en lo correcto la mayoría del tiempo.",
        list: [
          "A un R:R de 1:1, necesitas > 50% de tasa de aciertos solo para ser rentable (ignorando costos).",
          "A un R:R de 1:2, aproximadamente 34%+ de tasa de aciertos puede ser rentable.",
          "A un R:R de 1:3, aproximadamente 25%+ de tasa de aciertos puede ser rentable.",
          "Estos son umbrales simplificados de punto de equilibrio ignorando el spread/comisión — los costos reales elevan ligeramente el umbral.",
        ],
      },
      {
        label: "Ratio de Riesgo-Recompensa",
        note: "Entrada en 1.1000, stop-loss en 1.0950 (riesgo de 50 pips), take-profit en 1.1100 (recompensa de 100 pips) → R:R = 100 ÷ 50 = 1:2.",
      },
      {
        body: "Una operación con un R:R pobre (como 1:0.5 — arriesgando más de lo que estás dispuesto a ganar) necesita una tasa de aciertos irrealistamente alta solo para llegar al punto de equilibrio. Antes de preguntar \"¿ganará esta operación?\", pregunta \"¿vale la pena siquiera el R:R de esta operación si me equivoco la mitad del tiempo?\"",
      },
      {
        body: "Un gran R:R en papel no te protege si mueves tu stop-loss más lejos a mitad de la operación para \"darle más espacio\" una vez que está perdiendo. Ese único hábito — ampliar un stop después de entrar — silenciosamente convierte una operación planeada de 1:2 en una no planeada e ilimitada, y es una de las formas más rápidas en que el dimensionamiento de posición disciplinado deja de significar algo.",
      },
      {
        caption: "Una configuración de riesgo-recompensa de 1:2: la ganancia potencial (verde) es el doble del tamaño de la pérdida potencial (rojo).",
      },
      {
        caption: "Pruébalo: ingresa tu propia entrada, stop-loss y take-profit para ver el riesgo en dólares, la recompensa en dólares y el ratio R:R.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "Una operación arriesga 40 pips para potencialmente ganar 120 pips. ¿Cuál es el ratio Riesgo-Recompensa?",
          options: [
            { id: "a", text: "1:2" },
            { id: "b", text: "1:3" },
            { id: "c", text: "3:1" },
            { id: "d", text: "1:1" },
          ],
          explanation: "R:R = Recompensa ÷ Riesgo = 120 ÷ 40 = 3, así que este es un ratio de 1:3 — arriesgando 1 unidad por un potencial de 3.",
        },
        {
          id: "q2",
          prompt: "A un ratio riesgo-recompensa consistente de 1:2, ¿aproximadamente qué tasa de aciertos se necesita para ser rentable en general (ignorando costos)?",
          options: [
            { id: "a", text: "Por encima del 50%" },
            { id: "b", text: "Aproximadamente 34% o más" },
            { id: "c", text: "Exactamente 100%" },
            { id: "d", text: "La tasa de aciertos es irrelevante para la rentabilidad" },
          ],
          explanation: "Con cada ganancia valiendo 2x cada pérdida, puedes ser neto rentable ganando solo alrededor de un tercio de las operaciones — una razón central por la que la disciplina de R:R importa tanto.",
        },
        {
          id: "q3",
          prompt: "¿Qué requiere un ratio riesgo-recompensa de 1:1, ignorando costos de trading, para ser rentable con el tiempo?",
          options: [
            { id: "a", text: "Una tasa de aciertos por encima del 50%" },
            { id: "b", text: "Una tasa de aciertos por encima del 90%" },
            { id: "c", text: "Cualquier tasa de aciertos funciona igual de bien" },
            { id: "d", text: "Una tasa de aciertos de exactamente 0%" },
          ],
          explanation: "A 1:1, las ganancias y pérdidas son del mismo tamaño, así que necesitas ganar más de la mitad de tus operaciones (considerando costos esto sube aún más) solo para salir adelante.",
        },
        {
          id: "q4",
          prompt: "¿Por qué los traders profesionales enfatizan el R:R antes de colocar una operación, según esta lección?",
          options: [
            { id: "a", text: "Porque garantiza que cada operación individual ganará" },
            { id: "b", text: "Porque un R:R favorable desvincula la rentabilidad a largo plazo de la necesidad de estar en lo correcto la mayoría del tiempo" },
            { id: "c", text: "Porque el R:R no tiene nada que ver con la rentabilidad" },
            { id: "d", text: "Porque elimina la necesidad de stop-losses" },
          ],
          explanation: "Un buen R:R significa que no necesitas una alta tasa de aciertos para ser rentable en general — por eso se trata como gestión de riesgo fundamental.",
        },
        {
          id: "q5",
          prompt: "Una operación tiene un ratio riesgo-recompensa de 1:0.5 (arriesgando más que la ganancia potencial). ¿Qué significa esto para la tasa de aciertos necesaria para llegar al punto de equilibrio?",
          options: [
            { id: "a", text: "Necesita una tasa de aciertos muy por encima del 50% solo para llegar al punto de equilibrio" },
            { id: "b", text: "Necesita casi ninguna operación ganadora en absoluto" },
            { id: "c", text: "La tasa de aciertos no importa a este ratio" },
            { id: "d", text: "Este ratio siempre garantiza una pérdida sin importar la tasa de aciertos" },
          ],
          explanation: "Cuando la pérdida potencial es mayor que la ganancia potencial, necesitas ganar una proporción desproporcionadamente alta de operaciones solo para evitar una pérdida neta con el tiempo.",
        },
      ],
    },
  },

  "trading-journal": {
    sections: [
      {
        heading: "No puedes mejorar lo que no registras",
        body: "Un diario de trading es un registro estructurado de cada operación que realizas — no solo el resultado, sino el razonamiento detrás de ella. Sin uno, los traders tienden a recordar vívidamente sus mejores operaciones y convenientemente olvidar o racionalizar las peores, lo que hace casi imposible la autoevaluación honesta.",
      },
      {
        heading: "Qué pertenece realmente a una entrada útil del diario",
        body: "Una entrada de diario que vale la pena conservar captura más que simplemente \"gané\" o \"perdí\" — captura el contexto de la toma de decisiones, así los patrones (buenos y malos) se vuelven visibles a lo largo de docenas de entradas en lugar de permanecer invisibles en la memoria.",
        list: [
          "La configuración/razón para entrar (qué señal o análisis disparó la operación)",
          "Precio de entrada, stop-loss, take-profit y tamaño de posición",
          "El resultado real y el R:R logrado",
          "Tu estado emocional al entrar y salir (¿tranquilo? ¿ansioso? ¿persiguiendo una pérdida?)",
          "Una nota corta y honesta: ¿qué harías diferente, si algo?",
        ],
      },
      {
        body: "Registra tus operaciones incluso — especialmente — las pérdidas aburridas y correctas en proceso donde seguiste tu plan exactamente y aun así perdiste. Esas son prueba de que tu proceso puede ser sólido incluso cuando una operación específica no es rentable, lo cual es una lección distinta (y más saludable) que \"me equivoqué\".",
      },
      {
        caption: "Un diario de trading convierte operaciones individuales dispersas en un patrón visible y mejorable.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "¿Por qué es importante un diario de trading, más allá de simplemente rastrear ganancias y pérdidas?",
          options: [
            { id: "a", text: "Es un requisito legal en todos los países" },
            { id: "b", text: "Registra el contexto de la toma de decisiones, haciendo visibles patrones que la memoria sola pasaría por alto o racionalizaría" },
            { id: "c", text: "Aumenta automáticamente tu tasa de aciertos" },
            { id: "d", text: "Reemplaza la necesidad de un stop-loss" },
          ],
          explanation: "El valor central es la autoevaluación honesta y estructurada — la memoria sola tiende a sobrevalorar las grandes ganancias y racionalizar las pérdidas, lo que un diario corrige.",
        },
        {
          id: "q2",
          prompt: "¿Cuál de estos pertenece a una entrada de diario bien estructurada, según esta lección?",
          options: [
            { id: "a", text: "Solo si la operación ganó o perdió" },
            { id: "b", text: "La configuración/razonamiento, niveles de entrada/stop/objetivo, resultado y tu estado emocional" },
            { id: "c", text: "Solo el nombre del bróker" },
            { id: "d", text: "Nada — llevar un diario es trabajo opcional innecesario" },
          ],
          explanation: "Una entrada útil captura todo el contexto de decisión — no solo el resultado binario — incluyendo el estado emocional al entrar/salir.",
        },
        {
          id: "q3",
          prompt: "¿Por qué deberías registrar una operación donde seguiste tu plan exactamente y aun así perdiste?",
          options: [
            { id: "a", text: "No deberías — solo las operaciones ganadoras valen registrarse" },
            { id: "b", text: "Porque es evidencia de que tu proceso puede ser sólido incluso cuando una operación individual no es rentable — una lección distinta de \"me equivoqué\"" },
            { id: "c", text: "Porque las pérdidas siempre deben eliminarse del registro" },
            { id: "d", text: "Porque garantiza que la siguiente operación ganará" },
          ],
          explanation: "Una pérdida correcta en el proceso es un dato valioso: muestra que el plan todavía puede perder a veces incluso cuando se ejecuta bien, lo cual es una distinción más saludable que tratar cada pérdida como un error personal.",
        },
        {
          id: "q4",
          prompt: "¿Qué tiende a pasar con la memoria de un trader sobre su propio historial de trading sin un diario?",
          options: [
            { id: "a", text: "Se mantiene perfectamente precisa e imparcial" },
            { id: "b", text: "Tiende a recordar vívidamente las grandes ganancias mientras olvida o racionaliza las pérdidas" },
            { id: "c", text: "Se vuelve más detallada con el tiempo automáticamente" },
            { id: "d", text: "No hay diferencia con o sin un diario" },
          ],
          explanation: "Este sesgo de memoria selectiva es exactamente por qué importa un registro externo y estructurado — es una verificación contra el recuerdo autoservicial.",
        },
        {
          id: "q5",
          prompt: "¿Cuál es el objetivo final de revisar un diario de trading con el tiempo?",
          options: [
            { id: "a", text: "Ganar cada operación futura individual" },
            { id: "b", text: "Detectar patrones recurrentes (buenos y malos) a lo largo de muchas operaciones y refinar tu proceso" },
            { id: "c", text: "Calcular la comisión de tu bróker" },
            { id: "d", text: "Predecir precios futuros exactos" },
          ],
          explanation: "El valor del diario se acumula a lo largo de muchas entradas — sacando a la luz patrones en tu propio comportamiento y toma de decisiones que el resultado de una sola operación nunca podría revelar.",
        },
      ],
    },
  },

  "fomo-and-greed": {
    sections: [
      {
        heading: "Las dos emociones que arruinan planes por lo demás sólidos",
        body: "El FOMO (Miedo a Perderse Algo) es el impulso ansioso de saltar a un movimiento que ya está en marcha, usualmente sin que se cumplan tus criterios de configuración normales, porque \"se está moviendo sin mí\". La codicia es el impulso de mantener una posición ganadora más allá de tu objetivo planeado, sobredimensionar una posición porque una operación \"se siente\" imparable, o reentrar de inmediato después de una gran ganancia persiguiendo más.",
      },
      {
        heading: "Por qué estas específicamente atacan tu proceso",
        body: "Ambas emociones comparten un mecanismo común: te convencen de abandonar una regla que estableciste con anticipación (con calma, con mente clara) a favor de un impulso del momento (bajo presión emocional). La regla existía precisamente porque tu yo tranquilo y planificador sabía que tu yo del momento no podía confiarse para tomar bien esa decisión.",
        list: [
          "Entrada por FOMO: entrar tarde, persiguiendo un movimiento sin plan de stop-loss o con posición sobredimensionada, porque la configuración ya parece \"obviamente\" correcta.",
          "Abandono del objetivo por codicia: mover tu take-profit más lejos a mitad de operación porque el movimiento \"podría seguir\", convirtiendo una ganancia planeada en una apuesta no planeada.",
          "Trading de venganza: reentrar de inmediato después de una pérdida para \"recuperarla\", usualmente con el juicio alterado y a menudo sobredimensionado.",
          "La solución común para las tres: comprometerse de antemano con reglas de entrada/salida ANTES del momento emocional, y tratar desviarse de ellas como un fallo de proceso sin importar si esa desviación específica resultó funcionar.",
        ],
      },
      {
        body: "Una operación que rompe tus reglas pero termina ganando es más peligrosa a largo plazo que una que sigue tus reglas y pierde — la ruptura de regla ganadora te enseña la lección equivocada (\"funcionó, así que está bien\") y hace más fácil la siguiente ruptura de regla.",
      },
      {
        caption: "La secuencia de secuestro emocional que las reglas comprometidas de antemano existen específicamente para interrumpir.",
      },
      {
        body: "El trading de venganza es el más peligroso de los tres porque se compone: una pérdida dispara una reentrada impulsiva y sobredimensionada, que estadísticamente es más probable que también pierda, lo que dispara un impulso aún más fuerte de \"recuperarla\". Cada ciclo eleva tanto el tamaño de posición como las apuestas emocionales — así es como una pérdida manejable se convierte en una que termina la cuenta.",
      },
    ],
    quiz: {
      questions: [
        {
          id: "q1",
          prompt: "¿Qué suele impulsar al FOMO (Miedo a Perderse Algo) a hacer a un trader?",
          options: [
            { id: "a", text: "Esperar pacientemente a que se cumplan sus criterios normales de configuración" },
            { id: "b", text: "Saltar a un movimiento ya en marcha, a menudo sin que se cumplan sus criterios normales de configuración" },
            { id: "c", text: "Reducir el tamaño de posición automáticamente" },
            { id: "d", text: "Cerrar todas las posiciones abiertas de inmediato" },
          ],
          explanation: "El FOMO es específicamente el impulso ansioso de perseguir un movimiento que ya está ocurriendo, usualmente evitando las propias reglas de entrada normales del trader.",
        },
        {
          id: "q2",
          prompt: "¿Qué es el \"trading de venganza\"?",
          options: [
            { id: "a", text: "Revisar con calma una pérdida en tu diario de trading" },
            { id: "b", text: "Reentrar de inmediato al mercado después de una pérdida para intentar \"recuperarla\", usualmente con el juicio alterado" },
            { id: "c", text: "Un tipo de orden límite" },
            { id: "d", text: "Reducir el riesgo después de una racha de pérdidas" },
          ],
          explanation: "El trading de venganza es el intento impulsivo de recuperar de inmediato una pérdida, típicamente agravando el error original con mala toma de decisiones bajo presión emocional.",
        },
        {
          id: "q3",
          prompt: "¿Qué mecanismo común comparten el FOMO y la codicia, según esta lección?",
          options: [
            { id: "a", text: "Ambos implican abandonar una regla establecida con calma de antemano, a favor de un impulso emocional del momento" },
            { id: "b", text: "Ambos solo afectan a traders principiantes, nunca a los experimentados" },
            { id: "c", text: "Ambos son necesarios para la rentabilidad consistente" },
            { id: "d", text: "Ninguno tiene efecto real en los resultados de trading" },
          ],
          explanation: "El patrón central es el mismo: una regla comprometida de antemano y con mente clara es anulada por un impulso emocional en el momento — eso es exactamente contra lo que el compromiso previo está pensado para proteger.",
        },
        {
          id: "q4",
          prompt: "¿Por qué se considera peligrosa a largo plazo una operación que rompe reglas y termina GANANDO?",
          options: [
            { id: "a", text: "No es peligrosa — cualquier operación ganadora es buena" },
            { id: "b", text: "Refuerza la lección equivocada (\"romper la regla funcionó\"), haciendo más fácil la siguiente ruptura de regla" },
            { id: "c", text: "Las operaciones ganadoras siempre deben reportarse a un regulador" },
            { id: "d", text: "Garantiza que la siguiente operación también romperá las reglas" },
          ],
          explanation: "Una ruptura de regla ganadora le enseña a un trader que la regla no importó esa vez, lo que erosiona la disciplina para operaciones futuras aunque el resultado fue bueno puramente por azar.",
        },
        {
          id: "q5",
          prompt: "¿Cuál es la solución general recomendada tanto para el FOMO, la codicia como el trading de venganza?",
          options: [
            { id: "a", text: "Comprometerse de antemano con reglas de entrada/salida antes del momento emocional, y tratar desviarse de ellas como un fallo de proceso sin importar el resultado" },
            { id: "b", text: "Operar exclusivamente por instinto emocional, ya que las reglas limitan el potencial de ganancia" },
            { id: "c", text: "Solo operar cuando te sientas extremadamente confiado" },
            { id: "d", text: "Aumentar el tamaño de posición después de cada pérdida para recuperarse más rápido" },
          ],
          explanation: "La solución central de la lección es el compromiso previo: decidir las reglas en un estado de calma, antes de la presión emocional de una operación en vivo, y mantenerlas sin importar si una desviación específica habría funcionado.",
        },
      ],
    },
  },
};
