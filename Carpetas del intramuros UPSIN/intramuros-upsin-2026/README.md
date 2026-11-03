# Intramuros UPSIN 2026 — Frontend

Interfaz web del **Torneo de Básquetbol Intramuros UPSIN 2026** (Universidad Politécnica de Sinaloa).
Solo frontend: HTML5, CSS3 y JavaScript vanilla, sin frameworks, sin build y sin dependencias.

> **Todos los datos son de demostración.** Equipos, jugadores, fechas, marcadores y estadísticas
> son ficticios y están marcados con etiquetas «DEMO» en la interfaz.

---

## Cómo ejecutarlo

**Opción 1 — doble clic:** abre `index.html` en Chrome, Edge, Firefox o Safari. Funciona sin servidor
(los scripts no usan módulos ES, a propósito, para que funcione desde `file://`).

**Opción 2 — servidor local (recomendado al integrar el backend):**

```bash
cd intramuros-upsin-2026
python -m http.server 8080      # o: npx serve .
# abrir http://localhost:8080
```

Las tipografías (Barlow / Barlow Condensed) se cargan desde Google Fonts; sin internet se usan
fuentes del sistema y todo sigue funcionando.

---

## Estructura

```
intramuros-upsin-2026/
├── index.html                  Estructura base: cabecera, menú, <main id="app">, pie
├── css/
│   ├── styles.css              Tokens de color, base, botones, tablas, tarjetas, formularios
│   ├── tournament.css          Banner del torneo, galería de equipos, bracket, líderes
│   └── responsive.css          Laptop, tablet (menú desplegable) y teléfono
├── js/
│   ├── data.js                 DATOS DEMO — fuente única (se elimina al conectar el API)
│   ├── services/
│   │   └── dataService.js      Capa de acceso a datos → PUNTO DE INTEGRACIÓN DEL BACKEND
│   ├── core/                   Cálculos puros (sin DOM)
│   │   ├── standings.js        Diferencia de puntos, tabla y ordenamiento
│   │   ├── statistics.js       Porcentajes, agregados, dobles/triples-dobles, líderes
│   │   └── matches.js          Filtros de partidos y cuadro eliminatorio flexible
│   ├── components/             Componentes visuales
│   │   ├── ui.js               Iconos SVG, emblemas, tabla de clasificación, tarjeta de partido
│   │   └── playerTable.js      Tabla de jugadores con orden, búsqueda y promedios/totales
│   ├── views/                  Una vista por sección + sus eventos
│   │   ├── home.js             Inicio
│   │   ├── tournament.js       Torneo Intramuros 2026 (banner + clasificación)
│   │   ├── matches.js          Partidos (calendario + fases eliminatorias)
│   │   ├── teams.js            Equipos (galería + detalle)
│   │   └── statistics.js       Estadísticas generales
│   └── app.js                  Arranque y enrutador
└── assets/
    ├── logos/                  Logotipos oficiales (UPSIN y equipos) cuando se entreguen
    ├── images/
    └── icons/
```

Se dividió `js/` en subcarpetas (en lugar de seis archivos sueltos) para separar con claridad
**datos → acceso a datos → cálculos → componentes → vistas**, como pide el punto 11.

No se usó Java: todas las interacciones del navegador están en JavaScript. Java tendría sentido
solo en el backend (por ejemplo, un API REST con Spring Boot), que corresponde al otro desarrollador.

---

## Navegación (SPA con rutas hash)

Las rutas son nombres planos (`#nombre`), así funcionan igual desde el archivo local, un servidor o
una página embebida.

| Ruta | Sección | Archivo |
|---|---|---|
| `#inicio` | Inicio (dashboard) | `js/views/home.js` |
| `#torneo` | Torneo Intramuros 2026 | `js/views/tournament.js` |
| `#clasificacion` | Torneo, desplazado a la tabla | `js/views/tournament.js` |
| `#partidos` | Partidos | `js/views/matches.js` |
| `#partidos-finalizados`, `#partidos-programados`, `#partidos-en-curso` | Partidos con filtro de estado | `js/views/matches.js` |
| `#partidos-equipo-03` | Partidos filtrados por equipo | `js/views/matches.js` |
| `#equipos` | Galería de equipos | `js/views/teams.js` |
| `#equipo-03` | Detalle de un equipo (la ruta es el `id` del equipo) | `js/views/teams.js` |
| `#estadisticas` | Estadísticas generales | `js/views/statistics.js` |

`app.js` escucha `hashchange`, resuelve la ruta, llama a `render()` y `mount()` de la vista,
marca el menú activo, actualiza el título y anuncia el cambio a lectores de pantalla.
Los `id` de equipo deben contener solo letras, números y guiones porque se usan en la ruta.

---|---|---|
| `#/inicio` | Inicio (dashboard) | `js/views/home.js` |
| `#/torneo` | Torneo Intramuros 2026 | `js/views/tournament.js` |
| `#/torneo/clasificacion` | Torneo, desplazado a la tabla | `js/views/tournament.js` |
| `#/partidos` | Partidos (acepta `?estado=finished\|scheduled\|live`, `?equipo=equipo-03`, `?jornada=4`) | `js/views/matches.js` |
| `#/equipos` | Galería de equipos | `js/views/teams.js` |
| `#/equipos/equipo-03` | Detalle de un equipo | `js/views/teams.js` |
| `#/estadisticas` | Estadísticas generales | `js/views/statistics.js` |

