
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { provider, apiKey, model } = await req.json()
    
    let testResult = { success: false, error: '', response: '' }

    switch (provider) {
      case 'openai':
        testResult = await testOpenAI(apiKey, model)
        break
      case 'anthropic':
        testResult = await testAnthropic(apiKey, model)
        break
      case 'google':
        testResult = await testGoogle(apiKey, model)
        break
      case 'azure':
        testResult = await testAzure(apiKey, model)
        break
      case 'huggingface':
        testResult = await testHuggingFace(apiKey, model)
        break
      default:
        testResult = { success: false, error: 'Unsupported provider', response: '' }
    }

    return new Response(
      JSON.stringify(testResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message, response: '' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

async function testOpenAI(apiKey: string, model: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello from CodeXI, how are you?' }],
        max_tokens: 50,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.error?.message || 'API test failed', response: '' }
    }

    const data = await response.json()
    return { 
      success: true, 
      error: '', 
      response: data.choices[0]?.message?.content || 'Test successful' 
    }
  } catch (error) {
    return { success: false, error: error.message, response: '' }
  }
}

async function testAnthropic(apiKey: string, model: string) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-3-haiku-20240307',
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Hello from CodeXI, how are you?' }],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.error?.message || 'API test failed', response: '' }
    }

    const data = await response.json()
    return { 
      success: true, 
      error: '', 
      response: data.content[0]?.text || 'Test successful' 
    }
  } catch (error) {
    return { success: false, error: error.message, response: '' }
  }
}

async function testGoogle(apiKey: string, model: string) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Hello from CodeXI, how are you?' }]
        }]
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.error?.message || 'API test failed', response: '' }
    }

    const data = await response.json()
    return { 
      success: true, 
      error: '', 
      response: data.candidates[0]?.content?.parts[0]?.text || 'Test successful' 
    }
  } catch (error) {
    return { success: false, error: error.message, response: '' }
  }
}

async function testAzure(apiKey: string, model: string) {
  // Note: Azure requires endpoint URL which would need to be provided by user
  return { success: false, error: 'Azure testing requires endpoint configuration', response: '' }
}

async function testHuggingFace(apiKey: string, model: string) {
  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model || 'meta-llama/Meta-Llama-3-8B-Instruct'}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: 'Hello from CodeXI, how are you?',
        parameters: { max_new_tokens: 50 }
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.error || 'API test failed', response: '' }
    }

    const data = await response.json()
    return { 
      success: true, 
      error: '', 
      response: Array.isArray(data) ? data[0]?.generated_text || 'Test successful' : 'Test successful'
    }
  } catch (error) {
    return { success: false, error: error.message, response: '' }
  }
}
