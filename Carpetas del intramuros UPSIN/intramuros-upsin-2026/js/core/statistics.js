/* ==========================================================================
   statistics.js — CÁLCULOS ESTADÍSTICOS DE JUGADORES (sin DOM)
   --------------------------------------------------------------------------
   Todo parte de PlayerGameStats (una fila por jugador y partido).
   - Porcentajes: solo si hay intentos; si no, null (la UI muestra "—").
   - Dobles-dobles y triples-dobles: se detectan PARTIDO A PARTIDO sobre
     PTS, REB, AST, STL y BLK, nunca sobre promedios.
   - Un triple-doble también cuenta como doble-doble (criterio habitual de
     las estadísticas profesionales). Cambiar COUNT_TRIPLE_AS_DOUBLE si el
     reglamento indica otra cosa.
   ========================================================================== */
window.UPSIN = window.UPSIN || {};

(function (NS) {
  'use strict';
  NS.core = NS.core || {};

  const STAT_CATEGORIES = ['pts', 'reb', 'ast', 'stl', 'blk'];
  const SUM_KEYS = ['min', 'pts', 'reb', 'ast', 'stl', 'blk', 'pf', 'fgm', 'fga', 'tpm', 'tpa', 'ftm', 'fta'];
  const AVERAGE_KEYS = ['min', 'pts', 'reb', 'ast', 'stl', 'blk', 'pf'];
  const COUNT_TRIPLE_AS_DOUBLE = true;

  /** Porcentaje de tiro: anotados / intentados × 100, o null sin intentos. */
  function shootingPct(made, attempted) {
    if (!attempted) return null;
    return (made / attempted) * 100;
  }

  function doubleDigitCategories(line) {
    return STAT_CATEGORIES.filter((key) => (line[key] || 0) >= 10).length;
  }

  function isTripleDouble(line) {
    return doubleDigitCategories(line) >= 3;
  }

  function isDoubleDouble(line) {
    const n = doubleDigitCategories(line);
    return COUNT_TRIPLE_AS_DOUBLE ? n >= 2 : n === 2;
  }

  /** Totales, promedios, porcentajes, DD y TD por jugador. */
  function aggregatePlayerStats(players, gameLines, teamsById) {
    const byPlayer = new Map(players.map((player) => {
      const base = { player, team: teamsById[player.teamId], gp: 0, dd: 0, td: 0 };
      SUM_KEYS.forEach((key) => { base[key] = 0; });
      return [player.id, base];
    }));

    gameLines.forEach((line) => {
      const acc = byPlayer.get(line.playerId);
      if (!acc) return;
      if ((line.min || 0) > 0) acc.gp += 1;
      SUM_KEYS.forEach((key) => { acc[key] += line[key] || 0; });
      if (isDoubleDouble(line)) acc.dd += 1;
      if (isTripleDouble(line)) acc.td += 1;
    });

    return [...byPlayer.values()].map((acc) => {
      const avg = {};
      AVERAGE_KEYS.forEach((key) => { avg[key] = acc.gp ? acc[key] / acc.gp : 0; });
      return {
        ...acc,
        avg,
        fgPct: shootingPct(acc.fgm, acc.fga),
        tpPct: shootingPct(acc.tpm, acc.tpa),
        ftPct: shootingPct(acc.ftm, acc.fta)
      };
    });
  }

  /** Valor de una estadística según el modo ('avg' = por partido, 'total'). */
  function statValue(row, key, mode) {
    if (mode === 'avg' && row.avg && key in row.avg) return row.avg[key];
    return row[key];
  }

  /**
   * Líderes de una categoría, calculados (nunca escritos a mano).
   * dd y td siempre se cuentan en totales.
   */
  function getLeaders(rows, key, { mode = 'avg', limit = 5 } = {}) {
    const effectiveMode = key === 'dd' || key === 'td' ? 'total' : mode;
    return rows
      .filter((row) => row.gp > 0 && statValue(row, key, effectiveMode) > 0)
      .sort((a, b) => statValue(b, key, effectiveMode) - statValue(a, key, effectiveMode)
        || b.pts - a.pts
        || a.player.name.localeCompare(b.player.name, 'es'))
      .slice(0, limit)
      .map((row) => ({ row, value: statValue(row, key, effectiveMode), mode: effectiveMode }));
  }

  NS.core.stats = {
    STAT_CATEGORIES,
    COUNT_TRIPLE_AS_DOUBLE,
    shootingPct,
    doubleDigitCategories,
    isDoubleDouble,
    isTripleDouble,
    aggregatePlayerStats,
    statValue,
    getLeaders
  };
})(window.UPSIN);
