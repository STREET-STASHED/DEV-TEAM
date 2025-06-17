import React from 'react';

interface DriverDashboardProps {
  userId: string;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ userId }) => {
  return (
    <div>
      {/* Driver dashboard content */}
      <p>User ID: {userId}</p>
    </div>
  );
};

export default DriverDashboard;
