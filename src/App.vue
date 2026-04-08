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
import { theme as antTheme } from "ant-design-vue";
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
  algorithm: antTheme.darkAlgorithm,
  token: {
    colorPrimary: "#7c84ff",
    colorBgBase: "#0b0d10",
    colorBgLayout: "#0b0d10",
    colorBgContainer: "#111318",
    colorBgElevated: "#1c212b",
    colorFillSecondary: "#171a21",
    colorFillTertiary: "#1c212b",
    colorBorder: "rgba(255,255,255,0.08)",
    colorBorderSecondary: "rgba(255,255,255,0.12)",
    colorText: "#f3f5f7",
    colorTextSecondary: "#a7b0be",
    colorTextTertiary: "#6f7785",
    borderRadius: 12,
    borderRadiusLG: 16,
    controlHeight: 36,
    controlOutline: "rgba(124,132,255,0.2)",
    boxShadowSecondary: "0 18px 48px rgba(0, 0, 0, 0.34)",
  },
  components: {
    Button: {
      primaryShadow: "none",
      defaultShadow: "none",
    },
    Card: {
      colorBgContainer: "#111318",
    },
    Input: {
      colorBgContainer: "#171a21",
      activeBg: "#171a21",
      hoverBg: "#171a21",
    },
    Modal: {
      contentBg: "#111318",
      headerBg: "#111318",
      footerBg: "#111318",
    },
    Table: {
      headerBg: "#171a21",
      headerColor: "#f3f5f7",
      rowHoverBg: "rgba(124,132,255,0.08)",
      borderColor: "rgba(255,255,255,0.08)",
    },
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
</script>
