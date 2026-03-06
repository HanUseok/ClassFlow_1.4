export type SessionType = "Debate" | "Presentation"
export type SessionStatus = "Live" | "Ended" | "Pending"
export type StationRole = "Teacher Desk" | "Team 1" | "Team 2"
export type StationConnectionStatus = "Connected" | "Waiting"
export type DebatePhase = "Preparation" | "Opening" | "Rebuttal" | "Closing" | "Voting"
export type SpeechType = "Claim" | "Rebuttal" | "Question"

export interface Student {
  id: string
  name: string
  classId: string
  className: string
}

export interface ClassGroup {
  id: string
  name: string
  students: Student[]
}

export interface Session {
  id: string
  title: string
  topic?: string
  type: SessionType
  status: SessionStatus
  date: string
  classId: string
  className: string
  teams?: {
    team1: Student[]
    team2: Student[]
  }
  debate?: {
    argumentCards?: {
      id: string
      title: string
      claim: string
      evidenceHint?: string
      side?: "affirmative" | "negative" | "neutral"
      enabled: boolean
    }[]
    mode?: "Ordered" | "Free"
    teacherGuided?: boolean
    orderedFlow?: {
      stages: {
        id: "opening" | "crossQuestion" | "rebuttal" | "surrebuttal" | "closing"
        label: string
        enabled: boolean
        minutes: number
      }[]
    }
    membersPerGroup: 4 | 6
    moderators: Student[]
    groups: {
      id: string
      affirmative: Student[]
      negative: Student[]
      moderator?: Student
    }[]
    assignmentConfig?: {
      groupCount: number
      affirmativeSlots: number
      negativeSlots: number
      moderatorSlots: number
      selectedStudentIds?: string[]
      recordingStudentIds?: string[]
      groupAssignments?: Record<
        string,
        {
          affirmative: (string | null)[]
          negative: (string | null)[]
          moderator: (string | null)[]
        }
      >
      groupSlotAdjust?: Record<
        string,
        {
          affirmative: number
          negative: number
          moderator: number
        }
      >
    }
  }
  presentation?: {
    presenters: {
      student: Student
      recordingEnabled: boolean
    }[]
    secondsPerPresenter: number
  }
}

export interface Station {
  id: string
  name: string
  role: StationRole
  connectionStatus: StationConnectionStatus
}

export interface DebateEvent {
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
}
