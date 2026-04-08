<template>
  <div class="setting tf-page">
    <div class="settingHeader tf-page-header">
      <div class="tf-page-heading">
        <h1 class="tf-page-title">设置</h1>
        <p class="tf-page-description">统一管理主题、模型接入、运行配置与账户安全。</p>
      </div>
    </div>
    <div class="settingSections">
      <skeleton title="主题" description="控制工作台的色彩基调与主题模式。">
        <themeConfig />
      </skeleton>
      <skeleton title="请求地址配置" description="配置 API 与 WebSocket 入口，优先用于环境接入与联调。">
        <requestConfig />
      </skeleton>
      <skeleton title="登录配置" description="调整登录链路与鉴权入口相关设置。">
        <loginConfig />
      </skeleton>
      <!-- <skeleton title="官方模型配置" divider>
      <officialConfig />
    </skeleton> -->
      <skeleton title="语言模型配置" description="管理语言模型供应商、模型预设与自定义接入。">
        <aiConfog />
      </skeleton>
      <skeleton title="视频模型配置" description="统一维护视频生成相关模型与服务配置。">
        <videoModelConfig />
      </skeleton>
      <skeleton title="提示词配置" description="维护高频提示词模板，降低重复输入成本。">
        <promptsEdit />
      </skeleton>
      <skeleton title="其他配置" description="补充非核心但常用的工作台运行参数。">
        <otherConfig />
      </skeleton>
      <skeleton title="数据库操作" description="高风险维护操作，仅在确认后执行。">
        <dbConfig />
      </skeleton>
      <skeleton title="关于" description="查看当前版本、仓库链接与更新入口。">
        <about />
      </skeleton>
      <skeleton title="退出登录" description="结束当前会话并返回登录页。">
        <logoutConfig />
      </skeleton>
    </div>
  </div>
</template>

<script setup lang="ts">
import skeleton from "./skeleton.vue";
import themeConfig from "./components/themeConfig.vue";
import requestConfig from "./components/requestConfig.vue";
import loginConfig from "./components/loginConfig.vue";
import aiConfog from "./components/aiConfog.vue";
import videoModelConfig from "./components/videoModelConfig.vue";
import promptsEdit from "./components/promptsEdit.vue";
import dbConfig from "./components/dbConfig.vue";
import otherConfig from "./components/otherConfig.vue";
import about from "./components/about.vue";
import logoutConfig from "./components/logoutConfig.vue";
</script>

<style lang="scss" scoped>
.setting {
  width: 100%;
  min-height: 100%;

  .settingSections {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}
</style>
