Definition location

mock-data.ts

Actual type definition



id: string

sessionId: string

round: number

studentId: string

studentName: string

team: "Team 1" | "Team 2"

speechType: SpeechType

note?: string

timestamp: string

approved: boolean



Used by

Teacher dashboard



participation stats



recommendation



Student detail



evidence list



preparation status



Session summary



participation



Session report



argument extraction



thinking extraction



Field usage classification

Canonical

studentId

sessionId

timestamp

speechType

UI convenience

team

note

approved

Derived

participationScore

recommendationScore

Compatibility rule



외부 DTO / UI에서는



DebateEvent



이름 유지.



내부 domain에서는



ActivityEvent



로 전환 가능.

