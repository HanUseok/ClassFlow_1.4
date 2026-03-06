# Routes Inventory (App Router)

## Scan Basis
- Scope: `app/**/page.tsx`, `app/**/layout.tsx`
- Verified Date: 2026-03-06

## Route Table
| Route Path | Page File | Layout Chain | Main Purpose | Params / Query |
|---|---|---|---|---|
| `/` | `app/page.tsx` | `app/layout.tsx` | 진입 시 `/teacher`로 리다이렉트 | 없음 |
| `/teacher` | `app/teacher/page.tsx` | `app/layout.tsx` -> `app/teacher/layout.tsx` | 대시보드(세션/근거 준비 상태) | 없음 |
| `/teacher/sessions` | `app/teacher/sessions/page.tsx` | `app/layout.tsx` -> `app/teacher/layout.tsx` | 세션 목록/필터/상태별 진입 | 없음 |
| `/teacher/sessions/create` | `app/teacher/sessions/create/page.tsx` | `app/layout.tsx` -> `app/teacher/layout.tsx` | 세션 생성/수정 | `type`, `sessionId` |
| `/teacher/sessions/[id]` | `app/teacher/sessions/[id]/page.tsx` | `app/layout.tsx` -> `app/teacher/layout.tsx` | 세션 상세/진행 | Path: `id` |
| `/teacher/sessions/[id]/report` | `app/teacher/sessions/[id]/report/page.tsx` | `app/layout.tsx` -> `app/teacher/layout.tsx` | 교사용 세션 리포트 | Path: `id` |
| `/teacher/students` | `app/teacher/students/page.tsx` | `app/layout.tsx` -> `app/teacher/layout.tsx` | 학생 목록/검색/학급 필터 | 없음 |
| `/teacher/students/[id]` | `app/teacher/students/[id]/page.tsx` | `app/layout.tsx` -> `app/teacher/layout.tsx` | 학생 상세 워크스페이스 | Path: `id` |
| `/teacher/settings` | `app/teacher/settings/page.tsx` | `app/layout.tsx` -> `app/teacher/layout.tsx` | 명단/스테이션 설정 UI | 없음 |
| `/station` | `app/station/page.tsx` | `app/layout.tsx` -> `app/station/layout.tsx` | 스테이션 입장/배치/라이브 토론 | 없음 |
| `/station/report` | `app/station/report/page.tsx` | `app/layout.tsx` -> `app/station/layout.tsx` | 토론 리포트(report/manage) | `round`, `phase`, `logs`, `names`, `sessionId`, `teacherGuided`, `sessionTitle`, `sessionStatus`, `groupCount`, `groupLayout`, `view`, `source` |

## Layout Mapping
- Root layout: `app/layout.tsx`
- Teacher layout: `app/teacher/layout.tsx` (`TeacherNav` + main container)
- Station layout: `app/station/layout.tsx` (중앙 정렬 컨테이너)

## Notes
- 인증/인가 로직은 현재 구현되어 있지 않음.
- Teacher/Station 분기는 URL 네임스페이스로 처리.
