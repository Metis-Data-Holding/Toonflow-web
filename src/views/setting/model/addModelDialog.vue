<template>
  <t-dialog v-model:visible="showConfigModal" :header="configModalTitle" :close-on-overlay-click="false" width="520px" :footer="false">
    <t-form :data="modelForm" label-align="left">
      <t-form-item label="模型名称">
        <template v-if="isOpenRouter">
          <div class="openrouter-model-field">
            <t-select
              v-model="modelForm.model"
              clearable
              filterable
              creatable
              :loading="openRouterLoading"
              :options="openRouterModelOptions"
              placeholder="请选择或输入 OpenRouter 模型 ID">
              <template #suffix>
                <t-tooltip content="刷新模型列表" placement="top">
                  <t-button
                    variant="text"
                    size="small"
                    class="openrouter-refresh-btn"
                    :loading="openRouterLoading"
                    @mousedown.stop.prevent
                    @click.stop.prevent="refreshOpenRouterModels(true)">
                    <template #icon>
                      <i-refresh theme="outline" size="14" />
                    </template>
                  </t-button>
                </t-tooltip>
              </template>
            </t-select>
            <span class="openrouter-status">{{ openRouterStatusText }}</span>
          </div>
        </template>
        <t-input v-else v-model="modelForm.model" placeholder="请输入模型标识" />
      </t-form-item>
      <t-form-item label="Base URL" v-if="showBaseUrlInput">
        <t-input v-model="modelForm.baseUrl" :placeholder="props.defaultPlaceHolder" :readonly="isOpenRouter" />
      </t-form-item>
      <t-form-item label="API Key">
        <t-input v-model="modelForm.apiKey" type="password" placeholder="请输入 API Key" @blur="handleApiKeyBlur" />
      </t-form-item>
      <t-form-item v-if="currentWebsite">
        <a :href="currentWebsite" target="_blank" rel="noopener noreferrer" style="font-size: 14px; color: #636464; font-weight: 900">
          点击获取 {{ manufacturerNames[modelForm.manufacturer] ?? modelForm.manufacturer }} API Key
        </a>
      </t-form-item>
      <t-form-item style="text-align: right; margin-bottom: 0">
        <t-space>
          <t-button variant="outline" @click="showConfigModal = false">取消</t-button>
          <t-button theme="primary" @click="keep">保存</t-button>
        </t-space>
      </t-form-item>
    </t-form>
  </t-dialog>
</template>

<script setup lang="ts">
import axios from "@/utils/axios";
import { MessagePlugin } from "tdesign-vue-next";
import { ref, computed, watch } from "vue";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

interface RowData {
  id: number;
  name: string;
  type: string;
  modelType: string;
  model: string;
  baseUrl: string;
  manufacturer: string;
  createTime: number;
  apiKey: string;
}

interface OpenRouterModelOption {
  label: string;
  value: string;
}

type OpenRouterModelApiType = "text" | "image";

