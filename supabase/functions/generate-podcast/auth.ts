
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

export async function authenticateUser(request: Request) {
  console.log('=== Authenticating user ===');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    throw new Error('Server configuration error');
  }

  // Get authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Missing or invalid authorization header');
    throw new Error('Authentication required');
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Token received:', token.substring(0, 20) + '...');
  
  // Check if this is the anon key (which means user is not authenticated)
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (token === anonKey) {
    console.error('Received anon key instead of user token - user not authenticated');
    throw new Error('User must be signed in to create podcasts');
  }
  
  // Create Supabase client with service role key for user verification
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Auth error:', error);
      throw new Error('Invalid authentication token');
    }
    
    if (!user) {
      console.error('No user found for token');
      throw new Error('Invalid authentication token');
    }
    
    console.log('User authenticated successfully:', user.id);
    return user;
    
  } catch (error) {
    console.error('Failed to authenticate user:', error);
    throw new Error('Authentication failed');
  }
}
