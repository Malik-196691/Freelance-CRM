import { getProjects } from "@/app/dashboard/projects/actions"
import { getClients } from "@/app/dashboard/clients/actions"
import { ProjectDialog } from "@/components/projects/project-dialog"
import { ProjectList } from "@/components/projects/project-list"

export default async function ProjectsPage() {
  const projects = await getProjects()
  const clients = await getClients()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 lg:pr-32">
        <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
        <div className="flex items-center space-x-2 mt-5">
          <ProjectDialog clients={clients} />
        </div>
      </div>
      <ProjectList projects={projects} clients={clients} />
    </div>
  )
}
