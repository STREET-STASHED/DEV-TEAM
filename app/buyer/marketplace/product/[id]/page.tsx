import { Metadata } from "next";
import ProductReviewClient from "./ProductReviewClient";

type Props = {
  params: Promise<{ id: string }>
}

type Item = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string | null;
  created_at: string;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Product ${id}`,
    description: "Product details",
  };
}
async function getItem(id: string): Promise<Item | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/items`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const items: Item[] = data.items ?? [];
    return items.find((item: Item) => item.id === id) || null;
  } catch (error) {
    console.error("Error fetching item:", error);
    return null;
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const item = await getItem(id);

  if (!item) {
    return (
      <div className="container-premium py-8">
        <h1 className="text-xl font-semibold mb-2">Product not found</h1>
        <p>We couldn&apos;t find that item.</p>
      </div>
    );
  }
  console.log("PRODUCT PAGE RENDER");

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Product Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="aspect-square bg-ink-800 rounded-xl overflow-hidden">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-400">
                <svg
                  className="w-16 h-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {item.name}
              </h1>
              <p className="text-2xl font-bold text-purple-400 mb-4">
                ${item.price}
              </p>
              <p className="text-ink-300 leading-relaxed">{item.description}</p>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-ink-400">Category</h4>
                <p className="text-sm text-white">{item.category}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-ink-400">Added</h4>
                <p className="text-sm text-white">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Add to Cart
              </button>
              <button className="bg-ink-800 hover:bg-ink-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Review System */}
        <ProductReviewClient
          productId={item.id}
          productName={item.name}
          productImage={item.image || "/mock/default-product.jpg"}
        />
      </div>
    </div>
  );
}
