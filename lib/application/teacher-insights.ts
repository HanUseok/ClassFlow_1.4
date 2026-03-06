import type { DebateEvent, Session, Student } from "@/lib/mock-data"
import { collectUniqueMembers, type DebateGroup } from "@/lib/domain/session"
import { buildReportInsight, extractKeywordsFromNote, type EvidenceItem } from "@/lib/evidence-utils"

export type ParticipationLevel = "none" | "normal" | "active"

export type SpeechStat = {
  studentId: string
  studentName: string
  classId: string
  speechCount: number
  participationLevel: ParticipationLevel
}

export type ParticipationBuckets = {
  active: SpeechStat[]
  normal: SpeechStat[]
  none: SpeechStat[]
}

export type TeamSummary = {
  teamId: string
  teamLabel: string
  majorClaims: string[]
  majorRebuttals: string[]
  conceptTags: string[]
  participation: SpeechStat[]
}

export type SessionSummary = {
  totalSpeechCount: number
  activeStudents: number
  silentStudents: Student[]
  majorClaims: string[]
  conceptTags: string[]
  teamSummaries: TeamSummary[]
  participationStats: SpeechStat[]
}

export type StudentPreparationStatus = "ready" | "needs_featured" | "insufficient"

export type RecordDraft = {
  studentId: string
  paragraph: string
  keywords: string[]
}

export type RecordSimilarityWarning = {
  studentA: string
  studentB: string
  similarity: number
}

type SessionLike = Pick<Session, "id" | "type" | "classId" | "className" | "date" | "topic" | "teams" | "debate">

type TeamEntry = {
  teamId: string
  teamLabel: string
  groups: DebateGroup[]
  eventTeams: Array<DebateEvent["team"]>
}

function normalizeNote(note: string | undefined, studentName?: string) {
  const trimmed = note?.trim() ?? ""
  if (!trimmed) return ""
  if (!studentName) return trimmed
  const escapedName = studentName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return trimmed.replace(new RegExp(`^${escapedName}:\\s*`), "")
}

function toParticipationLevel(speechCount: number): ParticipationLevel {
  if (speechCount <= 0) return "none"
  if (speechCount <= 2) return "normal"
  return "active"
}

function rankKeywords(events: DebateEvent[], limit = 3) {
  const counts = new Map<string, number>()

  events.forEach((event) => {
    const tokens = extractKeywordsFromNote(normalizeNote(event.note, event.studentName), 6)
    tokens.forEach((token) => counts.set(token, (counts.get(token) ?? 0) + 1))
  })

  return [...counts.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1]
      return a[0].localeCompare(b[0], "ko")
    })
    .slice(0, limit)
    .map(([token]) => token)
}

function getSessionParticipants(session: SessionLike, students: Student[]) {
  if (session.type === "Debate") {
    const groups = session.debate?.groups ?? []
    if (groups.length > 0) {
      const groupMembers = collectUniqueMembers(groups)
      if (groupMembers.length > 0) {
        const memberIds = new Set(groupMembers.map((member) => member.id))
        return students.filter((student) => memberIds.has(student.id))
      }
    }

    const teamMembers = [...(session.teams?.team1 ?? []), ...(session.teams?.team2 ?? [])]
    if (teamMembers.length > 0) {
      const memberIds = new Set(teamMembers.map((student) => student.id))
      return students.filter((student) => memberIds.has(student.id))
    }
  }

  return students.filter((student) => student.classId === session.classId)
}

function buildTeamEntries(session: SessionLike): TeamEntry[] {
  if (session.type !== "Debate") return []

  const groups = session.debate?.groups ?? []
  if (groups.length > 0) {
    return groups.map((group, index) => ({
      teamId: group.id,
      teamLabel: `${index + 1}조`,
      groups: [group],
      eventTeams: ["Team 1", "Team 2"] as Array<DebateEvent["team"]>,
    }))
  }

  return [
    {
      teamId: "team-1",
      teamLabel: "Team 1",
      groups: [],
      eventTeams: ["Team 1"] as Array<DebateEvent["team"]>,
    },
    {
      teamId: "team-2",
      teamLabel: "Team 2",
      groups: [],
      eventTeams: ["Team 2"] as Array<DebateEvent["team"]>,
    },
  ]
}

