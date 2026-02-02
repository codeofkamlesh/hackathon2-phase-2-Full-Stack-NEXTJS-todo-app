'use client';

import React, { useState, useEffect } from 'react';
import { Task, CreateTaskRequest } from '../../../lib/types';
import PriorityBadge from './PriorityBadge';
import TagChips from './TagChips';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: CreateTaskRequest) => void;
  task?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, task }) => {
  const isEditing = !!task;

  // ✅ State keys match 'CreateTaskRequest' types (camelCase)
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    priority: 'medium',
    tags: [],
    dueDate: '',           // Changed from due_date
    recurring: false,      // New field for recurring
    recurrencePattern: '', // New field for recurrence pattern
  });

  // Helper specifically for the Checkbox UI
  const [isRecurring, setIsRecurring] = useState(false);

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ LOAD DATA SAFELY (Handle snake_case vs camelCase)
  useEffect(() => {
    if (isOpen) {
      if (task) {
        // 1. Date Handling
        const rawDate = task.dueDate || task.due_date || (task as any).dueDate;
        let formattedDate = '';
        if (rawDate) {
          const d = new Date(rawDate);
          // Convert to local ISO string for input[type="datetime-local"]
          formattedDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        }

        // 2. Recurring Handling
        const recurBool = task.recurring || (task as any).recurring || false;
        const recurPattern = task.recurrence_pattern || task.recurrencePattern || (task as any).recurrencePattern || '';

        setFormData({
          title: task.title || '',
          description: task.description || '',
          priority: (task.priority as 'high'|'medium'|'low') || 'medium',
          tags: task.tags || [],
          dueDate: formattedDate,
          recurring: recurBool,
          recurrencePattern: recurPattern,
        });

        // Set Checkbox state based on whether task is recurring
        setIsRecurring(recurBool);

      } else {
        // Reset for New Task
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          tags: [],
          dueDate: '',
          recurring: false,
          recurrencePattern: '',
        });
        setIsRecurring(false);
      }

      setTagInput('');
      setErrors({});
    }
  }, [isOpen, task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRecurringToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsRecurring(checked);
    setFormData(prev => ({
      ...prev,
      recurring: checked,
      recurrencePattern: checked ? prev.recurrencePattern : ''  // Clear pattern when unchecked
    }));
  };

  const handlePriorityChange = (priority: 'high' | 'medium' | 'low') => {
    setFormData(prev => ({ ...prev, priority }));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && formData.tags && !formData.tags.includes(trimmed) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), trimmed]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submit on Enter
      if (tagInput.trim()) {
        handleAddTag();
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (isRecurring && !formData.recurrencePattern) {
      newErrors.recurrencePattern = 'Recurrence pattern is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // ✅ Clean Data before sending
      const payload: CreateTaskRequest = {
        ...formData,
        // Empty strings ko undefined bhejo taake backend null set kare
        dueDate: formData.dueDate || undefined,
        recurring: isRecurring,
        recurrencePattern: isRecurring ? formData.recurrencePattern : undefined
      };

      onSubmit(payload);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    {isEditing ? 'Edit Task' : 'Create Task'}
                  </h3>

                  <div className="mt-4 space-y-4">
                    {/* Title */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className={`mt-1 block w-full border ${
                          errors.title ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
                      />
                      {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        rows={3}
                        value={formData.description || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Priority
                      </label>
                      <div className="mt-1 flex space-x-2">
                        {(['high', 'medium', 'low'] as const).map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handlePriorityChange(p)}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                              formData.priority === p
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200 border-2 border-indigo-500'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-2 border-transparent'
                            }`}
                          >
                            <PriorityBadge priority={p} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tags
                      </label>
                      <div className="mt-1 flex">
                        <input
                          type="text"
                          id="tags"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Type a tag and press Enter"
                          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          Add
                        </button>
                      </div>
                      {formData.tags && formData.tags.length > 0 && (
                        <div className="mt-2">
                          <TagChips tags={formData.tags} onRemove={handleRemoveTag} />
                        </div>
                      )}
                    </div>

                    {/* Due Date */}
                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Due Date
                      </label>
                      <input
                        type="datetime-local"
                        name="dueDate" // ✅ Matched state key
                        id="dueDate"
                        value={formData.dueDate || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    {/* Recurring Checkbox */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="recurring-checkbox"
                        checked={isRecurring}
                        onChange={handleRecurringToggle}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor="recurring-checkbox" className="ml-2 block text-sm text-gray-900 dark:text-gray-300 cursor-pointer">
                        Recurring Task
                      </label>
                    </div>

                    {/* Recurrence Pattern Select */}
                    {isRecurring && (
                      <div>
                        <label htmlFor="recurrencePattern" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Recurrence Pattern *
                        </label>
                        <select
                          name="recurrencePattern" // ✅ Matched state key
                          id="recurrencePattern"
                          value={formData.recurrencePattern || ''}
                          onChange={handleChange}
                          className={`mt-1 block w-full border ${
                            errors.recurrencePattern ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                          } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
                        >
                          <option value="">Select pattern</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                        {errors.recurrencePattern && <p className="mt-1 text-sm text-red-600">{errors.recurrencePattern}</p>}
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {isEditing ? 'Update Task' : 'Create Task'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-600 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;