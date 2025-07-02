
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

export async function authenticateUser(request: Request) {
  console.log('=== Authenticating user ===');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseAnonKey) {
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
  
  // Create Supabase client with anon key (this is correct for user token verification)
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
  
  try {
    // Verify the JWT token - this will use the user's session token
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Auth error:', error);
      throw new Error('Invalid authentication token');
    }
    
    if (!user) {
      console.error('No user found for token');
      throw new Error('User must be signed in to create podcasts');
    }
    
    console.log('User authenticated successfully:', user.id);
    return user;
    
  } catch (error) {
    console.error('Failed to authenticate user:', error);
    throw new Error('Authentication failed');
  }
}
