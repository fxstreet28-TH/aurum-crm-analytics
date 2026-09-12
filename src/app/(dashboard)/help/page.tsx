import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { TIERS } from '@/lib/constants'

export const metadata = { title: 'Help & Docs · AURUM CRM' }

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Help & Docs"
        description="How every number on this dashboard is calculated."
      />

      <Card>
        <CardHeader>
          <CardTitle>Where revenue comes from</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-ink-dim">
          <p>
            <strong className="text-ink">Star markup</strong> is what a buyer paid minus the
            internal value of the stars they received — the retail and internal prices both
            come from <code className="text-accent-light">star_pricing_config</code>.
            Admin-credited grants (฿ 0 paid) are recorded but never counted as revenue.
          </p>
          <p>
            <strong className="text-ink">Tier commission</strong> is the platform&apos;s share
            of the stars a creator received as gifts this month. The share depends on the
            creator&apos;s tier, which is recalculated from their month-to-date star total.
          </p>
          <p>
            <strong className="text-ink">Net profit</strong> is markup plus commission, minus
            the month&apos;s infra spend recorded in{' '}
            <code className="text-accent-light">platform_budget_state</code>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tier ladder</CardTitle>
          <CardDescription>Based on stars received in the Bangkok calendar month</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2 text-sm">
            {TIERS.map((tier) => (
              <li
                key={tier.tier}
                className="flex items-center justify-between rounded-lg border border-line bg-surface px-3 py-2"
              >
                <span className="text-ink">
                  {tier.label} · {tier.min.toLocaleString()}
                  {tier.max ? `–${tier.max.toLocaleString()}` : '+'} stars
                </span>
                <span className="text-ink-dim">
                  platform {(tier.platformPct * 100).toFixed(0)}% · creator{' '}
                  {((1 - tier.platformPct) * 100).toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How cost is estimated</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-ink-dim">
          <p>
            <strong className="text-ink">Live</strong> uses the per-session{' '}
            <code className="text-accent-light">estimated_cost_thb</code> already written by
            the streaming pipeline.
          </p>
          <p>
            <strong className="text-ink">Storage</strong> is ฿ 0.50 per GB per month applied
            to every clip with a ready video. It is a standing charge, so it is not scoped to
            the selected month.
          </p>
          <p>
            <strong className="text-ink">Playback</strong> is ฿ 0.003 per recorded view.
            Because <code className="text-accent-light">feed_posts</code> stores only a
            running total, playback cost cannot be split by day precisely — the daily trend
            attributes it to each clip&apos;s publish date.
          </p>
          <p>
            <strong className="text-ink">Chat</strong> is ฿ 0 — Supabase Realtime is within
            its free tier at current volume.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Excluded creators</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-ink-dim">
          <p>
            Creators flagged{' '}
            <code className="text-accent-light">excluded_from_analytics</code> are filtered
            out inside the database functions themselves, not in the UI — so no page, export
            or future caller can accidentally let test data into production metrics. Manage
            the list on the Settings page.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
