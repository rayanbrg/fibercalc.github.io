#!/usr/bin/env python3
"""Genera horaris-gei.js a partir del JSON baixat de l'API de la FIB.

Ús:  python3 tools/horaris-gei.py horaris-2026Q1.json 2026Q1 "Curs 2026-2027 · quadrimestre de tardor"
(El JSON es baixa amb el fragment de consola descrit al README, apartat «Horaris».)
"""
import json, re, sys, datetime, collections

src, quad, label = sys.argv[1], sys.argv[2], sys.argv[3]
d = json.load(open(src, encoding='utf-8'))

def es_gei(code):
    # Les assignatures d'altres titulacions porten sufix (-GCED, -MAI, ...); les del GEI no en porten
    return '-' not in code or code.endswith('-GEI')

IDIOMA = {'Català': 'CA', 'Castellano': 'ES', 'English': 'EN', 'Castellano, Català': 'ES/CA',
          'Castellano, English': 'ES/EN', 'Català, English': 'CA/EN'}
def hm(s): h, m = s.split(':'); return int(h) * 60 + int(m)

rows = [r for r in d['classes']['results'] if es_gei(r['codi_assig']) and r['dia_setmana'] in (1, 2, 3, 4, 5) and r['tipus'] in 'TPL']
# Fusiona franges consecutives del mateix grup, dia i aula (p. ex. 10-11 + 11-12 -> 10-12)
by = collections.defaultdict(list)
for r in rows:
    by[(r['codi_assig'], r['grup'], r['tipus'], r['dia_setmana'], r['aules'], r['idioma'])].append((hm(r['inici']), r['durada'] * 60))
out = []
for (code, grup, tipus, dia, aula, idioma), sl in by.items():
    sl.sort()
    cur = list(sl[0])
    for s, dur in sl[1:]:
        if s <= cur[0] + cur[1]: cur[1] = max(cur[1], s + dur - cur[0])
        else: out.append([code, grup, tipus, dia, cur[0], cur[1], aula, IDIOMA.get(idioma, idioma)]); cur = [s, dur]
    out.append([code, grup, tipus, dia, cur[0], cur[1], aula, IDIOMA.get(idioma, idioma)])
out.sort(key=lambda x: (x[0], x[2], x[1], x[3], x[4]))
notes = [[c['codi_assig'], c['comentari']] for c in d['classes'].get('comentaris', []) if es_gei(c['codi_assig'])]
data = {'quad': quad, 'label': label, 'updated': datetime.date.today().isoformat(), 'classes': out, 'notes': notes}
with open('horaris-gei.js', 'w', encoding='utf-8') as f:
    f.write('// Horaris del GEI (dades públiques de la FIB). Generat amb tools/horaris-gei.py — no editar a mà.\n')
    f.write('// Cada classe: [assignatura, grup, tipus (T/P/L), dia (1=dilluns), inici en minuts, durada en minuts, aula, idioma]\n')
    f.write('window.FIBERCALC_HORARIS = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(out), 'classes,', len(set(x[0] for x in out)), 'assignatures,', len(notes), 'avisos')
