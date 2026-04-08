<template>
  <div class="storyboard-video">
    <!-- 头部 -->
    <div class="header">
      <div class="title">
        <div class="icon-wrapper">
          <i-pic :size="20" class="icon" />
        </div>
        <span>视频配置</span>
        <span v-if="currentConfigs.length" class="count">{{ currentConfigs.length }}</span>
      </div>
      <button v-if="canGenerate" :disabled="!disableBtn" class="generate-btn" @click="modalShow = true">
        <i-video-two :size="18" />
        <span>添加配置</span>
      </button>
    </div>

    <!-- 内容区 -->
    <div class="content">
      <template v-if="currentConfigs.length">
        <div class="video-grid">
          <div v-for="(config, index) in currentConfigs" :key="config.id" class="video-card" @click="openDetail(config)">
            <!-- 视频编号 -->
            <div class="video-index">#{{ index + 1 }}</div>

            <!-- 封面区域 -->
            <div class="cover-wrapper">
              <!-- 有生成中的结果 - 优先显示 -->
              <template v-if="hasGeneratingResult(config.id)">
                <div class="status-wrapper generating">
                  <div class="loading-spinner"></div>
                  <span class="status-text">正在生成中...</span>
                  <span class="status-hint">{{ getResultCount(config.id) }}个结果</span>
                </div>
              </template>

              <!-- 已选择结果且成功 -->
              <template v-else-if="getSelectedResult(config.id)?.state === 1">
                <img
                  v-if="getSelectedResult(config.id)?.firstFrame"
                  :src="getSelectedResult(config.id)?.firstFrame"
                  class="cover-image"
                  alt="视频封面" />
                <video
                  v-else-if="getSelectedResult(config.id)?.filePath"
                  :src="getSelectedResult(config.id)?.filePath"
                  class="cover-image"
                  preload="metadata"></video>
                <div v-else class="video-placeholder">
                  <i-film :size="32" />
                  <span>视频</span>
                </div>
                <!-- <img :src="getSelectedResult(config.id)?.firstFrame || getSelectedResult(config.id)?.filePath" class="cover-image" alt="视频封面" /> -->
                <div class="play-overlay">
                  <div class="play-button">
                    <i-play-one theme="filled" :size="32" fill="#fff" />
                  </div>
                </div>
                <div v-if="getSelectedResult(config.id)?.duration" class="duration-badge">
                  {{ formatDuration(getSelectedResult(config.id)!.duration) }}
                </div>
              </template>

              <!-- 未生成/待生成 -->
              <template v-else>
                <div class="status-wrapper pending">
                  <div class="pending-icon">
                    <i-setting-config :size="32" />
                  </div>
                  <span class="status-text">待生成</span>
                  <span class="status-hint">点击进入生成</span>
                </div>
              </template>
            </div>

            <!-- 信息区域 -->
            <div class="info-wrapper">
              <div class="config-info">
                <span class="manufacturer-tag">{{ getManufacturerLabel(config.manufacturer) }}</span>
                <span class="resolution-tag" v-if="config.resolution">{{ config.resolution }}</span>
                <span class="duration-tag">{{ config.duration }}s</span>
              </div>
              <p class="prompt-text">{{ config.prompt || "暂无描述" }}</p>
            </div>

            <!-- 删除按钮 -->
            <button class="delete-btn" @click.stop="handleDeleteConfig(config.id)">
              <i-delete :size="16" />
            </button>
          </div>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <i-video-two :size="48" />
        </div>
        <p class="empty-title">暂无视频配置</p>
        <p class="empty-desc">点击上方按钮添加视频配置</p>
      </div>
    </div>

    <!-- 添加配置弹窗 -->
    <newVideo v-if="modalShow && scriptId" v-model="modalShow" :scriptId="scriptId" />

    <!-- 视频详情弹窗 -->
    <videoDetail v-model="detailModalShow" :configId="currentConfigId" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Modal, message } from "ant-design-vue";
