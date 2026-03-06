# Navigation Map (Current Implementation)

## Global
| From | To | Trigger | Condition |
|---|---|---|---|
| `/` | `/teacher` | server redirect | always |
| `Any /teacher/*` | `/teacher` | top nav | always |
| `Any /teacher/*` | `/teacher/sessions` | top nav | always |
| `Any /teacher/*` | `/teacher/students` | top nav | always |
| `Any /teacher/*` | `/teacher/settings` | top nav | always |

## Teacher Dashboard (`/teacher`)
| From | To | Trigger | Condition |
|---|---|---|---|
| `/teacher` | `/teacher/sessions/{id}` | `대기중 세션 이어하기` | pending session exists |
| `/teacher` | same page | `세션 종료하기` | pending session exists |
| `/teacher` | `/teacher/sessions/create?type=debate` | `새 세션 생성` | no pending session |
| `/teacher` | `/teacher/sessions` | `전체보기` | always |
| `/teacher` | `/teacher/students/{id}` | watch card / evidence card click | item visible |

## Session List (`/teacher/sessions`)
| From | To | Trigger | Condition |
|---|---|---|---|
| `/teacher/sessions` | `/teacher/sessions/create?type=presentation` | `발표 생성` | always |
| `/teacher/sessions` | `/teacher/sessions/create?type=debate` | `토론 생성` | always |
| `/teacher/sessions` | `/teacher/sessions/create?sessionId={id}&type={type}` | `확인/수정` | pending session |
| `/teacher/sessions` | `/teacher/sessions/{id}` | `세션 진입` | live session |
| `/teacher/sessions` | `/teacher/sessions/{id}/report` | `레포트 확인` | ended session |
| `/teacher/sessions` | `/teacher/sessions/{id}/summary` | `수업 요약` | ended debate only |

## Session Create (`/teacher/sessions/create`)
| From | To | Trigger | Condition |
|---|---|---|---|
| `/teacher/sessions/create` | `/teacher/sessions` | create/update completion | flow complete |
| `/teacher/sessions/create` | `/teacher/sessions` | back/cancel path inside flow | current UI action |

## Debate Detail (`/teacher/sessions/[id]`)
| From | To | Trigger | Condition |
|---|---|---|---|
| `/teacher/sessions/{id}` | `/teacher/sessions` | back link | always |
| `/teacher/sessions/{id}` | `/teacher/sessions/create?sessionId={id}&type=debate` | `세션 설정으로 가기` | pending debate |
| `/teacher/sessions/{id}` | same page | `세션 시작` | pending debate |
| `/teacher/sessions/{id}` | same page | `진행 화면 / 관리 화면` | teacher-guided live debate |
| `/teacher/sessions/{id}` | `/teacher/sessions/{id}/summary` | `세션 종료` | live debate |
| `/teacher/sessions/{id}` | `/teacher/sessions/{id}/summary` | automatic replace | ended debate detail access |

## Presentation Detail (`/teacher/sessions/[id]`)
| From | To | Trigger | Condition |
|---|---|---|---|
| `/teacher/sessions/{id}` | same page | `발표 시작하기` | pending presentation |
| `/teacher/sessions/{id}` | same page | `발표하기` / `발표 끝내기` | live presentation |
| `/teacher/sessions/{id}` | same page | `다음 발표자` | presenter ready for next |
| `/teacher/sessions/{id}` | same page | `세션 종료` | last presenter complete |
| `/teacher/sessions` | `/teacher/sessions/{id}/report` | `레포트 확인` | ended presentation list action |

## Session Summary (`/teacher/sessions/[id]/summary`)
| From | To | Trigger | Condition |
|---|---|---|---|
| `/teacher/sessions/{id}/summary` | `/teacher/sessions/{id}` | back link | always |
| `/teacher/sessions/{id}/summary` | `/teacher/sessions/{id}/report` | `세션 레포트 보기` | always |

## Students
| From | To | Trigger | Condition |
|---|---|---|---|
| `/teacher/students` | `/teacher/students/{id}` | student card click | always |
| `/teacher/students/{id}` | `/teacher/students` | back link | always |

## Station (`/station`)
| From | To | Trigger | Condition |
|---|---|---|---|
| `/station` | same page (`landing -> identity`) | join action | active debate exists |
| `/station` | same page (`identity -> group`) | next | student selected |
| `/station` | same page (`group -> waiting`) | select group | group selected |
| `/station` | same page (`waiting -> live`) | placement complete | waiting state |
| `/station` | `/station/report?...&source=station` | debate completion path | participant flow end |

## State-only Actions
- `조 토론 종료` changes same-page UI state only.
- `대표 사례 지정` updates the local featured-evidence store.
- `진행 화면 / 관리 화면` is a same-page view toggle.
