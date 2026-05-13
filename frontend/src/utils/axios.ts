import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth';


export interface RequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
}

class HttpClient {
    private instance: AxiosInstance;
    private refreshSubscribers: ((token: string) => void)[] = [];

    constructor() {
        this.instance = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
            timeout: 10000,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private onRefreshed(token: string) {
        this.refreshSubscribers.forEach(callback => callback(token));
        this.refreshSubscribers = [];
    }

    private addRefreshSubscriber(callback: (token: string) => void) {
        this.refreshSubscribers.push(callback);
    }

    private setupInterceptors() {
        // 请求拦截器
        this.instance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const authStore = useAuthStore();
                const token = authStore.accessToken;

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // 响应拦截器
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => response,
            async (error) => {
                const originalRequest = error.config as RequestConfig;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const authStore = useAuthStore();
                        await authStore.refreshAccessToken();

                        // 重新发送原始请求
                        return this.instance(originalRequest);
                    } catch (refreshError) {
                        // 刷新token失败，清除认证状态
                        const authStore = useAuthStore();
                        authStore.clearAuth();

                        // 跳转到登录页
                        if (typeof window !== 'undefined') {
                            window.location.href = '/login';
                        }

                        return Promise.reject(refreshError);
                    }
                }

                if (error.response?.status === 403) {
                    // 权限不足
                    if (typeof window !== 'undefined') {
                        window.location.href = '/forbidden';
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.instance.get<T>(url, config);
    }

    public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.instance.post<T>(url, data, config);
    }

    public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.instance.put<T>(url, data, config);
    }

    public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.instance.patch<T>(url, data, config);
    }

    public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.instance.delete<T>(url, config);
    }
}

export const http = new HttpClient();