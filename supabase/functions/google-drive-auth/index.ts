import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action } = body

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid user token')
    }

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-drive-auth`

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured')
    }

    if (action === 'connect') {
      // Generate OAuth URL
      const scopes = [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata'
      ].join(' ')
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `state=${user.id}&` +
        `prompt=consent`

      return new Response(
        JSON.stringify({ authUrl }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (action === 'check_status') {
      // Check if user has valid Google Drive tokens
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const hasTokens = profile?.google_access_token && profile?.google_refresh_token
      
      return new Response(
        JSON.stringify({ connected: !!hasTokens }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Handle OAuth callback
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    if (error) {
      return new Response(
        `<html><body><script>window.close();</script><p>Authentication failed: ${error}</p></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

    if (code && state) {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      })

      const tokens = await tokenResponse.json()

      if (tokens.access_token) {
        // Store tokens in user profile (you might need to add these columns)
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: state,
            google_access_token: tokens.access_token,
            google_refresh_token: tokens.refresh_token,
            google_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })

        if (updateError) {
          console.error('Error storing tokens:', updateError)
          return new Response(
            `<html><body><script>window.close();</script><p>Error storing tokens</p></body></html>`,
            { headers: { 'Content-Type': 'text/html' } }
          )
        }

        // Create necessary folders in Google Drive
        await createGoogleDriveFolders(tokens.access_token)

        return new Response(
          `<html><body><script>window.close();</script><p>Google Drive connected successfully!</p></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        )
      }
    }

    throw new Error('Invalid request')

  } catch (error) {
    console.error('Error in Google Drive auth:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to authenticate with Google Drive'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function createGoogleDriveFolders(accessToken: string) {
  try {
    // Create Lovable_PDFs folder
    const pdfFolderResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Lovable_PDFs',
        mimeType: 'application/vnd.google-apps.folder',
      }),
    })

    // Create Lovable_Audio folder
    const audioFolderResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Lovable_Audio',
        mimeType: 'application/vnd.google-apps.folder',
      }),
    })

    console.log('Google Drive folders created successfully')
  } catch (error) {
    console.error('Error creating Google Drive folders:', error)
  }
}