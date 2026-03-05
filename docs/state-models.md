# State Models (UX, 현재 구현 기준)

## Scan Basis
- Verified Date: 2026-03-05
- 핵심 파일:
  - `lib/mock-data.ts`
  - `lib/mock-session-store.ts`
  - `hooks/use-mock-sessions.ts`
  - `hooks/use-session-flow.ts`
  - `components/session/session-detail-page-content.tsx`
  - `app/station/page.tsx`

## 1) Session Status Model

### 상태 집합
- `Pending`
- `Live`
- `Ended`

### 생성 기본값
- 세션 생성 시 항상 `Pending`.

### 전이 트리거
| From | To | Trigger |
|---|---|---|
| `Pending` | `Live` | 세션 시작(Teacher 상세/Station) |
| `Live` | `Ended` | 세션 종료(Teacher/Station) |
| `Pending` | `Ended` | 코드상 setter 직접 호출 시 가능 |

### 상태 기반 라우팅
- `/teacher/sessions`에서 버튼 분기:
  - `Pending` -> `/teacher/sessions/create?sessionId=...`
  - `Live` -> `/teacher/sessions/{id}`
  - `Ended` -> `/teacher/sessions/{id}/report`

## 2) Debate Runtime State Model

### Debate Mode
- `Ordered` / `Free`
- `Ordered`: phase + speaker 순차 진행.
- `Free`: phase 완주 조건 없이 종료 가능.

### Ordered Phase State
- 순서: `Opening` -> `Rebuttal` -> `Rerebuttal` -> `FinalSummary`
- 종료 가능 조건: 마지막 phase, 마지막 speaker 종료 후 `finalSpeechCompleted = true`.

### Group Runtime Local State
- `phase`
- `currentSpeakerIndex`
- `isSpeechRunning`
- `finalSpeechCompleted`

저장 위치는 `useSessionFlow` 메모리 상태이며, 새로고침 시 복구되지 않음.

## 3) Session Creation Flow State Model

### Debate 생성 단계
- `setup`
- `headcount`
- `cards`

### 핵심 조건
- `cardsReady`: 활성 카드 중 제목+주장 입력 완료 카드 3개 이상.
- 생성 가능 조건:
  - Debate: `orderedFlowValid && cardsReady && hasEnoughSlots`
  - Presentation: `selectedCount > 0 && presentationMinutesPerStudent > 0`

### Teacher Guided 영향
- `guided`면 `group-1`의 진행자 1석은 교사 진행자로 고정 처리.

## 4) Station/Report View State

### Station
- `landing` -> `waiting` -> `live`
- `live` 종료 시 `/station/report?...&source=station`으로 이동.

### Station Report
- query: `view=report | manage`
- 단, `source=station`이면 `report` 강제.

## 5) Persistence Model
- 세션 목록/기본 정보: localStorage 저장.
- 토론 런타임(발언 인덱스, 실행 여부 등): 메모리 상태.
- Featured evidence는 별도 store를 통해 구독/반영.

## 6) Empty/Error States
- 세션 없음: 상세/스테이션에서 안내 메시지 표시.
- 학생 없음: `/teacher/students/[id]`에서 `notFound()`.
- 리포트 query JSON 파싱 실패: 빈 배열 fallback.
