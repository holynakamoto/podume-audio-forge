
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
  console.log('=== Triggering Zapier MCP workflow with full processing ===');
  
  const zapierMcpUrl = Deno.env.get('ZAPIER_MCP_WEBHOOK_URL') || 'https://mcp.zapier.com/api/mcp/a/23523145/mcp';
  
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

    console.log('Sending comprehensive payload to Zapier MCP:', {
      podcast_id: payload.podcast_id,
      title: payload.title,
      source_type: payload.source_type,
      linkedin_url: payload.linkedin_url,
      resume_content_length: payload.resume_content.length,
      package_type: payload.package_type,
      voice_clone: payload.voice_clone,
      premium_assets: payload.premium_assets,
      generate_transcript: payload.generate_transcript,
      generate_audio: payload.generate_audio,
    });

    const response = await fetch(zapierMcpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Podume-System/1.0',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Zapier MCP trigger failed:', response.status, errorText);
      throw new Error(`Zapier MCP failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Zapier MCP triggered successfully for full processing:', result);

  } catch (error) {
    console.error('Error triggering Zapier MCP:', error.message);
    // Don't throw error here - we don't want to fail podcast creation if Zapier fails
    console.log('Continuing podcast creation despite Zapier MCP failure');
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
      console.log('Zapier completion notification sent successfully');
    } else {
      console.error('Zapier completion notification failed:', response.status);
    }

  } catch (error) {
    console.error('Error sending Zapier completion notification:', error.message);
  }
}
