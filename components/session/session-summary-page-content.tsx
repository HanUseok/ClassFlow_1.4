"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useMockSessions } from "@/hooks/use-mock-sessions"
import { listDebateEvents, listStudents } from "@/lib/application/roster-service"
import { generateSessionSummary } from "@/lib/application/teacher-insights"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function SessionSummaryPageContent() {
  const params = useParams<{ id: string }>()
  const { sessions, hydrated } = useMockSessions()
  const session = sessions.find((item) => item.id === params.id)
  const students = listStudents()
  const events = listDebateEvents()

  const summary = useMemo(() => {
    if (!session || session.type !== "Debate") return null
    return generateSessionSummary(events, session, students)
  }, [events, session, students])

  if (!hydrated) {
    return <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">요약 불러오는 중...</div>
  }

  if (!session || session.type !== "Debate" || !summary) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border border-border p-6">
        <p className="text-sm text-muted-foreground">토론 세션 요약을 찾을 수 없습니다.</p>
        <Link href="/teacher/sessions" className="text-sm font-medium text-primary hover:underline">
          세션 목록으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/teacher/sessions/${session.id}`} className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground">
        <span className="inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          세션 상세로 돌아가기
        </span>
      </Link>

      <section className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground">Session Summary</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">오늘 수업 요약</h1>
        <p className="mt-1 text-sm text-muted-foreground">{session.title}</p>
        {session.topic ? <p className="mt-1 text-sm text-muted-foreground">{session.topic}</p> : null}

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">총 발언</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{summary.totalSpeechCount}회</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">참여 학생</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{summary.activeStudents}명</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">발언 없음</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{summary.silentStudents.length}명</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">주요 주장</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {summary.majorClaims.length > 0 ? (
              summary.majorClaims.map((claim) => (
                <Badge key={claim} variant="outline">
                  {claim}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">요약 가능한 주요 주장이 아직 없습니다.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">주요 개념</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {summary.conceptTags.length > 0 ? (
              summary.conceptTags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">추출된 개념 태그가 없습니다.</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">조별 토론 요약</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {summary.teamSummaries.map((team) => (
            <div key={team.teamId} className="rounded-lg border border-border p-4">
              <p className="text-sm font-semibold text-foreground">{team.teamLabel}</p>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">주요 주장</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {team.majorClaims.length > 0 ? (
                      team.majorClaims.map((item) => (
                        <Badge key={item} variant="outline">
                          {item}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">없음</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">주요 반박</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {team.majorRebuttals.length > 0 ? (
                      team.majorRebuttals.map((item) => (
                        <Badge key={item} variant="outline">
                          {item}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">없음</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">주요 개념</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {team.conceptTags.length > 0 ? (
                      team.conceptTags.map((item) => (
                        <Badge key={item} variant="secondary">
                          {item}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">없음</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">발언 참여 요약</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { label: "발언 많음", items: summary.participationStats.filter((item) => item.participationLevel === "active") },
            { label: "보통", items: summary.participationStats.filter((item) => item.participationLevel === "normal") },
            { label: "발언 없음", items: summary.participationStats.filter((item) => item.participationLevel === "none") },
          ].map((section) => (
            <div key={section.label} className="rounded-lg border border-border p-4">
              <p className="text-sm font-semibold text-foreground">{section.label}</p>
              <div className="mt-3 space-y-2">
                {section.items.length > 0 ? (
                  section.items.map((item) => (
                    <div key={item.studentId} className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium text-foreground">{item.studentName}</span>
                      <span className="text-muted-foreground">{item.speechCount}회</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">없음</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <Button asChild>
            <Link href={`/teacher/sessions/${session.id}/report`}>세션 레포트 보기</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
