<template>
  <section class="skeleton tf-panel">
    <div class="titleBox">
      <span class="title">{{ props.title }}</span>
      <p v-if="props.description" class="description">{{ props.description }}</p>
    </div>
    <div class="box">
      <slot></slot>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  divider: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.skeleton {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(180px, 220px) minmax(0, 1fr);
  gap: 24px;
  align-items: start;

  .titleBox {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .title {
      font: var(--tf-font-section-title);
      color: var(--tf-text-primary);
    }

    .description {
      margin: 0;
      font: var(--tf-font-caption);
      color: var(--tf-text-secondary);
    }
  }

  .box {
    min-width: 0;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
