<template>
  <t-layout class="main">
    <t-aside class="shellAside" :width="collapsed ? '72px' : '248px'">
      <t-menu class="shellMenu" theme="dark" :value="activeMenu" :collapsed="collapsed" @change="handleClick">
        <template #logo>
          <h1 class="sidebarTitle">
            <img class="logo" src="@/assets/logo.svg" />
            <span v-show="!collapsed">Toonflow</span>
          </h1>
        </template>
        <t-menu-item v-for="item in menuList" :key="item.path" :value="item.path">
          <template #icon><component :is="item.icon" :size="18" /></template>
          {{ item.label }}
        </t-menu-item>
        <template #operations>
          <div class="menuOps fc">
            <t-button variant="text" shape="square" @click="collapsed = !collapsed" :style="btnStyle">
              <template #icon><component :is="collapsIcon" :size="18" /></template>
              <span v-if="!collapsed">收起</span>
            </t-button>
            <t-button variant="text" shape="square" @click="() => handleClick('/setting')" :style="btnStyle">
              <template #icon><i-setting-two :size="18" /></template>
              <span v-if="!collapsed">设置</span>
            </t-button>
          </div>
        </template>
      </t-menu>
    </t-aside>
    <t-layout>
      <t-content class="content">
        <router-view />
      </t-content>
    </t-layout>
  </t-layout>
</template>

<script setup lang="ts">
const menuList = [
  { path: "/project", label: "我的项目", icon: "i-folder-open" },
  // { path: "/taskList", label: "任务中心", icon: "list-numbered" },
];

const collapsIcon = computed(() => (collapsed.value ? "i-right" : "i-left"));

const router = useRouter();
const route = useRoute();
const activeMenu = ref(route.path);
const collapsed = ref(true);

function handleClick(value: string | number) {
  const path = String(value);
  router.push(path);
  activeMenu.value = path;
}

const btnStyle = computed(() => ({
  display: !collapsed.value ? "block" : "inline-flex",
}));
</script>

<style lang="scss" scoped>
.main {
  height: 100vh;
  width: 100%;
  background: var(--tf-bg-canvas);

  > :deep(.t-layout) {
    min-width: 0;
  }

  .shellAside {
    border-right: 1px solid var(--tf-border-subtle);
    background: var(--tf-bg-panel);
    flex-shrink: 0;
  }

  .sidebarTitle {
    height: 100%;
    margin: 0;
    font: var(--tf-font-section-title);
    display: flex;
    align-items: center;
    color: var(--tf-text-primary);

    .logo {
      width: 32px;
      height: 32px;
      margin-right: 10px;
      border-radius: 10px;
    }
  }

  .shellMenu {
    height: 100%;
    border-inline-end: none;
    background: var(--tf-bg-panel);
  }

  .menuOps {
    gap: var(--tf-space-2);

    .t-button {
      width: 100%;
      text-align: left;
    }
  }

  .content {
    width: 100%;
    min-width: 0;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 0;
    margin: 0;
    background: var(--tf-bg-canvas);
  }

  :deep(.t-default-menu) {
    background: transparent;
    color: var(--tf-text-secondary);
  }

  :deep(.t-default-menu__inner) {
    background: transparent;
  }

  :deep(.t-menu__logo) {
    height: 72px;
    padding: 0 18px;
    border-bottom: 1px solid var(--tf-border-subtle);
  }

  :deep(.t-menu__operations) {
    padding: 12px;
    border-top: 1px solid var(--tf-border-subtle);
  }

  :deep(.t-default-menu .t-menu__item) {
    height: 42px;
    margin: 4px 12px;
    border-radius: var(--tf-radius-md);
    color: var(--tf-text-secondary);
  }

  :deep(.t-default-menu .t-menu__item .i-icon),
  :deep(.t-default-menu .t-menu__operations .t-button .i-icon) {
    color: currentColor;
    opacity: 0.88;
  }

  :deep(.t-default-menu .t-menu__item:hover) {
    background: var(--tf-bg-panel-2);
    color: var(--tf-text-primary);
  }

  :deep(.t-default-menu .t-is-active:not(.t-is-opened)) {
    background: var(--tf-accent-soft);
    color: var(--tf-text-primary);
  }

  :deep(.t-default-menu .t-menu__operations .t-button) {
    justify-content: flex-start;
    color: var(--tf-text-secondary);
  }

  :deep(.t-default-menu .t-menu__operations .t-button:hover) {
    background: var(--tf-bg-panel-2);
    color: var(--tf-text-primary);
  }
}
</style>
