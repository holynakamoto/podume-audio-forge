interface ZapierAgentPayload {
  podcast_id: string;
  title: string;
  linkedin_url: string;
  callback_url: string;
  user_id: string;
  source_type: string;
  package_type: string;
  voice_clone: boolean;
  premium_assets: boolean;
}

export async function triggerZapierMCP(podcastData: any): Promise<void> {
  console.log('🔗 === Triggering Zapier AI Agent ===');
  console.log('📊 Podcast data for AI Agent:', {
    id: podcastData.id,
    title: podcastData.title,
    source_type: podcastData.source_type,
    linkedin_url: podcastData.linkedin_url
  });
  
  const zapierAgentUrl = Deno.env.get('ZAPIER_AGENT_WEBHOOK_URL');
  
  console.log('🔍 Environment check:');
  console.log('- ZAPIER_AGENT_WEBHOOK_URL present:', !!zapierAgentUrl);
  console.log('- Available environment variables:', Object.keys(Deno.env.toObject()).filter(key => key.includes('ZAPIER')));
  
  if (!zapierAgentUrl) {
    console.error('❌ ZAPIER_AGENT_WEBHOOK_URL environment variable not set');
    console.log('⚠️ Continuing podcast creation without Zapier AI Agent trigger');
    console.log('💡 To enable AI Agent processing, add ZAPIER_AGENT_WEBHOOK_URL to your Supabase secrets');
    return; // Don't throw error - allow podcast creation to succeed
  }
  
  console.log('🔗 Using Zapier AI Agent URL:', zapierAgentUrl.substring(0, 50) + '...');
  
  // Get Supabase URL for callback
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const callbackUrl = `${supabaseUrl}/functions/v1/zapier-completion`;
  
  try {
    const payload: ZapierAgentPayload = {
      podcast_id: podcastData.id,
      title: podcastData.title,
      linkedin_url: podcastData.linkedin_url || '',
      callback_url: callbackUrl,
      user_id: podcastData.user_id,
      source_type: podcastData.source_type || 'linkedin_url',
      package_type: podcastData.package_type || 'core',
      voice_clone: podcastData.voice_clone || false,
      premium_assets: podcastData.premium_assets || false,
    };

    console.log('📤 Sending AI Agent payload:', {
      podcast_id: payload.podcast_id,
      title: payload.title,
      linkedin_url: payload.linkedin_url,
      callback_url: payload.callback_url,
      source_type: payload.source_type,
      package_type: payload.package_type,
      voice_clone: payload.voice_clone,
      premium_assets: payload.premium_assets
    });

    console.log('🚀 Making HTTP request to Zapier AI Agent...');
    const startTime = Date.now();
    
    const response = await fetch(zapierAgentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Podume-System/1.0',
      },
      body: JSON.stringify(payload),
    });

    const responseTime = Date.now() - startTime;
    console.log('📨 Zapier AI Agent response received in', responseTime, 'ms');
    console.log('📨 Response status:', response.status);
    console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Zapier AI Agent trigger failed:', response.status, errorText);
      console.log('⚠️ Continuing podcast creation despite Zapier AI Agent failure');
      return; // Don't throw error - allow podcast creation to succeed
    }

    let result;
    try {
      result = await response.json();
      console.log('✅ Zapier AI Agent triggered successfully (JSON response):', result);
    } catch (jsonError) {
      const textResult = await response.text();
      console.log('✅ Zapier AI Agent triggered successfully (non-JSON response):', textResult);
      result = { status: 'success', response: textResult };
    }

    console.log('🎉 Zapier AI Agent workflow initiated successfully');

  } catch (error) {
    console.error('❌ Error triggering Zapier AI Agent:', error.message);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    console.log('⚠️ Continuing podcast creation despite Zapier AI Agent failure');
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
