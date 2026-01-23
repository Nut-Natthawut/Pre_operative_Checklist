// API Client for Hospital Form - Vite version
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://preop-checklist-api.testdeveloper.workers.dev';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  setRefreshToken(refreshToken: string | null) {
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      } else {
        localStorage.removeItem('refreshToken');
      }
    }
  }

  getToken() {
    return this.token;
  }

  getRefreshToken() {
    return this.refreshToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      // If 401 and we have refresh token, try to refresh
      if (response.status === 401 && this.refreshToken && retry && !this.isRefreshing) {
        const refreshed = await this.tryRefreshToken();
        if (refreshed) {
          // Retry the original request with new token
          return this.request<T>(endpoint, options, false);
        }
      }
      
      return data as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        error: String(error),
      };
    }
  }

  private async tryRefreshToken(): Promise<boolean> {
    if (!this.refreshToken || this.isRefreshing) return false;
    
    this.isRefreshing = true;
    
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      
      const data = await response.json();
      
      if (data.success && data.data?.token) {
        this.setToken(data.data.token);
        this.isRefreshing = false;
        return true;
      }
    } catch {
      // Refresh failed
    }
    
    // Refresh failed - clear tokens and force re-login
    this.setToken(null);
    this.setRefreshToken(null);
    this.isRefreshing = false;
    return false;
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await this.request<{
      token: string;
      refreshToken: string;
      expiresIn: number;
      user: { id: string; username: string; role: string; fullName: string };
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }, false);

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
      if (response.data.refreshToken) {
        this.setRefreshToken(response.data.refreshToken);
      }
    }

    return response;
  }

  async logout() {
    this.setToken(null);
    this.setRefreshToken(null);
    return { success: true, message: 'ออกจากระบบสำเร็จ' };
  }

  async getMe() {
    return this.request<{
      id: string;
      username: string;
      role: string;
      fullName: string;
    }>('/api/auth/me');
  }

  // User endpoints (Admin only)
  async getUsers() {
    return this.request<{
      users: Array<{
        id: string;
        username: string;
        role: string;
        fullName: string;
        createdAt: string;
      }>;
      count: number;
    }>('/api/users');
  }

  async createUser(data: {
    username: string;
    password: string;
    fullName: string;
    role?: string;
  }) {
    return this.request<{
      user: { id: string; username: string; role: string; fullName: string };
    }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(userId: string) {
    return this.request<{ deletedUserId: string }>(`/api/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Form endpoints
  async submitForm(formData: Record<string, unknown>) {
    return this.request<{
      formId: string;
      hn: string;
      patientName: string;
      createdAt: string;
    }>('/api/forms', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  async updateForm(id: string, formData: Record<string, unknown>) {
    return this.request<{
      formId: string;
    }>(`/api/forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
    });
  }

  async searchForms(hn: string) {
    return this.request<{
      count: number;
      results: Array<{
        id: string;
        hn: string;
        an: string;
        patientName: string;
        ward: string;
        formDate: string;
        formTime: string;
        createdAt: string;
        status?: 'green' | 'yellow' | 'red';
        statusMessage?: string;
      }>;
    }>(`/api/forms/search?hn=${encodeURIComponent(hn)}`);
  }

  async getForm(formId: string) {
    return this.request<{
      form: Record<string, unknown>;
      readonly: boolean;
    }>(`/api/forms/${formId}`);
  }

  async listForms(page = 1, limit = 20, startDate?: string, endDate?: string) {
    let url = `/api/forms?page=${page}&limit=${limit}`;
    if (startDate) {
      url += `&startDate=${startDate}`;
    }
    if (endDate) {
      url += `&endDate=${endDate}`;
    }
    return this.request<{
      page: number;
      limit: number;
      totalCount: number;
      count: number;
      forms: Array<{
        id: string;
        hn: string;
        an: string;
        patientName: string;
        ward: string;
        formDate: string;
        formTime: string;
        createdAt: string;
        status?: 'green' | 'yellow' | 'red';
        statusMessage?: string;
      }>;
    }>(url);
  }
}

export const api = new ApiClient(API_BASE_URL);
export type { ApiResponse };
