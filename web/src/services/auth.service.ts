import apiClient from '@/lib/api-client';
import { UserDTO, AuthTokens } from '@/shared/types';
import { RegisterInput, LoginInput } from '@/shared/validation';

export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterInput) => {
    const response = await apiClient.post<{ user: UserDTO; tokens: AuthTokens }>(
      '/auth/register',
      data
    );
    return response.data;
  },

  /**
   * Log in an existing user
   */
  login: async (data: LoginInput) => {
    const response = await apiClient.post<{ user: UserDTO; tokens: AuthTokens }>(
      '/auth/login',
      data
    );
    return response.data;
  },

  /**
   * Log out the current user
   */
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  /**
   * Get the current authenticated user's profile
   * (Assuming there's a /auth/me or similar, if not we'll use dashboard data)
   */
  getMe: async () => {
    // If we don't have a /me endpoint, we might need to implement one later.
    // For now, let's assume registration/login gives us the user object.
    const response = await apiClient.get<UserDTO>('/auth/me'); // Placeholder
    return response.data;
  },

  /**
   * Refresh session
   */
  refresh: async () => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },
  /**
   * Update user workspace path
   */
  updateWorkspace: async (workspacePath: string) => {
    const response = await apiClient.put<UserDTO>('/users/workspace', { workspacePath });
    return response.data;
  },
};

