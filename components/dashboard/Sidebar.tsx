/**
 * Sidebar component for dashboard navigation
 * Provides navigation links and sign-out functionality
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ImageIcon, 
  Settings 
} from 'lucide-react'

const links = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    href: '/dashboard/gallery',
    label: 'Gallery',
    icon: ImageIcon
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings
  }
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="w-full">
      <div className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                relative block w-full
                flex items-center gap-3 
                min-h-[3.5rem] px-3 py-2
                rounded-lg transition-colors
                active:scale-[0.98]
                ${isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent hover:text-accent-foreground'
                }
              `}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 