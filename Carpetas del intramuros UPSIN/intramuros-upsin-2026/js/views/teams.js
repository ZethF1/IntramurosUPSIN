/* ==========================================================================
   views/teams.js — VISTA EQUIPOS (#equipos y #equipo-03)
   Galería de 10 paneles verticales y detalle de cada equipo con resumen,
   líderes del equipo, tabla de jugadores y partidos.
   ========================================================================== */
window.UPSIN = window.UPSIN || {};

(function (NS) {
  'use strict';
  NS.views = NS.views || {};
  const ui = NS.ui;
  const M = NS.core.matches;
  const S = NS.core.stats;

  function teamCard(team, row) {
    const medal = row.position <= 3 ? ` rank-${row.position}` : '';
    return `<li>
      <a class="team-card${medal}" href="#${ui.esc(team.id)}" style="--team:${ui.esc(team.color)};--team-accent:${ui.esc(team.accent)}">
        <span class="team-card__art" aria-hidden="true">
          <span class="team-card__number">${ui.esc(team.code)}</span>
          ${ui.teamEmblem(team, { size: 76, className: 'team-card__emblem' })}
        </span>
        <span class="team-card__body">
          <span class="team-card__pos"><span class="pos-badge">${row.position}</span> lugar</span>
          <span class="team-card__name">${ui.esc(team.name)}</span>
          <span class="team-card__id">ID provisional: ${ui.esc(team.id)}</span>
          <span class="team-card__stats">
            <span><b>${row.pj}</b><small>PJ</small></span>
            <span><b>${row.pg}</b><small>G</small></span>
            <span><b>${row.pp}</b><small>P</small></span>
            <span class="${row.dif > 0 ? 'is-pos' : row.dif < 0 ? 'is-neg' : ''}"><b>${ui.formatSigned(row.dif)}</b><small>DIF</small></span>
          </span>
          <span class="team-card__cta">Ver equipo ${ui.icon('arrow-right')}</span>
        </span>
      </a>
    </li>`;
  }

  function renderGallery(ctx) {
    return `
      <section class="page-head">
        <div class="container">
          <p class="eyebrow">Intramuros UPSIN 2026 ${ui.demoTag('Identidades provisionales')}</p>
          <h1 class="page-title" tabindex="-1">Equipos participantes</h1>
          <p class="page-lead">Selecciona un equipo para ver su resumen, su plantilla y las estadísticas de cada jugador.</p>
        </div>
      </section>
      <section class="container section">
        <ul class="team-grid">
          ${ctx.data.teams.map((t) => teamCard(t, ctx.standingsById[t.id])).join('')}
        </ul>
      </section>`;
  }

  function leaderMini(label, entry, unit) {
    if (!entry) return `<div class="leader-mini"><p class="leader-mini__label">${label}</p><p class="leader-mini__name">Sin datos</p></div>`;
    return `<div class="leader-mini">
      <p class="leader-mini__label">${label}</p>
      <p class="leader-mini__value">${entry.value.toFixed(1)}<small>${unit}</small></p>
      <p class="leader-mini__name">${ui.esc(entry.row.player.name)} <span>#${entry.row.player.number ?? '—'}</span></p>
    </div>`;
  }

  function renderDetail(ctx, team) {
    const row = ctx.standingsById[team.id];
    const teamPlayers = ctx.playerStats.filter((r) => r.team.id === team.id);
    const teamMatches = ctx.data.matches.filter((m) => m.homeTeamId === team.id || m.awayTeamId === team.id);
    const played = M.recentResults(teamMatches, 3);
    const next = M.upcomingMatches(teamMatches, 3);
    const lead = (key) => S.getLeaders(teamPlayers, key, { mode: 'avg', limit: 1 })[0];
    const ids = ctx.data.teams.map((t) => t.id);
    const idx = ids.indexOf(team.id);
    const prev = ctx.teamsById[ids[(idx - 1 + ids.length) % ids.length]];
    const nextTeam = ctx.teamsById[ids[(idx + 1) % ids.length]];

    return `
      <section class="team-hero" style="--team:${ui.esc(team.color)};--team-accent:${ui.esc(team.accent)}">
        <div class="container">
          <nav class="breadcrumbs" aria-label="Ruta">
            <a class="btn btn--ghost btn--sm" href="#equipos">${ui.icon('arrow-left')} Volver a equipos</a>
          </nav>
          <div class="team-hero__inner">
            <div class="team-hero__emblem" title="Espacio reservado para el logotipo oficial">${ui.teamEmblem(team, { size: 120, decorative: false })}</div>
            <div>
              <p class="eyebrow">${row.position}.º en la clasificación ${ui.demoTag()}</p>
              <h1 class="page-title" tabindex="-1">${ui.esc(team.name)}</h1>
              <p class="team-hero__meta">ID provisional: <code>${ui.esc(team.id)}</code> · Nombre y logotipo oficiales pendientes</p>
            </div>
          </div>
        </div>
      </section>

      <section class="container section" aria-labelledby="h-resumen-eq">
        ${ui.sectionHead('Resumen de resultados', { id: 'h-resumen-eq', extra: ui.demoTag() })}
        <div class="record-grid">
          <div><span>Partidos jugados</span><b>${row.pj}</b></div>
          <div><span>Victorias</span><b class="is-pos">${row.pg}</b></div>
          <div><span>Derrotas</span><b class="is-neg">${row.pp}</b></div>
          <div><span>Puntos a favor</span><b>${row.pf}</b></div>
          <div><span>Puntos en contra</span><b>${row.pc}</b></div>
          <div><span>Diferencia</span><b class="${row.dif > 0 ? 'is-pos' : row.dif < 0 ? 'is-neg' : ''}">${ui.formatSigned(row.dif)}</b></div>
        </div>
        <div class="leader-minis">
          ${leaderMini('Máximo anotador', lead('pts'), 'PTS/P')}
          ${leaderMini('Máximo reboteador', lead('reb'), 'REB/P')}
          ${leaderMini('Líder en asistencias', lead('ast'), 'AST/P')}
        </div>
      </section>

      <section class="container section" aria-labelledby="h-plantilla">
        ${ui.sectionHead('Jugadores y estadísticas individuales', { id: 'h-plantilla' })}
        <div data-role="player-table"></div>
      </section>

      <section class="container section two-col">
        <div>
          ${ui.sectionHead('Últimos partidos', { level: 3, extra: `<a class="link-more" href="#partidos-${ui.esc(team.id)}">Todos ${ui.icon('arrow-right')}</a>` })}
          ${played.length ? `<div class="match-list">${played.map((m) => ui.matchCard(m, ctx.teamsById)).join('')}</div>` : ui.emptyState('Sin partidos finalizados')}
        </div>
        <div>
          ${ui.sectionHead('Próximos partidos', { level: 3 })}
          ${next.length ? `<div class="match-list">${next.map((m) => ui.matchCard(m, ctx.teamsById)).join('')}</div>` : ui.emptyState('Sin partidos programados')}
        </div>
      </section>

      <nav class="container section team-pager" aria-label="Otros equipos">
        <a class="btn btn--ghost" href="#${ui.esc(prev.id)}">${ui.icon('arrow-left')} ${ui.esc(prev.name)}</a>
        <a class="btn btn--ghost" href="#equipos">${ui.icon('users')} Todos</a>
        <a class="btn btn--ghost" href="#${ui.esc(nextTeam.id)}">${ui.esc(nextTeam.name)} ${ui.icon('arrow-right')}</a>
      </nav>`;
  }

  NS.views.teams = {
    nav: 'equipos',
    title: (ctx, params) => (params.id && ctx.teamsById[params.id] ? ctx.teamsById[params.id].name : 'Equipos'),

    render(ctx, params) {
      if (!params.id) return renderGallery(ctx);
      const team = ctx.teamsById[params.id];
      if (!team) {
        return `<section class="container section">
          <h1 class="page-title" tabindex="-1">Equipo no encontrado</h1>
          ${ui.emptyState('No existe un equipo con ese identificador.', '', 'search')}
          <p><a class="btn btn--primary" href="#equipos">${ui.icon('arrow-left')} Volver a equipos</a></p>
        </section>`;
      }
      return renderDetail(ctx, team);
    },

    mount(root, ctx, params) {
      const host = root.querySelector('[data-role="player-table"]');
      if (!host) return;
      const rows = ctx.playerStats.filter((r) => r.team.id === params.id);
      NS.PlayerTable.mount(host, rows, { showTeam: false, mode: 'avg' });
    }
  };
})(window.UPSIN);
