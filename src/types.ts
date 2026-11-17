export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  stock: number;
  imageUrl: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  stock: number;
  imageUrl: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const PRODUCT_CATEGORIES = [
  'Monitores de Estúdio',
  'Fones de Referência',
  'Interfaces de Áudio',
  'Microfones',
  'Amplificadores & DACs',
  'Acessórios & Cabos',
] as const;
