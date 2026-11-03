/* ==========================================================================
   data.js — FUENTE ÚNICA DE DATOS DE DEMOSTRACIÓN
   --------------------------------------------------------------------------
   TODO lo que hay en este archivo es FICTICIO: identificadores de equipos,
   jugadores, fechas, horarios, marcadores y estadísticas. Existe solo para
   que la interfaz funcione mientras el backend no está listo.

   Entidades expuestas en UPSIN.DEMO_DATA (misma forma que se espera del API):
     tournament        → Tournament
     teams[]           → Team
     players[]         → Player         (player.teamId → team.id)
     matches[]         → Match          (homeTeamId / awayTeamId → team.id)
     playerGameStats[] → PlayerGameStats (una fila por jugador y partido:
                                          playerId → player.id, matchId → match.id)
     playoffs          → configuración PROVISIONAL del cuadro eliminatorio

   La clasificación (Standings) NO se almacena: se calcula a partir de los
   partidos en js/core/standings.js, para que nunca existan dos versiones.

   Partidos y estadísticas se generan con un generador pseudoaleatorio de
   semilla fija, así la demo es idéntica en cada carga y los marcadores
   siempre coinciden con la suma de puntos de los jugadores.

   Al integrar el backend este archivo se elimina y
   js/services/dataService.js pasa a leer del API.
   ========================================================================== */
window.UPSIN = window.UPSIN || {};

