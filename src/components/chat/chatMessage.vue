<template>
  <!-- 通知消息 -->
  <div v-if="msg.identity === 'notice'" class="notice-message">
    <span class="notice-text">{{ msg.data }}</span>
  </div>

  <!-- 对话消息 -->
  <div v-else class="message-wrapper" :class="[msg.identity === 'user' ? 'user' : 'assistant']">
    <!-- 消息内容 -->
    <div class="message-content-wrapper">
      <template v-if="msg.identity === 'assistant' && parsedData">
        <div v-for="item in parsedData" :key="item.index">
          <McBubble v-if="item.type === 'text'" :avatarConfig="{ imgSrc: logo, displayName: msg.role }" :avatarPosition="'top'" :variant="'bordered'">
            <McMarkdownCard :enableThink="true" :content="item.content" :theme="theme"></McMarkdownCard>
          </McBubble>
          <McBubble
            v-if="item.type === 'thinking'"
            :loading="true"
            :avatarConfig="{ imgSrc: logo, displayName: msg.role }"
            :avatarPosition="'top'"></McBubble>
        </div>
      </template>
      <template v-else>
        <div v-for="(item, index) in msg.data" :key="index">
          <McBubble v-if="item.type === 'text'" :align="'right'" :variant="'bordered'">
            <McMarkdownCard :enableThink="true" :content="item.text" :theme="theme"></McMarkdownCard>
          </McBubble>
          <McBubble v-if="item.type === 'image_url'" :content="item.image_url" :align="'right'"></McBubble>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import logo from "@/assets/logo.svg";
import { computed, reactive } from "vue";
const theme = ref("dark");

const props = defineProps<{
  msg: ChatMessage;
  sendApi: (msg: string) => void;
}>();

// 思考块折叠状态
const thinkingCollapsed = reactive<Record<number, boolean>>({});

// 解析文本中的 <think>...</think> 标签
function parseThinkingContent(text: string): { thinking: string | null; content: string } {
  const thinkRegex = /<think>([\s\S]*?)<\/think>/;
  const match = text.match(thinkRegex);

  if (match) {
    const thinking = match[1].trim();
    const content = text.replace(thinkRegex, "").trim();
    return { thinking, content };
  }

  return { thinking: null, content: text };
}

// 解析后的消息项类型
interface ParsedMessageItem {
  type: string;
  index: number;
  thinking?: string | null;
  content?: string;
  text?: string;
  image_url?: { url: string };
  button?: {
    text: string;
    type?: "primary" | "ghost" | "dashed" | "link" | "text" | "default";
    fn?: () => void | Promise<void>;
  }[];
  confirm?: boolean;
}

// 处理后的消息数据
const parsedData = computed<ParsedMessageItem[] | null>(() => {
  if (props.msg.identity !== "assistant") return null;

  return props.msg.data.map((item, index): ParsedMessageItem => {
    if (item.type === "text") {
      const { thinking, content } = parseThinkingContent(item.text);
      return {
        type: item.type,
        text: item.text,
        thinking,
        content,
        index,
      };
    }
    return { ...item, index } as ParsedMessageItem;
  });
});

// 切换思考块折叠状态
function toggleThinking(index: number) {
  thinkingCollapsed[index] = !thinkingCollapsed[index];
}

// 获取折叠状态（默认折叠）
function isCollapsed(index: number): boolean {
  return thinkingCollapsed[index] !== false;
}

function handleClick(
  sub: {
    text: string;
    type?: "primary" | "ghost" | "dashed" | "link" | "text" | "default";
    fn?: () => void | Promise<void>;
  },
  item: AssistantMessageTextWithConfirm,
) {
  if (sub.fn) {
    sub.fn();
  } else {
    props.sendApi(sub.text);
  }
  item.confirm = true;
}
</script>

<style lang="scss" scoped>
.notice-message {
  display: flex;
  justify-content: center;
  padding: 8px 0;

  .notice-text {
    padding: 6px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--tf-border-subtle);
    border-radius: 999px;
    font-size: 12px;
    color: var(--tf-text-secondary);
  }
}

.message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: min(92%, 860px);

  &.user {
    flex-direction: row-reverse;
    margin-left: auto;
  }

  &.assistant {
    margin-right: auto;
  }
}

.avatar {
  flex-shrink: 0;

  .ai-avatar {
    background: var(--tf-accent);

    .avatar-text {
      font-size: 14px;
      font-weight: 600;
    }
  }

  .user-avatar {
    background: var(--tf-surface-float);
  }
}

