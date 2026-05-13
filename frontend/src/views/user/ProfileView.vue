<template>
    <div class="profile-container">
        <el-container>
            <!-- 侧边栏 -->
            <el-aside width="250px" class="sidebar">
                <div class="user-info-card">
                    <el-avatar :size="80" :src="user?.avatar" class="avatar">
                        {{ user?.username?.charAt(0).toUpperCase() }}
                    </el-avatar>
                    <h3 class="username">{{ user?.username }}</h3>
                    <p class="email">{{ user?.email }}</p>
                    <div class="stats">
                        <div class="stat-item">
                            <span class="stat-value">0</span>
                            <span class="stat-label">订单</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">0</span>
                            <span class="stat-label">收藏</span>
                        </div>
                    </div>
                </div>

                <el-menu :default-active="activeMenu" class="profile-menu" @select="handleMenuSelect">
                    <el-menu-item index="basic">
                        <el-icon>
                            <User />
                        </el-icon>
                        <span>基本信息</span>
                    </el-menu-item>
                    <el-menu-item index="profile">
                        <el-icon>
                            <Setting />
                        </el-icon>
                        <span>个人资料</span>
                    </el-menu-item>
                    <el-menu-item index="avatar">
                        <el-icon>
                            <Picture />
                        </el-icon>
                        <span>头像设置</span>
                    </el-menu-item>
                </el-menu>
            </el-aside>

            <!-- 主内容区 -->
            <el-main class="main-content">
                <!-- 基本信息 -->
                <el-card v-if="activeMenu === 'basic'" class="profile-card">
                    <template #header>
                        <div class="card-header">
                            <h3>基本信息</h3>
                            <el-button v-if="!isEditing" type="primary" :icon="Edit" @click="startEdit">
                                编辑
                            </el-button>
                        </div>
                    </template>

                    <el-form ref="basicFormRef" :model="basicForm" :rules="basicRules" label-width="100px"
                        :disabled="!isEditing">
                        <el-form-item label="用户名" prop="username">
                            <el-input v-model="basicForm.username" placeholder="请输入用户名" maxlength="20"
                                show-word-limit />
                        </el-form-item>

                        <el-form-item label="邮箱" prop="email">
                            <el-input v-model="basicForm.email" placeholder="请输入邮箱" disabled />
                            <div class="form-tip">邮箱为登录账号，不可修改</div>
                        </el-form-item>

                        <el-form-item label="手机号" prop="phone">
                            <el-input v-model="basicForm.phone" placeholder="请输入手机号" maxlength="11" />
                        </el-form-item>

                        <el-form-item label="个人简介" prop="bio">
                            <el-input v-model="basicForm.bio" type="textarea" :rows="4" placeholder="介绍一下自己吧～"
                                maxlength="500" show-word-limit />
                        </el-form-item>

                        <el-form-item v-if="isEditing">
                            <el-button type="primary" @click="saveBasicInfo" :loading="basicSaving">
                                保存
                            </el-button>
                            <el-button @click="cancelEdit">取消</el-button>
                        </el-form-item>
                    </el-form>
                </el-card>

                <!-- 个人资料 -->
                <el-card v-else-if="activeMenu === 'profile'" class="profile-card">
                    <template #header>
                        <div class="card-header">
                            <h3>个人资料</h3>
                        </div>
                    </template>

                    <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="100px">
                        <el-form-item label="性别" prop="gender">
                            <el-radio-group v-model="profileForm.gender">
                                <el-radio label="male">男</el-radio>
                                <el-radio label="female">女</el-radio>
                                <el-radio label="other">其他</el-radio>
                            </el-radio-group>
                        </el-form-item>

                        <el-form-item label="出生日期" prop="birth_date">
                            <el-date-picker v-model="profileForm.birth_date" type="date" placeholder="选择出生日期"
                                value-format="YYYY-MM-DD" style="width: 100%" />
                        </el-form-item>

                        <el-form-item label="地址" prop="address">
                            <el-input v-model="profileForm.address" type="textarea" :rows="3" placeholder="请输入详细地址"
                                maxlength="255" show-word-limit />
                        </el-form-item>

                        <el-form-item>
                            <el-button type="primary" @click="saveProfile" :loading="profileSaving">
                                保存
                            </el-button>
                        </el-form-item>
                    </el-form>
                </el-card>

                <!-- 头像设置 -->
                <el-card v-else-if="activeMenu === 'avatar'" class="profile-card">
                    <template #header>
                        <div class="card-header">
                            <h3>头像设置</h3>
                        </div>
                    </template>

                    <div class="avatar-upload-section">
                        <div class="current-avatar">
                            <h4>当前头像</h4>
                            <el-avatar :size="120" :src="user?.avatar" class="current-avatar-img">
                                {{ user?.username?.charAt(0).toUpperCase() }}
                            </el-avatar>
                        </div>

                        <div class="upload-area">
                            <h4>上传新头像</h4>
                            <el-upload ref="uploadRef" class="avatar-uploader" action="#" :show-file-list="false"
                                :before-upload="beforeAvatarUpload" :http-request="handleAvatarUpload"
                                accept=".jpg,.jpeg,.png,.gif">
                                <div v-if="uploading" class="uploading">
                                    <el-icon class="is-loading">
                                        <Loading />
                                    </el-icon>
                                    <span>上传中...</span>
                                </div>
                                <div v-else-if="!imageUrl" class="upload-default">
                                    <el-icon :size="50">
                                        <Plus />
                                    </el-icon>
                                    <div class="upload-tip">点击或拖拽上传</div>
                                    <div class="upload-requirements">
                                        支持 JPG、PNG、GIF 格式，大小不超过 2MB
                                    </div>
                                </div>
                                <img v-else :src="imageUrl" class="avatar-preview" />
                            </el-upload>

                            <div class="avatar-actions" v-if="imageUrl">
                                <el-button type="primary" @click="saveAvatar" :loading="avatarSaving">
                                    保存头像
                                </el-button>
                                <el-button @click="cancelAvatar">取消</el-button>
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-main>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import {
    ElMessage,
    ElMessageBox,
    type FormInstance,
    type FormRules,
    type UploadInstance,
    type UploadRawFile,
    type UploadRequestOptions
} from 'element-plus';
import {
    User,
    Setting,
    Picture,
    Edit,
    Plus,
    Loading
} from '@element-plus/icons-vue';

