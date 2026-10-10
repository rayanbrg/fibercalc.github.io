/*
 * Plantilles d'avaluació del Grau en Enginyeria Informàtica (FIB - UPC)
 * ---------------------------------------------------------------------
 * Aquestes dades són ORIENTATIVES: surten de la pàgina pública de cada assignatura
 * (apartat "Mètode d'avaluació") i poden canviar cada curs o segons el professor.
 * A l'app sempre es mostra un avís amb l'enllaç a la guia oficial.
 *
 * COM AFEGIR UNA ASSIGNATURA: copia un bloc de sota i canvia'n les dades.
 *   code         Sigla tal com surt a la FIB (és també la que s'omple a l'app)
 *   name         Nom complet
 *   ects         Crèdits
 *   groups       Llista de grups on surt al selector (Obligatòria, una menció o Optativa)
 *   q            (només obligatòries) Quatrimestre del pla d'estudis, 1-5
 *   checked      Data (AAAA-MM-DD) en què es va comprovar la guia
 *   approx       (opcional) true si els pesos són una aproximació de la fórmula oficial
 *   note         (opcional) Text curt que es mostra a l'usuari: bonus, condicions, matisos...
 *   evaluations  [] si la guia no dona pesos (només s'omple sigla, nom i ECTS). Una o més avaluacions (p. ex. "Continua" i "Final únic").
 *                Cada part és [nom, pes en %]. Els pesos d'una avaluació han de sumar 100.
 *
 * L'enllaç a la guia es genera sol: TEMPLATE_URL_BASE + code.
 */
window.FIBERCALC_TEMPLATE_URL_BASE = 'https://www.fib.upc.edu/ca/graus/grau-en-enginyeria-informatica/pla-destudis/assignatures/';

