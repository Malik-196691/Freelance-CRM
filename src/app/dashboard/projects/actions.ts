"use server"

import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Projects
const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  client_id: z.string().min(1, "Client is required"),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'archived', 'on_hold']).default('active'),
  due_date: z.string().optional(), // ISO string from date picker usually
})

export type ProjectFormData = z.infer<typeof projectSchema>

export async function getProjects() {
   const session = await auth()
   if (!session?.user?.email) return []
 
   const { data: user } = await supabase.from("users").select("id").eq("email", session.user.email).single()
   if (!user) return []

   // Since our schema links projects to clients, and clients to users.
   // We find projects where client.user_id = user.id
   // Supabase "inner join" syntax:
   
   const { data, error } = await supabase
     .from("projects")
     .select(`
       *,
       clients!inner(user_id, name)
     `)
     .eq("clients.user_id", user.id)
     .order("created_at", { ascending: false })

    if (error) {
        console.error(error)
        return []
    }
    return data
}

export async function createProject(data: ProjectFormData) {
    // Validate that the client belongs to the user?
    // For now assume the dropdown only populated valid clients.
    const { error } = await supabase.from("projects").insert(data)
    if (error) throw new Error(error.message)
    revalidatePath("/dashboard/projects")
}

export async function updateProject(id: string, data: Partial<ProjectFormData>) {
    const { error } = await supabase.from("projects").update(data).eq("id", id)
    if (error) throw new Error(error.message)
    revalidatePath("/dashboard/projects")
}

export async function deleteProject(id: string) {
    const { error } = await supabase.from("projects").delete().eq("id", id)
    if (error) throw new Error(error.message)
    revalidatePath("/dashboard/projects")
}

// Tasks
const taskSchema = z.object({
    name: z.string().min(1, "Name is required"),
    project_id: z.string().min(1, "Project is required"),
    description: z.string().optional(),
    status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
    due_date: z.string().optional(),
})

export type TaskFormData = z.infer<typeof taskSchema>

export async function getTasks(projectId: string) {
    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true }) // Order by creation for now, dnd sort needs an index field potentially

    if (error) {
        console.error(error)
        return []
    }
    return data
}

export async function createTask(data: TaskFormData) {
    const { error } = await supabase.from("tasks").insert(data)
    if (error) throw new Error(error.message)
    revalidatePath(`/dashboard/projects/${data.project_id}`)
}

export async function updateTask(id: string, data: Partial<TaskFormData>) {
    const { error } = await supabase.from("tasks").update(data).eq("id", id)
    if (error) throw new Error(error.message)
    // We need to know project_id to revalidate, or just revalidate the project page if we are there.
    // If we don't have project_id in 'data', we might need to fetch it or revalidate global path?
    // For now, revalidatePath for ALL project pages is expensive but safe, or specific one.
    // Let's rely on client to trigger refresh or we pass project_id.
    // Ideally we pass project_id in data if we want precise revalidation.
}

export async function deleteTask(id: string, projectId: string) {
    const { error } = await supabase.from("tasks").delete().eq("id", id)
    if (error) throw new Error(error.message)
    revalidatePath(`/dashboard/projects/${projectId}`)
}
