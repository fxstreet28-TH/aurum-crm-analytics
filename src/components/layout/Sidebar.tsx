'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_SECTIONS, isActiveNav } from '@/lib/nav'
import { cn } from '@/lib/utils'

type Props = { activeAlertCount: number }

export function Sidebar({ activeAlertCount }: Props) {
  const pathname = usePathname()

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-surface">
      <div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-light text-sm font-bold text-white">
          A
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-ink">AURUM</div>
          <div className="text-[11px] text-ink-faint">CRM Analytics</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.heading} className="mb-5">
            <div className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
              {section.heading}
            </div>
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = isActiveNav(pathname, item.href)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                        active
                          ? 'bg-accent/15 font-medium text-accent-light'
                          : 'text-ink-dim hover:bg-hover hover:text-ink',
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.showAlertBadge && activeAlertCount > 0 && (
                        <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          {activeAlertCount}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-5 py-3 text-[11px] text-ink-faint">
        All amounts in THB · times in Bangkok (ICT)
      </div>
    </aside>
  )
}
