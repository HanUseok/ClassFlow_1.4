"use client"

import { useState } from "react"
import type { PhaseKey } from "@/lib/domain/session"
import { Button } from "@/components/ui/button"
import { GroupAdjustmentModal } from "@/components/session/group-adjustment-modal"
import { SpeechOrderEditorModal } from "@/components/session/speech-order-editor-modal"

type TeamMember = { id: string; name: string; roleLabel: string; team: "team1" | "team2" }

export function DebateGroupPanel({
  groupLabel,
  phase,
  phaseLabel,
  statusLabel,
  teamMembers,
  currentIndex,
  remainingTimeLabel,
  isSessionEnded,
  isGroupEnded,
  onMoveOrderTo,
  onSetSpeaker,
  onSetPhase,
  onPrevSpeaker,
  onNextSpeaker,
  onResumeTimer,
  onEndGroupDebate,
}: {
  groupLabel: string
  phase: PhaseKey
  phaseLabel: string
  statusLabel: string
  teamMembers: TeamMember[]
  currentIndex: number
  remainingTimeLabel: string
  isSessionEnded: boolean
  isGroupEnded: boolean
  onMoveOrderTo: (from: number, to: number) => void
  onSetSpeaker: (idx: number) => void
  onSetPhase: (phase: PhaseKey) => void
  onPrevSpeaker: () => void
  onNextSpeaker: () => void
  onResumeTimer: () => void
  onEndGroupDebate: () => void
}) {
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const currentSpeaker = teamMembers[currentIndex]

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{groupLabel}</p>
            <p className="mt-1 text-xs text-muted-foreground">현재 단계: {phaseLabel}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              현재 발언자: {currentSpeaker ? `${currentSpeaker.roleLabel} ${currentSpeaker.name}` : "-"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">남은 시간: {remainingTimeLabel}</p>
            <p className="mt-2 text-xs font-medium text-emerald-700">{statusLabel}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setAdjustOpen(true)} disabled={isSessionEnded}>
            조 조정
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onPrevSpeaker} disabled={isSessionEnded || isGroupEnded}>
            이전 발언자
          </Button>
          <Button variant="outline" size="sm" onClick={onNextSpeaker} disabled={isSessionEnded || isGroupEnded}>
            다음 발언자
          </Button>
          <Button variant="outline" size="sm" onClick={onResumeTimer} disabled={isSessionEnded || isGroupEnded}>
            타이머 재개
          </Button>
          <Button size="sm" variant="destructive" onClick={onEndGroupDebate} disabled={isSessionEnded || isGroupEnded}>
            조 토론 종료
          </Button>
        </div>
      </div>

      <GroupAdjustmentModal
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        groupLabel={groupLabel}
        currentSpeakerId={currentSpeaker?.id}
        currentPhase={phase}
        teamMembers={teamMembers}
        onOpenOrderEditor={() => setOrderOpen(true)}
        onSetSpeaker={onSetSpeaker}
        onSetPhase={onSetPhase}
      />

      <SpeechOrderEditorModal
        open={orderOpen}
        onOpenChange={setOrderOpen}
        phaseLabel={phaseLabel}
        round={1}
        teamMembers={teamMembers}
        onSave={(nextMembers) => {
          const currentIds = teamMembers.map((member) => member.id)
          nextMembers.forEach((member, nextIndex) => {
            const from = currentIds.indexOf(member.id)
            if (from !== nextIndex && from >= 0) {
              onMoveOrderTo(from, nextIndex)
            }
          })
        }}
      />
    </>
  )
}
