/* ==========================================================================
   views/statistics.js — VISTA ESTADÍSTICAS (#estadisticas)
   Líderes calculados + gráficos de barras + tabla global de jugadores.
   Tablas y gráficos salen del mismo arreglo ctx.playerStats.
   ========================================================================== */
window.UPSIN = window.UPSIN || {};

(function (NS) {
  'use strict';
  NS.views = NS.views || {};
  const ui = NS.ui;
  const S = NS.core.stats;

  const CATEGORIES = [
    { key: 'pts', title: 'Máximos anotadores', unit: 'PTS', icon: 'target' },
    { key: 'reb', title: 'Máximos reboteadores', unit: 'REB', icon: 'ball' },
    { key: 'ast', title: 'Líderes en asistencias', unit: 'AST', icon: 'users' },
    { key: 'stl', title: 'Líderes en robos', unit: 'STL', icon: 'bolt' },
    { key: 'blk', title: 'Líderes en bloqueos', unit: 'BLK', icon: 'shield' },
    { key: 'dd', title: 'Más dobles-dobles', unit: 'DD', icon: 'chart', totalOnly: true },
    { key: 'td', title: 'Más triples-dobles', unit: 'TD', icon: 'trophy', totalOnly: true }
  ];

  const fmt = (value, mode) => (mode === 'avg' ? value.toFixed(1) : String(Math.round(value)));

  function spotlight(rows, mode) {
    return ['pts', 'reb', 'ast'].map((key) => {
      const cat = CATEGORIES.find((c) => c.key === key);
      const top = S.getLeaders(rows, key, { mode, limit: 1 })[0];
      if (!top) return '';
      const { row } = top;
      return `<a class="spotlight" href="#${ui.esc(row.team.id)}" style="--team:${ui.esc(row.team.color)}">
        <span class="spotlight__label">${ui.esc(cat.title.replace(/^Máximos |^Líderes en /, '').replace(/^./, (c) => c.toUpperCase()))}</span>
        ${ui.teamEmblem(row.team, { size: 44 })}
        <span class="spotlight__name">${ui.esc(row.player.name)}</span>
        <span class="spotlight__team">${ui.esc(row.team.name)} · #${row.player.number ?? '—'}</span>
        <span class="spotlight__value">${fmt(top.value, mode)}<small>${cat.unit}${mode === 'avg' ? ' por partido' : ' totales'}</small></span>
      </a>`;
    }).join('');
  }

  function leaderCard(rows, cat, mode) {
    const leaders = S.getLeaders(rows, cat.key, { mode, limit: 5 });
    const effMode = cat.totalOnly ? 'total' : mode;
    const max = leaders.length ? leaders[0].value : 1;
    const list = leaders.length
      ? `<ol class="bar-list">${leaders.map((l, i) => `
          <li>
            <span class="bar-list__rank">${i + 1}</span>
            <a class="bar-list__who" href="#${ui.esc(l.row.team.id)}">
              ${ui.teamEmblem(l.row.team, { size: 24 })}
              <span><span class="bar-list__name">${ui.esc(l.row.player.name)}</span><span class="bar-list__team">${ui.esc(l.row.team.name)}</span></span>
            </a>
            <span class="bar" aria-hidden="true"><span class="bar__fill" style="--w:${((l.value / max) * 100).toFixed(1)}%;--team:${ui.esc(l.row.team.color)}"></span></span>
            <strong class="bar-list__value">${fmt(l.value, effMode)}</strong>
          </li>`).join('')}</ol>`
      : ui.emptyState(cat.key === 'td' ? 'Aún no hay triples-dobles registrados' : 'Sin registros todavía', '', cat.icon);

    return `<article class="leader-card" aria-labelledby="lc-${cat.key}">
      <header class="leader-card__head">
        <span class="leader-card__icon">${ui.icon(cat.icon)}</span>
        <h3 id="lc-${cat.key}">${ui.esc(cat.title)}</h3>
        <span class="leader-card__unit">${cat.unit} ${effMode === 'avg' ? 'por partido' : 'totales'}</span>
      </header>
      ${list}
    </article>`;
  }

  NS.views.stats = {
    nav: 'estadisticas',
    title: () => 'Estadísticas',

    render(ctx) {
      const games = ctx.data.matches.filter((m) => m.status === 'finished').length;
      return `
      <section class="page-head">
        <div class="container">
          <p class="eyebrow">${games} partidos con estadísticas ${ui.demoTag('Estadísticas demo')}</p>
          <h1 class="page-title" tabindex="-1">Estadísticas del torneo</h1>
          <p class="page-lead">Líderes individuales calculados partido a partido. Todos los valores son de demostración y no representan resultados oficiales.</p>
        </div>
      </section>

      <section class="container section" aria-labelledby="h-lideres">
        ${ui.sectionHead('Líderes del torneo', {
          id: 'h-lideres',
          extra: `<div class="segmented" role="group" aria-label="Tipo de valor">
            <button type="button" class="segmented__btn" data-leader-mode="avg">Por partido</button>
            <button type="button" class="segmented__btn" data-leader-mode="total">Totales</button>
          </div>`
        })}
        <div class="spotlights" data-role="spotlights"></div>
        <div class="leader-grid" data-role="leaders"></div>
      </section>

      <section class="container section" aria-labelledby="h-tabla-jug">
        ${ui.sectionHead('Tabla de jugadores', { id: 'h-tabla-jug' })}
        <div data-role="player-table"></div>
      </section>`;
    },

    mount(root, ctx) {
      const rows = ctx.playerStats;
      const spot = root.querySelector('[data-role="spotlights"]');
      const grid = root.querySelector('[data-role="leaders"]');
      let mode = 'avg';

      const renderLeaders = () => {
        root.querySelectorAll('[data-leader-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.leaderMode === mode)));
        spot.innerHTML = spotlight(rows, mode);
        grid.innerHTML = CATEGORIES.map((cat) => leaderCard(rows, cat, mode)).join('');
      };

      root.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-leader-mode]');
        if (btn) { mode = btn.dataset.leaderMode; renderLeaders(); }
      });

      renderLeaders();
      NS.PlayerTable.mount(root.querySelector('[data-role="player-table"]'), rows, { showTeam: true, teams: ctx.data.teams, mode: 'avg' });
    }
  };
})(window.UPSIN);
