import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>StreetStashed</title>
        <meta name="description" content="The first on-demand fashion delivery app built for the culture." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen text-white font-urbanist bg-black bg-cover bg-center flex items-center justify-center">
        <h1 className="text-4xl mb-6">Welcome to StreetStashed</h1>
        <div className="space-x-4">
          <a href="/login">
            <button className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-300 transition">Sign In</button>
          </a>
          <a href="/onboarding">
            <button className="px-6 py-2 bg-transparent border border-yellow-400 text-yellow-400 font-semibold rounded hover:bg-yellow-400 hover:text-black transition">Sign Up</button>
          </a>
        </div>
      </div>
    </>
  );
}