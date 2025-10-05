import React from 'react';
import { NutritionInfo } from '../types';

interface RecipeNutritionInfoProps {
  info: NutritionInfo | null;
  isLoading: boolean;
  error: string | null;
}

const RecipeNutritionInfo: React.FC<RecipeNutritionInfoProps> = ({ info, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-500 mr-3"></div>
        <span className="text-gray-600">Analyzing nutrition...</span>
      </div>
    );
  }

  if (error) {
    return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm text-center">
            <i className="fa-solid fa-triangle-exclamation mr-2"></i>
            {error}
        </div>
    );
  }

  if (!info) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg text-gray-700 mb-2">Nutritional Info <span className="text-sm font-normal text-gray-500">(per serving)</span></h4>
      
      <div className="bg-gradient-to-r from-green-50 to-cyan-50 p-4 rounded-xl text-center">
        <div className="flex justify-center items-baseline gap-2">
          <p className="text-3xl font-bold text-green-600">{info.calories.perServing}</p>
          <p className="text-gray-600">Calories</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-green-100 p-2 rounded-lg">
            <p className="font-bold text-green-800 text-sm">{info.macros.protein}</p>
            <p className="text-xs text-green-700">Protein</p>
          </div>
          <div className="bg-cyan-100 p-2 rounded-lg">
            <p className="font-bold text-cyan-800 text-sm">{info.macros.carbohydrates}</p>
            <p className="text-xs text-cyan-700">Carbs</p>
          </div>
          <div className="bg-amber-100 p-2 rounded-lg">
            <p className="font-bold text-amber-800 text-sm">{info.macros.fat}</p>
            <p className="text-xs text-amber-700">Fat</p>
          </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
              <h5 className="font-semibold text-gray-600 mb-1">Vitamins</h5>
              <ul className="space-y-1">
                  {info.vitamins.slice(0, 5).map((v, i) => (
                      <li key={i} className="flex justify-between text-gray-600">
                          <span>{v.name}</span>
                          <span className="font-medium">{v.amount}</span>
                      </li>
                  ))}
              </ul>
          </div>
          <div>
              <h5 className="font-semibold text-gray-600 mb-1">Minerals</h5>
              <ul className="space-y-1">
                  {info.minerals.slice(0, 5).map((m, i) => (
                      <li key={i} className="flex justify-between text-gray-600">
                          <span>{m.name}</span>
                          <span className="font-medium">{m.amount}</span>
                      </li>
                  ))}
              </ul>
          </div>
      </div>
    </div>
  );
};

export default RecipeNutritionInfo;