"use server"

import { supabase, supabaseAdmin } from "@/lib/supabase"

export async function signupWithEmail(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    if (!email || !password) {
        return { error: "Email and password are required" }
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
            }
        }
    })

    if (error) {
        return { error: error.message }
    }

    // Sync user to public table
    if (data.user) {
        const { error: insertError } = await supabaseAdmin.from("users").insert({
            id: data.user.id,
            email: data.user.email,
            name: name || email.split('@')[0],
            created_at: new Date().toISOString(),
        })

        if (insertError) {
            // If duplicate key error, ignore (user already exists)
            if (insertError.code !== '23505') {
                console.error("Error creating user in public table:", insertError)
            }
        }
    }

    // Check if session is missing, implying email confirmation is required
    if (data.user && !data.session) {
        return { success: true, message: "Account created! Please check your email to verify your account." }
    }

    return { success: true }
}

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function loginWithCredentials(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        })
        return { success: true }
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials." }
                default:
                    // This gives us the specific error thrown in authorize() e.g. "Email not confirmed"
                    // In v5, error.cause?.err?.message or error.message might hold it.
                    // For now return the message if available.
                    return { error: error.cause?.err?.message || error.message || "Something went wrong." }
            }
        }
        throw error // Rethrow redirect errors
    }
}
