<template>
  <div class="otherConfig">
    <div class="intro">
      <p>集中管理运行时节奏与批量处理容量，避免零散参数分散在业务页面内。</p>
    </div>
    <t-form label-align="top">
      <div class="configGrid">
        <t-form-item label="请求超时时间" name="axiosTimeOut">
          <t-input-number auto-width suffix="秒" :min="10" v-model="axiosTimeOutInSeconds" placeholder="请输入秒" />
        </t-form-item>
        <t-form-item label="资产生成并发数" name="assetsBatchGenereateSize">
          <t-input-number auto-width suffix="个" :min="1" v-model="otherSetting.assetsBatchGenereateSize" placeholder="请输入个数" />
        </t-form-item>
      </div>
    </t-form>
  </div>
</template>

<script setup lang="ts">
import settingStore from "@/stores/setting";
const { otherSetting } = storeToRefs(settingStore());

import { computed } from "vue";

// 将毫秒转换为秒显示，输入时转换回毫秒存储
const axiosTimeOutInSeconds = computed({
  get: () => {
    const ms = otherSetting.value.axiosTimeOut;
    if (ms == null || isNaN(ms)) return 600; // 默认600秒
    return Math.floor(ms / 1000);
  },
  set: (val: number | null | undefined) => {
    if (val == null || isNaN(val)) return;
    otherSetting.value.axiosTimeOut = val * 1000;
  },
});
</script>

<style lang="scss" scoped>
.otherConfig {
  width: 100%;
  padding: 4px 0;

  .intro {
    margin-bottom: 16px;

    p {
      margin: 0;
      color: var(--tf-text-secondary);
      font: var(--tf-font-caption);
    }
  }

  .configGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 16px;
  }
}

@media (max-width: 900px) {
  .otherConfig {
    .configGrid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
