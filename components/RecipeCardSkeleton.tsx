import React from 'react';

const RecipeCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col animate-pulse">
      <div className="relative h-56 bg-gray-200"></div>
      <div className="p-6 flex-grow flex flex-col">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
        
        <div className="flex justify-around items-center border-t border-gray-100 py-4 mt-auto">
            <div className="w-1/4 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-1/4 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-1/4 h-8 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
       <div className="border-t border-gray-100 mt-auto grid grid-cols-2 divide-x divide-gray-100 bg-gray-50">
          <div className="h-14 bg-gray-100"></div>
          <div className="h-14 bg-gray-100"></div>
       </div>
    </div>
  );
};

export default RecipeCardSkeleton;