
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('=== User cleanup function invoked ===')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email } = await req.json()

    if (!email) {
      return new Response('Email is required', {
        status: 400,
        headers: corsHeaders
      })
    }

    console.log('Cleaning up user accounts for email:', email)

    // Get all users with this email (there might be duplicates)
    const { data: users, error: fetchError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (fetchError) {
      console.error('Error fetching users:', fetchError)
      return new Response('Error fetching users', {
        status: 500,
        headers: corsHeaders
      })
    }

    // Find users with matching email
    const matchingUsers = users.users.filter(user => user.email === email)
    console.log('Found matching users:', matchingUsers.length)

    // Delete all matching users
    const deletionPromises = matchingUsers.map(async (user) => {
      console.log('Deleting user:', user.id)
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      if (error) {
        console.error('Error deleting user:', user.id, error)
        return { id: user.id, error: error.message }
      }
      return { id: user.id, success: true }
    })

    const results = await Promise.all(deletionPromises)
    
    console.log('Cleanup results:', results)

    return new Response(JSON.stringify({
      success: true,
      message: `Cleaned up ${results.length} user accounts for ${email}`,
      results
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })

  } catch (error) {
    console.error('Error in cleanup-users function:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
          details: error.toString(),
        },
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    )
  }
})
