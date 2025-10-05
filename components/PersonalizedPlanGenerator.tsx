import React, { useState } from 'react';

type PlanDuration = 'Daily' | 'Weekly' | 'Monthly';

interface PersonalizedPlanGeneratorProps {
  onGeneratePlan: (duration: PlanDuration) => void;
  isLoading: boolean;
}

const PersonalizedPlanGenerator: React.FC<PersonalizedPlanGeneratorProps> = ({ onGeneratePlan, isLoading }) => {
  const [duration, setDuration] = useState<PlanDuration>('Weekly');

  const options: { value: PlanDuration; label: string; icon: string }[] = [
    { value: 'Daily', label: 'Daily Plan', icon: 'fa-calendar-day' },
    { value: 'Weekly', label: 'Weekly Plan', icon: 'fa-calendar-week' },
    { value: 'Monthly', label: 'Monthly Plan', icon: 'fa-calendar-alt' },
  ];

  const handleSubmit = () => {
    onGeneratePlan(duration);
  };

  return (
    <div className="text-center">
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Your Plan Duration</h3>
        <div className="inline-flex rounded-full bg-gray-100 p-1 shadow-inner">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => setDuration(option.value)}
              className={`
                px-6 py-3 text-sm font-semibold transition-all duration-300 rounded-full
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 z-10
                flex items-center gap-2
                ${duration === option.value ? 'bg-white text-green-600 shadow-md' : 'bg-transparent text-gray-500 hover:text-gray-800'}
              `}
            >
              <i className={`fa-solid ${option.icon}`}></i>
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="bg-green-500 text-white font-bold py-3 px-10 rounded-full text-lg shadow-lg hover:bg-green-600 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-3 mx-auto"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            Generate My Plan
          </>
        )}
      </button>
    </div>
  );
};

export default PersonalizedPlanGenerator;