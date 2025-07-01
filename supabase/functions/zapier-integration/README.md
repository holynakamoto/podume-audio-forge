# Supabase Edge Function: Zapier Integration

## Overview
This Edge Function enables secure, authenticated CRUD operations on your Supabase database via Zapier AI Agent or direct API calls.

## Endpoints
- `POST /functions/v1/zapier-integration` — Main endpoint for all actions
- `OPTIONS /functions/v1/zapier-integration` — CORS preflight

## Authentication
- **Zapier Webhook Signature**: Header `x-zapier-webhook-signature` (HMAC SHA256, secret: `ZAPIER_WEBHOOK_SECRET`)
- **API Key**: Header `x-api-key` (secret: `API_KEY`)

## Request Payload
```
{
  "action": "create" | "read" | "update" | "delete" | "query",
  "table": "table_name",
  "data": { ... },        // For create/update
  "id": "record_id",    // For update/delete
  "query": {              // For read/query
    "filter": { ... },
    "sort": "column",
    "page": 1,
    "pageSize": 10
  }
}
```

## Response Format
```
{
  "success": true | false,
  "data": { ... },
  "error": "Error message if any",
  "errorCode": "Error code if any",
  "id": "record_id",
  "timestamp": "2024-07-01T12:00:00.000Z"
}
```

## Example: Create
```
POST /functions/v1/zapier-integration
Headers: { "x-api-key": "...", "Content-Type": "application/json" }
{
  "action": "create",
  "table": "contacts",
  "data": { "name": "Alice", "email": "alice@example.com" }
}
```

## Example: Read
```
POST /functions/v1/zapier-integration
Headers: { "x-api-key": "...", "Content-Type": "application/json" }
{
  "action": "read",
  "table": "contacts",
  "query": { "filter": { "email": "alice@example.com" } }
}
```

## Error Codes
- `INVALID_JSON`: Malformed request body
- `UNAUTHORIZED`: Missing or invalid authentication
- `DB_ERROR`: Database operation failed
- `UNKNOWN_ACTION`: Action not recognized

## Environment Variables
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ZAPIER_WEBHOOK_SECRET`
- `API_KEY`

## Security Notes
- Use RLS (Row Level Security) on your tables
- Never expose your service role key to the client
- Rotate secrets regularly

## Testing
- Use mock payloads and tools like Postman or Zapier's webhook tester
- Check logs for error details 