import React, { useState, useEffect } from 'react';
import { Recipe, NutritionInfo } from '../types';
import { generateNutritionForRecipe } from '../services/geminiService';
import RecipeNutritionInfo from './RecipeNutritionInfo';

interface RecipeCardProps {
  recipe: Recipe;
}

const InfoPill: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-1.5 font-bold text-gray-700">
            <i className={`fa-solid ${icon} text-amber-500`}></i>
            <span>{value}</span>
        </div>
        <p className="text-xs text-gray-500">{label}</p>
    </div>
);

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [isCopied, setIsCopied] = useState(false);

  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isNutritionExpanded, setIsNutritionExpanded] = useState(false);
  
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const [isNutritionLoading, setIsNutritionLoading] = useState(false);
  const [nutritionError, setNutritionError] = useState<string | null>(null);

  useEffect(() => {
    setImageStatus('loading');
    const stockPhotoUrl = `https://source.unsplash.com/500x500/?${encodeURIComponent(recipe.title)}`;
    setImageUrl(stockPhotoUrl);
  }, [recipe.title]);


  const handleCopyIngredients = () => {
    const ingredientsText = recipe.ingredients.join('\n');
    navigator.clipboard.writeText(ingredientsText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy ingredients:', err);
    });
  };

  const handleToggleDetails = () => {
    setIsDetailsExpanded(!isDetailsExpanded);
  };

  const handleToggleNutrition = async () => {
    const expanding = !isNutritionExpanded;
    setIsNutritionExpanded(expanding);

    if (expanding && !nutritionInfo && !nutritionError) {
      setIsNutritionLoading(true);
      try {
        const nutritionData = await generateNutritionForRecipe(recipe);
        setNutritionInfo(nutritionData);
      } catch (err) {
        setNutritionError(err instanceof Error ? err.message : 'Could not fetch nutrition info.');
      } finally {
        setIsNutritionLoading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col animate-fade-in-up transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5">
      <div className="relative h-56 bg-gray-200">
          {imageStatus === 'loading' && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
          )}
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={recipe.title} 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageStatus('loaded')}
              onError={() => setImageStatus('error')}
            />
          )}
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-2xl font-bold font-serif text-gray-800 mb-2 h-16 line-clamp-2">{recipe.title}</h3>
        <p className="text-gray-600 text-sm mb-4 h-20 line-clamp-3">{recipe.description}</p>
        
        <div className="flex justify-around items-center border-t border-gray-100 py-4 mt-auto">
            <InfoPill icon="fa-clock" label="Prep" value={recipe.prepTime} />
            <div className="h-8 border-l border-gray-200"></div>
            <InfoPill icon="fa-fire" label="Cook" value={recipe.cookTime} />
            <div className="h-8 border-l border-gray-200"></div>
            <InfoPill icon="fa-users" label="Serves" value={recipe.servings} />
        </div>

        {isDetailsExpanded && (
          <div className="mt-4 animate-fade-in space-y-6 border-t border-gray-100 pt-4">
            <div className="space-y-4 text-sm">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-lg font-serif text-gray-700">Ingredients</h4>
                        <button
                            onClick={handleCopyIngredients}
                            className={`text-xs font-semibold py-1 px-3 rounded-full transition-all duration-200 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-400
                              ${isCopied ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {isCopied ? (<><i className="fa-solid fa-check"></i>Copied</>) : (<><i className="fa-regular fa-copy"></i>Copy</>)}
                        </button>
                    </div>
                    <ul className="space-y-1.5 text-gray-600 list-disc list-inside marker:text-green-500">
                        {recipe.ingredients.map((ing, i) => <li key={i} className="pl-1">{ing}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-lg font-serif text-gray-700 mb-2">Instructions</h4>
                    <ol className="space-y-3 text-gray-600">
                        {recipe.instructions.map((inst, i) => (
                            <li key={i} className="flex gap-3">
                                <span className="flex-shrink-0 bg-green-500 text-white font-bold text-xs w-5 h-5 flex items-center justify-center rounded-full mt-0.5">{i + 1}</span>
                                <span>{inst}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
          </div>
        )}

        {isNutritionExpanded && (
            <div className="mt-4 animate-fade-in border-t border-gray-100 pt-4">
                <RecipeNutritionInfo 
                    info={nutritionInfo}
                    isLoading={isNutritionLoading}
                    error={nutritionError}
                />
            </div>
        )}
      </div>

      <div className="border-t border-gray-100 mt-auto grid grid-cols-2 divide-x divide-gray-100 bg-gray-50">
        <button
          onClick={handleToggleDetails}
          className="w-full text-center py-4 px-4 text-sm font-semibold text-green-600 hover:bg-green-50 transition-colors duration-200 flex items-center justify-center gap-2"
          aria-expanded={isDetailsExpanded}
        >
          <span>{isDetailsExpanded ? 'Hide Details' : 'View Recipe'}</span>
          <i className={`fa-solid fa-chevron-down transition-transform duration-300 ${isDetailsExpanded ? 'rotate-180' : ''}`}></i>
        </button>
        <button
          onClick={handleToggleNutrition}
          className="w-full text-center py-4 px-4 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors duration-200 flex items-center justify-center gap-2"
          aria-expanded={isNutritionExpanded}
        >
          <span>{isNutritionExpanded ? 'Hide Nutrition' : 'Show Nutrition'}</span>
          <i className={`fa-solid fa-chevron-down transition-transform duration-300 ${isNutritionExpanded ? 'rotate-180' : ''}`}></i>
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;