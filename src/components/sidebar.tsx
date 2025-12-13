"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  FileText,
  PieChart,
  Settings,
} from "lucide-react"
import { motion } from "framer-motion"

export const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clients",
    href: "/dashboard/clients",
    icon: Users,
  },
  {
    title: "Projects",
    href: "/dashboard/projects",
    icon: FolderOpen,
  },
  {
    title: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: PieChart,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2 p-2">
      {navItems.map((item, index) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={index}
            href={item.href}
            className="relative"
          >
            <span
              className={cn(
                "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 relative z-10 overflow-hidden",
                isActive 
                  ? "text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-gradient-primary z-[-1]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <Icon className={cn("mr-3 h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
              <span>{item.title}</span>
              
              {isActive && (
                 <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="ml-auto h-2 w-2 rounded-full bg-white/50 shadow-[0_0_8px_2px_rgba(255,255,255,0.5)]"
                 />
              )}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
