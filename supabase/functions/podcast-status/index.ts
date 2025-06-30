
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const url = new URL(req.url);
    const job_id = url.searchParams.get('job_id');
    
    if (!job_id) {
      return new Response(JSON.stringify({
        error: 'job_id parameter is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('📊 Checking status for job:', job_id);
    
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('podcast_jobs')
      .select('*')
      .eq('id', job_id)
      .single();
    
    if (jobError) {
      console.error('❌ Job query error:', jobError);
      return new Response(JSON.stringify({
        error: 'Job not found'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get workflow logs
    const { data: logs, error: logsError } = await supabase
      .from('workflow_logs')
      .select('*')
      .eq('job_id', job_id)
      .order('created_at', { ascending: true });
    
    if (logsError) {
      console.error('❌ Logs query error:', logsError);
    }
    
    const response = {
      id: job.id,
      status: job.status,
      linkedin_profile_url: job.linkedin_profile_url,
      audio_url: job.audio_url,
      transcript: job.transcript,
      profile_data: job.profile_data,
      error_message: job.error_message,
      created_at: job.created_at,
      updated_at: job.updated_at,
      workflow_logs: logs || [],
      metadata: {
        total_steps: logs?.length || 0,
        completed_steps: logs?.filter(log => log.status === 'completed').length || 0,
        failed_steps: logs?.filter(log => log.status === 'failed').length || 0
      }
    };
    
    console.log('✅ Status retrieved successfully');
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Status check error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
