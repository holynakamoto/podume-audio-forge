// @deno-types="https://deno.land/x/types/supabase@2.0.0/index.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateZapierSignature, validateApiKey } from './auth.ts';
import { createRecord, readRecords, updateRecord, deleteRecord } from './database.ts';
import { parseZapierAction } from './zapier.ts';
import { ZapierIntegrationResponse } from './types.ts';

// TODO: Import helpers for signature validation, API key validation, and database operations

serve(async (req) => {
  // Monitoring: Log incoming request
  const reqLog = {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    timestamp: new Date().toISOString()
  };
  let rawBody = '';
  let body: any = {};
  try {
    rawBody = await req.text();
    body = JSON.parse(rawBody);
    reqLog['body'] = body;
  } catch (e) {
    console.log('[zapier-integration] Incoming request:', reqLog);
    console.error('[zapier-integration] Invalid JSON body');
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body', errorCode: 'INVALID_JSON', timestamp: new Date().toISOString() }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  console.log('[zapier-integration] Incoming request:', reqLog);

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-api-key, content-type, x-zapier-webhook-signature',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      },
    });
  }

  // Auth: Zapier signature or API key
  let isZapier = false;
  let isApiKey = false;
  if (req.headers.get('x-zapier-webhook-signature')) {
    isZapier = await validateZapierSignature(req, rawBody);
  }
  if (req.headers.get('x-api-key')) {
    isApiKey = validateApiKey(req);
  }
  if (!isZapier && !isApiKey) {
    console.error('[zapier-integration] Unauthorized request');
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized', errorCode: 'UNAUTHORIZED', timestamp: new Date().toISOString() }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Parse and route action
  let response: ZapierIntegrationResponse & { errorCode?: string };
  try {
    const actionReq = parseZapierAction(body);
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    let result;
    switch (actionReq.action) {
      case 'create':
        result = await createRecord(supabase, actionReq.table, actionReq.data!);
        response = { success: true, data: result, id: result.id, timestamp: new Date().toISOString() };
        break;
      case 'read':
      case 'query':
        result = await readRecords(supabase, actionReq.table, actionReq.query);
        response = { success: true, data: result, timestamp: new Date().toISOString() };
        break;
      case 'update':
        result = await updateRecord(supabase, actionReq.table, actionReq.id!, actionReq.data!);
        response = { success: true, data: result, id: result.id, timestamp: new Date().toISOString() };
        break;
      case 'delete':
        result = await deleteRecord(supabase, actionReq.table, actionReq.id!);
        response = { success: true, data: result, id: result.id, timestamp: new Date().toISOString() };
        break;
      default:
        response = { success: false, error: 'Unknown action', errorCode: 'UNKNOWN_ACTION', timestamp: new Date().toISOString() };
    }
  } catch (error) {
    console.error('[zapier-integration] Operation failed:', error);
    response = {
      success: false,
      error: error.message || 'Unknown error',
      errorCode: error.errorCode || 'DB_ERROR',
      timestamp: new Date().toISOString(),
    };
  }

  // Monitoring: Log outgoing response
  if (!response.success) {
    console.error('[zapier-integration] Error response:', response);
  } else {
    console.log('[zapier-integration] Success response:', response);
  }

  // TODO: Integrate with external monitoring/alerting (e.g., Sentry, Datadog, Slack webhook)

  return new Response(JSON.stringify(response), {
    status: response.success ? 200 : 500,
    headers: { 'Content-Type': 'application/json' },
  });
}); 