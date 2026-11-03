/* ==========================================================================
   matches.js — LÓGICA DE PARTIDOS Y CUADRO ELIMINATORIO (sin DOM)
   ========================================================================== */
window.UPSIN = window.UPSIN || {};

(function (NS) {
  'use strict';
  NS.core = NS.core || {};

  const STATUS_LABELS = { scheduled: 'Programado', live: 'En curso', finished: 'Finalizado' };
  const timestamp = (m) => `${m.date || '9999-12-31'}T${m.time || '23:59'}`;

  /** Filtra por jornada, equipo y estado ('all' = sin filtro). */
  function filterMatches(matches, { round = 'all', teamId = 'all', status = 'all' } = {}) {
    return matches.filter((m) =>
      (round === 'all' || m.round === Number(round))
      && (teamId === 'all' || m.homeTeamId === teamId || m.awayTeamId === teamId)
      && (status === 'all' || m.status === status));
  }

  function sortByDate(matches, dir = 'asc') {
    const sign = dir === 'asc' ? 1 : -1;
    return [...matches].sort((a, b) => sign * timestamp(a).localeCompare(timestamp(b)));
  }

  function recentResults(matches, limit = 5) {
    return sortByDate(matches.filter((m) => m.status === 'finished'), 'desc').slice(0, limit);
  }

  function upcomingMatches(matches, limit = 5) {
    return sortByDate(matches.filter((m) => m.status === 'scheduled'), 'asc').slice(0, limit);
  }

  function winnerId(m) {
    if (m.status !== 'finished' || m.homeScore == null || m.awayScore == null) return null;
    if (m.homeScore === m.awayScore) return null;
    return m.homeScore > m.awayScore ? m.homeTeamId : m.awayTeamId;
  }

  function summary(matches) {
    const count = (s) => matches.filter((m) => m.status === s).length;
    return { total: matches.length, played: count('finished'), live: count('live'), upcoming: count('scheduled') };
  }

  function roundsOf(matches) {
    return [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);
  }

  /* ------------------------- CUADRO ELIMINATORIO ------------------------- */
  // Nombre de la ronda según cuántos equipos la juegan.
  const ROUND_NAMES = { 2: 'Final', 4: 'Semifinales', 8: 'Cuartos de final', 16: 'Octavos de final', 32: 'Dieciseisavos de final' };
  const ROUND_SHORT = { 2: 'F', 4: 'SF', 8: 'CF', 16: 'OF', 32: 'DF' };

  /** Orden de siembra estándar: 1 vs último, etc. (size potencia de 2). */
  function seedOrder(size) {
    let order = [1, 2];
    while (order.length < size) {
      const total = order.length * 2 + 1;
      order = order.flatMap((seed) => [seed, total - seed]);
    }
    return order;
  }

  /**
   * Construye un cuadro flexible a partir de la clasificación y la
   * configuración provisional. Si los clasificados no son potencia de 2,
   * los mejores sembrados reciben pase directo (bye).
   */
  function buildBracket(standings, config = {}) {
    const n = Math.max(2, Math.min(config.qualifiedTeams || standings.length, standings.length));
    const totalRounds = Math.ceil(Math.log2(n));
    const size = 2 ** totalRounds;
    const order = seedOrder(size);
    const results = config.results || {};

    const seedSlot = (seed) => {
      if (seed > n) return { bye: true, seed, label: 'Pase directo' };
      const row = standings[seed - 1];
      return { seed, team: row.team, label: row.team.name };
    };

    const rounds = [];
    let previous = [];
    for (let r = 0; r < totalRounds; r++) {
      const teamsInRound = size / 2 ** r;
      const short = ROUND_SHORT[teamsInRound] || `R${r + 1}`;
      const prevShort = r > 0 ? (ROUND_SHORT[teamsInRound * 2] || `R${r}`) : '';
      const list = [];

      for (let i = 0; i < teamsInRound / 2; i++) {
        let a;
        let b;
        if (r === 0) {
          a = seedSlot(order[2 * i]);
          b = seedSlot(order[2 * i + 1]);
        } else {
          a = advance(previous[2 * i], prevShort, 2 * i + 1);
          b = advance(previous[2 * i + 1], prevShort, 2 * i + 2);
        }
        const id = `r${r + 1}-m${i + 1}`;
        const isBye = Boolean(a.bye || b.bye);
        const result = results[id] || null;
        list.push({ id, code: `${short}-${i + 1}`, a, b, isBye, result, winner: decideWinner(a, b, isBye, result) });
      }

      const decided = list.filter((m) => m.winner).length;
      const withResults = list.filter((m) => m.result).length;
      let status = 'locked';
      if (decided === list.length) status = 'done';
      else if (withResults > 0) status = 'active';
      else if (r === 0 && config.isProjection) status = 'projection';

      rounds.push({ index: r, key: `r${r + 1}`, name: ROUND_NAMES[teamsInRound] || `Ronda ${r + 1}`, teamsInRound, status, matches: list });
      previous = list;
    }

    return { qualified: n, size, byes: size - n, rounds };

    function advance(match, prevShort, index) {
      if (match.winner) return { ...match.winner, viaBye: match.isBye };
      return { placeholder: true, label: `Ganador ${prevShort}-${index}` };
    }
  }

  function decideWinner(a, b, isBye, result) {
    if (isBye) return a.bye ? (b.bye ? null : b) : a;
    if (result && a.team && b.team && result.a !== result.b) return result.a > result.b ? a : b;
    return null;
  }

  NS.core.matches = {
    STATUS_LABELS,
    filterMatches,
    sortByDate,
    recentResults,
    upcomingMatches,
    winnerId,
    summary,
    roundsOf,
    seedOrder,
    buildBracket
  };
})(window.UPSIN);
