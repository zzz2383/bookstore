<template>
    <div class="change-password-container">
        <el-container>
            <!-- 侧边栏 -->
            <el-aside width="250px" class="sidebar">
                <div class="user-info-card">
                    <el-avatar :size="60" :src="user?.avatar" class="avatar">
                        {{ user?.username?.charAt(0).toUpperCase() }}
                    </el-avatar>
                    <h3 class="username">{{ user?.username }}</h3>
                    <p class="email">{{ user?.email }}</p>
                </div>

                <el-menu :default-active="'password'" class="profile-menu" @select="handleMenuSelect">
                    <el-menu-item index="profile">
                        <el-icon>
                            <User />
                        </el-icon>
                        <span>个人中心</span>
                    </el-menu-item>
                    <el-menu-item index="password">
                        <el-icon>
                            <Lock />
                        </el-icon>
                        <span>修改密码</span>
                    </el-menu-item>
                </el-menu>
            </el-aside>

            <!-- 主内容区 -->
            <el-main class="main-content">
                <el-card class="password-card">
                    <template #header>
                        <div class="card-header">
                            <h3>修改密码</h3>
                            <div class="security-tips">
                                <el-icon>
                                    <Warning />
                                </el-icon>
                                <span>为确保账户安全，请定期修改密码</span>
                            </div>
                        </div>
                    </template>

                    <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="120px"
                        class="password-form">
                        <el-form-item label="当前密码" prop="old_password">
                            <el-input v-model="passwordForm.old_password" type="password" placeholder="请输入当前密码"
                                show-password :prefix-icon="Lock" />
                            <div class="form-tip">请输入您当前的登录密码</div>
                        </el-form-item>

                        <el-form-item label="新密码" prop="new_password">
                            <el-input v-model="passwordForm.new_password" type="password" placeholder="请输入新密码"
                                show-password :prefix-icon="Lock" />
                            <div class="password-strength">
                                <div class="strength-bar" :class="strengthClass"></div>
                                <span class="strength-text">{{ strengthText }}</span>
                            </div>
                            <div class="password-rules">
                                <p>密码要求：</p>
                                <ul>
                                    <li :class="{ 'met': hasLength }">至少6个字符</li>
                                    <li :class="{ 'met': hasLowercase }">至少一个小写字母</li>
                                    <li :class="{ 'met': hasUppercase }">至少一个大写字母</li>
                                    <li :class="{ 'met': hasNumber }">至少一个数字</li>
                                    <li :class="{ 'met': hasSpecial }">至少一个特殊字符 (!@#$%^&*)</li>
                                </ul>
                            </div>
                        </el-form-item>

                        <el-form-item label="确认新密码" prop="confirm_password">
                            <el-input v-model="passwordForm.confirm_password" type="password" placeholder="请再次输入新密码"
                                show-password :prefix-icon="Lock" />
                            <div class="form-tip">请再次输入新密码以确认</div>
                        </el-form-item>

                        <el-form-item>
                            <el-button type="primary" @click="submitPassword" :loading="submitting" class="submit-btn">
                                确认修改
                            </el-button>
                            <el-button @click="resetForm">重置</el-button>
                        </el-form-item>
                    </el-form>

                    <!-- 安全提示 -->
                    <div class="security-notice">
                        <h4><el-icon>
                                <InfoFilled />
                            </el-icon> 安全提示：</h4>
                        <ul>
                            <li>密码长度至少6位，建议使用数字、字母和特殊符号组合</li>
                            <li>定期修改密码可以提高账户安全性</li>
                            <li>不要在多个网站使用相同的密码</li>
                            <li>不要将密码告诉他人，包括客服人员</li>
                            <li>如果您怀疑密码已泄露，请立即修改</li>
                        </ul>
                    </div>
                </el-card>

                <!-- 修改记录 -->
                <el-card v-if="changeHistory.length > 0" class="history-card">
                    <template #header>
                        <h4>最近修改记录</h4>
                    </template>
                    <el-timeline>
                        <el-timeline-item v-for="(item, index) in changeHistory" :key="index" :timestamp="item.time"
                            placement="top">
                            <el-card shadow="never">
                                <p>密码修改成功</p>
                                <p class="history-ip">IP地址：{{ item.ip }}</p>
                            </el-card>
                        </el-timeline-item>
                    </el-timeline>
                </el-card>
            </el-main>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
    ElMessage,
    ElMessageBox,
    type FormInstance,
    type FormRules
} from 'element-plus';
import {
    User,
    Lock,
    Warning,
    InfoFilled
} from '@element-plus/icons-vue';

