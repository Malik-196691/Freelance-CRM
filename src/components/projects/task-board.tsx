"use client"

import { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { TaskColumn } from "./task-column"
import { TaskCard } from "./task-card"
import { updateTask } from "@/app/dashboard/projects/actions"
import { useRouter } from "next/navigation"

interface Task {
  id: string
  name: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  due_date: string | null
  project_id: string
}

interface TaskBoardProps {
  tasks: Task[]
  projectId: string
}

export function TaskBoard({ tasks, projectId }: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const router = useRouter()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const columns = [
    { id: 'todo', title: 'To Do', status: 'todo' as const },
    { id: 'in_progress', title: 'In Progress', status: 'in_progress' as const },
    { id: 'done', title: 'Done', status: 'done' as const },
  ]

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as 'todo' | 'in_progress' | 'done'

    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    // Optimistically update UI
    try {
      await updateTask(taskId, { status: newStatus, project_id: projectId })
      router.refresh()
    } catch (error) {
      console.error('Failed to update task:', error)
      // Optionally show error toast
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            id={column.status}
            title={column.title}
            tasks={tasks.filter(task => task.status === column.status)}
            projectId={projectId}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}
