'use client';

import React from 'react';

interface TagChipsProps {
  tags: string[];
  onRemove?: (tag: string) => void;
  readonly?: boolean;
}

const TagChips: React.FC<TagChipsProps> = ({ tags, onRemove, readonly = false }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
        >
          {tag}
          {!readonly && onRemove && (
            <button
              type="button"
              className="ml-1 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              onClick={() => onRemove(tag)}
              aria-label={`Remove tag ${tag}`}
            >
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </span>
      ))}
    </div>
  );
};

export default TagChips;