/* ==========================================================================
   ui.js — COMPONENTES VISUALES REUTILIZABLES (devuelven HTML como texto)
   Iconos SVG, emblemas provisionales, tabla de clasificación, tarjetas de
   partido, etiquetas DEMO y estados vacíos.
   ========================================================================== */
window.UPSIN = window.UPSIN || {};

(function (NS) {
  'use strict';

  /* ------------------------------ Utilidades ------------------------------ */
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  /** Escapa texto que vendrá del backend antes de insertarlo como HTML. */
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

  const DATE_SHORT = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
  const DATE_LONG = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const toDate = (iso) => new Date(`${iso}T12:00:00`);

  function formatDate(iso, long = false) {
    if (!iso) return 'Fecha por confirmar';
    return (long ? DATE_LONG : DATE_SHORT).format(toDate(iso)).replace(/\./g, '');
  }

  const formatSigned = (n) => (n > 0 ? `+${n}` : String(n));
  const formatPct = (v) => (v == null ? '—' : `${v.toFixed(1)}%`);
  const normalize = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  /* -------------------------------- Iconos -------------------------------- */
  const ICONS = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4.5v1A3.5 3.5 0 0 0 8 10.5M16 6h3.5v1A3.5 3.5 0 0 1 16 10.5"/><path d="M12 13v4M8.5 21h7M9.5 17h5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2A6.5 6.5 0 0 1 21.5 20"/>',
    chart: '<path d="M3 21h18"/><rect x="5" y="11" width="3" height="7" rx=".5"/><rect x="10.5" y="5" width="3" height="13" rx=".5"/><rect x="16" y="14" width="3" height="4" rx=".5"/>',
    ball: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.6 5.6c3 3 3 9.8 0 12.8M18.4 5.6c-3 3-3 9.8 0 12.8"/>',
    'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    bolt: '<path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12z"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    reset: '<path d="M4 4v6h6"/><path d="M5.5 15a7 7 0 1 0 1.6-7.3L4 10"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>'
  };

  function icon(name, className = '') {
    const body = ICONS[name];
    if (!body) return '';
    return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  /** Rellena los <span data-icon="..."> que hay en el HTML estático. */
  function hydrateIcons(root = document) {
    root.querySelectorAll('[data-icon]').forEach((el) => {
      if (!el.firstChild) el.innerHTML = icon(el.getAttribute('data-icon'));
    });
  }

  /* ------------------------- Emblema de equipo ------------------------- */
  let emblemSeq = 0;
  /**
   * Si el equipo tiene logoUrl muestra la imagen; si no, un escudo SVG
   * provisional con el color y el identificador del equipo.
   */
  function teamEmblem(team, { size = 40, decorative = true, className = '' } = {}) {
    if (!team) return '';
    const alt = `Logotipo de ${team.name}`;
    if (team.logoUrl) {
      return `<img class="emblem emblem--img ${className}" src="${esc(team.logoUrl)}" ${decorative ? 'alt="" aria-hidden="true"' : `alt="${esc(alt)}"`} width="${size}" height="${size}" loading="lazy">`;
    }
    const id = `emb-${++emblemSeq}`;
    const a11y = decorative ? 'aria-hidden="true" focusable="false"' : `role="img" aria-label="Emblema provisional de ${esc(team.name)}"`;
    return `<svg class="emblem ${className}" viewBox="0 0 64 64" width="${size}" height="${size}" ${a11y}>
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${esc(team.accent)}"/><stop offset="1" stop-color="${esc(team.color)}"/></linearGradient></defs>
      <path d="M32 3 L57 12 V32 C57 47 46 56 32 61 C18 56 7 47 7 32 V12 Z" fill="url(#${id})" stroke="rgba(0,0,0,.5)" stroke-width="2.5"/>
      <path d="M32 9.5 L51 16.3 V32 C51 43.5 43 50.5 32 54.5 C21 50.5 13 43.5 13 32 V16.3 Z" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.5"/>
      <text x="32" y="41" text-anchor="middle" font-family="'Barlow Condensed','Arial Narrow',sans-serif" font-weight="800" font-size="23" fill="#0b1020">${esc(team.code)}</text>
    </svg>`;
  }

  /* ------------------------------ Etiquetas ------------------------------ */
  const demoTag = (text = 'Demo', title = 'Dato de demostración, no oficial') =>
    `<span class="demo-tag" title="${esc(title)}">${esc(text)}</span>`;

  const statusPill = (status) => {
    const label = NS.core.matches.STATUS_LABELS[status] || status;
    return `<span class="status-pill status-pill--${esc(status)}">${status === 'live' ? '<span class="live-dot" aria-hidden="true"></span>' : ''}${esc(label)}</span>`;
  };

  function emptyState(title, text = '', iconName = 'info') {
    return `<div class="state state--empty">${icon(iconName, 'state__icon')}<p class="state__title">${esc(title)}</p>${text ? `<p>${esc(text)}</p>` : ''}</div>`;
  }

  function sectionHead(title, { id = '', level = 2, extra = '', eyebrow = '' } = {}) {
    return `<div class="section-head">
      <div>${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}<h${level} ${id ? `id="${id}"` : ''} class="section-title">${esc(title)}</h${level}></div>
      ${extra ? `<div class="section-head__extra">${extra}</div>` : ''}
    </div>`;
  }

  /* ------------------------ Tabla de clasificación ------------------------ */
  function standingsTable(rows, { caption = 'Clasificación general' } = {}) {
    const body = rows.map((r) => {
      const medal = r.position <= 3 ? ` rank-${r.position}` : '';
      const medalName = ['', 'Primer lugar', 'Segundo lugar', 'Tercer lugar'][r.position] || '';
      const difCls = r.dif > 0 ? 'is-pos' : r.dif < 0 ? 'is-neg' : '';
      return `<tr class="standings-row${medal}">
        <td class="col-pos"><span class="pos-badge"${medalName ? ` title="${medalName}"` : ''}>${r.position}</span>${medalName ? `<span class="sr-only"> (${medalName})</span>` : ''}</td>
        <th scope="row" class="col-team"><a class="team-cell" href="#${esc(r.teamId)}">${teamEmblem(r.team, { size: 30 })}<span>${esc(r.team.name)}</span></a></th>
        <td>${r.pj}</td><td class="col-strong">${r.pg}</td><td>${r.pp}</td>
        <td>${r.pf}</td><td>${r.pc}</td><td class="col-dif ${difCls}">${formatSigned(r.dif)}</td>
      </tr>`;
    }).join('');

    return `<div class="table-wrap" role="region" aria-label="${esc(caption)} (desplazable)" tabindex="0">
      <table class="data-table standings">
        <caption class="sr-only">${esc(caption)} — datos de demostración</caption>
        <thead><tr>
          <th scope="col" class="col-pos"><abbr title="Posición">Pos</abbr></th>
          <th scope="col" class="col-team">Equipo</th>
          <th scope="col"><abbr title="Partidos jugados">PJ</abbr></th>
          <th scope="col"><abbr title="Partidos ganados">PG</abbr></th>
          <th scope="col"><abbr title="Partidos perdidos">PP</abbr></th>
          <th scope="col"><abbr title="Puntos a favor">PF</abbr></th>
          <th scope="col"><abbr title="Puntos en contra">PC</abbr></th>
          <th scope="col"><abbr title="Diferencia de puntos">DIF</abbr></th>
        </tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
  }

  function tiebreakNote() {
    const items = NS.core.standings.TIEBREAK_CRITERIA.map((c) => `<li>${esc(c.label)}</li>`).join('');
    return `<details class="note">
      <summary>${icon('info')} Criterios de clasificación provisionales</summary>
      <ol>${items}</ol>
      <p>Se ajustarán cuando se publique el reglamento oficial del torneo.</p>
    </details>`;
  }

  /* --------------------------- Tarjeta de partido --------------------------- */
  function matchCard(m, teamsById) {
    const home = teamsById[m.homeTeamId];
    const away = teamsById[m.awayTeamId];
    const winner = NS.core.matches.winnerId(m);
    const finished = m.status === 'finished';

    const side = (team, score) => {
      const isWinner = winner === team.id;
      const isLoser = winner && !isWinner;
      return `<div class="mc-team${isWinner ? ' is-winner' : ''}${isLoser ? ' is-loser' : ''}">
        <a class="mc-team__link" href="#${esc(team.id)}">${teamEmblem(team, { size: 34 })}<span class="mc-team__name">${esc(team.name)}</span></a>
        <span class="mc-team__score">${finished ? score : ''}${isWinner ? '<span class="sr-only"> (ganador)</span>' : ''}</span>
      </div>`;
    };

    const center = finished ? '' : `<span class="mc-vs">${m.status === 'live' ? 'Marcador no disponible' : 'vs'}</span>`;

    return `<article class="match-card match-card--${esc(m.status)}" aria-label="${esc(home.name)} contra ${esc(away.name)}, jornada ${m.round}">
      <header class="match-card__meta">
        <span class="match-card__round">Jornada ${m.round}</span>
        ${statusPill(m.status)}
      </header>
      <div class="match-card__teams">
        ${side(home, m.homeScore)}
        ${side(away, m.awayScore)}
        ${center}
      </div>
      <footer class="match-card__foot">
        <span>${icon('calendar')}${esc(formatDate(m.date))}</span>
        <span>${icon('clock')}${esc(m.time || 'Hora por confirmar')}</span>
        <span>${icon('pin')}${esc(m.venue || 'Cancha por confirmar')}</span>
        ${m.isDemoSchedule ? demoTag('Fecha demo', 'Fecha y hora de demostración, no oficiales') : ''}
      </footer>
    </article>`;
  }

  function statCard({ label, value, hint = '', iconName = 'ball', demo = false }) {
    return `<div class="stat-card">
      <span class="stat-card__icon">${icon(iconName)}</span>
      <div class="stat-card__body">
        <p class="stat-card__label">${esc(label)} ${demo ? demoTag() : ''}</p>
        <p class="stat-card__value">${value}</p>
        ${hint ? `<p class="stat-card__hint">${esc(hint)}</p>` : ''}
      </div>
    </div>`;
  }

  NS.ui = {
    esc, formatDate, formatSigned, formatPct, normalize,
    icon, hydrateIcons, teamEmblem, demoTag, statusPill, emptyState, sectionHead,
    standingsTable, tiebreakNote, matchCard, statCard
  };
})(window.UPSIN);
