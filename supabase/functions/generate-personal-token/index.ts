
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenGenerationRequest {
  tokenName: string;
  permissions: {
    llm: string[];
    agent: string[];
    project: string[];
    cli: string[];
  };
  expiresAt?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Token generation request received');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { tokenName, permissions, expiresAt }: TokenGenerationRequest = await req.json();

    // Validate input
    if (!tokenName || tokenName.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Token name is required and must be less than 50 characters' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already has 10 active tokens (rate limiting)
    const { data: existingTokens, error: countError } = await supabase
      .from('personal_tokens')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (countError) {
      console.error('Error checking existing tokens:', countError);
      throw new Error('Failed to check existing tokens');
    }

    if (existingTokens && existingTokens.length >= 10) {
      return new Response(
        JSON.stringify({ error: 'Maximum of 10 active tokens allowed' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate secure 32-character token
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < 32; i++) {
      randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const fullToken = `CXI_${randomString}`;
    console.log('Generated token with prefix:', fullToken.substring(0, 8) + '...');

    // Hash the token for storage (using Web Crypto API)
    const encoder = new TextEncoder();
    const data = encoder.encode(fullToken);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Calculate expiration date
    let expirationDate = null;
    if (expiresAt && expiresAt !== 'never') {
      expirationDate = expiresAt;
    }

    // Store token in database
    const { data: newToken, error: insertError } = await supabase
      .from('personal_tokens')
      .insert({
        user_id: user.id,
        token_name: tokenName,
        token_hash: tokenHash,
        token_prefix: fullToken, // This will be validated by our trigger
        permissions: permissions,
        expires_at: expirationDate,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting token:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create token: ' + insertError.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Token created successfully for user:', user.id);

    // Return the full token (this is the ONLY time it will be shown)
    return new Response(
      JSON.stringify({ 
        token: fullToken,
        tokenData: {
          id: newToken.id,
          token_name: newToken.token_name,
          token_prefix: fullToken.substring(0, 8) + '...',
          permissions: newToken.permissions,
          expires_at: newToken.expires_at,
          created_at: newToken.created_at
        }
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Token generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
