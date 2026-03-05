# ClassFlow 상태 전이 정의 (코드 기준 v2)

## 기준
- Verified Date: 2026-03-05
- 실제 구현 파일: `lib/mock-data.ts`, `hooks/use-session-flow.ts`, `lib/domain/session/index.ts`, `app/station/page.tsx`, `components/session/session-detail-page-content.tsx`

## 1) Session 상태 전이

### 상태 집합
- `Pending`
- `Live`
- `Ended`

### 전이
| 현재 | 이벤트 | 다음 | 비고 |
|---|---|---|---|
| 생성 | 세션 생성 | `Pending` | 기본값 |
| `Pending` | 세션 시작 | `Live` | Teacher/Station에서 시작 가능 |
| `Live` | 세션 종료 | `Ended` | Teacher/Station에서 종료 가능 |
| `Pending` | 세션 종료 | `Ended` | setter가 범용이라 코드상 가능 |

## 2) 토론 진행 상태 전이(런타임 메모리)

### 상태 필드
- `phase`: `Opening` -> `Rebuttal` -> `Rerebuttal` -> `FinalSummary`
- `currentSpeakerIndex`
- `isSpeechRunning`
- `finalSpeechCompleted`

### Ordered 모드
| 조건 | 결과 |
|---|---|
| 같은 phase에서 다음 발언자 존재 | `currentSpeakerIndex + 1` |
| 마지막 발언자이고 다음 phase 존재 | 다음 phase로 이동, 발언자 0으로 초기화 |
| `FinalSummary` 마지막 발언자 종료 | `finalSpeechCompleted = true` |

### Free 모드
- phase/speaker 진행 규칙을 강제하지 않음.
- `canEndDebate()`는 발언자 수가 있으면 종료 가능 반환.

## 3) Station 화면 상태 전이

### 상태 집합
- `landing`
- `waiting`
- `live`

### 전이
| 현재 | 이벤트 | 다음 |
|---|---|---|
| `landing` | 입장 버튼 | `waiting` |
| `waiting` | 배치 완료 + 자동 타이머 | `live` |
| `live` | 토론 종료 | `/station/report` 라우팅 |

## 4) Report 화면 view 전이

### 상태 집합
- `report`
- `manage`

### 규칙
- `source=station`이면 `report` view를 강제.
- 그 외에는 `view=report/manage` query로 전환.

## 5) 저장/복구
- 세션 데이터는 `localStorage(classflow.mock.sessions.v1)`에 저장.
- 토론 진행 상태(`useSessionFlow`)는 메모리 상태라 새로고침 시 초기화.
