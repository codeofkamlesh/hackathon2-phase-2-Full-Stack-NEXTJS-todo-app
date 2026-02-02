import { useState, useEffect } from 'react';
import { Task, FilterParams } from '../lib/types';

interface UseTaskFiltersResult {
  filteredTasks: Task[];
  setFilters: (filters: FilterParams) => void;
  filters: FilterParams;
  clearFilters: () => void;
}

export const useTaskFilters = (tasks: Task[]): UseTaskFiltersResult => {
  const [filters, setFilters] = useState<FilterParams>({});
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);

  useEffect(() => {
    let result = [...tasks];

    // Apply filters
    if (filters.priority) {
      result = result.filter(task => task.priority === filters.priority);
    }

    if (filters.tag) {
      result = result.filter(task => task.tags.includes(filters.tag!));
    }

    if (filters.due_before) {
      const beforeDate = new Date(filters.due_before);
      result = result.filter(task =>
        task.due_date && new Date(task.due_date) <= beforeDate
      );
    }

    if (filters.completed !== undefined) {
      result = result.filter(task => task.completed === filters.completed);
    }

    // Apply sorting
    if (filters.sort) {
      result.sort((a, b) => {
        switch (filters.sort) {
          case 'due_date':
            if (!a.due_date && !b.due_date) return 0;
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();

          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority as keyof typeof priorityOrder] -
                   priorityOrder[a.priority as keyof typeof priorityOrder];

          case 'created_at':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

          case 'title':
            return a.title.localeCompare(b.title);

          default:
            return 0;
        }
      });

      // Apply sort order
      if (filters.order === 'asc') {
        result.reverse();
      }
    }

    setFilteredTasks(result);
  }, [tasks, filters]);

  const clearFilters = () => {
    setFilters({});
  };

  return {
    filteredTasks,
    setFilters,
    filters,
    clearFilters
  };
};