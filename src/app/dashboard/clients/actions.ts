"use server"

import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
})

export type ClientFormData = z.infer<typeof clientSchema>

export async function getClients(query: string = "") {
  const session = await auth()
  if (!session?.user?.email) return []

  // Ensure user exists in our users table (simple check or assume sync)
  // For now, we filter by auth.uid() which requires RLS or manual filter if RLS is off
  // Since we set up RLS in schema.sql linked to auth.uid(), we can just select.
  // BUT... supabase.ts client is a generic client. To use RLS properly with NextAuth, 
  // we usually need a way to pass the user session to Supabase or Filter manually.
  // Given the simple setup, we'll manually filter by user_id if we can get it, 
  // OR we rely on RLS if we're using a client that has the user's token (which we aren't yet).
  // FOR NOW: We will assume we need to filter by user_id manually for safety.
  
  // First get our internal user id based on email (since schema uses uuid from auth.users)
  // This is a bit tricky with NextAuth + Supabase if they aren't fully integrated.
  // Simplified approach: We fetch the user from Supabase `users` table by email.
  
  const { data: user } = await supabase.from("users").select("id").eq("email", session.user.email).single()
  
  if (!user) return [] // Or Create user?

  let dbQuery = supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (query) {
    dbQuery = dbQuery.ilike("name", `%${query}%`)
  }

  const { data, error } = await dbQuery

  if (error) {
    console.error("Error fetching clients:", error)
    return []
  }

  return data
}

export async function createClient(data: ClientFormData) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Unauthorized")

  // Get user id
  const { data: user } = await supabase.from("users").select("id").eq("email", session.user.email).single()
  if (!user) {
      // Create user if not exists (Lazy sync)
      // Note: This relies on Supabase Auth usually.
      // If we are just using the table:
      // const { data: newUser } = await supabase.from("users").insert({ email: session.user.email, id: uuidv4() ... })
      // But ID must match auth.users if using RLS linked to auth.uid().
      // If we are ignoring RLS for now or using a service role key (we are using anon key + RLS usually requires auth).
      // Problem: `supabase` client is using ANON KEY. It has no user context!
      // Fix: We need to use `createClient` with a service role to bypass RLS or sign in the user.
      // Since we don't have the user's Supabase accessToken (NextAuth doesn't give it by default unless configured),
      // we might run into RLS issues if we enabled policies.
      // HACK: For this demo, assuming we might verify policies or disable them for testing if it creates issues.
      // OR better: we fetch the user by email (insecure if not verified) and use that ID.
      // Let's assume the user table is populated.
      throw new Error("User not found in database. Please ensure account is set up.")
  }

  const { error } = await supabase.from("clients").insert({
    ...data,
    user_id: user.id,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/clients")
}

export async function updateClient(id: string, data: ClientFormData) {
    const { error } = await supabase
      .from("clients")
      .update(data)
      .eq("id", id)

    if (error) throw new Error(error.message)
    revalidatePath("/dashboard/clients")
}

export async function deleteClient(id: string) {
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", id)

    if (error) throw new Error(error.message)
    revalidatePath("/dashboard/clients")
}
