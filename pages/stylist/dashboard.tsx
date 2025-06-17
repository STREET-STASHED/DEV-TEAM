import React from 'react';

interface StylistDashboardProps {
  userId: string;
}

const StylistDashboard: React.FC<StylistDashboardProps> = ({ userId }) => {
  return (
    <div>
      {/* Stylist dashboard content */}
      <p>User ID: {userId}</p>
    </div>
  );
};

export default StylistDashboard;