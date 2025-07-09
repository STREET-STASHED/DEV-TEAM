// Static visitor-facing page. No onboarding/profile logic should be loaded here.
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>StreetStashed</title>
        <meta name="description" content="Your curated fashion delivery experience starts here" />
      </Head>
      <div className="min-h-screen w-full bg-cover bg-center bg-no-repeat text-white" style={{ backgroundImage: 'url("/bg/background.png")' }}>
        <main className="flex flex-col items-center justify-start w-full max-w-screen-xl mx-auto px-4 py-12">
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">Welcome to StreetStashed</h1>
          <p className="text-lg md:text-xl mb-8 drop-shadow">Your curated fashion delivery experience starts here.</p>
          <div className="flex justify-center gap-4">
            <Link href="/marketplace" className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition">Shop Now</Link>
            <Link href="/signup" className="bg-white text-black px-6 py-3 rounded hover:bg-gray-200 transition">Join Us</Link>
          </div>
        </div>

        {/* Categories Section */}
        <section className="mt-16 px-6 max-w-6xl w-full">
          <h2 className="text-3xl font-bold mb-6">Explore Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Streetwear', 'Luxury', 'Accessories', 'Shoes'].map((category) => (
              <Link key={category} href={`/category/${category.toLowerCase()}`} className="bg-white bg-opacity-20 backdrop-blur-md p-4 rounded text-center hover:bg-opacity-30 transition">
                {category}
              </Link>
            ))}
          </div>
        </section>

        {/* Featured/Trending Items Section */}
        <section className="mt-20 px-6 max-w-6xl w-full">
          <h2 className="text-3xl font-bold mb-6">Trending Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white bg-opacity-20 backdrop-blur-md p-4 rounded shadow">
                <div className="h-40 bg-gray-200 mb-4 rounded">Image {item}</div>
                <h3 className="text-xl font-semibold mb-2">Item {item}</h3>
                <p className="text-sm">Short description of item {item}</p>
              </div>
            ))}
          </div>
        </section>
        </main>
      </div>
    </>
  );
}