
import React from 'react';
import { DietaryPlan } from '../types';

interface DietaryPlanCardProps {
  plan: DietaryPlan;
}

const DietaryPlanCard: React.FC<DietaryPlanCardProps> = ({ plan }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-4xl mx-auto animate-fade-in border-t-8 border-cyan-400">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-800">Dietary Plan for {plan.condition}</h3>
      </div>

      <div className="mb-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
            <i className="fa-solid fa-book-medical mr-3"></i>
            Key Guidelines
        </h4>
        <p className="text-blue-700">{plan.guidelines}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-green-50 p-6 rounded-lg">
          <h4 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
            <i className="fa-solid fa-thumbs-up mr-3"></i>
            Foods to Favor
          </h4>
          <ul className="space-y-2">
            {plan.foodsToFavor.map((food, i) => (
              <li key={i} className="flex items-start">
                <i className="fa-solid fa-check text-green-500 mt-1 mr-3"></i>
                <span className="text-gray-700">{food}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-50 p-6 rounded-lg">
          <h4 className="text-xl font-semibold text-red-800 mb-4 flex items-center">
            <i className="fa-solid fa-ban mr-3"></i>
            Foods to Avoid
          </h4>
          <ul className="space-y-2">
            {plan.foodsToAvoid.map((food, i) => (
              <li key={i} className="flex items-start">
                <i className="fa-solid fa-times text-red-500 mt-1 mr-3"></i>
                <span className="text-gray-700">{food}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-800 text-center mt-12 mb-6">Recommended Recipes</h3>
    </div>
  );
};

export default DietaryPlanCard;
