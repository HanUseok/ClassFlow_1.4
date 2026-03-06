"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useMockSessions } from "@/hooks/use-mock-sessions"
import { collectUniqueMembers } from "@/lib/domain/session"
import { listDebateEvents } from "@/lib/application/roster-service"
import { generateTeamDebateSummary } from "@/lib/application/teacher-insights"
import { ProfileReportView, type ProfileReportProfile } from "@/components/report/profile-report-view"
import { Badge } from "@/components/ui/badge"

const ORDERED_PHASES = ["입론", "반론", "재반론", "마무리"] as const
const FREE_COLUMNS = 4

const ARGUMENT_FALLBACKS = [
  "1) 뇌 발달/중독 메커니즘",
  "2) 학습권/집중력 저하",
  "3) 수면권/건강권",
  "4) 자기결정권/자율성",
  "5) 실효성/우회 가능성",
  "6) 규제보다 미디어 교육",
  "9) 규제보다 미디어 교육",
  "10) 단계적·조건부 제한",
]

const THINKING_FALLBACKS = ["적용", "인과 설명", "비교", "한계 지적", "반례 제시", "전제 분석", "자료 보완", "입장 수정"]

function buildKeyword(argument: string, thinking: string) {
  const normalizedArgument = argument.replace(/^\d+\)\s*/, "")
  return `${normalizedArgument}, ${thinking}`
}

export function SessionReportPageContent() {
  const params = useParams<{ id: string }>()
  const { sessions, hydrated } = useMockSessions()
  const session = sessions.find((item) => item.id === params.id)
  const debateEvents = listDebateEvents()

  const groups = session?.debate?.groups ?? []
  const members = useMemo(() => {
    if (!session || session.type !== "Debate") return []
    return collectUniqueMembers(groups)
  }, [session, groups])

  const isFreeMode = session?.type === "Debate" && (session.debate?.mode ?? "Ordered") === "Free"
  const teamSummaries = useMemo(() => {
    if (!session || session.type !== "Debate") return []
    const sessionEvents = debateEvents.filter((event) => event.sessionId === session.id)
    return generateTeamDebateSummary(sessionEvents, session)
  }, [debateEvents, session])

  const profiles = useMemo<ProfileReportProfile[]>(() => {
    return members.map((member, memberIndex) => {
      if (isFreeMode) {
        return {
          id: member.id,
          name: member.name,
          subtitle: member.roleLabel,
          summary: "자유 토론 레포트",
          sections: Array.from({ length: FREE_COLUMNS }, (_, cellIndex) => {
            const argument = ARGUMENT_FALLBACKS[(memberIndex + cellIndex) % ARGUMENT_FALLBACKS.length]
            const thinking = THINKING_FALLBACKS[(memberIndex + cellIndex) % THINKING_FALLBACKS.length]
            return {
              title: `매핑 ${cellIndex + 1}`,
              items: [
                { label: "논거", value: argument },
                { label: "사고", value: thinking },
                { label: "키워드", value: buildKeyword(argument, thinking) },
              ],
            }
          }),
        }
      }

      return {
        id: member.id,
        name: member.name,
        subtitle: member.roleLabel,
        summary: "순서 토론 레포트",
        sections: ORDERED_PHASES.map((phase, phaseIndex) => {
          const argument = ARGUMENT_FALLBACKS[(memberIndex + phaseIndex) % ARGUMENT_FALLBACKS.length]
          const thinking = THINKING_FALLBACKS[(memberIndex + phaseIndex) % THINKING_FALLBACKS.length]
          return {
            title: phase,
            items: [
              { label: "논거", value: argument },
              { label: "사고", value: thinking },
              { label: "키워드", value: buildKeyword(argument, thinking) },
            ],
          }
        }),
      }
    })
  }, [isFreeMode, members])

  if (!hydrated) {
    return <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">리포트 불러오는 중...</div>
  }

  if (!session || session.type !== "Debate") {
    return (
      <div className="flex flex-col gap-4 rounded-lg border border-border p-6">
        <p className="text-sm text-muted-foreground">토론 세션 리포트를 찾을 수 없습니다.</p>
        <Link href="/teacher/sessions" className="text-sm font-medium text-primary hover:underline">
          세션 목록으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link href="/teacher/sessions" className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground">
          <span className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            세션 목록으로 돌아가기
          </span>
        </Link>
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground">교사용 세션 리포트</p>
          <h1 className="text-2xl font-bold text-foreground">{session.title}</h1>
          {session.topic ? <p className="mt-1 text-sm text-muted-foreground">{session.topic}</p> : null}
        </div>
      </div>

      {teamSummaries.length > 0 ? (
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">Team Debate Summary</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {teamSummaries.map((team) => (
              <div key={team.teamId} className="rounded-lg border border-border p-4">
                <p className="text-sm font-semibold text-foreground">{team.teamLabel} 토론 요약</p>
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">주요 주장</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {team.majorClaims.length > 0 ? team.majorClaims.map((item) => <Badge key={item} variant="outline">{item}</Badge>) : <span className="text-sm text-muted-foreground">없음</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">주요 반박</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {team.majorRebuttals.length > 0 ? team.majorRebuttals.map((item) => <Badge key={item} variant="outline">{item}</Badge>) : <span className="text-sm text-muted-foreground">없음</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">주요 개념</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {team.conceptTags.length > 0 ? team.conceptTags.map((item) => <Badge key={item} variant="secondary">{item}</Badge>) : <span className="text-sm text-muted-foreground">없음</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <ProfileReportView profiles={profiles} emptyMessage="리포트 대상 학생 정보가 없습니다." />
    </div>
  )
}
