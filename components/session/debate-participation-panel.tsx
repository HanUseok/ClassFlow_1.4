"use client"

import type { ParticipationBuckets, SpeechStat } from "@/lib/application/teacher-insights"

function BucketColumn({
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
            <div key={item.studentId} className="flex items-center justify-between gap-2 text-sm">
              <span className="font-medium text-foreground">{item.studentName}</span>
              <span className="text-muted-foreground">{item.speechCount}회</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        )}
      </div>
    </div>
  )
}

export function DebateParticipationPanel({ buckets }: { buckets: ParticipationBuckets }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">토론 참여 상황</h2>
        <span className="text-xs text-muted-foreground">수업 참여 편중을 빠르게 확인합니다.</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <BucketColumn title="발언 많음" tone="text-emerald-700" items={buckets.active} emptyLabel="해당 학생이 없습니다." />
        <BucketColumn title="보통" tone="text-amber-700" items={buckets.normal} emptyLabel="해당 학생이 없습니다." />
        <BucketColumn title="발언 없음" tone="text-rose-700" items={buckets.none} emptyLabel="모든 학생에게 기록이 있습니다." />
      </div>
    </section>
  )
}