import newVideo from "./generateVideo/newVideo.vue";
import videoDetail from "./generateVideo/videoDetail.vue";
import videoStore, { type VideoConfig, type VideoResult } from "@/stores/video";
import { storeToRefs } from "pinia";

const props = defineProps<{
  scriptId: number | null;
  disableBtn: boolean;
  canGenerate: boolean;
}>();

const store = videoStore();
const { currentConfigs } = storeToRefs(store);

const modalShow = ref(false);
const detailModalShow = ref(false);
const currentConfigId = ref<number | null>(null);

// 厂商标签映射
const manufacturerLabels: Record<string, string> = {
  volcengine: "豆包",
  runninghub: "Sora",
  openAi: "OpenAI",
};

function getManufacturerLabel(manufacturer: string): string {
  return manufacturerLabels[manufacturer] || manufacturer;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// 获取配置的选中结果
function getSelectedResult(configId: number): VideoResult | null {
  return store.getSelectedResult(configId);
}

// 检查是否有生成中的结果
function hasGeneratingResult(configId: number): boolean {
  const results = store.getResultsByConfigId(configId);
  return results.some((r) => r.state === 0);
}

// 获取结果数量
function getResultCount(configId: number): number {
  return store.getResultsByConfigId(configId).length;
}

// 打开详情弹窗
function openDetail(config: VideoConfig) {
  currentConfigId.value = config.id;
  detailModalShow.value = true;
}

// 删除配置
function handleDeleteConfig(configId: number) {
  Modal.confirm({
    title: "确认删除",
    content: "删除配置后，关联的所有生成结果也会被删除，确定要删除吗？",
    okText: "确定",
    cancelText: "取消",
    onOk() {
      store.removeConfig(configId);
      message.success("删除成功");
    },
  });
}
</script>

<style lang="scss" scoped>
.storyboard-video {
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: var(--tf-surface-panel);
    border-radius: 16px;
    border: 1px solid var(--tf-border-strong);
    box-shadow: var(--tf-shadow-soft);

    .title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      font-size: 16px;
      color: var(--tf-text-primary);

      .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: rgba(124, 132, 255, 0.14);
        border: 1px solid rgba(124, 132, 255, 0.2);
        border-radius: 12px;

        .icon {
          color: var(--tf-accent);
        }
      }

      .count {
        padding: 2px 10px;
        background: rgba(255, 255, 255, 0.04);
        color: var(--tf-text-secondary);
        border: 1px solid var(--tf-border-subtle);
        border-radius: 999px;
        font-size: 13px;
        font-weight: 500;
      }
    }

    .generate-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: var(--tf-accent);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition:
        transform 0.18s ease,
        background-color 0.18s ease,
        box-shadow 0.18s ease;
      box-shadow: 0 10px 24px rgba(124, 132, 255, 0.18);

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        background: var(--tf-accent-hover);
        box-shadow: 0 14px 28px rgba(124, 132, 255, 0.22);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        background: rgba(255, 255, 255, 0.08);
        color: var(--tf-text-tertiary);
        box-shadow: none;
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
  }

  .content {
    margin-top: 24px;

    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .video-card {
      position: relative;
      background: var(--tf-surface-panel);
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      transition:
        transform 0.18s ease,
        box-shadow 0.18s ease,
        border-color 0.18s ease;
      border: 1px solid var(--tf-border-strong);
      box-shadow: var(--tf-shadow-soft);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 18px 32px rgba(0, 0, 0, 0.28);
        border-color: rgba(124, 132, 255, 0.22);

        .play-overlay {
          opacity: 1;
          z-index: 9999999999;
        }

        .cover-image {
          transform: scale(1.05);
        }

        .delete-btn {
          opacity: 1;
          z-index: 999999999999;
        }
      }

      .video-index {
        position: absolute;
        top: 10px;
        left: 10px;
        min-width: 24px;
        height: 24px;
        padding: 0 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(124, 132, 255, 0.9);
        border-radius: 8px;
        color: #fff;
        font-size: 12px;
        font-weight: 600;
        z-index: 10;
      }

      .delete-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(239, 68, 68, 0.92);
        border: none;
        border-radius: 10px;
        color: #fff;
        cursor: pointer;
        opacity: 0;
        transition: all 0.2s ease;
        z-index: 10;

        &:hover {
          background: var(--tf-danger);
          transform: translateY(-1px);
        }
      }

      .cover-wrapper {
        position: relative;
        width: 100%;
        height: 180px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.03);

        .cover-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .video-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 8px;
          color: var(--tf-text-tertiary);

          span {
            font-size: 14px;
          }
        }

        .play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(11, 13, 16, 0.48);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;

          .play-button {
            width: 60px;
            height: 60px;
            background: rgba(124, 132, 255, 0.94);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
            transition: transform 0.2s ease;

            &:hover {
              transform: scale(1.1);
              background: var(--tf-accent-hover);
            }
          }
        }

        .duration-badge {
          position: absolute;
          bottom: 10px;
          right: 10px;
          padding: 4px 10px;
          background: rgba(11, 13, 16, 0.78);
          color: var(--tf-text-primary);
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          backdrop-filter: blur(4px);
        }

        .status-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;

          &.success {
            background: var(--td-success-color);
            color: var(--td-text-color-anti);
          }
        }

        .status-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 12px;

          &.generating {
            .loading-spinner {
              width: 40px;
              height: 40px;
              border: 3px solid rgba(255, 255, 255, 0.12);
              border-top-color: var(--tf-accent);
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }

            .status-text {
              color: var(--tf-text-secondary);
              font-size: 14px;
              font-weight: 500;
            }

            .status-hint {
              color: var(--tf-text-tertiary);
              font-size: 12px;
            }
          }

          &.pending {
            .pending-icon {
              width: 50px;
              height: 50px;
              background: rgba(255, 255, 255, 0.04);
              border: 1px solid var(--tf-border-subtle);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--tf-accent);
            }

            .status-text {
              color: var(--tf-text-secondary);
              font-size: 14px;
              font-weight: 500;
            }

            .status-hint {
              color: var(--tf-text-tertiary);
              font-size: 12px;
            }
          }
        }
      }

      .info-wrapper {
        padding: 16px;

        .config-info {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
          flex-wrap: wrap;

          .manufacturer-tag,
          .resolution-tag,
          .duration-tag {
            padding: 2px 8px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 500;
          }

          .manufacturer-tag {
            background: rgba(124, 132, 255, 0.12);
            color: var(--tf-accent);
            border: 1px solid rgba(124, 132, 255, 0.18);
          }

          .resolution-tag {
            background: rgba(255, 255, 255, 0.04);
            color: var(--tf-text-secondary);
            border: 1px solid var(--tf-border-subtle);
          }

          .duration-tag {
            background: rgba(34, 197, 94, 0.1);
            color: var(--tf-success);
            border: 1px solid rgba(34, 197, 94, 0.18);
          }
        }

        .prompt-text {
          margin: 0;
          font-size: 14px;
          color: var(--tf-text-secondary);
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      background: var(--tf-surface-panel);
      border-radius: 16px;
      border: 1px dashed var(--tf-border-strong);
      box-shadow: var(--tf-shadow-soft);

      .empty-icon {
        width: 80px;
        height: 80px;
        background: rgba(124, 132, 255, 0.08);
        border: 1px solid rgba(124, 132, 255, 0.16);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--tf-accent);
        margin-bottom: 20px;
      }

      .empty-title {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 600;
        color: var(--tf-text-primary);
      }

      .empty-desc {
        margin: 0;
        font-size: 14px;
        color: var(--tf-text-secondary);
      }
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
