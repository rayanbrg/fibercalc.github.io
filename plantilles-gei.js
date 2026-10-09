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
 *   checked      Data (AAAA-MM-DD) en què es va comprovar la guia
 *   approx       (opcional) true si els pesos són una aproximació de la fórmula oficial
 *   note         (opcional) Text curt que es mostra a l'usuari: bonus, condicions, matisos...
 *   evaluations  Una o més avaluacions (p. ex. "Continua" i "Final únic").
 *                Cada part és [nom, pes en %]. Els pesos d'una avaluació han de sumar 100.
 *
 * L'enllaç a la guia es genera sol: TEMPLATE_URL_BASE + code.
 */
window.FIBERCALC_TEMPLATE_URL_BASE = 'https://www.fib.upc.edu/ca/graus/grau-en-enginyeria-informatica/pla-destudis/assignatures/';

window.FIBERCALC_TEMPLATES = [
  {
    code: 'AC',
    name: 'Arquitectura de Computadors',
    ects: 6,
    checked: '2026-10-09',
    note: "La nota final s'arrodoneix a un decimal. El laboratori (LAB) i les activitats de problemes (AP) només s'avaluen si assisteixes a les classes del teu grup.",
    evaluations: [
      { name: 'Avaluació', parts: [['C1 (control 1)', 30], ['C2 (control 2)', 40], ['LAB (laboratori)', 20], ['AP (activitat de problemes)', 10]] }
    ]
  },
  {
    code: 'EEE',
    name: 'Empresa i Entorn Econòmic',
    ects: 6,
    checked: '2026-10-09',
    note: "La guia només dona la fórmula de la nota d'avaluació contínua (mitjana de les 6 PEC) i no explicita com es calcula la nota final. Lliurar una pràctica tard resta 1 punt a la PEC corresponent.",
    evaluations: [
      { name: 'Avaluació contínua', parts: [['PEC1', 16.67], ['PEC2', 16.67], ['PEC3', 16.67], ['PEC4', 16.67], ['PEC5', 16.67], ['PEC6', 16.65]] }
    ]
  },
  {
    code: 'GCS',
    name: 'Gestió de la Ciberseguretat',
    ects: 6,
    checked: '2026-10-09',
    note: "Les pràctiques poden ser informes, presentacions orals i/o codi, segons el tema.",
    evaluations: [
      { name: 'Avaluació', parts: [['Control de teoria 1', 25], ['Control de teoria 2', 25], ['Pràctica 1', 10], ['Pràctica 2', 10], ['Pràctica 3', 10], ['Pràctica 4', 10], ['Pràctica 5', 10]] }
    ]
  },
  {
    code: 'IDI',
    name: "Interacció i Disseny d'Interfícies",
    ects: 6,
    checked: '2026-10-09',
    note: "Hi ha un bonus opcional pels exercicis de laboratori (fins a +1 punt, amb ProvaLab ≥ 4,5). No s'inclou al càlcul perquè la guia no concreta com s'aplica a la nota.",
    evaluations: [
      { name: 'Avaluació', parts: [['ProvaLab', 25], ['Prova Teo1', 25], ['Prova Teo2', 50]] }
    ]
  },
  {
    code: 'XC',
    name: 'Xarxes de Computadors',
    ects: 6,
    checked: '2026-10-09',
    approx: true,
    note: "Fórmula oficial: NF = 0,3·NL + 0,7·NT, amb NL = 0,4·CL + 0,6·EL i NT = 0,3·màx(C1, EF) + 0,7·EF. Els pesos són aproximats: si l'examen final (EF) és millor que el control (C1), el C1 no compta i l'EF pesa un 70 %. Els minicontrols (CL) exigeixen lliurar l'informe en entrar al laboratori, si no valen 0.",
    evaluations: [
      { name: 'Avaluació', parts: [['CL (minicontrols de lab)', 12], ['EL (examen final de lab)', 18], ['C1 (control de teoria)', 21], ['EF (examen final de teoria)', 49]] }
    ]
  }
];
