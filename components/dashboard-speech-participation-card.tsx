"use client"

import type { ParticipationBuckets, SpeechStat } from "@/lib/application/teacher-insights"

function ParticipationColumn({
  title,
  tone,
  items,
  emptyLabel,
}: {
  title: string
  tone: string
  items: SpeechStat[]
  emptyLabel: string
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className={`text-sm font-semibold ${tone}`}>{title}</p>
      <div className="mt-3 space-y-2">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.studentId} className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-foreground">{item.studentName}</span>
              <span className="text-muted-foreground">
                {item.speechCount > 0 ? `${item.speechCount}회` : "기록 없음"}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        )}
      </div>
    </div>
  )
}

export function DashboardSpeechParticipationCard({ buckets }: { buckets: ParticipationBuckets }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">최근 수업 참여 분석</h2>
        <span className="text-xs text-muted-foreground">최근 토론 수업 기준</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <ParticipationColumn
          title="발언 많음"
          tone="text-emerald-700"
          items={buckets.active.slice(0, 4)}
          emptyLabel="해당 학생이 없습니다."
        />
        <ParticipationColumn
          title="보통"
          tone="text-amber-700"
          items={buckets.normal.slice(0, 4)}
          emptyLabel="해당 학생이 없습니다."
        />
        <ParticipationColumn
          title="발언 없음"
          tone="text-rose-700"
          items={buckets.none.slice(0, 4)}
          emptyLabel="모든 학생에게 기록이 있습니다."
        />
      </div>
    </section>
  )
}
