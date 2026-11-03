/* ==========================================================================
   tournament.js — VISTA TORNEO INTRAMUROS 2026 (#torneo, #clasificacion)
   Banner especial (logotipo original "INTRAMUROS UPSIN" + 10 paneles
   verticales), información del torneo, accesos y clasificación.
   El banner se inspira en la composición de paneles verticales del
   "Torneo del Poder", pero el logotipo y los gráficos son originales.
   ========================================================================== */
window.UPSIN = window.UPSIN || {};

(function (NS) {
  'use strict';
  NS.views = NS.views || {};
  const ui = NS.ui;
  const M = NS.core.matches;

  /* Estrella de energía detrás del balón (puntos calculados). */
  function burstPoints(cx, cy, outer, inner, spikes) {
    const pts = [];
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outer * (0.82 + ((i * 37) % 10) / 50) : inner;
      const a = (Math.PI * i) / spikes - Math.PI / 2;
      pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  /* Logotipo original en SVG. La pelota sustituye a la "O" de INTRAMUROS
     y la canasta completa la composición a la derecha. */
  function logoSvg() {
    const font = "font-family=\"'Barlow Condensed','Arial Narrow',Impact,sans-serif\" font-weight=\"900\" font-style=\"italic\"";
    const word = (x, len, text, layer) => (layer === 'back'
      ? `<text x="${x}" y="184" textLength="${len}" lengthAdjust="spacingAndGlyphs" fill="none" stroke="#06040f" stroke-width="26" stroke-linejoin="round">${text}</text>`
      : `<text x="${x}" y="184" textLength="${len}" lengthAdjust="spacingAndGlyphs" fill="url(#tpFill)" stroke="#6b2200" stroke-width="3" stroke-linejoin="round">${text}</text>`);

    return `<svg class="tp-logo" viewBox="0 0 1000 300" role="img" aria-labelledby="tp-logo-title">
      <title id="tp-logo-title">Intramuros UPSIN 2026 — Torneo de Básquetbol</title>
      <defs>
        <linearGradient id="tpFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff7c2"/><stop offset=".3" stop-color="#ffd23a"/>
          <stop offset=".65" stop-color="#ff8a00"/><stop offset="1" stop-color="#e2430c"/>
        </linearGradient>
        <radialGradient id="tpBall" cx=".36" cy=".3" r=".8">
          <stop offset="0" stop-color="#ffb46b"/><stop offset=".55" stop-color="#f26a10"/><stop offset="1" stop-color="#9c3500"/>
        </radialGradient>
        <radialGradient id="tpBurst" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="#fff2a8"/><stop offset=".45" stop-color="#ffb81c" stop-opacity=".85"/><stop offset="1" stop-color="#ff6a00" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="tpBadge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2f63e8"/><stop offset="1" stop-color="#0d2a80"/>
        </linearGradient>
      </defs>

      <polygon class="tp-burst" points="${burstPoints(694, 120, 128, 74, 14)}" fill="url(#tpBurst)"/>
      <path d="M720 52 Q 820 -12 912 86" fill="none" stroke="#ffe08a" stroke-width="4" stroke-dasharray="1 13" stroke-linecap="round" opacity=".85"/>

      <!-- Canasta -->
      <g class="tp-hoop">
        <rect x="858" y="14" width="132" height="94" rx="7" fill="rgba(255,255,255,.1)" stroke="#06040f" stroke-width="14"/>
        <rect x="858" y="14" width="132" height="94" rx="7" fill="rgba(255,255,255,.08)" stroke="#ffffff" stroke-width="6"/>
        <rect x="897" y="48" width="54" height="40" fill="none" stroke="#ff7a1a" stroke-width="5"/>
        <path d="M924 108 v8" stroke="#ffffff" stroke-width="6"/>
        <path d="M880 120 L896 176 M898 122 L909 176 M915 123 L920 176 M933 123 L928 176 M950 122 L939 176 M968 120 L952 176 M888 146 H960 M894 164 H954" stroke="#ffffff" stroke-width="3" fill="none" opacity=".9"/>
        <ellipse cx="924" cy="119" rx="47" ry="9" fill="none" stroke="#06040f" stroke-width="13"/>
        <ellipse cx="924" cy="119" rx="47" ry="9" fill="none" stroke="#ff7a1a" stroke-width="7"/>
      </g>

      <!-- INTRAMUR · balón · S -->
      <g ${font} font-size="178">
        ${word(22, 598, 'INTRAMUR', 'back')}
        ${word(770, 72, 'S', 'back')}
        ${word(22, 598, 'INTRAMUR', 'front')}
        ${word(770, 72, 'S', 'front')}
      </g>
      <g class="tp-ball">
        <circle cx="694" cy="120" r="70" fill="#06040f"/>
        <circle cx="694" cy="120" r="59" fill="url(#tpBall)"/>
        <g fill="none" stroke="#2a1000" stroke-width="5" stroke-linecap="round">
          <path d="M635 120 H753"/><path d="M694 61 V179"/>
          <path d="M652 79 C677 101 677 139 652 161"/><path d="M736 79 C711 101 711 139 736 161"/>
        </g>
        <ellipse cx="671" cy="93" rx="17" ry="9" fill="#ffffff" opacity=".3" transform="rotate(-32 671 93)"/>
      </g>

      <!-- UPSIN -->
      <polygon points="582,204 972,204 952,288 562,288" fill="#06040f"/>
      <polygon points="590,210 962,210 945,281 573,281" fill="url(#tpBadge)" stroke="#9fc0ff" stroke-width="2"/>
      <text x="768" y="270" text-anchor="middle" ${font} font-size="80" textLength="300" lengthAdjust="spacingAndGlyphs" fill="#ffffff" stroke="#06040f" stroke-width="3">UPSIN</text>

      <g font-family="'Barlow Condensed','Arial Narrow',sans-serif" font-weight="700" fill="#cfe0ff">
        <line x1="40" y1="230" x2="530" y2="230" stroke="#ffcc33" stroke-width="2" opacity=".7"/>
        <text x="40" y="266" font-size="32" textLength="400" lengthAdjust="spacingAndGlyphs">TORNEO DE BÁSQUETBOL</text>
        <text x="530" y="266" font-size="32" text-anchor="end" fill="#ffcc33">2026</text>
      </g>
    </svg>`;
  }

  /* Camiseta provisional que hace de "silueta" del equipo en cada panel. */
  const JERSEY = 'M30 6 L41 6 Q50 20 59 6 L70 6 L72 22 Q78 32 90 34 L90 116 L10 116 L10 34 Q22 32 28 22 Z';

  function teamPanel(team, row) {
    const c = ui.esc(team.color);
    return `<li class="tp-panel">
      <a href="#${ui.esc(team.id)}" style="--team:${c};--team-accent:${ui.esc(team.accent)}" aria-label="${ui.esc(team.name)}, posición ${row.position} — ver equipo">
        <span class="tp-panel__lines" aria-hidden="true"></span>
        <span class="tp-panel__slot" title="Espacio reservado para el logotipo oficial">
          ${ui.teamEmblem(team, { size: 56 })}
          <span class="tp-panel__slot-label">Logo pendiente</span>
        </span>
        <svg class="tp-panel__jersey" viewBox="0 0 100 120" aria-hidden="true" focusable="false">
          <path d="${JERSEY}"/>
          <text x="50" y="86" text-anchor="middle">${ui.esc(team.code)}</text>
        </svg>
        <span class="tp-panel__name">${team.isPlaceholder ? `<span class="tp-panel__word">Equipo </span>${ui.esc(team.code)}` : ui.esc(team.name)}</span>
      </a>
    </li>`;
  }

  function accessCard(href, iconName, title, text) {
    return `<a class="access-card" href="${href}">
      <span class="access-card__icon">${ui.icon(iconName)}</span>
      <span class="access-card__title">${title}</span>
      <span class="access-card__text">${text}</span>
      <span class="access-card__go">${ui.icon('arrow-right')}</span>
    </a>`;
  }

  NS.views.tournament = {
    nav: 'torneo',
    title: (ctx, params) => (params.section === 'clasificacion' ? 'Clasificación' : 'Torneo Intramuros 2026'),

    render(ctx) {
      const { tournament, teams, matches } = ctx.data;
      const sum = M.summary(matches);
      const byTeam = ctx.standingsById;

      return `
      <section class="container section section--flush-top">
        <h1 class="sr-only" tabindex="-1">Torneo Intramuros UPSIN 2026</h1>
        <div class="tp-banner">
          <div class="tp-banner__rays" aria-hidden="true"></div>
          <div class="tp-banner__glow" aria-hidden="true"></div>
          <div class="tp-banner__logo">${logoSvg()}</div>
          <ol class="tp-panels" aria-label="Los 10 equipos participantes">
            ${teams.map((t) => teamPanel(t, byTeam[t.id])).join('')}
          </ol>
        </div>
        <p class="banner-note">${ui.icon('info')} Identificadores, colores y emblemas provisionales. Los nombres y logotipos oficiales de cada equipo se colocarán en cuanto se proporcionen.</p>
      </section>

      <section class="container section" aria-labelledby="h-info">
        ${ui.sectionHead('Información del torneo', { id: 'h-info' })}
        <dl class="info-grid">
          <div><dt>Nombre del torneo</dt><dd>${ui.esc(tournament.name)}</dd></div>
          <div><dt>Universidad organizadora</dt><dd>${ui.esc(tournament.university)}</dd></div>
          <div><dt>Año</dt><dd>${tournament.year}</dd></div>
          <div><dt>Número de equipos</dt><dd>${teams.length}</dd></div>
          <div><dt>Partidos disputados ${ui.demoTag()}</dt><dd>${sum.played} <small>de ${sum.total}</small></dd></div>
          <div><dt>Estado del torneo ${ui.demoTag()}</dt><dd><span class="status-dot" aria-hidden="true"></span>${ui.esc(tournament.status)} · Jornada ${tournament.currentRound}</dd></div>
        </dl>
      </section>

      <section class="container section" aria-labelledby="h-accesos">
        ${ui.sectionHead('Accesos principales', { id: 'h-accesos' })}
        <div class="access-grid">
          ${accessCard('#clasificacion', 'trophy', 'Clasificación general', 'Posiciones, victorias y diferencia de puntos.')}
          ${accessCard('#partidos', 'calendar', 'Calendario de partidos', 'Jornadas, resultados y fases eliminatorias.')}
          ${accessCard('#equipos', 'users', 'Equipos participantes', 'Los 10 equipos y sus plantillas.')}
          ${accessCard('#estadisticas', 'chart', 'Estadísticas individuales', 'Líderes, gráficos y tabla de jugadores.')}
        </div>
      </section>

      <section class="container section" id="clasificacion" aria-labelledby="h-tabla">
        ${ui.sectionHead('Clasificación general', { id: 'h-tabla', extra: ui.demoTag('Tabla demo') })}
        ${ui.standingsTable(ctx.standings)}
        <div class="section-foot">${ui.tiebreakNote()}</div>
      </section>`;
    }
  };
})(window.UPSIN);
