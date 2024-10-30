/**
 * Sidebar component for dashboard navigation
 * Provides navigation links and sign-out functionality
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SparkleIcon } from '../icons/SparkleIcon'
import { PhotoIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    {
      href: '/dashboard',
      label: 'Generate',
      icon: SparkleIcon,
      active: pathname === '/dashboard'
    },
    {
      href: '/dashboard/gallery',
      label: 'Gallery',
      icon: PhotoIcon,
      active: pathname === '/dashboard/gallery'
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: Cog6ToothIcon,
      active: pathname === '/dashboard/settings'
    }
  ]

  return (
    <aside className="w-64 border-r border-border bg-card">
      <nav className="p-4 space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              link.active 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <link.icon className="h-5 w-5" />
            <span className="font-medium">{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
} 