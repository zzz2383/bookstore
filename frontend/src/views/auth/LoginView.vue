<template>
    <div class="login-container">
        <div class="login-card">
            <h2>登录</h2>
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
                <el-form-item prop="email">
                    <el-input v-model="loginForm.email" placeholder="邮箱" :prefix-icon="Message" size="large" />
                </el-form-item>

                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" type="password" placeholder="密码" :prefix-icon="Lock"
                        size="large" show-password />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" size="large" :loading="loading" @click="handleLogin" class="login-button">
                        登录
                    </el-button>
                </el-form-item>

                <div class="login-links">
                    <router-link to="/register">没有账号？立即注册</router-link>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { Message, Lock } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import type { LoginRequest } from '@/types/api';

const router = useRouter();
const authStore = useAuthStore();

// 表单引用
const loginFormRef = ref<FormInstance>();

// 表单数据
interface LoginFormData {
    email: string;
    password: string;
}

const loginForm = reactive<LoginFormData>({
    email: '',
    password: ''
});

// 表单验证规则
const loginRules = computed<FormRules>(() => ({
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
    ]
}));

// 状态
const loading = ref<boolean>(false);

// 处理方法
const handleLogin = async (): Promise<void> => {
    if (!loginFormRef.value) return;

    const valid = await loginFormRef.value.validate();
    if (!valid) return;

    loading.value = true;
    try {
        const credentials: LoginRequest = {
            email: loginForm.email,
            password: loginForm.password
        };

        const result = await authStore.login(credentials);

        if (result.success) {
            ElMessage.success('登录成功');
            router.push('/');
        } else {
            ElMessage.error(result.error?.detail || '登录失败');
        }
    } catch (error: any) {
        ElMessage.error('登录失败，请稍后重试');
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
    width: 100%;
    max-width: 400px;
    padding: 40px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-card h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
}

.login-form {
    width: 100%;
}

.login-button {
    width: 100%;
    margin-top: 10px;
}

.login-links {
    text-align: center;
    margin-top: 20px;
}

.login-links a {
    color: #409eff;
    text-decoration: none;
}

.login-links a:hover {
    text-decoration: underline;
}
</style>