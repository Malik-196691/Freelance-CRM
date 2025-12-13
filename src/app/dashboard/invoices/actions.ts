"use server"

import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  rate: z.number().min(0, "Rate must be positive"),
  amount: z.number(),
})

const invoiceSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  project_id: z.string().optional(),
  items: z.array(lineItemSchema).min(1, "At least one item is required"),
  tax: z.number().min(0).max(100).default(0),
  discount: z.number().min(0).default(0),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']).default('draft'),
  notes: z.string().optional(),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>
export type LineItem = z.infer<typeof lineItemSchema>

function calculateTotal(items: LineItem[], tax: number, discount: number) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = (subtotal * tax) / 100
  const total = subtotal + taxAmount - discount
  return { subtotal, taxAmount, total }
}

export async function getInvoices() {
  const session = await auth()
  if (!session?.user?.email) return []

  const { data: user } = await supabase.from("users").select("id").eq("email", session.user.email).single()
  if (!user) return []

  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      clients!inner(user_id, name),
      projects(name)
    `)
    .eq("clients.user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return []
  }
  return data
}

export async function createInvoice(data: InvoiceFormData) {
  const { subtotal, taxAmount, total } = calculateTotal(data.items, data.tax, data.discount)

  const invoiceData = {
    client_id: data.client_id,
    project_id: data.project_id || null,
    total,
    tax: data.tax,
    discount: data.discount,
    status: data.status,
    // notes: data.notes, // Removed as column doesn't exist
  }

  // 1. Create Invoice
  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert(invoiceData)
    .select()
    .single()

  if (error) throw new Error(error.message)

  // 2. Create Invoice Items
  // NOTE: invoice_items table does not exist in the current schema. 
  // We are currently just calculating the total from items and saving the invoice.
  // To save items, create the 'invoice_items' table.
  /*
  if (data.items.length > 0) {
    const itemsToInsert = data.items.map(item => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount
    }))

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsToInsert)

    if (itemsError) {
      // Cleanup invoice if items fail (optional but good practice)
      await supabase.from("invoices").delete().eq("id", invoice.id)
      throw new Error(itemsError.message)
    }
  }
  */

  revalidatePath("/dashboard/invoices")
  return invoice
}

export async function updateInvoice(id: string, data: Partial<InvoiceFormData>) {
  let updateData: any = { ...data }
  delete updateData.items // Remove items from invoice update
  delete updateData.notes // Remove notes from invoice update

  if (data.items) {
    const { total } = calculateTotal(data.items, data.tax || 0, data.discount || 0)
    updateData.total = total

    // NOTE: invoice_items table missing.
    /*
    // Replace items: Delete all old items and insert new ones
    const { error: deleteError } = await supabase
      .from("invoice_items")
      .delete()
      .eq("invoice_id", id)

    if (deleteError) throw new Error(deleteError.message)

    const itemsToInsert = data.items.map(item => ({
      invoice_id: id,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount
    }))

    const { error: insertError } = await supabase
      .from("invoice_items")
      .insert(itemsToInsert)

    if (insertError) throw new Error(insertError.message)
    */
  }

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", id)

    if (error) throw new Error(error.message)
  }
  revalidatePath("/dashboard/invoices")
}

export async function deleteInvoice(id: string) {
  const { error } = await supabase.from("invoices").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/invoices")
}

export async function getInvoice(id: string) {
  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      clients(name, email, company, phone),
      projects(name)
    `)
    .eq("id", id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateInvoiceStatus(id: string, status: 'draft' | 'sent' | 'paid' | 'overdue') {
  const { error } = await supabase
    .from("invoices")
    .update({ status })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/invoices")
}