(function (NS) {
  'use strict';

  const pad = (n) => String(n).padStart(2, '0');

  /* ---------- Generador pseudoaleatorio con semilla (solo demo) ---------- */
  function createRandom(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = createRandom(2026);
  const binomial = (n, p) => { let k = 0; for (let i = 0; i < n; i++) if (rand() < p) k++; return k; };
  const around = (mean, spread) => Math.max(0, Math.round(mean * (1 - spread + rand() * spread * 2)));

  /* ============================== TOURNAMENT ============================== */
  const tournament = {
    id: 'intramuros-upsin-2026',
    name: 'Torneo de Básquetbol Intramuros UPSIN 2026',
    shortName: 'Intramuros UPSIN 2026',
    university: 'Universidad Politécnica de Sinaloa',
    year: 2026,
    totalTeams: 10,                       // dato confirmado por la organización
    totalRounds: 9,                       // DEMO: todos contra todos a una vuelta
    currentRound: 6,                      // DEMO
    status: 'Fase regular en curso',      // DEMO
    isDemo: true
  };

  /* ================================ TEAMS ================================ */
  // Nombres y logotipos oficiales pendientes: se usan identificadores provisionales.
  // Para cargar un logotipo real basta con poner su ruta en logoUrl
  // (por ejemplo 'assets/logos/equipo-01.png').
  const TEAM_PALETTE = [
    { color: '#8b5cf6', accent: '#d2c4ff' },
    { color: '#e0a526', accent: '#ffe7a3' },
    { color: '#f0526b', accent: '#ffc2cc' },
    { color: '#3b6fe0', accent: '#b9cdff' },
    { color: '#f47b20', accent: '#ffd0a8' },
    { color: '#1fb5d6', accent: '#b5f0ff' },
    { color: '#8ac43f', accent: '#dcf5b8' },
    { color: '#d946a8', accent: '#ffc1e9' },
    { color: '#14b8a6', accent: '#b3f5ec' },
    { color: '#22a35a', accent: '#bdf0d0' }
  ];

  const teams = TEAM_PALETTE.map((p, i) => ({
    id: `equipo-${pad(i + 1)}`,
    code: pad(i + 1),
    name: `Equipo ${pad(i + 1)}`,
    logoUrl: null,
    color: p.color,
    accent: p.accent,
    isPlaceholder: true
  }));

  /* =============================== PLAYERS =============================== */
  const FIRST_NAMES = ['Alan', 'Bruno', 'Carlos', 'Diego', 'Emilio', 'Fernando', 'Gael', 'Héctor', 'Iván', 'Jorge',
    'Kevin', 'Luis', 'Mario', 'Néstor', 'Óscar', 'Pablo', 'Raúl', 'Sergio', 'Tomás', 'Uriel',
    'Víctor', 'Axel', 'Yahir', 'Zahid', 'Adrián', 'Benjamín', 'César', 'Daniel', 'Eduardo', 'Francisco'];
  const LAST_NAMES = ['Aguilar', 'Beltrán', 'Castro', 'Delgado', 'Escobar', 'Félix', 'García', 'Ibarra', 'Juárez',
    'Lizárraga', 'Medina', 'Núñez', 'Osuna', 'Peraza', 'Quintero', 'Rendón', 'Sánchez', 'Tirado', 'Urías',
    'Valdez', 'Zamudio', 'Arellano', 'Bojórquez', 'Camacho', 'Durán'];
  const JERSEY_POOL = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23, 24, 30, 32, 33, 34, 44, 55];

  const ROSTER_TEMPLATE = [
    { position: 'Base', role: 'playmaker' },
    { position: 'Escolta', role: 'scorer' },
    { position: 'Alero', role: 'wing' },
    { position: 'Ala-pívot', role: 'big' },
    { position: 'Pívot', role: 'big' },
    { position: 'Base', role: 'bench' },
    { position: 'Alero', role: 'bench' },
    { position: 'Pívot', role: 'bench' }
  ];
  const ALL_ROUND_TEAMS = ['equipo-03', 'equipo-07']; // su alero será un perfil "todoterreno"

  const players = [];
  teams.forEach((team, t) => {
    const jerseys = [...JERSEY_POOL].sort(() => rand() - 0.5).slice(0, ROSTER_TEMPLATE.length);
    ROSTER_TEMPLATE.forEach((slot, p) => {
      const k = t * ROSTER_TEMPLATE.length + p;
      const role = slot.role === 'wing' && ALL_ROUND_TEAMS.includes(team.id) ? 'allround' : slot.role;
      players.push({
        id: `${team.id}-j${pad(p + 1)}`,
        teamId: team.id,
        name: `${FIRST_NAMES[(k * 7) % FIRST_NAMES.length]} ${LAST_NAMES[(k * 13) % LAST_NAMES.length]}`,
        number: jerseys[p],
        position: slot.position,
        role,               // solo lo usa el generador de la demo
        isDemo: true
      });
    });
  });

  /* =============================== MATCHES =============================== */
  // Calendario DEMO: todos contra todos (método del círculo), 9 jornadas × 5 partidos.
  const ROUND_DATES = ['2026-09-21', '2026-09-28', '2026-10-05', '2026-10-12', '2026-10-19',
    '2026-10-26', '2026-11-02', '2026-11-09', '2026-11-16'];
  const SLOT_TIMES = ['12:00', '13:00', '14:00', '16:00', '17:00'];

  function roundRobin(ids) {
    const arr = [...ids];
    const n = arr.length;
    const rounds = [];
    for (let r = 0; r < n - 1; r++) {
      const pairs = [];
      for (let i = 0; i < n / 2; i++) {
        let a = arr[i];
        let b = arr[n - 1 - i];
        if (r % 2 === 1 && i === 0) [a, b] = [b, a];
        pairs.push([a, b]);
      }
      rounds.push(pairs);
      arr.splice(1, 0, arr.pop());
    }
    return rounds;
  }

  // Estado DEMO: jornadas 1-5 finalizadas; jornada 6 a medias; 7-9 programadas.
  function demoStatus(round, slot) {
    if (round < tournament.currentRound) return 'finished';
    if (round > tournament.currentRound) return 'scheduled';
    if (slot < 2) return 'finished';
    if (slot === 2) return 'live';
    return 'scheduled';
  }

  /* --------- Generador de estadísticas individuales (solo demo) --------- */
  const TEAM_STRENGTH = Object.fromEntries(teams.map((t) => [t.id, 0.86 + rand() * 0.28]));
  const ROLE_PROFILES = {
    scorer:    { fga: 16, threeRate: 0.40, fg2: 0.50, fg3: 0.36, fta: 5, ft: 0.78, reb: 5.0, ast: 3.0, stl: 1.4, blk: 0.3 },
    playmaker: { fga: 11, threeRate: 0.35, fg2: 0.46, fg3: 0.34, fta: 3, ft: 0.75, reb: 4.0, ast: 7.5, stl: 1.8, blk: 0.2 },
    wing:      { fga: 10, threeRate: 0.38, fg2: 0.47, fg3: 0.33, fta: 3, ft: 0.72, reb: 5.5, ast: 2.5, stl: 1.2, blk: 0.4 },
    allround:  { fga: 13, threeRate: 0.25, fg2: 0.52, fg3: 0.32, fta: 4, ft: 0.70, reb: 10.5, ast: 9.0, stl: 1.5, blk: 0.8 },
    big:       { fga: 10, threeRate: 0.05, fg2: 0.55, fg3: 0.25, fta: 4, ft: 0.60, reb: 10.0, ast: 1.5, stl: 0.7, blk: 1.8 },
    bench:     { fga: 6,  threeRate: 0.30, fg2: 0.44, fg3: 0.30, fta: 2, ft: 0.68, reb: 3.0, ast: 1.5, stl: 0.6, blk: 0.3 }
  };
  const BASE_MINUTES = [30, 30, 29, 28, 27, 20, 19, 17]; // 200 minutos = 5 jugadores × 40 min

  function generateTeamLine(match, teamId) {
    const roster = players.filter((p) => p.teamId === teamId);
    const strength = TEAM_STRENGTH[teamId];
    let mins = BASE_MINUTES.map((m) => Math.max(8, m + Math.round((rand() - 0.5) * 8)));
    const total = mins.reduce((a, b) => a + b, 0);
    mins = mins.map((m) => Math.round((m * 200) / total));
    mins[0] += 200 - mins.reduce((a, b) => a + b, 0);

    return roster.map((pl, i) => {
      const prof = ROLE_PROFILES[pl.role];
      const f = mins[i] / 30;
      const fga = around(prof.fga * f, 0.35);
      const tpa = Math.round(fga * prof.threeRate);
      const twoA = fga - tpa;
      const twoM = binomial(twoA, Math.min(0.75, prof.fg2 * strength));
      const tpm = binomial(tpa, Math.min(0.6, prof.fg3 * strength));
      const fta = around(prof.fta * f, 0.6);
      const ftm = binomial(fta, prof.ft);
      return {
        id: `${match.id}-${pl.id}`,
        matchId: match.id,
        playerId: pl.id,
        teamId,
        min: mins[i],
        pts: twoM * 2 + tpm * 3 + ftm,
        reb: around(prof.reb * f, 0.45),
        ast: around(prof.ast * f, 0.5),
        stl: around(prof.stl * f, 0.9),
        blk: around(prof.blk * f, 0.9),
        pf: Math.min(5, around(2.2 * f, 0.8)),
        fgm: twoM + tpm,
        fga,
        tpm,
        tpa,
        ftm,
        fta
      };
    });
  }

  const sumPts = (lines) => lines.reduce((acc, l) => acc + l.pts, 0);

  const matches = [];
  const playerGameStats = [];

  roundRobin(teams.map((t) => t.id)).forEach((pairs, r) => {
    const round = r + 1;
    pairs.forEach(([homeTeamId, awayTeamId], slot) => {
      const match = {
        id: `J${pad(round)}-P${slot + 1}`,
        round,
        homeTeamId,
        awayTeamId,
        date: ROUND_DATES[r],
        time: SLOT_TIMES[slot],
        venue: null,                // cancha: pendiente de definir
        status: demoStatus(round, slot),
        homeScore: null,
        awayScore: null,
        isDemoSchedule: true
      };

      if (match.status === 'finished') {
        const home = generateTeamLine(match, homeTeamId);
        const away = generateTeamLine(match, awayTeamId);
        // En básquetbol no hay empates: se simula la prórroga con una canasta extra.
        if (sumPts(home) === sumPts(away)) {
          const side = rand() < 0.5 ? home : away;
          const star = side.reduce((best, l) => (l.fga > best.fga ? l : best));
          star.fga += 1; star.fgm += 1; star.pts += 2;
        }
        match.homeScore = sumPts(home);
        match.awayScore = sumPts(away);
        playerGameStats.push(...home, ...away);
      }
      matches.push(match);
    });
  });

  /* ============================== PLAYOFFS ============================== */
  // Formato PROVISIONAL hasta conocer el reglamento oficial.
  //   qualifiedTeams: cuántos equipos avanzan a eliminatorias. Con 10 se arma un
  //     cuadro de 16 con pases directos (byes) para los mejores sembrados.
  //     Con 8 empezaría en cuartos; con 4, en semifinales.
  //   results: marcadores por cruce, p. ej. { 'r1-m2': { a: 61, b: 58 } }.
  const playoffs = {
    qualifiedTeams: 10,
    seeding: 'standings',
    isProjection: true,
    results: {}
  };

  NS.DEMO_DATA = { tournament, teams, players, matches, playerGameStats, playoffs };
})(window.UPSIN);
