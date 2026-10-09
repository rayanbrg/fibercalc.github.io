# FiberCalc

Calculadora de notes per a estudiants de la FIB (UPC). Web estàtica, sense passos de compilació: https://fibercalc.cat

## Estructura

| Fitxer | Què conté |
|---|---|
| `index.html` | Estructura de la pàgina i inici de Firebase (autenticació i núvol) |
| `styles.css` | Tots els estils (tema clar/fosc, mòbil, animacions) |
| `app.js` | Lògica de l'aplicació: assignatures, notes, estadístiques, calendari, amics |
| `plantilles-gei.js` | Plantilles d'avaluació del Grau en Enginyeria Informàtica (dades, fàcil d'ampliar) |
| `logo.svg`, `favicon-32.png`, `apple-touch-icon.png`, `logo-512.png` | Logo i icones |
| `privacitat.html` | Política de privacitat |

## Com treballar-hi

1. Crear una branca nova, fer els canvis i obrir una Pull Request.
2. En fer *merge* a `main`, GitHub Pages ho publica automàticament.

> **Memòria cau:** `index.html` carrega `styles.css?v=1`, `app.js?v=1` i `plantilles-gei.js?v=1`.
> Quan es canviï un d'aquests fitxers, convé pujar el número (`?v=2`...) perquè els navegadors el tornin a descarregar.
