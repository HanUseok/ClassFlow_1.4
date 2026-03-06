"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { LiveDebateScreen } from "@/components/station/live-debate-screen"
import { QuickAddScreen } from "@/components/station/quick-add-screen"
import { DebateGroupPanel } from "@/components/session/debate-group-panel"
import { DebateParticipationPanel } from "@/components/session/debate-participation-panel"
import { DeskLayoutBoard } from "@/components/session/desk-layout-board"
import { PresentationView } from "@/components/session/presentation-view"
import { StatusBadge, TypeBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { useMockSessions } from "@/hooks/use-mock-sessions"
import { useSessionFlow } from "@/hooks/use-session-flow"
import { buildParticipationBuckets, computeSpeechStats } from "@/lib/application/teacher-insights"
import { listDebateEvents, listStudents } from "@/lib/application/roster-service"
import {
  buildDebateGroups,
  collectUniqueMembers,
  mergeGroupMembers,
  reorderSpeakers,
  type DebateGroup,
  type PhaseKey,
} from "@/lib/domain/session"
import { getPhaseLabel } from "@/lib/domain/session/view-model"

type FreeSpeechType = "질문" | "반박" | "동의" | null

export function SessionDetailPageContent() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { sessions, hydrated, setStatus, setDebateGroups } = useMockSessions()
  const session = sessions.find((item) => item.id === params.id)
  const debateEvents = listDebateEvents()
  const {
    getGroupState,
    resetGroup,
    setGroupSpeakerIndex,
    setGroupPhase,
    setSpeechRunning,
    handleEndSpeech,
    goPrev,
    goNext,
    isDebateFinished,
  } = useSessionFlow()

  const [viewMode, setViewMode] = useState<"progress" | "manage">("manage")
  const [placementCollapsed, setPlacementCollapsed] = useState(true)
  const [placementCollapsing, setPlacementCollapsing] = useState(false)
  const [autoDoneGroupCount, setAutoDoneGroupCount] = useState(0)
  const [groupEndedByTeacher, setGroupEndedByTeacher] = useState<Record<string, boolean>>({})
  const [freeSpeechTypeByGroup, setFreeSpeechTypeByGroup] = useState<Record<string, FreeSpeechType>>({})

  const debateGroups = useMemo(() => {
    if (!session || session.type !== "Debate") return [] as DebateGroup[]

    const storedGroups = session.debate?.groups ?? []
    const configuredGroupCount = session.debate?.assignmentConfig?.groupCount ?? 0
    const targetCount = Math.max(1, configuredGroupCount, storedGroups.length || 0)
    const fallbackGroups = buildDebateGroups(session, targetCount)

    return Array.from({ length: targetCount }, (_, index) => {
      const found = storedGroups[index]
      if (found && (found.affirmative.length > 0 || found.negative.length > 0 || found.moderator)) {
        return found
      }
      return fallbackGroups[index]
    })
  }, [session])

  const isTeacherGuided = session?.type === "Debate" && session.debate?.teacherGuided === true
  const isDebatePending = session?.type === "Debate" && session.status === "Pending"
  const debateMode = session?.type === "Debate" ? session.debate?.mode ?? "Ordered" : "Ordered"

  useEffect(() => {
    if (!session || session.type !== "Debate") return
    setViewMode(session.debate?.teacherGuided === true && session.status === "Live" ? "progress" : "manage")
    debateGroups.forEach((group) => resetGroup(group.id))
    setGroupEndedByTeacher({})
    setFreeSpeechTypeByGroup({})
  }, [session?.id, session?.status, session?.type, session?.debate?.teacherGuided, debateGroups, resetGroup])

  useEffect(() => {
    if (!session || session.type !== "Debate") return
    if (session.status !== "Ended") return
    router.replace(`/teacher/sessions/${session.id}/summary`)
  }, [router, session])

  useEffect(() => {
    if (!session || session.type !== "Debate") return
    if (!isTeacherGuided || viewMode !== "progress") return

    const firstGroup = debateGroups[0]
    if (!firstGroup) return
    const alreadyFilled = firstGroup.affirmative.length > 0 || firstGroup.negative.length > 0
    if (alreadyFilled) return

    const roster = listStudents().filter((student) => student.classId === session.classId)
    const fallbackTeamPool = [...(session.teams?.team1 ?? []), ...(session.teams?.team2 ?? [])]
    const selectedIds = session.debate?.assignmentConfig?.selectedStudentIds ?? []
    const source = selectedIds.length > 0 ? roster.filter((student) => selectedIds.includes(student.id)) : roster
    const picked = (source.length > 0 ? source : fallbackTeamPool).slice(0, 4)
    if (picked.length === 0) return

    const nextGroups = [...debateGroups]
    nextGroups[0] = {
      ...firstGroup,
      affirmative: picked.filter((_, idx) => idx % 2 === 0),
      negative: picked.filter((_, idx) => idx % 2 === 1),
      moderator: firstGroup.moderator,
    }
    setDebateGroups(session.id, nextGroups)
  }, [session, isTeacherGuided, viewMode, debateGroups, setDebateGroups])

  useEffect(() => {
    setPlacementCollapsed(true)
    setPlacementCollapsing(false)
    setAutoDoneGroupCount(0)
  }, [session?.id, session?.status])

  const deskPlacementGroups = useMemo(() => {
    if (!isTeacherGuided) return debateGroups
    return debateGroups.slice(0, 1)
  }, [debateGroups, isTeacherGuided])

  const canStartWithDeskLayout = useMemo(() => {
    if (!session || session.type !== "Debate") return false
    return deskPlacementGroups.every((group) => group.affirmative.length > 0 && group.negative.length > 0)
  }, [session, deskPlacementGroups])

  const placementCandidates = useMemo(() => {
    if (!session || session.type !== "Debate") return []
    return listStudents().filter((student) => student.classId === session.classId)
  }, [session])

  const unassignedPlacementStudents = useMemo(() => {
    const assigned = new Set(
      deskPlacementGroups.flatMap((group) => [
        ...group.affirmative.map((student) => student.id),
        ...group.negative.map((student) => student.id),
        ...(group.moderator ? [group.moderator.id] : []),
      ])
    )
    return placementCandidates.filter((student) => !assigned.has(student.id))
  }, [deskPlacementGroups, placementCandidates])

  const placementSeatConfig = useMemo(() => {
    const cfg = session?.debate?.assignmentConfig
    if (!cfg) {
      return deskPlacementGroups.map((group) => ({
        affirmative: Math.max(1, group.affirmative.length),
        negative: Math.max(1, group.negative.length),
        moderator: Math.max(0, group.moderator ? 1 : 0),
      }))
    }

    const adjust = cfg.groupSlotAdjust ?? {}
    return deskPlacementGroups.map((group, index) => {
      const gid = `group-${index + 1}`
      const delta = adjust[gid] ?? { affirmative: 0, negative: 0, moderator: 0 }
      return {
        affirmative: Math.max(1, cfg.affirmativeSlots + delta.affirmative),
        negative: Math.max(1, cfg.negativeSlots + delta.negative),
        moderator: Math.max(0, cfg.moderatorSlots + delta.moderator),
      }
    })
  }, [session?.debate?.assignmentConfig, deskPlacementGroups])

  const placementStatus = useMemo(() => {
    const cfg = session?.debate?.assignmentConfig
    const adjust = cfg?.groupSlotAdjust ?? {}

    return debateGroups.map((group, index) => {
      const gid = `group-${index + 1}`
      const delta = adjust[gid] ?? { affirmative: 0, negative: 0, moderator: 0 }
      const requiredAff = Math.max(0, (cfg?.affirmativeSlots ?? 0) + delta.affirmative)
      const requiredNeg = Math.max(0, (cfg?.negativeSlots ?? 0) + delta.negative)
      const requiredMod = Math.max(0, (cfg?.moderatorSlots ?? 0) + delta.moderator)
      const requiredTotal = requiredAff + requiredNeg + requiredMod
      const placedTotal = group.affirmative.length + group.negative.length + (group.moderator ? 1 : 0)

      return {
        groupId: group.id,
        label: `${index + 1}조`,
        placedTotal,
        requiredTotal,
        done: requiredTotal === 0 ? placedTotal > 0 : placedTotal >= requiredTotal,
      }
    })
  }, [session?.debate?.assignmentConfig, debateGroups])

  useEffect(() => {
    if (!placementCollapsed) return
    if (placementStatus.length === 0) {
      setAutoDoneGroupCount(0)
      return
    }

    setAutoDoneGroupCount(1)
    const timers: number[] = []
    for (let i = 1; i < placementStatus.length; i += 1) {
      const timer = window.setTimeout(() => {
        setAutoDoneGroupCount((prev) => Math.max(prev, i + 1))
      }, i * 550)
      timers.push(timer)
    }

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [placementCollapsed, placementStatus.length])

  const updateGroup = (groupIndex: number, updater: (group: DebateGroup) => DebateGroup) => {
    if (!session || session.type !== "Debate") return
    const next = [...debateGroups]
    next[groupIndex] = updater(next[groupIndex])
    setDebateGroups(session.id, next)
  }

  const finishSessionAndOpenSummary = () => {
    if (!session) return
    setStatus(session.id, "Ended")
    router.push(`/teacher/sessions/${session.id}/summary`)
  }

  const sessionEventStats = useMemo(() => {
    if (!session || session.type !== "Debate") return []
    const sessionEvents = debateEvents.filter((event) => event.sessionId === session.id)
    const participants = collectUniqueMembers(debateGroups).map((member) => ({
      id: member.id,
      name: member.name,
      classId: session.classId,
      className: session.className,
    }))
    return computeSpeechStats(sessionEvents, participants)
  }, [debateEvents, debateGroups, session])

  const participationBuckets = useMemo(
    () => buildParticipationBuckets(sessionEventStats),
    [sessionEventStats]
  )

  const renderTeacherGuidedProgressView = () => {
    if (!session || session.type !== "Debate") return null

    const group = debateGroups[0]
    if (!group) {
      return <p className="text-sm text-muted-foreground">1조 데이터가 없습니다.</p>
    }

    const mergedTeamMembers = mergeGroupMembers(group)
    const fallbackSeed = [...(session.teams?.team1 ?? []), ...(session.teams?.team2 ?? []), ...listStudents()]
    const dedupedFallbackSeed = Array.from(new Map(fallbackSeed.map((student) => [student.id, student])).values())
    const fallbackTeamMembers = dedupedFallbackSeed.slice(0, 4).map((student, idx) => ({
      id: student.id,
      name: student.name,
      roleLabel: idx % 2 === 0 ? `찬성 ${Math.floor(idx / 2) + 1}` : `반대 ${Math.floor(idx / 2) + 1}`,
      team: idx % 2 === 0 ? "team1" : "team2",
    }))
    const teamMembers = mergedTeamMembers.length > 0 ? mergedTeamMembers : fallbackTeamMembers
    const groupState = getGroupState(group.id)
    const currentIndex = Math.min(groupState.currentSpeakerIndex, Math.max(0, teamMembers.length - 1))
    const freeSpeechType = freeSpeechTypeByGroup[group.id] ?? null
    const recordingIds = session.debate?.assignmentConfig?.recordingStudentIds ?? []
    const hasAnyNonRecordingMemberInGroup =
      recordingIds.length > 0 && teamMembers.some((member) => !recordingIds.includes(member.id))

    const finishCurrentGroup = () => {
      setGroupEndedByTeacher((prev) => ({ ...prev, [group.id]: true }))
      setSpeechRunning(group.id, false)
      setViewMode("manage")
    }

    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-3">
          <LiveDebateScreen
            round={1}
            phase={groupState.phase}
            durationSeconds={120}
            isSpeechRunning={groupState.isSpeechRunning}
            debateMode={debateMode}
            teamMembers={teamMembers}
            currentSpeakerIndex={currentIndex}
            freeSpeechType={debateMode === "Free" ? freeSpeechType : null}
            onFreeSpeechTypeChange={
              debateMode === "Free"
                ? (value) => {
                    setFreeSpeechTypeByGroup((prev) => ({ ...prev, [group.id]: value }))
                  }
                : undefined
            }
            onEndDebate={finishCurrentGroup}
            endDebateLabel="조 토론 종료"
            onSelectSpeaker={(idx) => setGroupSpeakerIndex(group.id, idx)}
            onPhaseChange={(next) => setGroupPhase(group.id, next as PhaseKey)}
            onMoveOrderTo={(from, to) => {
              updateGroup(0, (prev) => reorderSpeakers(prev, from, to))
              const current = getGroupState(group.id).currentSpeakerIndex
              if (current === from) setGroupSpeakerIndex(group.id, to)
              else if (current === to) setGroupSpeakerIndex(group.id, from)
            }}
          />

          <QuickAddScreen
            round={1}
            phase={groupState.phase}
            durationSeconds={120}
            recordLimitPerRound={6}
            debateMode={debateMode}
            sessionId={session.id}
            teacherGuided={isTeacherGuided}
            sessionTitle={session.title}
            sessionStatus={session.status}
            groupCount={Math.max(1, debateGroups.length)}
            groupLayout={JSON.stringify(
              debateGroups.map((debateGroup) => ({
                affirmative: debateGroup.affirmative.map((student) => student.name),
                negative: debateGroup.negative.map((student) => student.name),
              }))
            )}
            argumentCards={session.debate?.argumentCards}
            teamMembers={teamMembers}
            currentSpeaker={teamMembers[currentIndex]}
            onStartSpeech={() => {
              setSpeechRunning(group.id, true)
              setGroupEndedByTeacher((prev) => ({ ...prev, [group.id]: false }))
              if (session.status !== "Live") setStatus(session.id, "Live")
            }}
            onEndSpeech={() => {
              handleEndSpeech(group.id, teamMembers.length, debateMode)
            }}
            debateFinished={isDebateFinished(group.id, teamMembers.length, debateMode)}
            completedDebateLabel="조 토론 종료"
            onCompleteDebate={finishCurrentGroup}
            compact
            showCards={hasAnyNonRecordingMemberInGroup}
            speechType={debateMode === "Free" ? freeSpeechType : null}
            onSpeechTypeChange={
              debateMode === "Free"
                ? (value) => {
                    setFreeSpeechTypeByGroup((prev) => ({ ...prev, [group.id]: value }))
                  }
                : undefined
            }
          />
        </div>
      </div>
    )
  }

  if (!hydrated) {
    return <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">세션 불러오는 중...</div>
  }

  if (!session) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border border-border p-6">
        <p className="text-sm text-muted-foreground">세션을 찾을 수 없습니다.</p>
        <Link href="/teacher/sessions" className="text-sm font-medium text-primary hover:underline">
          세션 목록으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link href="/teacher/sessions" className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground">
          <span className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            세션 목록으로 돌아가기
          </span>
        </Link>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-foreground">{session.title}</h1>
            {session.topic ? <p className="text-sm text-muted-foreground">{session.topic}</p> : null}
          </div>

          {session.type === "Debate" ? (
            <div className="flex flex-wrap items-center gap-2">
              {isTeacherGuided && session.status !== "Ended" ? (
                <div className="flex items-center gap-1 rounded-md border border-border p-1">
                  <Button
                    size="sm"
                    variant={viewMode === "progress" ? "default" : "ghost"}
                    onClick={() => setViewMode("progress")}
                    disabled={session.status !== "Live"}
                  >
                    진행 화면
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "manage" ? "default" : "ghost"}
                    onClick={() => setViewMode("manage")}
                  >
                    관리 화면
                  </Button>
                </div>
              ) : null}
              <TypeBadge type={session.type} />
              <StatusBadge status={session.status} />
              {session.status === "Live" ? (
                <Button size="sm" variant="destructive" onClick={finishSessionAndOpenSummary}>
                  세션 종료
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {session.type === "Debate" ? (
        isTeacherGuided && viewMode === "progress" && session.status === "Live" ? (
          renderTeacherGuidedProgressView()
        ) : (
          <>
            {isDebatePending ? (
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">세션 대기 상태</p>
                    <p className="text-xs text-muted-foreground">
                      {isTeacherGuided
                        ? "1조 배치를 완료하면 진행 화면으로 전환됩니다."
                        : "조 배치 없이 세션 시작 대기 상태입니다."}
                    </p>
                  </div>
                  {isTeacherGuided && !placementCollapsed ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!canStartWithDeskLayout) return
                        setPlacementCollapsing(true)
                        window.setTimeout(() => {
                          setPlacementCollapsed(true)
                          setPlacementCollapsing(false)
                        }, 220)
                      }}
                      disabled={!canStartWithDeskLayout}
                    >
                      1조 배치 완료
                    </Button>
                  ) : null}
                </div>

                {isTeacherGuided && !placementCollapsed ? (
                  <div className={`transition-all duration-200 ${placementCollapsing ? "scale-[0.97] opacity-70" : "scale-100 opacity-100"}`}>
                    <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
                      <DeskLayoutBoard
                        groups={deskPlacementGroups}
                        poolStudents={unassignedPlacementStudents}
                        seatConfigByGroup={placementSeatConfig}
                        onChange={(nextGroups) => {
                          const merged = [...debateGroups]
                          if (nextGroups[0]) merged[0] = nextGroups[0]
                          setDebateGroups(session.id, merged)
                        }}
                      />

                      <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/60 p-3">
                        <p className="mb-2 text-sm font-semibold text-amber-800">
                          미배치 인원 ({unassignedPlacementStudents.length}명)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {unassignedPlacementStudents.length > 0 ? (
                            unassignedPlacementStudents.map((student) => (
                              <button
                                key={student.id}
                                type="button"
                                draggable
                                onDragStart={(event) => {
                                  event.dataTransfer.setData(
                                    "application/json",
                                    JSON.stringify({ kind: "pool", studentId: student.id })
                                  )
                                }}
                                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs"
                              >
                                {student.name}
                              </button>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">미배치 인원이 없습니다.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(isTeacherGuided
                        ? placementStatus
                        : debateGroups.map((group, index) => ({
                            groupId: group.id,
                            label: `${index + 1}조`,
                            placedTotal: group.affirmative.length + group.negative.length + (group.moderator ? 1 : 0),
                            requiredTotal: group.affirmative.length + group.negative.length + (group.moderator ? 1 : 0),
                            done: true,
                          }))
                      ).map((status, index) => {
                        const done = isTeacherGuided ? index < autoDoneGroupCount : true
                        return (
                          <div
                            key={status.groupId}
                            className={`flex min-h-[220px] flex-col justify-between rounded-lg px-3 py-2 ${
                              done ? "border border-emerald-200 bg-emerald-50" : "border border-border"
                            }`}
                          >
                            <div>
                              <p className="text-sm font-medium text-foreground">{status.label} 배치 상태</p>
                              <p className="text-xs text-muted-foreground">
                                {status.placedTotal}/{status.requiredTotal} 배치
                              </p>
                            </div>
                            <p className={`text-xs font-semibold ${done ? "text-emerald-600" : "text-amber-600"}`}>
                              {done ? "완료" : "진행 중"}
                            </p>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/teacher/sessions/create?sessionId=${session.id}&type=debate`)}
                      >
                        세션 설정으로 가기
                      </Button>
                      <Button
                        size="sm"
                        disabled={
                          isTeacherGuided
                            ? autoDoneGroupCount < placementStatus.length || placementStatus.length === 0
                            : debateGroups.length === 0
                        }
                        onClick={() => {
                          setStatus(session.id, "Live")
                          setViewMode(isTeacherGuided ? "progress" : "manage")
                        }}
                      >
                        세션 시작
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {isDebatePending ? null : (
              <div className="flex flex-col gap-4">
                <DebateParticipationPanel buckets={participationBuckets} />

                <div className="grid gap-3 sm:grid-cols-2">
                  {debateGroups.map((group, groupIndex) => {
                    const teamMembers = mergeGroupMembers(group)
                    const groupState = getGroupState(group.id)
                    const currentIndex = Math.min(groupState.currentSpeakerIndex, Math.max(0, teamMembers.length - 1))
                    const isGroupEnded = Boolean(groupEndedByTeacher[group.id])
                    const statusLabel = isGroupEnded
                      ? "조 종료"
                      : groupState.isSpeechRunning
                        ? "발언 중"
                        : "대기 중"

                    return (
                      <DebateGroupPanel
                        key={group.id}
                        groupLabel={`${groupIndex + 1}조`}
                        phase={groupState.phase}
                        phaseLabel={getPhaseLabel(groupState.phase)}
                        statusLabel={statusLabel}
                        teamMembers={teamMembers}
                        currentIndex={currentIndex}
                        remainingTimeLabel="2:00"
                        isSessionEnded={session.status === "Ended"}
                        isGroupEnded={isGroupEnded}
                        onMoveOrderTo={(from, to) => {
                          updateGroup(groupIndex, (prev) => reorderSpeakers(prev, from, to))
                          const current = getGroupState(group.id).currentSpeakerIndex
                          if (current === from) setGroupSpeakerIndex(group.id, to)
                          else if (current === to) setGroupSpeakerIndex(group.id, from)
                        }}
                        onSetSpeaker={(idx) => setGroupSpeakerIndex(group.id, idx)}
                        onSetPhase={(phase) => setGroupPhase(group.id, phase)}
                        onPrevSpeaker={() => {
                          if (isGroupEnded) return
                          goPrev(group.id, teamMembers.length)
                        }}
                        onNextSpeaker={() => {
                          if (isGroupEnded) return
                          goNext(group.id, teamMembers.length)
                        }}
                        onResumeTimer={() => {
                          if (isGroupEnded) return
                          setSpeechRunning(group.id, true)
                        }}
                        onEndGroupDebate={() => {
                          setGroupEndedByTeacher((prev) => ({ ...prev, [group.id]: true }))
                          setSpeechRunning(group.id, false)
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )
      ) : (
        <PresentationView
          session={session}
          onStart={() => setStatus(session.id, "Live")}
          onEnd={() => setStatus(session.id, "Ended")}
        />
      )}
    </div>
  )
}
