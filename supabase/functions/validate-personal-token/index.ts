
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenValidationRequest {
  token: string;
  requiredPermissions?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Token validation request received');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { token, requiredPermissions }: TokenValidationRequest = await req.json();

    if (!token || !token.startsWith('CXI_')) {
      return new Response(
        JSON.stringify({ error: 'Invalid token format' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash the incoming token
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('Looking up token hash:', tokenHash.substring(0, 8) + '...');

    // Find token in database
    const { data: tokenData, error: tokenError } = await supabase
      .from('personal_tokens')
      .select(`
        id,
        user_id,
        token_name,
        permissions,
        expires_at,
        is_active,
        last_used_at
      `)
      .eq('token_hash', tokenHash)
      .eq('is_active', true)
      .single();

    if (tokenError || !tokenData) {
      console.error('Token not found or error:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is expired
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      console.log('Token expired:', tokenData.expires_at);
      return new Response(
        JSON.stringify({ error: 'Token has expired' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check required permissions if provided
    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions = tokenData.permissions as any;
      const hasPermissions = requiredPermissions.every(permission => {
        const [category, action] = permission.split(':');
        return userPermissions[category] && userPermissions[category].includes(action);
      });

      if (!hasPermissions) {
        console.log('Insufficient permissions for token:', tokenData.id);
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions' }), 
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update last_used_at timestamp
    await supabase
      .from('personal_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    console.log('Token validated successfully for user:', tokenData.user_id);

    // Return user context and permissions
    return new Response(
      JSON.stringify({
        valid: true,
        user_id: tokenData.user_id,
        token_name: tokenData.token_name,
        permissions: tokenData.permissions
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Token validation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
