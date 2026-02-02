/**
 * API Client for Todo App (Next.js Internal API)
 * Replaced legacy Python backend calls with Next.js API Routes
 */

import { Task, CreateTaskRequest, UpdateTaskRequest, FilterParams, ApiResponse } from './types';

// Helper for Internal API calls
async function fetchInternal<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Handle empty responses
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      return {
        success: false,
        error: data.error || data.message || `API Error: ${res.status}`,
        status: res.status
      };
    }

    return {
      success: true,
      data: data as T,
      status: res.status
    };

  } catch (error: any) {
    console.error(`API Request failed for ${endpoint}:`, error);
    return {
      success: false,
      error: error.message || 'Network error',
      status: 0
    };
  }
}

/**
 * Task Management API
 * Targets: /app/api/tasks/route.ts
 */
export const taskApi = {
  /**
   * Get all tasks
   */
  async getTasks(filterParams?: FilterParams): Promise<ApiResponse<Task[]>> {
    // Note: Query params can be added here if needed in future
    return await fetchInternal<Task[]>('/api/tasks');
  },

  /**
   * Create a new task
   */
  async createTask(taskData: CreateTaskRequest): Promise<ApiResponse<Task>> {
    return await fetchInternal<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  /**
   * Update a task
   * NOTE: Requires dynamic route /api/tasks/[id]/route.ts
   */
  async updateTask(taskId: string, taskData: UpdateTaskRequest): Promise<ApiResponse<Task>> {
    return await fetchInternal<Task>(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  /**
   * Delete a task
   * NOTE: Requires dynamic route /api/tasks/[id]/route.ts
   */
  async deleteTask(taskId: string): Promise<ApiResponse<Task>> {
    return await fetchInternal<Task>(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Toggle task completion
   * NOTE: Requires dynamic route /api/tasks/[id]/route.ts
   */
  async toggleTaskCompletion(taskId: string): Promise<ApiResponse<Task>> {
    // We send a PATCH request to toggle specifically
    return await fetchInternal<Task>(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ toggle: true }),
    });
  },
};

/**
 * Legacy Auth API (Mocked/Deprecated)
 * Since we use Better Auth Client directly in components,
 * we keep this just to prevent import errors in old files.
 */
export const authApi = {
  verifyToken: async () => ({ success: true, data: { valid: true } }),
  login: async () => ({ success: false, error: "Use Better Auth Client" }),
  signup: async () => ({ success: false, error: "Use Better Auth Client" }),
};

export const apiUtils = {
  isAuthenticated: () => true,
  getToken: () => null,
  clearAuth: () => {},
};