
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
      case 'deepseek':
        testResult = await testDeepSeek(apiKey, model)
        break
      case 'marshall':
        testResult = await testMarshall(apiKey, model)
        break
      case 'grok':
        testResult = await testGrok(apiKey, model)
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
        model: model || 'gpt-4.1',
        messages: [{ role: 'user', content: 'Hello from CodeXI, respond with exactly: "OpenAI API test successful"' }],
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
      response: data.choices[0]?.message?.content || 'OpenAI API test successful'
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
        model: model || 'claude-4-sonnet',
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Hello from CodeXI, respond with exactly: "Anthropic API test successful"' }],
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
      response: data.content[0]?.text || 'Anthropic API test successful'
    }
  } catch (error) {
    return { success: false, error: error.message, response: '' }
  }
}

async function testGoogle(apiKey: string, model: string) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.5-pro-diamond'}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Hello from CodeXI, respond with exactly: "Google Gemini API test successful"' }]
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
      response: data.candidates[0]?.content?.parts[0]?.text || 'Google Gemini API test successful'
    }
  } catch (error) {
    return { success: false, error: error.message, response: '' }
  }
}

async function testAzure(apiKey: string, model: string) {
  try {
    // Azure requires a specific endpoint URL which should be provided in additional config
    return { success: false, error: 'Azure testing requires endpoint configuration. Please contact support.', response: '' }
  } catch (error) {
    return { success: false, error: error.message, response: '' }
  }
}

async function testHuggingFace(apiKey: string, model: string) {
  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model || 'openai/gpt-oss-120b'}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: 'Hello from CodeXI, respond with exactly: "Hugging Face API test successful"',
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
      response: Array.isArray(data) ? data[0]?.generated_text || 'Hugging Face API test successful' : 'Hugging Face API test successful'
    }
  } catch (error) {
    return { success: false, error: error.message, response: '' }
  }
}

async function testDeepSeek(apiKey: string, model: string) {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'deepseek-r1',
        messages: [{ role: 'user', content: 'Hello from CodeXI, respond with exactly: "DeepSeek API test successful"' }],
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
      response: data.choices[0]?.message?.content || 'DeepSeek API test successful'
    }
  } catch (error) {
    return { success: false, error: error.message, response: '' }
  }
}

async function testMarshall(apiKey: string, model: string) {
  try {
    const response = await fetch('https://api.marshall.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'marshall-ai-v2',
        messages: [{ role: 'user', content: 'Hello from CodeXI, respond with exactly: "Marshall AI API test successful"' }],
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
      response: data.choices[0]?.message?.content || 'Marshall AI API test successful'
    }
  } catch (error) {
    return { success: false, error: error.message, response: '' }
  }
}

async function testGrok(apiKey: string, model: string) {
  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'grok-4',
        messages: [{ role: 'user', content: 'Hello from CodeXI, respond with exactly: "Grok API test successful"' }],
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
      response: data.choices[0]?.message?.content || 'Grok API test successful'
    }
  } catch (error) {
    return { success: false, error: error.message, response: '' }
  }
}
