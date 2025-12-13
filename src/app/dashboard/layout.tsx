import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { PageTransition } from "@/lib/animations"
import { Providers } from "@/components/providers"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <Providers session={session}>
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="fixed inset-0 bg-gradient-radial animated-bg -z-10" />
        
        {/* Grid Pattern Overlay */}
        <div className="fixed inset-0 grid-pattern opacity-30 -z-10" />
        
        {/* Main Layout */}
        <div className="flex min-h-screen w-full flex-col">
          {/* Fixed Sidebar */}
          <div className="hidden border-r border-white/10 bg-black/5 backdrop-blur-sm md:block fixed inset-y-0 left-0 z-10 w-[220px] lg:w-[280px]">
            <div className="flex h-full flex-col gap-2">
              <div className="flex h-14 items-center border-b border-white/10 px-4 lg:h-[60px] lg:px-6">
                <a href="/" className="flex items-center gap-2 font-semibold">
                  <span className="text-gradient text-xl">Freelance CRM</span>
                </a>
              </div>
              <div className="flex-1 overflow-auto">
                <div className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
                  <Sidebar />
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex flex-col md:pl-[220px] lg:pl-[280px]">
            <Navbar />
            <main className="flex flex-1 flex-col gap-4 p-4 pt-20 lg:gap-6 lg:p-6 lg:pt-8">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
          </div>
        </div>
      </div>
    </Providers>
  )
}
