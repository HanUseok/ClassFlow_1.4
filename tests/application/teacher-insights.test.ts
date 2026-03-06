import { describe, expect, it } from "vitest"
import {
  buildParticipationBuckets,
  checkRecordSimilarity,
  computeSpeechStats,
  evidenceRecommendationScore,
  generateSessionSummary,
  generateStudentRecordDraft,
  generateTeamDebateSummary,
  getRecentDebateEvents,
  getStudentPreparationStatus,
} from "../../lib/application/teacher-insights"
import type { DebateEvent, Session, Student } from "../../lib/mock-data"
import type { EvidenceItem } from "../../lib/evidence-utils"

const students: Student[] = [
  { id: "s1", name: "Kim", classId: "class-1", className: "1-3" },
  { id: "s2", name: "Park", classId: "class-1", className: "1-3" },
  { id: "s3", name: "Moon", classId: "class-1", className: "1-3" },
]

const session: Session = {
  id: "sess-1",
  title: "Demo Debate",
  topic: "자기결정권과 정책 실효성",
  type: "Debate",
  status: "Ended",
  date: "2026-03-01",
  classId: "class-1",
  className: "1-3",
  teams: {
    team1: [students[0], students[1]],
    team2: [students[2]],
  },
}

const events: DebateEvent[] = [
  {
    id: "e1",
    sessionId: "sess-1",
    round: 1,
    studentId: "s1",
    studentName: "Kim",
    team: "Team 1",
    speechType: "Claim",
    note: "Kim: 자기결정권과 정책 실효성 데이터를 비교해 주장함",
    timestamp: "2026-03-01T09:00:00",
    approved: true,
  },
  {
    id: "e2",
    sessionId: "sess-1",
    round: 1,
    studentId: "s1",
    studentName: "Kim",
    team: "Team 1",
    speechType: "Rebuttal",
    note: "Kim: 집중력 저하 반례와 통계 자료를 함께 제시함",
    timestamp: "2026-03-01T09:03:00",
    approved: true,
  },
  {
    id: "e3",
    sessionId: "sess-1",
    round: 1,
    studentId: "s1",
    studentName: "Kim",
    team: "Team 1",
    speechType: "Question",
    note: "Kim: 정책 적용 범위를 질문함",
    timestamp: "2026-03-01T09:05:00",
    approved: true,
  },
  {
    id: "e4",
    sessionId: "sess-1",
    round: 1,
    studentId: "s2",
    studentName: "Park",
    team: "Team 1",
    speechType: "Claim",
    note: "Park: 자기결정권 사례를 짧게 제시함",
    timestamp: "2026-03-01T09:07:00",
    approved: true,
  },
]

describe("teacher insights", () => {
  it("computes speech participation levels and buckets", () => {
    const stats = computeSpeechStats(events, students)
    const buckets = buildParticipationBuckets(stats)

    expect(stats.find((item) => item.studentId === "s1")?.participationLevel).toBe("active")
    expect(stats.find((item) => item.studentId === "s2")?.participationLevel).toBe("normal")
    expect(stats.find((item) => item.studentId === "s3")?.participationLevel).toBe("none")
    expect(buckets.active).toHaveLength(1)
    expect(buckets.normal).toHaveLength(1)
    expect(buckets.none).toHaveLength(1)
  })

  it("returns recent debate session events first", () => {
    const recent = getRecentDebateEvents(
      [
        ...events,
        {
          id: "e5",
          sessionId: "sess-2",
          round: 1,
          studentId: "s2",
          studentName: "Park",
          team: "Team 1",
          speechType: "Claim",
          note: "Park: 최신 세션 발언",
          timestamp: "2026-03-02T09:00:00",
          approved: true,
        },
      ],
      [
        session,
        {
          ...session,
          id: "sess-2",
          title: "Latest Debate",
          date: "2026-03-02",
        },
      ]
    )

    expect(recent).toHaveLength(1)
    expect(recent[0].sessionId).toBe("sess-2")
  })

  it("scores evidence recommendations", () => {
    const item: EvidenceItem = {
      id: "e1",
      event: events[0],
      session,
      student: students[0],
      sortKey: 1,
    }

    const score = evidenceRecommendationScore(item)
    expect(score.recommendationScore).toBeGreaterThanOrEqual(3)
    expect(score.recommended).toBe(true)
  })

  it("generates session summary with silent students", () => {
    const summary = generateSessionSummary(events, session, students)
    expect(summary.totalSpeechCount).toBe(4)
    expect(summary.activeStudents).toBe(2)
    expect(summary.silentStudents.map((student) => student.id)).toContain("s3")
    expect(summary.majorClaims.length).toBeGreaterThan(0)
    expect(summary.teamSummaries.length).toBeGreaterThan(0)
  })

  it("builds team summaries", () => {
    const summaries = generateTeamDebateSummary(events, session)
    expect(summaries[0].majorClaims.length).toBeGreaterThan(0)
    expect(summaries[0].conceptTags.length).toBeGreaterThan(0)
  })

  it("computes student preparation status", () => {
    expect(getStudentPreparationStatus({ evidenceCount: 4, featuredEvidenceCount: 1 })).toBe("ready")
    expect(getStudentPreparationStatus({ evidenceCount: 2, featuredEvidenceCount: 0 })).toBe("needs_featured")
    expect(getStudentPreparationStatus({ evidenceCount: 1, featuredEvidenceCount: 0 })).toBe("insufficient")
  })

  it("generates student record draft", () => {
    const draft = generateStudentRecordDraft(
      [
        {
          id: "e1",
          event: events[0],
          session,
          student: students[0],
          sortKey: 1,
        },
      ],
      students[0],
      { topic: session.topic }
    )

    expect(draft.paragraph).toContain("토론 수업")
    expect(draft.keywords.length).toBeGreaterThan(0)
  })

  it("checks record similarity", () => {
    const warnings = checkRecordSimilarity([
      {
        studentId: "s1",
        paragraph: "자기결정권 정책 실효성 데이터를 비교하며 근거 중심으로 주장함",
        keywords: ["자기결정권"],
      },
      {
        studentId: "s2",
        paragraph: "자기결정권 정책 실효성 데이터를 비교하며 근거 중심으로 주장함",
        keywords: ["정책"],
      },
      {
        studentId: "s3",
        paragraph: "팀 협력과 질문을 통해 논의를 확장함",
        keywords: ["협력"],
      },
    ])

    expect(warnings.length).toBe(1)
    expect(warnings[0].studentA).toBe("s1")
    expect(warnings[0].studentB).toBe("s2")
  })
})
