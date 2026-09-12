import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveAlertCount } from '@/lib/queries/overview'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Middleware already gates this, but a Server Component must never render
  // platform finances on the strength of a header alone.
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'super_admin') redirect('/login?error=unauthorized')

  const activeAlertCount = await getActiveAlertCount().catch(() => 0)

  return (
    <div className="flex h-screen overflow-hidden bg-base">
      <Sidebar activeAlertCount={activeAlertCount} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar email={user.email ?? null} />
        <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  )
}
