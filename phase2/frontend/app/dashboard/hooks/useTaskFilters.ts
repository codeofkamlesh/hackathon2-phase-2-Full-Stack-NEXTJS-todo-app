import { useState, useMemo, useCallback } from 'react';
import { Task, FilterParams } from '../../../lib/types';

interface UseTaskFiltersResult {
  filters: FilterParams;
  setFilters: (filters: FilterParams) => void;
  filteredTasks: Task[];
  clearFilters: () => void;
}

const useTaskFilters = (tasks: Task[]): UseTaskFiltersResult => {
  // ✅ INITIAL STATE: Set proper defaults for dropdowns
  const [filters, setFilters] = useState<FilterParams>({
    priority: 'all',
    tag: '',
    completed: undefined,
    dueDate: 'all',     // Default value
    sortBy: 'newest',   // Default value
  });

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Apply Priority Filter
    if (filters.priority && filters.priority !== 'all') {
      result = result.filter(task => task.priority === filters.priority);
    }

    // 2. Apply Tag Filter (Case insensitive)
    if (filters.tag) {
      const tagQuery = filters.tag.toLowerCase();
      result = result.filter(task =>
        task.tags && task.tags.some(t => t.toLowerCase().includes(tagQuery))
      );
    }

    // 3. Apply Completion Filter
    if (filters.completed !== undefined) {
      result = result.filter(task => task.completed === filters.completed);
    }

    // 4. Apply Due Date Filter (New Logic)
    if (filters.dueDate && filters.dueDate !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      result = result.filter(task => {
        // Safe access to date
        const dateStr = task.dueDate || task.due_date || (task as any).dueDate;
        if (!dateStr) return false;

        const taskDate = new Date(dateStr);
        taskDate.setHours(0, 0, 0, 0);

        if (filters.dueDate === 'today') {
          return taskDate.getTime() === today.getTime();
        }
        if (filters.dueDate === 'overdue') {
          return taskDate < today && !task.completed;
        }
        if (filters.dueDate === 'week') {
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          return taskDate >= today && taskDate <= nextWeek;
        }
        return true;
      });
    }

    // 5. Apply Sorting (New Logic)
    if (filters.sortBy) {
      result.sort((a, b) => {
        // Safe Date Access
        const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
        const dateB = new Date(b.created_at || b.createdAt || 0).getTime();

        const dueDateA = new Date(a.dueDate || a.due_date || (a as any).dueDate || 9999999999999).getTime();
        const dueDateB = new Date(b.dueDate || b.due_date || (b as any).dueDate || 9999999999999).getTime();

        switch (filters.sortBy) {
          case 'newest':
            return dateB - dateA;
          case 'oldest':
            return dateA - dateB;
          case 'due_date':
            return dueDateA - dueDateB;
          case 'priority':
            const pMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
            return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
          default:
            return 0;
        }
      });
    }

    return result;
  }, [tasks, filters]);

  const clearFilters = useCallback(() => {
    setFilters({
      priority: 'all',
      tag: '',
      completed: undefined,
      dueDate: 'all',
      sortBy: 'newest'
    });
  }, []);

  return {
    filters,
    setFilters,
    filteredTasks,
    clearFilters
  };
};

export default useTaskFilters;