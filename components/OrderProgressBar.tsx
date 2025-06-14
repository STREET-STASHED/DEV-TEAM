

import React from 'react';

type OrderProgressBarProps = {
  status: string;
};

const statusSteps = ['pending', 'packed', 'ready', 'picked_up', 'delivered'];

const OrderProgressBar: React.FC<OrderProgressBarProps> = ({ status }) => {
  const currentStep = statusSteps.indexOf(status);

  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        {statusSteps.map((label, index) => (
          <span key={index}>{label.replace('_', ' ')}</span>
        ))}
      </div>
      <div className="flex w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
        {statusSteps.map((_, index) => (
          <div
            key={index}
            className={`h-full transition-all duration-300 ${
              currentStep >= index ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            style={{ width: `${100 / statusSteps.length}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export default OrderProgressBar;