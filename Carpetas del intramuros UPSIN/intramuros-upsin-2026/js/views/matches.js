/* ==========================================================================
   views/matches.js — VISTA PARTIDOS (#partidos, #partidos-finalizados, #partidos-equipo-03)
   A. Calendario con filtros por jornada, equipo y estado.
   B. Fases eliminatorias: cuadro flexible construido con core/matches.js.
   ========================================================================== */
window.UPSIN = window.UPSIN || {};

(function (NS) {
  'use strict';
  NS.views = NS.views || {};
  const ui = NS.ui;
  const M = NS.core.matches;

  const STATUS_OPTIONS = [['all', 'Todos'], ['scheduled', 'Programado'], ['live', 'En curso'], ['finished', 'Finalizado']];

  /* ------------------------------ Calendario ------------------------------ */
  function renderList(ctx, filters) {
    const filtered = M.sortByDate(M.filterMatches(ctx.data.matches, filters));
    if (!filtered.length) {
      return { html: ui.emptyState('No hay partidos con estos filtros', 'Prueba con otra jornada, equipo o estado.', 'search'), count: 0 };
    }
    const html = M.roundsOf(filtered).map((round) => {
      const games = filtered.filter((m) => m.round === round);
      return `<section class="round-group" aria-labelledby="h-j${round}">
        <h3 class="round-group__title" id="h-j${round}">Jornada ${round}<span>${ui.esc(ui.formatDate(games[0].date, true))}</span></h3>
        <div class="match-grid">${games.map((m) => ui.matchCard(m, ctx.teamsById)).join('')}</div>
      </section>`;
    }).join('');
    return { html, count: filtered.length };
  }

  /* ------------------------------- Bracket ------------------------------- */
  function slotHtml(slot, score, isWinner) {
    if (slot.bye) return `<div class="bk-slot bk-slot--bye"><span class="bk-seed"></span><span class="bk-name">Pase directo</span><span class="bk-score"></span></div>`;
    if (slot.placeholder) return `<div class="bk-slot bk-slot--tbd"><span class="bk-seed"></span><span class="bk-name">${ui.esc(slot.label)}</span><span class="bk-score">–</span></div>`;
    return `<div class="bk-slot${isWinner ? ' is-winner' : ''}" style="--team:${ui.esc(slot.team.color)}">
      <span class="bk-seed" title="Sembrado ${slot.seed}">${slot.seed}</span>
      <span class="bk-name">${ui.teamEmblem(slot.team, { size: 22 })}${ui.esc(slot.team.name)}</span>
      <span class="bk-score">${score ?? '–'}</span>
    </div>`;
  }

  function matchHtml(m) {
    const winA = m.winner && m.winner === m.a && !m.isBye;
    const winB = m.winner && m.winner === m.b && !m.isBye;
    return `<div class="bk-match${m.isBye ? ' bk-match--bye' : ''}">
      <span class="bk-code">${ui.esc(m.code)}</span>
      ${slotHtml(m.a, m.result?.a, winA)}
      ${slotHtml(m.b, m.result?.b, winB)}
    </div>`;
  }

  const ROUND_STATUS = {
    projection: { label: 'Proyección', icon: 'target' },
    locked: { label: 'Pendiente', icon: 'lock' },
    active: { label: 'En juego', icon: 'bolt' },
    done: { label: 'Concluida', icon: 'trophy' }
  };

  function renderBracket(bracket) {
    const first = bracket.rounds[0].matches.length;
    const cols = bracket.rounds.map((round) => {
      const st = ROUND_STATUS[round.status];
      let body;
      if (round.matches.length === 1) {
        body = matchHtml(round.matches[0]);
      } else {
        const pairs = [];
        for (let i = 0; i < round.matches.length; i += 2) {
          pairs.push(`<div class="bk-pair">${matchHtml(round.matches[i])}${matchHtml(round.matches[i + 1])}</div>`);
        }
        body = pairs.join('');
      }
      return `<section class="bk-round bk-round--${round.status}" aria-label="${ui.esc(round.name)}: ${st.label}">
        <header class="bk-round__head"><h3>${ui.esc(round.name)}</h3><span class="bk-state">${ui.icon(st.icon)}${st.label}</span></header>
        <div class="bk-round__body">${body}</div>
      </section>`;
    }).join('');

    return `<div class="bracket-scroll" role="region" aria-label="Cuadro eliminatorio (desplazable)" tabindex="0">
      <div class="bracket" style="--slots:${first}; --rounds:${bracket.rounds.length + 1}">
        ${cols}
        <section class="bk-round bk-round--champion" aria-label="Campeón por definir">
          <header class="bk-round__head"><h3>Campeón</h3></header>
          <div class="bk-round__body"><div class="bk-champion">${ui.icon('trophy')}<span>Por definir</span></div></div>
        </section>
      </div>
    </div>`;
  }

  NS.views.matches = {
    nav: 'partidos',
    title: () => 'Partidos',

    render(ctx) {
      const { teams, playoffs } = ctx.data;
      const rounds = M.roundsOf(ctx.data.matches);
      const bracket = M.buildBracket(ctx.standings, playoffs);
      const sum = M.summary(ctx.data.matches);

      return `
      <section class="page-head">
        <div class="container">
          <p class="eyebrow">Fase regular · ${sum.total} partidos ${ui.demoTag('Calendario demo')}</p>
          <h1 class="page-title" tabindex="-1">Partidos</h1>
          <p class="page-lead">Consulta el calendario, los resultados de cada jornada y la estructura de las fases eliminatorias.</p>
        </div>
      </section>

      <section class="container section" aria-labelledby="h-calendario">
        ${ui.sectionHead('Calendario de partidos', { id: 'h-calendario' })}
        <form class="filters" data-role="filters" aria-label="Filtrar partidos">
          <label class="field">
            <span class="field__label">Jornada</span>
            <select class="select" name="round">
              <option value="all">Todas las jornadas</option>
              ${rounds.map((r) => `<option value="${r}">Jornada ${r}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span class="field__label">Equipo</span>
            <select class="select" name="teamId">
              <option value="all">Todos los equipos</option>
              ${teams.map((t) => `<option value="${ui.esc(t.id)}">${ui.esc(t.name)}</option>`).join('')}
            </select>
          </label>
          <fieldset class="field field--status">
            <legend class="field__label">Estado</legend>
            <div class="segmented">
              ${STATUS_OPTIONS.map(([value, label]) => `<label class="segmented__opt"><input type="radio" name="status" value="${value}"${value === 'all' ? ' checked' : ''}><span>${label}</span></label>`).join('')}
            </div>
          </fieldset>
          <button type="reset" class="btn btn--ghost btn--sm">${ui.icon('reset')} Limpiar</button>
        </form>
        <p class="table-meta" aria-live="polite" data-role="count"></p>
        <div data-role="list"></div>
      </section>

      <section class="container section" aria-labelledby="h-bracket">
        ${ui.sectionHead('Fases eliminatorias', { id: 'h-bracket', extra: ui.demoTag('Estructura demo') })}
        <div class="notice">
          ${ui.icon('info')}
          <p><strong>Formato provisional.</strong> Diez equipos no completan una llave de octavos: esta vista supone que avanzan
          ${bracket.qualified} equipos en un cuadro de ${bracket.size}${bracket.byes ? `, con ${bracket.byes} pases directos para los mejores sembrados` : ''}.
          Los cruces se proyectan con la clasificación actual y no constituyen un calendario oficial.
          El formato se ajusta en <code>js/data.js → playoffs.qualifiedTeams</code>.</p>
        </div>
        ${renderBracket(bracket)}
      </section>`;
    },

    mount(root, ctx, params) {
      const form = root.querySelector('[data-role="filters"]');
      const listEl = root.querySelector('[data-role="list"]');
      const countEl = root.querySelector('[data-role="count"]');

      const preset = params.query || {};
      if (['scheduled', 'live', 'finished'].includes(preset.estado)) form.elements.status.value = preset.estado;
      if (preset.equipo && ctx.teamsById[preset.equipo]) form.elements.teamId.value = preset.equipo;
      if (preset.jornada) form.elements.round.value = preset.jornada;

      const update = () => {
        const filters = { round: form.elements.round.value, teamId: form.elements.teamId.value, status: form.elements.status.value || 'all' };
        const { html, count } = renderList(ctx, filters);
        listEl.innerHTML = html;
        countEl.textContent = `Mostrando ${count} ${count === 1 ? 'partido' : 'partidos'}`;
      };

      form.addEventListener('change', update);
      form.addEventListener('submit', (e) => e.preventDefault());
      form.addEventListener('reset', () => setTimeout(update, 0));
      update();
    }
  };
})(window.UPSIN);
