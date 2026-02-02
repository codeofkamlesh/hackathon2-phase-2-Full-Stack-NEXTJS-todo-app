'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { taskApi } from '@/lib/api';
import { Task, CreateTaskRequest } from '@/lib/types';

// Component Imports
import TaskGrid from './components/TaskGrid';
import TaskModal from './components/TaskModal';
import SearchBar from './components/SearchBar';
import FilterSidebar from './components/FilterSidebar';
import DarkModeToggle from './components/DarkModeToggle';
import ChatWidget from '@/components/chat/ChatWidget';

// Hooks
import { useTaskFilters } from '@/hooks/useTaskFilters';
import { useNotifications } from '@/hooks/useNotifications';

// ✅ HELPER: Tags ko safely Array mein convert karne ka function
const parseTags = (tags: any): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags; // Agar pehle se array hai to wapis kardo

  if (typeof tags === 'string') {
    try {
      // 1. Agar Postgres format hai "{tag1,tag2}" -> usay JSON banayen
      let clean = tags.replace(/^{/, '[').replace(/}$/, ']');

      // 2. Agar single quotes hain to double karein (JSON format)
      clean = clean.replace(/'/g, '"');

      return JSON.parse(clean);
    } catch (e) {
      // 3. Agar JSON fail ho jaye (simple comma separated string)
      return tags.split(',').map(t => t.trim()).filter(t => t);
    }
  }
  return [];
};

const DashboardPage: React.FC = () => {
  const router = useRouter();

  // ✅ Better Auth Session Hook
  const { data: session, isPending: isAuthPending } = authClient.useSession();

  // State Management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);

  // Custom Hooks
  const { filters, setFilters, clearFilters } = useTaskFilters(tasks);
  const { requestPermission, checkForUpcomingTasks } = useNotifications();

  // ✅ Auth Redirect Logic
  useEffect(() => {
    if (!isAuthPending && !session) {
      router.push('/login');
    }
  }, [isAuthPending, session, router]);

  // ✅ Fetch tasks only when Session is confirmed
  useEffect(() => {
    const fetchTasks = async () => {
      if (!session) return;

      try {
        setLoading(true);
        const result = await taskApi.getTasks();

        if (result.success) {
          // ✅ FIX: Data aate hi tags ko sanitize kar liya
          const cleanTasks = (result.data || []).map((task: any) => ({
            ...task,
            tags: parseTags(task.tags) // Yahan magic ho raha hai
          }));
          setTasks(cleanTasks);
        } else {
          setError(result.error || 'Failed to fetch tasks');
        }
      } catch (err) {
        setError('An error occurred while fetching tasks');
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthPending && session) {
      fetchTasks();
    }
  }, [session, isAuthPending]);

  // ✅ COMPLETE FILTERING & SORTING LOGIC
  useEffect(() => {
    let result = [...tasks];

    // 1. Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        task =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
      );
    }

    if (filters) {
      // 2. Status Filter
      if (filters.completed === true) {
        result = result.filter(task => task.completed);
      } else if (filters.completed === false) {
        result = result.filter(task => !task.completed);
      }

      // 3. Priority Filter
      if (filters.priority && filters.priority !== 'all') {
        result = result.filter(task => task.priority === filters.priority);
      }

      // 4. Tag Filter
      if (filters.tag) {
        const tagQuery = filters.tag.toLowerCase();
        result = result.filter(task =>
          // Ab ye line crash nahi karegi kyunki humne parseTags use kiya hai
          task.tags && Array.isArray(task.tags) && task.tags.some(t => t.toLowerCase().includes(tagQuery))
        );
      }

      // 5. Due Date Filter
      if (filters.dueDate && filters.dueDate !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        result = result.filter(task => {
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
    }

    // 6. SORTING
    if (filters && filters.sortBy) {
      result.sort((a, b) => {
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
    } else {
      // Default Sort
      result.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
        const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    }

    setFilteredTasks(result);
  }, [tasks, searchQuery, filters]);

  // Notification Checks
  useEffect(() => {
    if (tasks.length > 0) {
      checkForUpcomingTasks(tasks);
    }
  }, [tasks, checkForUpcomingTasks]);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // --- Handlers ---
  const handleCreateTask = async (taskData: CreateTaskRequest) => {
    try {
      const result = await taskApi.createTask(taskData);
      if (result.success) {
        // Naye task ke tags ko bhi sanitize karein
        const newTask = {
            ...result.data!,
            tags: parseTags(result.data!.tags)
        };
        setTasks([...tasks, newTask]);
        setShowModal(false);
      } else {
        setError(result.error || 'Failed to create task');
      }
    } catch (err) {
      setError('An error occurred while creating the task');
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: CreateTaskRequest) => {
    try {
      const result = await taskApi.updateTask(taskId, taskData);
      if (result.success) {
        // Updated task ke tags ko bhi sanitize karein
        const updatedTask = {
            ...result.data!,
            tags: parseTags(result.data!.tags)
        };
        setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
        setShowModal(false);
        setEditingTask(null);
      } else {
        setError(result.error || 'Failed to update task');
      }
    } catch (err) {
      setError('An error occurred while updating the task');
    }
  };

  const handleSubmitTask = (taskData: CreateTaskRequest) => {
    if (editingTask) {
      handleUpdateTask(editingTask.id, taskData);
    } else {
      handleCreateTask(taskData);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const result = await taskApi.deleteTask(taskId);
        if (result.success) {
          setTasks(tasks.filter(task => task.id !== taskId));
        } else {
          setError(result.error || 'Failed to delete task');
        }
      } catch (err) {
        setError('An error occurred while deleting the task');
      }
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      const result = await taskApi.toggleTaskCompletion(taskId);
      if (result.success) {
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
      } else {
        setError(result.error || 'Failed to update task');
      }
    } catch (err) {
      setError('An error occurred while updating the task');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
        },
      },
    });
  };

  // --- Render ---

  if (isAuthPending) {
    return (
      <div className="flex justify-center items-center h-screen bg-background text-foreground">
        <div className="text-xl font-semibold">Loading session...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    // ✅ FIXED: Using 'bg-background' and 'text-foreground' instead of hardcoded grays
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">

      <header className="bg-white dark:bg-gray-800 shadow transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Welcome, {session.user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <button
              onClick={handleSignOut}
              className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar - filters */}
          <div className="lg:w-1/4">
            <div className="sticky top-4 space-y-6">
              <button
                onClick={() => setShowModal(true)}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                + Add New Task
              </button>

              <FilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Main content - tasks */}
          <div className="lg:w-3/4">
            <div className="mb-6">
              <SearchBar onSearch={setSearchQuery} />
            </div>

            <TaskGrid
              tasks={filteredTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onComplete={handleToggleComplete}
              loading={loading}
            />
          </div>
        </div>

        {showModal && (
          <TaskModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setEditingTask(null);
            }}
            onSubmit={handleSubmitTask}
            task={editingTask}
          />
        )}
      </main>

      {/* Chat Widget - floating above all content */}
      <ChatWidget />
    </div>
  );
};

export default DashboardPage;