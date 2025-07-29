// pages/buyer/marketplace.tsx
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { faker } from "@faker-js/faker";

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

  // Fetch stores
  useEffect(() => {
    async function fetchStores() {
      const categories = ["Streetwear", "Luxury", "Essentials", "Shoes"];

      let photoUrls: string[] = [];
      try {
        const res = await fetch(
          "https://api.pexels.com/v1/search?query=fashion&per_page=12",
          {
            headers: {
              Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY!,
            },
          }
        );
        const json = await res.json();
        photoUrls = json.photos.map((p: any) => p.src.medium);
      } catch (err) {
        console.error("Pexels API error:", err);
      }

      const defaultMockStores: Store[] = Array.from({ length: 9 }, (_, index) => {
        const category = categories[index % categories.length];
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

      setStores(defaultMockStores);
    }

    fetchStores();
  }, []);

  // Fetch stylists
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

  // Categories from stores + manual "Stylists"
  const categories = [
    "All",
    "Stylists",
    "Streetwear",
    "Luxury",
    "Essentials",
    "Shoes",
  ];

  // Filter + paginate stores
  const filteredStores =
    selectedTab === "All"
      ? stores
      : selectedTab === "Stylists"
        ? []
        : stores.filter((s) => s.category === selectedTab);

  const visibleStores = filteredStores.slice(0, page * pageSize);

  // Flatten all products with store info, filtered by search term, including product name, store name, and product type
  const allProducts = stores.flatMap((store) =>
    store.products
      .filter((prod) => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          prod.name.toLowerCase().includes(lowerSearch) ||
          store.name.toLowerCase().includes(lowerSearch) ||
          prod.type.toLowerCase().includes(lowerSearch)
        );
      })
      .map((prod) => ({
        ...prod,
        storeName: store.name,
        storeId: store.id,
      }))
  );

  const filteredStylists = stylists.filter((stylist) =>
    stylist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setPage((p) => p + 1),
      { rootMargin: "200px" },
    );
    obs.observe(loadMoreRef.current);
    return () => obs.disconnect();
  }, [loadMoreRef.current, selectedTab]);

  return (
    <div
      className="min-h-screen p-8 text-white"
      style={{
        backgroundImage: `url('/bg/background.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* TOP NAV */}
      <nav className="flex space-x-4 overflow-x-auto mb-8">
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
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1); // Reset pagination on new search
          }}
          className="w-full px-4 py-2 rounded bg-black/60 text-white border border-gold placeholder:text-gray-300"
        />
      </div>

      {/* CONTENT */}
      {selectedTab === "Stylists" ? (
        // Stylists View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredStylists.map((stylist) => (
            <div
              key={stylist.id}
              className="bg-black/70 p-6 rounded-lg hover:shadow-xl transition text-center"
            >
              <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                <Image
                  src={stylist.image_url || "/mock/default-stylist.jpg"}
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
        // Stores View
        <>
          {selectedTab === "All" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {allProducts.map((prod) => (
                <div key={prod.id} className="bg-gray-900 p-4 rounded-lg shadow hover:scale-[1.01] transition">
                  <Link href={`/stores/${prod.storeId}/products/${prod.id}`}>
                    <div className="relative w-full h-60 rounded overflow-hidden mb-3">
                      <Image
                        src={prod.image_url || "https://loremflickr.com/320/320/fashion?lock=default"}
                        alt={prod.name}
                        width={320}
                        height={240}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </Link>
                  <p className="text-xs text-gold font-semibold uppercase mb-1">{prod.storeName}</p>
                  <h3 className="text-white font-semibold text-lg">{prod.name}</h3>
                  <p className="text-sm text-gray-400">${prod.price}</p>
                  <button
                    onClick={() =>
                      addItem({
                        id: prod.id,
                        name: prod.name,
                        price: prod.price,
                        image: prod.image_url,
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {visibleStores.map((store) => (
                <div
                  key={store.id}
                  className="bg-black/70 p-6 rounded-lg hover:shadow-xl transition"
                >
                  <h2 className="text-2xl font-bold text-gold mb-2">
                    {store.name}
                  </h2>
                  <p className="text-sm text-gray-300 mb-4">
                    Arrives in under 1hr
                  </p>
                  <div className="flex flex-wrap gap-4 mb-4">
                    {store.products.map((prod) => (
                      <div key={prod.id} className="w-[90px] text-center">
                        <Link href={`/stores/${store.id}/products/${prod.id}`}>
                          <div className="relative w-full h-[90px] rounded-lg border border-gray-600 overflow-hidden hover:scale-105 transition">
                            <Image
                              src={
                                prod.image_url ||
                                "https://loremflickr.com/320/320/fashion?lock=default"
                              }
                              alt={prod.name}
                              width={90}
                              height={90}
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        </Link>
                        <p className="mt-1 text-sm font-medium text-white">
                          {prod.name}
                        </p>
                        <p className="text-xs text-gray-400">${prod.price}</p>
                        <button
                          onClick={() =>
                            addItem({
                              id: prod.id,
                              name: prod.name,
                              price: prod.price,
                              image: prod.image_url,
                              quantity: 1,
                            })
                          }
                          className={`mt-2 px-2 py-1 rounded text-xs font-semibold transition ${
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
                </div>
              ))}
            </div>
          )}
          {/* Infinite scroll sentinel */}
          <div ref={loadMoreRef} className="h-10" />
        </>
      )}
    </div>
  );
}
