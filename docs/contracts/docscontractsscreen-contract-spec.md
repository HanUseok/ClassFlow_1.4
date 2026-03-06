목적



현재 UI가 실제로 기대하는 데이터 shape를 고정한다.



이 문서는 backend 리팩터링 중에도 깨지면 안 되는 계약이다.



특히 다음을 보장한다.



UI가 기대하는 read model shape는 변경하지 않는다



raw data source가 바뀌어도 화면 contract는 유지한다



report는 persisted entity가 아니라 derived read model로 유지한다



Screen: Teacher Dashboard

Data sources



teacher-insights.ts



evidence-utils.ts



roster-service.ts



mock-data.ts



Expected input data

students\[]

sessions\[]

debateEvents\[]

featuredEvidence\[]

Expected derived fields

participationStats

watchStudents

recommendationScore

recentEvidence

Required fields

student.id

student.name

student.classId



debateEvent.studentId

debateEvent.sessionId

debateEvent.timestamp

Derived fields

recentParticipation

evidenceCount

featuredEvidence

recommendationScore

Remove-forbidden fields

student.id

debateEvent.studentId

debateEvent.sessionId

debateEvent.timestamp

Screen: Session Detail

Data sources



session-service.ts



mock-session-store.ts



roster-service.ts



Expected input

session

groups

participants

debateEvents

Required fields

session.id

session.title

session.status

session.groups\[]

session.config

Runtime state

currentPhase

currentSpeaker

completedSpeeches

Notes



runtime state는 persistence 대상이 아니다.



Screen: Session Summary

Data sources



teacher-insights.ts



Expected input

session

debateEvents

students

Derived output

participationStats

teamSummary

highlightStudents

Notes



Session Summary는 세션 전체 활동 요약을 위한 read model이다.



개별 학생의 논거/사고 구조보다

참여 통계와 팀 요약 중심이다.



Screen: Session Report



Session Report는 세션 타입에 따라 다른 read model shape를 가진다.



공통 규칙:



persisted entity 아님



derived read model



UI rendering contract는 유지해야 함



Session Report — Ordered Debate

Shape

studentName

sideLabel

turnLabel

reportType = ordered\_debate



sections\[]

Section structure

sectionLabel

argumentText

thinkingText

keywords\[]

sectionLabel examples

입론

반론

재반론

마무리

Example

sections:

&nbsp; - sectionLabel: 입론

&nbsp;   argumentText: 뇌 발달/중독 메커니즘

&nbsp;   thinkingText: 적용

&nbsp;   keywords: \["뇌 발달", "중독 메커니즘"]



&nbsp; - sectionLabel: 반론

&nbsp;   argumentText: 학습권/집중력 저하

&nbsp;   thinkingText: 인과 설명

&nbsp;   keywords: \["학습권", "집중력 저하"]

Session Report — Free Debate

Shape

studentName

sideLabel

reportType = free\_debate



sections\[]

Section structure

mappingLabel

argumentText

thinkingText

keywords\[]

mappingLabel examples

매핑 1

매핑 2

매핑 3

매핑 4

Session Report — Presentation

Shape

studentName

presenterOrder

recordingState

reportType = presentation



keywordAnalysis

keywordAnalysis structure

topicKeywords\[]

problemKeywords\[]

methodKeywords\[]

analysisKeywords\[]

majorKeywords\[]

competencyKeywords\[]

growthKeywords\[]

Example

topicKeywords: \["지역경제", "디지털 전환", "공공성"]

methodKeywords: \["설문 조사"]

analysisKeywords: \["적용 범위 확장", "원인-결과"]

majorKeywords: \["교육학", "디자인"]

competencyKeywords: \["질문 설계"]

Screen: Student Detail

Data sources



teacher-insights.ts



featured-evidence-store.ts



mock-data.ts



Expected input

student

debateEvents\[]

featuredEvidence\[]

Derived fields

preparationStatus

recommendationScore

draftParagraph

similarityWarning

Student evidence workspace



Student Detail은 단순 event 목록이 아니라

학생 evidence workspace read model을 사용한다.



가능한 구성:



studentEvidenceSections\[]

featuredEvidence\[]

recentEvents\[]

Remove-forbidden

student.id

debateEvent.studentId

Screen: Station Report

Data sources



session-service.ts



station/report/page.tsx



Transport

query string

logs

names

groupLayout

Derived rendering

reportBlocks

argumentSummary

thinkingSummary

Important rule



station report는 URL transport 기반 demo adapter다.



리팩터링 중에도



/station/report



route contract는 유지해야 한다.

