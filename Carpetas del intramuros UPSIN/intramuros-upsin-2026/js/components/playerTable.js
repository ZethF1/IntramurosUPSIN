/* ==========================================================================
   playerTable.js — TABLA DE ESTADÍSTICAS INDIVIDUALES (componente interactivo)
   Ordenamiento por columna, búsqueda por nombre (sin distinguir acentos),
   cambio entre promedios por partido y totales y, opcionalmente, filtro
   por equipo. Se usa en el detalle de equipo y en Estadísticas.
   ========================================================================== */
window.UPSIN = window.UPSIN || {};

(function (NS) {
  'use strict';
  const { esc, icon, teamEmblem, formatPct, normalize, demoTag } = NS.ui;
  const { statValue } = NS.core.stats;

  const STAT_COLUMNS = [
    ['min', 'MIN', 'Minutos jugados'],
    ['pts', 'PTS', 'Puntos'],
    ['reb', 'REB', 'Rebotes'],
    ['ast', 'AST', 'Asistencias'],
    ['stl', 'STL', 'Robos'],
    ['blk', 'BLK', 'Bloqueos (tapones)'],
    ['pf', 'PF', 'Faltas personales']
  ];

  const COLUMNS = [
    { key: 'number', label: '#', title: 'Número de camiseta', type: 'num', value: (r) => r.player.number ?? null },
    { key: 'name', label: 'Jugador', title: 'Nombre del jugador', type: 'text', value: (r) => r.player.name },
    { key: 'team', label: 'Equipo', title: 'Equipo', type: 'text', value: (r) => r.team.name, teamOnly: true },
    { key: 'gp', label: 'PJ', title: 'Partidos jugados', type: 'num', value: (r) => r.gp },
    ...STAT_COLUMNS.map(([key, label, title]) => ({ key, label, title, type: 'num', stat: true })),
    { key: 'fgPct', label: 'FG%', title: 'Porcentaje de tiros de campo', type: 'pct', made: 'fgm', att: 'fga' },
    { key: 'tpPct', label: '3P%', title: 'Porcentaje de triples', type: 'pct', made: 'tpm', att: 'tpa' },
    { key: 'ftPct', label: 'FT%', title: 'Porcentaje de tiros libres', type: 'pct', made: 'ftm', att: 'fta' },
    { key: 'dd', label: 'DD', title: 'Dobles-dobles', type: 'num', value: (r) => r.dd },
    { key: 'td', label: 'TD', title: 'Triples-dobles', type: 'num', value: (r) => r.td }
  ];

  let instance = 0;

  function mount(container, rows, opts = {}) {
    const uid = `pt-${++instance}`;
    const showTeam = Boolean(opts.showTeam);
    const columns = COLUMNS.filter((c) => !c.teamOnly || showTeam);
    const state = { sortKey: opts.sortKey || 'pts', dir: 'desc', query: '', mode: opts.mode || 'avg', teamId: 'all' };

    const getValue = (row, col) => {
      if (col.stat) return statValue(row, col.key, state.mode);
      if (col.type === 'pct') return row[col.key];
      return col.value(row);
    };

    const teamOptions = showTeam && opts.teams
      ? `<label class="field">
           <span class="field__label">Equipo</span>
           <select class="select" data-role="team">
             <option value="all">Todos los equipos</option>
             ${opts.teams.map((t) => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('')}
           </select>
         </label>`
      : '';

    container.innerHTML = `
      <div class="toolbar">
        <label class="field field--search">
          <span class="field__label">Buscar jugador</span>
          <span class="input-icon">${icon('search')}<input type="search" class="input" data-role="search" placeholder="Nombre del jugador" autocomplete="off"></span>
        </label>
        ${teamOptions}
        <div class="field">
          <span class="field__label" id="${uid}-mode">Mostrar</span>
          <div class="segmented" role="group" aria-labelledby="${uid}-mode">
            <button type="button" class="segmented__btn" data-mode="avg">Por partido</button>
            <button type="button" class="segmented__btn" data-mode="total">Totales</button>
          </div>
        </div>
      </div>
      <p class="table-meta"><span data-role="count" aria-live="polite"></span> ${demoTag('Jugadores y estadísticas demo')}</p>
      <div class="table-wrap table-wrap--players" role="region" aria-label="Estadísticas de jugadores (desplazable)" tabindex="0" data-role="table"></div>
      <p class="table-legend">PJ partidos jugados · DD dobles-dobles · TD triples-dobles (detectados partido a partido sobre PTS, REB, AST, STL y BLK). Los porcentajes muestran anotados/intentados; «—» indica que no hay intentos registrados.</p>`;

    const tableEl = container.querySelector('[data-role="table"]');
    const countEl = container.querySelector('[data-role="count"]');

    function visibleRows() {
      const q = normalize(state.query.trim());
      const col = columns.find((c) => c.key === state.sortKey) || columns[0];
      const sign = state.dir === 'asc' ? 1 : -1;
      return rows
        .filter((r) => (!q || normalize(r.player.name).includes(q)) && (state.teamId === 'all' || r.team.id === state.teamId))
        .sort((a, b) => {
          const va = getValue(a, col);
          const vb = getValue(b, col);
          if (va == null && vb == null) return 0;
          if (va == null) return 1;           // sin datos siempre al final
          if (vb == null) return -1;
          if (col.type === 'text') return sign * String(va).localeCompare(String(vb), 'es');
          return sign * (va - vb) || a.player.name.localeCompare(b.player.name, 'es');
        });
    }

    function cell(row, col) {
      if (col.key === 'number') return `<td class="col-num">${row.player.number ?? '—'}</td>`;
      if (col.key === 'name') {
        return `<th scope="row" class="col-player"><span class="player-cell">
          ${showTeam ? teamEmblem(row.team, { size: 26 }) : ''}
          <span><span class="player-cell__name">${esc(row.player.name)}</span><span class="player-cell__pos">${esc(row.player.position || '')}</span></span>
        </span></th>`;
      }
      if (col.key === 'team') return `<td class="col-team-name"><a href="#${esc(row.team.id)}">${esc(row.team.name)}</a></td>`;
      if (col.type === 'pct') {
        const att = row[col.att];
        return `<td class="col-pct">${att ? `<span class="pct">${formatPct(row[col.key])}</span><span class="pct-sub">${row[col.made]}/${att}</span>` : '<span class="pct">—</span>'}</td>`;
      }
      const v = getValue(row, col);
      const text = col.stat && state.mode === 'avg' ? v.toFixed(1) : v;
      return `<td${col.key === state.sortKey ? ' class="is-sorted"' : ''}>${text}</td>`;
    }

    function render() {
      const list = visibleRows();
      countEl.textContent = `${list.length} ${list.length === 1 ? 'jugador' : 'jugadores'}`;
      container.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode)));

      const head = columns.map((c) => {
        const active = c.key === state.sortKey;
        const ariaSort = active ? (state.dir === 'asc' ? 'ascending' : 'descending') : 'none';
        return `<th scope="col" aria-sort="${ariaSort}" class="${c.key === 'name' ? 'col-player' : ''}${active ? ' is-sorted' : ''}">
          <button type="button" class="sort-btn" data-sort="${c.key}" title="Ordenar por ${esc(c.title.toLowerCase())}">
            <abbr title="${esc(c.title)}">${esc(c.label)}</abbr><span class="sort-ind" aria-hidden="true">${active ? (state.dir === 'asc' ? '▲' : '▼') : ''}</span>
          </button></th>`;
      }).join('');

      const body = list.length
        ? list.map((r) => `<tr>${columns.map((c) => cell(r, c)).join('')}</tr>`).join('')
        : `<tr><td colspan="${columns.length}" class="table-empty">Ningún jugador coincide con «${esc(state.query)}».</td></tr>`;

      tableEl.innerHTML = `<table class="data-table players">
        <caption class="sr-only">Estadísticas individuales (${state.mode === 'avg' ? 'promedio por partido' : 'totales'}) — datos de demostración</caption>
        <thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
    }

    container.addEventListener('input', (e) => {
      if (e.target.matches('[data-role="search"]')) { state.query = e.target.value; render(); }
    });
    container.addEventListener('change', (e) => {
      if (e.target.matches('[data-role="team"]')) { state.teamId = e.target.value; render(); }
    });
    container.addEventListener('click', (e) => {
      const sortBtn = e.target.closest('[data-sort]');
      if (sortBtn) {
        const key = sortBtn.dataset.sort;
        if (state.sortKey === key) state.dir = state.dir === 'desc' ? 'asc' : 'desc';
        else { state.sortKey = key; state.dir = ['name', 'team', 'number', 'pf'].includes(key) ? 'asc' : 'desc'; }
        render();
        tableEl.querySelector(`[data-sort="${key}"]`)?.focus();
        return;
      }
      const modeBtn = e.target.closest('[data-mode]');
      if (modeBtn) { state.mode = modeBtn.dataset.mode; render(); }
    });

    render();
  }

  NS.PlayerTable = { mount, COLUMNS };
})(window.UPSIN);
