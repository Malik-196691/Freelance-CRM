export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          image: string | null
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          image?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          image?: string | null
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          client_id: string
          name: string
          description: string | null
          status: 'active' | 'completed' | 'archived' | 'on_hold'
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          description?: string | null
          status?: 'active' | 'completed' | 'archived' | 'on_hold'
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          description?: string | null
          status?: 'active' | 'completed' | 'archived' | 'on_hold'
          due_date?: string | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          status: 'todo' | 'in_progress' | 'done'
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          due_date?: string | null
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          client_id: string
          project_id: string | null
          total: number
          tax: number
          discount: number
          status: 'draft' | 'sent' | 'paid' | 'overdue'
          pdf_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          project_id?: string | null
          total?: number
          tax?: number
          discount?: number
          status?: 'draft' | 'sent' | 'paid' | 'overdue'
          pdf_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          project_id?: string | null
          total?: number
          tax?: number
          discount?: number
          status?: 'draft' | 'sent' | 'paid' | 'overdue'
          pdf_url?: string | null
          created_at?: string
        }
      }
    }
  }
}
