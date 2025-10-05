import React from 'react';
import { Feature } from '../types';

interface FeatureTab {
  id: Feature;
  title: string;
  icon: string;
}

interface FeatureTabsProps {
  features: FeatureTab[];
  activeFeature: Feature;
  onSelectFeature: (feature: Feature) => void;
}

const FeatureTabs: React.FC<FeatureTabsProps> = ({ features, activeFeature, onSelectFeature }) => {
  return (
    <nav className="flex flex-col space-y-2">
      {features.map((feature) => {
        const isActive = activeFeature === feature.id;
        return (
          <button
            key={feature.id}
            onClick={() => onSelectFeature(feature.id)}
            className={`
              flex items-center gap-4 w-full text-left px-4 py-3 rounded-xl text-md font-semibold transition-all duration-200 
              focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-400
              ${
                isActive
                  ? 'bg-green-100 text-green-700 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }
            `}
          >
            <i className={`${feature.icon} w-6 h-6 flex items-center justify-center text-lg rounded-lg ${isActive ? 'text-green-600' : 'text-gray-400'}`}></i>
            <span>{feature.title}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default FeatureTabs;