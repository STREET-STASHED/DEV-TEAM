import { createBrowserClient } from '@supabase/ssr';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);
export async function callEdge(path: string, payload: any = {}, method = 'POST') {
  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch(`${supabaseUrl}/functions/v1/${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return res.json();
}