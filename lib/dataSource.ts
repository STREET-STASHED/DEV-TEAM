// /lib/dataSource.ts
import { demoStores } from './demoData';
import { supabaseServer } from './supabaseServer';
const supabase = supabaseServer;

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Real fetch: Adjust as needed to fit your Supabase schema.
export async function getStores() {
  if (USE_MOCK) return demoStores;
  // Example: fetch real stores with products included
  const { data, error } = await supabase
    .from('storefronts')
    .select('id, name, category, description, image, products(id, name, price, image, type, description)');
  if (error) return [];
  // Normalize structure to match demoStores!
  return data.map((s: any) => ({
    ...s,
    products: s.products || []
  }));
}