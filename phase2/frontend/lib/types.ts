// Enhanced Task type with flexibility for different DB column naming styles
export interface Task {
  id: string;
  userId: string;
  user_id?: string;

  title: string;
  description: string | null;
  completed: boolean;

  priority: 'high' | 'medium' | 'low';

  tags: string[] | null;

  // Date Handling
  dueDate?: string | null;
  due_date?: string | null;

  // Recurring Handling
  recurringinterval?: string | null;
  recurringInterval?: string | null;
  recurring_interval?: string | null;

  recurring?: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | null;

  // Timestamps
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
  dueDate?: string;
  recurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
  dueDate?: string;
  recurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
}

// ✅ FIXED: Updated FilterParams to match Dashboard logic
export interface FilterParams {
  priority?: string;
  tag?: string;
  completed?: boolean;
  search?: string;

  // Ye 2 properties missing thi jo error de rahi thi:
  dueDate?: string;   // 'today', 'week', 'overdue', 'all'
  sortBy?: string;    // 'newest', 'oldest', 'priority', 'due_date'
  due_before?: string;

  // Legacy support
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}