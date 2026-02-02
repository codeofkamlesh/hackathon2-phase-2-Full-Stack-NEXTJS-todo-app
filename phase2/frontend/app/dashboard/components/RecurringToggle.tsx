import React from 'react';

interface RecurringToggleProps {
  recurring: boolean;
  onChange: (recurring: boolean) => void;
}

const RecurringToggle: React.FC<RecurringToggleProps> = ({ recurring, onChange }) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id="recurring-toggle"
        checked={recurring}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
      />
      <label htmlFor="recurring-toggle" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
        Recurring Task
      </label>
    </div>
  );
};

export default RecurringToggle;