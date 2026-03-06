# UX I/O Spec (Current Implementation)

- Verified Date: 2026-03-06
- Scope: actual Teacher/Station UX only

## 1. Teacher Dashboard (`/teacher`)
### Input
- `Session[]`
- `Student[]`
- `DebateEvent[]`
- featured evidence map
- `DEADLINES[]`

### Output
- pending session summary/actions
- semester preparation counts
- watch-student lists
- recent class participation summary
- recent evidence digest
- recommended featured-evidence badges

## 2. Session Detail (`/teacher/sessions/[id]`)
### Input
- `Session`
- `DebateEvent[]`
- debate groups / assignment data

### Output
- pending debate setup/start UI
- live debate progress/manage UI
- ended debate redirect to summary
- presentation runtime and ended-report UI

## 3. Session Summary (`/teacher/sessions/[id]/summary`)
### Input
- debate session id
- debate events for the session
- students

### Output
- speech count summary
- active/silent students
- major claims
- concept tags
- team summaries
- participation summary

## 4. Teacher Session Report (`/teacher/sessions/[id]/report`)
### Input
- debate session id
- debate groups and members
- debate events

### Output
- team debate summary
- profile report view for session members
- note: report content currently mixes generated/fallback values with session context

## 5. Students List (`/teacher/students`)
### Input
- students
- classes
- sessions
- debate events
- featured evidence map

### Output
- filtered and sorted student cards
- evidence/featured-evidence status badges

## 6. Student Detail (`/teacher/students/[id]`)
### Input
- student id
- sessions
- debate events
- featured evidence map

### Output
- preparation status
- generated record draft
- keyword badges
- similarity warning
- featured evidence section
- competency-grouped evidence
- recent reported evidence

## 7. Presentation Detail (`/teacher/sessions/[id]`, presentation)
### Input
- presentation session
- presenter order
- seconds per presenter
- recording flags

### Output
- presenter preview
- timer runtime
- presenter progression controls
- AI-loading state after end
- profile report view
- note: session list ended-session navigation does not reopen this view directly; it routes to `/teacher/sessions/{id}/report`

## 8. Station (`/station`)
### Input
- active debate session
- selected student
- selected group
- placement state
- debate mode/runtime state

### Output
- landing/identity/group/waiting/live states
- ordered or free debate runtime
- participant-specific report redirect

## 9. Station Report (`/station/report`)
### Input
- query params for round/phase/logs/names/session metadata

### Output
- report table for ordered or free debate
- manage view when `view=manage`
- station-source variant without teacher-style top header