window.FIBERCALC_TEMPLATES = [
  {
    code: "F",
    name: "Física",
    ects: 7.5,
    groups: ["Obligatòria"],
    q: 1,
    checked: "2026-10-10",
    note: "Nota = 0,90·màx(EF,(P1+P2)/2) + 0,10·L; L = 0,75·mitjana de pràctiques + 0,25·ExLab. L'examen final és opcional i cal demanar-lo amb 10 dies d'antelació.",
    evaluations: [
      { name: "Avaluació contínua", parts: [["Parcial 1 (P1)", 45], ["Parcial 2 (P2)", 45], ["Laboratori (L)", 10]] },
      { name: "Amb examen final", parts: [["Examen final (EF)", 90], ["Laboratori (L)", 10]] }
    ]
  },
  {
    code: "FM",
    name: "Fonaments Matemàtics",
    ects: 7.5,
    groups: ["Obligatòria"],
    q: 1,
    checked: "2026-10-10",
    note: "Nota del curs = màx(AC, F), amb AC = 0,4·P1 + 0,4·P2 + 0,2·L.",
    evaluations: [
      { name: "Avaluació continuada (AC)", parts: [["Parcial 1 (P1)", 40], ["Parcial 2 (P2)", 40], ["Laboratori (L)", 20]] },
      { name: "Examen final (F)", parts: [["Examen final (F)", 100]] }
    ]
  },
  {
    code: "IC",
    name: "Introducció als Computadors",
    ects: 7.5,
    groups: ["Obligatòria"],
    q: 1,
    checked: "2026-10-10",
    note: "NF = 0,8·NTP + 0,2·NL, amb NTP = màx(0,4·NP1 + 0,6·NP2, EF). NL és la mitjana de 6 pràctiques; sense informe previ la pràctica val 0.",
    evaluations: [
      { name: "Avaluació contínua", parts: [["Parcial 1 (NP1)", 32], ["Parcial 2 (NP2)", 48], ["Laboratori (NL)", 20]] },
      { name: "Amb examen final", parts: [["Examen final (EF)", 80], ["Laboratori (NL)", 20]] }
    ]
  },
  {
    code: "PRO1",
    name: "Programació I",
    ects: 7.5,
    groups: ["Obligatòria"],
    q: 1,
    checked: "2026-10-10",
    note: "N = màx(0,4·P + 0,6·F, F).",
    evaluations: [
      { name: "Parcial i final", parts: [["Examen parcial (P)", 40], ["Examen final (F)", 60]] },
      { name: "Només examen final", parts: [["Examen final (F)", 100]] }
    ]
  },
  {
    code: "EC",
    name: "Estructura de Computadors",
    ects: 7.5,
    groups: ["Obligatòria"],
    q: 2,
    checked: "2026-10-10",
    note: "NOTA = màx(0,20·EP + 0,60·EF, 0,80·EF) + 0,20·(0,85·EL + 0,15·AC).",
    evaluations: [
      { name: "Amb parcial", parts: [["Examen parcial (EP)", 20], ["Examen final (EF)", 60], ["Examen de laboratori (EL)", 17], ["Avaluació contínua de laboratori (AC)", 3]] },
      { name: "Només examen final de teoria", parts: [["Examen final (EF)", 80], ["Examen de laboratori (EL)", 17], ["Avaluació contínua de laboratori (AC)", 3]] }
    ]
  },
  {
    code: "M1",
    name: "Matemàtiques I",
    ects: 7.5,
    groups: ["Obligatòria"],
    q: 2,
    checked: "2026-10-10",
    note: "Nota = 0,2·T + 0,35·màx(P, F1) + 0,45·F2.",
    evaluations: [
      { name: "Amb parcial (P)", parts: [["Taller (T)", 20], ["Examen parcial (P)", 35], ["Examen final F2", 45]] },
      { name: "Amb F1", parts: [["Taller (T)", 20], ["Examen final F1", 35], ["Examen final F2", 45]] }
    ]
  },
  {
    code: "M2",
    name: "Matemàtiques II",
    ects: 7.5,
    groups: ["Obligatòria"],
    q: 2,
    checked: "2026-10-10",
    note: "Nota = 0,2·T + màx(0,3·P + 0,5·F, 0,8·F). No presentar-se a l'examen final dona NP.",
    evaluations: [
      { name: "Amb parcial", parts: [["Taller (T)", 20], ["Examen parcial (P)", 30], ["Examen final (F)", 50]] },
      { name: "Només examen final", parts: [["Taller (T)", 20], ["Examen final (F)", 80]] }
    ]
  },
  {
    code: "PRO2",
    name: "Programació II",
    ects: 7.5,
    groups: ["Obligatòria"],
    q: 2,
    checked: "2026-10-10",
    note: "NCTEC = 0,7·TEORIA + 0,3·PRÀCTICA, amb TEORIA = màx(FINAL, (PARCIAL+FINAL)/2) i PRÀCTICA = 0,9·EXAMEN + 0,1·SEGUIMENT.",
    evaluations: [
      { name: "Amb parcial", parts: [["Parcial de teoria", 35], ["Final de teoria", 35], ["Examen de pràctiques", 27], ["Seguiment de laboratori", 3]] },
      { name: "Només final de teoria", parts: [["Final de teoria", 70], ["Examen de pràctiques", 27], ["Seguiment de laboratori", 3]] }
    ]
  },
  {
    code: "BD",
    name: "Bases de Dades",
    ects: 6,
    groups: ["Obligatòria"],
    q: 3,
    checked: "2026-10-10",
    note: "Qualificació final = 0,40·NEP + 0,50·NEF + 0,10·NL.",
    evaluations: [
      { name: "Avaluació", parts: [["Examen parcial (NEP)", 40], ["Examen final (NEF)", 50], ["Laboratori (NL)", 10]] }
    ]
  },
  {
    code: "CI",
    name: "Interfícies de Computadors",
    ects: 6,
    groups: ["Obligatòria"],
    q: 3,
    checked: "2026-10-10",
    note: "NF = 0,65·NT + 0,35·NL. Cal fer i presentar correctament les pràctiques de laboratori per aprovar.",
    evaluations: [
      { name: "Avaluació", parts: [["Proves escrites (NT)", 65], ["Laboratori (NL)", 35]] }
    ]
  },
  {
    code: "EDA",
    name: "Estructures de Dades i Algorismes",
    ects: 6,
    groups: ["Obligatòria"],
    q: 3,
    checked: "2026-10-10",
    approx: true,
    note: "Oficial: NOTA = mín(10, màx(22,5%·NPP + 22,5%·NF + 45%·NO + 20%·NJ, 45%·NF + 45%·NO + 20%·NJ)); els pesos sumen 110% i la nota es limita a 10. Aquí els pesos estan normalitzats a 100%.",
    evaluations: [
      { name: "Amb parcial", parts: [["Examen parcial de paper (NPP)", 20.45], ["Examen final (NF)", 20.45], ["Examen amb ordinador (NO)", 40.91], ["Joc (NJ)", 18.19]] },
      { name: "Sense parcial", parts: [["Examen final (NF)", 40.91], ["Examen amb ordinador (NO)", 40.91], ["Joc (NJ)", 18.18]] }
    ]
  },
  {
    code: "PE",
    name: "Probabilitat i Estadística",
    ects: 6,
    groups: ["Obligatòria"],
    q: 3,
    checked: "2026-10-10",
    approx: true,
    note: "Nota del curs = màx(AC, EF); AC = (3·NB.A + 3·NB.B + 3·NB.C + 3·NB.D + 2·NB.T)/14 i EF = màx(ef, (12·ef + 2·NB.T)/14). Cada NB.i = mín(10, PB.i·SB.i), amb SB.i factor de seguiment (1 + bonificacions).",
    evaluations: [
      { name: "Avaluació continuada (AC)", parts: [["Bloc A", 21.43], ["Bloc B", 21.43], ["Bloc C", 21.43], ["Bloc D", 21.43], ["Bloc transversal T", 14.28]] },
      { name: "Examen final (EF)", parts: [["Examen final (ef)", 85.71], ["Bloc transversal T", 14.29]] }
    ]
  },
  {
    code: "SO",
    name: "Sistemes Operatius",
    ects: 6,
    groups: ["Obligatòria"],
    q: 3,
    checked: "2026-10-10",
    note: "Nota = màx(EF, 0,6·EF + 0,4·EC), amb EC = 35% CT + 10% ST + 30% CL + 25% SL. Per optar a EC cal assistir almenys al 80% de les sessions de laboratori.",
    evaluations: [
      { name: "Avaluació continuada", parts: [["Examen final (EF)", 60], ["Parcial de processos (CT)", 14], ["Tests de teoria (ST)", 4], ["Exercici de laboratori (CL)", 12], ["Seguiment de laboratori (SL)", 10]] },
      { name: "Només examen final", parts: [["Examen final (EF)", 100]] }
    ]
  },
  {
    code: "AC",
    name: "Arquitectura de Computadors",
    ects: 6,
    groups: ["Obligatòria"],
    q: 4,
    checked: "2026-10-09",
    note: "La nota final s'arrodoneix a un decimal. El laboratori (LAB) i les activitats de problemes (AP) només s'avaluen si assisteixes a les classes del teu grup.",
    evaluations: [
      { name: "Avaluació", parts: [["C1 (control 1)", 30], ["C2 (control 2)", 40], ["LAB (laboratori)", 20], ["AP (activitat de problemes)", 10]] }
    ]
  },
  {
    code: "EEE",
    name: "Empresa i Entorn Econòmic",
    ects: 6,
    groups: ["Obligatòria"],
    q: 4,
    checked: "2026-10-09",
    note: "La guia només dona la fórmula de la nota d'avaluació contínua (mitjana de les 6 PEC) i no explicita com es calcula la nota final. Lliurar una pràctica tard resta 1 punt a la PEC corresponent.",
    evaluations: [
      { name: "Avaluació contínua", parts: [["PEC1", 16.67], ["PEC2", 16.67], ["PEC3", 16.67], ["PEC4", 16.67], ["PEC5", 16.67], ["PEC6", 16.65]] }
    ]
  },
  {
    code: "IDI",
    name: "Interacció i Disseny d'Interfícies",
    ects: 6,
    groups: ["Obligatòria"],
    q: 4,
    checked: "2026-10-09",
    note: "Hi ha un bonus opcional pels exercicis de laboratori (fins a +1 punt, amb ProvaLab ≥ 4,5). No s'inclou al càlcul perquè la guia no concreta com s'aplica a la nota.",
    evaluations: [
      { name: "Avaluació", parts: [["ProvaLab", 25], ["Prova Teo1", 25], ["Prova Teo2", 50]] }
    ]
  },
  {
    code: "IES",
    name: "Introducció a l'Enginyeria del Software",
    ects: 6,
    groups: ["Obligatòria"],
    q: 4,
    checked: "2026-10-10",
    note: "No hi ha examen final. Si no et presentes a la FHC2 i la nota acumulada és <4, la nota final és NP.",
    evaluations: [
      { name: "Avaluació", parts: [["FHC1 (examen fora d'horari de classe 1)", 40], ["C1 (control a classe)", 15], ["FHC2 (examen fora d'horari de classe 2)", 40], ["Participació", 5]] }
    ]
  },
  {
    code: "XC",
    name: "Xarxes de Computadors",
    ects: 6,
    groups: ["Obligatòria"],
    q: 4,
    checked: "2026-10-09",
    approx: true,
    note: "Fórmula oficial: NF = 0,3·NL + 0,7·NT, amb NL = 0,4·CL + 0,6·EL i NT = 0,3·màx(C1, EF) + 0,7·EF. Els pesos són aproximats: si l'examen final (EF) és millor que el control (C1), el C1 no compta i l'EF pesa un 70 %. Els minicontrols (CL) exigeixen lliurar l'informe en entrar al laboratori, si no valen 0.",
    evaluations: [
      { name: "Avaluació", parts: [["CL (minicontrols de lab)", 12], ["EL (examen final de lab)", 18], ["C1 (control de teoria)", 21], ["EF (examen final de teoria)", 49]] }
    ]
  },
  {
    code: "PAR",
    name: "Paral·lelisme",
    ects: 6,
    groups: ["Obligatòria"],
    q: 5,
    checked: "2026-10-10",
    approx: true,
    note: "Nota = 0.65·(0.5·màx(P,FP1)+0.5·FP2)+0.35·NL, on NL=màx(SL,FL) si FL>4 (si no, 0.35·SL+0.65·FL); el parcial P només substitueix FP1 si P≥5 i és millor. Si N≥5 i FP2≥5, s'aplica un bonus multiplicatiu (1+AA/100) per les activitats d'Atenea, i lliurar tots els informes SL és condició per aprovar.",
    evaluations: [
      { name: "Avaluació", parts: [["FP1 (examen final teoria, temes 1-3)", 32.5], ["FP2 (examen final teoria, temes 4-5)", 32.5], ["Laboratori (NL: informes SL i examen FL)", 35]] }
    ]
  },
  {
    code: "PROP",
    name: "Projectes de Programació",
    ects: 6,
    groups: ["Obligatòria"],
    q: 5,
    checked: "2026-10-10",
    approx: true,
    note: "Nota projecte = (0.40·Entrega1+0.15·Entrega2+0.45·Entrega3)·FT, on FT (0 a 1) és el factor de treball individual publicat amb les notes de la tercera entrega.",
    evaluations: [
      { name: "Avaluació", parts: [["Entrega 1", 40], ["Entrega 2", 15], ["Entrega 3", 45]] }
    ]
  },
  {
    code: "A",
    name: "Algorísmia",
    ects: 6,
    groups: ["Computació"],
    checked: "2026-10-10",
    approx: true,
    note: "Nota final = 0.75·màx(0.5·M+0.5·F, F)+0.15·E+0.1·A; si F supera la mitjana de M i F, l'examen final val el 75% sol.",
    evaluations: [
      { name: "Avaluació", parts: [["M (examen parcial)", 37.5], ["F (examen final)", 37.5], ["E (lliurament i correcció de problemes)", 15], ["A (resolució de problemes algorísmics)", 10]] }
    ]
  },
  {
    code: "AA",
    name: "Ampliació d'Algorísmia",
    ects: 6,
    groups: ["Computació"],
    checked: "2026-10-10",
    approx: true,
    note: "Nota contínua = 0.2·A+0.4·P1+0.4·P2. Sense final, NF=contínua; amb final, NF=màx{ExF, (Contínua+ExF)/2}, de manera que l'examen final pot valer el 100% si et beneficia.",
    evaluations: [
      { name: "Només avaluació contínua (sense examen final)", parts: [["A (problemes, lliuraments i presentacions)", 20], ["P1 (parcial 1)", 40], ["P2 (parcial 2)", 40]] },
      { name: "Amb examen final", parts: [["ExF (examen final)", 50], ["A (problemes, lliuraments i presentacions)", 10], ["P1 (parcial 1)", 20], ["P2 (parcial 2)", 20]] }
    ]
  },
  {
    code: "APA",
    name: "Aprenentatge Automàtic",
    ects: 6,
    groups: ["Computació"],
    checked: "2026-10-10",
    approx: true,
    note: "Nota final = màx(NF1, NF2), amb NF1=50%·NProbs+40%·NPract+10%·NPart i NF2=40%·NExF+20%·NProbs+30%·NPract+10%·NCom. La pàgina no defineix NPart i només usa NCom a NF2.",
    evaluations: [
      { name: "NF1 (ruta contínua, sense examen final)", parts: [["NProbs (mitjana de problemes)", 50], ["NPract (pràctica)", 40], ["NPart", 10]] },
      { name: "NF2 (ruta amb examen final)", parts: [["NExF (examen final)", 40], ["NProbs (mitjana de problemes)", 20], ["NPract (pràctica)", 30], ["NCom (competència transversal)", 10]] }
    ]
  },
  {
    code: "CAIM",
    name: "Cerca i Anàlisi d'Informació Massiva",
    ects: 6,
    groups: ["Computació", "Sistemes d'Informació"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["L (mitjana de dues proves de laboratori)", 20], ["P1 (primer examen parcial)", 40], ["P2 (segon examen parcial)", 40]] }
    ]
  },
  {
    code: "CL",
    name: "Compiladors",
    ects: 6,
    groups: ["Computació"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["L1 (prova de laboratori individual)", 20], ["L2 (prova de laboratori en grup)", 35], ["T (examen escrit de teoria)", 45]] }
    ]
  },
  {
    code: "CN",
    name: "Computació Numèrica",
    ects: 6,
    groups: ["Computació"],
    checked: "2026-10-10",
    note: "Avaluació única: un sol examen de teoria, problemes i pràctiques (Matlab); la web no en dóna ponderacions internes.",
    evaluations: [
      { name: "Avaluació contínua", parts: [["Pràctiques (PRAC)", 30], ["Teoria (TEO)", 30], ["Problemes (PROBS)", 40]] },
      { name: "Avaluació única", parts: [["Examen final", 100]] }
    ]
  },
  {
    code: "G",
    name: "Gràfics",
    ects: 6,
    groups: ["Computació"],
    checked: "2026-10-10",
    approx: true,
    note: "Nota global = màx(0.5·E, 0.4·E+0.1·AA)+0.25·C1+0.25·C2; AA només compta si és superior a E, en cas contrari l'examen final val el 50%.",
    evaluations: [
      { name: "Avaluació", parts: [["E (examen final)", 40], ["AA (qüestionaris d'Atenea)", 10], ["C1 (control de laboratori 1)", 25], ["C2 (control de laboratori 2)", 25]] }
    ]
  },
  {
    code: "IA",
    name: "Intel·ligència Artificial",
    ects: 6,
    groups: ["Computació"],
    checked: "2026-10-10",
    approx: true,
    note: "Nota = màx(0.25·NP+0.35·NF, 0.6·NF)+0.3·NL+0.1·NI; el parcial no és alliberador i, si la combinació no et beneficia, l'examen final val el 60%.",
    evaluations: [
      { name: "Avaluació", parts: [["NP (examen parcial)", 25], ["NF (examen final)", 35], ["NL (laboratori)", 30], ["NI (treball d'innovació)", 10]] }
    ]
  },
  {
    code: "IO",
    name: "Investigació Operativa",
    ects: 6,
    groups: ["Computació", "Sistemes d'Informació"],
    checked: "2026-10-10",
    approx: true,
    note: "Oficial: N = 0,45*NT + 0,2*NL + 0,25*NTC + 0,1*NC, amb NT = max(examen final, 0,5*Parcial1 + 0,5*Parcial2). NL és la mitjana de dues pràctiques (50% cadascuna).",
    evaluations: [
      { name: "Avaluació", parts: [["Teoria (NT)", 45], ["Laboratori (NL)", 20], ["Treball de curs (NTC)", 25], ["Competències transversals (NC)", 10]] }
    ]
  },
  {
    code: "LI",
    name: "Lògica a la Informàtica",
    ects: 6,
    groups: ["Computació"],
    checked: "2026-10-10",
    note: "Teoria 60% (mitjana de T1 i T2) i laboratori 40% (mitjana de dos exàmens); T1 compta la millor nota entre parcial i final. La pàgina no dona una fórmula explícita, només aquests pesos.",
    evaluations: [
      { name: "Avaluació", parts: [["Teoria T1 (parcial o final)", 30], ["Teoria T2 (examen final)", 30], ["Examen de laboratori 1", 20], ["Examen de laboratori 2", 20]] }
    ]
  },
  {
    code: "LP",
    name: "Llenguatges de Programació",
    ects: 6,
    groups: ["Computació"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["F (examen final)", 50], ["P1 (examen parcial de Haskell)", 25], ["P2 (pràctica)", 25]] }
    ]
  },
  {
    code: "SID",
    name: "Sistemes Intel·ligents Distribuïts",
    ects: 6,
    groups: ["Computació"],
    checked: "2026-10-10",
    approx: true,
    note: "Oficial: Teoria = [max(Parcial, 1a part examen final) + 2a part examen final]/2. La teoria compta 50%, exercicis pràctics 20% i laboratori 30%.",
    evaluations: [
      { name: "Avaluació", parts: [["Teoria", 50], ["Exercicis pràctics", 20], ["Laboratori (codi i informe)", 30]] }
    ]
  },
  {
    code: "TC",
    name: "Teoria de la Computació",
    ects: 6,
    groups: ["Computació"],
    checked: "2026-10-10",
    approx: true,
    note: "Contínua C = 0.4·P1+0.4·P2+0.2·pissarra. Sense final, NF=C; amb final, NF=màx{F, 0.5·F+0.5·C}, de manera que l'examen final pot valer el 100% si et beneficia.",
    evaluations: [
      { name: "Només avaluació contínua (sense examen final)", parts: [["Parcial 1", 40], ["Parcial 2", 40], ["Presentacions de problemes a la pissarra", 20]] },
      { name: "Amb examen final", parts: [["Examen final", 50], ["Parcial 1", 20], ["Parcial 2", 20], ["Presentacions de problemes a la pissarra", 10]] }
    ]
  },
  {
    code: "AC2",
    name: "Arquitectura de Computadors II",
    ects: 6,
    groups: ["Enginyeria de Computadors"],
    checked: "2026-10-10",
    approx: true,
    note: "Oficial: NF = 0,2*L + max[0,8*F, 0,65*F + 0,15*P]. Si el parcial no et beneficia, l'examen final val 80%.",
    evaluations: [
      { name: "Avaluació", parts: [["Laboratori (L)", 20], ["Examen final (F)", 65], ["Prova parcial (P)", 15]] }
    ]
  },
  {
    code: "CASO",
    name: "Conceptes Avançats de Sistemes Operatius",
    ects: 6,
    groups: ["Enginyeria de Computadors", "Tecnologies de la informació"],
    checked: "2026-10-10",
    approx: true,
    note: "La web no dóna fórmula oficial, només percentatges: autonomia 10%, teoria 40%, examen de laboratori 50%. Si fas l'examen final, la teoria és el màxim entre el final i la mitjana ponderada dels tres controls.",
    evaluations: [
      { name: "Avaluació", parts: [["Control de teoria 1", 10], ["Control de teoria 2", 10], ["Control de teoria 3", 20], ["Examen de laboratori", 50], ["Aprenentatge autònom", 10]] }
    ]
  },
  {
    code: "CPD",
    name: "Centres de Processament de Dades",
    ects: 6,
    groups: ["Enginyeria de Computadors", "Tecnologies de la informació"],
    checked: "2026-10-10",
    approx: true,
    note: "La web no dóna fórmula oficial: indica competències tècniques 80% (60% projecte de disseny, 40% activitats de classe) i transversals 20%; pesos derivats. No hi ha examen final.",
    evaluations: [
      { name: "Avaluació", parts: [["Projecte de disseny de CPD", 48], ["Activitats de classe", 32], ["Competències transversals", 20]] }
    ]
  },
  {
    code: "DSBM",
    name: "Disseny de Sistemes Basats en Microcomputadors",
    ects: 6,
    groups: ["Enginyeria de Computadors"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["Control de teoria 1 (CT1)", 10], ["Control de teoria 2 (CT2)", 10], ["Control de teoria 3 (CT3)", 10], ["Control de teoria 4 (CT4)", 10], ["Pràctiques de laboratori (PL)", 40], ["Treball final (TF)", 20]] }
    ]
  },
  {
    code: "MP",
    name: "Multiprocessadors",
    ects: 6,
    groups: ["Enginyeria de Computadors"],
    checked: "2026-10-10",
    approx: true,
    note: "Oficial: NF = max(0,8*F, 0,65*F + 0,15*P) + 0,2*L. Si el parcial no et beneficia, l'examen final val 80%.",
    evaluations: [
      { name: "Avaluació", parts: [["Laboratori (L)", 20], ["Examen final (F)", 65], ["Prova parcial (P)", 15]] }
    ]
  },
  {
    code: "PAP",
    name: "Programació i Arquitectures Paral·leles",
    ects: 6,
    groups: ["Enginyeria de Computadors"],
    checked: "2026-10-10",
    note: "Oficial: F = T*0,4 + L*0,4 + A*0,2, amb T = mitjana del control (50%) i l'examen final (50%).",
    evaluations: [
      { name: "Avaluació", parts: [["Control parcial (teoria)", 20], ["Examen final (teoria)", 20], ["Laboratori (L)", 40], ["Autonomia i motivació (A)", 20]] }
    ]
  },
  {
    code: "PCA",
    name: "Programació Conscient de l'Arquitectura",
    ects: 6,
    groups: ["Enginyeria de Computadors"],
    checked: "2026-10-10",
    approx: true,
    note: "Oficial: Nota = MIN(0,5*NEx + 0,1*P + 0,4*L + cha, 10), amb C = 0,35*C1 + 0,65*C2, NEx = max(C,F) si C>=5. El repte (cha) suma fins a 1 punt només si C>=5.",
    evaluations: [
      { name: "Avaluació contínua (C>=5)", parts: [["Control 1 (C1)", 17.5], ["Control 2 (C2)", 32.5], ["Problemes (P)", 10], ["Laboratori (L)", 40]] },
      { name: "Via examen final", parts: [["Control 1 (C1)", 4.38], ["Control 2 (C2)", 8.12], ["Examen final (F)", 37.5], ["Problemes (P)", 10], ["Laboratori (L)", 40]] }
    ]
  },
  {
    code: "PDS",
    name: "Processament Digital del Senyal",
    ects: 6,
    groups: ["Enginyeria de Computadors"],
    checked: "2026-10-10",
    note: "Sense examen. Cal realitzar i presentar adequadament les pràctiques de laboratori per aprovar.",
    evaluations: [
      { name: "Avaluació", parts: [["Projecte en grup", 45], ["Activitats de competència transversal (ACT)", 5], ["Pràctiques de laboratori", 50]] }
    ]
  },
  {
    code: "PEC",
    name: "Projecte d'Enginyeria de Computadors",
    ects: 6,
    groups: ["Enginyeria de Computadors"],
    checked: "2026-10-10",
    note: "Dos esquemes segons el quadrimestre (Q1: sistema encastat; Q2: implementació d'un processador).",
    evaluations: [
      { name: "Q1: sistema encastat", parts: [["NP1 (fase d'especificació)", 20], ["NP2 (implementació i integració)", 40], ["NP3 (resultats vs especificacions)", 40]] },
      { name: "Q2: processador", parts: [["NP1 (fase d'aprenentatge d'eines)", 5], ["NP2 (implementació del processador)", 75], ["NP3 (millores)", 20]] }
    ]
  },
  {
    code: "SO2",
    name: "Sistemes Operatius II",
    ects: 6,
    groups: ["Enginyeria de Computadors"],
    checked: "2026-10-10",
    approx: true,
    note: "Oficial: Nota = (CT + CTr)*(10/11), amb CT = max(CTc, CTf) i CTr sobre 1 punt; pesos linealitzats sobre 100. L'examen final només és per a qui no supera l'avaluació contínua.",
    evaluations: [
      { name: "Avaluació contínua", parts: [["Control de teoria 1 (T1)", 22.73], ["Control de teoria 2 (T2)", 22.73], ["Control de laboratori (L1)", 18.18], ["Seguiment de laboratori (S)", 4.55], ["Projecte (P)", 22.72], ["Competència transversal (CTr)", 9.09]] },
      { name: "Examen final", parts: [["Examen de teoria (T)", 45.46], ["Examen de laboratori (L)", 45.45], ["Competència transversal (CTr)", 9.09]] }
    ]
  },
  {
    code: "STR",
    name: "Sistemes de Temps Real",
    ects: 6,
    groups: ["Enginyeria de Computadors"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["Control de teoria 1 (CT1)", 20], ["Control de teoria 2 (CT2)", 20], ["Problemes", 10], ["Pràctiques", 25], ["Miniprojecte", 25]] }
    ]
  },
  {
    code: "VLSI",
    name: "VLSI",
    ects: 6,
    groups: ["Enginyeria de Computadors"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["Laboratori", 40], ["Presentació individual", 60]] }
    ]
  },
  {
    code: "XC2",
    name: "Xarxes de Computadors II",
    ects: 6,
    groups: ["Enginyeria de Computadors"],
    checked: "2026-10-10",
    note: "Oficial: NF = 0,6*Teoria + 0,25*Lab + 0,15*AC amb Teoria = 0,5*C1 + 0,5*C2. Qui ha fet els dos controls i no aprova pot fer l'examen final (EF) per millorar la teoria.",
    evaluations: [
      { name: "Avaluació contínua", parts: [["Control de teoria 1 (C1)", 30], ["Control de teoria 2 (C2)", 30], ["Laboratori", 25], ["Activitat complementària (AC)", 15]] },
      { name: "Amb examen final", parts: [["Examen final (EF)", 60], ["Laboratori", 25], ["Activitat complementària (AC)", 15]] }
    ]
  },
  {
    code: "AS",
    name: "Arquitectura del Software",
    ects: 6,
    groups: ["Enginyeria del Software"],
    checked: "2026-10-10",
    approx: true,
    note: "NF = 0,15*C1+0,35*C2+0,35*C3+0,1*NT+NPP, on NPP val com a màxim 0,5 punts (cal entregar el 75% dels problemes i participar a classe). NT és la suma de les 4 millors notes entre 4.",
    evaluations: [
      { name: "Avaluació", parts: [["Control 1 (C1)", 15], ["Control 2 (C2)", 35], ["Control 3 (C3)", 35], ["Tasques i qüestionaris (NT)", 10], ["Problemes i participació (NPP)", 5]] }
    ]
  },
  {
    code: "ASW",
    name: "Aplicacions i Serveis Web",
    ects: 6,
    groups: ["Enginyeria del Software"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["Control 1 (C1)", 10], ["Control 2 (C2)", 10], ["Qüestionaris (NQ)", 10], ["Presentació 1 (P1)", 10], ["Presentació 2 (P2)", 10], ["IntroLAB", 15], ["Projecte web", 35]] }
    ]
  },
  {
    code: "CAP",
    name: "Conceptes Avançats de Programació",
    ects: 6,
    groups: ["Enginyeria del Software"],
    checked: "2026-10-10",
    approx: true,
    note: "Nota = 0,8*Teoria+0,2*L, amb Teoria = MAX(F,(P+F)/2). Si F supera la mitjana, l'examen final pesa 80% i el parcial 0%.",
    evaluations: [
      { name: "Avaluació", parts: [["Examen parcial (P)", 40], ["Examen final (F)", 40], ["Laboratori (L)", 20]] }
    ]
  },
  {
    code: "CBDE",
    name: "Conceptes per a Bases de Dades Especialitzades",
    ects: 6,
    groups: ["Enginyeria del Software"],
    checked: "2026-10-10",
    approx: true,
    note: "Nota final = 70%*min(10,P)+20%*EX+10%*C. P és una mitjana ponderada de qüestionaris i laboratoris que pot superar 10 i es limita a 10.",
    evaluations: [
      { name: "Avaluació", parts: [["Treball de curs (P: qüestionaris i sessions de laboratori)", 70], ["Examen final (EX)", 20], ["Avaluació entre parelles (C)", 10]] }
    ]
  },
  {
    code: "CSI",
    name: "Conceptes de Sistemes d'Informació",
    ects: 6,
    groups: ["Enginyeria del Software"],
    checked: "2026-10-10",
    note: "Nota final = (LAB+T)/2. Si es lliura >=80% dels lliuraments de problemes, T=AC; altrament cal examen final i T=0,6*E+0,4*AC.",
    evaluations: [
      { name: "Avaluació contínua (>=80% de lliuraments)", parts: [["Projecte de laboratori (LAB)", 50], ["Lliuraments de problemes (AC)", 50]] },
      { name: "Amb examen final (<80% de lliuraments)", parts: [["Projecte de laboratori (LAB)", 50], ["Examen final (E)", 30], ["Lliuraments de problemes (AC)", 20]] }
    ]
  },
  {
    code: "DBD",
    name: "Disseny de Bases de Dades",
    ects: 6,
    groups: ["Enginyeria del Software"],
    checked: "2026-10-10",
    approx: true,
    note: "Nota final = min(10; Bonus*(30%ExP+30%ExF+40%L)), amb Bonus = 1+P/100 (entre 1 i 1,1), on P és la nota de problemes i qüestionaris. Els pesos són aproximats perquè no inclouen el bonus.",
    evaluations: [
      { name: "Avaluació", parts: [["Examen parcial (ExP)", 30], ["Examen final (ExF)", 30], ["Laboratori (L)", 40]] }
    ]
  },
  {
    code: "ECSDI",
    name: "Enginyeria del Coneixement i Sistemes Distribuïts Intel·ligents",
    ects: 6,
    groups: ["Enginyeria del Software"],
    checked: "2026-10-10",
    approx: true,
    note: "NOTA = max(NP*0,25+NF*0,25 ; NP*0,15+NF*0,35)+NL*0,45+Nota Competència. La pàgina no indica el rang de la nota de competència (rúbrica a l'inici de curs); el 5% és un valor de referència. Si NF>NP, l'examen final pesa 35% i el parcial 15%.",
    evaluations: [
      { name: "Avaluació", parts: [["Examen parcial (NP)", 25], ["Examen final (NF)", 25], ["Laboratori (NL)", 45], ["Nota de competència", 5]] }
    ]
  },
  {
    code: "ER",
    name: "Enginyeria de Requisits",
    ects: 6,
    groups: ["Enginyeria del Software", "Sistemes d'Informació"],
    checked: "2026-10-10",
    approx: true,
    note: "Pesos oficials: 50% projecte, 20% qüestionaris i exercicis, 30% mitjana de dos parcials. Condicions: assistència al 80% de les classes de laboratori (si no, el projecte val 0) i entregar mínim el 70% dels qüestionaris i exercicis.",
    evaluations: [
      { name: "Avaluació", parts: [["Projecte", 50], ["Qüestionaris i exercicis individuals", 20], ["Examen parcial 1", 15], ["Examen parcial 2", 15]] }
    ]
  },
  {
    code: "GPS",
    name: "Gestió de Projectes de Software",
    ects: 6,
    groups: ["Enginyeria del Software"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["Projecte 1 (P1)", 30], ["Projecte 2 (P2)", 30], ["Qüestionaris de teoria (NQ)", 20], ["Control final (CF)", 20]] }
    ]
  },
  {
    code: "PES",
    name: "Projecte d'Enginyeria del Software",
    ects: 6,
    groups: ["Enginyeria del Software"],
    checked: "2026-10-10",
    approx: true,
    note: "Nfinal = Nequip*FactIndiv; Nequip=(0,6*Artefactes+0,2*GestióProjecte+0,2*(Docum+Presentacions))*Ambició. Ambició i FactIndiv són multiplicadors (0,8 a 1,2) fixats pel professorat, sense superar 10.",
    evaluations: [
      { name: "Avaluació", parts: [["Artefactes", 60], ["Gestió del projecte", 20], ["Documentació i presentacions", 20]] }
    ]
  },
  {
    code: "SIM",
    name: "Simulació",
    ects: 6,
    groups: ["Enginyeria del Software"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["Estudi de simulació", 60], ["Examen", 40]] }
    ]
  },
  {
    code: "SOAD",
    name: "Sistemes Operatius per a Aplicacions Distribuïdes",
    ects: 6,
    groups: ["Enginyeria del Software"],
    checked: "2026-10-10",
    note: "Competència transversal (sostenibilitat i compromís social) no apareix a la fórmula oficial.",
    evaluations: [
      { name: "Avaluació", parts: [["Laboratori (NL)", 20], ["Teoria: cas pràctic individual (NT)", 40], ["Presentació final (projecte en grup)", 40]] }
    ]
  },
  {
    code: "ABD",
    name: "Administració de Bases de Dades",
    ects: 6,
    groups: ["Sistemes d'Informació"],
    checked: "2026-10-10",
    note: "La via 30% L + 50% E + 20% P requereix presencialitat; l'alternativa és 100% examen final.",
    evaluations: [
      { name: "Presencial (L + E + P)", parts: [["Laboratori (mitjana de les millors 11 proves)", 30], ["Examen final", 50], ["Problemes (mitjana dels 11 millors lliuraments)", 20]] },
      { name: "Només examen final", parts: [["Examen final", 100]] }
    ]
  },
  {
    code: "ADEI",
    name: "Anàlisi de Dades i Explotació de la Informació",
    ects: 6,
    groups: ["Sistemes d'Informació"],
    checked: "2026-10-10",
    note: "Cal presentar-se als 2 exàmens de T i obtenir una mitjana mínima de 3; la presentació és obligatòria.",
    evaluations: [
      { name: "Avaluació", parts: [["Coneixements (T)", 30], ["Habilitats: pràctiques (L)", 30], ["Presentació de l'estudi de cas (P)", 40]] }
    ]
  },
  {
    code: "DSI",
    name: "Disseny de Sistemes d'Informació",
    ects: 6,
    groups: ["Sistemes d'Informació"],
    checked: "2026-10-10",
    note: "NQE exigeix lliurar almenys el 80% dels treballs i fer el qüestionari final (sinó 0); NP és 0 si l'assistència és inferior al 70%.",
    evaluations: [
      { name: "Avaluació", parts: [["Qüestionaris i exercicis (NQE)", 35], ["Cas d'estudi del curs (NCE)", 25], ["Treballs de recerca d'informació (NTR)", 30], ["Participació (NP)", 10]] }
    ]
  },
  {
    code: "EDO",
    name: "Estratègia Digital a Les Organitzacions",
    ects: 6,
    groups: ["Sistemes d'Informació"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["Temes preparats i presentats (P)", 10], ["Tests dels temes (T)", 10], ["Exercicis en grup dels 4 casos (C)", 80]] }
    ]
  },
  {
    code: "MI",
    name: "Màrqueting a Internet",
    ects: 6,
    groups: ["Sistemes d'Informació"],
    checked: "2026-10-10",
    note: "La pàgina no detalla els pesos dels lliuraments dins de NSeg.",
    evaluations: [
      { name: "Avaluació", parts: [["Avaluació contínua (NSeg)", 70], ["Pla de màrqueting digital final (NPMD)", 30]] }
    ]
  },
  {
    code: "NE",
    name: "Negoci Electrònic",
    ects: 6,
    groups: ["Sistemes d'Informació"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["Autoaprenentatge i participació (NSeg)", 20], ["Taller SCM", 12.5], ["Taller CRM", 12.5], ["Projecte e-Commerce", 30], ["Examen final", 25]] }
    ]
  },
  {
    code: "PSI",
    name: "Projecte de Sistemes d'Informació",
    ects: 6,
    groups: ["Sistemes d'Informació"],
    checked: "2026-10-10",
    note: "Pesos derivats de la fórmula oficial: Nota final = 0,9*NEquip + 0,1*NdesRol, amb NEquip = 70% NDoc + 20% NPres + 10% Ndes.",
    evaluations: [
      { name: "Avaluació", parts: [["Documentació (NDoc, equip)", 63], ["Presentacions (NPres, equip)", 18], ["Desenvolupament de l'equip (Ndes)", 9], ["Rol individual (NdesRol)", 10]] }
    ]
  },
  {
    code: "SIO",
    name: "Sistemes d'Informació per a Les Organitzacions",
    ects: 6,
    groups: ["Sistemes d'Informació"],
    checked: "2026-10-10",
    note: "No hem pogut llegir el mètode d'avaluació d'aquesta guia. Omple els apartats segons la guia del teu professor.",
    evaluations: []
  },
  {
    code: "VPE",
    name: "Viabilitat de Projectes Empresarials",
    ects: 6,
    groups: ["Sistemes d'Informació"],
    checked: "2026-10-10",
    approx: true,
    note: "Pesos en prosa, sense fórmula oficial. Cal que la mitjana dels dos tests sigui superior a 3,5 i una assistència mínima del 80% per presentar el pla.",
    evaluations: [
      { name: "Avaluació", parts: [["Test 1", 20], ["Test 2", 20], ["Pla de negoci i presentació final", 60]] }
    ]
  },
  {
    code: "AD",
    name: "Aplicacions Distribuïdes",
    ects: 6,
    groups: ["Tecnologies de la informació"],
    checked: "2026-10-10",
    approx: true,
    note: "Oficial: NF = MAX(0,3·EF1; 0,3·C1) + MAX(0,3·EF2; 0,3·C2) + 0,4·NL; cada part de teoria pren el màxim entre el control i la part corresponent de l'examen final. NL = 50% pràctiques + 50% informes i entrevistes.",
    evaluations: [
      { name: "Avaluació", parts: [["Control 1 (C1)", 30], ["Control 2 (C2)", 30], ["Pràctiques (mitjana amb rúbriques)", 20], ["Informes de pràctiques i entrevistes de laboratori", 20]] }
    ]
  },
  {
    code: "ASO",
    name: "Administració de Sistemes Operatius",
    ects: 6,
    groups: ["Tecnologies de la informació"],
    checked: "2026-10-10",
    approx: true,
    note: "Oficial: N_teoria = max(N_parcials, N_examen_final), amb N_parcials = 0,4*P1 + 0,6*P2 (només compta si és >= 3,5); l'examen final és opcional si N_parcials >= 5.",
    evaluations: [
      { name: "Amb parcials", parts: [["Parcial 1", 18], ["Parcial 2", 27], ["Examen de laboratori (pràctica)", 50], ["Seguiment (aprenentatge autònom)", 5]] },
      { name: "Amb examen final", parts: [["Examen final (teoria)", 45], ["Examen de laboratori (pràctica)", 50], ["Seguiment (aprenentatge autònom)", 5]] }
    ]
  },
  {
    code: "DA",
    name: "Detecció d'Amenaces",
    ects: 6,
    groups: ["Tecnologies de la informació"],
    checked: "2026-10-10",
    approx: true,
    note: "Oficial: N_teoria = max(N_parcials, N_examen_final) amb N_parcials = 0,4·P1 + 0,6·P2 (compta sempre que sigui >= 3,5); N_final = 0,45·teoria + 0,5·pràctica + 0,05·seguiment.",
    evaluations: [
      { name: "Amb parcials", parts: [["Parcial 1", 18], ["Parcial 2", 27], ["Pràctica", 50], ["Seguiment", 5]] },
      { name: "Amb examen final", parts: [["Examen final", 45], ["Pràctica", 50], ["Seguiment", 5]] }
    ]
  },
  {
    code: "IM",
    name: "Internet Mòbil",
    ects: 6,
    groups: ["Tecnologies de la informació"],
    checked: "2026-10-10",
    approx: true,
    note: "Fórmula de la pàgina (tipografia ambigua): Nota final = 0,7·MAX(Ef; 0,75·Ef + 0,25·Ep) + 3·Ec, amb Ec entre 0 i 1. Pesos linealitzats suposant el segon terme del màxim.",
    evaluations: [
      { name: "Avaluació", parts: [["Examen parcial (Ep)", 17.5], ["Examen final (Ef)", 52.5], ["Classes de cas (Ec)", 30]] }
    ]
  },
  {
    code: "PI",
    name: "Protocols d'Internet",
    ects: 6,
    groups: ["Tecnologies de la informació"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["Laboratori (NL)", 20], ["Presentació oral o treball escrit (PO)", 10], ["Parcial C1 (temes 1 i 2)", 35], ["Parcial C2 (temes 3 a 5)", 35]] }
    ]
  },
  {
    code: "PTI",
    name: "Projecte de Tecnologies de la Informació",
    ects: 6,
    groups: ["Tecnologies de la informació"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["Pràctiques guiades (PG)", 25], ["Projecte (PR)", 60], ["Seguiment (SEG)", 15]] }
    ]
  },
  {
    code: "SDX",
    name: "Sistemes Distribuïts en Xarxa",
    ects: 6,
    groups: ["Tecnologies de la informació"],
    checked: "2026-10-10",
    approx: true,
    note: "Si la mitjana aritmètica de l'examen parcial (A o B1) i el final (B2) és inferior a 3,5, la nota final és només aquesta mitjana dels dos exàmens. Es fa servir B1 en lloc d'A si no s'ha aprovat el parcial (A < 5).",
    evaluations: [
      { name: "Parcial aprovat (A >= 5)", parts: [["Examen parcial (A)", 25], ["Examen final, part no parcial (B2)", 25], ["Informes de lectura i discussió d'articles (C)", 20], ["Seminaris de laboratori (D)", 30]] },
      { name: "Parcial no aprovat", parts: [["Examen final, part del parcial (B1)", 25], ["Examen final, part no parcial (B2)", 25], ["Informes de lectura i discussió d'articles (C)", 20], ["Seminaris de laboratori (D)", 30]] }
    ]
  },
  {
    code: "SI",
    name: "Seguretat Informàtica",
    ects: 6,
    groups: ["Tecnologies de la informació"],
    checked: "2026-10-10",
    note: "NF = 0,7·Teoria + 0,25·Lab + 0,05·CT, amb Teoria = 0,3·C1 + 0,7·C2 i Lab = 0,5·NQ + 0,5·EL. Pesos globals derivats d'aquestes fórmules.",
    evaluations: [
      { name: "Avaluació", parts: [["Control 1 (C1)", 21], ["Control 2 (C2)", 49], ["Lliuraments/qüestionaris de laboratori (NQ)", 12.5], ["Examen de laboratori (EL)", 12.5], ["Activitat de competència transversal (CT)", 5]] }
    ]
  },
  {
    code: "SOA",
    name: "Sistemes Operatius Avançats",
    ects: 6,
    groups: ["Tecnologies de la informació"],
    checked: "2026-10-10",
    approx: true,
    note: "Oficial: Nota = (CT + CTr)·(10/11), amb CT = max(CTc, CTf) i nota màxima de CTr = 1; CTf és l'examen final (T i L) per a qui no supera o renuncia a l'avaluació contínua. Pesos linealitzats; la pàgina no indica com es converteix el nivell A/B/C/D de CTr a nota numèrica.",
    evaluations: [
      { name: "Avaluació contínua", parts: [["Test 1 (T1)", 22.73], ["Test 2 (T2)", 22.73], ["Seguiment de laboratori (S)", 4.54], ["Projecte de laboratori (P)", 22.73], ["Exercici de comunicació entre processos (E)", 18.18], ["Competència transversal (CTr)", 9.09]] },
      { name: "Examen final", parts: [["Examen final de teoria (T)", 45.45], ["Examen final de laboratori (L)", 45.46], ["Competència transversal (CTr)", 9.09]] }
    ]
  },
  {
    code: "TCI",
    name: "Transmissió i Codificació de la Informació",
    ects: 6,
    groups: ["Tecnologies de la informació"],
    checked: "2026-10-10",
    approx: true,
    note: "La pàgina diu només que hi haurà dos exàmens parcials i que la nota de curs és la mitjana dels dos; també llista un treball i un examen final sense explicar com compten.",
    evaluations: [
      { name: "Avaluació", parts: [["Examen parcial 1", 50], ["Examen parcial 2", 50]] }
    ]
  },
  {
    code: "TXC",
    name: "Tecnologies de Xarxes de Computadors",
    ects: 6,
    groups: ["Tecnologies de la informació"],
    checked: "2026-10-10",
    note: "NF = 0,30·LAB + 0,70·(CO1+CO2)/2. L'assistència a les classes de laboratori és obligatòria per ser avaluat.",
    evaluations: [
      { name: "Avaluació", parts: [["Laboratori (LAB)", 30], ["Control 1 (CO1)", 35], ["Control 2 (CO2)", 35]] }
    ]
  },
  {
    code: "APC",
    name: "Arquitectura del PC",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    note: "La pàgina dona els pesos però no una fórmula explícita. No lliurar el treball o no fer la presentació pública suposa un 0 a la nota B.",
    evaluations: [
      { name: "Avaluació", parts: [["Examen no presencial (A)", 20], ["Projecte de curs i presentació pública (B)", 40], ["Pràctica a les Jornadas Reutilitza (C)", 10], ["Treball personal o en grup a classe (D)", 30]] }
    ]
  },
  {
    code: "APSS",
    name: "Habilitats Acadèmiques i Professionals d'Expressió Oral en Anglès",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    approx: true,
    note: "La mitjana aritmètica dels exàmens ha de ser com a mínim 3,5; si no, les altres proves no compten i la nota és la mitjana ponderada dels exàmens. Sense participació si s'assisteix a menys del 50% de les sessions.",
    evaluations: [
      { name: "Avaluació", parts: [["Examen parcial", 25], ["Participació a classe", 10], ["Presentació oral", 20], ["Activitat d'interacció oral", 20], ["Examen final", 25]] }
    ]
  },
  {
    code: "ASDP",
    name: "Habilitats Acadèmiques Pel Desenvolupament de Projectes en Anglès",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    approx: true,
    note: "La mitjana aritmètica dels exàmens ha de ser com a mínim 3,5; si no, les altres proves no compten i la nota és la mitjana ponderada dels exàmens. Sense participació si s'assisteix a menys del 50% de les sessions.",
    evaluations: [
      { name: "Avaluació", parts: [["Treballs de curs", 15], ["Projecte de curs (document escrit i presentació oral)", 25], ["Examen parcial 1", 25], ["Participació a classe", 10], ["Examen parcial 2", 25]] }
    ]
  },
  {
    code: "ASMI",
    name: "Aspectes Socials i Mediambientals de la Informàtica",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    approx: true,
    note: "Oficial: Nota final = AC (si s'ha lliurat almenys el 75% dels lliuraments) o Nota final = max(EF, 0,5·EF + 0,5·AC) per a qui no segueix l'avaluació contínua. Pesos de l'alternativa linealitzats.",
    evaluations: [
      { name: "Avaluació contínua", parts: [["Bloc d'història de la informàtica", 30], ["Bloc d'aspectes socials, mediambientals i legals", 30], ["Lliuraments d'ètica", 30], ["Participació activa a classe", 10]] },
      { name: "Amb examen final", parts: [["Examen final (EF)", 50], ["Bloc d'història de la informàtica", 15], ["Bloc d'aspectes socials, mediambientals i legals", 15], ["Lliuraments d'ètica", 15], ["Participació activa a classe", 5]] }
    ]
  },
  {
    code: "C",
    name: "Criptografia",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    note: "Els dos tests es poden substituir per una prova final.",
    evaluations: [
      { name: "Avaluació", parts: [["Test de criptografia de clau secreta", 20], ["Test de criptografia de clau pública", 40], ["Laboratori", 40]] }
    ]
  },
  {
    code: "CCQ",
    name: "Computació i Criptografia Quàntiques",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    approx: true,
    note: "Nota final = màxim entre AC i F, on AC = 0,8*C + 0,2*E; C és la mitjana de 4 controls i E la mitjana dels exercicis. L'examen final és per a qui no supera l'avaluació contínua o vol pujar nota.",
    evaluations: [
      { name: "Avaluació contínua (AC)", parts: [["Controls (C)", 80], ["Exercicis per fer a casa (E)", 20]] },
      { name: "Examen final (F)", parts: [["Examen final (F)", 100]] }
    ]
  },
  {
    code: "CDI",
    name: "Compressió de Dades i Imatges",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["Problemes i qüestionaris", 50], ["Pràctica", 50]] }
    ]
  },
  {
    code: "DCS",
    name: "Disseny de Corbes i Superfícies",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["Pràctiques de laboratori", 50], ["Examen teoricopràctic final", 50]] }
    ]
  },
  {
    code: "EET",
    name: "Educació, Enginyeria i Tecnologia",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    note: "L'avaluació és per microcredencials i no té pesos percentuals. Omple els apartats segons la guia.",
    evaluations: []
  },
  {
    code: "FDM",
    name: "Física dels Dispositius de Memòria",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    note: "NF = 0,50*NT + 0,25*NSim + 0,10*NPrac + 0,15*NPro, amb NT = [max(Nparcial, NEx1) + NEx2]/2 (NEx1 i NEx2 són la 1a i 2a meitat de l'examen final).",
    evaluations: [
      { name: "Avaluació", parts: [["Exàmens (NT)", 50], ["Treball de simulació (NSim)", 25], ["Pràctiques de laboratori (NPrac)", 10], ["Problemes fets a classe (NPro)", 15]] }
    ]
  },
  {
    code: "FOMAR",
    name: "Física Orientada a la Modelització i l'Animació Realista",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    approx: true,
    note: "Nota curs = (Nota_ex + Nota_lab)/2; Nota_ex = 25% parcial + 75% final, però si el final és més alt que el parcial pesa 100%.",
    evaluations: [
      { name: "Avaluació", parts: [["Examen parcial", 12.5], ["Examen final", 37.5], ["Laboratori (projecte d'animació)", 50]] }
    ]
  },
  {
    code: "GCS",
    name: "Gestió de la Ciberseguretat",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-09",
    note: "Les pràctiques poden ser informes, presentacions orals i/o codi, segons el tema.",
    evaluations: [
      { name: "Avaluació", parts: [["Control de teoria 1", 25], ["Control de teoria 2", 25], ["Pràctica 1", 10], ["Pràctica 2", 10], ["Pràctica 3", 10], ["Pràctica 4", 10], ["Pràctica 5", 10]] }
    ]
  },
  {
    code: "GEOC",
    name: "Geometria Computacional",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["Problemes presentats a classe (P)", 20], ["Exposició final del tema triat (T)", 20], ["Exercicis de laboratori (L)", 35], ["Examen (E)", 25]] }
    ]
  },
  {
    code: "I2R3",
    name: "Introducció a la Recerca (3 ECTS)",
    ects: 3,
    groups: ["Optativa"],
    checked: "2026-10-10",
    note: "La guia diu que ambdues parts tenen igual pes; el coordinador pot modificar la nota segons la qualitat de la memòria.",
    evaluations: [
      { name: "Avaluació", parts: [["Desenvolupament del treball de recerca", 50], ["Qualitat de la memòria i presentació", 50]] }
    ]
  },
  {
    code: "I2R6",
    name: "Introducció a la Recerca (6 ECTS)",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    note: "La guia diu que ambdues parts tenen igual pes; el coordinador pot modificar la nota segons la qualitat de la memòria.",
    evaluations: [
      { name: "Avaluació", parts: [["Desenvolupament del treball de recerca", 50], ["Qualitat de la memòria i presentació", 50]] }
    ]
  },
  {
    code: "LDPE",
    name: "Lideratge i Desenvolupament Professional a l'Enginyeria",
    ects: 3,
    groups: ["Optativa"],
    checked: "2026-10-10",
    note: "No hi ha examen final; cal assistir almenys al 80% de les classes.",
    evaluations: [
      { name: "Avaluació contínua", parts: [["Presentació en grup i debat a classe", 50], ["Exercicis lliurats per ATENEA", 50]] }
    ]
  },
  {
    code: "MD",
    name: "Mineria de Dades",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["Laboratori (Labo)", 20], ["Pràctica 1 (modelització estadística)", 40], ["Pràctica 2 (problema triat)", 40]] }
    ]
  },
  {
    code: "PAE",
    name: "Projecte Aplicat d'Enginyeria",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["Proposta", 25], ["Seguiment", 25], ["Defensa", 50]] }
    ]
  },
  {
    code: "ROB",
    name: "Robòtica",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["Actitud", 10], ["MP1 (mini-projecte robots manipuladors)", 10], ["PG1 (projecte global robots manipuladors)", 20], ["ExParc1 (examen parcial robots manipuladors)", 15], ["MP2 (mini-projecte robots mòbils)", 10], ["PG2 (projecte global robots mòbils)", 20], ["ExParc2 (examen parcial robots mòbils)", 15]] }
    ]
  },
  {
    code: "SLDS",
    name: "Software Lliure i Desenvolupament Social",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    note: "La guia dona un sol pes (30%) per a presentació pública + projecte de programari, sense desglossar-lo; els noms dels exàmens ET/EP s'han deduït del context.",
    evaluations: [
      { name: "Avaluació", parts: [["Pràctiques de laboratori", 35], ["Presentació pública + Projecte de programari", 30], ["Examen de teoria", 17.5], ["Examen de pràctiques", 17.5]] }
    ]
  },
  {
    code: "TGA",
    name: "Targetes Gràfiques i Acceleradors",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    evaluations: [
      { name: "Avaluació", parts: [["Examen final (no presencial)", 50], ["Laboratori (seguiment i projecte)", 50]] }
    ]
  },
  {
    code: "VC",
    name: "Visió per Computador",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    note: "No hi ha examen final: NF = 0,7*NL + 0,3*NT, on NL és la nota de laboratori i NT la de teoria (exàmens parcials).",
    evaluations: [
      { name: "Avaluació contínua", parts: [["Nota de laboratori (NL)", 70], ["Nota de teoria (NT)", 30]] }
    ]
  },
  {
    code: "VJ",
    name: "Videojocs",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    note: "La guia dona els pesos però no una fórmula explícita.",
    evaluations: [
      { name: "Avaluació", parts: [["Lliurament individual del joc 2D", 35], ["Lliurament en equip del joc 3D", 35], ["Examen final", 30]] }
    ]
  },
  {
    code: "WSE",
    name: "Habilitats d'Expressió Escrita en Anglès per a l'Enginyeria",
    ects: 6,
    groups: ["Optativa"],
    checked: "2026-10-10",
    approx: true,
    note: "Si la mitjana aritmètica dels dos exàmens és inferior a 3,5, no es compten la resta de components i la nota final és la mitjana ponderada dels exàmens. Qui assisteix a menys del 50% de les sessions no rep nota de participació.",
    evaluations: [
      { name: "Avaluació", parts: [["Treballs pràctics", 20], ["Projecte de l'assignatura (amb document escrit)", 20], ["Participació a classe", 10], ["Examen parcial 1", 25], ["Examen parcial 2", 25]] }
    ]
  }
];
