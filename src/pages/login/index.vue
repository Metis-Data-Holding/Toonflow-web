<template>
  <div class="bg"></div>
  <div class="bgOverlay"></div>
  <div class="loginPage">
    <div class="formBox">
      <!-- 右下角设置按钮 -->
      <!-- 设置弹窗 -->
      <a-modal v-model:open="showSettingModal" title="服务器设置" @ok="handleSaveSetting" :width="400" wrapClassName="login-setting-modal">
        <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
          <a-form-item label="请求地址">
            <a-input v-model:value="tempBaseUrl" :placeholder="endpointDefaults.baseUrl" />
          </a-form-item>
          <a-form-item label="WS地址">
            <a-input v-model:value="tempWsBaseUrl" :placeholder="endpointDefaults.wsBaseUrl" />
          </a-form-item>
        </a-form>
      </a-modal>
      <div class="logoBox">
        <img :src="logo" alt="logo" class="logo-img" />
        <span class="logo-text">Toonflow</span>
      </div>
      <div class="heroCopy">
        <h1>深色 AI 创作工作台</h1>
        <p>统一管理剧本、分镜、资产与视频生成配置。</p>
      </div>
      <a-form :model="state.user" :rules="state.rules" ref="ruleFormRef" @finish="handleFinish" class="login-form">
        <a-form-item name="username">
          <a-input v-model:value="state.user.username" placeholder="请输入账号" autocomplete="username" size="large">
            <template #prefix>
              <i-people theme="outline" class="input-icon" />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item name="password">
          <a-input-password v-model:value="state.user.password" placeholder="请输入密码" size="large">
            <template #prefix>
              <i-lock theme="outline" class="input-icon" />
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item>
          <a-button class="loginBtn" type="primary" size="large" :loading="state.loginLoading" html-type="submit" block>登录</a-button>
        </a-form-item>
      </a-form>
      <a-alert v-if="showHint" class="default-hint" type="info" closable @close="showHint = false">
        <template #message>
          <div class="hint-content">
            <p>
              默认账号：
              <code>admin</code>
            </p>
            <p>
              默认密码：
              <code>admin123</code>
            </p>
            <p>登录后可在设置中修改</p>
          </div>
        </template>
      </a-alert>
    </div>
  </div>
  <div class="settingBtn" @click="showSettingModal = true">
    <t-button shape="circle" theme="primary" size="large">
      <template #icon>
        <i-setting-two theme="outline" size="20" />
      </template>
    </t-button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import { Alert, message } from "ant-design-vue";
import logo from "@/assets/logo.svg";
import axios from "@/utils/axios";
import settingStore from "@/stores/setting";
import { storeToRefs } from "pinia";
import { getRuntimeEndpointDefaults } from "@/utils/runtimeEndpoints";

const store = settingStore();
const { baseUrl, wsBaseUrl } = storeToRefs(store);
const endpointDefaults = getRuntimeEndpointDefaults();

const svgRef = ref<HTMLElement | null>(null);
const showHint = ref(true);
const showSettingModal = ref(false);
const tempBaseUrl = ref(baseUrl.value);
const tempWsBaseUrl = ref(wsBaseUrl.value);

watch(showSettingModal, (visible) => {
  if (visible) {
    tempBaseUrl.value = baseUrl.value;
    tempWsBaseUrl.value = wsBaseUrl.value;
  }
});

// 保存设置
const handleSaveSetting = () => {
  store.setEndpoints(tempBaseUrl.value, tempWsBaseUrl.value);
  tempBaseUrl.value = baseUrl.value;
  tempWsBaseUrl.value = wsBaseUrl.value;
  showSettingModal.value = false;
  message.success("设置已保存");
};
const state = ref({
  show: true,
  loginLoading: false,
  user: {
    username: "",
    password: "",
    captcha: "",
    identity: "商家",
  },
  rules: {
    username: [{ required: true, message: "请输入您的账号" }],
    password: [{ required: true, message: "请输入密码" }],
    captcha: [{ required: true, message: "请输入验证码" }],
  },
});

const svg = ref();
const captcha = ref();
const router = useRouter();

onMounted(() => {
  resSvg();
});

const navigateToProject = async () => {
  const targetPath = "/project";

  try {
    await router.replace(targetPath);
    await nextTick();
  } catch {}

  if (router.currentRoute.value.path !== targetPath) {
    window.location.hash = targetPath;
  }
};

const handleFinish = async (values: { username: string; password: string; captcha?: string; identity?: string }) => {
  state.value.loginLoading = true;
  const obj = { ...values };
  try {
    const { data } = await axios.post("/other/login", obj);
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.id);
    await navigateToProject();
    message.success("登录成功");
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "登录失败";
    message.error(errorMessage);
    resSvg();
  } finally {
    state.value.loginLoading = false;
  }
};

