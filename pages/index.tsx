// Static visitor-facing page. No onboarding/profile logic should be loaded here.
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/Header"; // Add this near the top

const mockProducts = [
  {
    id: 1,
    name: "Glow Runner 9000",
    store: "Molten Footwear",
    category: "Shoes",
    price: 120,
    image: "https://picsum.photos/seed/fashion-1/320/320",
  },
  {
    id: 2,
    name: "StashFit Hoodie",
    store: "Urban Threads",
    category: "Streetwear",
    price: 85,
    image: "https://picsum.photos/seed/fashion-2/320/320",
  },
  {
    id: 3,
    name: "Luxury Crossbody",
    store: "Elite Bags",
    category: "Accessories",
    price: 210,
    image: "https://picsum.photos/seed/fashion-3/320/320",
  },
  {
    id: 4,
    name: "Gold Accent Shades",
    store: "SunStyle",
    category: "Accessories",
    price: 60,
    image: "https://picsum.photos/seed/fashion-4/320/320",
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>StreetStashed</title>
        <meta
          name="description"
          content="Your curated fashion delivery experience starts here"
        />
      </Head>
      <div className="min-h-screen w-full bg-black text-white">
        <main className="flex flex-col items-center justify-start w-full max-w-screen-xl mx-auto px-4 py-12">
          {/* Header with Logo and Expanded Nav */}
          <SiteHeader />
          <div className="text-center px-4">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-yellow-400 drop-shadow-lg">
              StreetStashed
            </h1>
            <p className="text-lg md:text-xl mb-8 drop-shadow">
              Your curated fashion delivery experience starts here.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/buyer/marketplace" scroll={false}>
                <button className="bg-yellow-400 text-black px-6 py-3 rounded font-semibold hover:bg-yellow-300 transition">
                  Start Browsing
                </button>
              </Link>
              <Link href="/signup" scroll={false}>
                <button className="bg-yellow-400 text-black px-6 py-3 rounded hover:bg-yellow-300 transition">
                  Join Us
                </button>
              </Link>
              <Link href="/login" scroll={false}>
                <button className="bg-yellow-400 text-black px-6 py-3 rounded hover:bg-yellow-300 transition">
                  Welcome Back
                </button>
              </Link>
            </div>
          </div>

          {/* Categories Section */}
          <section className="mt-16 px-6 max-w-6xl w-full">
            <h2 className="text-3xl font-bold mb-6">Explore Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Streetwear", "Luxury", "Accessories", "Shoes"].map(
                (category) => (
                  <Link
                    key={category}
                    href={`/buyer/marketplace#${category.toLowerCase()}`}
                    className="bg-yellow-400 text-black font-semibold py-2 px-4 rounded-full text-center hover:bg-yellow-300 transition"
                  >
                    {category}
                  </Link>
                ),
              )}
            </div>
          </section>

          {/* Featured/Trending Items Section */}
          <section className="mt-20 px-6 max-w-6xl w-full">
            <h2 className="text-3xl font-bold mb-6">Trending Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mockProducts.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-900 p-4 rounded shadow text-white"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={300}
                    height={300}
                    style={{ width: "100%", height: "auto" }}
                    className="rounded object-cover mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-1">{item.name}</h3>
                  <p className="text-sm mb-1 text-yellow-400">{item.store}</p>
                  <p className="text-sm font-semibold mb-2">${item.price}</p>
                  <button className="mt-2 bg-yellow-400 text-black font-semibold py-1 px-3 rounded hover:bg-yellow-300 transition">
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
