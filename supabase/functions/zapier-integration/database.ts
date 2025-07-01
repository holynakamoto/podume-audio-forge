// @deno-types="https://deno.land/x/types/supabase@2.0.0/index.d.ts"
import { DatabaseRecord } from './types.ts';
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function createRecord(client: SupabaseClient, table: string, data: DatabaseRecord) {
  const { data: result, error } = await client.from(table).insert(data).select().single();
  if (error) throw new Error(error.message);
  return result;
}

export async function readRecords(client: SupabaseClient, table: string, query: any = {}) {
  let q = client.from(table).select('*');
  if (query.filter) {
    for (const [key, value] of Object.entries(query.filter)) {
      q = q.eq(key, value);
    }
  }
  if (query.sort) {
    q = q.order(query.sort);
  }
  if (query.page && query.pageSize) {
    q = q.range((query.page - 1) * query.pageSize, query.page * query.pageSize - 1);
  }
  const { data: result, error } = await q;
  if (error) throw new Error(error.message);
  return result;
}

export async function updateRecord(client: SupabaseClient, table: string, id: string | number, data: DatabaseRecord) {
  const { data: result, error } = await client.from(table).update(data).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return result;
}

export async function deleteRecord(client: SupabaseClient, table: string, id: string | number) {
  const { data: result, error } = await client.from(table).delete().eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return result;
} 