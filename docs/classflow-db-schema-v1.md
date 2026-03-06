# ClassFlow Storage / DB Schema v1 (Current Implementation)

## Status
- Verified Date: 2026-03-06
- The current project does not use a database.
- The current persistence model is a mix of:
  - seeded mock data
  - localStorage overlays
  - in-memory runtime state

## 1. Current Persistent Storage

### localStorage Keys
- `classflow.mock.sessions.v1`
  - stores mutable `Session[]`
- `classflow.representative.v1`
  - stores featured-evidence selections as `Record<studentId, eventId[]>`

### Seeded Read-Only Data
Seed data is currently served from `mock-data` and related repository wrappers:

- classes
- students
- stations
- debate events
- seed sessions used as initial session baseline

### Current Persistence Shape
- Sessions are mutable through localStorage.
- Featured evidence is mutable through a separate localStorage store.
- Roster data and debate events are currently seeded/mock source data, not mutable DB-backed rows.

## 2. Current Data Model

### Session
- `id`
- `type`: `Debate | Presentation`
- `status`: `Pending | Live | Ended`
- `classId`
- `className`
- `title`
- `topic`
- `date`
- `teams` (optional)
- `debate` (optional)
- `presentation` (optional)

### Debate
- `mode`: `Ordered | Free`
- `teacherGuided`
- `orderedFlow.stages[]`
- `membersPerGroup`
- `moderators[]`
- `groups[]`
- `assignmentConfig`
  - `groupCount`
  - `affirmativeSlots`
  - `negativeSlots`
  - `moderatorSlots`
  - `selectedStudentIds`
  - `recordingStudentIds`
  - `groupAssignments`
  - `groupSlotAdjust`

### Presentation
- `presenters[]`
- `secondsPerPresenter`

### Featured Evidence Map
- keyed by `studentId`
- value is `eventId[]`

### Seed Debate Events
- current event source for dashboard/student/report-derived logic
- not currently stored as mutable rows in localStorage

## 3. Non-Persistent Runtime State

### Debate Runtime
In-memory runtime state includes values such as:

- `phase`
- `currentSpeakerIndex`
- `isSpeechRunning`
- `finalSpeechCompleted`
- teacher view mode
- group-ended UI state

### Station Runtime
- entry flow state:
  - `landing`
  - `identity`
  - `group`
  - `waiting`
  - `live`
- participant speech state
- temporary placement state

### Presentation Runtime
- `currentIndex`
- `timeLeft`
- `isRunning`
- `readyForNext`
- `showAiLoading`

## 4. Current Model Notes
- Debate events are currently a seed/mock source, not a mutable event table.
- Teacher report is not backed by a fully persisted report entity.
- Presentation report rows are derived/generated in UI logic, not stored persistently.
- Featured evidence is persisted separately from sessions, not embedded in the session store.

## 5. Future DB Proposals

The following are future proposals only. They are not implemented today.

### Minimum Practical Tables
- `sessions`
- `classes`
- `students`
- `debate_events`
- `featured_evidence`

### Optional Future Tables
- `session_debate_config`
- `session_debate_groups`
- `session_presentation_config`
- `session_reports`
- `session_report_rows`

### Presentation Report Storage
- Presentation report rows should be treated as optional future persistence.
- Safer rollout path:
  - start as computed response
  - promote to stored rows only if editing/export/history requires it

## 6. Storage Notes
- This document describes the current storage model more accurately than a true DB schema.
- Any future DB should separate:
  - immutable seed/demo data
  - mutable runtime/session data
  - derived report/insight data
