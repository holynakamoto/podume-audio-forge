interface ZapierMCPPayload {
  podcast_id: string;
  title: string;
  transcript: string;
  audio_url?: string;
  linkedin_profile_data?: string;
  linkedin_url?: string;
  source_type: string;
  created_at: string;
  user_id: string;
  resume_content?: string;
  package_type: string;
  voice_clone: boolean;
  premium_assets: boolean;
  generate_transcript: boolean;
  generate_audio: boolean;
}

export async function triggerZapierMCP(podcastData: any): Promise<void> {
  console.log('🔗 === Triggering Zapier MCP workflow ===');
  console.log('📊 Podcast data for MCP:', {
    id: podcastData.id,
    title: podcastData.title,
    source_type: podcastData.source_type,
    linkedin_url: podcastData.linkedin_url
  });
  
  const zapierMcpUrl = Deno.env.get('ZAPIER_MCP_WEBHOOK_URL');
  
  console.log('🔍 Environment check:');
  console.log('- ZAPIER_MCP_WEBHOOK_URL present:', !!zapierMcpUrl);
  console.log('- Available environment variables:', Object.keys(Deno.env.toObject()).filter(key => key.includes('ZAPIER')));
  
  if (!zapierMcpUrl) {
    console.error('❌ ZAPIER_MCP_WEBHOOK_URL environment variable not set');
    console.log('⚠️ Continuing podcast creation without Zapier MCP trigger');
    console.log('💡 To enable MCP processing, add ZAPIER_MCP_WEBHOOK_URL to your Supabase secrets');
    return; // Don't throw error - allow podcast creation to succeed
  }
  
  console.log('🔗 Using Zapier MCP URL:', zapierMcpUrl.substring(0, 50) + '...');
  
  try {
    const payload: ZapierMCPPayload = {
      podcast_id: podcastData.id,
      title: podcastData.title,
      transcript: podcastData.transcript || '',
      audio_url: podcastData.audio_url || '',
      linkedin_profile_data: podcastData.resume_content || '',
      linkedin_url: podcastData.linkedin_url || '',
      source_type: podcastData.source_type || 'resume_content',
      created_at: podcastData.created_at || new Date().toISOString(),
      user_id: podcastData.user_id,
      resume_content: podcastData.resume_content || '',
      package_type: podcastData.package_type || 'core',
      voice_clone: podcastData.voice_clone || false,
      premium_assets: podcastData.premium_assets || false,
      generate_transcript: true, // Always generate transcript via Claude
      generate_audio: true, // Always generate audio via Deepgram/Auphonic
    };

    console.log('📤 Sending MCP payload:', {
      podcast_id: payload.podcast_id,
      title: payload.title,
      source_type: payload.source_type,
      linkedin_url: payload.linkedin_url,
      resume_content_length: payload.resume_content.length,
      package_type: payload.package_type,
      voice_clone: payload.voice_clone,
      premium_assets: payload.premium_assets
    });

    console.log('🚀 Making HTTP request to Zapier MCP...');
    const startTime = Date.now();
    
    const response = await fetch(zapierMcpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Podume-System/1.0',
      },
      body: JSON.stringify(payload),
    });

    const responseTime = Date.now() - startTime;
    console.log('📨 Zapier MCP response received in', responseTime, 'ms');
    console.log('📨 Response status:', response.status);
    console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Zapier MCP trigger failed:', response.status, errorText);
      console.log('⚠️ Continuing podcast creation despite Zapier MCP failure');
      return; // Don't throw error - allow podcast creation to succeed
    }

    let result;
    try {
      result = await response.json();
      console.log('✅ Zapier MCP triggered successfully (JSON response):', result);
    } catch (jsonError) {
      const textResult = await response.text();
      console.log('✅ Zapier MCP triggered successfully (non-JSON response):', textResult);
      result = { status: 'success', response: textResult };
    }

    console.log('🎉 Zapier MCP workflow initiated successfully');

  } catch (error) {
    console.error('❌ Error triggering Zapier MCP:', error.message);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    console.log('⚠️ Continuing podcast creation despite Zapier MCP failure');
    console.log('📝 Podcast record created successfully, but automated processing failed');
  }
}

export async function notifyZapierCompletion(podcastData: any): Promise<void> {
  console.log('=== Notifying Zapier of podcast completion ===');
  
  const zapierCompletionUrl = Deno.env.get('ZAPIER_COMPLETION_WEBHOOK_URL');
  
  if (!zapierCompletionUrl) {
    console.log('No Zapier completion webhook configured, skipping notification');
    return;
  }

  try {
    const payload = {
      event: 'podcast_completed',
      podcast_id: podcastData.id,
      title: podcastData.title,
      status: podcastData.status,
      audio_url: podcastData.audio_url,
      transcript_length: podcastData.transcript?.length || 0,
      completed_at: new Date().toISOString(),
      processed_by: 'zapier_mcp_workflow',
    };

    const response = await fetch(zapierCompletionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('✅ Zapier completion notification sent successfully');
    } else {
      console.error('❌ Zapier completion notification failed:', response.status);
    }

  } catch (error) {
    console.error('❌ Error sending Zapier completion notification:', error.message);
  }
}
