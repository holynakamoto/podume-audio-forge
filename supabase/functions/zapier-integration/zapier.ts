// Zapier-specific helpers
import { ZapierIntegrationRequest } from './types.ts';

export function parseZapierAction(body: any): ZapierIntegrationRequest {
  // Extracts action, table, data, etc. from the request body
  return {
    action: body.action,
    table: body.table,
    data: body.data,
    query: body.query,
    id: body.id,
  };
}

// TODO: Add more Zapier-specific helpers as needed 