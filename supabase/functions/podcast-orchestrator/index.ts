
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ZapierMCPClient } from './zapier-mcp-client.ts';
import { corsHeaders } from './cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { linkedin_url } = await req.json();
    
    console.log('🚀 Starting podcast orchestration for:', linkedin_url);
    
    // Create job record
    const { data: job, error } = await supabase
      .from('podcast_jobs')
      .insert({ linkedin_profile_url: linkedin_url })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating job:', error);
      throw error;
    }
    
    console.log('✅ Job created with ID:', job.id);
    
    // Initialize MCP client
    const zapier = new ZapierMCPClient({
      apiKey: Deno.env.get('ZAPIER_API_KEY')!
    });
    
    // Execute workflow steps
    await executeWorkflow(job.id, linkedin_url, zapier, supabase);
    
    return new Response(JSON.stringify({ 
      success: true, 
      job_id: job.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Orchestrator error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function executeWorkflow(jobId: string, linkedinUrl: string, zapier: ZapierMCPClient, supabase: any) {
  console.log('🔄 Starting workflow execution for job:', jobId);
  
  try {
    // Step 1: Extract LinkedIn data
    await logStep(jobId, 'extract_linkedin_data', 'started', supabase);
    const startTime = Date.now();
    
    const profileData = await zapier.extractLinkedInProfile(linkedinUrl);
    await updateJob(jobId, { profile_data: profileData }, supabase);
    
    const extractTime = Date.now() - startTime;
    await logStep(jobId, 'extract_linkedin_data', 'completed', supabase, { execution_time_ms: extractTime });
    
    // Step 2: Generate podcast transcript
    await logStep(jobId, 'generate_transcript', 'started', supabase);
    const transcriptStartTime = Date.now();
    
    const transcript = await generateTranscript(profileData, supabase);
    await updateJob(jobId, { transcript }, supabase);
    
    const transcriptTime = Date.now() - transcriptStartTime;
    await logStep(jobId, 'generate_transcript', 'completed', supabase, { execution_time_ms: transcriptTime });
    
    // Step 3: Convert to audio
    await logStep(jobId, 'generate_audio', 'started', supabase);
    const audioStartTime = Date.now();
    
    const audioUrl = await generateAudio(transcript, jobId, supabase);
    await updateJob(jobId, { audio_url: audioUrl, status: 'completed' }, supabase);
    
    const audioTime = Date.now() - audioStartTime;
    await logStep(jobId, 'generate_audio', 'completed', supabase, { execution_time_ms: audioTime });
    
    // Step 4: Trigger notifications via Zapier
    await zapier.triggerNotification({
      jobId,
      profileName: profileData.name,
      audioUrl,
      completedAt: new Date().toISOString()
    });
    
    console.log('✅ Workflow completed successfully for job:', jobId);
    
  } catch (error) {
    console.error('❌ Workflow error:', error);
    await logError(jobId, error, supabase);
    throw error;
  }
}

async function generateTranscript(profileData: any, supabase: any): Promise<string> {
  const { data, error } = await supabase.functions.invoke('generate-transcript', {
    body: { profile_data: profileData }
  });
  
  if (error) throw error;
  return data.transcript;
}

async function generateAudio(transcript: string, jobId: string, supabase: any): Promise<string> {
  const { data, error } = await supabase.functions.invoke('generate-audio', {
    body: { transcript, job_id: jobId }
  });
  
  if (error) throw error;
  return data.audio_url;
}

async function logStep(jobId: string, stepName: string, status: string, supabase: any, data?: any) {
  await supabase.from('workflow_logs').insert({
    job_id: jobId,
    step_name: stepName,
    status,
    data,
    execution_time_ms: data?.execution_time_ms || null
  });
}

async function updateJob(jobId: string, updates: any, supabase: any) {
  await supabase.from('podcast_jobs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', jobId);
}

async function logError(jobId: string, error: any, supabase: any) {
  await supabase.from('podcast_jobs')
    .update({ 
      status: 'failed', 
      error_message: error.message,
      updated_at: new Date().toISOString()
    })
    .eq('id', jobId);
}
