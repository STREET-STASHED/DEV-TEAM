export default async function handler(req, res) {
  const { function: fn } = req.query;
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_EDGE_URL}/${fn}`;

  const result = await fetch(url, {
    method: req.method,
    headers: {
      ...req.headers,
      host: '',
    },
    body: JSON.stringify(req.body),
  });

  const data = await result.json();
  res.status(result.status).json(data);
}