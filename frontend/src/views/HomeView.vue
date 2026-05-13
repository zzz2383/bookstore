<template>
    <div class="home-container fill-parent">
        <el-container class="fill-parent">
            <!-- 顶部导航栏 -->
            <el-header class="header">
                <div class="header-content">
                    <div class="header-left">
                        <h1>在线书店</h1>
                    </div>
                    <div class="header-right">
                        <el-dropdown v-if="authStore.user" @command="handleCommand">
                            <span class="user-info">
                                <el-avatar :size="32" :src="authStore.user.avatar" />
                                <span class="username">{{ authStore.user.username }}</span>
                                <el-icon><arrow-down /></el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                                    <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
                                    <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                        <div v-else class="auth-buttons">
                            <el-button type="text" @click="goToLogin">登录</el-button>
                            <el-button type="primary" @click="goToRegister">注册</el-button>
                        </div>
                    </div>
                </div>
            </el-header>

            <!-- 主内容区 -->
            <el-main class="main-content">
                <div class="welcome-section global-card">
                    <h2>欢迎来到在线书店</h2>
                    <p v-if="authStore.user">欢迎回来，{{ authStore.user.username }}！</p>
                    <p v-else>请登录或注册以开始购物</p>
                </div>
            </el-main>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';

const router = useRouter();
const authStore = useAuthStore();

// 处理下拉菜单命令
const handleCommand = async (command: string): Promise<void> => {
    if (command === 'profile') {
        router.push('/profile');
    } else if (command === 'changePassword') {
        router.push('/change-password');
    } else if (command === 'logout') {
        try {
            await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            });
            await authStore.logout();
            ElMessage.success('已退出登录');
            router.push('/login');
        } catch {
            // 用户取消
        }
    }
};

// 跳转到登录页
const goToLogin = (): void => {
    router.push('/login');
};

// 跳转到注册页
const goToRegister = (): void => {
    router.push('/register');
};
</script>

<style scoped>
.home-container {
    display: flex;
    flex-direction: column;
    background-color: #f5f7fa;
}

.header {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 20px;
}

.header-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left h1 {
    margin: 0;
    color: #333;
    font-size: 20px;
    font-weight: bold;
}

.user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 4px;
    transition: background-color 0.3s;
    color: #606266;
}

.user-info:hover {
    background-color: #f5f7fa;
}

.username {
    margin: 0 8px;
    font-size: 14px;
}

.auth-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
}

.main-content {
    padding: 20px;
    overflow: auto;
    display: flex;
    flex-direction: column;
}

.welcome-section {
    flex: 1;
    padding: 40px 20px;
    text-align: center;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 300px;
}

.welcome-section h2 {
    color: #333;
    margin-bottom: 20px;
    font-size: 24px;
}

.welcome-section p {
    color: #666;
    font-size: 16px;
    margin-top: 10px;
}
</style>
