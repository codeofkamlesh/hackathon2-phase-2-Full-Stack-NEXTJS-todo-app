'use client';

import React from 'react';
import { FilterParams } from '../../../lib/types';

interface FilterSidebarProps {
  filters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
  onClearFilters: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFilterChange, onClearFilters }) => {

  // ✅ 1. Status Handler
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({
      ...filters,
      completed: value === 'all' ? undefined : value === 'completed'
    });
  };

  // ✅ 2. Priority Handler
  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({
      ...filters,
      priority: value === 'all' ? undefined : value
    });
  };

  // ✅ 3. Tag Handler
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, tag: e.target.value });
  };

  // ✅ 4. Due Date Handler (Simplified to match page.tsx)
  const handleDueDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      dueDate: e.target.value // 'today', 'week', 'overdue', 'all'
    });
  };

  // ✅ 5. Sort Handler (Simplified to match page.tsx)
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      sortBy: e.target.value // 'newest', 'oldest', 'priority', 'due_date'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-fit">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h2>
        <button
          onClick={onClearFilters}
          className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        {/* --- Status --- */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            id="status"
            value={filters.completed === undefined ? 'all' : filters.completed ? 'completed' : 'pending'}
            onChange={handleStatusChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* --- Priority --- */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={filters.priority || 'all'}
            onChange={handlePriorityChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* --- Tag --- */}
        <div>
          <label htmlFor="tag" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tag
          </label>
          <input
            type="text"
            id="tag"
            value={filters.tag || ''}
            onChange={handleTagChange}
            placeholder="Enter tag name"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* --- Due Date --- */}
        <div>
          <label htmlFor="due-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <select
            id="due-date"
            value={filters.dueDate || 'all'} // Use simplified value
            onChange={handleDueDateChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Dates</option>
            <option value="today">Due Today</option>
            <option value="week">Next 7 Days</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* --- Sort By --- */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sort By
          </label>
          <select
            id="sort"
            value={filters.sortBy || 'newest'} // Use simplified value
            onChange={handleSortChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="due_date">Due Date (Earliest)</option>
            <option value="priority">Priority (High First)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;