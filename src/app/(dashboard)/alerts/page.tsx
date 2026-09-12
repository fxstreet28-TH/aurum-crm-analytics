import { Suspense } from 'react'
import { listAlertEvents, listAlertRules } from '@/lib/queries/alerts'
import { AlertRuleCard } from '@/components/dashboard/AlertRuleCard'
import { AlertHistoryTable } from '@/components/dashboard/AlertHistoryTable'
import { NewRuleDialog } from '@/components/dashboard/NewRuleDialog'
import { PageHeader } from '@/components/shared/PageHeader'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ status?: string }> }

export default async function AlertsPage({ searchParams }: Props) {
  const { status } = await searchParams
  const statusFilter =
    status === 'active' || status === 'watch' || status === 'resolved' ? status : undefined

  const [rules, events] = await Promise.all([
    listAlertRules(),
    listAlertEvents(statusFilter),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Alert Rules"
        description="Thresholds that flag creators and infra spend. Delivery runs in a follow-up change."
        actions={<NewRuleDialog />}
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {rules.map((rule) => (
          <AlertRuleCard key={rule.id} rule={rule} />
        ))}
      </section>

      <Suspense fallback={null}>
        <AlertHistoryTable events={events} status={statusFilter ?? ''} />
      </Suspense>
    </div>
  )
}
