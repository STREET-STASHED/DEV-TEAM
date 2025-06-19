import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;

  res.json({
    NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: key,
    status: url && key ? 'Both present' : (!url && !key ? 'Both missing' : (url ? 'Key missing' : 'URL missing')),
    note: 'If any value is null, your deployment is not receiving the Vercel env var. Recheck your project’s Environment Variables in Vercel and redeploy.'
  });
}