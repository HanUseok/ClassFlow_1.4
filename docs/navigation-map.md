# Navigation Map (From -> To)

## Scan Basis
- Scope: `app`, `components`, `hooks`, `lib` 내 `href`, `redirect`, `router.push`, `router.back`
- Verified Date: 2026-03-05

## Global
| From | To | Trigger | Condition |
|---|---|---|---|
| `/` | `/teacher` | `redirect()` | 항상 |
| `Any /teacher/*` | `/teacher` | 상단 로고 클릭 | 항상 |
| `Any /teacher/*` | `/teacher/sessions` | 상단 메뉴 클릭 | 항상 |
| `Any /teacher/*` | `/teacher/students` | 상단 메뉴 클릭 | 항상 |
| `Any /teacher/*` | `/teacher/settings` | 상단 메뉴 클릭 | 항상 |

## Teacher Dashboard (`/teacher`)
| From | To | Trigger | Condition |
|---|---|---|---|
| `/teacher` | `/teacher/sessions/create?type=debate` | 새 세션 생성 | Pending 세션이 없을 때 |
| `/teacher` | `/teacher/sessions/{id}` | 대기중 세션 이어하기 | Pending 세션이 있을 때 |
| `/teacher` | `/teacher/sessions` | 전체보기 | 항상 |
| `/teacher` | `/teacher/students/{id}` | 관찰 필요 학생 클릭 | 목록에 표시된 경우 |

## Session List (`/teacher/sessions`)
| From | To | Trigger | Condition |
|---|---|---|---|
| `/teacher/sessions` | `/teacher/sessions/create?type=presentation` | 발표 생성 | 항상 |
| `/teacher/sessions` | `/teacher/sessions/create?type=debate` | 토론 생성 | 항상 |
| `/teacher/sessions` | `/teacher/sessions/create?sessionId={id}&type={...}` | 확인/수정 | 세션 상태 `Pending` |
| `/teacher/sessions` | `/teacher/sessions/{id}` | 세션 진입 | 세션 상태 `Live` |
| `/teacher/sessions` | `/teacher/sessions/{id}/report` | 레포트 확인 | 세션 상태 `Ended` |

## Session Create (`/teacher/sessions/create`)
| From | To | Trigger | Condition |
|---|---|---|---|
| `/teacher/sessions/create` | 이전 페이지 | Back 버튼 (`router.back`) | 항상 |
| `/teacher/sessions/create` | `/teacher/sessions/{id}` | 세션 실행 | 생성/수정 성공 |
| `/teacher/sessions/create` | `/teacher/sessions` | 저장 | 생성/수정 성공 |

## Session Detail (`/teacher/sessions/{id}`)
| From | To | Trigger | Condition |
|---|---|---|---|
| `/teacher/sessions/{id}` | `/teacher/sessions` | 목록으로 돌아가기 | 항상 |
| `/teacher/sessions/{id}` | `/teacher/sessions/create?sessionId={id}&type=debate` | 세션 설정으로 가기 | Debate + Pending |
| `/teacher/sessions/{id}` | `/station/report?...` | 토론 종료 | Debate 종료 처리 시 |

## Teacher Report (`/teacher/sessions/{id}/report`)
| From | To | Trigger | Condition |
|---|---|---|---|
| `/teacher/sessions/{id}/report` | `/teacher/sessions` | 상단 뒤로가기 | 항상 |

## Students
| From | To | Trigger | Condition |
|---|---|---|---|
| `/teacher/students` | `/teacher/students/{id}` | 학생 카드 클릭 | 항상 |
| `/teacher/students/{id}` | `/teacher/students` | 학생 목록으로 | 항상 |

## Station (`/station`)
| From | To | Trigger | Condition |
|---|---|---|---|
| `/station` | same page (`landing -> waiting`) | 입장 버튼 | active debate session 존재 |
| `/station` | same page (`waiting -> live`) | 배치 완료 후 자동 전환 | waiting 상태 |
| `/station` | `/station/report?...&source=station` | 토론 종료 | live 상태 |

## Station Report (`/station/report`)
| From | To | Trigger | Condition |
|---|---|---|---|
| `/station/report?...` | same route (`view=report`) | 보고 화면 탭 | `source != station` |
| `/station/report?...` | same route (`view=manage`) | 관리 화면 탭 | `source != station` |
| `/station/report?...` | `/station` | 스테이션 처음 화면으로 | `source=station` |
| `/station/report?...` | `/teacher/sessions` | 상단 뒤로가기 | `source != station` and `sessionId` 존재 |

## In-Page State Switches (No Route Change)
- Session detail: `viewMode` (`progress`/`manage`) 토글.
- Station page: `state` (`landing`/`waiting`/`live`) 전환.
- Station report: query 기반 `view` 전환.
