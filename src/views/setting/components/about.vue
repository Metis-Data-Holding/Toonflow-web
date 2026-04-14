<template>
  <div class="aboutPage">
    <div class="intro">
      <p>版本信息、开源仓库和更新入口统一收纳在这里，避免信息分散在多个页面。</p>
    </div>
    <t-card class="logoCard">
      <div class="logoSection">
        <img src="@/assets/logo.svg" alt="Metis Logo" class="logo" />
        <h2 class="appName">Metis</h2>
        <t-tag theme="primary" variant="outline">{{ version }}</t-tag>
      </div>
      <p class="desc">开源的 AI 驱动漫画/分镜创作工具</p>
    </t-card>

    <t-card class="linkCard">
      <div class="linkItem" @click="openLink('https://github.com/HBAI-Ltd/Toonflow-app')">
        <i-github theme="outline" size="20" />
        <span>GitHub 仓库</span>
        <i-right theme="outline" size="16" class="arrow" />
      </div>
      <t-divider />
      <div class="linkItem" @click="openLink('https://gitee.com/HBAI-Ltd/Toonflow-app')">
        <i-code theme="outline" size="20" />
        <span>Gitee 仓库</span>
        <i-right theme="outline" size="16" class="arrow" />
      </div>
    </t-card>

    <t-card class="linkCard">
      <div class="linkItem" @click="openLink('https://github.com/HBAI-Ltd/Toonflow-app/releases')">
        <i-refresh theme="outline" size="20" />
        <span>检查更新 (GitHub)</span>
        <i-right theme="outline" size="16" class="arrow" />
      </div>
      <t-divider />
      <div class="linkItem" @click="openLink('https://gitee.com/HBAI-Ltd/Toonflow-app/releases')">
        <i-refresh theme="outline" size="20" />
        <span>检查更新 (Gitee)</span>
        <i-right theme="outline" size="16" class="arrow" />
      </div>
    </t-card>

    <t-card class="licenseCard">
      <div class="licenseInfo">
        <i-certificate theme="outline" size="18" />
        <span>AGPL-3.0 License</span>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import store from "@/stores/index";
const { version } = storeToRefs(store());
function openLink(url: string) {
  window.open(url, "_blank");
}
</script>

<style lang="scss" scoped>
.aboutPage {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 560px;

  .intro {
    p {
      margin: 0;
      color: var(--tf-text-secondary);
      font: var(--tf-font-caption);
    }
  }
}

.logoCard {
  :deep(.t-card__body) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 28px 24px;
  }

  .logoSection {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .logo {
    width: 72px;
    height: 72px;
    border-radius: 16px;
    box-shadow: var(--tf-shadow-soft);
  }

  .appName {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }

  .desc {
    margin: 2px 0 0;
    font-size: 14px;
    color: var(--tf-text-secondary);
    text-align: center;
  }
}

.linkCard {
  :deep(.t-card__body) {
    padding: 0;
  }

  :deep(.t-divider) {
    margin: 0;
  }

  .linkItem {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    cursor: pointer;
    transition:
      background-color 0.18s ease,
      color 0.18s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.03);
    }

    span {
      flex: 1;
      font-size: 14px;
    }

    .arrow {
      color: var(--tf-text-tertiary);
    }
  }
}

.licenseCard {
  :deep(.t-card__body) {
    padding: 16px;
  }

  .licenseInfo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    color: var(--tf-text-secondary);
  }
}
</style>
