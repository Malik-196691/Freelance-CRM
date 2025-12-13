"use client"

import { useDroppable } from "@dnd-kit/core"
import { TaskCard } from "./task-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskDialog } from "./task-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface Task {
  id: string
  name: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  due_date: string | null
  project_id: string
}

interface TaskColumnProps {
  id: string
  title: string
  tasks: Task[]
  projectId: string
}

export function TaskColumn({ id, title, tasks, projectId }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <Card className={isOver ? "ring-2 ring-primary" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {title}
            <span className="ml-2 text-muted-foreground">({tasks.length})</span>
          </CardTitle>
          <TaskDialog projectId={projectId}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </TaskDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={setNodeRef}
          className="space-y-2 min-h-[200px]"
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              No tasks
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
