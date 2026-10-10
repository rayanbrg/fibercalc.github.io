(function() {
  const STORAGE_KEY = 'fibercalc-data';
  const THEME_KEY = 'fibercalc-theme';
  const FILTER_KEY = 'fibercalc-filter';
  const PALETTE = [
    { name: 'purple', bg: '#A78BFA' },
    { name: 'teal',   bg: '#14B8A6' },
    { name: 'coral',  bg: '#FB7185' },
    { name: 'pink',   bg: '#EC4899' },
    { name: 'blue',   bg: '#3B82F6' },
    { name: 'green',  bg: '#22C55E' },
    { name: 'amber',  bg: '#F59E0B' },
    { name: 'red',    bg: '#EF4444' },
    { name: 'indigo', bg: '#6366F1' },
    { name: 'cyan',   bg: '#06B6D4' }
  ];
  const QUATRIS = [
    '26-27 Q2', '26-27 Q1',
    '25-26 Q2', '25-26 Q1',
    '24-25 Q2', '24-25 Q1',
    '23-24 Q2', '23-24 Q1',
    '22-23 Q2', '22-23 Q1'
  ];
  // Graus del Campus Nord (FIB, ETSETB i ETSECCPB) i alguns de la FME
  const CAREERS = [
    { id: 'gei', name: 'Grau en Enginyeria Informàtica', short: 'GEI', school: 'FIB - UPC', totalEcts: 240 },
    { id: 'gced', name: 'Grau en Ciència i Enginyeria de Dades', short: 'GCED', school: 'FIB - UPC', totalEcts: 240 },
    { id: 'gia', name: 'Grau en Intel·ligència Artificial', short: 'GIA', school: 'FIB - UPC', totalEcts: 240 },
    { id: 'gbi', name: 'Grau en Bioinformàtica', short: 'GBI', school: 'FIB - UPC', totalEcts: 240 },
    { id: 'gem', name: 'Grau en Enginyeria Matemàtica en la Ciència de Dades', short: 'GEMCD', school: 'FME - UPC', totalEcts: 240 },
    { id: 'gretst', name: 'Grau en Enginyeria de Tecnologies i Serveis de Telecomunicació', short: 'GRETST', school: 'ETSETB - UPC', totalEcts: 240 },
    { id: 'greelec', name: 'Grau en Enginyeria Electrònica de Telecomunicació', short: 'GREELEC', school: 'ETSETB - UPC', totalEcts: 240 },
    { id: 'gef', name: 'Grau en Enginyeria Física', short: 'GEF', school: 'ETSETB - UPC', totalEcts: 240 },
    { id: 'gec', name: 'Grau en Enginyeria Civil', short: 'GEC', school: 'ETSECCPB - UPC', totalEcts: 240 },
    { id: 'gea', name: 'Grau en Enginyeria Ambiental', short: 'GEA', school: 'ETSECCPB - UPC', totalEcts: 240 },
    { id: 'gctm', name: 'Grau en Ciències i Tecnologies del Mar', short: 'GCTM', school: 'ETSECCPB - UPC', totalEcts: 240 },
    { id: 'other', name: 'Altres', short: 'Altres', school: '', totalEcts: 240 }
  ];
  let activePage = 'notes';
  let calendarMonth = new Date();
  calendarMonth.setDate(1);
  const EVENT_TYPES = [
    { id: 'examen', label: 'Examen', color: '#EF4444' },
    { id: 'parcial', label: 'Parcial', color: '#F87171' },
    { id: 'lab', label: 'Entrega lab', color: '#22C55E' },
    { id: 'practica', label: 'Pràctica', color: '#10B981' },
    { id: 'presentacio', label: 'Presentació', color: '#A78BFA' },
    { id: 'treball', label: 'Treball', color: '#3B82F6' },
    { id: 'altres', label: 'Altres', color: '#6E6E73' }
  ];
  function getEventType(id) { return EVENT_TYPES.find(t => t.id === id) || EVENT_TYPES[6]; }
  function toLocalDateStr(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  function daysBetween(d1, d2) {
    const a = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const b = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
    return Math.round((b - a) / 86400000);
  }
  function fmtDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.getDate() + ' ' + ['gen','feb','mar','abr','mai','jun','jul','ago','set','oct','nov','des'][d.getMonth()] + ' ' + d.getFullYear();
  }
  let activeStatsScope = 'all'; // 'all' o 'passed'
  let friendRankingCache = []; // ultim rankin calculat (per la comparativa per quatris)
  let state = { subjects: [] };
  let editingId = null;
  let draft = null;
  let prevStatus = {}; // 'pass' | 'fail' | 'compensable' | 'none'
  let firstRender = true;
  let activeFilter = 'ALL';
  let reorderMode = false;
  let dragSrcId = null;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state = JSON.parse(raw);
    } catch (e) { state = { subjects: [], career: null }; }
    if (!state.subjects) state.subjects = [];
    if (state.career === undefined) state.career = null;
    if (state.career === 'gcd') state.career = 'gced'; // el grau es diu GCED
    if (state.userName === undefined) state.userName = '';
    if (state.username === undefined) state.username = '';
    if (!state.events) state.events = [];
    if (!state.schedules) state.schedules = {};
    state.subjects.forEach(s => {
      if (!s.quatri) s.quatri = '25-26 Q2';
      if (s.ects === undefined || s.ects === null) s.ects = 6;
      // Migracio: si te .name pero no .sigla, el .name passa a .sigla
      if (s.name && !s.sigla) { s.sigla = s.name; s.fullName = ''; delete s.name; }
      if (!s.sigla && s.name) { s.sigla = s.name; }
      if (s.fullName === undefined) s.fullName = '';
      if (!s.evaluations) {
        const evalId = genId();
        s.evaluations = [{ id: evalId, name: 'Avaluació', parts: s.parts || [] }];
        s.activeEval = evalId;
        delete s.parts;
      }
      if (!s.activeEval && s.evaluations.length > 0) {
        s.activeEval = s.evaluations[0].id;
      }
    });
    activeFilter = localStorage.getItem(FILTER_KEY) || 'ALL';
  }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {} }
  function saveFilter() { try { localStorage.setItem(FILTER_KEY, activeFilter); } catch(e) {} }
  function genId() { return Math.random().toString(36).slice(2, 10); }
  function fmt(n) { return (Math.round(n * 100) / 100).toFixed(2); }
  function getColor(name) {
    const found = PALETTE.find(p => p.name === name);
    if (found) return found;
    // Si comena per # ᅵs un color hex personalitzat
    if (typeof name === 'string' && name.startsWith('#')) return { name: name, bg: name };
    return PALETTE[0];
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function parseNum(v) {
    if (v === null || v === undefined || v === '') return null;
    const s = String(v).replace(',', '.');
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
  }

  function loadTheme() {
    const t = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', t);
    updateThemeIcon(t);
  }
  function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
  }
  function renderCareerTag() {
    const root = document.getElementById('career-tag-root');
    if (!root) return;
    if (!state.career) {
      root.innerHTML = '<span class="career-tag" onclick="openCareerModal()"><i class="ti ti-school"></i>Tria la teva carrera</span>';
    } else {
      const c = CAREERS.find(x => x.id === state.career);
      const label = c ? (c.short + (c.school ? ' · ' + c.school : '')) : 'Carrera';
      root.innerHTML = '<span class="career-tag" onclick="openCareerModal()"><i class="ti ti-school"></i>' + escapeHtml(label) + '</span>';
    }
  }

  window.openCareerModal = function() {
    const root = document.getElementById('modal-root');
    let lastSchool = null;
    const optionsHtml = CAREERS.map(c => {
      const cls = c.id === state.career ? 'career-option selected' : 'career-option';
      const heading = c.school !== lastSchool && c.school ? '<div class="career-school">' + escapeHtml(c.school.replace(' - UPC', '')) + '</div>' : '';
      lastSchool = c.school;
      return heading + '<div class="' + cls + '" onclick="selectCareer(\'' + c.id + '\')"><strong>' + escapeHtml(c.short) + '</strong> — ' + escapeHtml(c.name) + '</div>';
    }).join('');
    root.innerHTML =
      '<div class="modal-bg" onclick="if(event.target===this)closeCareerModal()">' +
        '<div class="modal">' +
          '<h3>El teu perfil</h3>' +
          '<div><label>Com et dius?</label>' +
            '<input type="text" id="modal-username" value="' + escapeHtml(state.userName || '') + '" placeholder="El teu nom" /></div>' +
          '<div><label>Carrera</label></div>' +
          '<div class="career-modal-list">' + optionsHtml + '</div>' +
          '<div class="modal-actions">' +
            '<button class="btn" onclick="closeCareerModal()">Cancel·lar</button>' +
            '<button class="btn btn-primary" onclick="saveCareerModal()">Desar</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  };

  window.saveCareerModal = function() {
    const u = document.getElementById('modal-username');
    if (u) state.userName = u.value.trim();
    save();
    closeCareerModal();
    renderCareerTag();
    updateGreeting();
  };

  window.selectCareer = function(id) {
    state.career = id;
    // Capturar el nom abans de re-renderitzar
    const u = document.getElementById('modal-username');
    if (u) state.userName = u.value.trim();
    // Re-renderitzar el modal per mostrar la nova seleccio
    openCareerModal();
  };

  window.closeCareerModal = function() {
    document.getElementById('modal-root').innerHTML = '';
  };

  window.toggleTheme = function() {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = cur === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    updateThemeIcon(next);
  };

  function getActiveEval(subject) {
    if (!subject.evaluations || subject.evaluations.length === 0) return null;
    return subject.evaluations.find(e => e.id === subject.activeEval) || subject.evaluations[0];
  }
  function getActiveParts(subject) {
    const ev = getActiveEval(subject);
    return ev ? ev.parts : [];
  }
  function calcGrade(subject) {
    let total = 0, hasAny = false;
    const parts = getActiveParts(subject);
    for (const p of parts) {
      if (p.grade !== null && p.grade !== undefined && p.grade !== '') {
        total += (parseFloat(p.grade) * parseFloat(p.weight)) / 100;
        hasAny = true;
      }
    }
    return hasAny ? total : null;
  }

  function calcNeededPerPart(subject) {
    let earned = 0, remainingWeight = 0;
    const parts = getActiveParts(subject);
    for (const p of parts) {
      const w = parseFloat(p.weight) || 0;
      if (p.grade !== null && p.grade !== undefined && p.grade !== '') {
        earned += (parseFloat(p.grade) * w) / 100;
      } else {
        remainingWeight += w;
      }
    }
    if (remainingWeight === 0) return null;
    return ((5 - earned) * 100) / remainingWeight;
  }

  function getMatriculaInfo(subject) {
    // Agrupa per sigla i ordena per quatri. La mes antiga = 1a matricula
    const sigla = (subject.sigla || subject.name || '').trim().toUpperCase();
    if (!sigla) return { num: 1, total: 1 };
    const sameGroup = state.subjects.filter(s => ((s.sigla || s.name || '').trim().toUpperCase()) === sigla);
    if (sameGroup.length <= 1) return { num: 1, total: 1 };
    // Ordenar per quatri (mes antic primer)
    const sorted = [...sameGroup].sort((a, b) => QUATRIS.indexOf(b.quatri) - QUATRIS.indexOf(a.quatri));
    const idx = sorted.findIndex(s => s.id === subject.id);
    return { num: idx + 1, total: sameGroup.length };
  }

  // Per a una sigla, retorna l'assignatura que aporta ECTS (la primera aprovada o compensable)
  // Si cap aprovada, retorna null
  function getEctsContributor(sigla) {
    if (!sigla) return null;
    const sig = sigla.trim().toUpperCase();
    const group = state.subjects.filter(s => ((s.sigla || s.name || '').trim().toUpperCase()) === sig);
    if (group.length === 0) return null;
    // Ordenat per quatri antic -> nou
    const sorted = [...group].sort((a, b) => QUATRIS.indexOf(b.quatri) - QUATRIS.indexOf(a.quatri));
    // Trobar la primera aprovada/compensable
    for (const s of sorted) {
      const st = getStatus(s);
      if (st.final && (st.type === 'pass' || st.type === 'compensable')) return s;
    }
    return null;
  }

  function getStatus(subject) {
    const g = calcGrade(subject);
    const needed = calcNeededPerPart(subject);
    if (g !== null && needed === null) {
      if (g >= 5) return { final: true, grade: g, type: 'pass' };
      if (g >= 4) return { final: true, grade: g, type: 'compensable' };
      return { final: true, grade: g, type: 'fail' };
    }
    if (needed === null) return { final: false, needed: null };
    if (needed <= 0) return { final: false, secured: true };
    if (needed > 10) return { final: false, impossible: true, needed };
    return { final: false, needed };
  }

  function getStatusType(subject) {
    const st = getStatus(subject);
    if (!st.final) return 'none';
    return st.type;
  }

  function computeProfileStats() {
    const subjects = state.subjects || [];
    const seenSiglas = new Set();
    let totalEcts = 0, passedEcts = 0;
    const allGrades = [], passedGrades = [];
    const byQuatri = {};

    subjects.forEach(s => {
      const g = calcGrade(s);
      const st = getStatus(s);
      const ects = parseFloat(s.ects) || 0;
      const q = s.quatri || '';

      if (st.final && g !== null) {
        allGrades.push(g);
        if (st.type === 'pass' || st.type === 'compensable') passedGrades.push(g);
      }

      const sig = (s.sigla || s.name || '').trim().toUpperCase();
      if (!(sig && seenSiglas.has(sig))) {
        if (sig) seenSiglas.add(sig);
        totalEcts += ects;
        const contributor = sig ? getEctsContributor(sig) : (st.final && (st.type === 'pass' || st.type === 'compensable') ? s : null);
        if (contributor) passedEcts += ects;
      }

      if (q) {
        if (!byQuatri[q]) byQuatri[q] = { allGrades: [], passedGrades: [], ectsTotal: 0, ectsApproved: 0 };
        byQuatri[q].ectsTotal += ects;
        if (st.final && g !== null) {
          byQuatri[q].allGrades.push(g);
          if (st.type === 'pass' || st.type === 'compensable') {
            byQuatri[q].passedGrades.push(g);
            byQuatri[q].ectsApproved += ects;
          }
        }
      }
    });

    const avg = arr => arr.length ? Math.round((arr.reduce((a,b)=>a+b,0) / arr.length) * 100) / 100 : null;

    const byQuatriOut = {};
    Object.keys(byQuatri).forEach(q => {
      const d = byQuatri[q];
      byQuatriOut[q] = {
        avgAll: avg(d.allGrades),
        avgPassed: avg(d.passedGrades),
        ectsApproved: d.ectsApproved,
        ectsTotal: d.ectsTotal
      };
    });

    return {
      avgAll: avg(allGrades),
      avgPassed: avg(passedGrades),
      ectsApproved: passedEcts,
      ectsTotal: totalEcts,
      byQuatri: byQuatriOut
    };
  }

  let filtersExpanded = false;
  function renderFilters() {
    const bar = document.getElementById('filter-bar');
    const usedQuatris = [...new Set(state.subjects.map(s => s.quatri))].sort((a,b) => QUATRIS.indexOf(a) - QUATRIS.indexOf(b));
    // Amb molts quatrimestres només es mostren els més recents (i l'actiu); la resta es desplega amb "Més"
    const MAX = 4;
    let shown = usedQuatris;
    if (!filtersExpanded && usedQuatris.length > MAX) {
      shown = usedQuatris.slice(0, MAX);
      if (activeFilter !== 'ALL' && !shown.includes(activeFilter) && usedQuatris.includes(activeFilter)) {
        shown = shown.slice(0, MAX - 1).concat(activeFilter);
      }
    }
    let html = '<button class="filter-chip ' + (activeFilter === 'ALL' ? 'active' : '') + '" onclick="setFilter(\'ALL\')">Totes</button>';
    shown.forEach(q => {
      html += '<button class="filter-chip ' + (activeFilter === q ? 'active' : '') + '" onclick="setFilter(\'' + q + '\')">' + q + '</button>';
    });
    const hidden = usedQuatris.length - shown.length;
    if (hidden > 0) html += '<button class="filter-chip more" onclick="toggleFilters()">Més (+' + hidden + ')</button>';
    else if (filtersExpanded && usedQuatris.length > MAX) html += '<button class="filter-chip more" onclick="toggleFilters()">Menys</button>';
    bar.innerHTML = html;
  }
  window.toggleFilters = function() { filtersExpanded = !filtersExpanded; renderFilters(); };

  window.setFilter = function(f) {
    activeFilter = f;
    saveFilter();
    renderFilters();
    render();
    if (activePage === 'stats') renderStats();
  };

  window.toggleReorder = function() {
    reorderMode = !reorderMode;
    const btn = document.getElementById('reorder-btn');
    if (btn) btn.classList.toggle('active', reorderMode);
    const root = document.getElementById('reorder-banner-root');
    root.innerHTML = reorderMode
      ? '<div class="reorder-banner"><span><i class="ti ti-info-circle"></i> Mode reordenar actiu. Arrossega les targetes per moure-les.</span><button class="btn-ghost" onclick="toggleReorder()" style="color:inherit;"><i class="ti ti-check"></i>Fet</button></div>'
      : '';
    render();
  };

  function getFiltered() {
    if (activeFilter === 'ALL') return state.subjects;
    return state.subjects.filter(s => s.quatri === activeFilter);
  }

  // ---- Targeta d'assignatura: peces de la interfície ----
  function hasGrade(p) { return p.grade !== null && p.grade !== undefined && p.grade !== ''; }
  function fmtW(n) { return String(Math.round(n * 100) / 100); }
  function partTone(p) { return hasGrade(p) ? (parseFloat(p.grade) >= 5 ? 'g' : 'b') : ''; }
  // Mida de la sigla dins del quadrat: com més curta, més gran
  function monoFontSize(sigla) {
    const n = String(sigla).length;
    return n <= 2 ? 22 : n === 3 ? 19 : n === 4 ? 16 : n === 5 ? 13.5 : 11.5;
  }
  function cardMetrics(s) {
    const parts = getActiveParts(s);
    let earned = 0, evaluated = 0, pending = 0, pendingCount = 0;
    parts.forEach(p => {
      const w = parseFloat(p.weight) || 0;
      if (hasGrade(p)) { earned += (parseFloat(p.grade) * w) / 100; evaluated += w; }
      else { pending += w; pendingCount++; }
    });
    return { parts, earned, evaluated, pending, pendingCount };
  }
  // Vista de la targeta tancada: només la sigla i la nota, i la fletxa per obrir
  function cardClosedHtml(s, m) {
    const st = getStatus(s);
    const color = getColor(s.color);
    const sigla = s.sigla || s.name || '';
    const grade = st.final ? st.grade : m.earned;
    const tone = st.final ? (st.type === 'pass' ? 'ok' : st.type === 'compensable' ? 'mid' : 'bad') : '';
    return '<div class="cc-row">' +
      '<div class="cc-sigla">' + escapeHtml(sigla) + '</div>' +
      '<div class="cc-grade ' + tone + '"><span class="cc-v">' + fmt(grade) + '</span></div>' +
    '</div>' +
    (reorderMode ? '' : '<div class="cc-chev" aria-hidden="true"><i class="ti ti-chevron-down"></i></div>');
  }
  function cardHeroHtml(s, m) {
    const st = getStatus(s);
    if (st.final) {
      const tone = st.type === 'pass' ? 'ok' : st.type === 'compensable' ? 'mid' : 'bad';
      return '<div class="hero-cell main ' + tone + '"><div class="k">Nota final</div><div class="v ' + tone + '">' + fmt(st.grade) + '</div><div class="sub">Avaluació completada</div></div>';
    }
    if (m.parts.length === 0) {
      return '<div class="hero-cell main"><div class="k">Nota</div><div class="v">—</div><div class="sub">Sense apartats</div></div>';
    }
    const main = '<div class="hero-cell main"><div class="k">Nota acumulada</div><div class="v">' + fmt(m.earned) + '<small>/ 10</small></div><div class="sub">' + fmtW(m.evaluated) + '% avaluat</div></div>';
    let side;
    if (st.secured) {
      side = '<div class="k">Necessites</div><div class="v ok flat"><i class="ti ti-check"></i></div><div class="sub">Ja tens prou per aprovar</div>';
    } else if (st.impossible) {
      side = '<div class="k">Necessites</div><div class="v bad">' + fmt(st.needed) + '</div><div class="sub">No s\'hi arriba amb el que queda</div>';
    } else if (st.needed !== null && st.needed !== undefined) {
      const tone = st.needed <= 6 ? 'ok' : st.needed <= 8 ? 'mid' : 'bad';
      const where = m.pendingCount === 1 ? 'de mitjana a la part que queda' : 'de mitjana a les ' + m.pendingCount + ' parts que queden';
      side = '<div class="k">Necessites</div><div class="v ' + tone + '">' + fmt(st.needed) + '</div><div class="sub">' + where + '</div>';
    } else {
      side = '<div class="k">Necessites</div><div class="v">—</div>';
    }
    return main + '<div class="hero-cell side">' + side + '</div>';
  }
  function cardBarHtml(m) {
    if (m.parts.length === 0) return '';
    return '<div class="card-bar">' + m.parts.map(p =>
      '<div class="seg ' + partTone(p) + '" style="flex:' + (parseFloat(p.weight) || 0) + '" title="' + escapeHtml(p.name || '') + '"></div>'
    ).join('') + '</div>' +
    '<div class="card-bar-cap"><span>' + fmtW(m.evaluated) + '% avaluat</span><span>' + fmtW(m.pending) + '% pendent</span></div>';
  }
  function cardChipHtml(s) {
    const st = getStatus(s);
    if (st.final) {
      if (st.type === 'pass') return '<span class="chip pass"><i class="ti ti-check"></i>Aprovada</span>';
      if (st.type === 'compensable') return '<span class="chip compensable"><i class="ti ti-scale"></i>Compensable</span>';
      return '<span class="chip fail"><i class="ti ti-x"></i>Suspesa</span>';
    }
    if (st.secured) return '<span class="chip pass"><i class="ti ti-check"></i>Ja tens prou per aprovar</span>';
    if (st.impossible) return '<span class="chip fail"><i class="ti ti-alert-triangle"></i>Inaccessible amb el que queda</span>';
    if (st.needed !== null && st.needed !== undefined) return '<span class="chip warn"><i class="ti ti-target"></i>Encara aprovable</span>';
    return '<span class="chip warn"><i class="ti ti-pencil"></i>Sense notes</span>';
  }
  // Targetes: per defecte tancades; les obertes es recorden mentre la pàgina és oberta
  const openCards = new Set();
  function setFold(card, open) {
    card.classList.toggle('closed', !open);
    const full = card.querySelector('.fold-full'), mini = card.querySelector('.fold-mini');
    if (full) full.inert = !open;
    if (mini) mini.inert = open;
    const mb = card.querySelector('.card-closed');
    if (mb) mb.setAttribute('aria-expanded', String(open));
  }
  window.toggleCard = function(id, ev) {
    if (reorderMode) return;
    if (ev && ev.target.closest('.card-menu-wrap, .card-menu')) return;
    const card = document.querySelector('[data-card-id="' + id + '"]');
    if (!card) return;
    const open = card.classList.contains('closed');
    closeCardMenu();
    // Mentre dura l'animació el contingut es retalla; després es deixa visible (menú ⋯, ombres de focus)
    card.classList.add('folding');
    clearTimeout(card._foldT);
    card._foldT = setTimeout(() => card.classList.remove('folding'), 520);
    setFold(card, open);
    if (open) openCards.add(id); else openCards.delete(id);
  };
  window.onClosedKey = function(id, ev) {
    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); window.toggleCard(id, ev); }
  };
  function tileHint(s, p) {
    const need = calcNeededPerPart(s);
    return (!hasGrade(p) && need !== null && need > 0 && need <= 10) ? fmt(need) : '–';
  }
  function cardTilesHtml(s, m) {
    return m.parts.map((p, i) => {
      const name = p.name || ('Part ' + (i + 1));
      const w = fmtW(parseFloat(p.weight) || 0);
      return '<label class="tile ' + partTone(p) + '" data-part="' + p.id + '">' +
        '<span class="t-top"><b title="' + escapeHtml(name) + '">' + escapeHtml(name) + '</b><span>' + w + '%</span></span>' +
        '<input type="text" inputmode="decimal" autocomplete="off" placeholder="' + tileHint(s, p) + '" value="' + (hasGrade(p) ? escapeHtml(String(p.grade)) : '') + '"' +
          ' aria-label="Nota de ' + escapeHtml(name) + ' (' + w + '%)" data-subject="' + s.id + '" data-part="' + p.id + '"' +
          ' oninput="onGradeInput(event)" onblur="onGradeBlur(event)" />' +
      '</label>';
    }).join('');
  }
  // Menu ⋯ de la targeta (Editar / Eliminar)
  function closeCardMenu() {
    document.querySelectorAll('.card-menu').forEach(el => el.remove());
    document.querySelectorAll('.kebab[aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded', 'false'));
  }
  window.toggleCardMenu = function(id, ev) {
    ev.stopPropagation();
    const btn = ev.currentTarget;
    const wasOpen = btn.getAttribute('aria-expanded') === 'true';
    closeCardMenu();
    if (wasOpen) return;
    btn.setAttribute('aria-expanded', 'true');
    const menu = document.createElement('div');
    menu.className = 'card-menu';
    menu.setAttribute('role', 'menu');
    menu.innerHTML =
      '<button type="button" role="menuitem" onclick="closeCardMenu();openModal(\'' + id + '\')"><i class="ti ti-edit"></i>Editar</button>' +
      '<button type="button" role="menuitem" class="danger" onclick="closeCardMenu();deleteSubject(\'' + id + '\')"><i class="ti ti-trash"></i>Eliminar</button>';
    btn.parentElement.appendChild(menu);
    const first = menu.querySelector('button');
    if (first) first.focus();
  };
  window.closeCardMenu = closeCardMenu;
  document.addEventListener('click', (e) => { if (!e.target.closest('.card-menu-wrap')) closeCardMenu(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = document.querySelector('.kebab[aria-expanded="true"]');
    if (open) { closeCardMenu(); open.focus(); }
  });

  // Frase sota el títol: quatrimestre actiu i nombre d'assignatures
  function updateOverall() {
    const el = document.getElementById('overall');
    if (!el) return;
    if (state.subjects.length === 0) { el.textContent = 'Afegeix la teva primera assignatura'; return; }
    const n = getFiltered().length;
    const noun = n === 1 ? 'assignatura' : 'assignatures';
    el.textContent = activeFilter === 'ALL' ? (n + ' ' + noun + ' en total') : (activeFilter + ' · ' + n + ' ' + noun);
  }

  function render() {
    const grid = document.getElementById('grid');
    const filtered = getFiltered();
    updateOverall();
    if (state.subjects.length === 0) {
      grid.innerHTML = '<div class="grid-empty">Encara no tens cap assignatura.<br>Comença afegint-ne una.</div>';
      renderDashboard();
      return;
    }
    if (filtered.length === 0) {
      grid.innerHTML = '<div class="grid-empty">No hi ha assignatures en aquest filtre.</div>';
      return;
    }
    const newStatus = {};

    grid.innerHTML = filtered.map(s => {
      const color = getColor(s.color);
      const g = calcGrade(s);
      const status = getStatus(s);
      const statusType = getStatusType(s);
      newStatus[s.id] = statusType;
      const justPassed = !firstRender && statusType === 'pass' && prevStatus[s.id] !== 'pass';
      const justFailed = !firstRender && statusType === 'fail' && prevStatus[s.id] !== 'fail';
      let animClass = '';
      if (justPassed) animClass = ' passed-anim';
      else if (justFailed) animClass = ' failed-anim';
      const reorderClass = reorderMode ? ' reorder-mode' : '';
      const dragAttrs = reorderMode ? ' draggable="true" ondragstart="onDragStart(event,\'' + s.id + '\')" ondragover="onDragOver(event)" ondragleave="onDragLeave(event)" ondrop="onDrop(event,\'' + s.id + '\')" ondragend="onDragEnd(event)"' : '';

      // Info de matricula (nomes es mostra a partir de la 2a)
      const matricula = getMatriculaInfo(s);
      const matSuffix = ['', '1a', '2a', '3a', '4a', '5a', '6a'][matricula.num] || (matricula.num + 'a');
      const matriculaHtml = matricula.num > 1
        ? '<i class="dot"></i><span class="card-matricula"><i class="ti ti-bookmark"></i>' + matSuffix + ' matrícula</span>'
        : '';

      // Selector d'avaluacio (nomes si te mes d'una): botons si en son poques, desplegable si en son moltes
      let evalSelectorHtml = '';
      if (s.evaluations && s.evaluations.length > 1) {
        if (s.evaluations.length <= 3) {
          evalSelectorHtml = '<div class="seg-ctl" role="group" aria-label="Tipus d\'avaluació">' + s.evaluations.map(ev =>
            '<button type="button" class="' + (ev.id === s.activeEval ? 'on' : '') + '" aria-pressed="' + (ev.id === s.activeEval) + '" onclick="switchSubjectEval(\'' + s.id + '\', \'' + ev.id + '\')">' + escapeHtml(ev.name) + '</button>'
          ).join('') + '</div>';
        } else {
          evalSelectorHtml = '<select class="eval-select" aria-label="Tipus d\'avaluació" onchange="switchSubjectEval(\'' + s.id + '\', this.value)">' + s.evaluations.map(ev =>
            '<option value="' + ev.id + '"' + (ev.id === s.activeEval ? ' selected' : '') + '>' + escapeHtml(ev.name) + '</option>'
          ).join('') + '</select>';
        }
      }

      const sigla = s.sigla || s.name || '';
      const title = s.fullName || sigla;
      const m = cardMetrics(s);
      const menuHtml = reorderMode
        ? '<span class="card-grip" aria-hidden="true"><i class="ti ti-grip-vertical"></i></span>'
        : '<div class="card-menu-wrap"><button type="button" class="kebab" aria-label="Més opcions" aria-haspopup="menu" aria-expanded="false" onclick="toggleCardMenu(\'' + s.id + '\', event)"><i class="ti ti-dots"></i></button></div>';

      const isClosed = reorderMode || !openCards.has(s.id);
      const chevHtml = reorderMode ? '' : '<button type="button" class="chev" aria-label="Tancar targeta"><i class="ti ti-chevron-up"></i></button>';

      return '<div class="card' + animClass + reorderClass + (isClosed ? ' closed' : '') + '" data-card-id="' + s.id + '" style="--c:' + color.bg + ';"' + dragAttrs + '>' +
        '<div class="fold fold-mini"' + (isClosed ? '' : ' inert') + '><div class="fold-in">' +
          '<div class="card-closed" data-closed role="button" tabindex="0" aria-expanded="' + (!isClosed) + '" aria-label="' + escapeHtml(sigla) + ': obrir targeta" onclick="toggleCard(\'' + s.id + '\', event)" onkeydown="onClosedKey(\'' + s.id + '\', event)">' + cardClosedHtml(s, m) + '</div>' +
        '</div></div>' +
        '<div class="fold fold-full"' + (isClosed ? ' inert' : '') + '><div class="fold-in">' +
          '<div class="card-head" onclick="toggleCard(\'' + s.id + '\', event)">' +
            '<div class="mono" style="background:' + color.bg + ';font-size:' + monoFontSize(sigla) + 'px;">' + escapeHtml(sigla) + '</div>' +
            '<div class="card-title">' +
              '<h3 class="card-name">' + escapeHtml(title) + '</h3>' +
              '<div class="card-meta"><span>' + escapeHtml(s.quatri || '') + '</span><i class="dot"></i><span>' + escapeHtml(String(s.ects || 6)) + ' ECTS</span>' + matriculaHtml + '</div>' +
            '</div>' +
            menuHtml + chevHtml +
          '</div>' +
          '<div class="card-hero">' + cardHeroHtml(s, m) + '</div>' +
          '<div class="card-barwrap">' + cardBarHtml(m) + '</div>' +
          evalSelectorHtml +
          '<div class="tiles">' + cardTilesHtml(s, m) + '</div>' +
          '<div class="card-foot">' + cardChipHtml(s) + '</div>' +
        '</div></div>' +
      '</div>';
    }).join('');

    prevStatus = newStatus;
    firstRender = false;

    renderDashboard();
  }

  function renderDashboard() {
    const filtered = getFiltered();
    const dash = document.getElementById('dashboard');
    if (state.subjects.length === 0) { dash.innerHTML = ''; return; }

    let total = filtered.length, passed = 0, pending = 0;
    let grades = [];

    filtered.forEach(s => {
      const g = calcGrade(s);
      const status = getStatus(s);
      if (g !== null && status.final) grades.push(g);
      if (status.final) {
        if (status.type === 'pass' || status.type === 'compensable') passed++;
      } else {
        pending++;
      }
    });

    // ECTS sense doble compte: agrupar per sigla i comptar nomes 1 vegada
    const seenSiglas = new Set();
    let totalEcts = 0, passedEcts = 0;
    filtered.forEach(s => {
      const sig = (s.sigla || s.name || '').trim().toUpperCase();
      if (sig && seenSiglas.has(sig)) return; // ja comptat
      if (sig) seenSiglas.add(sig);
      const ects = parseFloat(s.ects) || 0;
      totalEcts += ects;
      // Per ECTS aprovats: si alguna de les matricules d'aquesta sigla ha aprovat, sumar ects
      const contributor = sig ? getEctsContributor(sig) : (getStatus(s).type === 'pass' || getStatus(s).type === 'compensable' ? s : null);
      if (contributor) passedEcts += ects;
    });

    // Detectar si hi ha assignatures repetides
    const siglaCounts = {};
    state.subjects.forEach(s => {
      const sig = (s.sigla || s.name || '').trim().toUpperCase();
      if (!sig) return;
      siglaCounts[sig] = (siglaCounts[sig] || 0) + 1;
    });
    const repeatedSiglas = Object.keys(siglaCounts).filter(sig => siglaCounts[sig] > 1);
    const hasRepeated = repeatedSiglas.length > 0;

    // Aprovades a 1a matricula: nomes calculat si hi ha repetides
    let firstTryPassed = 0, firstTryTotal = 0, firstTryPct = 0;
    if (hasRepeated) {
      // Per a cada sigla en filtered: si la 1a matricula ja t status final i va aprovar -> conta
      const siglasInFilter = new Set();
      filtered.forEach(s => {
        const sig = (s.sigla || s.name || '').trim().toUpperCase();
        if (sig) siglasInFilter.add(sig);
      });
      siglasInFilter.forEach(sig => {
        const group = state.subjects.filter(s => ((s.sigla || s.name || '').trim().toUpperCase()) === sig);
        if (group.length === 0) return;
        // Ordenar per quatri (mes antic primer)
        const sorted = [...group].sort((a, b) => QUATRIS.indexOf(b.quatri) - QUATRIS.indexOf(a.quatri));
        const firstAttempt = sorted[0];
        const st = getStatus(firstAttempt);
        if (st.final) {
          firstTryTotal++;
          if (st.type === 'pass' || st.type === 'compensable') firstTryPassed++;
        }
      });
      firstTryPct = firstTryTotal > 0 ? Math.round((firstTryPassed / firstTryTotal) * 100) : 0;
    }

    const avg = grades.length > 0 ? grades.reduce((a,b)=>a+b,0) / grades.length : null;
    const avgText = avg !== null ? fmt(avg) : '—';
    const fmtEcts = (n) => { const r = Math.round(n * 10) / 10; return r % 1 === 0 ? String(r) : r.toFixed(1); };

    // Comparativa amb quatri anterior (nomes si filtre = quatri especific)
    let deltaHtml = '';
    if (activeFilter !== 'ALL' && avg !== null) {
      const qIdx = QUATRIS.indexOf(activeFilter);
      if (qIdx >= 0 && qIdx < QUATRIS.length - 1) {
        const prevQuatri = QUATRIS[qIdx + 1];
        const prevSubjects = state.subjects.filter(s => s.quatri === prevQuatri);
        const prevGrades = [];
        prevSubjects.forEach(s => {
          const g = calcGrade(s);
          const st = getStatus(s);
          if (g !== null && st.final) prevGrades.push(g);
        });
        if (prevGrades.length > 0) {
          const prevAvg = prevGrades.reduce((a,b)=>a+b,0) / prevGrades.length;
          const diff = avg - prevAvg;
          let cls, icon, sign;
          if (Math.abs(diff) < 0.05) { cls = 'same'; icon = 'ti-minus'; sign = ''; }
          else if (diff > 0) { cls = 'up'; icon = 'ti-trending-up'; sign = '+'; }
          else { cls = 'down'; icon = 'ti-trending-down'; sign = ''; }
          deltaHtml = '<span class="delta-badge ' + cls + '" title="vs ' + escapeHtml(prevQuatri) + '"><i class="ti ' + icon + '"></i>' + sign + fmt(diff) + '</span>';
        }
      }
    }

    // En curs / per començar (assignatures sense estat final)
    let inProgress = 0, notStarted = 0;
    filtered.forEach(s => {
      if (getStatus(s).final) return;
      if (calcGrade(s) === null) notStarted++; else inProgress++;
    });
    const passedPct = total > 0 ? Math.round(passed / total * 100) : 0;
    // ECTS aprovats de tota la carrera (independent del filtre de quatrimestre), sense comptar dues vegades la mateixa sigla
    const seenAll = new Set();
    let careerPassed = 0;
    state.subjects.forEach(s => {
      const sig = (s.sigla || s.name || '').trim().toUpperCase();
      if (sig && seenAll.has(sig)) return;
      if (sig) seenAll.add(sig);
      const contributor = sig ? getEctsContributor(sig) : (getStatus(s).type === 'pass' || getStatus(s).type === 'compensable' ? s : null);
      if (contributor) careerPassed += parseFloat(s.ects) || 0;
    });
    const careerDef = state.career ? CAREERS.find(c => c.id === state.career) : null;
    const careerTotal = (careerDef && careerDef.totalEcts) || 240;
    const ectsPct = Math.min(1, careerPassed / careerTotal);
    const CIRC = 113.1;
    const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);

    let cards = '';
    cards += '<div class="st">' +
        '<div class="l"><i class="ti ti-chart-line"></i>Mitjana</div>' +
        '<div class="v">' + avgText + deltaHtml + '</div>' +
        '<div class="s">' + (grades.length > 0 ? plural(grades.length, 'finalitzada', 'finalitzades') : 'Apareixerà amb la primera assignatura finalitzada') + '</div>' +
      '</div>';
    cards += '<div class="st">' +
        '<div class="l"><i class="ti ti-school"></i>ECTS aprovats</div>' +
        '<div class="st-ring"><div>' +
          '<div class="v">' + fmtEcts(careerPassed) + '<small>/ ' + careerTotal + '</small></div>' +
          '<div class="s">de la carrera</div></div>' +
          '<div class="ring" role="img" aria-label="' + Math.round(ectsPct * 100) + '% de la carrera">' +
            '<svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="21" stroke="rgba(255,255,255,0.25)" stroke-width="5" fill="none"/>' +
            '<circle cx="26" cy="26" r="21" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="' + (ectsPct * 131.9).toFixed(1) + ' 131.9" transform="rotate(-90 26 26)"/></svg>' +
            '<span>' + Math.round(ectsPct * 100) + '%</span></div>' +
        '</div>' +
      '</div>';
    const progressBits = [];
    if (inProgress > 0) progressBits.push(inProgress + ' en curs');
    if (notStarted > 0) progressBits.push(notStarted + ' per començar');
    cards += '<div class="st">' +
        '<div class="l"><i class="ti ti-circle-check"></i>Aprovades</div>' +
        '<div class="v">' + passed + '<small>/ ' + total + '</small></div>' +
        '<div class="s">' + (progressBits.length ? progressBits.join(' · ') : passedPct + '% del total') + '</div>' +
      '</div>';
    if (hasRepeated && firstTryTotal > 0) {
      cards += '<div class="st">' +
        '<div class="l"><i class="ti ti-medal"></i>1a matrícula</div>' +
        '<div class="v">' + firstTryPct + '%</div>' +
        '<div class="s">' + firstTryPassed + ' de ' + firstTryTotal + ' aprovades a la 1a</div>' +
      '</div>';
    }

    // Proper esdeveniment (del calendari)
    const today = new Date();
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const upcoming = (state.events || [])
      .filter(ev => new Date(ev.date + 'T00:00:00') >= todayMid)
      .sort((a, b) => a.date.localeCompare(b.date));
    if (upcoming.length === 0) {
      cards += '<button type="button" class="st ev" onclick="switchPage(\'calendar\')">' +
          '<div class="l"><i class="ti ti-calendar-event"></i>Proper esdeveniment</div>' +
          '<div class="v t">Cap esdeveniment</div>' +
          '<div class="s">Afegeix un parcial o una entrega al calendari</div>' +
        '</button>';
    } else {
      const ev = upcoming[0];
      const days = daysBetween(todayMid, new Date(ev.date + 'T00:00:00'));
      const subject = ev.subjectId ? state.subjects.find(s => s.id === ev.subjectId) : null;
      const type = getEventType(ev.type);
      const baseName = ev.title || type.label;
      const sig = subject ? (subject.sigla || subject.name || '') : '';
      const name = sig && !baseName.toUpperCase().includes(sig.toUpperCase()) ? baseName + ' · ' + sig : baseName;
      const when = days === 0 ? 'Avui' : days === 1 ? 'Demà' : 'd\'aquí a ' + days + ' dies';
      const urgency = days <= 3 ? ' urgent' : days <= 7 ? ' soon' : '';
      cards += '<button type="button" class="st ev" onclick="switchPage(\'calendar\')">' +
          '<div class="l"><i class="ti ti-calendar-event"></i>Proper esdeveniment</div>' +
          '<div class="v t" title="' + escapeHtml(name) + '">' + escapeHtml(name) + '</div>' +
          '<span class="days' + urgency + '">' + when + '</span>' +
          (upcoming.length > 1 ? '<div class="s">+' + (upcoming.length - 1) + ' més al calendari</div>' : '') +
        '</button>';
    }

    dash.innerHTML = cards;
  }

  window.switchSubjectEval = function(subjectId, evalId) {
    const s = state.subjects.find(x => x.id === subjectId);
    if (!s) return;
    s.activeEval = evalId;
    save();
    render();
  };

  window.onGradeInput = function(ev) {
    const inp = ev.target;
    const sId = inp.dataset.subject;
    const pId = inp.dataset.part;
    const value = inp.value;
    const s = state.subjects.find(x => x.id === sId);
    if (!s) return;
    const activeParts = getActiveParts(s);
    const p = activeParts.find(x => x.id === pId);
    if (!p) return;
    if (value === '' || value === null) {
      p.grade = null;
      save();
      updateCardLive(sId);
      return;
    }
    if (!/^-?\d*[.,]?\d*$/.test(value)) {
      inp.value = value.slice(0, -1);
      return;
    }
    if (value.endsWith('.') || value.endsWith(',')) return;
    const v = parseNum(value);
    if (v === null) return;
    p.grade = Math.max(0, Math.min(10, v));
    save();
    updateCardLive(sId);
  };

  window.onGradeBlur = function(ev) {
    const sId = ev.target.dataset.subject;
    const s = state.subjects.find(x => x.id === sId);
    if (!s) return;
    const pId = ev.target.dataset.part;
    const activeParts = getActiveParts(s);
    const p = activeParts.find(x => x.id === pId);
    if (p && ev.target.value !== '' && (ev.target.value.endsWith('.') || ev.target.value.endsWith(','))) {
      const v = parseNum(ev.target.value);
      if (v !== null) p.grade = Math.max(0, Math.min(10, v));
      save();
      if (v !== null) ev.target.value = String(p.grade); // "7," -> "7"
    }
    // No es torna a dibuixar res aquí: tot s'actualitza en directe a updateCardLive.
    // (Redibuixar en sortir d'una casella feia perdre el focus en anar amb Tab o clic a la següent.)
  };

  function updateCardLive(subjectId) {
    const s = state.subjects.find(x => x.id === subjectId);
    if (!s) return;
    const card = document.querySelector('[data-card-id="' + subjectId + '"]');
    if (!card) return;
    // Animació en canviar a aprovada / suspesa
    const stType = getStatusType(s);
    if (prevStatus[s.id] !== stType) {
      prevStatus[s.id] = stType;
      const animCls = stType === 'pass' ? 'passed-anim' : stType === 'fail' ? 'failed-anim' : '';
      card.classList.remove('passed-anim', 'failed-anim');
      if (animCls && !REDUCED_MOTION) {
        void card.offsetWidth;
        card.classList.add(animCls);
        setTimeout(() => card.classList.remove(animCls), 1400);
      }
    }
    // Refresca resum, barra, estat i pistes sense tornar a dibuixar les caselles (així no es perd el cursor)
    const m = cardMetrics(s);
    card.querySelector('.card-hero').innerHTML = cardHeroHtml(s, m);
    const cw = card.querySelector('[data-closed]'); if (cw) cw.innerHTML = cardClosedHtml(s, m);
    card.querySelector('.card-barwrap').innerHTML = cardBarHtml(m);
    card.querySelector('.card-foot').innerHTML = cardChipHtml(s);
    m.parts.forEach(p => {
      const tile = card.querySelector('.tile[data-part="' + p.id + '"]');
      if (!tile) return;
      tile.classList.remove('g', 'b');
      const tone = partTone(p);
      if (tone) tile.classList.add(tone);
      const inp = tile.querySelector('input');
      if (inp) inp.placeholder = tileHint(s, p);
    });

    renderDashboard();
  }

  window.deleteSubject = function(subjectId) {
    // Sense confirm(): s'elimina i es pot desfer des de l'avís durant uns segons
    const idx = state.subjects.findIndex(s => s.id === subjectId);
    if (idx < 0) return;
    const removed = state.subjects[idx];
    state.subjects = state.subjects.filter(s => s.id !== subjectId);
    save(); renderFilters(); render();
    showToast('Assignatura eliminada', { icon: 'ti-trash', undo: () => {
      state.subjects.splice(Math.min(idx, state.subjects.length), 0, removed);
      save(); renderFilters(); render();
      showToast('Assignatura restaurada');
    } });
  };

  window.onDragStart = function(ev, id) {
    if (!reorderMode) return;
    dragSrcId = id;
    ev.dataTransfer.effectAllowed = 'move';
    ev.currentTarget.classList.add('dragging');
  };
  window.onDragOver = function(ev) {
    if (!reorderMode || !dragSrcId) return;
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
    ev.currentTarget.classList.add('drag-over');
  };
  window.onDragLeave = function(ev) {
    ev.currentTarget.classList.remove('drag-over');
  };
  window.onDrop = function(ev, targetId) {
    ev.preventDefault();
    ev.currentTarget.classList.remove('drag-over');
    if (!dragSrcId || dragSrcId === targetId) return;
    const srcIdx = state.subjects.findIndex(s => s.id === dragSrcId);
    const tgtIdx = state.subjects.findIndex(s => s.id === targetId);
    if (srcIdx === -1 || tgtIdx === -1) return;
    const [moved] = state.subjects.splice(srcIdx, 1);
    state.subjects.splice(tgtIdx, 0, moved);
    save(); render();
  };
  window.onDragEnd = function(ev) {
    ev.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    dragSrcId = null;
  };

  window.openModal = function(subjectId) {
    editingId = subjectId || null;
    modalTemplateCode = null;
    if (editingId) {
      draft = JSON.parse(JSON.stringify(state.subjects.find(x => x.id === editingId)));
    } else {
      const usedColors = state.subjects.map(x => x.color);
      const freeColor = PALETTE.find(p => !usedColors.includes(p.name)) || PALETTE[state.subjects.length % PALETTE.length];
      const defaultQuatri = (activeFilter !== 'ALL' && QUATRIS.includes(activeFilter)) ? activeFilter : '25-26 Q2';
      const firstEvalId = genId();
      draft = { id: genId(), sigla: '', fullName: '', color: freeColor.name, quatri: defaultQuatri, ects: 6,
        evaluations: [{ id: firstEvalId, name: 'Avaluació', parts: [{ id: genId(), name: '', weight: 100, grade: null }] }],
        activeEval: firstEvalId };
    }
    renderModal();
  };

  let modalActiveEval = null;

  // ---- Plantilles d'avaluació (dades a plantilles-gei.js) ----
  let modalTemplateCode = null;
  function allTemplates() { return Array.isArray(window.FIBERCALC_TEMPLATES) ? window.FIBERCALC_TEMPLATES : []; }
  function templatesAvailable() {
    return !editingId && allTemplates().length > 0 && (!state.career || state.career === 'gei');
  }
  function templateLabel(t) { return t.code + ' — ' + t.name; }
  function formatTplDate(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? (m[3] + '/' + m[2] + '/' + m[1]) : '';
  }
  function templateSectionHtml() {
    if (!templatesAvailable()) return '';
    const tpls = allTemplates();
    const current = tpls.find(t => t.code === modalTemplateCode);
    const options = tpls.map(t => '<option value="' + escapeHtml(templateLabel(t)) + '"></option>').join('');
    let info = '';
    if (current) {
      const url = (window.FIBERCALC_TEMPLATE_URL_BASE || '') + encodeURIComponent(current.code);
      info = '<div class="tpl-note" id="tpl-note">' +
        '<strong>Plantilla orientativa.</strong> ' +
        (current.approx ? 'Els pesos són aproximats. ' : '') +
        'Els pesos poden canviar segons el curs i el professor' +
        (formatTplDate(current.checked) ? ' (comprovat el ' + formatTplDate(current.checked) + ')' : '') +
        '. <a href="' + escapeHtml(url) + '" target="_blank" rel="noopener">Consulta la guia oficial a la FIB</a>.' +
        (current.note ? '<div class="tpl-note-extra">' + escapeHtml(current.note) + '</div>' : '') +
        '</div>';
    }
    return '<div class="tpl-section">' +
      '<label for="modal-template">Plantilla del grau <span style="color:var(--text-tertiary);font-weight:400;">(opcional)</span></label>' +
      '<input type="text" id="modal-template" list="modal-template-list" autocomplete="off" ' +
        'placeholder="Cerca per sigla o nom (ex. IDI)" ' +
        'value="' + escapeHtml(current ? templateLabel(current) : '') + '" ' +
        'oninput="onTemplateInput(this.value,false)" onchange="onTemplateInput(this.value,true)" />' +
      '<datalist id="modal-template-list">' + options + '</datalist>' +
      info + '</div>';
  }
  function applyTemplate(t) {
    captureModalFields();
    const evs = t.evaluations.map(ev => ({
      id: genId(),
      name: ev.name,
      parts: ev.parts.map(pt => ({ id: genId(), name: pt[0], weight: pt[1], grade: null }))
    }));
    draft.sigla = t.code;
    draft.fullName = t.name;
    draft.ects = t.ects;
    draft.evaluations = evs;
    draft.activeEval = evs[0].id;
    modalActiveEval = evs[0].id;
    modalTemplateCode = t.code;
    renderModal();
  }
  window.onTemplateInput = function(value, isChange) {
    const v = (value || '').trim().toLowerCase();
    if (!v) return;
    const tpls = allTemplates();
    let t = tpls.find(x => templateLabel(x).toLowerCase() === v);
    if (!t && isChange) t = tpls.find(x => x.code.toLowerCase() === v);
    if (t && t.code !== modalTemplateCode) applyTemplate(t);
  };

  function renderEvalTabs() {
    const container = document.getElementById('modal-eval-tabs');
    if (!container) return;
    const html = draft.evaluations.map(ev => {
      const cls = ev.id === modalActiveEval ? 'eval-tab active' : 'eval-tab';
      return '<button type="button" class="' + cls + '" onclick="switchModalEval(\'' + ev.id + '\')">' +
        '<span class="eval-tab-name">' + escapeHtml(ev.name) + '</span>' +
        (draft.evaluations.length > 1 ? '<span class="eval-tab-del" onclick="event.stopPropagation();removeEvaluation(\'' + ev.id + '\')" title="Eliminar avaluació"><i class="ti ti-x"></i></span>' : '') +
      '</button>';
    }).join('');
    container.innerHTML = html +
      '<button type="button" class="eval-tab-add" onclick="addEvaluation()" title="Afegir avaluació"><i class="ti ti-plus"></i></button>';
  }

  function renderEvalContent() {
    const currentEval = draft.evaluations.find(e => e.id === modalActiveEval);
    if (!currentEval) return;
    const nameInput = document.getElementById('modal-eval-name');
    if (nameInput && document.activeElement !== nameInput) nameInput.value = currentEval.name;
    const partsContainer = document.getElementById('parts-edit');
    if (!partsContainer) return;
    partsContainer.innerHTML = currentEval.parts.map(p =>
      '<div class="part-edit">' +
        '<input type="text" placeholder="Nom (ex. Examen final)" value="' + escapeHtml(p.name) + '" data-part-id="' + p.id + '" data-field="name" />' +
        '<input type="number" placeholder="%" min="0" max="100" step="0.1" value="' + p.weight + '" data-part-id="' + p.id + '" data-field="weight" />' +
        '<button class="icon-btn" onclick="removePart(\'' + p.id + '\')" aria-label="Eliminar"><i class="ti ti-x"></i></button>' +
      '</div>'
    ).join('');
    updateWarn();
    syncDraftInputs();
  }

  // Errors de validació al costat del camp (en lloc d'un alert), sense perdre la resta de dades del formulari.
  function clearFieldErrors() {
    document.querySelectorAll('#modal-root .field-error').forEach(n => n.remove());
    document.querySelectorAll('#modal-root .input-invalid').forEach(n => n.classList.remove('input-invalid'));
  }
  function showFieldError(input, message) {
    clearFieldErrors();
    input.classList.add('input-invalid');
    const err = document.createElement('div');
    err.className = 'field-error';
    err.setAttribute('role', 'alert');
    err.textContent = message;
    // A la fila d'apartats (graella de 3 columnes) l'error va sota la fila sencera
    (input.closest('.part-edit') || input).insertAdjacentElement('afterend', err);
    input.addEventListener('input', clearFieldErrors, { once: true });
    input.focus();
    if (input.scrollIntoView) input.scrollIntoView({ block: 'nearest' });
  }

  function updateWarn() {
    const currentEval = draft.evaluations.find(e => e.id === modalActiveEval);
    if (!currentEval) return;
    const totalW = currentEval.parts.reduce((a,p) => a + (parseFloat(p.weight) || 0), 0);
    const warnContainer = document.getElementById('warn-root');
    if (!warnContainer) return;
    warnContainer.innerHTML = totalW < 100 ? '<div class="warn">⚠ La suma dels percentatges és ' + fmt(totalW) + '% (ha de ser ≥ 100%)</div>' : '';
  }

  function renderModal() {
    const root = document.getElementById('modal-root');
    if (!modalActiveEval || !draft.evaluations.find(e => e.id === modalActiveEval)) {
      modalActiveEval = draft.evaluations[0].id;
    }
    const currentEval = draft.evaluations.find(e => e.id === modalActiveEval);
    const quatriOptions = QUATRIS.map(q =>
      '<option value="' + q + '" ' + (q === draft.quatri ? 'selected' : '') + '>' + q + '</option>'
    ).join('');

    root.innerHTML =
      // Sense onclick al fons: un clic fora no ha de tancar el formulari i fer perdre les dades.
      // Es tanca només amb Cancel·lar o Desar.
      '<div class="modal-bg">' +
        '<div class="modal">' +
          '<h3>' + (editingId ? 'Editar assignatura' : 'Nova assignatura') + '</h3>' +
          templateSectionHtml() +
          '<div><label>Sigla <span style="color:var(--accent-dark);">*</span></label>' +
            '<input type="text" id="modal-sigla" value="' + escapeHtml(draft.sigla || '') + '" placeholder="Ex. SO" maxlength="12" /></div>' +
          '<div><label>Nom complet <span style="color:var(--text-tertiary);font-weight:400;">(opcional)</span></label>' +
            '<input type="text" id="modal-fullname" value="' + escapeHtml(draft.fullName || '') + '" placeholder="Ex. Sistemes Operatius" /></div>' +
          '<div><label>Quatrimestre</label>' +
            '<select id="modal-quatri">' + quatriOptions + '</select></div>' +
          '<div><label>ECTS</label>' +
            '<input type="number" id="modal-ects" value="' + (draft.ects || 6) + '" min="0.5" max="60" step="0.5" /></div>' +
          '<div><label>Color</label><div id="modal-color-picker"></div></div>' +
          '<div><label>Tipus d\'avaluació</label>' +
            '<div class="eval-tabs" id="modal-eval-tabs"></div>' +
          '</div>' +
          '<div class="eval-name-row">' +
            '<label>Nom de l\'avaluació</label>' +
            '<input type="text" id="modal-eval-name" value="' + escapeHtml(currentEval.name) + '" oninput="renameEvaluation(this.value)" placeholder="Ex. Continuada / Final" />' +
          '</div>' +
          '<div><label>Apartats i percentatges</label>' +
            '<div class="parts-edit" id="parts-edit"></div>' +
            '<button class="btn-ghost" onclick="addPart()" style="margin-top:6px;"><i class="ti ti-plus"></i>Afegir apartat</button>' +
            '<div id="warn-root"></div>' +
          '</div>' +
          '<div class="modal-actions">' +
            '<button class="btn" onclick="closeModal()">Cancel·lar</button>' +
            '<button class="btn btn-primary" onclick="saveModal()">Desar</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    renderEvalTabs();
    renderEvalContent();
    renderColorPicker();
  }

  function syncDraftInputs() {
    document.querySelectorAll('.part-edit input').forEach(inp => {
      inp.addEventListener('input', function() {
        const pid = this.dataset.partId;
        const f = this.dataset.field;
        const ev = draft.evaluations.find(e => e.id === modalActiveEval);
        if (!ev) return;
        const p = ev.parts.find(x => x.id === pid);
        if (p) {
          if (f === 'weight') p.weight = parseFloat(this.value) || 0;
          else p[f] = this.value;
        }
        updateWarn();
      });
    });
  }

  window.selectColor = function(name) {
    draft.color = name;
    renderColorPicker();
  };

  function renderColorPicker() {
    const container = document.getElementById('modal-color-picker');
    if (!container) return;
    const isCustom = !PALETTE.find(p => p.name === draft.color);
    const swatchesHtml = PALETTE.map(p =>
      '<div class="color-swatch ' + (p.name === draft.color ? 'selected' : '') + '" style="background:' + p.bg + ';" data-color="' + p.name + '" onclick="selectColor(\'' + p.name + '\')"></div>'
    ).join('') +
      '<div class="color-swatch custom ' + (isCustom ? 'selected' : '') + '" onclick="document.getElementById(\'modal-custom-color\').click()" title="Color personalitzat"></div>';
    const customValue = isCustom ? draft.color : '#0EBB80';
    // L'<input type="color"> es crea sempre igual i no es torna a crear mentre el selector és obert
    // (vegeu selectCustomColor). La fila només s'amaga/mostra.
    container.innerHTML = '<div class="color-picker">' + swatchesHtml + '</div>' +
      '<div class="color-custom-row" id="modal-custom-row"' + (isCustom ? '' : ' style="display:none;"') + '>' +
        '<input type="color" id="modal-custom-color" value="' + customValue + '" oninput="selectCustomColor(this.value)" onchange="showCustomColorRow()" />' +
        '<label id="modal-custom-label">Color personalitzat: ' + customValue.toUpperCase() + '</label>' +
      '</div>';
  }

  function captureModalFields() {
    // Conservar valors actuals dels camps abans de re-renderitzar tot el modal
    const sigla = document.getElementById('modal-sigla');
    const fullname = document.getElementById('modal-fullname');
    const quatri = document.getElementById('modal-quatri');
    const ects = document.getElementById('modal-ects');
    if (sigla) draft.sigla = sigla.value;
    if (fullname) draft.fullName = fullname.value;
    if (quatri) draft.quatri = quatri.value;
    if (ects) draft.ects = parseFloat(ects.value) || 6;
  }

  window.addPart = function() {
    const ev = draft.evaluations.find(e => e.id === modalActiveEval);
    if (ev) ev.parts.push({ id: genId(), name: '', weight: 0, grade: null });
    renderEvalContent();
  };
  window.removePart = function(pid) {
    const ev = draft.evaluations.find(e => e.id === modalActiveEval);
    if (ev) ev.parts = ev.parts.filter(p => p.id !== pid);
    renderEvalContent();
  };
  window.switchModalEval = function(eid) {
    captureModalFields();
    modalActiveEval = eid;
    renderEvalTabs();
    renderEvalContent();
    renderColorPicker();
  };
  window.addEvaluation = function() {
    captureModalFields();
    const newId = genId();
    const num = draft.evaluations.length + 1;
    draft.evaluations.push({ id: newId, name: 'Avaluació ' + num, parts: [{ id: genId(), name: '', weight: 100, grade: null }] });
    modalActiveEval = newId;
    renderEvalTabs();
    renderEvalContent();
    renderColorPicker();
  };
  window.removeEvaluation = function(eid) {
    if (draft.evaluations.length <= 1) { alert('Ha d\'haver-hi com a mínim una avaluació'); return; }
    if (!confirm('Eliminar aquesta avaluació i les seves notes?')) return;
    captureModalFields();
    draft.evaluations = draft.evaluations.filter(e => e.id !== eid);
    if (modalActiveEval === eid) modalActiveEval = draft.evaluations[0].id;
    if (draft.activeEval === eid) draft.activeEval = draft.evaluations[0].id;
    renderEvalTabs();
    renderEvalContent();
    renderColorPicker();
  };
  window.renameEvaluation = function(newName) {
    const ev = draft.evaluations.find(e => e.id === modalActiveEval);
    if (ev) ev.name = newName;
    renderEvalTabs(); // Nomes refrescar les tabs perqu mostrin el nou nom
  };
  window.selectCustomColor = function(hexValue) {
    draft.color = hexValue;
    // No cridem renderColorPicker(): aquest handler s'executa a cada moviment dins del selector natiu,
    // i recrear l'<input type="color"> el feia tancar-se. Només actualitzem l'estat visual.
    const container = document.getElementById('modal-color-picker');
    if (!container) return;
    container.querySelectorAll('.color-swatch').forEach(s => s.classList.toggle('selected', s.classList.contains('custom')));
    const label = document.getElementById('modal-custom-label');
    if (label) label.textContent = 'Color personalitzat: ' + hexValue.toUpperCase();
  };
  window.showCustomColorRow = function() {
    // S'executa quan es tanca el selector (event "change"): ara ja és segur mostrar la fila.
    const row = document.getElementById('modal-custom-row');
    if (row) row.style.display = '';
  };
  window.closeModal = function() {
    document.getElementById('modal-root').innerHTML = '';
    draft = null; editingId = null; modalActiveEval = null;
  };
  window.saveModal = function() {
    const s = draft;
    const wasEditing = !!editingId;
    const siglaInput = document.getElementById('modal-sigla');
    s.sigla = siglaInput.value.trim();
    if (!s.sigla) { alert("La sigla és obligatòria"); return; }
    const fnInput = document.getElementById('modal-fullname');
    s.fullName = fnInput.value.trim();
    const qInput = document.getElementById('modal-quatri');
    s.quatri = qInput.value;
    const eInput = document.getElementById('modal-ects');
    clearFieldErrors();
    // Camp buit = valor per defecte (6), com abans. Qualsevol altre valor ha d'estar dins del rang.
    const ectsRaw = eInput.value.trim();
    const ects = ectsRaw === '' ? 6 : Number(ectsRaw);
    if (!Number.isFinite(ects) || ects <= 0 || ects > 60) {
      showFieldError(eInput, 'Els ECTS han de ser un número més gran que 0 i com a màxim 60.');
      return;
    }
    s.ects = ects;
    // Validar totes les avaluacions
    for (const ev of s.evaluations) {
      if (ev.parts.length === 0) { alert("Cada avaluació ha de tenir com a mínim un apartat (" + ev.name + ")"); return; }
      // Cada pes ha d'estar entre 0 i 100 (els camps ja ho declaren, però el desat no ho feia complir)
      const badPart = ev.parts.find(p => !(p.weight >= 0 && p.weight <= 100));
      if (badPart) {
        if (modalActiveEval !== ev.id) {
          // L'error és en una altra avaluació: la mostrem perquè l'usuari vegi el camp
          modalActiveEval = ev.id;
          renderEvalTabs();
          renderEvalContent();
        }
        const wInput = document.querySelector('#parts-edit input[data-part-id="' + badPart.id + '"][data-field="weight"]');
        if (wInput) showFieldError(wInput, 'El pes ha de ser un percentatge entre 0 i 100.');
        return;
      }
      const tw = ev.parts.reduce((a,p) => a + (parseFloat(p.weight) || 0), 0);
      if (tw < 100) {
        if (!confirm('La suma de "' + ev.name + '" és ' + fmt(tw) + '%. Vols desar igualment?')) return;
      }
    }
    // Conservar notes existents per ID de part
    if (editingId) {
      const idx = state.subjects.findIndex(x => x.id === editingId);
      if (idx >= 0) {
        const existing = state.subjects[idx];
        const existingEvals = existing.evaluations || [];
        s.evaluations.forEach(newEv => {
          const oldEv = existingEvals.find(e => e.id === newEv.id);
          if (oldEv) {
            newEv.parts.forEach(np => {
              const oldP = oldEv.parts.find(op => op.id === np.id);
              if (oldP) np.grade = oldP.grade;
            });
          }
        });
        state.subjects[idx] = s;
      }
    } else {
      state.subjects.push(s);
    }
    save(); closeModal(); renderFilters(); render();
    showToast(wasEditing ? 'Assignatura actualitzada' : 'Assignatura desada');
  };

  const GREETING_VARIANTS = {
    morning: ['Bon dia', 'Bon dia', 'Un dia m\u00e9s aqu\u00ed', 'Amunt avui'],
    afternoon: ['Bona tarda', 'Bona tarda', 'Com va el dia'],
    night: ['Bona nit', 'Bona nit', 'Encara per aqu\u00ed', 'A descansar aviat']
  };

  function getGreeting() {
    if (!state.userName) return 'Les meves notes';
    const h = new Date().getHours();
    let pool;
    if (h >= 6 && h < 13) pool = GREETING_VARIANTS.morning;
    else if (h >= 13 && h < 20) pool = GREETING_VARIANTS.afternoon;
    else pool = GREETING_VARIANTS.night;
    const dayIndex = new Date().getDate() + new Date().getMonth();
    const salutation = pool[dayIndex % pool.length];
    return salutation + ', ' + state.userName;
  }

  function updateGreeting() {
    if (activePage === 'notes') {
      document.getElementById('page-title').textContent = getGreeting();
    }
  }

  window.switchPage = function(page) {
    activePage = page;
    document.getElementById('tab-notes').classList.toggle('active', page === 'notes');
    document.getElementById('tab-stats').classList.toggle('active', page === 'stats');
    document.getElementById('tab-calendar').classList.toggle('active', page === 'calendar');
    document.getElementById('tab-schedule').classList.toggle('active', page === 'schedule');
    document.getElementById('tab-friends').classList.toggle('active', page === 'friends');
    document.getElementById('notes-view').style.display = page === 'notes' ? '' : 'none';
    document.getElementById('stats-view').style.display = page === 'stats' ? '' : 'none';
    document.getElementById('calendar-view').style.display = page === 'calendar' ? '' : 'none';
    document.getElementById('schedule-view').style.display = page === 'schedule' ? '' : 'none';
    document.getElementById('friends-view').style.display = page === 'friends' ? '' : 'none';
    let title;
    if (page === 'notes') title = getGreeting();
    else if (page === 'stats') title = 'Estadístiques';
    else if (page === 'calendar') title = 'Calendari';
    else if (page === 'schedule') title = 'Horari';
    else title = 'Amics';
    document.getElementById('page-title').textContent = title;
    document.getElementById('hero').classList.toggle('compact', page !== 'notes');
    // L'horari té el seu propi quatrimestre: el filtre de quatrimestres ("Totes"...) no hi pinta res
    document.getElementById('filter-bar').style.display = page === 'schedule' ? 'none' : '';
    if (page === 'stats') renderStats();
    if (page === 'calendar') renderCalendar();
    if (page === 'schedule') renderSchedule();
    if (page === 'friends') renderFriends();
    moveTabIndicator(true);
    playEntrance(page);
  };

  // ============ HORARI ============
  // Dades públiques de la FIB (horaris-gei.js, generat amb tools/horaris-gei.py).
  // Cada classe: [assignatura, grup, tipus (T/P/L), dia (1 = dilluns), inici (min), durada (min), aula, idioma]
  const SCH_DIES = ['Dl', 'Dm', 'Dc', 'Dj', 'Dv'];
  const SCH_TIPUS = { T: 'Teoria', P: 'Problemes', L: 'Laboratori' };
  const SCH_ROW = 56; // alçada d'una hora a la graella (px)
  let schedQuery = '';
  let schedView = null; // 'day' | 'week' (per defecte: dia al mòbil, setmana a l'ordinador)
  let schedDay = null;  // 1..5

  function schedData() { return window.FIBERCALC_HORARIS || null; }
  function getSched() {
    const H = schedData();
    if (!state.schedules) state.schedules = {};
    if (!state.schedules[H.quad]) state.schedules[H.quad] = { picks: {} };
    return state.schedules[H.quad];
  }
  function schedCodes() {
    const H = schedData();
    return Array.from(new Set(H.classes.map(c => c[0]))).sort((a, b) => a.localeCompare(b));
  }
  function schedHM(min) { const h = Math.floor(min / 60), m = min % 60; return m ? h + ':' + String(m).padStart(2, '0') : String(h); }
  function schedSlot(c) { return SCH_DIES[c[3] - 1] + ' ' + schedHM(c[4]) + '–' + schedHM(c[4] + c[5]) + 'h'; }
  // Quatrimestre de l'horari en el format de les targetes: 2026Q1 -> "26-27 Q1"
  function schedQuatri() {
    const H = schedData(), y = parseInt(H.quad.slice(2, 4), 10);
    return y + '-' + (y + 1) + ' ' + H.quad.slice(4);
  }
  function schedFindSubject(code) {
    const q = schedQuatri();
    const all = state.subjects.filter(s => String(s.sigla || '').toUpperCase() === code);
    return all.find(s => s.quatri === q) || all[0] || null;
  }
  // Codis de les teves assignatures d'aquest quatrimestre que tenen horari
  function schedMine() {
    const q = schedQuatri(), codes = schedCodes();
    return codes.filter(c => state.subjects.some(s => s.quatri === q && String(s.sigla || '').toUpperCase() === c));
  }
  function schedColor(code) {
    const s = schedFindSubject(code);
    if (s) return getColor(s.color).bg;
    let h = 0; for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) >>> 0;
    return PALETTE[h % PALETTE.length].bg;
  }
  // Grups d'un tipus: Map grup -> franges
  function schedGroups(code, tipus) {
    const H = schedData();
    const m = new Map();
    H.classes.forEach(c => { if (c[0] === code && c[2] === tipus) { if (!m.has(c[1])) m.set(c[1], []); m.get(c[1]).push(c); } });
    return new Map(Array.from(m.entries()).sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10)));
  }
  function schedBlocks() {
    const H = schedData(), picks = getSched().picks, out = [];
    Object.keys(picks).forEach(code => {
      Object.keys(picks[code]).forEach(tipus => {
        const grup = picks[code][tipus];
        H.classes.forEach(c => {
          if (c[0] === code && c[2] === tipus && c[1] === grup) {
            out.push({ code, tipus, grup, dia: c[3], start: c[4], dur: c[5], aula: c[6], idioma: c[7], color: schedColor(code) });
          }
        });
      });
    });
    return out;
  }
  // Reparteix en carrils els blocs que se solapen dins d'un mateix dia
  function schedLayout(blocks) {
    const conflicts = [];
    for (let d = 1; d <= 5; d++) {
      const day = blocks.filter(b => b.dia === d).sort((a, b) => a.start - b.start || b.dur - a.dur);
      let cluster = [], end = -1;
      const flush = () => {
        if (!cluster.length) return;
        const lanes = [];
        cluster.forEach(b => {
          let l = lanes.findIndex(e => e <= b.start);
          if (l < 0) { l = lanes.length; lanes.push(0); }
          lanes[l] = b.start + b.dur; b.lane = l;
        });
        cluster.forEach(b => { b.lanes = lanes.length; b.conflict = cluster.length > 1; });
        if (cluster.length > 1) {
          for (let i = 0; i < cluster.length; i++) for (let j = i + 1; j < cluster.length; j++) {
            const a = cluster[i], c = cluster[j];
            if (a.start < c.start + c.dur && c.start < a.start + a.dur) conflicts.push([a, c]);
          }
        }
        cluster = [];
      };
      day.forEach(b => {
        if (cluster.length && b.start >= end) { flush(); end = -1; }
        cluster.push(b); end = Math.max(end, b.start + b.dur);
      });
      flush();
    }
    return conflicts;
  }

  function schedT(min) { return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0'); }
  // Dilluns de la setmana que toca mostrar (cap de setmana: la següent)
  function schedMonday() {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    const dow = d.getDay();
    d.setDate(d.getDate() + (dow === 0 ? 1 : dow === 6 ? 2 : 1 - dow));
    return d;
  }
  function schedDayView(blocks, todayDow, nowMin) {
    const mon = schedMonday();
    const chips = [1, 2, 3, 4, 5].map(d => {
      const dt = new Date(mon); dt.setDate(mon.getDate() + d - 1);
      const n = blocks.filter(b => b.dia === d).length;
      return '<button type="button" class="sch-chip' + (d === schedDay ? ' on' : '') + (d === todayDow ? ' today' : '') + '" aria-pressed="' + (d === schedDay) + '" onclick="schedSetDay(' + d + ')">' +
        '<span>' + SCH_DIES[d - 1] + '</span><b>' + dt.getDate() + '</b><i class="' + (n ? 'has' : '') + '"></i></button>';
    }).join('');
    const day = blocks.filter(b => b.dia === schedDay).sort((x, y) => x.start - y.start);
    const isToday = schedDay === todayDow;
    const list = day.length ? day.map(b => {
      let when = '';
      if (isToday) {
        const end = b.start + b.dur;
        if (nowMin >= b.start && nowMin < end) when = '<div class="sch-bw"><b>ARA</b><small>fins a les ' + schedT(end) + '</small></div>';
        else if (nowMin < b.start) { const m = b.start - nowMin; when = '<div class="sch-bw"><b>' + (m >= 60 ? Math.round(m / 60) + ' h' : m + ' min') + '</b><small>per començar</small></div>'; }
        else when = '<div class="sch-bw"><b>Fet</b><small>acabada</small></div>';
      }
      const done = isToday && nowMin >= b.start + b.dur;
      return '<div class="sch-dr"><div class="sch-dt"><b>' + schedT(b.start) + '</b><small>' + schedT(b.start + b.dur) + '</small></div>' +
        '<div class="sch-big t-' + b.tipus + (b.conflict ? ' conflict' : '') + (done ? ' done' : '') + '" style="--bc:' + b.color + '">' +
          '<div><div class="sch-bs">' + escapeHtml(b.code) + '</div><div class="sch-bm">' + SCH_TIPUS[b.tipus] + ' · grup ' + escapeHtml(b.grup) + ' · ' + escapeHtml(b.aula) + '</div></div>' + when + '</div></div>';
    }).join('') : '<div class="sch-free"><i class="ti ti-sun"></i>Cap classe aquest dia</div>';
    return '<div class="sch-dayview"><div class="sch-chips">' + chips + '</div><div class="sch-dlist">' + list + '</div></div>';
  }
  window.schedSetView = function(v) { schedView = v; renderSchedule(); };
  window.schedSetDay = function(d) { schedDay = d; renderSchedule(); };

  function renderSchedule() {
    const root = document.getElementById('schedule-content');
    const H = schedData();
    if (!root) return;
    if (!H) { root.innerHTML = '<div class="grid-empty">No s\'han pogut carregar els horaris.</div>'; return; }
    const picks = getSched().picks;
    const codes = Object.keys(picks);
    const upd = H.updated ? H.updated.split('-').reverse().join('/') : '';
    const todayDow = new Date().getDay(); // 1..5 = dl..dv
    if (!schedView) schedView = window.matchMedia && window.matchMedia('(max-width: 700px)').matches ? 'day' : 'week';
    if (!schedDay) schedDay = (todayDow >= 1 && todayDow <= 5) ? todayDow : 1;
    const head =
      '<div class="sch-top"><div><h3 class="sch-title">' + escapeHtml(H.label) + '</h3>' +
      '<div class="sch-sub">Horaris oficials de la FIB · GEI · actualitzat el ' + escapeHtml(upd) + '</div></div>' +
      '<div class="sch-tools">' +
        (codes.length ? '<div class="sch-seg" role="tablist">' +
          '<button type="button" class="' + (schedView === 'day' ? 'on' : '') + '" onclick="schedSetView(\'day\')">Dia</button>' +
          '<button type="button" class="' + (schedView === 'week' ? 'on' : '') + '" onclick="schedSetView(\'week\')">Setmana</button></div>' : '') +
        '<button type="button" class="btn btn-primary" onclick="openSchedAdd()"><i class="ti ti-plus"></i><span class="sch-add-t">Afegeix assignatures</span></button>' +
      '</div></div>';

    if (!codes.length) {
      const mine = schedMine();
      root.innerHTML = head +
        '<div class="sch-empty"><div class="sch-empty-ic"><i class="ti ti-calendar-week"></i></div>' +
        '<h4>Encara no tens horari</h4>' +
        '<p>Tria les teves assignatures i el grup de cadascuna, i et dibuixem la setmana.</p>' +
        '<div class="sch-empty-actions">' +
          (mine.length ? '<button type="button" class="btn btn-primary" onclick="schedAddMine()"><i class="ti ti-sparkles"></i>Afegeix les meves (' + mine.map(escapeHtml).join(', ') + ')</button>' : '') +
          '<button type="button" class="btn" onclick="openSchedAdd()">Triar assignatures</button>' +
        '</div></div>';
      return;
    }

    // ---- Graella setmanal
    const blocks = schedBlocks();
    const conflicts = schedLayout(blocks);
    let t0 = 24 * 60, t1 = 0;
    blocks.forEach(b => { t0 = Math.min(t0, Math.floor(b.start / 60) * 60); t1 = Math.max(t1, Math.ceil((b.start + b.dur) / 60) * 60); });
    if (!blocks.length) { t0 = 8 * 60; t1 = 14 * 60; }
    if (t1 - t0 < 6 * 60) t1 = t0 + 6 * 60;
    const hours = (t1 - t0) / 60;
    const now = new Date(), nowMin = now.getHours() * 60 + now.getMinutes();
    let times = '', cols = '', heads = '<div class="sch-corner"></div>';
    for (let i = 0; i <= hours; i++) times += '<span style="top:' + (i * SCH_ROW) + 'px">' + (t0 / 60 + i) + ':00</span>';
    for (let d = 1; d <= 5; d++) {
      heads += '<div class="sch-dh' + (d === todayDow ? ' today' : '') + '">' + SCH_DIES[d - 1] + '</div>';
      const bs = blocks.filter(b => b.dia === d).map(b => {
        const top = (b.start - t0) / 60 * SCH_ROW, h = b.dur / 60 * SCH_ROW;
        const tip = b.code + ' · ' + SCH_TIPUS[b.tipus] + ' grup ' + b.grup + '\n' + schedSlot([0, 0, 0, b.dia, b.start, b.dur]) + '\nAula ' + b.aula + (b.idioma ? ' · ' + b.idioma : '');
        return '<div class="sch-b t-' + b.tipus + (b.conflict ? ' conflict' : '') + (h < 70 ? ' sm' : '') + '" title="' + escapeHtml(tip) + '" style="--bc:' + b.color + ';top:' + (top + 1) + 'px;height:' + (h - 2) + 'px;left:calc(' + (b.lane / b.lanes * 100) + '% + 2px);width:calc(' + (100 / b.lanes) + '% - 4px)">' +
          '<b>' + escapeHtml(b.code) + '</b><span class="sch-bt">' + b.tipus + ' ' + escapeHtml(b.grup) + '</span><em>' + escapeHtml(b.aula) + '</em></div>';
      }).join('');
      const nowLine = (d === todayDow && nowMin >= t0 && nowMin <= t1) ? '<div class="sch-now" style="top:' + ((nowMin - t0) / 60 * SCH_ROW) + 'px"></div>' : '';
      cols += '<div class="sch-col' + (d === todayDow ? ' today' : '') + '">' + bs + nowLine + '</div>';
    }
    const grid = '<div class="sch-card"><div class="sch-grid" style="--rows:' + hours + ';--row:' + SCH_ROW + 'px">' +
      heads + '<div class="sch-times">' + times + '</div>' + cols + '</div></div>';

    // ---- Solapaments
    let warn = '';
    if (conflicts.length) {
      const items = conflicts.slice(0, 4).map(([a, c]) =>
        '<li><b>' + escapeHtml(a.code) + ' ' + a.tipus + '</b> i <b>' + escapeHtml(c.code) + ' ' + c.tipus + '</b> · ' + schedSlot([0, 0, 0, a.dia, Math.max(a.start, c.start), Math.min(a.start + a.dur, c.start + c.dur) - Math.max(a.start, c.start)]) + '</li>').join('');
      warn = '<div class="sch-warn"><i class="ti ti-alert-triangle"></i><div><strong>Tens ' + conflicts.length + (conflicts.length === 1 ? ' solapament' : ' solapaments') + '</strong><ul>' + items + '</ul></div></div>';
    }

    // ---- Selecció de grups per assignatura
    const subj = codes.map(code => {
      const s = schedFindSubject(code);
      const color = schedColor(code);
      const pk = picks[code];
      const rows = ['T', 'P', 'L'].map(tp => {
        const g = schedGroups(code, tp);
        if (!g.size) return '';
        const fam = pk.T ? String(pk.T)[0] : null;
        const pills = Array.from(g.entries()).map(([grup, rs]) => {
          const slots = rs.map(schedSlot);
          const txt = slots.slice(0, 2).join(' · ') + (slots.length > 2 ? ' +' + (slots.length - 2) : '');
          const lang = rs[0][7] ? '<i class="lang">' + escapeHtml(rs[0][7]) + '</i>' : '';
          const on = pk[tp] === grup, rec = tp !== 'T' && fam && String(grup)[0] === fam;
          return '<button type="button" class="sch-pill' + (on ? ' on' : '') + (rec && !on ? ' fam' : '') + '" aria-pressed="' + on + '" onclick="schedPick(\'' + code + '\',\'' + tp + '\',\'' + grup + '\')"><b>' + escapeHtml(grup) + '</b><small>' + escapeHtml(txt) + '</small>' + lang + '</button>';
        }).join('');
        return '<div class="sch-row"><div class="sch-tl">' + SCH_TIPUS[tp] + '</div><div class="sch-pills">' + pills + '</div></div>';
      }).join('');
      return '<div class="sch-subj" style="--c:' + color + '"><div class="sch-sh"><span class="sch-sig">' + escapeHtml(code) + '</span>' +
        '<span class="sch-nm">' + escapeHtml(s && s.fullName ? s.fullName : '') + '</span>' +
        '<button type="button" class="sch-x" aria-label="Treure ' + escapeHtml(code) + '" title="Treure de l\'horari" onclick="schedToggle(\'' + code + '\')"><i class="ti ti-x"></i></button></div>' + rows + '</div>';
    }).join('');

    // ---- Avisos de la FIB sobre els grups triats
    const avisos = [];
    H.notes.forEach(([code, text]) => {
      if (!picks[code]) return;
      const m = text.match(/\b(\d{2})([TPL])\b/);
      if (m && picks[code][m[2]] !== m[1]) return;
      avisos.push('<li><b>' + escapeHtml(code) + '</b> ' + escapeHtml(text.replace(/^\S+\s/, '')) + '</li>');
    });
    const avisosHtml = avisos.length ? '<div class="sch-avisos"><h4><i class="ti ti-info-circle"></i>Avisos de la FIB</h4><ul>' + avisos.join('') + '</ul></div>' : '';

    const main = schedView === 'day' ? schedDayView(blocks, todayDow, nowMin) : grid;
    root.innerHTML = head + warn + main + '<h4 class="sch-h">Les meves assignatures</h4><div class="sch-subjs">' + subj + '</div>' + avisosHtml;
  }

  window.schedPick = function(code, tipus, grup) {
    const pk = getSched().picks[code];
    if (!pk) return;
    if (pk[tipus] === grup) delete pk[tipus]; else pk[tipus] = grup;
    save(); renderSchedule();
  };
  window.schedToggle = function(code) {
    const picks = getSched().picks;
    if (picks[code]) delete picks[code]; else picks[code] = {};
    save(); renderSchedule(); renderSchedAddList();
  };
  window.schedAddMine = function() {
    const picks = getSched().picks;
    let n = 0;
    schedMine().forEach(c => { if (!picks[c]) { picks[c] = {}; n++; } });
    save(); renderSchedule();
    if (n) showToast(n + (n === 1 ? ' assignatura afegida' : ' assignatures afegides') + '. Tria ara el grup de cadascuna.');
  };
  window.openSchedAdd = function() {
    schedQuery = '';
    document.getElementById('modal-root').innerHTML =
      '<div class="modal-bg" id="sched-add"><div class="modal sch-modal" role="dialog" aria-label="Afegeix assignatures">' +
        '<h3>Afegeix assignatures</h3>' +
        '<input type="text" id="sched-q" placeholder="Cerca per sigla (IDI, XC, PRO1…)" autocomplete="off" oninput="schedFilterAdd(this.value)" />' +
        '<div id="sched-add-list" class="sch-add-list"></div>' +
        '<div class="modal-actions"><button class="btn btn-primary" onclick="closeModal()">Fet</button></div>' +
      '</div></div>';
    renderSchedAddList();
    const q = document.getElementById('sched-q'); if (q) q.focus();
  };
  window.schedFilterAdd = function(v) { schedQuery = String(v || '').trim().toUpperCase(); renderSchedAddList(); };
  function renderSchedAddList() {
    const box = document.getElementById('sched-add-list');
    if (!box) return;
    const picks = getSched().picks, codes = schedCodes();
    const pill = c => '<button type="button" class="sch-add-pill' + (picks[c] ? ' on' : '') + '" aria-pressed="' + !!picks[c] + '" onclick="schedToggle(\'' + c + '\')">' + (picks[c] ? '<i class="ti ti-check"></i>' : '') + escapeHtml(c) + '</button>';
    const mine = schedMine();
    let html = '';
    if (!schedQuery && mine.length) html += '<div class="sch-add-h">Les teves assignatures de ' + escapeHtml(schedQuatri()) + '</div><div class="sch-add-pills">' + mine.map(pill).join('') + '</div>';
    const rest = codes.filter(c => (!schedQuery ? !mine.includes(c) : c.includes(schedQuery)));
    html += '<div class="sch-add-h">' + (schedQuery ? 'Resultats' : 'Totes les assignatures del GEI') + '</div>' +
      (rest.length ? '<div class="sch-add-pills">' + rest.map(pill).join('') + '</div>' : '<div class="sch-add-none">Cap assignatura amb aquesta sigla.</div>');
    box.innerHTML = html;
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('sched-add')) closeModal();
  });

  // ============ CALENDAR ============
  function renderCalendar() {
    const root = document.getElementById('calendar-content');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = (firstDay.getDay() + 6) % 7; // 0 = dilluns
    const daysInMonth = lastDay.getDate();

    // Comencem la graella des del dilluns abans del primer dia
    const gridStart = new Date(year, month, 1 - startWeekday);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      cells.push(d);
    }

    // Organitzar events per data
    const eventsByDate = {};
    state.events.forEach(ev => {
      if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
      eventsByDate[ev.date].push(ev);
    });

    const monthNames = ['Gener','Febrer','Març','Abril','Maig','Juny','Juliol','Agost','Setembre','Octubre','Novembre','Desembre'];
    const monthTitle = monthNames[month] + ' ' + year;

    let gridHtml = '';
    ['Dl','Dt','Dc','Dj','Dv','Ds','Dg'].forEach(d => {
      gridHtml += '<div class="cal-dow">' + d + '</div>';
    });

    cells.forEach(d => {
      const ds = toLocalDateStr(d);
      const isToday = d.getTime() === today.getTime();
      const otherMonth = d.getMonth() !== month;
      const events = eventsByDate[ds] || [];
      const dots = events.slice(0, 3).map(ev => '<div class="cal-day-dot" style="background:' + getEventType(ev.type).color + ';"></div>').join('');
      const more = events.length > 3 ? '<div class="cal-day-more">+' + (events.length - 3) + '</div>' : '';
      gridHtml += '<div class="cal-day ' + (otherMonth ? 'other-month ' : '') + (isToday ? 'today' : '') + '" onclick="openEventModal(\'' + ds + '\')">' +
        '<div class="cal-day-num">' + d.getDate() + '</div>' +
        '<div class="cal-day-events">' + dots + '</div>' +
        more +
      '</div>';
    });

    // Llista cronolgica
    const sortedEvents = [...state.events].sort((a, b) => a.date.localeCompare(b.date));
    const upcoming = sortedEvents.filter(ev => new Date(ev.date + 'T00:00:00') >= today);
    const past = sortedEvents.filter(ev => new Date(ev.date + 'T00:00:00') < today).reverse();

    function eventHtml(ev, isPast) {
      const evDate = new Date(ev.date + 'T00:00:00');
      const days = daysBetween(today, evDate);
      let countdownText, countdownCls = '';
      if (days === 0) { countdownText = 'AVUI'; countdownCls = 'today'; }
      else if (days > 0) {
        if (days <= 3) countdownCls = 'urgent';
        else if (days <= 7) countdownCls = 'soon';
        countdownText = 'en ' + days + ' d.';
      } else { countdownText = 'fa ' + Math.abs(days) + ' d.'; countdownCls = 'past'; }

      const type = getEventType(ev.type);
      const subject = ev.subjectId ? state.subjects.find(s => s.id === ev.subjectId) : null;
      const subjectLabel = subject ? (subject.sigla || subject.name || '') : '';

      const monthShort = ['gen','feb','mar','abr','mai','jun','jul','ago','set','oct','nov','des'][evDate.getMonth()];

      return '<div class="event-item ' + (isPast ? 'past' : '') + '" onclick="editEvent(\'' + ev.id + '\')">' +
        '<div class="event-color-bar" style="background:' + type.color + ';"></div>' +
        '<div class="event-date">' +
          '<div class="event-date-day">' + evDate.getDate() + '</div>' +
          '<div class="event-date-month">' + monthShort + '</div>' +
        '</div>' +
        '<div class="event-info">' +
          '<div class="event-title">' + escapeHtml(ev.title || type.label) + '</div>' +
          '<div class="event-subtitle">' +
            '<span class="event-type-pill" style="background:' + type.color + '22;color:' + type.color + ';">' + type.label + '</span>' +
            (subjectLabel ? '<span>· ' + escapeHtml(subjectLabel) + '</span>' : '') +
            (ev.time ? '<span>· ' + escapeHtml(ev.time) + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="event-countdown ' + countdownCls + '">' + countdownText + '</div>' +
      '</div>';
    }

    let listHtml = '<button class="event-add-btn" onclick="openEventModal()"><i class="ti ti-plus"></i>Afegir event</button>';
    if (upcoming.length > 0) {
      listHtml += '<div class="event-list-section">' +
        '<div class="event-list-title"><i class="ti ti-calendar-event"></i>Propers events (' + upcoming.length + ')</div>' +
        '<div class="event-list">' + upcoming.map(ev => eventHtml(ev, false)).join('') + '</div>' +
      '</div>';
    }
    if (past.length > 0) {
      listHtml += '<div class="event-list-section">' +
        '<div class="event-list-title"><i class="ti ti-history"></i>Passats (' + past.length + ')</div>' +
        '<div class="event-list">' + past.slice(0, 10).map(ev => eventHtml(ev, true)).join('') + '</div>' +
      '</div>';
    }
    if (upcoming.length === 0 && past.length === 0) {
      listHtml += '<div class="countdown-empty" style="padding:30px 0;">Encara no tens cap event. Afegeix el primer!</div>';
    }

    root.innerHTML = '<div class="calendar-layout">' +
      '<div class="calendar-panel">' +
        '<div class="cal-header">' +
          '<h3 class="cal-month-title">' + monthTitle + '</h3>' +
          '<div class="cal-nav">' +
            '<button onclick="calendarPrev()"><i class="ti ti-chevron-left"></i></button>' +
            '<button onclick="calendarToday()">Avui</button>' +
            '<button onclick="calendarNext()"><i class="ti ti-chevron-right"></i></button>' +
          '</div>' +
        '</div>' +
        '<div class="cal-grid">' + gridHtml + '</div>' +
      '</div>' +
      '<div class="calendar-panel">' + listHtml + '</div>' +
    '</div>';
  }

  window.calendarPrev = function() {
    calendarMonth.setMonth(calendarMonth.getMonth() - 1);
    renderCalendar();
  };
  window.calendarNext = function() {
    calendarMonth.setMonth(calendarMonth.getMonth() + 1);
    renderCalendar();
  };
  window.calendarToday = function() {
    calendarMonth = new Date();
    calendarMonth.setDate(1);
    renderCalendar();
  };

  let editingEventId = null;

  window.openEventModal = function(dateStr) {
    editingEventId = null;
    const today = new Date();
    const defaultDate = dateStr || toLocalDateStr(today);
    showEventModal({ id: '', title: '', type: 'examen', date: defaultDate, time: '', subjectId: '', description: '' });
  };

  window.editEvent = function(eventId) {
    const ev = state.events.find(e => e.id === eventId);
    if (!ev) return;
    editingEventId = eventId;
    showEventModal(ev);
  };

  function showEventModal(ev) {
    const root = document.getElementById('modal-root');
    const typeOptions = EVENT_TYPES.map(t =>
      '<option value="' + t.id + '"' + (t.id === ev.type ? ' selected' : '') + '>' + t.label + '</option>'
    ).join('');
    const subjectOptions = '<option value="">— Cap —</option>' + state.subjects.map(s =>
      '<option value="' + s.id + '"' + (s.id === ev.subjectId ? ' selected' : '') + '>' + escapeHtml((s.sigla || s.name || '') + (s.quatri ? ' (' + s.quatri + ')' : '')) + '</option>'
    ).join('');

    root.innerHTML =
      '<div class="modal-bg" onclick="if(event.target===this)closeEventModal()">' +
        '<div class="modal">' +
          '<h3>' + (editingEventId ? 'Editar event' : 'Nou event') + '</h3>' +
          '<div><label>Títol</label>' +
            '<input type="text" id="event-title" value="' + escapeHtml(ev.title || '') + '" placeholder="Ex. Examen final" /></div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
            '<div><label>Data</label><input type="date" id="event-date" value="' + ev.date + '" /></div>' +
            '<div><label>Hora (opcional)</label><input type="time" id="event-time" value="' + (ev.time || '') + '" /></div>' +
          '</div>' +
          '<div><label>Tipus</label><select id="event-type">' + typeOptions + '</select></div>' +
          '<div><label>Assignatura (opcional)</label><select id="event-subject">' + subjectOptions + '</select></div>' +
          '<div><label>Descripció (opcional)</label><input type="text" id="event-desc" value="' + escapeHtml(ev.description || '') + '" placeholder="Notes adicionals..." /></div>' +
          '<div class="modal-actions">' +
            (editingEventId ? '<button class="btn" onclick="deleteEvent()" style="color:#EF4444;border-color:#EF4444;">Eliminar</button>' : '') +
            '<button class="btn" onclick="closeEventModal()">Cancel·lar</button>' +
            '<button class="btn btn-primary" onclick="saveEvent()">Desar</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  window.saveEvent = function() {
    const title = document.getElementById('event-title').value.trim();
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const type = document.getElementById('event-type').value;
    const subjectId = document.getElementById('event-subject').value;
    const description = document.getElementById('event-desc').value.trim();
    if (!date) { alert('Posa una data'); return; }
    const wasEditing = !!editingEventId;
    const ev = { id: editingEventId || genId(), title, date, time, type, subjectId, description };
    if (editingEventId) {
      const idx = state.events.findIndex(e => e.id === editingEventId);
      if (idx >= 0) state.events[idx] = ev;
    } else {
      state.events.push(ev);
    }
    save();
    closeEventModal();
    if (activePage === 'calendar') renderCalendar();
    if (activePage === 'notes') render();
    showToast(wasEditing ? 'Event actualitzat' : 'Event desat');
  };

  window.deleteEvent = function() {
    if (!editingEventId) return;
    // Sense confirm(): s'elimina i es pot desfer des de l'avís durant uns segons
    const idx = state.events.findIndex(e => e.id === editingEventId);
    if (idx < 0) return;
    const removed = state.events[idx];
    state.events = state.events.filter(e => e.id !== editingEventId);
    save();
    closeEventModal();
    const refresh = () => {
      if (activePage === 'calendar') renderCalendar();
      if (activePage === 'notes') render();
    };
    refresh();
    showToast('Event eliminat', { icon: 'ti-trash', undo: () => {
      state.events.splice(Math.min(idx, state.events.length), 0, removed);
      save(); refresh();
      showToast('Event restaurat');
    } });
  };

  window.closeEventModal = function() {
    document.getElementById('modal-root').innerHTML = '';
    editingEventId = null;
  };

  window.setStatsScope = function(scope) {
    activeStatsScope = scope;
    renderStats();
  };

  function renderStats() {
    const root = document.getElementById('stats-content');
    let filtered = getFiltered();
    if (activeStatsScope === 'passed') {
      filtered = filtered.filter(s => {
        const st = getStatus(s);
        return st.final && (st.type === 'pass' || st.type === 'compensable');
      });
    }

    if (state.subjects.length === 0) {
      root.innerHTML = '<div class="stats-empty"><i class="ti ti-chart-bar"></i>Encara no tens cap assignatura. Afegeix-ne per veure les estadístiques.</div>';
      return;
    }

    let toggleHtml = '<div style="grid-column:1/-1;display:flex;justify-content:flex-start;">' +
      '<div class="stats-toggle">' +
        '<button class="stats-toggle-btn ' + (activeStatsScope === 'all' ? 'active' : '') + '" onclick="setStatsScope(\'all\')">Totes les matrícules</button>' +
        '<button class="stats-toggle-btn ' + (activeStatsScope === 'passed' ? 'active' : '') + '" onclick="setStatsScope(\'passed\')">Només aprovades</button>' +
      '</div>' +
    '</div>';

    // Dades agregades del filtre actual
    let totalEcts = 0, passedEcts = 0;
    const finalGrades = [];
    const counts = { pass: 0, compensable: 0, fail: 0, pending: 0 };
    const histogram = [0, 0, 0, 0]; // 0-4, 4-5, 5-7, 7-10
    const allGraded = []; // {sigla, name, grade, color, status}

    filtered.forEach(s => {
      const ects = parseFloat(s.ects) || 0;
      totalEcts += ects;
      const g = calcGrade(s);
      const status = getStatus(s);
      if (status.final) {
        finalGrades.push(g);
        allGraded.push({ sigla: s.sigla || s.name || '', name: s.fullName || s.sigla || '', grade: g, color: getColor(s.color).bg, status: status.type, quatri: s.quatri });
        if (status.type === 'pass' || status.type === 'compensable') {
          counts[status.type]++;
          passedEcts += ects;
        } else {
          counts.fail++;
        }
        if (g < 4) histogram[0]++;
        else if (g < 5) histogram[1]++;
        else if (g < 7) histogram[2]++;
        else histogram[3]++;
      } else {
        counts.pending++;
      }
    });

    const avgFinal = finalGrades.length > 0 ? (finalGrades.reduce((a,b)=>a+b,0) / finalGrades.length) : null;

    // Carrer ECTS totals
    const career = state.career ? CAREERS.find(c => c.id === state.career) : null;
    const careerEcts = career ? career.totalEcts : 240;

    // Per quatri: agregar mitjana i ECTS acumulats (només si filter = ALL)
    const showByQuatri = activeFilter === 'ALL';
    let quatriData = [];
    if (showByQuatri) {
      const byQ = {};
      state.subjects.forEach(s => {
        const g = calcGrade(s);
        const st = getStatus(s);
        if (!st.final) return;
        if (!byQ[s.quatri]) byQ[s.quatri] = { grades: [], ects: 0, passedEcts: 0, subs: [] };
        byQ[s.quatri].grades.push(g);
        byQ[s.quatri].subs.push({ g, color: getColor(s.color).bg, sigla: s.sigla || s.name || '' });
        const e = parseFloat(s.ects) || 0;
        byQ[s.quatri].ects += e;
        if (st.type === 'pass' || st.type === 'compensable') byQ[s.quatri].passedEcts += e;
      });
      // Ordenar per quatri (mes antic primer per acumulats)
      const sortedQuatris = Object.keys(byQ).sort((a,b) => QUATRIS.indexOf(b) - QUATRIS.indexOf(a));
      let acc = 0;
      sortedQuatris.forEach(q => {
        const d = byQ[q];
        const avg = d.grades.length > 0 ? (d.grades.reduce((a,b)=>a+b,0) / d.grades.length) : null;
        acc += d.passedEcts;
        quatriData.push({ quatri: q, avg, ects: d.ects, passedEcts: d.passedEcts, accEcts: acc, subs: d.subs });
      });
    }

    // Top 3 millors i pitjors
    const sortedGraded = [...allGraded].sort((a,b) => b.grade - a.grade);
    const top3 = sortedGraded.slice(0, 3);
    const bottom3 = sortedGraded.slice(-3).reverse();

    const totalSubjects = filtered.length;
    const fmtEcts = (n) => { const r = Math.round(n*10)/10; return r % 1 === 0 ? String(r) : r.toFixed(1); };

    // Cercle de progres ECTS de la carrera (no del filtre)
    // Agrupar per sigla per evitar doble compte
    const seenSiglasCar = new Set();
    let careerPassed = 0;
    state.subjects.forEach(s => {
      const sig = (s.sigla || s.name || '').trim().toUpperCase();
      if (sig && seenSiglasCar.has(sig)) return;
      if (sig) seenSiglasCar.add(sig);
      const contributor = sig ? getEctsContributor(sig) : null;
      const directOk = !sig && (() => { const st = getStatus(s); return st.final && (st.type === 'pass' || st.type === 'compensable'); })();
      if (contributor || directOk) careerPassed += parseFloat(s.ects) || 0;
    });
    const careerPct = Math.min(100, (careerPassed / careerEcts) * 100);
    const circR = 70;
    const circC = 2 * Math.PI * circR;
    const circOffset = circC - (circPct => (circPct / 100) * circC)(careerPct);

    // === HTML (disseny nou) ===
    const gtone = g => g === null || g === undefined ? '' : (g >= 5 ? 'ok' : 'bad');
    let html = toggleHtml;
    html += '<div class="stx">';

    // -- KPIs
    const qd = quatriData.filter(q => q.avg !== null);
    let deltaHtml = '';
    if (qd.length >= 2) {
      const d = qd[qd.length - 1].avg - qd[qd.length - 2].avg;
      if (Math.abs(d) >= 0.05) deltaHtml = '<span class="st-delta ' + (d > 0 ? 'up' : 'dn') + '"><i class="ti ' + (d > 0 ? 'ti-trending-up' : 'ti-trending-down') + '"></i>' + (d > 0 ? '+' : '') + fmt(d) + ' vs. quatri anterior</span>';
    }
    const best = qd.length ? qd.reduce((m, q) => q.avg > m.avg ? q : m, qd[0]) : null;
    const worst = qd.length > 1 ? qd.reduce((m, q) => q.avg < m.avg ? q : m, qd[0]) : null;
    const careerSegs = quatriData.filter(q => q.passedEcts > 0).map((q, i, arr) => '<i style="flex:' + q.passedEcts + ';opacity:' + (1 - 0.6 * (arr.length - 1 - i) / Math.max(arr.length - 1, 1)).toFixed(2) + '"></i>').join('');
    const remaining = Math.max(careerEcts - careerPassed, 0);
    const passedCount = counts.pass + counts.compensable;
    const totalAll = counts.pass + counts.compensable + counts.fail + counts.pending;
    html += '<div class="st-kpis">' +
      '<div class="st-card st-kpi"><span class="st-k">Mitjana</span><div class="st-big ' + gtone(avgFinal) + '">' + (avgFinal !== null ? fmt(avgFinal) : '—') + '</div>' + deltaHtml +
        '<span class="st-sub">' + finalGrades.length + (finalGrades.length === 1 ? ' assignatura finalitzada' : ' assignatures finalitzades') + '</span></div>' +
      '<div class="st-card st-kpi"><span class="st-k">Crèdits aprovats</span><div class="st-big">' + fmtEcts(careerPassed) + '<small>/ ' + fmtEcts(careerEcts) + '</small></div>' +
        '<span class="st-sub">' + (career ? escapeHtml(career.short) + ' · ' : '') + Math.round(careerPct) + '% de la carrera</span>' +
        '<div class="st-pbar st-pbar-acc">' + careerSegs + '<i class="rest" style="flex:' + remaining + '"></i></div></div>' +
      '<div class="st-card st-kpi"><span class="st-k">Aprovades</span><div class="st-big">' + passedCount + '<small>/ ' + totalAll + '</small></div>' +
        '<span class="st-sub">' + (counts.compensable ? counts.compensable + ' compensable · ' : '') + counts.fail + ' suspeses · ' + counts.pending + ' pendents</span>' +
        '<div class="st-pbar">' +
          (counts.pass ? '<i style="flex:' + counts.pass + ';background:#10B981"></i>' : '') +
          (counts.compensable ? '<i style="flex:' + counts.compensable + ';background:#F59E0B"></i>' : '') +
          (counts.fail ? '<i style="flex:' + counts.fail + ';background:#F87171"></i>' : '') +
          (counts.pending ? '<i class="rest" style="flex:' + counts.pending + '"></i>' : '') +
        '</div></div>' +
      '<div class="st-card st-kpi"><span class="st-k">Millor quatri</span>' + (best ?
        '<div class="st-big ' + gtone(best.avg) + '">' + fmt(best.avg) + '</div><span class="st-sub">' + best.quatri + ' · ' + fmtEcts(best.passedEcts) + ' ECTS aprovats</span><span class="st-delta up" style="margin-top:auto"><i class="ti ti-star"></i>Estrella</span>' :
        '<div class="st-big off">—</div><span class="st-sub">Encara no hi ha cap quatrimestre finalitzat</span>') + '</div>' +
    '</div>';

    // -- Evolució + distribució
    let chartHtml = '';
    if (qd.length >= 2) {
      const W = 700, Ht = 250, pl = 34, pr = 14, pt = 24, pb = 34, n = quatriData.length, iw = W - pl - pr, ih = Ht - pt - pb;
      const maxE = Math.max(...quatriData.map(q => q.passedEcts), 1);
      const xx = i => pl + iw * (i + 0.5) / n, yy = v => pt + ih * (1 - v / 10);
      let s = '<svg class="st-chart" viewBox="0 0 ' + W + ' ' + Ht + '" role="img" aria-label="Evolució de la mitjana i dels ECTS aprovats per quatrimestre">';
      [0, 5, 10].forEach(v => { s += '<line class="st-grid' + (v === 5 ? ' dash' : '') + '" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + yy(v) + '" y2="' + yy(v) + '"/><text class="st-ax" x="' + (pl - 8) + '" y="' + (yy(v) + 4) + '" text-anchor="end">' + v + '</text>'; });
      quatriData.forEach((q, i) => {
        const bh = Math.max(ih * q.passedEcts / maxE * 0.8, q.passedEcts ? 4 : 0), bw = Math.min(iw / n * 0.46, 64);
        s += '<rect class="st-bar" x="' + (xx(i) - bw / 2) + '" y="' + (pt + ih - bh) + '" width="' + bw + '" height="' + bh + '" rx="8"/>' +
             '<text class="st-ax b" x="' + xx(i) + '" y="' + (Ht - 12) + '" text-anchor="middle">' + q.quatri + '</text>';
      });
      const pts = quatriData.map((q, i) => q.avg === null ? null : [xx(i), yy(q.avg), q.avg]).filter(Boolean);
      s += '<path class="st-line" d="M' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L') + '"/>';
      pts.forEach(p => { s += '<circle class="st-dot" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="6"/><text class="st-val" x="' + p[0].toFixed(1) + '" y="' + (p[1] - 14).toFixed(1) + '" text-anchor="middle">' + fmt(p[2]) + '</text>'; });
      chartHtml = s + '</svg>';
    } else {
      chartHtml = '<div class="st-none">' + (showByQuatri ? 'Necessites almenys dos quatrimestres amb notes finals per veure l\'evolució.' : 'Tria "Totes" a dalt per veure l\'evolució per quatrimestre.') + '</div>';
    }
    const maxH = Math.max(...histogram, 1);
    const distRows = [['0–4', 0, '#F87171'], ['4–5', 1, '#F59E0B'], ['5–7', 2, '#34D399'], ['7–10', 3, '#10B981']].map(r =>
      '<div class="st-dr"><span>' + r[0] + '</span><div class="st-dt"><i style="width:' + (histogram[r[1]] / maxH * 100) + '%;background:' + r[2] + '"></i></div><b>' + histogram[r[1]] + '</b></div>').join('');
    html += '<div class="st-cols">' +
      '<div class="st-card"><div class="st-hd"><h3>Evolució per quatrimestre</h3><span><i class="st-lg line"></i>Mitjana <i class="st-lg bar"></i>ECTS aprovats</span></div>' + chartHtml + '</div>' +
      '<div class="st-card"><div class="st-hd"><h3>Distribució de notes</h3><span>' + finalGrades.length + ' finalitzades</span></div>' +
        (finalGrades.length ? '<div class="st-dist">' + distRows + '</div>' : '<div class="st-none">Cap nota final encara</div>') + '</div>' +
    '</div>';

    // -- Quatrimestres
    if (quatriData.length) {
      html += '<h3 class="st-h">Quatrimestres</h3><div class="st-qs">' + quatriData.map(q => {
        const tag = (best && quatriData.length > 1 && q === best) ? '<span class="st-tag s"><i class="ti ti-star"></i>Estrella</span>' : (worst && q === worst ? '<span class="st-tag w">Pitjor</span>' : '');
        const bars = q.subs.map(x => '<i title="' + escapeHtml(x.sigla) + ' ' + fmt(x.g) + '" style="--c:' + x.color + ';height:' + Math.max(x.g, 0.4) * 10 + '%"></i>').join('');
        return '<div class="st-card st-q">' + tag + '<span class="st-qn">' + q.quatri + '</span>' +
          '<span class="st-qa ' + gtone(q.avg) + '">' + (q.avg !== null ? fmt(q.avg) : '—') + '</span>' +
          '<div class="st-mini">' + bars + '</div>' +
          '<span class="st-sub">' + fmtEcts(q.passedEcts) + ' / ' + fmtEcts(q.ects) + ' ECTS aprovats</span></div>';
      }).join('') + '</div>';
    }

    // -- Millors / per millorar
    if (top3.length) {
      const topIds = new Set(top3.map(x => x.sigla + x.quatri));
      const weak = [...allGraded].sort((x, y) => x.grade - y.grade).filter(x => !topIds.has(x.sigla + x.quatri)).slice(0, 3);
      html += '<div class="st-tops"><div class="st-card"><div class="st-hd"><h3>Millors notes</h3></div><div class="st-trow">' +
        top3.map((it, i) => '<div class="st-poster" style="--c:' + it.color + '" title="' + escapeHtml(it.name) + '"><div class="st-pr"><span class="st-ps">' + escapeHtml(it.sigla) + '</span><em>#' + (i + 1) + '</em></div><span class="st-pg">' + fmt(it.grade) + '</span></div>').join('') +
        '</div></div>' +
        '<div class="st-card"><div class="st-hd"><h3>Per millorar</h3></div>' + (weak.length ? '<div class="st-trow">' +
        weak.map(it => '<div class="st-flat" style="--c:' + it.color + '" title="' + escapeHtml(it.name) + '"><span class="st-ps">' + escapeHtml(it.sigla) + '</span><span class="st-pg ' + gtone(it.grade) + '">' + fmt(it.grade) + '</span></div>').join('') +
        '</div>' : '<div class="st-none">Cap més nota per comparar</div>') + '</div></div>';
    }
    html += '</div>';
    root.innerHTML = html;
  }

  // ========= FIREBASE: AUTH + SYNC =========
  let fbUser = null;        // objecte d'usuari actual (null = no logged in)
  let syncing = false;       // si s'esta sincronitzant
  let pendingCloudSave = null; // timeout per evitar massa escriptures
  let freshSignIn = false;   // true nomes just despres de clicar "Continuar amb Google"

  function isLoggedIn() { return fbUser !== null; }

  function showAuthError(msg) {
    const el = document.getElementById('auth-error');
    if (el) { el.textContent = msg; el.classList.add('show'); }
  }

  window.openAuthModal = function() {
    const root = document.getElementById('modal-root');
    root.innerHTML =
      '<div class="modal-bg" onclick="if(event.target===this)closeAuthModal()">' +
        '<div class="modal" style="max-width:380px;">' +
          '<div class="auth-modal-content">' +
            '<img class="brand" src="' + document.getElementById('brand-logo').src + '" alt="FiberCalc" />' +
            '<h3>Inicia sessió a FiberCalc</h3>' +
            '<p>Sincronitza les teves notes entre dispositius. Les teves dades actuals es desaran al teu compte la primera vegada.</p>' +
            '<button class="btn-google" onclick="doSignIn()">' +
              '<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/><path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>' +
              'Continuar amb Google' +
            '</button>' +
            '<div class="auth-error" id="auth-error"></div>' +
            '<button class="btn-ghost" onclick="closeAuthModal()" style="margin-top:4px;">Cancel·lar</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  };

  window.closeAuthModal = function() {
    document.getElementById('modal-root').innerHTML = '';
  };

  window.openUsernameModal = function(isEdit) {
    const root = document.getElementById('modal-root');
    const closeBtn = isEdit ? '<button class="btn" onclick="closeAuthModal()" style="width:100%;">Cancel\u00b7lar</button>' : '';
    root.innerHTML =
      '<div class="modal-bg"' + (isEdit ? ' onclick="if(event.target===this)closeAuthModal()"' : '') + '>' +
        '<div class="modal" style="max-width:380px;">' +
          '<div class="auth-modal-content">' +
            '<h3>' + (isEdit ? 'Canviar nom d\'usuari' : 'Tria un nom d\'usuari') + '</h3>' +
            '<p>' + (isEdit ? 'Si el canvies, els teus amics et continuaran veient igual; nom\u00e9s canvia com et troba la gent nova.' : 'El necessitar\u00e0s per afegir amics a FiberCalc.') + ' Nom\u00e9s lletres min\u00fascules, n\u00fameros i gui\u00f3 baix (3-20 car\u00e0cters).</p>' +
            '<input type="text" id="username-input" value="' + (isEdit ? escapeHtml(state.username || '') : '') + '" placeholder="el_teu_usuari" maxlength="20" style="text-align:center;font-size:16px;" oninput="this.value=this.value.toLowerCase().replace(/[^a-z0-9_]/g,\'\')" />' +
            '<div class="auth-error" id="username-error"></div>' +
            '<button class="btn btn-primary" onclick="saveUsername(' + (isEdit ? 'true' : 'false') + ')" id="username-save-btn" style="width:100%;">Confirmar</button>' +
            closeBtn +
          '</div>' +
        '</div>' +
      '</div>';
    setTimeout(() => { const i = document.getElementById('username-input'); if (i) i.focus(); }, 0);
  };

  window.saveUsername = async function(isEdit) {
    const input = document.getElementById('username-input');
    const errorEl = document.getElementById('username-error');
    const btn = document.getElementById('username-save-btn');
    const val = input.value.trim();
    errorEl.classList.remove('show');

    if (!/^[a-z0-9_]{3,20}$/.test(val)) {
      errorEl.textContent = 'Ha de tenir entre 3 i 20 caràcters: lletres minúscules, números i guió baix.';
      errorEl.classList.add('show');
      return;
    }

    const oldUsername = state.username;
    if (isEdit && val === oldUsername) {
      document.getElementById('modal-root').innerHTML = '';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Comprovant...';

    try {
      const unameRef = window.fbDocRef('usernames/' + val);
      const existing = await window.fbGetDoc(unameRef);
      if (existing.exists()) {
        errorEl.textContent = 'Aquest nom d\'usuari ja existeix. Tria un altre.';
        errorEl.classList.add('show');
        btn.disabled = false;
        btn.textContent = 'Confirmar';
        return;
      }

      await window.fbSetDoc(unameRef, { uid: fbUser.uid });
      if (isEdit && oldUsername) {
        try { await window.fbDeleteDoc(window.fbDocRef('usernames/' + oldUsername)); } catch (e) { console.error(e); }
      }

      state.username = val;
      save();

      document.getElementById('modal-root').innerHTML = '';
    } catch (err) {
      console.error('Username error', err);
      errorEl.textContent = 'Error desant el nom d\'usuari. Torna-ho a provar.';
      errorEl.classList.add('show');
      btn.disabled = false;
      btn.textContent = 'Confirmar';
    }
  };

  window.doSignIn = async function() {
    if (!window.firebaseReady) {
      showAuthError('Esperant Firebase... torna-ho a provar en un moment.');
      return;
    }
    try {
      freshSignIn = true;
      await window.fbSignInPopup();
      closeAuthModal();
    } catch (err) {
      console.error('Login error', err);
      let msg = 'Error en iniciar sessió.';
      if (err && err.code === 'auth/popup-closed-by-user') msg = 'Has tancat la finestra de Google.';
      else if (err && err.code === 'auth/popup-blocked') msg = 'El navegador ha bloquejat la finestra emergent.';
      else if (err && err.code === 'auth/unauthorized-domain') msg = 'Aquest domini no està autoritzat. Revisa la configuració de Firebase.';
      showAuthError(msg);
    }
  };

  window.doSignOut = async function() {
    if (!confirm('Tancar sessió? Les dades es continuaran veient des d\'aquest dispositiu.')) return;
    closeUserMenu();
    try { await window.fbSignOut(); } catch (e) { console.error(e); }
  };

  function userInitials(name, email) {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return '?';
  }

  function updateUserUI() {
    const loginBtn = document.getElementById('login-btn');
    const userBtn = document.getElementById('user-btn');
    const avatar = document.getElementById('user-avatar');
    const shortname = document.getElementById('user-shortname');

    if (fbUser) {
      loginBtn.style.display = 'none';
      userBtn.style.display = 'inline-flex';
      const dispName = fbUser.displayName || fbUser.email || '';
      const firstName = (dispName.split(/\s+/)[0] || 'Compte');
      shortname.textContent = firstName;
      if (fbUser.photoURL) {
        avatar.innerHTML = '<img src="' + fbUser.photoURL + '" alt="" referrerpolicy="no-referrer" />';
      } else {
        avatar.innerHTML = '<span class="user-btn-fallback">' + userInitials(fbUser.displayName, fbUser.email) + '</span>';
      }
    } else {
      loginBtn.style.display = '';
      userBtn.style.display = 'none';
    }
  }

  window.toggleUserMenu = function() {
    const menu = document.getElementById('user-menu');
    if (menu.classList.contains('open')) { closeUserMenu(); return; }
    if (!fbUser) return;
    const name = fbUser.displayName || 'Usuari';
    const email = fbUser.email || '';
    menu.innerHTML =
      '<div class="user-menu-header">' +
        '<div class="user-menu-name">' + escapeHtml(name) + '</div>' +
        '<div class="user-menu-email">' + escapeHtml(email) + '</div>' +
        (state.username ? '<div class="user-menu-username">@' + escapeHtml(state.username) + '</div>' : '') +
        '<div class="user-menu-status">Sincronitzat</div>' +
      '</div>' +
      '<button class="user-menu-item" onclick="closeUserMenu();openUsernameModal(true)"><i class="ti ti-at"></i>Canviar nom d\'usuari</button>' +
      '<button class="user-menu-item danger" onclick="doSignOut()"><i class="ti ti-logout"></i>Tancar sessió</button>';
    menu.classList.add('open');
    setTimeout(() => {
      document.addEventListener('click', closeUserMenuOnOutside, { once: true });
    }, 0);
  };

  function closeUserMenu() {
    const menu = document.getElementById('user-menu');
    if (menu) menu.classList.remove('open');
  }

  function closeUserMenuOnOutside(e) {
    const wrap = document.getElementById('user-wrap');
    if (wrap && !wrap.contains(e.target)) closeUserMenu();
    else setTimeout(() => document.addEventListener('click', closeUserMenuOnOutside, { once: true }), 0);
  }

  // Calcula i puja el perfil: dades publiques (profiles/{uid}) i stats privades
  // (profiles/{uid}/private/stats, nomes llegibles pels amics acceptats)
  async function syncProfile() {
    if (!fbUser || !state.username) return;
    try {
      const pubRef = window.fbDocRef('profiles/' + fbUser.uid);
      await window.fbSetDoc(pubRef, {
        username: state.username,
        displayName: fbUser.displayName || '',
        photoURL: fbUser.photoURL || '',
        updatedAt: Date.now()
      });
      const privRef = window.fbDocRef('profiles/' + fbUser.uid + '/private/stats');
      await window.fbSetDoc(privRef, {
        stats: computeProfileStats(),
        updatedAt: Date.now()
      });
    } catch (err) {
      console.error('Profile sync failed', err);
    }
  }

  // Quan el state local canvia i estem logged in, escrivim al nᅵvol amb debounce
  function scheduleCloudSave() {
    if (!fbUser) return;
    if (pendingCloudSave) clearTimeout(pendingCloudSave);
    pendingCloudSave = setTimeout(async () => {
      try {
        const ref = window.fbDocRef('users/' + fbUser.uid);
        // Guardem un snapshot del state actual
        await window.fbSetDoc(ref, {
          subjects: state.subjects || [],
          events: state.events || [],
          schedules: state.schedules || {},
          career: state.career || null,
          userName: state.userName || '',
          username: state.username || '',
          updatedAt: Date.now()
        });
        await syncProfile();
      } catch (err) {
        console.error('Cloud save failed', err);
      }
      pendingCloudSave = null;
    }, 1200);
  }

  // Sobreescrivim save() per encadenar tambᅵ cloud
  const _origSave = save;
  save = function() {
    _origSave();
    scheduleCloudSave();
  };

  async function handleAuthChanged(user) {
    fbUser = user;
    updateUserUI();
    if (!user) {
      if (activePage === 'friends') renderFriends();
      return;
    }
    // Just s'ha fet login: comprovar si hi ha dades al nᅵvol
    syncing = true;
    try {
      const ref = window.fbDocRef('users/' + user.uid);
      const snap = await window.fbGetDoc(ref);
      if (snap.exists()) {
        const cloud = snap.data();
        // Hi ha dades al nᅵvol: tens dades locals?
        const hasLocal = freshSignIn && state.subjects && state.subjects.length > 0;
        if (hasLocal) {
          // Conflicte: preguntar
          const choice = confirm(
            'Aquest compte ja té dades guardades al núvol.\n\n' +
            'Acceptar = usar les dades del núvol (es perdran les locals d\'aquest dispositiu).\n' +
            'Cancel·lar = pujar les dades locals al núvol (es perdran les del núvol).'
          );
          if (choice) {
            // Carregar del nᅵvol
            state.subjects = cloud.subjects || [];
            state.events = cloud.events || [];
            state.schedules = cloud.schedules || state.schedules || {};
            state.career = cloud.career === 'gcd' ? 'gced' : (cloud.career !== undefined ? cloud.career : null);
            state.userName = cloud.userName || '';
            state.username = cloud.username || '';
            _origSave();
          } else {
            // Pujar les locals
            scheduleCloudSave();
          }
        } else {
          // No hi ha locals: carregar del nᅵvol
          state.subjects = cloud.subjects || [];
          state.events = cloud.events || [];
          state.schedules = cloud.schedules || state.schedules || {};
          state.career = cloud.career === 'gcd' ? 'gced' : (cloud.career !== undefined ? cloud.career : null);
          state.userName = cloud.userName || '';
          state.username = cloud.username || '';
          _origSave();
        }
      } else {
        // No hi ha res al nᅵvol: pujar les dades locals
        scheduleCloudSave();
      }
      // Inicialitzar el snapshot d'aprovades actual perque les properes detectades siguin noves
      cloudPassedSnapshot = buildPassedSnapshot();
    } catch (err) {
      console.error('Sync error', err);
    } finally {
      syncing = false;
      freshSignIn = false;
      // Re-renderitzar amb les noves dades
      renderCareerTag();
      updateGreeting();
      renderFilters();
      render();
      if (activePage === 'stats') renderStats();
      if (activePage === 'calendar') renderCalendar();
      if (activePage === 'friends') renderFriends();
      if (!state.username) openUsernameModal();
    }
  }

  // ========= AMICS =========
  function pairId(a, b) {
    return a < b ? a + '_' + b : b + '_' + a;
  }

  function renderFriendCard(prof, actionHtml) {
    const avatarHtml = prof.photoURL
      ? '<img src="' + prof.photoURL + '" alt="" referrerpolicy="no-referrer" />'
      : '<span class="friend-avatar-fallback">' + userInitials(prof.displayName, prof.username) + '</span>';
    return '<div class="friend-card">' +
      '<div class="friend-avatar">' + avatarHtml + '</div>' +
      '<div class="friend-info">' +
        '<div class="friend-name">' + escapeHtml(prof.displayName || prof.username || '?') + '</div>' +
        '<div class="friend-username">@' + escapeHtml(prof.username || '?') + '</div>' +
      '</div>' +
      '<div class="friend-action">' + actionHtml + '</div>' +
    '</div>';
  }

  function avgToRingColor(avg) {
    if (avg === null || avg === undefined) return '#9CA3AE';
    if (avg < 5) return '#EF4444';
    if (avg < 6.5) return '#F59E0B';
    if (avg < 8) return '#0EBB80';
    return '#FFD700';
  }

  function buildSparklineSVG(stats, color) {
    if (!stats || !stats.byQuatri) return '';
    const qs = Object.keys(stats.byQuatri).filter(q => stats.byQuatri[q] && stats.byQuatri[q].avgAll !== null && stats.byQuatri[q].avgAll !== undefined);
    if (qs.length < 2) return '';
    qs.sort((a, b) => QUATRIS.indexOf(b) - QUATRIS.indexOf(a)); // mes antic primer
    const values = qs.map(q => stats.byQuatri[q].avgAll);
    const w = 60, h = 22;
    const max = 10, min = 0;
    const xStep = w / (values.length - 1);
    let d = '';
    values.forEach((v, i) => {
      const x = i * xStep;
      const y = h - ((v - min) / (max - min)) * h;
      d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
    });
    const lastX = (values.length - 1) * xStep;
    const lastY = h - ((values[values.length - 1] - min) / (max - min)) * h;
    return '<svg class="sparkline" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" style="color:' + color + ';">' +
      '<path d="' + d + '" stroke="' + color + '" />' +
      '<circle cx="' + lastX.toFixed(1) + '" cy="' + lastY.toFixed(1) + '" r="2" />' +
    '</svg>';
  }

  function renderRankingRow(profile, statsObj, index, isMe) {
    const fmtEcts = n => { const r = Math.round((n || 0) * 10) / 10; return r % 1 === 0 ? String(r) : r.toFixed(1); };
    const avgAll = statsObj && statsObj.avgAll !== null && statsObj.avgAll !== undefined ? statsObj.avgAll : null;
    const avgPassed = statsObj && statsObj.avgPassed !== null && statsObj.avgPassed !== undefined ? statsObj.avgPassed : null;
    const ectsApproved = statsObj ? (statsObj.ectsApproved || 0) : 0;
    const ectsTotal = statsObj ? (statsObj.ectsTotal || 0) : 0;
    const rankCls = index === 0 ? 'first' : (index === 1 ? 'second' : (index === 2 ? 'third' : ''));
    const gradeCls = avgAll === null ? '' : (avgAll >= 5 ? 'pass' : 'fail');
    const name = escapeHtml(profile.displayName || profile.username || '?');
    const youBadge = isMe ? ' <span class="rank-you-badge">Tu</span>' : '';
    const ringColor = avgToRingColor(avgAll);
    const avatarHtml = profile.photoURL
      ? '<img src="' + profile.photoURL + '" alt="" referrerpolicy="no-referrer" />'
      : '<span class="top-item-avatar-fallback">' + userInitials(profile.displayName, profile.username) + '</span>';
    const sparkline = buildSparklineSVG(statsObj, ringColor);
    return '<div class="top-item">' +
      '<div class="top-rank ' + rankCls + '">' + (index + 1) + '</div>' +
      '<div class="top-item-content">' +
        '<div class="top-item-avatar avatar-rank-ring" style="--avatar-ring:' + ringColor + ';">' + avatarHtml + '</div>' +
        '<div class="top-item-info">' +
          '<div class="top-name">' + name + youBadge + '</div>' +
          '<div class="top-meta">Aprov. ' + fmtEcts(ectsApproved) + '/' + fmtEcts(ectsTotal) + ' ECTS \u00b7 Mitjana aprov. ' + (avgPassed !== null ? fmt(avgPassed) : '\u2014') + '</div>' +
        '</div>' +
        sparkline +
      '</div>' +
      '<div class="top-grade ' + gradeCls + '">' + (avgAll !== null ? fmt(avgAll) : '\u2014') + '</div>' +
    '</div>';
  }

  window.renderQuatriComparison = function() {
    const sel = document.getElementById('friend-quatri-select');
    const out = document.getElementById('quatri-comparison');
    if (!sel || !out) return;
    const quatri = sel.value;
    const filtered = friendRankingCache.filter(it => it.stats && it.stats.byQuatri && it.stats.byQuatri[quatri]);
    if (filtered.length === 0) {
      out.innerHTML = '<div class="friends-empty">Cap amic t\u00e9 dades d\'aquest quatrimestre.</div>';
      return;
    }
    const sorted = [...filtered].sort((a, b) => {
      const av = a.stats.byQuatri[quatri].avgAll !== null && a.stats.byQuatri[quatri].avgAll !== undefined ? a.stats.byQuatri[quatri].avgAll : -1;
      const bv = b.stats.byQuatri[quatri].avgAll !== null && b.stats.byQuatri[quatri].avgAll !== undefined ? b.stats.byQuatri[quatri].avgAll : -1;
      return bv - av;
    });
    out.innerHTML = '<div class="top-list">' + sorted.map((it, i) => renderRankingRow(it.profile, it.stats.byQuatri[quatri], i, it.isMe)).join('') + '</div>';
  };

  async function sendFriendRequest(targetUid) {
    const myUid = fbUser.uid;
    const id = pairId(myUid, targetUid);
    await window.fbSetDoc(window.fbDocRef('friendships/' + id), {
      users: [myUid, targetUid],
      requestedBy: myUid,
      status: 'pending',
      createdAt: Date.now()
    });
  }

  window.sendFriendRequestUI = async function(targetUid) {
    try {
      await sendFriendRequest(targetUid);
      await window.searchFriend();
      await renderFriendsLists();
    } catch (err) {
      console.error(err);
      alert('Error enviant la sol\u00b7licitud.');
    }
  };

  window.cancelFriendRequest = async function(otherUid) {
    try {
      const id = pairId(fbUser.uid, otherUid);
      await window.fbDeleteDoc(window.fbDocRef('friendships/' + id));
      await renderFriendsLists();
      const resultEl = document.getElementById('friend-search-result');
      if (resultEl && resultEl.innerHTML.trim()) await window.searchFriend();
    } catch (err) {
      console.error(err);
      alert('Error cancel\u00b7lant la sol\u00b7licitud.');
    }
  };

  window.acceptFriendRequest = async function(otherUid) {
    try {
      const id = pairId(fbUser.uid, otherUid);
      const ref = window.fbDocRef('friendships/' + id);
      const snap = await window.fbGetDoc(ref);
      if (!snap.exists()) { await renderFriendsLists(); return; }
      const data = snap.data();
      data.status = 'accepted';
      data.acceptedAt = Date.now();
      await window.fbSetDoc(ref, data);
      await renderFriendsLists();
    } catch (err) {
      console.error(err);
      alert('Error acceptant la sol\u00b7licitud.');
    }
  };

  window.removeFriend = async function(otherUid) {
    if (!confirm('Deixar de ser amics? Ja no podreu veure el progr\u00e9s mutu.')) return;
    try {
      const id = pairId(fbUser.uid, otherUid);
      await window.fbDeleteDoc(window.fbDocRef('friendships/' + id));
      await renderFriendsLists();
      const resultEl = document.getElementById('friend-search-result');
      if (resultEl && resultEl.innerHTML.trim()) await window.searchFriend();
    } catch (err) {
      console.error(err);
      alert('Error eliminant l\'amic.');
    }
  };

  window.searchFriend = async function() {
    const input = document.getElementById('friend-search-input');
    const resultEl = document.getElementById('friend-search-result');
    if (!input || !resultEl) return;
    const username = input.value.trim().toLowerCase();
    if (!username) { resultEl.innerHTML = ''; return; }

    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      resultEl.innerHTML = '<div class="friends-empty">Nom d\'usuari no vàlid.</div>';
      return;
    }

    resultEl.innerHTML = '<div class="friends-empty">Cercant...</div>';

    try {
      const unameSnap = await window.fbGetDoc(window.fbDocRef('usernames/' + username));
      if (!unameSnap.exists()) {
        resultEl.innerHTML = '<div class="friends-empty">No s\'ha trobat cap usuari amb aquest nom.</div>';
        return;
      }
      const targetUid = unameSnap.data().uid;
      if (targetUid === fbUser.uid) {
        resultEl.innerHTML = '<div class="friends-empty">Aquest ets tu!</div>';
        return;
      }

      const profSnap = await window.fbGetDoc(window.fbDocRef('profiles/' + targetUid));
      const prof = profSnap.exists() ? profSnap.data() : { username: username, displayName: '' };

      const friendshipId = pairId(fbUser.uid, targetUid);
      const fSnap = await window.fbGetDoc(window.fbDocRef('friendships/' + friendshipId));

      let actionHtml;
      if (fSnap.exists()) {
        const f = fSnap.data();
        if (f.status === 'accepted') {
          actionHtml = '<span class="friend-status-badge">Ja sou amics</span>';
        } else if (f.requestedBy === fbUser.uid) {
          actionHtml = '<button class="btn" onclick="cancelFriendRequest(\'' + targetUid + '\')">Cancel\u00b7lar sol\u00b7licitud</button>';
        } else {
          actionHtml = '<span class="friend-status-badge">Et vol afegir</span>';
        }
      } else {
        actionHtml = '<button class="btn btn-primary" onclick="sendFriendRequestUI(\'' + targetUid + '\')">Enviar sol\u00b7licitud</button>';
      }

      resultEl.innerHTML = renderFriendCard(prof, actionHtml);
    } catch (err) {
      console.error(err);
      resultEl.innerHTML = '<div class="friends-empty">Error cercant. Torna-ho a provar.</div>';
    }
  };

  async function renderFriendsLists() {
    const container = document.getElementById('friend-lists');
    if (!container) return;
    container.innerHTML = '<div class="friends-empty">Carregant...</div>';

    try {
      const myUid = fbUser.uid;
      const col = window.fbCollection('friendships');
      const q = window.fbQuery(col, window.fbWhere('users', 'array-contains', myUid));
      const snap = await window.fbGetDocs(q);

      const sent = [], received = [], friends = [];
      snap.forEach(d => {
        const data = d.data();
        const otherUid = data.users.find(u => u !== myUid);
        const item = { otherUid, data };
        if (data.status === 'accepted') friends.push(item);
        else if (data.requestedBy === myUid) sent.push(item);
        else received.push(item);
      });

      const allOthers = [...received, ...sent, ...friends];
      const profiles = {};
      await Promise.all(allOthers.map(async item => {
        if (profiles[item.otherUid]) return;
        const snap = await window.fbGetDoc(window.fbDocRef('profiles/' + item.otherUid));
        profiles[item.otherUid] = snap.exists() ? snap.data() : { username: '???' };
      }));

      let html = '';

      if (received.length > 0) {
        html += '<div class="friends-section-title"><i class="ti ti-user-plus"></i>Sol\u00b7licituds rebudes</div>' +
          '<div class="friend-list">' +
          received.map(item => renderFriendCard(profiles[item.otherUid],
            '<button class="btn btn-primary" onclick="acceptFriendRequest(\'' + item.otherUid + '\')">Acceptar</button>' +
            '<button class="btn" onclick="cancelFriendRequest(\'' + item.otherUid + '\')">Rebutjar</button>'
          )).join('') +
          '</div>';
      }

      if (sent.length > 0) {
        html += '<div class="friends-section-title"><i class="ti ti-send"></i>Sol\u00b7licituds enviades</div>' +
          '<div class="friend-list">' +
          sent.map(item => renderFriendCard(profiles[item.otherUid], '<button class="btn" onclick="cancelFriendRequest(\'' + item.otherUid + '\')">Cancel\u00b7lar</button>')).join('') +
          '</div>';
      }

      html += '<div class="friends-section-title"><i class="ti ti-users"></i>Amics</div>';
      if (friends.length === 0) {
        html += '<div class="friends-empty">Encara no tens amics. Cerca\'n un pel seu nom d\'usuari!</div>';
      } else {
        const myStats = computeProfileStats();
        const myProfile = { displayName: state.userName || fbUser.displayName || 'Tu', username: state.username, photoURL: fbUser.photoURL || '' };

        const items = [{ profile: myProfile, stats: myStats, isMe: true, otherUid: null }];
        await Promise.all(friends.map(async item => {
          let stats = null;
          try {
            const statsSnap = await window.fbGetDoc(window.fbDocRef('profiles/' + item.otherUid + '/private/stats'));
            stats = statsSnap.exists() ? statsSnap.data().stats : null;
          } catch (e) { console.error(e); }
          items.push({ profile: profiles[item.otherUid], stats, isMe: false, otherUid: item.otherUid });
        }));

        friendRankingCache = items;

        const sortKey = it => (it.stats && it.stats.avgAll !== null && it.stats.avgAll !== undefined) ? it.stats.avgAll : -1;
        const sorted = [...items].sort((a, b) => sortKey(b) - sortKey(a));

        // Punt 4: badge de posicio - calcular i comparar amb lultima posicio guardada
        const myIdx = sorted.findIndex(it => it.isMe);
        const myPos = myIdx + 1;
        const total = sorted.length;
        const lastPosKey = 'fibercalc-last-rank-pos';
        let lastPos = null;
        try { const stored = localStorage.getItem(lastPosKey); if (stored !== null) lastPos = parseInt(stored, 10); } catch (e) {}
        let positionBanner = '';
        if (myPos > 0 && total > 1) {
          if (lastPos === null) {
            // primera vegada, nomes guardar
          } else if (myPos < lastPos) {
            const cls = myPos === 1 ? 'promote-top' : '';
            const msg = myPos === 1 ? 'Ets el número 1 del rànquing!' : 'Has pujat al #' + myPos;
            positionBanner = '<div class="position-banner ' + cls + '" id="position-banner">' +
              '<i class="ti ti-trophy"></i>' +
              '<div class="position-banner-text"><div class="position-banner-title">' + msg + '</div>' +
              '<div class="position-banner-sub">Abans estaves al #' + lastPos + '</div></div>' +
              '<button class="position-banner-close" onclick="dismissPositionBanner()" aria-label="Tancar"><i class="ti ti-x"></i></button>' +
            '</div>';
          } else if (myPos > lastPos) {
            positionBanner = '<div class="position-banner demote" id="position-banner">' +
              '<i class="ti ti-trending-down"></i>' +
              '<div class="position-banner-text"><div class="position-banner-title">Has baixat al #' + myPos + '</div>' +
              '<div class="position-banner-sub">Abans estaves al #' + lastPos + '</div></div>' +
              '<button class="position-banner-close" onclick="dismissPositionBanner()" aria-label="Tancar"><i class="ti ti-x"></i></button>' +
            '</div>';
          }
          try { localStorage.setItem(lastPosKey, String(myPos)); } catch (e) {}
        }
        html += positionBanner;

        html += '<div class="top-list">' + sorted.map((it, i) => renderRankingRow(it.profile, it.stats, i, it.isMe)).join('') + '</div>';

        // Punt 3: Grafica comparativa per quatris (linies superposades)
        const myQuatris = Object.keys(myStats.byQuatri || {}).sort((a, b) => QUATRIS.indexOf(b) - QUATRIS.indexOf(a));
        if (myQuatris.length >= 2) {
          html += '<div class="friends-section-title" style="margin-top:20px;"><i class="ti ti-chart-line"></i>Evolució comparada</div>' +
            '<div id="compare-chart-container"></div>';
        }

        // Comparativa per quatri (taula existent)
        if (myQuatris.length > 0) {
          html += '<div class="friends-section-title" style="margin-top:20px;"><i class="ti ti-calendar-stats"></i>Rànquing per quatrimestre</div>' +
            '<select id="friend-quatri-select" class="friend-quatri-select" onchange="renderQuatriComparison()">' +
            myQuatris.map(q => '<option value="' + q + '">' + q + '</option>').join('') +
            '</select>' +
            '<div id="quatri-comparison" style="margin-top:10px;"></div>';
        }

        html += '<div class="friends-section-title" style="margin-top:20px;"><i class="ti ti-settings"></i>Gestionar amics</div>';
        html += '<div class="friend-list">' +
          friends.map(item => renderFriendCard(profiles[item.otherUid],
            '<button class="btn" onclick="removeFriend(\'' + item.otherUid + '\')">Eliminar</button>'
          )).join('') +
          '</div>';
      }

      container.innerHTML = html;
      if (document.getElementById('friend-quatri-select')) renderQuatriComparison();
      if (document.getElementById('compare-chart-container')) renderCompareChart();
    } catch (err) {
      console.error(err);
      container.innerHTML = '<div class="friends-empty">Error carregant els amics.</div>';
    }
  }

  window.dismissPositionBanner = function() {
    const el = document.getElementById('position-banner');
    if (el) el.style.display = 'none';
  };

  function renderCompareChart() {
    const container = document.getElementById('compare-chart-container');
    if (!container || !friendRankingCache || friendRankingCache.length === 0) return;
    // Recollir tots els quatris comuns (els meus + els d'algun amic)
    const meStats = friendRankingCache.find(it => it.isMe);
    if (!meStats || !meStats.stats || !meStats.stats.byQuatri) return;
    const myQuatris = Object.keys(meStats.stats.byQuatri).sort((a, b) => QUATRIS.indexOf(b) - QUATRIS.indexOf(a));
    if (myQuatris.length < 2) return;

    // Per cada item, valors a cada quatri (null si no en t)
    const colorPalette = ['#0EBB80', '#3B82F6', '#A78BFA', '#F59E0B', '#EF4444', '#14B8A6', '#EC4899'];
    const series = friendRankingCache.map((item, i) => {
      const color = item.isMe ? '#0EBB80' : colorPalette[(i % (colorPalette.length - 1)) + 1];
      const values = myQuatris.map(q => {
        const bq = item.stats && item.stats.byQuatri && item.stats.byQuatri[q];
        return bq && bq.avgAll !== null && bq.avgAll !== undefined ? bq.avgAll : null;
      });
      return { name: item.profile.displayName || item.profile.username || '?', isMe: item.isMe, color, values };
    }).filter(s => s.values.some(v => v !== null));

    if (series.length === 0) { container.innerHTML = ''; return; }

    const w = 600, h = 200;
    const pad = { l: 30, r: 16, t: 18, b: 28 };
    const innerW = w - pad.l - pad.r;
    const innerH = h - pad.t - pad.b;
    const xStep = myQuatris.length > 1 ? innerW / (myQuatris.length - 1) : innerW;
    const yFor = v => pad.t + innerH - ((v - 0) / 10) * innerH;

    // Grid 0,2.5,5,7.5,10
    let gridHtml = '';
    [0, 2.5, 5, 7.5, 10].forEach(v => {
      const y = yFor(v);
      gridHtml += '<line class="avg-line-grid" x1="' + pad.l + '" x2="' + (w - pad.r) + '" y1="' + y + '" y2="' + y + '" />';
      gridHtml += '<text class="avg-line-grid-label" x="' + (pad.l - 6) + '" y="' + (y + 3) + '" text-anchor="end">' + v + '</text>';
    });
    const y5 = yFor(5);

    let pathsHtml = '';
    series.forEach(s => {
      let d = '', started = false;
      s.values.forEach((v, i) => {
        if (v === null) { started = false; return; }
        const x = pad.l + i * xStep;
        const y = yFor(v);
        d += (started ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
        started = true;
      });
      const sw = s.isMe ? 3 : 2;
      pathsHtml += '<path d="' + d + '" stroke="' + s.color + '" stroke-width="' + sw + '" fill="none" stroke-linejoin="round" stroke-linecap="round" />';
      // Dots
      s.values.forEach((v, i) => {
        if (v === null) return;
        const x = pad.l + i * xStep;
        const y = yFor(v);
        pathsHtml += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (s.isMe ? 4 : 3) + '" fill="' + s.color + '" stroke="var(--surface)" stroke-width="1.5"><title>' + escapeHtml(s.name) + ' – ' + myQuatris[i] + ': ' + fmt(v) + '</title></circle>';
      });
    });

    let labelsHtml = '';
    myQuatris.forEach((q, i) => {
      const x = pad.l + i * xStep;
      labelsHtml += '<text class="avg-line-label" x="' + x + '" y="' + (h - 8) + '">' + escapeHtml(q) + '</text>';
    });

    const legend = series.map(s => '<div class="compare-legend-item"><div class="compare-legend-dot" style="background:' + s.color + ';"></div>' + escapeHtml(s.name) + (s.isMe ? ' (Tu)' : '') + '</div>').join('');

    container.innerHTML = '<div class="compare-chart-wrap">' +
      '<svg class="avg-line-svg" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid meet">' +
        gridHtml +
        '<line class="avg-line-baseline" x1="' + pad.l + '" x2="' + (w - pad.r) + '" y1="' + y5 + '" y2="' + y5 + '" />' +
        pathsHtml +
        labelsHtml +
      '</svg>' +
    '</div>' +
    '<div class="compare-legend">' + legend + '</div>';
  }

  async function renderFriends() {
    const root = document.getElementById('friends-content');
    if (!fbUser) {
      root.innerHTML = '<div class="friends-empty"><i class="ti ti-users"></i>Inicia sessi\u00f3 per afegir amics i comparar el teu progr\u00e9s.</div>';
      return;
    }
    if (!state.username) {
      root.innerHTML = '<div class="friends-empty"><i class="ti ti-users"></i>Configura el teu nom d\'usuari per usar aquesta funci\u00f3.</div>';
      return;
    }

    root.innerHTML =
      '<div class="friend-search-bar">' +
        '<input type="text" id="friend-search-input" placeholder="nom_usuari" maxlength="20" oninput="this.value=this.value.toLowerCase().replace(/[^a-z0-9_]/g,\'\')" onkeydown="if(event.key===\'Enter\')searchFriend()" />' +
        '<button class="btn btn-primary" onclick="searchFriend()"><i class="ti ti-search"></i>Cercar</button>' +
      '</div>' +
      '<div id="friend-search-result"></div>' +
      '<div id="friend-lists"></div>' +
      '<div id="activity-feed-section"></div>';

    await renderFriendsLists();
    await renderActivityFeed();
  }

  async function renderActivityFeed() {
    const root = document.getElementById('activity-feed-section');
    if (!root) return;
    try {
      // Obtenir els uids dels amics acceptats
      const myUid = fbUser.uid;
      const col = window.fbCollection('friendships');
      const q = window.fbQuery(col, window.fbWhere('users', 'array-contains', myUid));
      const snap = await window.fbGetDocs(q);
      const friendUids = [];
      snap.forEach(d => {
        const data = d.data();
        if (data.status === 'accepted') {
          const other = data.users.find(u => u !== myUid);
          if (other) friendUids.push(other);
        }
      });

      if (friendUids.length === 0) { root.innerHTML = ''; return; }

      // Limit: Firestore array-contains-any nomes accepta 30 valors max
      const queryUids = friendUids.slice(0, 30);
      const aCol = window.fbCollection('activities');
      const aQ = window.fbQuery(aCol, window.fbWhere('uid', 'in', queryUids), window.fbOrderBy('createdAt', 'desc'), window.fbLimit(15));
      let aSnap;
      try {
        aSnap = await window.fbGetDocs(aQ);
      } catch (e) {
        // Si l'index no esta creat, mostrem missatge silenciosament i sortim
        console.error('Activity feed error', e);
        root.innerHTML = '';
        return;
      }
      const activities = [];
      aSnap.forEach(d => activities.push(d.data()));
      if (activities.length === 0) { root.innerHTML = ''; return; }

      // Obtenir profiles dels amics
      const profilesByUid = {};
      await Promise.all(friendUids.map(async uid => {
        try {
          const pSnap = await window.fbGetDoc(window.fbDocRef('profiles/' + uid));
          profilesByUid[uid] = pSnap.exists() ? pSnap.data() : { username: '???' };
        } catch (e) { profilesByUid[uid] = { username: '???' }; }
      }));

      function formatRelativeTime(ts) {
        const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
        if (diffSec < 60) return 'fa uns segons';
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return 'fa ' + diffMin + ' min';
        const diffH = Math.floor(diffMin / 60);
        if (diffH < 24) return 'fa ' + diffH + ' h';
        const diffD = Math.floor(diffH / 24);
        if (diffD < 7) return 'fa ' + diffD + ' d';
        if (diffD < 30) return 'fa ' + Math.floor(diffD / 7) + ' set.';
        return 'fa ' + Math.floor(diffD / 30) + ' mesos';
      }

      let html = '<div class="friends-section-title" style="margin-top:24px;"><i class="ti ti-activity"></i>Activitat recent</div>' +
        '<div class="activity-feed">';
      activities.forEach(act => {
        const prof = profilesByUid[act.uid] || { username: '???' };
        const name = escapeHtml(prof.displayName || prof.username || '?');
        if (act.type === 'approved') {
          const grade = act.grade !== null && act.grade !== undefined ? ' (' + fmt(act.grade) + ')' : '';
          html += '<div class="activity-item">' +
            '<div class="activity-icon approve"><i class="ti ti-circle-check"></i></div>' +
            '<div><div class="activity-text"><strong>' + name + '</strong> ha aprovat <strong>' + escapeHtml(act.sigla || '') + '</strong>' + grade + '</div>' +
            '<div class="activity-time">' + formatRelativeTime(act.createdAt) + ' · ' + escapeHtml(act.quatri || '') + '</div></div>' +
          '</div>';
        }
      });
      html += '</div>';
      root.innerHTML = html;
    } catch (err) {
      console.error('renderActivityFeed error', err);
      root.innerHTML = '';
    }
  }

  function initFirebaseFlow() {
    if (!window.firebaseReady) {
      window.addEventListener('firebase-ready', initFirebaseFlow, { once: true });
      return;
    }
    window.fbOnAuth(handleAuthChanged);
  }

  loadTheme();
  load();
  renderCareerTag();
  updateGreeting();
  // ============ MOVIMENT I AVISOS ============
  const REDUCED_MOTION = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Anima el primer número d'un text (p. ex. "7.50" o "6") de 0 fins al seu valor final
  function animateCountUp(el) {
    const node = Array.from(el.childNodes).find(n => n.nodeType === 3 && /\d/.test(n.nodeValue));
    if (!node) return;
    const finalText = node.nodeValue;
    const m = finalText.match(/^(\s*-?)(\d+)([.,](\d+))?/);
    if (!m) return;
    const decimals = m[4] ? m[4].length : 0;
    const sep = m[3] ? m[3][0] : '.';
    const target = parseFloat(m[2] + (m[4] ? '.' + m[4] : ''));
    if (!isFinite(target) || target === 0) return;
    const rest = finalText.slice(m[0].length);
    const fmtNum = v => decimals ? v.toFixed(decimals).replace('.', sep) : String(Math.round(v));
    const start = performance.now(), dur = 700;
    function step(now) {
      const t = Math.min(1, (now - start) / dur);
      if (t >= 1) { node.nodeValue = finalText; return; }
      node.nodeValue = m[1] + fmtNum(target * (1 - Math.pow(1 - t, 3))) + rest;
      requestAnimationFrame(step);
    }
    node.nodeValue = m[1] + fmtNum(0) + rest;
    requestAnimationFrame(step);
  }

  // Entrada suau en canviar de pàgina (no es repeteix a cada redibuix)
  function playEntrance(page) {
    if (REDUCED_MOTION) return;
    const view = document.getElementById(page + '-view');
    if (!view) return;
    view.classList.remove('page-enter');
    void view.offsetWidth;
    view.classList.add('page-enter');
    if (page === 'notes') {
      const grid = document.getElementById('grid');
      if (grid) {
        grid.classList.add('cards-in');
        setTimeout(() => grid.classList.remove('cards-in'), 1000);
      }
      document.querySelectorAll('#dashboard .st .v').forEach(animateCountUp);
    } else if (page === 'stats') {
      view.querySelectorAll('.progress-circle-bar').forEach(el => {
        const finalOffset = el.getAttribute('stroke-dashoffset');
        el.style.strokeDashoffset = el.getAttribute('stroke-dasharray');
        void el.getBoundingClientRect();
        requestAnimationFrame(() => { el.style.strokeDashoffset = finalOffset; });
      });
      view.querySelectorAll('.stat-block circle[stroke-dasharray]:not(.progress-circle-bar)').forEach(el => {
        const finalDash = el.getAttribute('stroke-dasharray');
        el.style.strokeDasharray = '0 1000';
        void el.getBoundingClientRect();
        requestAnimationFrame(() => { el.style.strokeDasharray = finalDash; });
      });
    }
  }

  // Col·loca l'indicador verd sota la pestanya activa (amb animació o directament)
  function moveTabIndicator(animate) {
    const bar = document.querySelector('.page-tabs');
    const ind = bar && bar.querySelector('.tab-indicator');
    const active = bar && bar.querySelector('.page-tab.active');
    if (!ind || !active || active.offsetWidth === 0) return;
    if (!animate) ind.style.transition = 'none';
    ind.style.width = active.offsetWidth + 'px';
    ind.style.height = active.offsetHeight + 'px';
    ind.style.transform = 'translate(' + active.offsetLeft + 'px, ' + active.offsetTop + 'px)';
    if (!animate) { void ind.offsetWidth; ind.style.transition = ''; }
    bar.classList.add('has-indicator');
    ind.classList.add('ready');
  }

  // Avisos flotants (es poden apilar; amb opció de desfer)
  window.showToast = function(message, opts) {
    opts = opts || {};
    let root = document.getElementById('toast-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'toast-root';
      root.className = 'toast-root';
      root.setAttribute('aria-live', 'polite');
      document.body.appendChild(root);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    const icon = document.createElement('i');
    icon.className = 'ti ' + (opts.icon || 'ti-circle-check');
    const text = document.createElement('span');
    text.className = 'toast-text';
    text.textContent = message;
    toast.appendChild(icon);
    toast.appendChild(text);
    let timer;
    const dismiss = () => {
      clearTimeout(timer);
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 220);
    };
    if (opts.undo) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toast-action';
      btn.textContent = 'Desfer';
      btn.onclick = () => { dismiss(); opts.undo(); };
      toast.appendChild(btn);
    }
    root.appendChild(toast);
    while (root.children.length > 3) root.firstChild.remove();
    timer = setTimeout(dismiss, opts.undo ? 6000 : 2800);
    toast.addEventListener('mouseenter', () => clearTimeout(timer));
    toast.addEventListener('mouseleave', () => { timer = setTimeout(dismiss, 2000); });
  };

  renderFilters();
  render();
  playEntrance('notes');
  moveTabIndicator(false);
  window.addEventListener('resize', () => moveTabIndicator(false));
  window.addEventListener('load', () => moveTabIndicator(false));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => moveTabIndicator(false));
  if (window.ResizeObserver) {
    const tabsRO = new ResizeObserver(() => moveTabIndicator(false));
    document.querySelectorAll('.page-tabs, .page-tab').forEach(el => tabsRO.observe(el));
  }
  // ---- Splash: 0,8 s. El logo apareix al centre i vola cap al lloc de la capçalera ----
  (function playSplash() {
    const root = document.documentElement;
    const splash = document.getElementById('splash');
    if (!splash) return;
    if (!root.classList.contains('splash-on')) { splash.remove(); return; }
    try { sessionStorage.setItem('fibercalc-splash', '1'); } catch (e) {}
    const img = document.getElementById('splash-logo');
    const logo = document.getElementById('splash-mark');
    const glow = document.getElementById('splash-glow');
    const spin = document.getElementById('splash-spin');
    const word = document.getElementById('splash-word');
    const bg = splash.querySelector('.splash-bg');
    const target = document.getElementById('brand-logo');
    const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
    let finished = false, timer = null, anims = [];

    function finish() {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      anims.forEach(a => { try { a.cancel(); } catch (e) {} });
      root.classList.remove('splash-on');
      splash.remove();
    }
    function fly() {
      if (finished) return;
      const tr = target.getBoundingClientRect();
      const lr = logo.getBoundingClientRect();
      if (!tr.width || !lr.width) { finish(); return; }
      const dx = (tr.left + tr.width / 2) - (lr.left + lr.width / 2);
      const dy = (tr.top + tr.height / 2) - (lr.top + lr.height / 2);
      const sc = tr.width / lr.width;
      const dur = 400;
      const flight = logo.animate(
        [{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sc + ')' }],
        { duration: dur, easing: EASE, fill: 'forwards' });
      anims.push(flight,
        glow.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease', fill: 'forwards' }),
        bg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur, easing: 'ease', fill: 'forwards' }),
        word.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'ease', fill: 'forwards' }));
      playEntrance('notes');
      flight.onfinish = finish;
    }

    // El logo ja és visible des del primer pintat: no s'anima l'entrada (evita el "saltet"), només el vol.
    const HOLD = 650;
    const start = () => {
      if (finished) return;
      // brillantor decorativa suau: la llum només es balanceja una mica per la vora, no dona la volta
      anims.push(spin.animate([{ transform: 'rotate(-60deg)' }, { transform: 'rotate(40deg)' }], { duration: HOLD + 300, easing: 'ease-in-out', fill: 'forwards' }));
      timer = setTimeout(fly, HOLD);
    };
    if (img.decode) img.decode().then(start, start); else start();
    splash.addEventListener('click', finish);
    document.addEventListener('keydown', finish, { once: true });
  })();

  initFirebaseFlow();
})();
