<template>
  <div class="request-config">
    <div class="intro">
      <p>优先用于切换运行环境、远程服务地址和联调入口。</p>
    </div>
    <t-form :data="formData" labelAlign="top" :rules="formRules" @submit="handleSubmit">
      <t-form-item label="API 地址" name="baseUrl">
        <t-input v-model="formData.baseUrl" :placeholder="endpointDefaults.baseUrl" clearable>
          <template #prefix-icon>
            <t-icon name="link" />
          </template>
        </t-input>
      </t-form-item>
      <t-form-item label="WebSocket地址" name="wsBaseUrl">
        <t-input v-model="formData.wsBaseUrl" :placeholder="endpointDefaults.wsBaseUrl" clearable>
          <template #prefix-icon>
            <t-icon name="swap" />
          </template>
        </t-input>
      </t-form-item>
      <t-form-item>
        <t-space size="small" class="actionRow">
          <t-button theme="primary" type="submit">保存</t-button>
          <t-button theme="default" @click="handleReset">重置</t-button>
        </t-space>
      </t-form-item>
    </t-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { MessagePlugin, type FormRules } from "tdesign-vue-next";
import useSettingStore from "@/stores/setting";
import { getRuntimeEndpointDefaults, normalizeApiBaseUrl, normalizeWsBaseUrl } from "@/utils/runtimeEndpoints";

interface RequestForm {
  baseUrl: string;
  wsBaseUrl: string;
}

const settingStore = useSettingStore();
const endpointDefaults = getRuntimeEndpointDefaults();

const formData = ref<RequestForm>({
  baseUrl: "",
  wsBaseUrl: "",
});

const formRules: FormRules<RequestForm> = {
  baseUrl: [
    { required: true, message: "请输入 API 地址", trigger: "blur" },
    {
      pattern: /^(https?:\/\/.+|\/.+)$/,
      message: "请输入有效地址（如 http://host/api 或 /api）",
      trigger: "blur",
    },
  ],
  wsBaseUrl: [
    { required: true, message: "请输入 WebSocket 地址", trigger: "blur" },
    {
      pattern: /^wss?:\/\/.+/,
      message: "请输入有效的 WS/WSS 地址",
      trigger: "blur",
    },
  ],
};

function loadSettings() {
  settingStore.initializeEndpoints();
  formData.value.baseUrl = settingStore.baseUrl;
  formData.value.wsBaseUrl = settingStore.wsBaseUrl;
}

function handleSubmit({ validateResult }: { validateResult: unknown }) {
  if (validateResult === true) {
    const normalizedBaseUrl = normalizeApiBaseUrl(formData.value.baseUrl);
    const normalizedWsBaseUrl = normalizeWsBaseUrl(formData.value.wsBaseUrl);
    settingStore.setEndpoints(normalizedBaseUrl, normalizedWsBaseUrl);
    formData.value.baseUrl = settingStore.baseUrl;
    formData.value.wsBaseUrl = settingStore.wsBaseUrl;
    MessagePlugin.success("请求地址保存成功");
  }
}

function handleReset() {
  settingStore.resetEndpointsToDefaults();
  formData.value.baseUrl = settingStore.baseUrl;
  formData.value.wsBaseUrl = settingStore.wsBaseUrl;
  MessagePlugin.success("已重置为默认地址");
}

onMounted(() => {
  loadSettings();
});
</script>

<style lang="scss" scoped>
.request-config {
  padding: 4px 0;

  .intro {
    margin-bottom: 16px;

    p {
      margin: 0;
      color: var(--tf-text-secondary);
      font: var(--tf-font-caption);
    }
  }

  .actionRow {
    margin-top: 4px;
  }
}
</style>
