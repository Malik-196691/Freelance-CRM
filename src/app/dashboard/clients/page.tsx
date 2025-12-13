import { getClients } from "@/app/dashboard/clients/actions"
import { ClientDialog } from "@/components/clients/client-dialog"
import { ClientTable } from "@/components/clients/client-table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const query = params?.q || ""
  const clients = await getClients(query)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 lg:pr-32">
        <h2 className="text-3xl font-bold tracking-tight ">Clients</h2>
        <div className="flex items-center space-x-2 mt-5">
          <ClientDialog />
        </div>
      </div>
      <div className="flex items-center space-x-2">
         {/* Search Form - Simple implementation using a form to trigger reload or use client component */}
         {/* For simplicity we assume a client component for search or just a form */}
         <form className="relative flex-1 md:max-w-sm">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
                name="q"
                type="search"
                placeholder="Search clients..."
                className="pl-8"
                defaultValue={query}
              />
         </form>
      </div>
      <ClientTable clients={clients} />
    </div>
  )
}
