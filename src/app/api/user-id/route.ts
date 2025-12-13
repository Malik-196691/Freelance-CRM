import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/user-id
 * Returns the current user's ID for seeding purposes
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Not authenticated. Please log in first.' 
      }, { status: 401 })
    }

    // Get user ID from email
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', session.user.email)
      .single()

    if (error || !user) {
      return NextResponse.json({ 
        error: 'User not found in database' 
      }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Copy this user ID to your seed.sql file',
      userId: user.id,
      email: user.email,
      name: user.name,
      instructions: [
        '1. Copy the userId below',
        '2. Open src/lib/seed.sql',
        '3. Find line: v_user_id UUID := \'YOUR_USER_ID\';',
        `4. Replace YOUR_USER_ID with: ${user.id}`,
        '5. Run the seed.sql script in Supabase SQL Editor'
      ]
    })
  } catch (error) {
    console.error('Error fetching user ID:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
