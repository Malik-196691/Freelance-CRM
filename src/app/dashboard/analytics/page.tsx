import { getAnalytics } from "@/app/dashboard/analytics/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueChart, ProjectStatusChart } from "@/components/analytics/charts"
import { DollarSign, Users, Briefcase, FileText, TrendingUp, TrendingDown } from "lucide-react"

export default async function AnalyticsPage() {
  const analytics = await getAnalytics()

  if (!analytics) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">No data available.</p>
      </div>
    )
  }

  const stats = [
    {
      title: "Total Clients",
      value: analytics.totalClients,
      icon: Users,
      description: "Active clients",
    },
    {
      title: "Total Projects",
      value: analytics.totalProjects,
      icon: Briefcase,
      description: `${analytics.projectsByStatus.active} active`,
    },
    {
      title: "Total Invoices",
      value: analytics.totalInvoices,
      icon: FileText,
      description: `${analytics.invoicesByStatus.paid} paid`,
    },
    {
      title: "Total Revenue",
      value: `$${analytics.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: `$${analytics.paidRevenue.toFixed(2)} received`,
    },
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${analytics.paidRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.invoicesByStatus.paid} paid invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${analytics.pendingRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.invoicesByStatus.sent + analytics.invoicesByStatus.draft + analytics.invoicesByStatus.overdue} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalProjects > 0
                ? Math.round((analytics.projectsByStatus.completed / analytics.totalProjects) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.projectsByStatus.completed} of {analytics.totalProjects} projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RevenueChart data={analytics.revenueByMonth} />
        <ProjectStatusChart data={analytics.projectsByStatus} />
      </div>

      {/* Invoice Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Draft</p>
              <p className="text-2xl font-bold">{analytics.invoicesByStatus.draft}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Sent</p>
              <p className="text-2xl font-bold">{analytics.invoicesByStatus.sent}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Paid</p>
              <p className="text-2xl font-bold text-green-600">{analytics.invoicesByStatus.paid}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{analytics.invoicesByStatus.overdue}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
