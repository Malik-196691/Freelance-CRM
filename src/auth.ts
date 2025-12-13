import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { supabase, supabaseAdmin } from "@/lib/supabase"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub,
    Google,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          console.error("Supabase auth error:", error.message)
          // Ensure meaningful error reaches the client
          throw new Error(error.message)
        }

        if (!data.user) {
          return null
        }

        // Return user object compatible with NextAuth
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || email.split('@')[0],
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Create or update user in Supabase public table when they sign in
      if (user.email) {
        try {
          // Check if user exists in public users table using Admin client to bypass RLS
          const { data: existingUser, error: selectError } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("email", user.email)
            .single()

          if (!existingUser && !selectError) {
            // Create new user in public table
            const { error } = await supabaseAdmin
              .from("users")
              .insert({
                id: user.id ? user.id : undefined, // Try to sync ID if possible (for Credentials provider, user.id comes from supabase auth)
                email: user.email,
                name: user.name || user.email.split('@')[0],
                created_at: new Date().toISOString(),
              })

            if (error) {
              // Ignore unique constraint errors if race condition
              if (error.code !== '23505') {
                console.error("⚠️ Error creating user in Supabase:", error)
              }
            } else {
              console.log("✅ User created in Supabase:", user.email)
            }
          }
        } catch (error) {
          console.error("⚠️ Error in signIn callback:", error)
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    }
  },
})
