# Open Questions (Current Unresolved Decisions)

- Verified Date: 2026-03-06
- Purpose: decisions that are still unresolved in the current codebase

## 1. Auth / Role Gating
- Current state:
  - Teacher and Station are separated by route namespace only
  - there is no authentication or permission system
- Open question:
  - when and how should Teacher/Station access control be introduced?

## 2. Local Persistence to Server Migration
- Current state:
  - sessions use localStorage
  - featured evidence uses a separate localStorage store
- Open question:
  - when should these stores move to server-backed persistence, and should they migrate together or separately?

## 3. Runtime Recovery Scope
- Current state:
  - live debate and presentation runtime state is mostly in memory
  - refresh does not fully restore runtime state
- Open question:
  - what minimum recovery scope should be guaranteed later?
  - examples: current phase, current speaker, timer state, group-ended state

## 4. Station Report Transport
- Current state:
  - `/station/report` receives logs and metadata through query-string serialization
- Open question:
  - when should this move to saved report IDs or server-side lookup instead of URL payload transport?

## 5. Ended Presentation Navigation
- Current state:
  - ended Presentation detail can render an AI-loading state and a profile-report style result
  - session list ended action still routes to `/teacher/sessions/{id}/report`
- Open question:
  - should ended Presentation continue using the generic report route from the list, or should it reopen the presentation detail/report view directly?

## 6. Report Persistence Model
- Current state:
  - Teacher debate report mixes derived/generate-on-read behavior with session context
  - Presentation report is UI-derived
- Open question:
  - should reports remain computed views, or should they become persisted report entities?

## 7. Settings Persistence
- Current state:
  - roster CSV upload is UI-only
  - station role/delete actions are local UI state only
- Open question:
  - what parts of the settings screen should become real persistence flows first?

## 8. Seed Data Reset Policy
- Current state:
  - seeded roster/events/stations exist alongside mutable local session and featured-evidence overlays
- Open question:
  - what reset/restore policy should govern:
    - seed sessions
    - featured evidence defaults
    - debate events and demo examples

## 9. Featured Evidence Ownership
- Current state:
  - featured evidence is stored outside session records
  - it is effectively student-level local state
- Open question:
  - should featured evidence remain a separate student-level resource, or later become part of a report/evidence domain model?
