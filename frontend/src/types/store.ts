import type { ApiResponse, AuthResponse } from './api';
import type { User, Tokens, RegisterRequest, LoginRequest, ChangePasswordRequest } from './api';

export interface AuthState {
    accessToken: string;
    refreshToken: string;
    user: User | null;
    isAuthenticated: boolean;
}

export interface AuthActions {
    saveTokens: (tokens: Tokens) => void;
    saveUser: (user: User) => void;
    clearAuth: () => void;
    register: (userData: RegisterRequest) => Promise<ApiResponse<AuthResponse>>;
    login: (credentials: LoginRequest) => Promise<ApiResponse<AuthResponse>>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<ApiResponse>;
    fetchCurrentUser: () => Promise<ApiResponse<User>>;
    updateUser: (userData: Partial<User>) => Promise<ApiResponse<User>>;
    changePassword: (passwordData: ChangePasswordRequest) => Promise<ApiResponse>;
}