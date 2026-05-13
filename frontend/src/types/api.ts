// 用户相关类型
export interface User {
    id: string;
    email: string;
    username: string;
    phone?: string;
    avatar?: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
    date_joined: string;
    last_login?: string;
    is_active: boolean;
    profile?: UserProfile;
}

export interface UserProfile {
    gender?: 'male' | 'female' | 'other';
    birth_date?: string;
    address?: string;
    created_at: string;
    updated_at: string;
}

// 认证相关类型
export interface Tokens {
    access: string;
    refresh: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    tokens: Tokens;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
    password2: string;
    phone?: string;
}

export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
}

// API 响应类型
export interface ApiResponse<T = any> {
    data?: T;
    error?: ApiError;
    success: boolean;
}

export interface ApiError {
    detail?: string;
    email?: string[];
    username?: string[];
    password?: string[];
    [key: string]: any;
}

// 表单验证规则类型
export interface FormRules {
    [key: string]: Array<{
        required?: boolean;
        message: string;
        trigger: string;
        min?: number;
        max?: number;
        type?: string;
        validator?: (rule: any, value: any, callback: (error?: Error) => void) => void;
    }>;
}