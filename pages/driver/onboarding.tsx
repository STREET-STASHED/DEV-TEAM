

import React from 'react';
import { useRouter } from 'next/router';

const DriverOnboarding: React.FC = () => {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Welcome, Stasher 👋</h1>
        <p className="text-gray-600 text-lg">
          You’re now part of the StreetStashed crew. As a Stasher, you’ll help deliver culture across the city—one drop at a time.
        </p>

        <ul className="text-left list-disc list-inside text-gray-700 space-y-1">
          <li>💼 Accept delivery requests in real-time</li>
          <li>📦 Pick up and drop off streetwear and essentials</li>
          <li>💰 Earn based on distance + priority rates</li>
          <li>📍 Must stay within coverage zone (20-mile radius)</li>
          <li>🕒 Drivers can choose availability and deny late requests</li>
        </ul>

        <button
          onClick={handleContinue}
          className="mt-6 inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-900 transition"
        >
          Let’s Get It
        </button>
      </div>
    </div>
  );
};

export default DriverOnboarding;