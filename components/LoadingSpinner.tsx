import React from 'react';

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Deep Thinkers are thinking..." }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 rounded-lg">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4"></div>
      <p className="text-lg font-semibold text-gray-700">{message}</p>
      <p className="text-sm text-gray-500 mt-1">This may take a few moments.</p>
    </div>
  );
};

export default LoadingSpinner;
