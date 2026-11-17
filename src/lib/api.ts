import type { AuthResponse, Product, ProductInput, User } from '../types.ts';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'kroma_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignora erros de armazenamento em ambientes restritos
  }
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & T;

  if (!response.ok) {
    throw new Error(
      data.error || `Erro na requisição (${response.status}).`,
    );
  }

  return data;
}

export const api = {
  async login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    return request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async me(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async listProducts(params?: {
    category?: string;
    search?: string;
    sort?: string;
  }): Promise<{ products: Product[] }> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'Todas') {
      query.set('category', params.category);
    }
    if (params?.search) {
      query.set('search', params.search);
    }
    if (params?.sort) {
      query.set('sort', params.sort);
    }
    const qs = query.toString();
    return request<{ products: Product[] }>(
      `/api/products${qs ? `?${qs}` : ''}`,
    );
  },

  async createProduct(input: ProductInput): Promise<{ product: Product }> {
    return request<{ product: Product }>('/api/products', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateProduct(
    id: string,
    input: ProductInput,
  ): Promise<{ product: Product }> {
    return request<{ product: Product }>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  },
};
