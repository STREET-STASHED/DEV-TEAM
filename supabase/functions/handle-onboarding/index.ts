// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createServer } from 'http'

const server = createServer(async (req, res) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  }

  if (req.method === "OPTIONS") {
    res.writeHead(200, headers)
    res.end("ok")
    return
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    res.writeHead(500, { ...headers, "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: "Missing Supabase environment variables." }))
    return
  }

  const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      global: {
        headers: { Authorization: req.headers['authorization'] || '' },
        fetch: (url: string, options?: RequestInit) => {
          options = options || {};
          options.headers = {
            ...options.headers,
            'Accept': 'application/json',
          };
          return fetch(url, options);
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser()

  if (userError) {
    res.writeHead(401, { ...headers, "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: userError.message }))
    return
  }

  // Example: fetch onboarding status
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('has_completed_onboarding')
    .eq('id', user.id)
    .single()

  if (error) {
    res.writeHead(500, { ...headers, "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: error.message }))
    return
  }

  res.writeHead(200, { ...headers, "Content-Type": "application/json" })
  res.end(JSON.stringify({ status: data }))
})

server.listen(8000)