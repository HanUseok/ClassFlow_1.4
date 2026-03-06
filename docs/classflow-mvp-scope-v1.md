# ClassFlow MVP Scope (Current Implementation)

## Basis
- Verified Date: 2026-03-06
- Data base: `mock-data` + localStorage-backed session store

## Included Scope
### Teacher
- dashboard
- pending session continuation/end
- semester preparation, watch students, participation insight, recent evidence
- session list
- debate/presentation create and edit
- debate detail runtime
- teacher-guided progress/manage split
- session summary for debate
- teacher debate report
- student list
- student detail writing-first workspace
- settings tabs for roster and stations

### Presentation
- pending/live/ended presentation flow inside session detail
- presenter timer
- presenter progression
- ended profile-report style result
- session list ended-state navigation currently reuses the generic report route

### Station
- `landing -> identity -> group -> waiting -> live`
- free debate speech-type selection
- station report and manage modes

## Current Constraints
- no auth/permission system
- no backend DB/API
- live debate runtime is not fully durable across refresh
- teacher debate report still contains generated/fallback presentation rather than a fully persisted report model
