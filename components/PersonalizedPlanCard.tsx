import React, { useState } from 'react';
import { PersonalizedPlan, Recipe, UserPreferences } from '../types';
import { generateRecipeForPlan } from '../services/geminiService';
import RecipeCard from './RecipeCard';
import LoadingSpinner from './LoadingSpinner';

interface MealItemProps {
  meal: PersonalizedPlan['days'][0]['meals'][0];
  preferences: UserPreferences;
}

const MealItem: React.FC<MealItemProps> = ({ meal, preferences }) => {
  const [fullRecipe, setFullRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = async () => {
    const shouldExpand = !isExpanded;
    setIsExpanded(shouldExpand);

    if (shouldExpand && !fullRecipe && !error) { // Fetch only if expanding and not already fetched
        setIsLoading(true);
        try {
            const recipeDetails = await generateRecipeForPlan(meal.recipe.title, meal.recipe.description, preferences);
            setFullRecipe(recipeDetails);
        } catch (err) {
            setError('Failed to load recipe details. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300">
      <button
        onClick={handleToggleExpand}
        className="w-full flex justify-between items-center text-left p-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-400"
        aria-expanded={isExpanded}
      >
        <div>
          <h5 className="text-lg font-bold text-gray-800">{meal.name}: <span className="font-semibold text-green-700">{meal.recipe.title}</span></h5>
          <p className="text-sm text-gray-600 mt-1 pr-4">{meal.recipe.description}</p>
        </div>
        <i className={`fa-solid fa-chevron-down text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}></i>
      </button>
      {isExpanded && (
        <div className="p-4 bg-white animate-fade-in border-t border-gray-200">
          {isLoading && <div className="py-8"><LoadingSpinner message="Unpacking recipe..." /></div>}
          {error && <p className="text-red-500 text-center p-4">{error}</p>}
          {fullRecipe && <RecipeCard recipe={fullRecipe} />}
        </div>
      )}
    </div>
  );
};

interface DailyPlanProps {
  dayData: PersonalizedPlan['days'][0];
  preferences: UserPreferences;
}

const DailyPlan: React.FC<DailyPlanProps> = ({ dayData, preferences }) => {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
        <h4 className="text-md font-semibold text-green-800 text-center">Daily Nutrition Summary</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mt-3">
          <div>
            <p className="font-bold text-green-700 text-xl">{dayData.dailyTotals.calories}</p>
            <p className="text-sm text-gray-600">Calories</p>
          </div>
          <div>
            <p className="font-bold text-green-700 text-xl">{dayData.dailyTotals.protein}</p>
            <p className="text-sm text-gray-600">Protein</p>
          </div>
          <div>
            <p className="font-bold text-green-700 text-xl">{dayData.dailyTotals.carbs}</p>
            <p className="text-sm text-gray-600">Carbs</p>
          </div>
          <div>
            <p className="font-bold text-green-700 text-xl">{dayData.dailyTotals.fat}</p>
            <p className="text-sm text-gray-600">Fat</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {dayData.meals.map((meal, mealIndex) => (
           <MealItem key={mealIndex} meal={meal} preferences={preferences} />
        ))}
      </div>
    </div>
  );
};

interface PersonalizedPlanCardProps {
  plan: PersonalizedPlan;
  preferences: UserPreferences;
}

const PersonalizedPlanCard: React.FC<PersonalizedPlanCardProps> = ({ plan, preferences }) => {
  const [openDayIndex, setOpenDayIndex] = useState<number | null>(0);

  const toggleDay = (index: number) => {
    setOpenDayIndex(openDayIndex === index ? null : index);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-7xl mx-auto animate-fade-in border border-gray-100">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold font-serif text-gray-800">{plan.title}</h3>
        <p className="text-gray-600 mt-2 max-w-3xl mx-auto">{plan.summary}</p>
      </div>

      <div className="space-y-4">
        {plan.days.map((day, index) => (
          <div key={index} className="border border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden transition-all duration-300">
            <button
              onClick={() => toggleDay(index)}
              className="w-full flex justify-between items-center p-5 text-left hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-400"
              aria-expanded={openDayIndex === index}
            >
              <h4 className="text-xl font-semibold font-serif text-gray-700">{day.day}</h4>
              <i className={`fa-solid fa-chevron-down text-gray-500 transition-transform duration-300 ${openDayIndex === index ? 'rotate-180' : ''}`}></i>
            </button>
            {openDayIndex === index && (
              <div className="p-6 bg-white animate-fade-in border-t border-gray-200">
                <DailyPlan dayData={day} preferences={preferences} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalizedPlanCard;