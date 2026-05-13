import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { AppRouteRecordRaw } from '@/types/router';

const routes: AppRouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: {
            requiresAuth: true,
            title: '首页'
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: {
            guestOnly: true,
            title: '登录'
        }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/auth/RegisterView.vue'),
        meta: {
            guestOnly: true,
            title: '注册'
        }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/user/ProfileView.vue'),
        meta: {
            requiresAuth: true,
            title: '个人中心'
        }
    },
    {
        path: '/change-password',
        name: 'ChangePassword',
        component: () => import('@/views/user/ChangePasswordView.vue'),
        meta: {
            requiresAuth: true,
            title: '修改密码'
        }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes: routes as RouteRecordRaw[]
});

// 路由守卫
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated;

    // 设置页面标题
    if (to.meta.title) {
        document.title = `${to.meta.title} - 在线书店`;
    }

    if (to.meta.requiresAuth && !isAuthenticated) {
        // 需要登录但未登录，跳转到登录页
        next('/login');
    } else if (to.meta.guestOnly && isAuthenticated) {
        // 已登录但访问游客页面，跳转到首页
        next('/');
    } else {
        next();
    }
});

export default router;