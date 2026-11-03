/* ==========================================================================
   app.js — ARRANQUE Y ENRUTADOR (SPA con rutas hash simples)
   --------------------------------------------------------------------------
   Las rutas son nombres planos (#nombre) para que funcionen igual al abrir
   el archivo local, en un servidor o embebidas en otra página.
     #inicio                      → views/home.js
     #torneo                      → views/tournament.js
     #clasificacion               → views/tournament.js (desplaza a la tabla)
     #partidos                    → views/matches.js
     #partidos-finalizados        → Partidos con filtro de estado
     #partidos-programados | #partidos-en-curso
     #partidos-<idEquipo>         → Partidos filtrados por equipo
     #equipos                     → views/teams.js (galería)
     #<idEquipo>  (ej. #equipo-03) → views/teams.js (detalle)
     #estadisticas                → views/statistics.js
   Los id de equipo deben usar solo letras, números y guiones.
   ========================================================================== */
window.UPSIN = window.UPSIN || {};

(function (NS) {
  'use strict';

  const STATUS_ROUTES = { finalizados: 'finished', programados: 'scheduled', 'en-curso': 'live' };

  /** Traduce el nombre de la ruta a { view, params }. Necesita ctx para reconocer equipos. */
  function resolve(name) {
    if (name === '' || name === 'inicio') return { view: 'home', params: {} };
    if (name === 'torneo') return { view: 'tournament', params: {} };
    if (name === 'clasificacion') return { view: 'tournament', params: { section: 'clasificacion' } };
    if (name === 'equipos') return { view: 'teams', params: {} };
    if (name === 'estadisticas') return { view: 'stats', params: {} };
    if (name === 'partidos') return { view: 'matches', params: { query: {} } };
    if (name.startsWith('partidos-')) {
      const rest = name.slice('partidos-'.length);
      if (STATUS_ROUTES[rest]) return { view: 'matches', params: { query: { estado: STATUS_ROUTES[rest] } } };
      if (ctx.teamsById[rest]) return { view: 'matches', params: { query: { equipo: rest } } };
    }
    if (ctx.teamsById[name]) return { view: 'teams', params: { id: name } };
    if (name.startsWith('equipos-') && ctx.teamsById[name.slice(8)]) return { view: 'teams', params: { id: name.slice(8) } };
    return null;
  }

  const app = document.getElementById('app');
  const announcer = document.getElementById('route-announcer');
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  let ctx = null;
  let firstRender = true;

  /** Datos derivados que comparten todas las vistas (una sola fuente). */
  function buildContext(data) {
    const teamsById = Object.fromEntries(data.teams.map((t) => [t.id, t]));
    const standings = NS.core.standings.computeStandings(data.teams, data.matches);
    return {
      data,
      teamsById,
      standings,
      standingsById: Object.fromEntries(standings.map((s) => [s.teamId, s])),
      playerStats: NS.core.stats.aggregatePlayerStats(data.players, data.playerGameStats, teamsById)
    };
  }

  function currentRoute() {
    // Acepta también el formato antiguo "#/ruta" por compatibilidad.
    return decodeURIComponent(location.hash.replace(/^#\/?/, '')).replace(/\//g, '-').trim();
  }

  function setActiveNav(key) {
    document.querySelectorAll('[data-nav]').forEach((a) => {
      const active = a.dataset.nav === key;
      a.classList.toggle('is-active', active);
      if (active) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function setMenu(open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Cerrar menú' : 'Abrir menú';
  }

  function render() {
    const hit = resolve(currentRoute());
    if (!hit) { location.replace('#inicio'); return; }

    const view = NS.views[hit.view];
    const params = { query: {}, ...hit.params };
    try {
      app.innerHTML = view.render(ctx, params);
      if (view.mount) view.mount(app, ctx, params);
    } catch (err) {
      console.error(err);
      app.innerHTML = `<div class="container section">${NS.ui.emptyState('No se pudo mostrar esta sección', 'Revisa la consola del navegador para más detalles.')}</div>`;
    }

    const title = view.title(ctx, params);
    document.title = `${title} · Intramuros UPSIN 2026`;
    announcer.textContent = `Sección: ${title}`;
    setActiveNav(view.nav);
    setMenu(false);

    const target = params.section ? document.getElementById(params.section) : null;
    if (target) target.scrollIntoView({ block: 'start' });
    else window.scrollTo(0, 0);

    if (!firstRender) app.querySelector('h1')?.focus({ preventScroll: true });
    firstRender = false;
  }

  async function boot() {
    NS.ui.hydrateIcons(document);
    toggle.addEventListener('click', () => setMenu(!header.classList.contains('is-open')));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

    try {
      const data = await NS.dataService.loadAll();
      ctx = buildContext(data);
    } catch (err) {
      console.error(err);
      app.innerHTML = `<div class="container section">${NS.ui.emptyState('No se pudieron cargar los datos del torneo', err.message)}</div>`;
      return;
    }

    window.addEventListener('hashchange', render);
    render();
  }

  boot();
})(window.UPSIN);
