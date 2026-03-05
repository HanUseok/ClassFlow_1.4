# ClassFlow MVP Scope (현재 코드 기준)

## 문서 목적
이 문서는 현재 저장소에서 실제 동작하는 MVP 범위를 코드 기준으로 고정한다.

## 기준
- Verified Date: 2026-03-05
- 데이터 소스: `mock-data` + `localStorage`

## 1) 현재 MVP 포함 범위

### Teacher
- 대시보드
  - Pending 세션 이어가기/종료
  - 세특 준비 상태(근거 수, 대표사례 지정 상태)
  - 관찰 필요 학생 목록
  - 최근 근거 요약
- 세션 목록
  - 타입/상태/검색 필터
  - 세션 생성 진입
  - 세션 삭제/전체 삭제
  - 상태별 상세 진입
- 세션 생성/수정
  - Debate/Presentation 생성
  - Debate mode(Ordered/Free), guided/unguided
  - 인원/슬롯/논거 카드 설정
- 세션 상세
  - Debate 진행/종료
  - Teacher guided 모드의 진행 화면/관리 화면 전환
  - Presentation 진행(타이머 기반)
- 학생
  - 학생 목록/검색/학급 필터
  - 학생별 근거 워크스페이스
  - 대표 사례 지정, 세특 작성 보조 템플릿
- 설정
  - 명단/스테이션 설정 UI

### Station
- 대기(landing/waiting)
- 조 배치 후 live 전환
- LiveDebateScreen + QuickAddScreen
- 종료 시 `/station/report` 이동

### Report
- `/station/report`
  - Ordered/Free 레포트 표 렌더링
  - `view=report/manage` 전환
  - `source=station`일 때 report view 강제
- `/teacher/sessions/[id]/report`
  - 교사용 토론 레포트 화면

## 2) 현재 구현 제약
- 인증/권한 시스템 없음.
- 서버 DB/API 없음 (클라이언트 저장).
- 토론 런타임 상태는 새로고침 시 유지되지 않음.
- STT/실시간 음성 분석/외부 LMS 연동 없음.

## 3) 데이터/아키텍처
- `domain` / `application` / `infrastructure` 레이어 분리.
- Repository port를 두고 local 구현체(`localSessionRepository`) 사용.
- 테스트는 domain/application 유닛 테스트 중심.

## 4) 다음 릴리즈 후보
- 서버 영속화(세션/근거/대표사례).
- 인증 및 역할 기반 접근 제어.
- 토론 런타임 상태 복구(새로고침/다중 탭).
- 레포트 편집/내보내기 기능 강화.
