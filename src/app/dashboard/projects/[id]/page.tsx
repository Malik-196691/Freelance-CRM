import { getTasks } from "@/app/dashboard/projects/actions"
import { TaskBoard } from "@/components/projects/task-board"
import { TaskDialog } from "@/components/projects/task-dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tasks = await getTasks(id)
  
  // Get project name
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", id)
    .single()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/projects">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            {project?.name || "Project Tasks"}
          </h2>
        </div>
        <TaskDialog projectId={id} />
      </div>
      <TaskBoard tasks={tasks} projectId={id} />
    </div>
  )
}
