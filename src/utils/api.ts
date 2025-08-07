const API_BASE_URL = 'http://localhost:8000/api/v1';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = localStorage.getItem('admin_token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || 'API request failed',
        response.status,
        errorData
      );
    }

    const data: ApiResponse<T> = await response.json();
    return data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error occurred', 0);
  }
};

// Authentication functions
export const authApi = {
  login: (username: string, password: string) => 
    apiRequest<{
      token: string;
      user: {
        id: string;
        username: string;
        email: string;
        role: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  
  logout: () => apiRequest<{ success: boolean }>('/auth/logout', {
    method: 'POST',
  }),
  
  getCurrentUser: () => apiRequest<{
    id: string;
    username: string;
    email: string;
    role: string;
  }>('/auth/me'),
};

// Dashboard functions
export const dashboardApi = {
  getStats: () => apiRequest<{
    totalUsers: number;
    adminUsers: number;
    totalProjects: number;
    activeRate: number;
    userStats: { active: number; inactive: number };
    projectGrowth: number;
    activeRateChange: number;
  }>('/dashboard/stats'),
  
  getSystemStatus: () => apiRequest<{
    version: string;
    database: { status: string; health: string };
    emailService: { status: string; health: string };
  }>('/dashboard/system-status'),
  
  getRecentActivity: () => apiRequest<Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
  }>>('/dashboard/recent-activity'),
};

export const usersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: string }) => 
    apiRequest<{
      users: Array<{
        id: string;
        username: string;
        email: string;
        role: string;
        status: string;
        lastLogin: string;
        createdAt: string;
        projects: number;
      }>;
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/users${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`),
  
  create: (userData: {
    username: string;
    email: string;
    userType: string;
    sendWelcomeEmail: boolean;
    sendCredentialsEmail: boolean;
  }) => apiRequest<{
    id: string;
    username: string;
    email: string;
    temporaryPassword: string;
  }>('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  delete: (userId: string) => apiRequest<{ success: boolean }>(`/users/${userId}`, {
    method: 'DELETE',
  }),
  
  toggleStatus: (userId: string) => apiRequest<{ 
    id: string; 
    status: string; 
  }>(`/users/${userId}/toggle-status`, {
    method: 'PATCH',
  }),
};