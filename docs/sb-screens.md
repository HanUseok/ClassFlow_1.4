# Screen Definitions (Current Implementation)

- Verified Date: 2026-03-06
- Basis: routed screens only

## `/teacher`
- Purpose: Teacher dashboard
- Section order
  - session engine
  - deadline cards
  - semester preparation status
  - watch students
  - recent class participation
  - recent evidence
- Primary actions
  - continue pending session
  - end pending session
  - create debate session
  - go to session list
  - open student detail

## `/teacher/sessions`
- Purpose: session inventory
- UI
  - type filter
  - status filter
  - search field
  - session cards
  - create buttons
- Status-specific actions
  - pending -> create/edit route
  - live -> detail route
  - ended -> report route
  - ended debate -> summary route
  - ended presentation still uses the generic ended-session report route

## `/teacher/sessions/create`
- Purpose: shared create/edit flow
- Main UI
  - debate path and presentation path
  - existing session edit mode via `sessionId`
  - creation/update completion back to session list

## `/teacher/sessions/[id]`
- Purpose: session detail and runtime
- Debate states
  - Pending: setup/placement/start UI
  - Live: progress view or manage view
  - Ended: redirect to summary
- Presentation states
  - Pending: first presenter preview and start
  - Live: timer and presenter controls
  - Ended: AI-loading screen then presentation report view
  - note: this ended presentation view is visible on the detail route itself, but the session list's ended action currently points to `/report`

## `/teacher/sessions/[id]/summary`
- Purpose: debate summary page after session end
- Main UI
  - lesson summary KPIs
  - major claims
  - concept tags
  - team summaries
  - participation summary
  - `세션 레포트 보기`

## `/teacher/sessions/[id]/report`
- Purpose: teacher debate report
- Main UI
  - teacher report header
  - `Team Debate Summary`
  - student profile report list

## `/teacher/students`
- Purpose: student list
- Main UI
  - search
  - class filter
  - student cards
- Card state indicators
  - no evidence
  - no featured evidence

## `/teacher/students/[id]`
- Purpose: student evidence workspace
- Screen order
  - preparation status
  - writing mode
  - featured evidence
  - competency-grouped evidence
  - recent reported evidence
  - full record list
- Writing mode content
  - generated paragraph
  - keywords
  - similarity warning
  - selected evidence
  - template sentences

## `/teacher/settings`
- Purpose: roster/station settings UI
- Tabs
  - roster
  - stations
- Roster tab
  - classes and students
  - CSV upload button UI
- Stations tab
  - station cards
  - role selector
  - delete button

## `/station`
- Purpose: station-side debate participation
- State screens
  - landing
  - identity
  - group
  - waiting
  - live
- Live behavior
  - free debate speech-type selector
  - ordered debate or quick-add flow depending on mode/role

## `/station/report`
- Purpose: station report/manage page
- Report mode
  - ordered debate table or free debate table
  - optional station return button
- Manage mode
  - manage-specific runtime controls via `ReportManageView`
- Header behavior
  - shown when not opened from `source=station`
  - hidden when opened from `source=station`
