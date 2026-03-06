Session Service



파일



lib/application/session-service.ts

Exported behaviors

createSession

updateSession

deleteSession

changeSessionStatus

startParticipantSpeech

finishParticipantSpeech

completeStationDebate

generateStationReportPath

Responsibility

session lifecycle

station debate completion

report path generation

Notes



일부 runtime shortcut이 존재한다.



Roster Service



파일



lib/application/roster-service.ts

Exposed reads

getClasses

getStudents

getStations

getDebateEvents

Responsibility

read-only access to seed roster data

Teacher Insights



파일



lib/application/teacher-insights.ts

Derived calculations

getRecentDebateEvents

getParticipationStats

getRecommendationScore

getSessionSummary

getTeamSummary

generateStudentDraft

computeSimilarityWarning

Role

derived analytics layer

Featured Evidence Store



파일



lib/featured-evidence-store.ts

Behavior

getFeaturedEvidence

setFeaturedEvidence

clearFeaturedEvidence

Storage

localStorage

