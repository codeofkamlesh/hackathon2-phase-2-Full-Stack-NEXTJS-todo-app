'use client';

import React from 'react';
import { Task } from '../../../lib/types';
import PriorityBadge from './PriorityBadge';
import TagChips from './TagChips';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string, completed: boolean) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onComplete }) => {

  // Helpers
  const getDueDate = () => task.dueDate || task.due_date || (task as any).dueDate || null;
  const getRecurring = () => task.recurring || (task as any).recurring || null;
  const getRecurrencePattern = () => task.recurrence_pattern || task.recurrencePattern || (task as any).recurrencePattern || null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      // Format as "DD Mon YYYY, hh:mm A" (e.g., "02 Feb 2026, 03:30 PM")
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy, hh:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // fallback to original string
    }
  };

  const dueDateVal = getDueDate();
  const isOverdue = dueDateVal && !task.completed && new Date(dueDateVal) < new Date();
  const isUpcoming = dueDateVal && !task.completed && new Date(dueDateVal) > new Date() && new Date(dueDateVal) <= new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <div className={`border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 ${
      task.completed ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
    } ${isOverdue ? '!border-red-300 dark:!border-red-700' : ''}`}>

      {/* --- Header: Checkbox + Title + Actions --- */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={(e) => onComplete(task.id, e.target.checked)}
            className="mt-1.5 h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
          />
          <div>
            <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 shrink-0">
          <button onClick={() => onEdit(task)} className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Edit">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <hr className="border-gray-100 dark:border-gray-700 my-1" />

      {/* --- Details Section with Labels --- */}
      <div className="space-y-3 text-sm">

        {/* 1. Priority Row */}
        <div className="flex items-center gap-2">
          <span className="w-20 font-medium text-gray-500 dark:text-gray-400 shrink-0">Priority:</span>
          <PriorityBadge priority={task.priority} />
        </div>

        {/* 2. Tags Row */}
        {task.tags && Array.isArray(task.tags) && task.tags.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="w-20 mt-1 font-medium text-gray-500 dark:text-gray-400 shrink-0">Tags:</span>
            <div className="flex-1">
              <TagChips tags={task.tags} />
            </div>
          </div>
        )}

        {/* 3. Due Date Row */}
        {dueDateVal && (
          <div className="flex items-center gap-2">
            <span className="w-20 font-medium text-gray-500 dark:text-gray-400 shrink-0">Due Date:</span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
              isOverdue
                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                : isUpcoming
                ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
            }`}>
              📅 {formatDate(dueDateVal)}
            </span>
          </div>
        )}

        {/* 4. Recurring Row */}
        {getRecurring() && (
          <div className="flex items-center gap-2">
            <span className="w-20 font-medium text-gray-500 dark:text-gray-400 shrink-0">Repeats:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              🔄 {getRecurrencePattern() || 'Yes'}
            </span>
          </div>
        )}
      </div>

      {/* --- Footer: ID & Metadata --- */}
      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
        <span>Task ID: <span className="font-mono text-gray-600 dark:text-gray-300">{String(task.id)}</span></span>
        <span>Created: {task.created_at ? formatDate(task.created_at) : 'N/A'}</span>
      </div>

    </div>
  );
};

export default TaskCard;