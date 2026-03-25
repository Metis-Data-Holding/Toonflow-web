<template>
  <t-config-provider :global-config="globalConfig">
    <el-config-provider>
      <a-config-provider :theme="theme" :locale="zhCN">
        <router-view></router-view>
        <UpdateDialog />
      </a-config-provider>
    </el-config-provider>
  </t-config-provider>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import UpdateDialog from "@/components/update.vue";
import { initTheme } from "@/utils/theme";
import settingStore from "@/stores/setting";

const route = useRoute();
const store = settingStore();

// 从 URL query 参数设置请求地址
const initFromQuery = () => {
  const query = route.query;
  store.initializeEndpoints({
    queryBaseUrl: typeof query.baseUrl === "string" ? query.baseUrl : undefined,
    queryWsBaseUrl: typeof query.wsBaseUrl === "string" ? query.wsBaseUrl : undefined,
  });
};
// 监听路由变化，确保 query 参数更新时也能处理
watch(
  () => route.query,
  () => {
    initFromQuery();
  },
  { immediate: true, deep: true },
);
// 初始化主题
onMounted(() => {
  initTheme();
});

const theme = {
  token: {
    colorPrimary: "#9810fa",
  },
};

import { merge } from "lodash-es";
import zhConfig from "tdesign-vue-next/es/locale/zh_CN";

import { type GlobalConfigProvider } from "tdesign-vue-next";
const empty: GlobalConfigProvider = {};
const customConfig: GlobalConfigProvider = {
  calendar: {},
  table: {},
  pagination: {},
};
const globalConfig: GlobalConfigProvider = merge(empty, zhConfig, customConfig);

// document.documentElement.setAttribute('theme-mode', 'dark');
// document.documentElement.setAttribute('theme-mode', 'light');
</script>

<style lang="scss">
:root {
  --mainColor: #9810fa;
  --mainColorLight: #faf5ff;
  --mainColorHover: #7c0dd4;
  --mainColorActive: #6a0bb5;
  --mainGradient: linear-gradient(135deg, #9810fa 0%, #7c3aed 100%);
  --mainGradientHover: linear-gradient(135deg, #a020fb 0%, #8b5cf6 100%);
}
</style>