`app.js` escucha `hashchange`, resuelve la ruta, llama a `render()` y `mount()` de la vista,
marca el menú activo, actualiza el título y anuncia el cambio a lectores de pantalla.

---

## Integración con el backend

### 1. Qué reemplazar

Solo `js/services/dataService.js`. Cada función es `async` y hoy devuelve los datos de `data.js`.
Sustituye su cuerpo por un `fetch` (hay un ejemplo comentado en el archivo):

| Función | Endpoint sugerido | Devuelve |
|---|---|---|
| `getTournament()` | `GET /tournament` | `Tournament` |
| `getTeams()` | `GET /teams` | `Team[]` |
| `getPlayers()` | `GET /players` | `Player[]` |
| `getMatches()` | `GET /matches` | `Match[]` |
| `getPlayerGameStats()` | `GET /player-game-stats` | `PlayerGameStats[]` |
| `getPlayoffConfig()` | `GET /playoffs` | configuración del cuadro |

Después, quita `<script src="js/data.js">` de `index.html`. Ninguna vista cambia.

### 2. Estructuras de datos esperadas

```js
Tournament = { id, name, shortName, university, year, totalTeams, totalRounds, currentRound, status }

Team = {
  id: 'equipo-01',            // único; lo referencian Match y Player
  code: '01', name: 'Equipo 01',
  logoUrl: null,              // ruta o URL del logotipo; null → emblema provisional SVG
  color: '#8b5cf6', accent: '#d2c4ff'
}

Player = { id, teamId, name, number /* o null */, position }

Match = {
  id, round, homeTeamId, awayTeamId,
  date: 'YYYY-MM-DD', time: 'HH:MM', venue: null,   // cancha opcional
  status: 'scheduled' | 'live' | 'finished',
  homeScore: null | number, awayScore: null | number
}

// Una fila por jugador y por partido (necesario para detectar DD/TD correctamente)
PlayerGameStats = {
  id, matchId, playerId, teamId,
  min, pts, reb, ast, stl, blk, pf,
  fgm, fga,   // tiros de campo anotados / intentados (incluye triples)
  tpm, tpa,   // triples anotados / intentados
  ftm, fta    // tiros libres anotados / intentados
}

Playoffs = { qualifiedTeams: 10, isProjection: true, results: { 'r1-m2': { a: 61, b: 58 } } }
```

**Standings no viene del backend:** se calcula en el navegador con `computeStandings()` a partir
de los partidos finalizados. Si el backend prefiere enviarla calculada, basta con usarla en
`buildContext()` de `app.js`.

### 3. Funciones de cálculo disponibles

| Archivo | Función | Para qué |
|---|---|---|
| `core/standings.js` | `pointDiff(pf, pc)` | Diferencia de puntos |
| | `computeTeamRecords(teams, matches)` | PJ, PG, PP, PF, PC, DIF por equipo |
| | `sortStandings(rows)` / `computeStandings(...)` | Ordenar y asignar posición |
| `core/matches.js` | `filterMatches(matches, { round, teamId, status })` | Filtros del calendario |
| | `buildBracket(standings, playoffs)` | Cuadro eliminatorio flexible |
| `core/statistics.js` | `shootingPct(made, attempted)` | FG%, 3P%, FT% (null si no hay intentos) |
| | `isDoubleDouble(line)` / `isTripleDouble(line)` | Detección por partido |
| | `aggregatePlayerStats(players, lines, teamsById)` | Totales, promedios, %, DD, TD |
| | `getLeaders(rows, key, { mode, limit })` | Líderes calculados |

---

## Decisiones provisionales (fáciles de cambiar)

| Tema | Decisión actual | Dónde cambiarla |
|---|---|---|
| Desempate | 1) victorias, 2) diferencia de puntos, 3) puntos a favor. El orden alfabético final solo estabiliza la tabla en pantalla; no es una regla | `TIEBREAK_CRITERIA` en `core/standings.js` |
| Formato de eliminatorias | 10 clasificados en un cuadro de 16 con 6 pases directos. Con 8 empieza en cuartos; con 4, en semifinales | `playoffs.qualifiedTeams` en `data.js` / API |
| Triple-doble cuenta como doble-doble | Sí (criterio habitual en estadísticas profesionales) | `COUNT_TRIPLE_AS_DOUBLE` en `core/statistics.js` |
| Calendario | Todos contra todos a una vuelta: 9 jornadas × 5 partidos | Lo definirá el backend |
| Cancha | `null` → «Cancha por confirmar» | Campo `venue` de cada partido |
| Logotipos | Escudos SVG provisionales con el color y número del equipo | `logoUrl` de cada equipo |
| Logotipo UPSIN | Recuadro reservado en la cabecera | `.brand__logo-slot` en `index.html` |

## Accesibilidad y responsive

- Menú desplegable en tablet y teléfono (cierra con Esc), enlace «Saltar al contenido».
- Tablas con desplazamiento horizontal y columna de jugador fija en móvil.
- Banner del torneo: 10 paneles en una fila en escritorio y 2 filas de 5 en tablet/teléfono.
- `aria-sort` en columnas ordenables, `aria-current` en el menú, foco visible en todos los controles.
- Respeta `prefers-reduced-motion`.
