import type { NextApiRequest, NextApiResponse } from 'next';

let products: any[] = []; // In-memory product store

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const data = req.body;

      if (!data.name || !data.price || !data.description || !data.category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newProduct = {
        id: Date.now().toString(),
        name: data.name,
        price: parseFloat(data.price),
        description: data.description,
        category: data.category,
        image: data.image || null,
        createdAt: new Date(),
      };

      products.push(newProduct);

      return res.status(201).json({ success: true, product: newProduct });
    } catch (err) {
      return res.status(500).json({ error: 'Upload failed', details: err });
    }
  }

  if (req.method === 'GET') {
    return res.status(200).json(products);
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}