

import React from 'react';
import Link from 'next/link';

const SuccessPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 text-center px-4">
      <h1 className="text-4xl font-bold text-green-700 mb-4">Payment Successful</h1>
      <p className="text-lg text-green-800 mb-6">Thank you for your order. You’ll receive a confirmation email shortly.</p>
      <Link href="/">
        <a className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition">Return to Home</a>
      </Link>
    </div>
  );
};

export default SuccessPage;