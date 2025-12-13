"use server"

import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

const brandingSchema = z.object({
  company_name: z.string().optional(),
  logo_url: z.string().url().optional().or(z.literal("")),
  primary_color: z.string().optional(),
  invoice_footer: z.string().optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>
export type BrandingFormData = z.infer<typeof brandingSchema>

export async function getUserProfile() {
  const session = await auth()
  if (!session?.user?.email) return null

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", session.user.email)
    .single()

  if (error) {
    console.log(error)
    return null
  }

  return data
}

export async function updateProfile(data: ProfileFormData) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("users")
    .update({
      name: data.name,
      email: data.email,
      // Add custom fields if they exist in your schema
    })
    .eq("email", session.user.email)

  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/settings")
}

export async function updateBranding(data: BrandingFormData) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Unauthorized")

  // Store branding settings in user metadata or separate table
  // For now, we'll update the users table if you add these columns
  const { error } = await supabase
    .from("users")
    .update({
      // Add branding fields to your users table schema
      // company_name: data.company_name,
      // logo_url: data.logo_url,
      // primary_color: data.primary_color,
      // invoice_footer: data.invoice_footer,
    })
    .eq("email", session.user.email)

  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/settings")
}

export async function deleteAccount() {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Unauthorized")

  // This is a destructive action - in production you'd want to:
  // 1. Delete all related data (clients, projects, invoices, tasks)
  // 2. Or mark account as deleted and clean up later
  // 3. Send confirmation email
  
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("email", session.user.email)

  if (error) throw new Error(error.message)
  
  // In a real app, you'd also sign out the user and redirect
  return { success: true }
}
