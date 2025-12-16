import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { CreditCard, DollarSign, Users, FileText } from "lucide-react"
import { StaggerChildren, AnimatedCard } from "@/lib/animations"
import { supabase } from "@/lib/supabase"
import { auth } from "@/auth"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Freelance CRM Dashboard",
}

async function getDashboardData() {
  const session = await auth()
  if (!session?.user?.email) return null

  // Get user
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", session.user.email)
    .single()

  if (!user) return null

  // Get counts and totals
  const [clientsResult, projectsResult, invoicesResult, revenueResult] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact" }).eq("user_id", user.id),
    supabase.from("projects").select("id, status, clients!inner(user_id)", { count: "exact" }).eq("clients.user_id", user.id),
    supabase.from("invoices").select("id, status, clients!inner(user_id)", { count: "exact" }).eq("clients.user_id", user.id),
    supabase.from("invoices").select("total, status, clients!inner(user_id)").eq("clients.user_id", user.id),
  ])

  const totalClients = clientsResult.count || 0
  const totalProjects = projectsResult.count || 0
  const activeProjects = projectsResult.data?.filter(p => p.status === 'active').length || 0
  const totalInvoices = invoicesResult.count || 0
  const paidInvoices = invoicesResult.data?.filter(i => i.status === 'paid').length || 0

  const totalRevenue = revenueResult.data
    ?.filter(i => i.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

  const pendingRevenue = revenueResult.data
    ?.filter(i => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

  return {
    totalClients,
    totalProjects,
    activeProjects,
    totalInvoices,
    paidInvoices,
    totalRevenue,
    pendingRevenue,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  if (!data) {
    return (
      <div className="flex-1 space-y-4 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <p>Please log in to view your dashboard.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gradient">Dashboard</h2>
      </div>
      <StaggerChildren>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnimatedCard delay={0}>
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <DollarSign className="h-24 w-24 -rotate-12 translate-x-4 -translate-y-4" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium z-10">
                  Total Revenue
                </CardTitle>
                <div className="p-2 bg-primary/20 rounded-full z-10">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="z-10 relative">
                <div className="text-2xl font-bold text-gradient">${data.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.paidInvoices} paid invoices
                </p>
              </CardContent>
            </Card>
          </AnimatedCard>
          <AnimatedCard delay={0.1}>
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Users className="h-24 w-24 -rotate-12 translate-x-4 -translate-y-4" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium z-10">
                  Clients
                </CardTitle>
                <div className="p-2 bg-blue-500/20 rounded-full z-10">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent className="z-10 relative">
                <div className="text-2xl font-bold text-gradient">{data.totalClients}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total active clients
                </p>
              </CardContent>
            </Card>
          </AnimatedCard>
          <AnimatedCard delay={0.2}>
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <CreditCard className="h-24 w-24 -rotate-12 translate-x-4 -translate-y-4" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium z-10">Projects</CardTitle>
                <div className="p-2 bg-purple-500/20 rounded-full z-10">
                  <CreditCard className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent className="z-10 relative">
                <div className="text-2xl font-bold text-gradient">{data.totalProjects}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.activeProjects} active projects
                </p>
              </CardContent>
            </Card>
          </AnimatedCard>
          <AnimatedCard delay={0.3}>
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FileText className="h-24 w-24 -rotate-12 translate-x-4 -translate-y-4" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium z-10">Pending</CardTitle>
                <div className="p-2 bg-orange-500/20 rounded-full z-10">
                  <FileText className="h-4 w-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent className="z-10 relative">
                <div className="text-2xl font-bold text-gradient">${data.pendingRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Unpaid invoices
                </p>
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>
      </StaggerChildren>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <AnimatedCard delay={0.4} className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>
        </AnimatedCard>
        <AnimatedCard delay={0.5} className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>
                Your latest invoice activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </div>
  )
}