export function getRecentDebateEvents(events: DebateEvent[], sessions: Session[]) {
  const debateSessions = sessions
    .filter((session) => session.type === "Debate")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const latestWithEvents = debateSessions.find((session) =>
    events.some((event) => event.sessionId === session.id)
  )

  if (!latestWithEvents) return events
  return events.filter((event) => event.sessionId === latestWithEvents.id)
}

export function computeSpeechStats(events: DebateEvent[], students: Student[]): SpeechStat[] {
  const counts = new Map<string, number>()
  events.forEach((event) => counts.set(event.studentId, (counts.get(event.studentId) ?? 0) + 1))

  return students
    .map((student) => {
      const speechCount = counts.get(student.id) ?? 0
      return {
        studentId: student.id,
        studentName: student.name,
        classId: student.classId,
        speechCount,
        participationLevel: toParticipationLevel(speechCount),
      }
    })
    .sort((a, b) => {
      if (b.speechCount !== a.speechCount) return b.speechCount - a.speechCount
      return a.studentName.localeCompare(b.studentName, "ko")
    })
}

export function buildParticipationBuckets(stats: SpeechStat[]): ParticipationBuckets {
  return {
    active: stats.filter((item) => item.participationLevel === "active"),
    normal: stats.filter((item) => item.participationLevel === "normal"),
    none: stats.filter((item) => item.participationLevel === "none"),
  }
}

export function evidenceRecommendationScore(item: EvidenceItem) {
  const note = normalizeNote(item.event.note, item.event.studentName)
  const insight = buildReportInsight(item)
  const keywords = extractKeywordsFromNote(note, 6)
  let score = 0

  if (item.event.speechType === "Claim" || item.event.speechType === "Rebuttal") score += 1
  if (insight.argumentCard && insight.argumentCard !== "-" && insight.thinkingCard && insight.thinkingCard !== "-") score += 1
  if (note.length >= 24) score += 1
  if (keywords.length >= 2) score += 1

  return {
    evidenceId: item.id,
    recommendationScore: score,
    recommended: score >= 3,
  }
}

export function generateTeamDebateSummary(
  events: DebateEvent[],
  groupsOrSession: DebateGroup[] | SessionLike
): TeamSummary[] {
  let teamEntries: TeamEntry[]

  if (Array.isArray(groupsOrSession)) {
    teamEntries = groupsOrSession.map((group, index) => ({
      teamId: group.id,
      teamLabel: `${index + 1}조`,
      groups: [group],
      eventTeams: ["Team 1", "Team 2"] as Array<DebateEvent["team"]>,
    }))
  } else {
    teamEntries = buildTeamEntries(groupsOrSession)
  }

  return teamEntries.map((entry) => {
    const memberIds = new Set(
      entry.groups.flatMap((group) => [
        ...group.affirmative.map((student) => student.id),
        ...group.negative.map((student) => student.id),
        ...(group.moderator ? [group.moderator.id] : []),
      ])
    )

    const filteredEvents =
      memberIds.size > 0
        ? events.filter((event) => memberIds.has(event.studentId))
        : events.filter((event) => entry.eventTeams.includes(event.team))

    const participants = Array.from(
      new Map(
        filteredEvents.map((event) => [
          event.studentId,
          {
            id: event.studentId,
            name: event.studentName,
            classId: "",
            className: "",
          } satisfies Student,
        ])
      ).values()
    )

    return {
      teamId: entry.teamId,
      teamLabel: entry.teamLabel,
      majorClaims: rankKeywords(filteredEvents.filter((event) => event.speechType === "Claim")),
      majorRebuttals: rankKeywords(filteredEvents.filter((event) => event.speechType === "Rebuttal")),
      conceptTags: rankKeywords(filteredEvents, 4),
      participation: computeSpeechStats(filteredEvents, participants),
    }
  })
}

