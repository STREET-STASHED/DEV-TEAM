// pages/buyer/marketplace.tsx
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { faker } from "@faker-js/faker";
import Layout from "@/components/Layout";

type Store = {
  id: string;
  name: string;
  category: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
    image_url: string;
    type: string;
  }>;
};

type Stylist = {
  id: string;
  name: string;
  image_url: string;
};

export default function Marketplace() {
  const { addItem, hasItem } = useCart();
  const [stores, setStores] = useState<Store[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [selectedTab, setSelectedTab] = useState<"All" | "Stylists" | string>(
    "All",
  );
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 4;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const categories = [
    "All",
    "Stylists",
    "Streetwear",
    "Luxury",
    "Essentials",
    "Shoes",
  ];

  useEffect(() => {
    async function fetchStores() {
      const catList = ["Streetwear", "Luxury", "Essentials", "Shoes"];
      let photoUrls: string[] = [];

      try {
        const res = await fetch(
          "https://api.pexels.com/v1/search?query=fashion&per_page=12",
          {
            headers: {
              Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY!,
            },
          },
        );
        const json = await res.json();
        photoUrls = json.photos.map((p: any) => p.src.medium);
      } catch (err) {
        console.error("Pexels API error:", err);
      }

      const mock: Store[] = Array.from({ length: 9 }, (_, index) => {
        const category = catList[index % catList.length];
        return {
          id: `mock-store-${index}`,
          name: faker.company.name(),
          category,
          products: Array.from({ length: 3 }, (_, pIndex) => {
            const imgIndex = index * 3 + pIndex;
            return {
              id: `prod-${index}-${pIndex}`,
              name: faker.commerce.productName(),
              price: parseFloat(faker.commerce.price({ min: 20, max: 500 })),
              image_url:
                photoUrls[imgIndex] ||
                `https://picsum.photos/seed/fashion-${imgIndex}/320/320`,
              type: faker.commerce.productMaterial(),
            };
          }),
        };
      });

      setStores(mock);
    }

    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedTab !== "Stylists") return;

    async function fetchStylists() {
      const { data, error } = await supabase
        .from("stylists")
        .select("id, name, image_url");

      if (error || !data || data.length === 0) {
        const mockStylists: Stylist[] = Array.from(
          { length: 6 },
          (_, index) => ({
            id: `sty-${index}`,
            name: faker.person.fullName(),
            image_url: `https://picsum.photos/seed/stylist-${index}/320/320`,
          }),
        );
        setStylists(mockStylists);
      } else {
        setStylists(data);
      }
    }

    fetchStylists();
  }, [selectedTab]);

  const filteredStores =
    selectedTab === "All"
      ? stores
      : selectedTab === "Stylists"
        ? []
        : stores.filter((s) => s.category === selectedTab);

  const visibleStores = filteredStores.slice(0, page * pageSize);

  const allProducts = stores.flatMap((store) =>
    store.products
      .filter((prod) => {
        const search = searchTerm.toLowerCase();
        return (
          prod.name.toLowerCase().includes(search) ||
          store.name.toLowerCase().includes(search) ||
          prod.type.toLowerCase().includes(search)
        );
      })
      .map((prod) => ({
        ...prod,
        storeName: store.name,
        storeId: store.id,
      })),
  );

  const filteredStylists = stylists.filter((stylist) =>
    stylist.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setPage((p) => p + 1),
      { rootMargin: "200px" },
    );
    obs.observe(loadMoreRef.current);
    return () => obs.disconnect();
  }, [selectedTab]);

  return (
    <Layout>
      <div
        className="min-h-screen p-8 text-white"
        style={{
          backgroundImage: `url('/bg/background.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mt-8 mb-6">
          <nav className="flex space-x-4 overflow-x-auto mb-4">
            {categories.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setSelectedTab(tab);
                  setPage(1);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition ${
                  selectedTab === tab
                    ? "bg-gold text-black"
                    : "bg-black/50 text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 rounded bg-black/60 text-white border border-gold placeholder:text-gray-300"
          />
        </div>

        {selectedTab === "Stylists" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredStylists.map((stylist) => (
              <div
                key={stylist.id}
                className="bg-black/70 p-6 rounded-lg hover:shadow-xl transition text-center"
              >
                <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                  <Image
                    src={stylist.image_url}
                    alt={stylist.name}
                    width={128}
                    height={128}
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <h2 className="text-xl font-bold text-gold">{stylist.name}</h2>
                <Link href={`/stylists/${stylist.id}`}>
                  <button className="mt-3 px-4 py-2 bg-gold text-black rounded font-medium hover:bg-gold/80 transition">
                    View Bundles
                  </button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {(selectedTab === "All"
                ? allProducts
                : visibleStores.flatMap((store) =>
                    store.products.map((prod) => ({
                      ...prod,
                      storeName: store.name,
                      storeId: store.id,
                    })),
                  )
              ).map((prod) => (
                <div
                  key={prod.id}
                  className="bg-gray-900 p-4 rounded-lg shadow hover:scale-[1.01] transition"
                >
                  <Link href={`/stores/${prod.storeId}/products/${prod.id}`}>
                    <div className="relative w-full h-60 rounded overflow-hidden mb-3">
                      <Image
                        src={prod.image_url}
                        alt={prod.name}
                        width={320}
                        height={240}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </Link>
                  <p className="text-xs text-gold font-semibold uppercase mb-1">
                    {prod.storeName}
                  </p>
                  <h3 className="text-white font-semibold text-lg">
                    {prod.name}
                  </h3>
                  <p className="text-sm text-gray-400">${prod.price}</p>
                  <button
                    onClick={() =>
                      addItem({
                        id: prod.id,
                        name: prod.name,
                        price: prod.price,
                        image_url: prod.image_url,
                        quantity: 1,
                      })
                    }
                    className={`mt-3 w-full py-2 rounded text-sm font-semibold transition ${
                      hasItem(prod.id)
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-gold text-black hover:bg-gold/80"
                    }`}
                    disabled={hasItem(prod.id)}
                  >
                    {hasItem(prod.id) ? "Added" : "Add to Cart"}
                  </button>
                </div>
              ))}
            </div>
            <div ref={loadMoreRef} className="h-10" />
          </>
        )}
      </div>
    </Layout>
  );
}
