<template>
    <div class="register-container">
        <div class="register-card">
            <h2>注册</h2>
            <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="register-form">
                <el-form-item prop="email">
                    <el-input v-model="registerForm.email" placeholder="邮箱" :prefix-icon="Message" size="large" />
                </el-form-item>

                <el-form-item prop="username">
                    <el-input v-model="registerForm.username" placeholder="用户名" :prefix-icon="User" size="large" />
                </el-form-item>

                <el-form-item prop="password">
                    <el-input v-model="registerForm.password" type="password" placeholder="密码" :prefix-icon="Lock"
                        size="large" show-password />
                </el-form-item>

                <el-form-item prop="password2">
                    <el-input v-model="registerForm.password2" type="password" placeholder="确认密码" :prefix-icon="Lock"
                        size="large" show-password />
                </el-form-item>

                <el-form-item prop="phone">
                    <el-input v-model="registerForm.phone" placeholder="手机号（可选）" :prefix-icon="Phone" size="large" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" size="large" :loading="loading" @click="handleRegister"
                        class="register-button">
                        注册
                    </el-button>
                </el-form-item>

                <div class="register-links">
                    <router-link to="/login">已有账号？立即登录</router-link>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { Message, User, Lock, Phone } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import type { RegisterRequest } from '@/types/api';

const router = useRouter();
const authStore = useAuthStore();

// 表单引用
const registerFormRef = ref<FormInstance>();

// 表单数据
interface RegisterFormData {
    email: string;
    username: string;
    password: string;
    password2: string;
    phone?: string;
}

const registerForm = reactive<RegisterFormData>({
    email: '',
    username: '',
    password: '',
    password2: '',
    phone: ''
});

// 密码确认验证
const validatePassword2 = (rule: any, value: string, callback: (error?: Error) => void): void => {
    if (value !== registerForm.password) {
        callback(new Error('两次密码不一致'));
    } else {
        callback();
    }
};

// 表单验证规则
const registerRules = computed<FormRules>(() => ({
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在3-20个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
    ],
    password2: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { validator: validatePassword2, trigger: 'blur' }
    ]
}));

// 状态
const loading = ref<boolean>(false);

// 处理方法
const handleRegister = async (): Promise<void> => {
    if (!registerFormRef.value) return;

    const valid = await registerFormRef.value.validate();
    if (!valid) return;

    loading.value = true;
    try {
        const userData: RegisterRequest = {
            email: registerForm.email,
            username: registerForm.username,
            password: registerForm.password,
            password2: registerForm.password2,
            phone: registerForm.phone
        };

        const result = await authStore.register(userData);

        if (result.success) {
            ElMessage.success('注册成功，即将跳转到首页');
            setTimeout(() => {
                router.push('/');
            }, 1500);
        } else {
            // 处理具体的错误信息
            if (result.error?.email) {
                ElMessage.error(`邮箱错误: ${result.error.email}`);
            } else if (result.error?.username) {
                ElMessage.error(`用户名错误: ${result.error.username}`);
            } else {
                ElMessage.error(result.error?.detail || '注册失败');
            }
        }
    } catch (error: any) {
        ElMessage.error('注册失败，请稍后重试');
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.register-card {
    width: 100%;
    max-width: 400px;
    padding: 40px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.register-card h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
}

.register-form {
    width: 100%;
}

.register-button {
    width: 100%;
    margin-top: 10px;
}

.register-links {
    text-align: center;
    margin-top: 20px;
}

.register-links a {
    color: #409eff;
    text-decoration: none;
}

.register-links a:hover {
    text-decoration: underline;
}
</style>