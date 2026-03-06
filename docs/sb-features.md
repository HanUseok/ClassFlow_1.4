# SB Features (Current Implementation)

- Verified Date: 2026-03-06
- Scope: current routed Teacher/Station product behavior only

## A. Teacher Dashboard (`/teacher`)
- Session engine card
  - shows pending session continuation when a pending session exists
  - shows `세션 종료하기` for the first pending session
  - otherwise shows `새 세션 생성`
- Deadline cards from `DEADLINES`
- Semester preparation card
  - evidence-holding students
  - students without evidence
  - students with featured evidence
- Watch students card
  - `근거 없음`
  - `대표 사례 없음`
- Recent class participation card
  - based on the most recent Debate session events
  - falls back to all debate events if the recent debate has no events
- Recent evidence section
  - recent evidence digest
  - `오늘 바로 쓸 수 있는 근거 3개`
  - evidence cards can show `⭐ 대표 사례 추천`

## B. Session List (`/teacher/sessions`)
- Filter by type/status
- Search by title/topic text
- Status-specific action labels
  - pending: `확인/수정`
  - live: `세션 진입`
  - ended: `레포트 확인`
- Ended Debate has an additional `수업 요약` action
- Per-session delete and bulk delete

## C. Session Create/Edit (`/teacher/sessions/create`)
- Shared create/edit entry for Debate and Presentation
- Debate flow supports:
  - Ordered / Free mode
  - teacher-guided toggle
  - student selection
  - group count / slot settings
  - argument card and recording-related setup
- Presentation flow supports:
  - presenter order
  - seconds per presenter
  - per-presenter recording flag

## D. Debate Session Detail (`/teacher/sessions/[id]`)
- Pending Debate
  - waiting/setup state
  - desk placement UI for teacher-guided flow
  - `세션 설정으로 가기`
  - `세션 시작`
- Live Debate
  - teacher-guided flow exposes `진행 화면 / 관리 화면`
  - top-level session action only shows `세션 종료`
- Progress view
  - teacher-guided live debate only
  - ordered/free runtime screen
  - free debate speech-type selection is available
  - runtime completion button is `조 토론 종료`
- Manage view
  - observation-focused participation panel
  - group cards
  - group cards do not list per-student speech counts
  - group cards expose group-level runtime controls and adjustment entry
- Ended Debate
  - detail screen is not kept
  - access redirects to Session Summary

## E. Presentation Session Detail (`/teacher/sessions/[id]`)
- Pending Presentation
  - first presenter preview
  - presenter duration
  - `발표 시작하기`
- Live Presentation
  - current presenter
  - recording/non-recording badge
  - timer
  - `발표하기` / `발표 끝내기`
  - `다음 발표자` or final `세션 종료`
  - order movement buttons `<` and `>`
- Ended Presentation
  - temporary AI-loading state
  - then `ProfileReportView`
  - note: session list does not reopen this ended state directly; the ended-session action currently goes to `/teacher/sessions/{id}/report`

## F. Session Summary (`/teacher/sessions/[id]/summary`)
- Debate-only summary page
- Entry points
  - immediately after Teacher `세션 종료`
  - automatic redirect on ended debate detail access
- Content
  - total speech count
  - active students
  - silent students
  - major claims
  - concept tags
  - team summaries
  - participation summary
- CTA
  - `세션 레포트 보기`

## G. Teacher Report (`/teacher/sessions/[id]/report`)
- Teacher debate report page
- Top section: `Team Debate Summary`
- Main body: `ProfileReportView`
- Current implementation mixes generated/fallback content with session-derived context

## H. Student List (`/teacher/students`)
- Search by student name
- Filter by class
- Student cards are sorted by `priorityScore`
- Cards can show:
  - `근거 없음`
  - `대표 사례 없음`

## I. Student Detail (`/teacher/students/[id]`)
- Writing-first layout
- Order
  - preparation status
  - writing mode
  - featured evidence
  - competency-grouped evidence
  - recent reported evidence
  - full record list
- Preparation status uses:
  - `ready`
  - `needs_featured`
  - `insufficient`
- Writing mode includes
  - generated student-record paragraph
  - keyword badges
  - similarity warning
  - selected evidence
  - template sentence examples
- Evidence cards can show recommendation badges

## J. Settings (`/teacher/settings`)
- Two tabs
  - roster
  - stations
- Roster tab
  - class list
  - student rows by class
  - CSV upload button UI
- Stations tab
  - station list
  - role selector
  - delete action

## K. Station (`/station`)
- Entry states
  - landing
  - identity
  - group
  - waiting
  - live
- Waiting state includes self-placement desk UI
- Live debate supports:
  - ordered debate flow
  - free debate flow
  - free debate speech-type selection
  - recording/non-recording constraints for participants

## L. Station Report (`/station/report`)
- Query-driven report page
- Two modes
  - `view=report`
  - `view=manage`
- `source=station` forces report mode and removes teacher-style top navigation
- Ordered and Free debate render different report tables
- Manage mode uses `ReportManageView`
