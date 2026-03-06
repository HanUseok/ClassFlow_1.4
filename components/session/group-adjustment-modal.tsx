"use client"

import type { PhaseKey } from "@/lib/domain/session"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type TeamMember = {
  id: string
  name: string
  roleLabel: string
}

const PHASE_OPTIONS: Array<{ key: PhaseKey; label: string }> = [
  { key: "Opening", label: "입론" },
  { key: "Rebuttal", label: "반론" },
  { key: "Rerebuttal", label: "재반론" },
  { key: "FinalSummary", label: "마무리" },
]

export function GroupAdjustmentModal({
  open,
  onOpenChange,
  groupLabel,
  currentSpeakerId,
  currentPhase,
  teamMembers,
  onOpenOrderEditor,
  onSetSpeaker,
  onSetPhase,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupLabel: string
  currentSpeakerId?: string
  currentPhase: PhaseKey
  teamMembers: TeamMember[]
  onOpenOrderEditor: () => void
  onSetSpeaker: (index: number) => void
  onSetPhase: (phase: PhaseKey) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{groupLabel} 조 조정</DialogTitle>
          <DialogDescription>실행이 아닌 구조 수정만 이 화면에서 처리합니다.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <p className="text-sm font-medium text-foreground">발언 순서</p>
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                onOpenOrderEditor()
              }}
            >
              발언 순서 수정
            </Button>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-medium text-foreground">발언자 강제 변경</p>
            <div className="grid gap-2">
              {teamMembers.map((member, index) => (
                <Button
                  key={member.id}
                  variant={currentSpeakerId === member.id ? "default" : "outline"}
                  onClick={() => onSetSpeaker(index)}
                >
                  {member.roleLabel} {member.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-medium text-foreground">단계 강제 변경</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {PHASE_OPTIONS.map((phase) => (
                <Button
                  key={phase.key}
                  variant={currentPhase === phase.key ? "default" : "outline"}
                  onClick={() => onSetPhase(phase.key)}
                >
                  {phase.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
