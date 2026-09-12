import { KeyRound, ShieldAlert, UserCog } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { listAllCreatorsForSettings } from '@/lib/queries/creators'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ExclusionToggle } from '@/components/dashboard/ExclusionToggle'
import { CreatorName } from '@/components/shared/CreatorName'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const creators = await listAllCreatorsForSettings()
  const excluded = creators.filter((c) => c.excluded)
  const included = creators.filter((c) => !c.excluded)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Control which creators count towards platform analytics."
      />

      <Card className="border-warning/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-warning" />
            Excluded from analytics
          </CardTitle>
          <CardDescription>
            These creators are left out of every KPI, chart, leaderboard and export. Turning
            one back on recomputes the whole dashboard immediately.
          </CardDescription>
        </CardHeader>

        {excluded.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creator</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Excluded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {excluded.map((creator) => (
                <TableRow key={creator.id}>
                  <TableCell>
                    <CreatorName
                      handle={creator.handle}
                      displayName={creator.displayName}
                      creatorId={creator.id}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="text-ink-dim">{creator.email ?? '—'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <ExclusionToggle
                        creatorId={creator.id}
                        excluded
                        label=""
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="Nothing excluded"
            description="Every creator currently counts towards platform analytics."
          />
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add to exclusion list</CardTitle>
          <CardDescription>
            Exclude test or internal accounts so they cannot inflate production metrics.
          </CardDescription>
        </CardHeader>

        {included.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creator</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Exclude</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {included.map((creator) => (
                <TableRow key={creator.id}>
                  <TableCell>
                    <CreatorName
                      handle={creator.handle}
                      displayName={creator.displayName}
                      creatorId={creator.id}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="text-ink-dim">{creator.email ?? '—'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <ExclusionToggle
                        creatorId={creator.id}
                        excluded={false}
                        label=""
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No creators available"
            description="Every creator is already excluded from analytics."
          />
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="size-4" />
              Account
            </CardTitle>
            <CardDescription>The signed-in operator</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-faint">Email</span>
              <span className="text-ink">{user?.email ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-faint">Role</span>
              <Badge variant="accent">super_admin</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-4" />
              Coming later
            </CardTitle>
            <CardDescription>Planned, not built in this change</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-xs text-ink-dim">
              <li>· Notification preferences (Telegram / email routing per severity)</li>
              <li>· API keys for exporting these metrics elsewhere</li>
              <li>· Additional admin accounts beyond the platform owner</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
