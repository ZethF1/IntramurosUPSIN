/* ==========================================================================
   home.js — VISTA INICIO (#inicio)
   Dashboard: encabezado compacto, resumen, últimos resultados, próximos
   encuentros, acceso al torneo y clasificación general.
   ========================================================================== */
window.UPSIN = window.UPSIN || {};

(function (NS) {
  'use strict';
  NS.views = NS.views || {};
  const ui = NS.ui;
  const M = NS.core.matches;

  NS.views.home = {
    nav: 'inicio',
    title: () => 'Inicio',

    render(ctx) {
      const { tournament, teams, matches } = ctx.data;
      const sum = M.summary(matches);
      const recent = M.recentResults(matches, 4);
      const upcoming = M.upcomingMatches(matches, 4);
      const cards = (list, emptyTitle) => (list.length
        ? `<div class="match-list">${list.map((m) => ui.matchCard(m, ctx.teamsById)).join('')}</div>`
        : ui.emptyState(emptyTitle));

      return `
      <section class="hero">
        <div class="container hero__inner">
          <div class="hero__content">
            <p class="eyebrow">${ui.esc(tournament.university)}</p>
            <h1 class="hero__title" tabindex="-1">Intramuros UPSIN <span>2026</span></h1>
            <p class="hero__lead">Torneo de Básquetbol · resultados, calendario, clasificación y estadísticas en un solo lugar.</p>
            <div class="hero__actions">
              <a class="btn btn--primary" href="#torneo">Ver torneo ${ui.icon('arrow-right')}</a>
              <a class="btn btn--ghost" href="#partidos">${ui.icon('calendar')} Calendario</a>
            </div>
          </div>
          <svg class="hero__court" viewBox="0 0 300 200" aria-hidden="true" focusable="false">
            <rect x="10" y="10" width="280" height="180" rx="6"/>
            <line x1="150" y1="10" x2="150" y2="190"/>
            <circle cx="150" cy="100" r="30"/>
            <path d="M10 40 H60 A60 60 0 0 1 60 160 H10"/>
            <rect x="10" y="70" width="55" height="60"/>
            <path d="M290 40 H240 A60 60 0 0 0 240 160 H290"/>
            <rect x="235" y="70" width="55" height="60"/>
          </svg>
        </div>
      </section>

      <section class="container section" aria-labelledby="h-resumen">
        ${ui.sectionHead('Resumen de la jornada', { id: 'h-resumen' })}
        <div class="stat-cards">
          ${ui.statCard({ label: 'Total de equipos', value: teams.length, hint: 'Participantes confirmados', iconName: 'users' })}
          ${ui.statCard({ label: 'Partidos disputados', value: sum.played, hint: `de ${sum.total} en fase regular`, iconName: 'ball', demo: true })}
          ${ui.statCard({ label: 'Próximos partidos', value: sum.upcoming, hint: sum.live ? `${sum.live} en curso` : 'Programados', iconName: 'calendar', demo: true })}
          ${ui.statCard({ label: 'Jornada actual', value: `${tournament.currentRound}<small>/${tournament.totalRounds}</small>`, hint: 'Fase regular', iconName: 'target', demo: true })}
        </div>
      </section>

      <section class="container section two-col">
        <div aria-labelledby="h-recientes">
          ${ui.sectionHead('Últimos resultados', { id: 'h-recientes', extra: `<a class="link-more" href="#partidos-finalizados">Ver todos ${ui.icon('arrow-right')}</a>` })}
          ${cards(recent, 'Aún no hay partidos finalizados')}
        </div>
        <div aria-labelledby="h-proximos">
          ${ui.sectionHead('Próximos encuentros', { id: 'h-proximos', extra: `<a class="link-more" href="#partidos-programados">Calendario ${ui.icon('arrow-right')}</a>` })}
          ${cards(upcoming, 'No hay partidos programados')}
        </div>
      </section>

      <section class="container section">
        <a class="cta-banner" href="#torneo">
          <span class="cta-banner__stripes" aria-hidden="true">${teams.map((t) => `<i style="--team:${ui.esc(t.color)}"></i>`).join('')}</span>
          <span class="cta-banner__text">
            <span class="eyebrow">Torneo Intramuros 2026</span>
            <strong>10 equipos. Un solo campeón.</strong>
          </span>
          <span class="btn btn--primary btn--lg">Ver torneo ${ui.icon('arrow-right')}</span>
        </a>
      </section>

      <section class="container section" aria-labelledby="h-clasificacion">
        ${ui.sectionHead('Clasificación general', { id: 'h-clasificacion', extra: ui.demoTag('Tabla demo') })}
        ${ui.standingsTable(ctx.standings)}
        <div class="section-foot">
          ${ui.tiebreakNote()}
          <a class="btn btn--ghost" href="#clasificacion">Ver clasificación completa ${ui.icon('arrow-right')}</a>
        </div>
      </section>`;
    }
  };
})(window.UPSIN);
