# FiberCalc

Calculadora de notes per a estudiants de la FIB (UPC). Web estàtica, sense passos de compilació: https://fibercalc.cat

## Estructura

| Fitxer | Què conté |
|---|---|
| `index.html` | Estructura de la pàgina i inici de Firebase (autenticació i núvol) |
| `styles.css` | Tots els estils (tema clar/fosc, mòbil, animacions) |
| `app.js` | Lògica de l'aplicació: assignatures, notes, estadístiques, calendari, amics |
| `plantilles-gei.js` | Plantilles d'avaluació del Grau en Enginyeria Informàtica (dades, fàcil d'ampliar) |
| `horaris-gei.js` | Horaris oficials del GEI d'un quadrimestre (generat, no s'edita a mà) |
| `tools/horaris-gei.py` | Script que genera `horaris-gei.js` a partir de les dades de la FIB |
| `logo.svg`, `favicon-32.png`, `apple-touch-icon.png`, `logo-512.png` | Logo i icones |
| `privacitat.html` | Política de privacitat |

## Com treballar-hi

1. Crear una branca nova, fer els canvis i obrir una Pull Request.
2. En fer *merge* a `main`, GitHub Pages ho publica automàticament.

> **Memòria cau:** `index.html` carrega `styles.css`, `app.js`, `plantilles-gei.js` i `horaris-gei.js` (cadascun amb `?v=N`).
> Quan es canviï un d'aquests fitxers, convé pujar el número (`?v=2`...) perquè els navegadors el tornin a descarregar.

## Horaris (pestanya «Horari»)

Les dades vénen de l'API pública de la FIB i es guarden al repositori com a fitxer estàtic, així la web no depèn de cap clau ni de l'API en directe. Per canviar de quadrimestre:

1. Obre la pàgina d'horaris del GEI de la FIB (`https://www.fib.upc.edu/ca/graus/grau-en-enginyeria-informatica/horaris?quad=2026Q2`), prem F12 i a la **Console** executa (canvia `2026Q2` pel quadrimestre):

   ```js
   (async()=>{const q='2026Q2',id=document.documentElement.innerHTML.match(/client_id = "([^"]+)"/)[1];
   const get=r=>fetch(`https://api.fib.upc.edu/v2/${r}/?format=json&client_id=${id}`).then(x=>x.json());
   const [classes,assignatures]=await Promise.all([get(`quadrimestres/${q}/classes`),get(`quadrimestres/${q}/assignatures`)]);
   const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({classes,assignatures})]));
   a.download=`horaris-${q}.json`;a.click();})()
   ```

2. Genera el fitxer: `python3 tools/horaris-gei.py horaris-2026Q2.json 2026Q2 "Curs 2026-2027 · quadrimestre de primavera"`
3. Puja el número de `horaris-gei.js?v=N` a `index.html` i fes la Pull Request.

La selecció de grups de cada usuari es guarda a les seves dades (`schedules`), també al núvol si ha iniciat sessió.
