import {
  Bell,
  FileBarChart,
  HardDrive,
  HelpCircle,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  /** Page title + subtitle rendered by the top bar. */
  title: string
  subtitle: string
  /** Show the active-alert count beside this item. */
  showAlertBadge?: boolean
}

export type NavSection = { heading: string; items: NavItem[] }

export const NAV_SECTIONS: NavSection[] = [
  {
    heading: 'Analytics',
    items: [
      {
        href: '/',
        label: 'Overview',
        icon: LayoutDashboard,
        title: 'Overview',
        subtitle: 'Platform cost, profit and creator health at a glance',
      },
      {
        href: '/creators',
        label: 'Creators',
        icon: Users,
        title: 'Creators',
        subtitle: 'Per-creator profit, cost and tier standing',
        showAlertBadge: true,
      },
      {
        href: '/revenue',
        label: 'Revenue & Tier',
        icon: TrendingUp,
        title: 'Revenue & Tier',
        subtitle: 'Star markup profit and creator tier commission',
      },
      {
        href: '/purchases',
        label: 'Star Purchases',
        icon: ShoppingCart,
        title: 'Star Purchases',
        subtitle: 'Completed star orders and slot performance',
      },
    ],
  },
  {
    heading: 'Operations',
    items: [
      {
        href: '/alerts',
        label: 'Alert Rules',
        icon: Bell,
        title: 'Alert Rules',
        subtitle: 'Thresholds that flag creators and infra spend',
      },
      {
        href: '/reports',
        label: 'Reports',
        icon: FileBarChart,
        title: 'Reports',
        subtitle: 'Revenue vs cost, cost mix and month-on-month compare',
      },
      {
        href: '/storage',
        label: 'Storage',
        icon: HardDrive,
        title: 'Storage',
        subtitle: 'Stored clips, cost and stale content',
      },
    ],
  },
  {
    heading: 'System',
    items: [
      {
        href: '/settings',
        label: 'Settings',
        icon: Settings,
        title: 'Settings',
        subtitle: 'Analytics exclusions and account',
      },
      {
        href: '/help',
        label: 'Help & Docs',
        icon: HelpCircle,
        title: 'Help & Docs',
        subtitle: 'How the numbers on this dashboard are calculated',
      },
    ],
  },
]

const ALL_ITEMS = NAV_SECTIONS.flatMap((section) => section.items)

/** Resolves the current pathname to its nav entry, handling dynamic subroutes. */
export function resolveNav(pathname: string): Pick<NavItem, 'title' | 'subtitle'> {
  if (pathname.startsWith('/creators/') && pathname !== '/creators') {
    return { title: 'Creator detail', subtitle: 'Cost, tier and storage for one creator' }
  }

  const exact = ALL_ITEMS.find((item) => item.href === pathname)
  if (exact) return exact

  const prefix = ALL_ITEMS.filter((item) => item.href !== '/').find((item) =>
    pathname.startsWith(item.href),
  )
  return prefix ?? { title: 'AURUM CRM', subtitle: '' }
}

export function isActiveNav(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
