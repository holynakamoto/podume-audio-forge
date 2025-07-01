import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

const BASE_URL = "http://localhost:54321/functions/v1/zapier-integration";
const API_KEY = Deno.env.get('API_KEY') || 'test_api_key';

Deno.test('Create record (API key)', async () => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'create',
      table: 'test_table',
      data: { name: 'Test User', email: 'test@example.com' }
    })
  });
  const json = await res.json();
  assertEquals(res.status, 200);
  assertEquals(json.success, true);
  assertEquals(json.data.name, 'Test User');
});

Deno.test('Read records (API key)', async () => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'read',
      table: 'test_table',
      query: { filter: { email: 'test@example.com' } }
    })
  });
  const json = await res.json();
  assertEquals(res.status, 200);
  assertEquals(json.success, true);
  assertEquals(Array.isArray(json.data), true);
});

Deno.test('Update record (API key)', async () => {
  // Assume a record with id 1 exists
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'update',
      table: 'test_table',
      id: 1,
      data: { name: 'Updated User' }
    })
  });
  const json = await res.json();
  assertEquals(res.status, 200);
  assertEquals(json.success, true);
});

Deno.test('Delete record (API key)', async () => {
  // Assume a record with id 1 exists
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'delete',
      table: 'test_table',
      id: 1
    })
  });
  const json = await res.json();
  assertEquals(res.status, 200);
  assertEquals(json.success, true);
});

Deno.test('Unauthorized (no API key or signature)', async () => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'read', table: 'test_table' })
  });
  const json = await res.json();
  assertEquals(res.status, 401);
  assertEquals(json.success, false);
  assertEquals(json.errorCode, 'UNAUTHORIZED');
}); 