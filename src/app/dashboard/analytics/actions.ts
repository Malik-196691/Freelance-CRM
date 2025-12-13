"use server"

import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"

export async function getAnalytics() {
  const session = await auth()
  if (!session?.user?.email) return null

  const { data: user } = await supabase.from("users").select("id").eq("email", session.user.email).single()
  if (!user) return null

  // Get total clients
  const { count: totalClients } = await supabase
    .from("clients")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", user.id)

  // Get total projects with status breakdown
  const { data: projects } = await supabase
    .from("projects")
    .select(`
      id,
      status,
      clients!inner(user_id)
    `)
    .eq("clients.user_id", user.id)

  const totalProjects = projects?.length || 0
  const projectsByStatus = {
    active: projects?.filter(p => p.status === 'active').length || 0,
    completed: projects?.filter(p => p.status === 'completed').length || 0,
    on_hold: projects?.filter(p => p.status === 'on_hold').length || 0,
    archived: projects?.filter(p => p.status === 'archived').length || 0,
  }

  // Get invoices with revenue data
  const { data: invoices } = await supabase
    .from("invoices")
    .select(`
      id,
      total,
      status,
      created_at,
      clients!inner(user_id)
    `)
    .eq("clients.user_id", user.id)
    .order("created_at", { ascending: true })

  const totalInvoices = invoices?.length || 0
  const totalRevenue = invoices?.reduce((sum, inv) => sum + inv.total, 0) || 0
  const paidRevenue = invoices?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0) || 0
  const pendingRevenue = invoices?.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.total, 0) || 0

  const invoicesByStatus = {
    draft: invoices?.filter(inv => inv.status === 'draft').length || 0,
    sent: invoices?.filter(inv => inv.status === 'sent').length || 0,
    paid: invoices?.filter(inv => inv.status === 'paid').length || 0,
    overdue: invoices?.filter(inv => inv.status === 'overdue').length || 0,
  }

  // Revenue by month (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const recentInvoices = invoices?.filter(inv => new Date(inv.created_at) >= sixMonthsAgo) || []
  
  const revenueByMonth = recentInvoices.reduce((acc: any[], inv) => {
    const month = new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const existing = acc.find(item => item.month === month)
    
    if (existing) {
      existing.revenue += inv.total
      if (inv.status === 'paid') existing.paid += inv.total
    } else {
      acc.push({
        month,
        revenue: inv.total,
        paid: inv.status === 'paid' ? inv.total : 0,
      })
    }
    
    return acc
  }, [])

  return {
    totalClients: totalClients || 0,
    totalProjects,
    totalInvoices,
    totalRevenue,
    paidRevenue,
    pendingRevenue,
    projectsByStatus,
    invoicesByStatus,
    revenueByMonth,
  }
}
