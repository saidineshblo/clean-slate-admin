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
  
  console.log('Making API request to:', `${API_BASE_URL}${endpoint}`);
  console.log('Auth token available:', !!token);
  
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
    
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `API request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();
    console.log('API Response data:', data);
    // Your API returns data directly, not wrapped in an ApiResponse structure
    return data;
  } catch (error) {
    console.error('API Request error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error occurred', 0);
  }
};

// Authentication functions
export const authApi = {
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.detail?.[0]?.msg || errorData.message || 'Login failed',
        response.status,
        errorData
      );
    }

    return await response.json();
  },
  
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
    total_users: number;
    active_users: number;
    inactive_users: number;
    admin_users: number;
    total_projects: number;
    projects_this_month: number;
    users_this_month: number;
    avg_projects_per_user: number;
  }>('/admin/dashboard'),
  
  getSystemStatus: () => apiRequest<{
    platform_version: string;
    database_status: string;
    email_service_status: string;
    aws_ses_quota: any;
    uptime: string;
    active_sessions: number;
  }>('/admin/system-info'),
  
  getHealthCheck: () => apiRequest<string>('/admin/health'),
};

export const usersApi = {
  getAll: (params?: { 
    page?: number; 
    per_page?: number; 
    query?: string; 
    is_active?: boolean;
    is_superuser?: boolean;
    sort_by?: string;
    sort_order?: string;
  }) => 
    apiRequest<{
      users: Array<{
        id: string;
        username: string;
        email: string;
        is_active: boolean;
        is_superuser: boolean;
        created_at: string;
        updated_at: string;
        project_count: number;
        last_login: string;
      }>;
      total: number;
      page: number;
      per_page: number;
      has_next: boolean;
      has_prev: boolean;
      total_pages: number;
    }>(`/admin/users${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`),
  
  create: (userData: {
    username: string;
    email: string;
    is_superuser: boolean;
    send_email: boolean;
  }) => apiRequest<{
    user: {
      id: string;
      username: string;
      email: string;
      is_active: boolean;
      is_superuser: boolean;
      created_at: string;
      updated_at: string;
    };
    temporary_password_sent: boolean;
    message: string;
  }>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  delete: (userId: string) => apiRequest<{
    success: boolean;
    message: string;
    affected_users: number;
  }>(`/admin/users/${userId}`, {
    method: 'DELETE',
  }),
  
  toggleStatus: (userId: string, data: { is_active: boolean; reason?: string }) => 
    apiRequest<{
      success: boolean;
      message: string;
      affected_users: number;
    }>(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  resetPassword: (userId: string, data: { send_email: boolean; reason?: string }) => 
    apiRequest<{
      message: string;
      email_sent: boolean;
      temporary_password_sent: boolean;
    }>(`/admin/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};