"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Package2, LogOut, User, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { Sidebar } from "@/components/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react"

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  // Get the last segment of the path for the title
  const segments = pathname.split('/')
  const lastSegment = segments[segments.length - 1]
  const title = lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ') : "Dashboard"
  // Handle /dashboard case explicitly if needed, but 'dashboard' segment works.

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session?.user?.email?.[0].toUpperCase() || "U"

  return (


    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center px-4 md:px-6 pointer-events-none">
      <div className="pointer-events-auto">
        <Sheet>
            <SheetTrigger asChild>
            <Button size="icon" variant="ghost" className="sm:hidden bg-background/60 backdrop-blur-md border border-border/40 shadow-lg rounded-full h-10 w-10 hover:bg-background/80 hover:scale-105 transition-all duration-300">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
            </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <nav className="grid gap-6 text-lg font-medium">
                <Link
                href="/dashboard"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">Freelance CRM</span>
                </Link>
                <Sidebar />
            </nav>
            </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center ml-auto pointer-events-auto">
        <div className="flex items-center gap-1 p-1 bg-background/60 backdrop-blur-md border border-border/40 shadow-lg rounded-full hover:bg-background/80 hover:border-border/60 transition-all duration-300 hover:shadow-xl">
            <ModeToggle />
            <div className="w-px h-5 bg-border/50 mx-0.5" />
            
            {/* User Menu */}
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Avatar className="h-9 w-9 border border-border/50">
                    <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                    {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                    </p>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
