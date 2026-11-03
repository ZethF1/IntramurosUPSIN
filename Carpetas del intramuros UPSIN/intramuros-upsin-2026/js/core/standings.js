/* ==========================================================================
   standings.js — CÁLCULO DE LA CLASIFICACIÓN (sin DOM)
   --------------------------------------------------------------------------
   La tabla se calcula siempre a partir de los partidos finalizados, así
   Inicio y Torneo muestran exactamente lo mismo.

   CRITERIOS PROVISIONALES (se cambian aquí cuando exista reglamento oficial):
     1. Mayor número de victorias.
     2. Mayor diferencia de puntos acumulada (PF − PC).
     3. Mayor cantidad de puntos a favor.
   Si aun así persiste el empate, se ordena alfabéticamente SOLO para que la
   tabla sea estable en pantalla; no es una regla de desempate.
   ========================================================================== */
window.UPSIN = window.UPSIN || {};

(function (NS) {
  'use strict';
  NS.core = NS.core || {};

  const TIEBREAK_CRITERIA = [
    { key: 'pg', label: 'Mayor número de victorias' },
    { key: 'dif', label: 'Mayor diferencia de puntos (PF − PC)' },
    { key: 'pf', label: 'Mayor cantidad de puntos a favor' }
  ];

  /** Diferencia de puntos. */
  function pointDiff(pointsFor, pointsAgainst) {
    return pointsFor - pointsAgainst;
  }

  function hasFinalScore(m) {
    return m.status === 'finished' && Number.isFinite(m.homeScore) && Number.isFinite(m.awayScore);
  }

  /** Acumula PJ, PG, PP, PF, PC y DIF por equipo. */
  function computeTeamRecords(teams, matches) {
    const rows = new Map(teams.map((team) => [team.id, { teamId: team.id, team, pj: 0, pg: 0, pp: 0, pf: 0, pc: 0, dif: 0 }]));

    matches.filter(hasFinalScore).forEach((m) => {
      const home = rows.get(m.homeTeamId);
      const away = rows.get(m.awayTeamId);
      if (!home || !away) return;
      home.pj += 1; away.pj += 1;
      home.pf += m.homeScore; home.pc += m.awayScore;
      away.pf += m.awayScore; away.pc += m.homeScore;
      if (m.homeScore > m.awayScore) { home.pg += 1; away.pp += 1; }
      else if (m.awayScore > m.homeScore) { away.pg += 1; home.pp += 1; }
    });

    rows.forEach((row) => { row.dif = pointDiff(row.pf, row.pc); });
    return [...rows.values()];
  }

  function compareStandings(a, b) {
    for (const criterion of TIEBREAK_CRITERIA) {
      const diff = b[criterion.key] - a[criterion.key];
      if (diff !== 0) return diff;
    }
    return a.team.name.localeCompare(b.team.name, 'es');
  }

  /** Ordena y asigna la posición (1 … n). */
  function sortStandings(rows) {
    return [...rows].sort(compareStandings).map((row, i) => ({ ...row, position: i + 1 }));
  }

  function computeStandings(teams, matches) {
    return sortStandings(computeTeamRecords(teams, matches));
  }

  NS.core.standings = { TIEBREAK_CRITERIA, pointDiff, computeTeamRecords, sortStandings, computeStandings };
})(window.UPSIN);
