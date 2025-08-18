import { demoStores } from "./demoData";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: await (async () => {
      const allCookies = await cookies();
      return {
        get: (name: string) => allCookies.get(name)?.value ?? null,
        getAll: () => allCookies.getAll(),
        set: () => {},
        delete: () => {},
      };
    })(),
    db: { schema: "public" },
  },
);

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export async function getStores() {
  if (USE_MOCK) return demoStores;

  const { data, error } = await supabase
    .from("storefronts")
    .select(
      "id, name, category, description, image, products(id, name, price, image, type, description)",
    );

  if (error) return demoStores;

  return data.map((s: { id: string; name: string; category: string; description: string; image: string; products: Array<{ id: string; name: string; price: number; image: string; type: string; description: string }> }) => ({
    ...s,
    products: s.products || [],
  }));
}
