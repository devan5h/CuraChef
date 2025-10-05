import React, { useState, useEffect } from 'react';
import { UserPreferences } from '../types';
import { CUISINE_CHOICES, DIETARY_RESTRICTIONS, HEALTH_GOALS, ALLERGIES, BUDGET_OPTIONS } from '../constants';

interface UserPreferencesFormProps {
  initialPreferences: UserPreferences;
  onSave: (preferences: UserPreferences) => void;
}

const UserPreferencesForm: React.FC<UserPreferencesFormProps> = ({ initialPreferences, onSave }) => {
  const [prefs, setPrefs] = useState<UserPreferences>(initialPreferences);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setPrefs(initialPreferences);
  }, [initialPreferences]);

  const handleCheckboxChange = (category: 'dietaryRestrictions' | 'favoriteCuisines' | 'healthGoals' | 'allergies', value: string) => {
    const currentValues = prefs[category] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    setPrefs({ ...prefs, [category]: newValues });
  };

  const handleCalorieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrefs({ ...prefs, dailyCalorieGoal: e.target.value === '' ? '' : parseInt(e.target.value, 10) });
  };
  
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrefs({ ...prefs, budget: e.target.value });
  };

  const handleOtherHealthGoalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrefs({ ...prefs, otherHealthGoals: e.target.value });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(prefs);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const renderCheckboxGroup = (title: string, options: string[], category: 'dietaryRestrictions' | 'favoriteCuisines' | 'healthGoals' | 'allergies') => (
    <div className="p-6 bg-gray-50/70 rounded-xl border border-gray-200">
      <h3 className="text-xl font-semibold font-serif text-gray-700 mb-4">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {options.map(option => (
          <label key={option} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              checked={(prefs[category] || []).includes(option)}
              onChange={() => handleCheckboxChange(category, option)}
            />
            <span className="text-gray-700 font-medium">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
      {renderCheckboxGroup('Dietary Restrictions', DIETARY_RESTRICTIONS, 'dietaryRestrictions')}
      {renderCheckboxGroup('Allergies (select to avoid)', ALLERGIES, 'allergies')}
      {renderCheckboxGroup('Favorite Cuisines', CUISINE_CHOICES, 'favoriteCuisines')}
      
      <div className="p-6 bg-gray-50/70 rounded-xl border border-gray-200">
        <h3 className="text-xl font-semibold font-serif text-gray-700 mb-4">Health Goals</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {HEALTH_GOALS.map(option => (
            <label key={option} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <input
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                checked={(prefs['healthGoals'] || []).includes(option)}
                onChange={() => handleCheckboxChange('healthGoals', option)}
                />
                <span className="text-gray-700 font-medium">{option}</span>
            </label>
            ))}
        </div>
        <div className="mt-6">
          <label htmlFor="otherHealthGoals" className="block text-sm font-medium text-gray-600 mb-2">
            Other (optional)
          </label>
          <input
            id="otherHealthGoals"
            type="text"
            placeholder="e.g., Better sleep, more plant-based meals"
            value={prefs.otherHealthGoals || ''}
            onChange={handleOtherHealthGoalsChange}
            className="w-full max-w-lg p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-shadow duration-200 shadow-sm"
          />
        </div>
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-gray-50/70 rounded-xl border border-gray-200">
                <h3 className="text-xl font-semibold font-serif text-gray-700 mb-4">Budget Preference</h3>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                {BUDGET_OPTIONS.map(option => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <input
                        type="radio"
                        name="budget"
                        value={option.value}
                        checked={(prefs.budget || '') === option.value}
                        onChange={handleBudgetChange}
                        className="h-5 w-5 border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-700 font-medium">{option.label}</span>
                    </label>
                ))}
                </div>
            </div>
            <div className="p-6 bg-gray-50/70 rounded-xl border border-gray-200">
                <h3 className="text-xl font-semibold font-serif text-gray-700 mb-4">Daily Calorie Goal</h3>
                <input
                type="number"
                placeholder="e.g., 2000"
                value={prefs.dailyCalorieGoal || ''}
                onChange={handleCalorieChange}
                className="w-full max-w-xs p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-shadow duration-200 shadow-sm"
                />
                <p className="text-xs text-gray-500 mt-2">Leave blank if you don't want to specify.</p>
            </div>
       </div>

      
      <div className="mt-8 text-center">
        <button
          type="submit"
          className="bg-green-500 text-white font-bold py-3 px-10 rounded-full text-lg shadow-lg hover:bg-green-600 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300 flex items-center justify-center gap-3 mx-auto"
        >
          <i className="fa-solid fa-save"></i>
          Save Preferences
        </button>
        {isSaved && (
          <p className="text-green-600 mt-4 font-semibold animate-fade-in">
            <i className="fa-solid fa-check-circle mr-2"></i>
            Your preferences have been saved!
          </p>
        )}
      </div>
    </form>
  );
};

export default UserPreferencesForm;