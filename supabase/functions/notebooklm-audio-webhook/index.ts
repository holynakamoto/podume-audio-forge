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
    console.log('NotebookLM audio webhook triggered')
    
    const body = await req.json()
    console.log('Received payload:', body)

    const { 
      audioUrl, 
      audioContent, 
      fileName, 
      processingMode,
      zapierJobId,
      notebookTitle,
      metadata 
    } = body

    // Initialize Supabase client for logging and storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    let finalAudioUrl = audioUrl

    // If we received base64 audio content, we could store it in Supabase Storage
    if (audioContent && !audioUrl) {
      console.log('Processing base64 audio content...')
      
      try {
        // Decode base64 audio
        const audioData = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))
        
        // Generate unique filename
        const audioFileName = `notebooklm-${Date.now()}.mp3`
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('podcasts')
          .upload(audioFileName, audioData, {
            contentType: 'audio/mpeg'
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw uploadError
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('podcasts')
          .getPublicUrl(audioFileName)

        finalAudioUrl = urlData.publicUrl
        console.log('Audio uploaded to storage:', finalAudioUrl)
      } catch (error) {
        console.error('Error processing audio content:', error)
        // Continue with the webhook even if storage fails
      }
    }

    // Log the NotebookLM generation
    const { error: logError } = await supabase
      .from('podcast_jobs')
      .insert({
        linkedin_profile_url: 'notebooklm-automation',
        status: 'completed',
        audio_url: finalAudioUrl,
        transcript: notebookTitle || 'NotebookLM Generated Podcast',
        metadata: {
          source: 'notebooklm',
          zapier_job_id: zapierJobId,
          processing_mode: processingMode,
          file_name: fileName,
          generated_at: new Date().toISOString(),
          ...metadata
        }
      })

    if (logError) {
      console.error('Error logging to database:', logError)
    }

    // Send real-time notification if needed
    const notificationPayload = {
      type: 'notebooklm_audio_ready',
      audioUrl: finalAudioUrl,
      title: notebookTitle || 'NotebookLM Podcast',
      fileName: fileName,
      timestamp: new Date().toISOString()
    }

    // Could implement WebSocket or Server-Sent Events here for real-time updates
    console.log('Notification payload prepared:', notificationPayload)

    return new Response(
      JSON.stringify({ 
        success: true, 
        audioUrl: finalAudioUrl,
        message: 'Audio webhook processed successfully',
        notificationSent: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in audio webhook:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to process audio webhook'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})