const props = defineProps({
  currentWebsite: {
    type: String,
    default: "",
  },
  isCustomModel: {
    type: Boolean,
    default: false,
  },
  defaultPlaceHolder: {
    type: String,
    default: "",
  },
  manufacturerNames: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["fetchModelList"]);

const showConfigModal = defineModel<boolean>({
  default: false,
});

const modelForm = defineModel<RowData>("modelForm", {
  default: () => ({
    manufacturer: "",
    model: "",
    baseUrl: "",
    apiKey: "",
    id: 0,
    type: "",
    modelType: "",
  }),
});

function normalizeManufacturer(manufacturer: string): string {
  const input = (manufacturer || "").trim();
  if (input.toLowerCase() === "openrouter") return "openrouter";
  return input;
}

const isOpenRouter = computed(() => normalizeManufacturer(modelForm.value.manufacturer) === "openrouter");

const showBaseUrlInput = computed(() => normalizeManufacturer(modelForm.value.manufacturer) !== "runninghub");

const openRouterModelOptions = ref<OpenRouterModelOption[]>([]);
const openRouterLoading = ref(false);
const openRouterFetched = ref(false);

const openRouterStatusText = computed(() => {
  if (!isOpenRouter.value) return "";
  const modelTypeText = modelForm.value.type === "image" ? "图像模型" : "文本模型";
  if (openRouterLoading.value) return "正在拉取模型列表...";
  if (!modelForm.value.apiKey?.trim()) return `请输入 API Key 后自动拉取 ${modelTypeText}`;
  if (openRouterModelOptions.value.length) return `已拉取 ${openRouterModelOptions.value.length} 个${modelTypeText}`;
  if (openRouterFetched.value) return `未获取到${modelTypeText}，可手动输入模型 ID`;
  return "等待拉取模型列表";
});

watch(
  () => modelForm.value.manufacturer,
  () => {
    if (isOpenRouter.value) {
      modelForm.value.baseUrl = OPENROUTER_BASE_URL;
      return;
    }
    openRouterModelOptions.value = [];
    openRouterFetched.value = false;
  },
  { immediate: true },
);

function getOpenRouterApiType(): OpenRouterModelApiType {
  return modelForm.value.type === "image" ? "image" : "text";
}

function getOpenRouterModelsEndpoint() {
  return getOpenRouterApiType() === "image" ? "/setting/getOpenRouterImageModels" : "/setting/getOpenRouterModels";
}

async function refreshOpenRouterModels(showToast = false) {
  if (!isOpenRouter.value) return;
  const apiKey = modelForm.value.apiKey?.trim();
  if (!apiKey) {
    if (showToast) MessagePlugin.warning("请先填写 API Key");
    return;
  }

  openRouterLoading.value = true;
  try {
    const res = await axios.post(getOpenRouterModelsEndpoint(), {
      apiKey,
      baseURL: OPENROUTER_BASE_URL,
    });
    const list = Array.isArray(res?.data?.openrouter) ? res.data.openrouter : [];
    openRouterModelOptions.value = list;
    openRouterFetched.value = true;
    if (showToast) {
      const modelTypeText = getOpenRouterApiType() === "image" ? "图像模型" : "文本模型";
      MessagePlugin.success(`已拉取 ${list.length} 个${modelTypeText}`);
    }
  } catch (e: unknown) {
    openRouterModelOptions.value = [];
    openRouterFetched.value = true;
    if (showToast) {
      const modelTypeText = getOpenRouterApiType() === "image" ? "图像模型" : "文本模型";
      const message = e instanceof Error ? e.message : `拉取 OpenRouter ${modelTypeText}失败`;
      MessagePlugin.error(message);
    }
  } finally {
    openRouterLoading.value = false;
  }
}

function handleApiKeyBlur() {
  if (!isOpenRouter.value) return;
  refreshOpenRouterModels();
}

const configModalTitle = computed(() => {
  if (props.isCustomModel) {
    return "配置自定义模型";
  }
  return `配置 ${modelForm.value.model}`;
});

async function keep() {
  const { type, modelType, model, baseUrl, manufacturer, apiKey, id } = modelForm.value;
  const normalizedManufacturer = normalizeManufacturer(manufacturer);
  const normalizedBaseUrl = normalizedManufacturer === "openrouter" ? OPENROUTER_BASE_URL : baseUrl;

  // 验证必填项
  if (!model) {
    MessagePlugin.error("请输入模型标识");
    return;
  }
  if (!apiKey) {
    MessagePlugin.error("请输入 API Key");
    return;
  }
  if (normalizedManufacturer == "other" && normalizedBaseUrl.trim() == "") {
    MessagePlugin.error("请输入 Base URL");
    return;
  }
  if (id == 0) {
    try {
      await axios.post("/setting/addModel", {
        modelType: modelType || "",
        type,
        model,
        baseUrl: normalizedBaseUrl,
        manufacturer: normalizedManufacturer,
        apiKey,
      });
      MessagePlugin.success("新增成功");
      emit("fetchModelList");
    } catch (e) {
      MessagePlugin.error("新增失败");
    }
  } else {
    try {
      await axios.post("/setting/updateModel", {
        id,
        type,
        modelType: modelType || "",
        model,
        baseUrl: normalizedBaseUrl,
        manufacturer: normalizedManufacturer,
        apiKey,
      });
      MessagePlugin.success("编辑成功");
      emit("fetchModelList");
    } catch (e) {
      MessagePlugin.error("编辑失败");
    }
  }

  showConfigModal.value = false; //关闭弹窗
}
</script>

<style lang="scss" scoped>
.openrouter-model-field {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.openrouter-refresh-btn {
  min-width: 24px;
  height: 24px;
  padding: 0;
  color: var(--td-text-color-secondary, #8c8c8c);
  border-radius: 4px;
}

.openrouter-refresh-btn:hover {
  color: var(--td-text-color-primary, #595959);
  background: var(--td-bg-color-container-hover, #f5f5f5);
}

.openrouter-status {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.2;
}
</style>
