import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Get the authorization header instead of cookies
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    )
  }

  const token = authHeader.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json(
      { error: 'No token provided' },
      { status: 401 }
    )
  }

  // Create Supabase client with the user's token for RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, sessionName, categories } = await request.json()
  
  // Provide a default session name if not provided
  const sessionNameToUse = sessionName || title || 'Untitled Session'

  // Create board
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .insert({
      title,
      creator_id: user.id,
      categories: categories || [
        {"name": "GOOD BOYY", "color": "#87CEEB", "position": 0},
        {"name": "HELL YEAH", "color": "#90EE90", "position": 1},
        {"name": "FUCKIN'", "color": "#FFA07A", "position": 2},
        {"name": "IN THE FIRE", "color": "#1a1a1a", "position": 3}
      ]
    })
    .select()
    .single()

  if (boardError) {
    console.error('Error creating board:', boardError)
    return NextResponse.json({ error: boardError.message }, { status: 400 })
  }

  // Create session
  const { data: session, error: sessionError } = await supabase
    .from('board_sessions')
    .insert({
      board_id: board.id,
      session_name: sessionNameToUse
    })
    .select()
    .single()

  if (sessionError) {
    console.error('Error creating session:', sessionError)
    return NextResponse.json({ error: sessionError.message }, { status: 400 })
  }

  return NextResponse.json({
    board,
    session,
    shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/session/${session.shareable_code}`
  })
}