.message-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.message-bubble {
  position: relative;
  padding: 12px 16px;
  border-radius: 14px;
  word-break: break-word;
  line-height: 1.6;
  font-size: 14px;

  &.assistant-bubble {
    background: var(--tf-surface-raised);
    color: var(--tf-text-primary);
    border: 1px solid var(--tf-border-strong);
    border-bottom-left-radius: 8px;
    box-shadow: var(--tf-shadow-soft);
  }

  &.user-bubble {
    background: rgba(124, 132, 255, 0.16);
    color: #fff;
    border: 1px solid rgba(124, 132, 255, 0.32);
    border-bottom-right-radius: 8px;
    box-shadow: none;
  }
}

.text-content {
  display: block;
  white-space: pre-wrap;
}

.image-content {
  max-width: 280px;
  border-radius: 12px;
  overflow: hidden;
}

.confirm-content {
  .confirm-text {
    margin: 0 0 12px;
  }

  .confirm-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;

    .confirm-btn {
      border-radius: 8px;
    }
  }

  .confirm-result {
    display: flex;
    align-items: center;
    gap: 6px;
    justify-content: flex-end;

    .result-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;

      &.success {
        background: rgba(34, 197, 94, 0.12);
        color: var(--tf-success);
      }

      &.error {
        background: rgba(239, 68, 68, 0.12);
        color: var(--tf-danger);
      }
    }

    .result-text {
      font-size: 12px;
      color: var(--tf-text-secondary);
    }
  }
}

.thinking-content {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;

  .thinking-dot {
    width: 8px;
    height: 8px;
    background: var(--tf-accent);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

// 折叠动画
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 400px;
}

// 思考过程折叠块样式
.thinking-block {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--tf-border-subtle);
  border-radius: 12px;
  overflow: hidden;

  .thinking-block-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    cursor: pointer;
    transition: background-color 0.18s ease;

    &:hover {
      background: rgba(124, 132, 255, 0.08);
    }

    .thinking-icon {
      font-size: 16px;
    }

    .thinking-title {
      flex: 1;
      font-size: 13px;
      font-weight: 500;
      color: var(--tf-text-primary);
    }

    .thinking-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      color: var(--tf-text-secondary);
      transition: transform 0.3s ease;

      &.collapsed {
        transform: rotate(-90deg);
      }
    }
  }

  .thinking-block-content {
    border-top: 1px solid var(--tf-border-subtle);
    background: rgba(255, 255, 255, 0.02);

    .thinking-text {
      padding: 12px 14px;
      font-size: 13px;
      line-height: 1.8;
      color: var(--tf-text-secondary);
      white-space: pre-wrap;
      max-height: 300px;
      overflow-y: auto;

      // 自定义滚动条
      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.18);
        border-radius: 2px;
      }
    }
  }
}

:deep(.mc-bubble) {
  gap: 8px;
}

:deep(.mc-bubble .mc-bubble-avatar-name) {
  color: var(--tf-text-secondary);
}

:deep(.mc-bubble .mc-bubble-content.bordered) {
  background: var(--tf-surface-raised);
  border-color: var(--tf-border-strong);
  border-radius: 14px;
  box-shadow: var(--tf-shadow-soft);
}

:deep(.mc-bubble.mc-bubble-right .mc-bubble-content.bordered) {
  background: rgba(124, 132, 255, 0.14);
  border-color: rgba(124, 132, 255, 0.28);
  box-shadow: none;
}

:deep(.mc-bubble .mc-bubble-avatar-style) {
  border-radius: 12px;
}

:deep(.mc-markdown-render.mc-markdown-render-dark) {
  color: var(--tf-text-primary);
}

:deep(.mc-markdown-render.mc-markdown-render-dark blockquote) {
  color: var(--tf-text-secondary);
  border-left-color: var(--tf-border-strong);
}

:deep(.mc-markdown-render.mc-markdown-render-dark td),
:deep(.mc-markdown-render.mc-markdown-render-dark th) {
  border-color: var(--tf-border-subtle);
  background: rgba(255, 255, 255, 0.03);
}

:deep(.mc-markdown-render.mc-markdown-render-dark th) {
  background: rgba(255, 255, 255, 0.05);
}

:deep(.mc-code-block-dark) {
  border-color: var(--tf-border-strong);
  background: #171b23;
}
:deep(.hljs) {
  text-wrap: wrap;
}
</style>
