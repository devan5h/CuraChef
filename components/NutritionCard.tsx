
import React from 'react';
import { NutritionInfo } from '../types';

interface NutritionCardProps {
  info: NutritionInfo;
}

const NutritionCard: React.FC<NutritionCardProps> = ({ info }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-3xl mx-auto animate-fade-in">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-800">{info.mealName}</h3>
        <p className="text-gray-500">Nutritional Analysis</p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-cyan-50 p-6 rounded-xl mb-6 text-center">
        <h4 className="text-xl font-semibold text-gray-700 mb-2">Calories</h4>
        <div className="flex justify-center items-baseline gap-4">
          <p className="text-5xl font-bold text-green-600">{info.calories.total}</p>
          <p className="text-gray-600">Total</p>
        </div>
        <p className="text-gray-500 mt-1">({info.calories.perServing} per serving)</p>
      </div>
      
      <div className="mb-6">
        <h4 className="text-xl font-semibold text-gray-700 mb-3 text-center">Macronutrients</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-green-100 p-4 rounded-lg">
            <p className="font-bold text-green-800 text-lg">{info.macros.protein}</p>
            <p className="text-sm text-green-700">Protein</p>
          </div>
          <div className="bg-cyan-100 p-4 rounded-lg">
            <p className="font-bold text-cyan-800 text-lg">{info.macros.carbohydrates}</p>
            <p className="text-sm text-cyan-700">Carbs</p>
          </div>
          <div className="bg-amber-100 p-4 rounded-lg">
            <p className="font-bold text-amber-800 text-lg">{info.macros.fat}</p>
            <p className="text-sm text-amber-700">Fat</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-xl font-semibold text-gray-700 mb-3 text-center">Vitamins</h4>
          <ul className="space-y-2">
            {info.vitamins.map((v, i) => (
              <li key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="text-gray-700">{v.name}</span>
                <span className="font-semibold text-gray-800">{v.amount}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xl font-semibold text-gray-700 mb-3 text-center">Minerals</h4>
          <ul className="space-y-2">
            {info.minerals.map((m, i) => (
              <li key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="text-gray-700">{m.name}</span>
                <span className="font-semibold text-gray-800">{m.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NutritionCard;