const authStore = useAuthStore();

// 获取用户信息
const user = computed(() => authStore.user);

// 菜单相关
const activeMenu = ref<string>('basic');

const handleMenuSelect = (key: string) => {
    activeMenu.value = key;
};

// 基本信息表单
interface BasicFormData {
    username: string;
    email: string;
    phone?: string;
    bio?: string;
}

const basicFormRef = ref<FormInstance>();
const isEditing = ref<boolean>(false);
const basicSaving = ref<boolean>(false);

const basicForm = reactive<BasicFormData>({
    username: '',
    email: '',
    phone: '',
    bio: ''
});

const basicRules: FormRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在3-20个字符', trigger: 'blur' }
    ],
    phone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    bio: [
        { max: 500, message: '个人简介不能超过500个字符', trigger: 'blur' }
    ]
};

// 初始化基本信息
const initBasicForm = () => {
    if (user.value) {
        basicForm.username = user.value.username || '';
        basicForm.email = user.value.email || '';
        basicForm.phone = user.value.phone || '';
        basicForm.bio = user.value.bio || '';
    }
};

// 开始编辑
const startEdit = () => {
    isEditing.value = true;
};

// 取消编辑
const cancelEdit = () => {
    isEditing.value = false;
    initBasicForm();
};

// 保存基本信息
const saveBasicInfo = async () => {
    if (!basicFormRef.value) return;

    const valid = await basicFormRef.value.validate();
    if (!valid) return;

    basicSaving.value = true;
    try {
        const updateData = {
            username: basicForm.username,
            phone: basicForm.phone || '',
            bio: basicForm.bio || ''
        };

        const result = await authStore.updateUser(updateData);

        if (result.success) {
            ElMessage.success('基本信息更新成功');
            isEditing.value = false;
        } else {
            ElMessage.error(result.error?.detail || '更新失败');
        }
    } catch (error: any) {
        ElMessage.error('更新失败，请稍后重试');
    } finally {
        basicSaving.value = false;
    }
};

// 个人资料表单
interface ProfileFormData {
    gender?: 'male' | 'female' | 'other';
    birth_date?: string;
    address?: string;
}

const profileFormRef = ref<FormInstance>();
const profileSaving = ref<boolean>(false);

const profileForm = reactive<ProfileFormData>({
    gender: undefined,
    birth_date: '',
    address: ''
});

const profileRules: FormRules = {
    address: [
        { max: 255, message: '地址不能超过255个字符', trigger: 'blur' }
    ]
};

// 初始化个人资料
const initProfileForm = () => {
    if (user.value?.profile) {
        profileForm.gender = user.value.profile.gender;
        profileForm.birth_date = user.value.profile.birth_date || '';
        profileForm.address = user.value.profile.address || '';
    }
};

