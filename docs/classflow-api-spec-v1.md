# ClassFlow API Spec v1 (현행 구현 기준)

## 상태
- Verified Date: 2026-03-06
- 현재 프로젝트는 Next.js 클라이언트 앱이며 백엔드 API가 구현되어 있지 않음
- 이 문서는 현재 내부 서비스 계약과 향후 HTTP API 전환 기준을 함께 정의함

## 1) 현재 구현된 내부 서비스 계약 (Application Layer)

### Session Service (`lib/application/session-service.ts`)
- `listSessions()`
- `getSession(sessionId)`
- `createSession(input)`
- `startSession(sessionId)`
- `endSession(sessionId)`
- `setSessionStatus(sessionId, status)`
- `updateSessionBasics(sessionId, input)`
- `overwriteSessionFromInput(sessionId, input)`
- `assignGroups(sessionId, groups)`
- `assignTeams(sessionId, teams)`
- `deleteSession(sessionId)`
- `deleteAllSessions()`
- `subscribeSessionChanges(listener)`
- `completeStationDebate(params)`

### Roster Service (`lib/application/roster-service.ts`)
- `listClasses()`
- `listStudents()`
- `listStations()`
- `listDebateEvents()`

## 2) 현재 데이터 전달 방식
- Session/Student/Station 데이터: `mock-data` + `localStorage`
- 리포트: `/station/report` query string 직렬화 방식

## 3) 향후 HTTP API 전환 시 최소 엔드포인트 제안
- `GET /api/v1/sessions`
- `POST /api/v1/sessions`
- `PATCH /api/v1/sessions/{id}`
- `POST /api/v1/sessions/{id}/status`
- `GET /api/v1/students`
- `GET /api/v1/students/{id}`
- `GET /api/v1/sessions/{id}/report`

## 4) 비고
- 위 HTTP 엔드포인트는 제안 단계이며 현재 코드에는 미구현
- 실제 도입 시 현재 service 함수 시그니처를 우선 호환 대상으로 삼는 것을 권장
