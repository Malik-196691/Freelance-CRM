import { getInvoices } from "@/app/dashboard/invoices/actions"
import { getClients } from "@/app/dashboard/clients/actions"
import { getProjects } from "@/app/dashboard/projects/actions"
import { InvoiceDialog } from "@/components/invoices/invoice-dialog"
import { InvoiceList } from "@/components/invoices/invoice-list"

export default async function InvoicesPage() {
  const invoices = await getInvoices()
  const clients = await getClients()
  const projects = await getProjects()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 lg:pr-32">
        <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        <div className="flex items-center space-x-2 mt-5">
          <InvoiceDialog clients={clients} projects={projects} />
        </div>
      </div>
      <InvoiceList invoices={invoices} clients={clients} projects={projects} />
    </div>
  )
}
