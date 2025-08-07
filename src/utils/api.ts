import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Helper function to handle Supabase responses
export const handleSupabaseResponse = <T>(data: T | null, error: any): T => {
  if (error) {
    throw new ApiError(error.message, error.status || 500, error);
  }
  if (!data) {
    throw new ApiError('No data returned', 404);
  }
  return data;
};

// Authentication functions
export const authApi = {
  login: async (username: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });
    return handleSupabaseResponse(data, error);
  },
  
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new ApiError(error.message, 500, error);
  },
  
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return handleSupabaseResponse(user, error);
  },
};

// Dashboard functions
export const dashboardApi = {
  getStats: async () => {
    // Mock data for now - replace with actual Supabase queries
    return {
      totalUsers: 150,
      adminUsers: 5,
      totalProjects: 45,
      activeRate: 85.2,
      userStats: { active: 128, inactive: 22 },
      projectGrowth: 12.5,
      activeRateChange: 2.3,
    };
  },
  
  getSystemStatus: async () => {
    return {
      version: '2.1.0',
      database: { status: 'healthy', health: 'good' },
      emailService: { status: 'operational', health: 'excellent' },
    };
  },
  
  getRecentActivity: async () => {
    return [
      {
        id: '1',
        type: 'user_created',
        title: 'New user registered',
        description: 'john.doe@example.com joined the platform',
        timestamp: new Date().toISOString(),
      },
    ];
  },
};

export const usersApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .range(
        ((params?.page || 1) - 1) * (params?.limit || 10),
        (params?.page || 1) * (params?.limit || 10) - 1
      );
    
    // Mock pagination for now
    return {
      users: data || [],
      pagination: {
        total: data?.length || 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: Math.ceil((data?.length || 0) / (params?.limit || 10)),
      },
    };
  },
  
  create: async (userData: {
    username: string;
    email: string;
    userType: string;
    sendWelcomeEmail: boolean;
    sendCredentialsEmail: boolean;
  }) => {
    const { data, error } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: Math.random().toString(36).slice(-8), // Generate random password
      email_confirm: true,
      user_metadata: {
        username: userData.username,
        user_type: userData.userType,
      },
    });
    
    return handleSupabaseResponse(data, error);
  },
  
  delete: async (userId: string) => {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw new ApiError(error.message, 500, error);
    return { success: true };
  },
  
  toggleStatus: async (userId: string) => {
    // This would require custom logic with Supabase
    // For now, return mock response
    return {
      id: userId,
      status: 'Active',
    };
  },
};