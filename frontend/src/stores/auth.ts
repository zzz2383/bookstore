import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import persist from 'pinia-plugin-persistedstate';
import { http } from '@/utils/axios';
import type {
    User,
    AuthResponse,
    ApiResponse,
    LoginRequest,
    RegisterRequest,
    ChangePasswordRequest,
    Tokens
} from '@/types/api';

export const useAuthStore = defineStore('auth', () => {
    // State
    const accessToken = ref<string>(localStorage.getItem('access_token') || '');
    const refreshToken = ref<string>(localStorage.getItem('refresh_token') || '');
    const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));

    // Getters
    const isAuthenticated = computed<boolean>(() => !!accessToken.value);

    // Actions
    const saveTokens = (tokens: Tokens): void => {
        accessToken.value = tokens.access;
        refreshToken.value = tokens.refresh;
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
    };

    const saveUser = (userData: User): void => {
        user.value = userData;
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const clearAuth = (): void => {
        accessToken.value = '';
        refreshToken.value = '';
        user.value = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    };

    const register = async (userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
        try {
            const response = await http.post<AuthResponse>('/auth/register/', userData);
            const { tokens, user: userInfo } = response.data;

            saveTokens(tokens);
            saveUser(userInfo);

            return { success: true, data: response.data };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data || { detail: '注册失败' }
            };
        }
    };

    const login = async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
        try {
            const response = await http.post<AuthResponse>('/auth/login/', credentials);
            const { tokens, user: userInfo } = response.data;

            saveTokens(tokens);
            saveUser(userInfo);

            return { success: true, data: response.data };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data || { detail: '登录失败' }
            };
        }
    };

    const logout = async (): Promise<void> => {
        try {
            if (refreshToken.value) {
                await http.post('/auth/logout/', { refresh: refreshToken.value });
            }
        } catch (error) {
            console.error('登出失败:', error);
        } finally {
            clearAuth();
        }
    };

    // 修改函数名称，避免与变量名冲突
    const refreshAccessToken = async (): Promise<ApiResponse<{ access: string }>> => {
        try {
            const response = await http.post<{ access: string }>('/auth/token/refresh/', {
                refresh: refreshToken.value
            });

            accessToken.value = response.data.access;
            localStorage.setItem('access_token', response.data.access);

            return { success: true, data: response.data };
        } catch (error) {
            clearAuth();
            throw error;
        }
    };

    const fetchCurrentUser = async (): Promise<ApiResponse<User>> => {
        try {
            const response = await http.get<User>('/auth/me/');
            saveUser(response.data);
            return { success: true, data: response.data };
        } catch (error: any) {
            return { success: false, error };
        }
    };

    const updateUser = async (userData: Partial<User>): Promise<ApiResponse<User>> => {
        try {
            const response = await http.patch<User>('/auth/me/', userData);
            saveUser(response.data);
            return { success: true, data: response.data };
        } catch (error: any) {
            return { success: false, error: error.response?.data };
        }
    };

    const changePassword = async (passwordData: ChangePasswordRequest): Promise<ApiResponse> => {
        try {
            await http.post('/auth/me/change-password/', passwordData);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.response?.data };
        }
    };

    return {
        // State
        accessToken,
        refreshToken,  // 这是变量
        user,

        // Getters
        isAuthenticated,

        // Actions
        saveTokens,
        saveUser,
        clearAuth,
        register,
        login,
        logout,
        refreshAccessToken,  // 这是重命名后的函数
        fetchCurrentUser,
        updateUser,
        changePassword
    };
}, {
    persist: {
        key: 'bookstore-auth',
        storage: localStorage
    }
});