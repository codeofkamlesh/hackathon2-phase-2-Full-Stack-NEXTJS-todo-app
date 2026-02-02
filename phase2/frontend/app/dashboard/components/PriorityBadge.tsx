'use client';

import React from 'react';

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const priorityStyles = {
    high: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-200',
      border: 'border-red-300 dark:border-red-700',
      label: 'High',
    },
    medium: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-200',
      border: 'border-yellow-300 dark:border-yellow-700',
      label: 'Medium',
    },
    low: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-800 dark:text-blue-200',
      border: 'border-blue-300 dark:border-blue-700',
      label: 'Low',
    },
  };

  const style = priorityStyles[priority];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      {style.label}
    </span>
  );
};

export default PriorityBadge;