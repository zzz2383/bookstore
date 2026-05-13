<template>
  <!-- 确保 router-view 占满整个视口 -->
  <router-view v-slot="{ Component }">
    <component :is="Component" class="page-wrapper" />
  </router-view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  if (authStore.accessToken) {
    authStore.fetchCurrentUser().catch(() => {
      authStore.clearAuth();
    });
  }
});
</script>

<style scoped>
/* 给路由视图外层加一个全屏包裹 */
.page-wrapper {
  width: 100vw;
  height: 100vh;
}
</style>