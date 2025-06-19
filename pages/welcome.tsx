import { useRouter } from 'next/router';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-yellow-400 font-graffiti">
      <h1 className="text-4xl mb-8">Welcome to StreetStashed</h1>
      <p className="mb-8 text-lg text-white">Shop the culture or join the crew.</p>
      <div className="flex gap-8">
        <button
          onClick={() => router.push('/buyer/marketplace')}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded text-xl"
        >
          Browse Marketplace
        </button>
        <button
          onClick={() => router.push('/login')}
          className="bg-white hover:bg-yellow-200 text-black font-bold py-3 px-8 rounded text-xl"
        >
          Join StreetStashed
        </button>
      </div>
    </div>
  );
}