// 保存个人资料
const saveProfile = async () => {
    if (!profileFormRef.value) return;

    const valid = await profileFormRef.value.validate();
    if (!valid) return;

    profileSaving.value = true;
    try {
        const result = await authStore.updateUser({
            profile: {
                ...profileForm,
                gender: profileForm.gender || undefined,
                birth_date: profileForm.birth_date || undefined,
                address: profileForm.address || undefined,
                created_at: new Date().toISOString(),  // 添加当前时间
                updated_at: new Date().toISOString()    // 添加当前时间
            }
        });

        if (result.success) {
            ElMessage.success('个人资料更新成功');
        } else {
            ElMessage.error(result.error?.detail || '更新失败');
        }
    } catch (error: any) {
        ElMessage.error('更新失败，请稍后重试');
    } finally {
        profileSaving.value = false;
    }
};

// 头像上传相关
interface UploadResponse {
    url: string;
}

const uploadRef = ref<UploadInstance>();
const imageUrl = ref<string>('');
const uploading = ref<boolean>(false);
const avatarSaving = ref<boolean>(false);

// 上传前的验证
const beforeAvatarUpload = (file: UploadRawFile): boolean => {
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file.name);
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isImage) {
        ElMessage.error('只能上传图片文件!');
        return false;
    }
    if (!isLt2M) {
        ElMessage.error('图片大小不能超过2MB!');
        return false;
    }

    return true;
};

// 自定义上传
const handleAvatarUpload = async (options: UploadRequestOptions): Promise<void> => {
    const file = options.file;
    uploading.value = true;

    // 创建预览URL
    const reader = new FileReader();
    reader.onload = (e) => {
        if (e.target?.result) {
            imageUrl.value = e.target.result as string;
        }
    };
    reader.readAsDataURL(file);

    uploading.value = false;
};

// 保存头像
const saveAvatar = async (): Promise<void> => {
    if (!imageUrl.value) {
        ElMessage.warning('请先上传头像');
        return;
    }

    avatarSaving.value = true;
    try {
        // 在实际项目中，这里应该将图片上传到服务器
        // 这里模拟上传过程
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 假设服务器返回图片URL
        const avatarUrl = imageUrl.value;

        const result = await authStore.updateUser({
            avatar: avatarUrl
        });

        if (result.success) {
            ElMessage.success('头像更新成功');
            imageUrl.value = '';
        } else {
            ElMessage.error(result.error?.detail || '头像更新失败');
        }
    } catch (error: any) {
        ElMessage.error('头像上传失败，请稍后重试');
    } finally {
        avatarSaving.value = false;
    }
};

// 取消头像上传
const cancelAvatar = (): void => {
    imageUrl.value = '';
};

// 监听用户信息变化
watch(user, (newUser) => {
    if (newUser) {
        initBasicForm();
        initProfileForm();
    }
}, { immediate: true });

onMounted(() => {
    // 确保用户信息是最新的
    authStore.fetchCurrentUser();
});
</script>

<style scoped>
.profile-container {
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
    margin-bottom: 15px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 24px;
    font-weight: bold;
}

.username {
    margin: 10px 0 5px;
    font-size: 18px;
    color: #333;
}

.email {
    margin: 0 0 20px;
    color: #999;
    font-size: 14px;
}

.stats {
    display: flex;
    justify-content: space-around;
    padding: 15px 0;
    border-top: 1px solid #f0f0f0;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-value {
    font-size: 20px;
    font-weight: bold;
    color: #333;
}

.stat-label {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
}

.profile-menu {
    border-right: none;
}

.main-content {
    padding: 20px;
}

.profile-card {
    max-width: 800px;
    margin: 0 auto;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.form-tip {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
}

.avatar-upload-section {
    display: flex;
    gap: 50px;
    align-items: flex-start;
}

.current-avatar,
.upload-area {
    flex: 1;
}

.current-avatar h4,
.upload-area h4 {
    margin-bottom: 20px;
    color: #333;
}

.current-avatar-img {
    display: block;
    margin: 0 auto;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 36px;
    font-weight: bold;
}

.avatar-uploader {
    width: 200px;
    height: 200px;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.3s;
}

.avatar-uploader:hover {
    border-color: #409eff;
}

.upload-default {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999;
}

.upload-tip {
    margin-top: 10px;
    font-size: 14px;
}

.upload-requirements {
    margin-top: 5px;
    font-size: 12px;
    color: #ccc;
    text-align: center;
    max-width: 150px;
}

.uploading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #409eff;
}

.is-loading {
    animation: rotating 2s linear infinite;
    font-size: 30px;
    margin-bottom: 10px;
}

@keyframes rotating {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.avatar-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-actions {
    margin-top: 20px;
    display: flex;
    gap: 10px;
}
</style>