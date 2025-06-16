
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function authenticateUser(req: Request) {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  );

  try {
    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }
    
    if (!authUser) {
      console.error('User not authenticated');
      throw new Error('Unauthorized');
    }
    
    console.log('User authenticated:', authUser.id);
    return authUser;
  } catch (authError) {
    console.error('Failed to authenticate user:', authError);
    throw new Error('Authentication failed');
  }
}