export function generateSessionSummary(events: DebateEvent[], session: SessionLike, students: Student[]): SessionSummary {
  const sessionEvents = events.filter((event) => event.sessionId === session.id)
  const participants = getSessionParticipants(session, students)
  const participationStats = computeSpeechStats(sessionEvents, participants)
  const silentStudents = participants.filter(
    (student) => !sessionEvents.some((event) => event.studentId === student.id)
  )

  return {
    totalSpeechCount: sessionEvents.length,
    activeStudents: participationStats.filter((item) => item.speechCount > 0).length,
    silentStudents,
    majorClaims: rankKeywords(sessionEvents.filter((event) => event.speechType === "Claim")),
    conceptTags: rankKeywords(sessionEvents, 5),
    teamSummaries: generateTeamDebateSummary(sessionEvents, session),
    participationStats,
  }
}

export function getStudentPreparationStatus(input: {
  evidenceCount: number
  featuredEvidenceCount: number
}): StudentPreparationStatus {
  if (input.featuredEvidenceCount >= 1) return "ready"
  if (input.evidenceCount >= 2) return "needs_featured"
  return "insufficient"
}

export function generateStudentRecordDraft(
  evidences: EvidenceItem[],
  student: Student,
  sessionContext?: { topic?: string }
): RecordDraft {
  const source = evidences.slice(0, 2)
  const noteKeywords = source.flatMap((item) =>
    extractKeywordsFromNote(normalizeNote(item.event.note, item.event.studentName), 4)
  )
  const keywords = Array.from(new Set(noteKeywords)).slice(0, 5)
  const speechKinds = Array.from(new Set(source.map((item) => item.event.speechType)))

  const speechPhrase =
    speechKinds.includes("Question")
      ? "질문을 통해 논의를 확장하고"
      : speechKinds.includes("Rebuttal")
        ? "상대 의견을 비판적으로 검토하며 반박하고"
        : "근거 중심으로 주장을 제시하고"

  const topicPhrase = sessionContext?.topic?.trim()
    ? `${sessionContext.topic.trim()}를 주제로 한 토론 수업에서 `
    : "토론 수업에서 "

  const keywordPhrase =
    keywords.length > 0
      ? `${keywords.slice(0, 3).join(", ")} 등의 개념을 바탕으로 `
      : "수업 개념을 바탕으로 "

  return {
    studentId: student.id,
    paragraph: `${topicPhrase}${keywordPhrase}${speechPhrase} 수업 흐름에 맞춰 자신의 생각을 구체적으로 표현하는 모습을 보임.`,
    keywords,
  }
}

function vectorize(text: string) {
  const tokens = extractKeywordsFromNote(text, 20)
  const counts = new Map<string, number>()
  tokens.forEach((token) => counts.set(token, (counts.get(token) ?? 0) + 1))
  return counts
}

function cosineSimilarity(left: Map<string, number>, right: Map<string, number>) {
  const keys = new Set([...left.keys(), ...right.keys()])
  let dot = 0
  let leftNorm = 0
  let rightNorm = 0

  keys.forEach((key) => {
    const l = left.get(key) ?? 0
    const r = right.get(key) ?? 0
    dot += l * r
    leftNorm += l * l
    rightNorm += r * r
  })

  if (leftNorm === 0 || rightNorm === 0) return 0
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm))
}

export function checkRecordSimilarity(records: RecordDraft[], threshold = 0.8): RecordSimilarityWarning[] {
  const warnings: RecordSimilarityWarning[] = []

  for (let i = 0; i < records.length; i += 1) {
    for (let j = i + 1; j < records.length; j += 1) {
      const similarity = cosineSimilarity(
        vectorize(records[i].paragraph),
        vectorize(records[j].paragraph)
      )

      if (similarity >= threshold) {
        warnings.push({
          studentA: records[i].studentId,
          studentB: records[j].studentId,
          similarity,
        })
      }
    }
  }

  return warnings.sort((a, b) => b.similarity - a.similarity)
}
