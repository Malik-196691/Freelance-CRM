"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Pencil, Trash, Eye } from "lucide-react"
import { ProjectDialog } from "@/components/projects/project-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteProject } from "@/app/dashboard/projects/actions"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Project {
  id: string
  name: string
  description: string | null
  status: 'active' | 'completed' | 'archived' | 'on_hold'
  due_date: string | null
  clients: { name: string }
}

const statusStyles = {
  active: "bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-green-500/25 border-green-500/20",
  completed: "bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 border-blue-500/20",
  on_hold: "bg-orange-500/15 text-orange-600 dark:text-orange-400 hover:bg-orange-500/25 border-orange-500/20",
  archived: "bg-gray-500/15 text-gray-600 dark:text-gray-400 hover:bg-gray-500/25 border-gray-500/20",
}

export function ProjectList({ projects, clients }: { projects: Project[], clients: any[] }) {
  const router = useRouter()

  const handleDelete = async (id: string) => {
    await deleteProject(id)
    router.refresh()
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border glass-strong shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No projects found.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id} className="group transition-colors hover:bg-muted/50">
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.clients?.name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[project.status]}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {project.due_date ? new Date(project.due_date).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/projects/${project.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Tasks
                          </Link>
                        </DropdownMenuItem>
                        <ProjectDialog project={project} clients={clients}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </ProjectDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the project and all associated tasks.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(project.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {projects.length === 0 ? (
          <div className="rounded-xl border glass-strong shadow-sm p-8 text-center text-muted-foreground">
            No projects found.
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="rounded-xl border glass-strong shadow-sm p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">{project.clients?.name || "-"}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/projects/${project.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Tasks
                      </Link>
                    </DropdownMenuItem>
                    <ProjectDialog project={project} clients={clients}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    </ProjectDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the project and all associated tasks.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(project.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className={statusStyles[project.status]}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                </div>
                {project.due_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">{new Date(project.due_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
