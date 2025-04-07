import { User } from './user';

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    access: string;
    refresh: string;
    user: User;
  };
  error?: string;
  requires_verification?: boolean;
  email?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
} 