const resSvg = async () => {};
</script>

<style lang="scss" scoped>
.bg {
  position: fixed;
  height: 100vh;
  width: 100vw;
  background-image: url("@/assets/bg.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  filter: saturate(0.7) brightness(0.4);
}

.bgOverlay {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(124, 132, 255, 0.16), transparent 32%),
    radial-gradient(circle at 80% 10%, rgba(34, 197, 94, 0.08), transparent 24%),
    linear-gradient(180deg, rgba(11, 13, 16, 0.72) 0%, rgba(11, 13, 16, 0.92) 100%);
}

.loginPage {
  z-index: 999;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  .formBox {
    width: 420px;
    padding: 40px 40px 32px;
    background: rgba(17, 19, 24, 0.94);
    border: 1px solid var(--tf-border-strong);
    border-radius: 16px;
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.42);

    .logoBox {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 18px;
      gap: 12px;

      .logo-img {
        width: 48px;
        height: 48px;
      }

      .logo-text {
        font-size: 28px;
        font-weight: 600;
        color: var(--tf-text-primary);
        letter-spacing: 1px;
      }
    }

    .heroCopy {
      margin-bottom: 24px;
      text-align: center;

      h1 {
        margin: 0 0 8px;
        color: var(--tf-text-primary);
        font-size: 22px;
        font-weight: 600;
      }

      p {
        margin: 0;
        color: var(--tf-text-secondary);
        font-size: 14px;
        line-height: 1.6;
      }
    }

    .login-form {
      .input-icon {
        color: var(--tf-text-tertiary);
        font-size: 18px;
      }

      :deep(.ant-input-affix-wrapper) {
        padding: 8px 12px;
        border-radius: 10px;
        border-color: var(--tf-border-strong);
        background: rgba(255, 255, 255, 0.03);
        color: var(--tf-text-primary);

        &:hover,
        &:focus-within {
          border-color: rgba(124, 132, 255, 0.42);
          box-shadow: 0 0 0 3px rgba(124, 132, 255, 0.12);
        }
      }

      :deep(.ant-input),
      :deep(.ant-input-password input) {
        background: transparent;
        color: var(--tf-text-primary);
      }

      :deep(.ant-input::placeholder),
      :deep(.ant-input-password input::placeholder) {
        color: var(--tf-text-tertiary);
      }

      :deep(.ant-form-item) {
        margin-bottom: 20px;
      }

      :deep(.ant-form-item-explain-error) {
        color: #fda4af;
      }
    }

    .loginBtn {
      height: 44px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 500;
      margin-top: 8px;
      background: var(--tf-accent);
      border: none;
      box-shadow: 0 10px 24px rgba(124, 132, 255, 0.2);

      &:hover {
        background: var(--tf-accent-hover);
        box-shadow: 0 14px 28px rgba(124, 132, 255, 0.24);
      }
    }
  }
}

.default-hint {
  margin-top: 20px;
  border-radius: 12px;
  border: 1px solid rgba(124, 132, 255, 0.16);

  :deep(.ant-alert-message) {
    width: 100%;
  }

  :deep(.ant-alert-info) {
    background: rgba(124, 132, 255, 0.08);
    border: none;
  }

  :deep(.ant-alert-close-icon) {
    color: var(--tf-text-secondary);
  }

  .hint-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: var(--tf-text-secondary);

    p {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  code {
    background: rgba(11, 13, 16, 0.56);
    padding: 2px 10px;
    border-radius: 8px;
    font-family: "Monaco", "Menlo", monospace;
    color: var(--tf-text-primary);
    font-weight: 500;
    font-size: 13px;
    border: 1px solid var(--tf-border-subtle);
  }
}

.settingBtn {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 9999;
}

:global(.login-setting-modal) {
  .ant-modal-content {
    background: var(--tf-surface-panel);
    border: 1px solid var(--tf-border-strong);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.36);
  }

  .ant-modal-header {
    background: var(--tf-surface-float);
    border-bottom: 1px solid var(--tf-border-subtle);
  }

  .ant-modal-title {
    color: var(--tf-text-primary);
  }

  .ant-modal-close {
    color: var(--tf-text-secondary);
  }

  .ant-form-item-label > label {
    color: var(--tf-text-secondary);
  }

  .ant-input {
    background: rgba(255, 255, 255, 0.03);
    border-color: var(--tf-border-strong);
    color: var(--tf-text-primary);
  }

  .ant-input::placeholder {
    color: var(--tf-text-tertiary);
  }

  .ant-btn-primary {
    background: var(--tf-accent);
    border-color: var(--tf-accent);
  }
}
</style>
