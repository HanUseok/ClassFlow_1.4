# ClassFlow API Spec v1 (Current Implementation)

## Status
- Verified Date: 2026-03-06
- There is no backend HTTP API in the current codebase.
- Current data access is handled through application-layer functions, repositories, localStorage, and seeded mock data.

## 1. Current Implementation State

### No HTTP API
- No `fetch`/REST backend contract exists for sessions, students, reports, or stations.
- Current pages call local application services or read seeded data directly.

### Data Delivery Today
- Sessions:
  - application service: `lib/application/session-service.ts`
  - repository port: `lib/application/ports/session-repository.ts`
  - concrete persistence: localStorage-backed repository via `lib/infrastructure/session-repository.ts`
- Roster:
  - application service: `lib/application/roster-service.ts`
  - concrete repository: `lib/infrastructure/roster-repository.ts`
  - source data: seeded `mock-data`
- Featured evidence:
  - separate local store in `lib/featured-evidence-store.ts`
- Station report:
  - report payload is serialized into `/station/report` query params
  - this is a UI transport mechanism, not a stable HTTP API contract

### Current Product Notes
- `/teacher/sessions/{id}/report` is effectively debate-report oriented.
- Station report uses query-string transport for logs, names, session metadata, and view mode.
- Featured evidence persistence is separate from session persistence.

## 2. Current Internal Service Contracts

### Session Service
Current public functions in `lib/application/session-service.ts`:

- `configureSessionRepository(nextRepository)`
- `listSessions()`
- `getSession(sessionId)`
- `createSession(input)`
- `createDebateSession(input)`
- `createPresentationSession(input)`
- `startSession(sessionId)`
- `endSession(sessionId)`
- `startDebateSession(sessionId)`
- `finishDebateSession(sessionId, reportInput?)`
- `setSessionStatus(sessionId, status)`
- `updateSessionBasics(sessionId, input)`
- `overwriteSessionFromInput(sessionId, input)`
- `assignGroups(sessionId, groups)`
- `assignTeams(sessionId, teams)`
- `deleteSession(sessionId)`
- `deleteAllSessions()`
- `subscribeSessionChanges(listener)`
- `saveSpeech(history, log, limit)`
- `buildSessionReportPath(input)`
- `startParticipantSpeech(params)`
- `finishParticipantSpeech(params)`
- `completeStationDebate(params)`

### Roster Service
Current public functions in `lib/application/roster-service.ts`:

- `listClasses()`
- `listStudents()`
- `listStations()`
- `listDebateEvents()`

### Session Repository Port
Current persistence contract in `lib/application/ports/session-repository.ts`:

- `list()`
- `getById(sessionId)`
- `create(input)`
- `updateStatus(sessionId, status)`
- `updateTeams(sessionId, teams)`
- `updateDebateGroups(sessionId, groups)`
- `update(sessionId, input)`
- `replaceFromInput(sessionId, input)`
- `remove(sessionId)`
- `removeAll()`
- `subscribe(listener)`

### Derived Data Utilities
- `lib/application/teacher-insights.ts` is not a transport API.
- It provides derived calculations for:
  - participation stats
  - recommendation scoring
  - session/team summary
  - preparation status
  - record draft generation
  - record similarity

## 3. Current UI Transport Contracts

### Station Report Query Contract
`/station/report` currently receives serialized UI payload through query parameters:

- `round`
- `phase`
- `logs`
- `names`
- `sessionId`
- `teacherGuided`
- `sessionTitle`
- `sessionStatus`
- `groupCount`
- `groupLayout`
- `view`
- `source`

Notes:
- `logs` and `groupLayout` are JSON-serialized string payloads.
- `source=station` forces report mode and changes top-level navigation behavior.
- This should be treated as current UI plumbing, not a future-safe API shape.

## 4. Unimplemented HTTP API Proposals

The following are proposals only. They are not implemented in the current codebase.

### Minimal Session/Student Endpoints
- `GET /api/v1/sessions`
- `POST /api/v1/sessions`
- `GET /api/v1/sessions/{id}`
- `PATCH /api/v1/sessions/{id}`
- `POST /api/v1/sessions/{id}/status`
- `GET /api/v1/students`
- `GET /api/v1/students/{id}`

### Report Endpoints
- `GET /api/v1/sessions/{id}/report`
- optional: `GET /api/v1/sessions/{id}/summary`
- optional: `GET /api/v1/station-reports/{id}`

### Presentation Report Proposal
- If Presentation report becomes a server contract later, it is safer to expose it as either:
  - a computed response under the session resource, or
  - a separate report resource
- Example candidate:
  - `GET /api/v1/sessions/{id}/presentation-report`

## 5. API Notes
- This project currently has internal service contracts, not public HTTP API contracts.
- Any future HTTP API should be mapped from the current service-layer behavior first.
- Station report query serialization should not be treated as a stable long-term API.
