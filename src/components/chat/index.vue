<template>
  <div class="chat-container">
    <el-scrollbar class="message-area" ref="boxRef" @scroll="handleScroll">
      <div ref="innerRef" class="message-list">
        <TransitionGroup name="message">
          <div v-for="(item, index) in message" :key="index" class="message-item">
            <chatMessage :sendApi="sendApi" :msg="item" />
          </div>
        </TransitionGroup>
      </div>
    </el-scrollbar>

    <div class="input-container">
      <div class="input-wrapper" ref="msgInput">
        <a-mentions
          v-if="props.options && props.options.length"
          v-model:value="inputMsg"
          @focus="enableEnterSend"
          @blur="disableEnterSend"
          class="message-input"
          placeholder="输入 @ 选择图片进行编辑，单次限一张"
          autofocus
          :options="props.options" />
        <textarea
          v-else
          spellcheck="false"
          class="message-input"
          v-model="inputMsg"
          placeholder="输入消息..."
          @focus="enableEnterSend"
          @blur="disableEnterSend" />
      </div>

      <div class="action-bar">
        <div class="action-left">
          <a-popconfirm
            v-if="props.showClearBtn"
            title="确定清空所有对话记录？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="cleanHistory"
            placement="topLeft">
            <a-tooltip title="清空对话">
              <button class="action-btn danger">
                <i-clear-format theme="outline" size="20" />
              </button>
            </a-tooltip>
          </a-popconfirm>
        </div>
        <a-tooltip :title="props.canSend ? '发送消息' : '请等待响应完成'">
          <button class="send-btn" :class="{ disabled: !props.canSend }" :disabled="!props.canSend" @click="throttleSendMsg">
            <i-arrow-circle-up theme="outline" size="24" fill="#fff" />
          </button>
        </a-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ScrollbarInstance } from "element-plus";
import throttle from "@/utils/throttle";
import chatMessage from "./chatMessage.vue";
import { MessagePlugin } from "tdesign-vue-next";
import "./type.d.ts";
const msgInput = ref<HTMLTextAreaElement | null>(null);
const message = defineModel<ChatMessage[]>({ default: [] });

const props = withDefaults(
  defineProps<{
    sendApi: (msg: string) => Promise<void>;
    options?: { label: string; value: string }[];
    showClearBtn?: boolean;
    canSend?: boolean;
    enterToSend?: boolean;
    autoScroll?: boolean;
  }>(),
  {
    options: () => [],
    showClearBtn: false,
    canSend: true,
    enterToSend: true,
    autoScroll: false,
  },
);

const emit = defineEmits(["clean"]);
const inputMsg = ref<string>("");
const innerRef = ref<HTMLElement | null>(null);
const boxRef = ref<ScrollbarInstance | null>(null);

let isUserAtBottom = true;
const SCROLL_THRESHOLD = 100;

function handleEnter(event: KeyboardEvent) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    if (!props.canSend) {
      MessagePlugin.warning("请等待消息响应完成");
      return;
    }
    throttleSendMsg();
  }
}

function enableEnterSend() {
  if (msgInput.value && props.enterToSend) {
    msgInput.value.removeEventListener("keydown", handleEnter);
    msgInput.value.addEventListener("keydown", handleEnter);
  }
}

function disableEnterSend() {
  msgInput.value?.removeEventListener("keydown", handleEnter);
}

onUnmounted(disableEnterSend);

function handleScroll({ scrollTop }: { scrollTop: number }) {
  if (!boxRef.value || !innerRef.value) return;
  const wrapRef = boxRef.value.wrapRef;
  if (!wrapRef) return;

  const scrollHeight = innerRef.value.scrollHeight;
  const clientHeight = wrapRef.clientHeight;
  isUserAtBottom = scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
}

watch(
  () => innerRef.value?.clientHeight,
  () => {
    if (props.autoScroll && isUserAtBottom) scrollBottom();
  },
);

function scrollBottom() {
  nextTick(() => {
    if (boxRef.value && innerRef.value) {
      boxRef.value.setScrollTop(innerRef.value.scrollHeight);
      isUserAtBottom = true;
    }
  });
}

function smartScrollBottom() {
  if (props.autoScroll && isUserAtBottom) {
    nextTick(() => {
      boxRef.value?.setScrollTop(innerRef.value?.scrollHeight ?? 0);
    });
  }
}

const throttleSendMsg = throttle(sendMsg, 1000);

async function sendMsg() {
  if (!inputMsg.value.trim()) {
    MessagePlugin.warning("请输入内容");
    return;
  }
  const msg = inputMsg.value;
  inputMsg.value = "";
  await props.sendApi(msg);
  scrollBottom();
}

function cleanHistory() {
  emit("clean");
}

defineExpose({ scrollBottom, smartScrollBottom });
</script>

<style lang="scss" scoped>
.chat-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
  min-height: 0;
}

.message-area {
  flex: 1;
  min-height: 0;
  border-radius: 16px;
  border: 1px solid var(--tf-border-strong);
  background: var(--tf-surface-panel);
  box-shadow: var(--tf-shadow-soft);

  :deep(.el-scrollbar__wrap) {
    padding: 18px;
  }
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  animation: fadeIn 0.24s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from,
.message-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.input-container {
  background: var(--tf-surface-raised);
  border-radius: 16px;
  box-shadow: var(--tf-shadow-soft);
  border: 1px solid var(--tf-border-strong);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
  overflow: hidden;

  &:focus-within {
    border-color: rgba(124, 132, 255, 0.42);
    box-shadow: 0 0 0 3px rgba(124, 132, 255, 0.14);
  }
}

.input-wrapper {
  padding: 14px 16px 10px;

  .message-input {
    width: 100%;
    min-height: 56px;
    max-height: 120px;
    border: none;
    outline: none;
    resize: none;
    font-size: 15px;
    line-height: 1.6;
    color: var(--tf-text-primary);
    background: transparent;
    font-family: inherit;

    &::placeholder {
      color: var(--tf-text-tertiary);
    }

    // 覆盖 ant-design mentions 样式
    :deep(.ant-mentions) {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;

      &:hover,
      &:focus {
        border: none !important;
        box-shadow: none !important;
      }
    }

    :deep(.ant-mentions textarea) {
      color: var(--tf-text-primary) !important;
      background: transparent !important;
    }
  }
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px 12px;
}

.action-left {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--tf-border-strong);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--tf-text-secondary);
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.07);
    color: var(--tf-text-primary);
  }

  &.danger:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.24);
    color: var(--tf-danger);
  }
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: var(--tf-accent);
  color: #fff;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
  box-shadow: 0 10px 24px rgba(124, 132, 255, 0.18);

  &:hover:not(.disabled) {
    background: var(--tf-accent-hover);
    transform: translateY(-1px);
    box-shadow: 0 14px 28px rgba(124, 132, 255, 0.22);
  }

  &:active:not(.disabled) {
    transform: translateY(0);
  }

  &.disabled {
    background: rgba(255, 255, 255, 0.08);
    color: var(--tf-text-tertiary);
    cursor: not-allowed;
    box-shadow: none;
  }
}
</style>
