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
    const { fileName, fileData, mimeType, folder } = body

    if (!fileName || !fileData || !mimeType) {
      throw new Error('Missing required fields: fileName, fileData, mimeType')
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

    // Find or create the target folder
    let folderId = await findOrCreateFolder(accessToken, folder)

    // Convert base64 to blob
    const binaryData = Uint8Array.from(atob(fileData), c => c.charCodeAt(0))

    // Upload file to Google Drive
    const uploadResponse = await uploadToGoogleDrive(
      accessToken,
      fileName,
      binaryData,
      mimeType,
      folderId
    )

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.text()
      console.error('Google Drive upload error:', errorData)
      throw new Error('Failed to upload file to Google Drive')
    }

    const fileInfo = await uploadResponse.json()

    console.log('File uploaded successfully:', fileInfo)

    return new Response(
      JSON.stringify({ 
        success: true, 
        fileId: fileInfo.id,
        fileName: fileInfo.name,
        message: 'File uploaded to Google Drive successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in Google Drive upload:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to upload file to Google Drive'
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

async function findOrCreateFolder(accessToken: string, folderName: string) {
  // Search for existing folder
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  )

  const searchData = await searchResponse.json()

  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id
  }

  // Create folder if it doesn't exist
  const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  })

  const folderData = await createResponse.json()
  return folderData.id
}

async function uploadToGoogleDrive(
  accessToken: string,
  fileName: string,
  fileData: Uint8Array,
  mimeType: string,
  folderId: string
) {
  // Create multipart upload
  const boundary = '-------314159265358979323846'
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`

  const metadata = {
    name: fileName,
    parents: [folderId]
  }

  let multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n`

  const body = new Uint8Array(
    multipartRequestBody.length + fileData.length + closeDelimiter.length
  )

  let offset = 0
  const encoder = new TextEncoder()
  
  body.set(encoder.encode(multipartRequestBody), offset)
  offset += encoder.encode(multipartRequestBody).length
  
  body.set(fileData, offset)
  offset += fileData.length
  
  body.set(encoder.encode(closeDelimiter), offset)

  return fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary="${boundary}"`,
    },
    body: body,
  })
}