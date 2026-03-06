# Routes Inventory (Current Implementation)

## Scan Basis
- Scope: `app/**/page.tsx`
- Verified Date: 2026-03-06
- Rule: only routed screens are documented

## Route Table
| Route Path | Page File | Main Purpose | Params / Query |
|---|---|---|---|
| `/` | `app/page.tsx` | Redirect entry to Teacher | none |
| `/teacher` | `app/teacher/page.tsx` | Teacher dashboard | none |
| `/teacher/sessions` | `app/teacher/sessions/page.tsx` | Session list, filters, status-specific actions | none |
| `/teacher/sessions/create` | `app/teacher/sessions/create/page.tsx` | Session create/edit flow | `type`, `sessionId` |
| `/teacher/sessions/[id]` | `app/teacher/sessions/[id]/page.tsx` | Session detail and runtime screen | Path: `id` |
| `/teacher/sessions/[id]/summary` | `app/teacher/sessions/[id]/summary/page.tsx` | Debate session summary after session end | Path: `id` |
| `/teacher/sessions/[id]/report` | `app/teacher/sessions/[id]/report/page.tsx` | Teacher debate report | Path: `id` |
| `/teacher/students` | `app/teacher/students/page.tsx` | Student list with search/filter | none |
| `/teacher/students/[id]` | `app/teacher/students/[id]/page.tsx` | Student evidence and writing workspace | Path: `id` |
| `/teacher/settings` | `app/teacher/settings/page.tsx` | Teacher settings UI for roster/stations | none |
| `/station` | `app/station/page.tsx` | Station entry, placement, waiting, live debate | none |
| `/station/report` | `app/station/report/page.tsx` | Station report or manage view | `round`, `phase`, `logs`, `names`, `sessionId`, `teacherGuided`, `sessionTitle`, `sessionStatus`, `groupCount`, `groupLayout`, `view`, `source` |

## Route Notes
- `/teacher/sessions/[id]` handles both Debate and Presentation sessions.
- `Ended Debate` does not stay on the detail screen. Accessing detail redirects to `/teacher/sessions/{id}/summary`.
- `Ended Presentation` stays inside the presentation flow and shows a report-style result in the detail page.
- Session list uses `/teacher/sessions/{id}/report` for all ended sessions. For Presentation sessions, that route is not a full presentation report page and currently falls back to the debate-report screen's "not found" style state.
- `/teacher/sessions/[id]/summary` is meaningful only for Debate sessions.
- `/station/report` has two modes:
  - `view=report`
  - `view=manage`
- `/station/report?source=station` forces report mode and hides the teacher-style top header.
