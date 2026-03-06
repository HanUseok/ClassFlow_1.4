# ClassFlow DB Schema v1 (현행 구현 기준)

## 상태
- Verified Date: 2026-03-06
- 현재 프로젝트는 DB를 사용하지 않고 `localStorage`를 사용
- 이 문서는 현행 저장 구조와 향후 DB 전환 시 기준 모델을 함께 정리함

## 1) 현행 저장소
- 키: `classflow.mock.sessions.v1`
- 저장 단위: `Session[]` JSON
- 저장 위치: 브라우저 `localStorage`

## 2) 현행 핵심 데이터 모델

### Session
- `id`
- `type`: `Debate | Presentation`
- `status`: `Pending | Live | Ended`
- `classId`, `className`
- `title`, `topic`, `date`
- `teams` (optional)
- `debate` (optional)
- `presentation` (optional)

### Debate Config
- `mode`: `Ordered | Free`
- `teacherGuided`
- `orderedFlow.stages[]`
- `groups[]`
- `assignmentConfig`:
- `groupCount`, `affirmativeSlots`, `negativeSlots`, `moderatorSlots`
- `selectedStudentIds`, `recordingStudentIds`
- `groupAssignments`, `groupSlotAdjust`

### Presentation Config
- `presenters[]`
- `secondsPerPresenter`

## 3) 비영속 런타임 상태
- `useSessionFlow` 내부 상태 (`phase`, `currentSpeakerIndex`, `isSpeechRunning`, `finalSpeechCompleted`)
- 스테이션 입장 상태 (`landing/identity/group/waiting/live`)

## 4) 향후 RDB 전환 최소 테이블 제안
- `sessions`
- `session_debate_config`
- `session_debate_groups`
- `session_presentation_config`
- `students`
- `classes`
- `debate_events`

## 5) 비고
- 본 문서의 RDB 스키마 항목은 제안이며 현재 코드에는 미구현
- 서버 전환 시 우선순위는 `sessions` + `debate_events` 권장
