// API Client for Hospital Form - Vite version
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hospital-form-api.testdeveloper.workers.dev';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
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

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
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
      return data as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        error: String(error),
      };
    }
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await this.request<{
      token: string;
      user: { id: string; username: string; role: string; fullName: string };
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    this.setToken(null);
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
      }>;
    }>(`/api/forms/search?hn=${encodeURIComponent(hn)}`);
  }

  async getForm(formId: string) {
    return this.request<{
      form: Record<string, unknown>;
      readonly: boolean;
    }>(`/api/forms/${formId}`);
  }

  async listForms(page = 1, limit = 20, date?: string) {
    let url = `/api/forms?page=${page}&limit=${limit}`;
    if (date) {
      url += `&date=${date}`;
    }
    return this.request<{
      page: number;
      limit: number;
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
      }>;
    }>(url);
  }
}

export const api = new ApiClient(API_BASE_URL);
export type { ApiResponse };