const router = useRouter();
const authStore = useAuthStore();

// 获取用户信息
const user = computed(() => authStore.user);

// 菜单选择
const handleMenuSelect = (key: string) => {
    if (key === 'profile') {
        router.push('/profile');
    }
};

// 表单相关
interface PasswordFormData {
    old_password: string;
    new_password: string;
    confirm_password: string;
}

const passwordFormRef = ref<FormInstance>();
const submitting = ref<boolean>(false);

const passwordForm = reactive<PasswordFormData>({
    old_password: '',
    new_password: '',
    confirm_password: ''
});

// 密码强度计算
const hasLength = computed(() => passwordForm.new_password.length >= 6);
const hasLowercase = computed(() => /[a-z]/.test(passwordForm.new_password));
const hasUppercase = computed(() => /[A-Z]/.test(passwordForm.new_password));
const hasNumber = computed(() => /\d/.test(passwordForm.new_password));
const hasSpecial = computed(() => /[!@#$%^&*]/.test(passwordForm.new_password));

const strengthScore = computed(() => {
    let score = 0;
    if (hasLength.value) score++;
    if (hasLowercase.value) score++;
    if (hasUppercase.value) score++;
    if (hasNumber.value) score++;
    if (hasSpecial.value) score++;
    return score;
});

const strengthClass = computed(() => {
    if (strengthScore.value === 0) return '';
    if (strengthScore.value <= 2) return 'strength-weak';
    if (strengthScore.value <= 4) return 'strength-medium';
    return 'strength-strong';
});

const strengthText = computed(() => {
    if (passwordForm.new_password.length === 0) return '请输入密码';
    if (strengthScore.value <= 2) return '弱';
    if (strengthScore.value <= 4) return '中';
    return '强';
});

// 密码确认验证
const validateConfirmPassword = (rule: any, value: string, callback: (error?: Error) => void) => {
    if (value !== passwordForm.new_password) {
        callback(new Error('两次输入的密码不一致'));
    } else {
        callback();
    }
};

// 新密码不能与原密码相同
const validateDifferentPassword = (rule: any, value: string, callback: (error?: Error) => void) => {
    if (value === passwordForm.old_password) {
        callback(new Error('新密码不能与原密码相同'));
    } else {
        callback();
    }
};

// 密码复杂度验证
const validatePasswordComplexity = (rule: any, value: string, callback: (error?: Error) => void) => {
    if (value.length === 0) {
        callback(new Error('请输入新密码'));
        return;
    }

    if (value.length < 6) {
        callback(new Error('密码长度不能小于6位'));
        return;
    }

    if (!hasLowercase.value || !hasUppercase.value || !hasNumber.value) {
        callback(new Error('密码必须包含大小写字母和数字'));
        return;
    }

    callback();
};

// 表单验证规则
const passwordRules: FormRules = {
    old_password: [
        { required: true, message: '请输入当前密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
    ],
    new_password: [
        { required: true, validator: validatePasswordComplexity, trigger: 'blur' },
        { validator: validateDifferentPassword, trigger: 'blur' }
    ],
    confirm_password: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        { validator: validateConfirmPassword, trigger: 'blur' }
    ]
};

// 修改历史（模拟数据）
interface ChangeHistory {
    time: string;
    ip: string;
}

const changeHistory = ref<ChangeHistory[]>([
    { time: '2024-01-15 14:30:00', ip: '192.168.1.100' },
    { time: '2023-12-01 10:20:00', ip: '192.168.1.101' }
]);

// 提交修改
const submitPassword = async () => {
    if (!passwordFormRef.value) return;

    const valid = await passwordFormRef.value.validate();
    if (!valid) return;

    // 再次确认
    try {
        await ElMessageBox.confirm('确定要修改密码吗？修改后需要使用新密码登录。', '确认修改', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
    } catch {
        return; // 用户取消
    }

    submitting.value = true;
    try {
        const passwordData = {
            old_password: passwordForm.old_password,
            new_password: passwordForm.new_password
        };

        const result = await authStore.changePassword(passwordData);

        if (result.success) {
            ElMessage.success('密码修改成功');

            // 添加修改记录
            const now = new Date();
            const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

            // 模拟IP地址
            const mockIp = `192.168.1.${Math.floor(Math.random() * 255)}`;

            changeHistory.value.unshift({
                time,
                ip: mockIp
            });

            // 重置表单
            resetForm();

            // 询问是否重新登录
            setTimeout(() => {
                ElMessageBox.confirm('密码已修改，建议重新登录。是否立即退出？', '安全提示', {
                    confirmButtonText: '退出登录',
                    cancelButtonText: '暂不退出',
                    type: 'info'
                }).then(() => {
                    authStore.logout();
                    router.push('/login');
                });
            }, 1500);
        } else {
            if (result.error?.old_password) {
                ElMessage.error('原密码错误');
            } else {
                ElMessage.error(result.error?.detail || '密码修改失败');
            }
        }
    } catch (error: any) {
        ElMessage.error('密码修改失败，请稍后重试');
    } finally {
        submitting.value = false;
    }
};

// 重置表单
const resetForm = () => {
    passwordForm.old_password = '';
    passwordForm.new_password = '';
    passwordForm.confirm_password = '';
    passwordFormRef.value?.clearValidate();
};

onMounted(() => {
    // 确保用户信息是最新的
    authStore.fetchCurrentUser();
});
</script>

<style scoped>
.change-password-container {
    min-height: 100vh;
    background-color: #f5f5f5;
}

.sidebar {
    background-color: white;
    border-right: 1px solid #e6e6e6;
    padding: 20px;
}

.user-info-card {
    text-align: center;
    padding: 20px 0;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 20px;
}

.avatar {
    margin-bottom: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 20px;
    font-weight: bold;
}

.username {
    margin: 10px 0 5px;
    font-size: 16px;
    color: #333;
}

.email {
    margin: 0;
    color: #999;
    font-size: 12px;
}

.profile-menu {
    border-right: none;
}

.main-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.password-card,
.history-card {
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
}

.card-header h3 {
    margin: 0;
    color: #333;
}

.security-tips {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #e6a23c;
    font-size: 14px;
    background-color: #fdf6ec;
    padding: 8px 12px;
    border-radius: 4px;
    border-left: 4px solid #e6a23c;
}

.password-form {
    max-width: 600px;
    margin: 0 auto;
}

.form-tip {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
}

.password-strength {
    margin-top: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.strength-bar {
    height: 6px;
    border-radius: 3px;
    background-color: #dcdfe6;
    flex: 1;
    overflow: hidden;
    position: relative;
}

.strength-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 0;
    transition: width 0.3s, background-color 0.3s;
}

.strength-weak::after {
    width: 33%;
    background-color: #f56c6c;
}

.strength-medium::after {
    width: 66%;
    background-color: #e6a23c;
}

.strength-strong::after {
    width: 100%;
    background-color: #67c23a;
}

.strength-text {
    font-size: 12px;
    color: #666;
    min-width: 40px;
}

.password-rules {
    margin-top: 10px;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    font-size: 12px;
    color: #606266;
}

.password-rules p {
    margin: 0 0 5px;
    font-weight: bold;
}

.password-rules ul {
    margin: 0;
    padding-left: 20px;
}

.password-rules li {
    margin: 2px 0;
    list-style-type: disc;
    color: #f56c6c;
}

.password-rules li.met {
    color: #67c23a;
    text-decoration: line-through;
}

.submit-btn {
    min-width: 120px;
}

.security-notice {
    margin-top: 30px;
    padding: 20px;
    background-color: #f0f9ff;
    border-radius: 8px;
    border-left: 4px solid #409eff;
}

.security-notice h4 {
    margin: 0 0 10px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
}

.security-notice ul {
    margin: 0;
    padding-left: 20px;
    color: #666;
    font-size: 14px;
    line-height: 1.6;
}

.security-notice li {
    margin: 5px 0;
}

.history-card h4 {
    margin: 0;
    color: #333;
}

.history-ip {
    margin-top: 5px;
    font-size: 12px;
    color: #999;
}
</style>