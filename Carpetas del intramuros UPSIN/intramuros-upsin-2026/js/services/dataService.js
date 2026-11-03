/* ==========================================================================
   dataService.js — CAPA DE ACCESO A DATOS (punto de integración del backend)
   --------------------------------------------------------------------------
   Hoy devuelve copias de UPSIN.DEMO_DATA (datos locales de demostración).
   NO hay ninguna conexión de red ni se simula una.

   Todas las funciones son async a propósito: cuando exista el API REST solo
   cambia el cuerpo de cada función y el resto de la aplicación no se toca.

   Ejemplo de reemplazo (NO activo):
     const API_BASE = '/api/v1';
     async function getTeams() {
       const res = await fetch(`${API_BASE}/teams`);
       if (!res.ok) throw new Error('No se pudieron cargar los equipos');
       return res.json();
     }
   ========================================================================== */
window.UPSIN = window.UPSIN || {};

(function (NS) {
  'use strict';

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const local = () => {
    if (!NS.DEMO_DATA) throw new Error('No se encontraron los datos de demostración (js/data.js).');
    return NS.DEMO_DATA;
  };

  const dataService = {
    source: 'local-demo',

    /** GET /tournament → Tournament */
    async getTournament() { return clone(local().tournament); },
    /** GET /teams → Team[] */
    async getTeams() { return clone(local().teams); },
    /** GET /players → Player[] */
    async getPlayers() { return clone(local().players); },
    /** GET /matches → Match[] */
    async getMatches() { return clone(local().matches); },
    /** GET /player-game-stats → PlayerGameStats[] */
    async getPlayerGameStats() { return clone(local().playerGameStats); },
    /** GET /playoffs → configuración del cuadro eliminatorio */
    async getPlayoffConfig() { return clone(local().playoffs); },

    /** Carga todo lo que necesita la interfaz en una sola llamada. */
    async loadAll() {
      const [tournament, teams, players, matches, playerGameStats, playoffs] = await Promise.all([
        this.getTournament(),
        this.getTeams(),
        this.getPlayers(),
        this.getMatches(),
        this.getPlayerGameStats(),
        this.getPlayoffConfig()
      ]);
      return { tournament, teams, players, matches, playerGameStats, playoffs, source: this.source };
    }
  };

  NS.dataService = dataService;
})(window.UPSIN);
