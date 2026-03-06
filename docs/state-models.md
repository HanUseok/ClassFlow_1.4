# State Models (Current Implementation)

## 1. Session Status
- Enum: `Pending`, `Live`, `Ended`

### Transitions
| From | To | Trigger |
|---|---|---|
| create | `Pending` | session create |
| `Pending` | `Live` | session start |
| `Live` | `Ended` | session end |
| `Pending` | `Ended` | dashboard end action or generic setter path |

### Screen Rules
- `Pending Debate`: detail shows setup/placement UI
- `Live Debate`: detail shows runtime UI
- `Ended Debate`: detail access redirects to summary
- `Pending/Live/Ended Presentation`: all stay inside presentation detail flow

## 2. Debate Runtime State
- Mode: `Ordered` or `Free`
- Group runtime state
  - `phase`
  - `currentSpeakerIndex`
  - `isSpeechRunning`
  - `finalSpeechCompleted`

### Ordered Debate
- Phase order:
  - `Opening`
  - `Rebuttal`
  - `Rerebuttal`
  - `FinalSummary`

### Free Debate
- Speech-type selection:
  - `질문`
  - `반박`
  - `동의`
- This state is shared into both Teacher progress view and Station live view.

## 3. Teacher Debate View State
- `viewMode`
  - `progress`
  - `manage`
- `progress` is used only for teacher-guided live debate
- `manage` is observation/group-control focused
- `groupEndedByTeacher` is local UI state and is separate from session status

## 4. Group End vs Session End
- `조 토론 종료`
  - group-level UI/runtime action
  - same-page state change
  - does not change the session to `Ended`
- `세션 종료`
  - session-level action
  - sets the session to `Ended`
  - routes Teacher debate flow to summary

## 5. Station Entry State
- `landing`
- `identity`
- `group`
- `waiting`
- `live`

### Station Transitions
- `landing -> identity`
- `identity -> group`
- `group -> waiting`
- `waiting -> live`
- `live -> /station/report?...&source=station`

## 6. Student Detail Derived State
- Preparation status is derived from evidence count and featured-evidence count
- Writing draft is derived from current evidence/featured evidence
- Similarity warning is derived from drafts of students in the same class
- Recommendation badge is derived from evidence scoring

## 7. Persistence Boundaries
- Sessions: localStorage-backed mock store
- Featured evidence: separate local store
- Debate runtime state: in-memory UI state
- Refresh does not preserve all live debate runtime state
