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

    if (action !== 'sync_audio') {
      throw new Error('Invalid action')
    }

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

    // Get user's Google Drive tokens
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_access_token, google_refresh_token, google_token_expires_at')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.google_access_token) {
      throw new Error('Google Drive not connected. Please connect your Google Drive first.')
    }

    let accessToken = profile.google_access_token

    // Check if token needs refresh
    if (profile.google_token_expires_at) {
      const expiresAt = new Date(profile.google_token_expires_at)
      if (expiresAt <= new Date()) {
        accessToken = await refreshGoogleToken(profile.google_refresh_token, user.id, supabase)
      }
    }

    // Find Lovable_Audio folder
    const audioFolderId = await findFolder(accessToken, 'Lovable_Audio')
    if (!audioFolderId) {
      throw new Error('Lovable_Audio folder not found. Please create it in Google Drive.')
    }

    // Get audio files from folder
    const audioFiles = await getAudioFilesFromFolder(accessToken, audioFolderId)

    // Get existing files from database to avoid duplicates
    const { data: existingFiles } = await supabase
      .from('audio_files')
      .select('google_drive_file_id')
      .eq('user_id', user.id)

    const existingFileIds = new Set(existingFiles?.map(f => f.google_drive_file_id) || [])

    let newFilesCount = 0

    // Process each new audio file
    for (const file of audioFiles) {
      if (existingFileIds.has(file.id)) {
        continue // Skip already processed files
      }

      try {
        // Download file from Google Drive
        const fileData = await downloadFileFromGoogleDrive(accessToken, file.id)
        
        // Upload to Supabase storage
        const fileName = `${user.id}/${Date.now()}-${file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('audio-files')
          .upload(fileName, fileData, {
            contentType: 'audio/mpeg'
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('audio-files')
          .getPublicUrl(fileName)

        // Store metadata in database
        const { error: dbError } = await supabase
          .from('audio_files')
          .insert({
            user_id: user.id,
            file_name: file.name,
            google_drive_file_id: file.id,
            supabase_url: urlData.publicUrl,
            metadata: {
              google_drive_created_time: file.createdTime,
              google_drive_modified_time: file.modifiedTime,
              file_size: file.size
            }
          })

        if (dbError) {
          console.error('Database error:', dbError)
          continue
        }

        newFilesCount++
        console.log(`Successfully processed audio file: ${file.name}`)

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        continue
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        newFiles: newFilesCount,
        message: `Synced ${newFilesCount} new audio files`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in Google Drive sync:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to sync audio files'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function refreshGoogleToken(refreshToken: string, userId: string, supabase: any) {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID')!
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  const tokens = await response.json()

  if (tokens.access_token) {
    // Update tokens in database
    await supabase
      .from('profiles')
      .update({
        google_access_token: tokens.access_token,
        google_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    return tokens.access_token
  }

  throw new Error('Failed to refresh Google token')
}

async function findFolder(accessToken: string, folderName: string) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  )

  const data = await response.json()
  return data.files && data.files.length > 0 ? data.files[0].id : null
}

async function getAudioFilesFromFolder(accessToken: string, folderId: string) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and (mimeType='audio/mpeg' or mimeType='audio/mp3')&fields=files(id,name,createdTime,modifiedTime,size)`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  )

  const data = await response.json()
  return data.files || []
}

async function downloadFileFromGoogleDrive(accessToken: string, fileId: string): Promise<Uint8Array> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}