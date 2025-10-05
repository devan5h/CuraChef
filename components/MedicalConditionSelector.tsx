
import React from 'react';
import { MedicalCondition } from '../types';

interface MedicalConditionSelectorProps {
  conditions: { value: MedicalCondition; label: string; }[];
  selectedValue: MedicalCondition;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const MedicalConditionSelector: React.FC<MedicalConditionSelectorProps> = ({ conditions, selectedValue, onChange }) => {
  return (
    <div>
      <label htmlFor="medical-condition" className="block text-sm font-medium text-gray-700 mb-2 text-center">
        Select Medical Condition (Optional)
      </label>
      <select
        id="medical-condition"
        value={selectedValue}
        onChange={onChange}
        className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 shadow-sm"
      >
        {conditions.map(condition => (
          <option key={condition.value} value={condition.value} disabled={condition.value === 'none'}>
            {condition.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MedicalConditionSelector;