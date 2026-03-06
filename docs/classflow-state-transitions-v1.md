# ClassFlow State Transitions (Current Implementation)

## 1. Session Status Transitions
| Current | Event | Next | Notes |
|---|---|---|---|
| created | create session | `Pending` | default |
| `Pending` | start session | `Live` | Teacher or Station path |
| `Live` | end session | `Ended` | session-level end |
| `Pending` | end session | `Ended` | possible from dashboard action |

## 2. Teacher Debate Screen Transitions
| Current | Event | Next |
|---|---|---|
| `/teacher/sessions/{id}` | `세션 종료` | `/teacher/sessions/{id}/summary` |
| `/teacher/sessions/{id}` | ended debate detail access | `/teacher/sessions/{id}/summary` via `replace` |
| `/teacher/sessions/{id}/summary` | `세션 레포트 보기` | `/teacher/sessions/{id}/report` |

## 3. Presentation Detail Transitions
| Current | Event | Next |
|---|---|---|
| pending presentation detail | `발표 시작하기` | live presentation detail |
| live presentation detail | `다음 발표자` | same page |
| live presentation detail | final presenter complete | ended presentation detail |
| ended presentation detail | AI loading complete | profile report view on same page |
| session list ended presentation action | `레포트 확인` | `/teacher/sessions/{id}/report` |

## 4. Group End vs Session End
| Action | Result |
|---|---|
| `조 토론 종료` | ends group-level runtime only |
| `세션 종료` | sets session to `Ended` and routes to summary |

## 5. Station Flow Transitions
| Current | Event | Next |
|---|---|---|
| `landing` | join | `identity` |
| `identity` | select student | `group` |
| `group` | select group | `waiting` |
| `waiting` | placement complete | `live` |
| `live` | debate completion | `/station/report?...&source=station` |

## 6. Station Report View Transitions
| Current | Event | Next |
|---|---|---|
| `/station/report?...&view=report` | switch view | `/station/report?...&view=manage` |
| `/station/report?...&view=manage` | switch view | `/station/report?...&view=report` |
| `/station/report?...&source=station` | open | report view forced |
