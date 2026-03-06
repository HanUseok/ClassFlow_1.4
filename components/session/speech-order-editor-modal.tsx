"use client"

import { useEffect, useState } from "react"
import { GripVertical } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type TeamMember = { id: string; name: string; roleLabel: string }

export function SpeechOrderEditorModal({
  open,
  onOpenChange,
  phaseLabel,
  round,
  teamMembers,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  phaseLabel: string
  round: number
  teamMembers: TeamMember[]
  onSave: (members: TeamMember[]) => void
}) {
  const [draftMembers, setDraftMembers] = useState(teamMembers)
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null)

  useEffect(() => {
    if (open) setDraftMembers(teamMembers)
  }, [open, teamMembers])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>발언 순서 수정</DialogTitle>
          <DialogDescription>
            Round {round} · Phase: {phaseLabel}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {draftMembers.map((member, index) => (
            <div
              key={member.id}
              draggable
              onDragStart={() => setDragFromIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragFromIndex === null || dragFromIndex === index) return
                setDraftMembers((prev) => {
                  const next = [...prev]
                  const [picked] = next.splice(dragFromIndex, 1)
                  next.splice(index, 0, picked)
                  return next
                })
                setDragFromIndex(null)
              }}
              onDragEnd={() => setDragFromIndex(null)}
              className="flex cursor-grab items-center gap-3 rounded-lg border border-border px-3 py-2"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{index + 1}.</span>
              <span className="text-sm font-medium text-foreground">
                {member.roleLabel} {member.name}
              </span>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            onClick={() => {
              onSave(draftMembers)
              onOpenChange(false)
            }}
          >
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
