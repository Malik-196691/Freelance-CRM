import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabase } from '@/lib/supabase'

/**
 * POST /api/create-user
 * Creates the current user in Supabase if they don't exist
 */
export async function POST() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Not authenticated. Please log in first.' 
      }, { status: 401 })
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', session.user.email)
      .single()

    if (existingUser) {
      return NextResponse.json({
        message: 'User already exists',
        user: existingUser
      })
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: session.user.email,
        name: session.user.name || session.user.email.split('@')[0],
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'User created successfully!',
      user: newUser
    })
  } catch (error) {
    console.error('Error in create-user:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
