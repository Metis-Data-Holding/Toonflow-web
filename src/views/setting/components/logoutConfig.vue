<template>
  <div class="logout-config">
    <div class="warningPanel">
      <div class="warningIcon">
        <t-icon name="notification" />
      </div>
      <div class="warningContent">
        <strong>退出后需要重新登录</strong>
        <p>当前设备上的登录态会被清除，但不会影响已保存的本地配置。</p>
      </div>
    </div>
    <t-space direction="vertical" size="medium">
      <t-popconfirm content="确定要退出登录吗？" @confirm="handleLogout">
        <t-button theme="danger" :loading="loading">
          <template #icon>
            <t-icon name="logout" />
          </template>
          退出登录
        </t-button>
      </t-popconfirm>
    </t-space>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { MessagePlugin } from "tdesign-vue-next";

const router = useRouter();
const loading = ref(false);

async function handleLogout() {
  loading.value = true;
  try {
    // 清除本地存储的token
    localStorage.removeItem("token");
    // 清除其他可能的用户数据
    localStorage.removeItem("user");

    MessagePlugin.success("退出登录成功");

    // 跳转到登录页面
    await router.replace("/login");
  } catch (error) {
    MessagePlugin.error("退出登录失败，请重试");
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.logout-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 0;

  .warningPanel {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    border: 1px solid rgba(245, 158, 11, 0.24);
    border-radius: 12px;
    background: rgba(245, 158, 11, 0.08);
  }

  .warningIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 10px;
    background: rgba(245, 158, 11, 0.14);
    color: var(--tf-warning);
    flex-shrink: 0;
  }

  .warningContent {
    strong {
      display: block;
      margin-bottom: 4px;
      color: var(--tf-text-primary);
      font-size: 14px;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: var(--tf-text-secondary);
      font: var(--tf-font-caption);
    }
  }
}
</style>
