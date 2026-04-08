<template>
  <t-dialog v-model:visible="modelShow" :header="props.state" width="70vw" top="1vh" class="model-select-dialog">
    <div class="addModelContainer">
      <div class="model-cards-container">
        <t-tabs v-model="activeTab" class="model-tabs" @change="getData">
          <t-tab-panel v-for="tab in useTabList" :key="tab.key" :value="tab.key" :label="tab.tab">
            <div class="filter-section">
              <div class="search-wrapper">
                <t-input placeholder="搜索模型名称或描述..." v-model="searchKeyword" clearable size="large" class="search-input" @change="getData">
                  <template #suffix-icon>
                    <SearchOutlined />
                  </template>
                </t-input>
              </div>
              <div class="manufacturer-filter">
                <div class="filter-header">
                  <span class="filter-label">
                    <FilterOutlined />
                    厂商筛选
                  </span>
                  <a-button v-if="selectedManufacturers.length > 0" type="link" size="small" @click="clearFilters">清空筛选</a-button>
                </div>
                <div class="manufacturer-tags">
                  <a-checkable-tag
                    v-for="manufacturer in availableManufacturers"
                    :key="manufacturer.key"
                    :checked="selectedManufacturers.includes(manufacturer.key)"
                    @change="toggleManufacturer(manufacturer.key)"
                    class="manufacturer-tag">
                    <span class="manufacturer-dot"></span>
                    {{ manufacturer.name }}
                  </a-checkable-tag>
                </div>
              </div>

              <div class="filter-result" v-if="searchKeyword || selectedManufacturers.length > 0">
                <span class="result-text">
                  找到
                  <strong>{{ getFilteredModels(tab.key).length }}</strong>
                  个模型
                </span>
              </div>
            </div>

            <a-divider class="dialog-divider" />
            <div class="cards-grid">
              <a-empty v-if="getFilteredModels(tab.key).length === 0" description="未找到匹配的模型" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
              <template v-else>
                <div
                  v-for="model in getFilteredModels(tab.key)"
                  :key="`${model.manufacturer}-${model.modelType}-${model.model}`"
                  class="model-card"
                  @click="selectModel(model)">
                  <div class="card-icon">
                    <component :is="tab.icon" fill="currentColor" />
                  </div>
                  <div class="card-header">
                    <h3 :title="model.modelName">{{ model.modelName }}</h3>
                    <a-tag>{{ model.manufacturerName }}</a-tag>
                  </div>
                </div>
                <!-- 自定义卡片 -->
                <div class="model-card custom-card" @click="selectCustomModel(tab.customType)">
                  <div class="card-icon">
                    <PlusOutlined />
                  </div>
                  <div class="card-header">
                    <h3>自定义模型</h3>
                  </div>
                  <div class="card-body">
                    <p class="model-description">{{ tab.customDesc }}</p>
                  </div>
                </div>
              </template>
            </div>
          </t-tab-panel>
        </t-tabs>
      </div>
    </div>
    <addModelDialog
      v-model="showConfigModal"
      v-if="showConfigModal"
      v-model:modelForm="modelForm"
      :currentWebsite="currentWebsite"
      :isCustomModel="isCustomModel"
      :defaultPlaceHolder="getDefaultBaseUrlPlaceholder"
      :manufacturerNames="manufacturerNames"
      @fetchModelList="sure" />
  </t-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { message, Empty } from "ant-design-vue";
import { SearchOutlined, FilterOutlined, PlusOutlined } from "@ant-design/icons-vue";
import addModelDialog from "./addModelDialog.vue";
import axios from "@/utils/axios";

const props = defineProps({
  state: {
    type: String,
  },
  typeList: {
    type: Array,
    default: () => [],
  },
});
// 当前激活的标签页
const activeTab = ref<string>("text");
// 是否显示配置弹窗
const showConfigModal = ref<boolean>(false);
// 是否是自定义模型
const isCustomModel = ref<boolean>(false);
// 搜索关键词
const searchKeyword = ref<string>("");
// 选中的厂商列表
const selectedManufacturers = ref<string[]>([]);
// tab 列表配置,用于统一渲染三个类型的页签
const tabList = [
  { key: "text", tab: "文本", icon: "i-text", customDesc: "使用自定义文本模型", customType: "text" },
  { key: "image", tab: "图像", icon: "i-picture", customDesc: "使用自定义图像模型", customType: "image" },
  { key: "video", tab: "视频", icon: "i-video", customDesc: "使用自定义视频模型", customType: "video" },
];
const useTabList = computed(() => {
  if (!props.typeList.length) {
    return tabList;
  }
  return tabList.filter((tab) => props.typeList.includes(tab.key));
});
const websites = ref<Record<string, string>>({
  deepSeek: "https://platform.deepseek.com",
  volcengine: "https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey",
  kling: "https://app.klingai.com/cn/dev/api-key",
  zhipu: "https://bigmodel.cn/usercenter/proj-mgmt/apikeys",
  qwen: "https://bailian.console.aliyun.com/cn-beijing/?tab=model#/api-key",
  wan: "https://bailian.console.aliyun.com/cn-beijing/?tab=model#/api-key",
  openrouter: "https://openrouter.ai/settings/keys",
  openai: "",
  vidu: "https://platform.vidu.cn/api-keys",
  anthropic: "",
  runninghub: "https://www.runninghub.cn/enterprise-api/consumerApi",
  gemini: "https://ai.google.dev/gemini-api/docs/api-key?hl=zh-cn",
  grsai: "https://tf.grsai.ai/zh/dashboard/api-keys",
});

const currentWebsite = computed(() => {
  return websites.value[modelForm.value.manufacturer] || "";
});

// 厂商名称映射
const manufacturerNames: Record<string, string> = {
  deepSeek: "DeepSeek",
  volcengine: "火山引擎",
  kling: "可灵",
  zhipu: "智谱",
  qwen: "阿里千问",
  wan: "阿里万相",
  openrouter: "OpenRouter",
  openai: "OpenAI",
  vidu: "Vidu",
  anthropic: "Anthropic",
  runninghub: "RunningHUB",
  gemini: "Gemini",
  modelScope: "魔塔",
  xai: "XAI",
  grsai: "Grsai",
  other: "其他",
};

// 厂商默认 BaseURL 配置
const manufacturerDefaultBaseUrls: Record<string, Record<string, string>> = {
  deepSeek: {
    text: "https://api.deepseek.com/v1",
    image: "",
    video: "",
  },
  volcengine: {
    text: "https://ark.cn-beijing.volces.com/api/v3",
    image: "https://ark.cn-beijing.volces.com/api/v3/images/generations",
    video: "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks",
  },
  kling: {
    text: "https://api.klingai.com",
    image: "https://api-beijing.klingai.com/v1/images/omni-image",
    video:
      "https://api-beijing.klingai.com/v1/videos/image2video|https://api-beijing.klingai.com/v1/videos/text2video|https://api-beijing.klingai.com/v1/videos/text2video/{taskId}",
  },
  zhipu: {
    text: "https://open.bigmodel.cn/api/paas/v4",
    image: "",
    video: "",
  },
  qwen: {
    text: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    image: "",
    video: "",
  },
  wan: {
    text: "",
    image: "",
    video:
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis|https://dashscope.aliyuncs.com/api/v1/services/aigc/image2video/video-synthesis|https://dashscope.aliyuncs.com/api/v1/tasks/{taskId}",
  },
  openrouter: {
    text: "https://openrouter.ai/api/v1",
    image: "https://openrouter.ai/api/v1",
    video: "",
  },
  openai: {
    text: "https://api.openai.com/v1",
    image: "",
    video: "",
  },
  vidu: {
    text: "",
    image: "https://api.vidu.cn/ent/v2/reference2image|https://api.vidu.cn/ent/v2/tasks/{id}/creations",
    video: "https://api.vidu.cn/ent/v2/text2video|https://api.vidu.cn/ent/v2/img2video|https://api.vidu.cn/ent/v2/tasks",
  },
  gemini: {
    text: "https://generativelanguage.googleapis.com/v1beta",
    image: "https://generativelanguage.googleapis.com/v1beta",
    video:
      "https://generativelanguage.googleapis.com/v1beta/models/{model}:predictLongRunning|https://generativelanguage.googleapis.com/v1beta/{name}",
  },
  anthropic: {
    text: "https://api.anthropic.com/v1",
    image: "",
    video: "",
  },
  runninghub: {
    text: "",
    image: "",
    video: "",
  },
  modelScope: {
    text: "https://api-inference.modelscope.cn/v1",
    image: "https://api-inference.modelscope.cn/v1/images/generations|https://api-inference.modelscope.cn/v1/tasks/{id}",
    video: "",
  },
  grsai: {
    text: "https://grsai.dakka.com.cn/v1",
    image: "https://grsai.dakka.com.cn/v1/draw/nano-banana|https://grsai.dakka.com.cn/v1/draw/result",
    video: "https://grsai.dakka.com.cn/v1/video/{model}|https://grsai.dakka.com.cn/v1/draw/result",
  },
  other: {
    text: "",
    image: "",
    video: "",
  },
};

interface ModelCard {
  manufacturer: string;
  manufacturerName: string;
  modelType: string;
  model: string;
  modelName: string;
  description: string;
  baseUrl: string;
}

const modelShow = defineModel<boolean>("modelShow", {
  type: Boolean,
  required: true,
});
const modelForm = ref<RowData>({
  id: 0,
  name: "",
  type: "",
  modelType: "",
  model: "",
  baseUrl: "",
  manufacturer: "",
  createTime: 0,
  apiKey: "",
});

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

//文本模型预设
const textModelPresets = ref<Record<string, { label: string; value: string }[]>>({});

// 生成文本模型卡片列表
const textModels = computed<ModelCard[]>(() => {
  const models: ModelCard[] = [];
  Object.entries(textModelPresets.value).forEach(([manufacturer, presets]) => {
    presets.forEach((preset) => {
      models.push({
        manufacturer,
        manufacturerName: manufacturerNames[manufacturer],
        modelType: "text",
        model: preset.value,
        modelName: preset.label,
        description: `${manufacturerNames[manufacturer]}文本模型`,
        baseUrl: manufacturerDefaultBaseUrls[manufacturer]?.text || "",
      });
    });
  });
  return models;
});

// 获取可用的厂商列表(根据当前标签页)
const availableManufacturers = computed(() => {
  const manufacturers = new Set<string>();

  let currentModels: ModelCard[] = [];
  if (activeTab.value === "text") {
    currentModels = textModels.value;
  } else if (activeTab.value === "image") {
    currentModels = imageModels.value;
  } else if (activeTab.value === "video") {
    currentModels = videoModels.value;
  }

  currentModels.forEach((model) => {
    manufacturers.add(model.manufacturer);
  });

  return Array.from(manufacturers)
    .map((key) => ({
      key,
      name: manufacturerNames[key] || key,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
});

// 筛选模型的通用函数
function filterModels(models: ModelCard[]): ModelCard[] {
  let filtered = models;

  // 厂商筛选
  if (selectedManufacturers.value.length > 0) {
    filtered = filtered.filter((model) => selectedManufacturers.value.includes(model.manufacturer));
  }

  // 搜索关键词筛选
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim();
    filtered = filtered.filter(
      (model) =>
        model?.modelName.toLowerCase().includes(keyword) ||
        model?.description.toLowerCase().includes(keyword) ||
        model?.manufacturerName.toLowerCase().includes(keyword),
    );
  }

  return filtered;
}

// 筛选后的文本模型
const filteredTextModels = computed<ModelCard[]>(() => {
  return filterModels(textModels.value);
});

// 切换厂商选择
function toggleManufacturer(manufacturer: string) {
  const index = selectedManufacturers.value.indexOf(manufacturer);
  if (index > -1) {
    selectedManufacturers.value.splice(index, 1);
  } else {
    selectedManufacturers.value.push(manufacturer);
  }
}

// 清空筛选条件
function clearFilters() {
  selectedManufacturers.value = [];
  searchKeyword.value = "";
}

// 监听标签页切换,清空筛选条件
watch(activeTab, () => {
  clearFilters();
});
watch(
  useTabList,
  (tabs) => {
    const nextActiveTab = tabs[0]?.key ?? "";
    if (!tabs.length) {
      activeTab.value = "";
      return;
    }
    if (!tabs.some((tab) => tab.key === activeTab.value)) {
      activeTab.value = nextActiveTab;
    }
  },
  { immediate: true },
);
watch(
  () => modelShow.value,
  (newVal) => {
    getData();
  },
  { immediate: true },
);
//图片模型预设
const imageModelPresets = ref<Record<string, { label: string; value: string }[]>>({});

// 生成图像模型卡片列表
const imageModels = computed<ModelCard[]>(() => {
  const models: ModelCard[] = [];
  Object.entries(imageModelPresets.value).forEach(([manufacturer, presets]) => {
    presets.forEach((preset) => {
      models.push({
        manufacturer,
        manufacturerName: manufacturerNames[manufacturer],
        modelType: "image",
        model: preset.value,
        modelName: preset.label,
        description: `${manufacturerNames[manufacturer]}图像模型`,
        baseUrl: manufacturerDefaultBaseUrls[manufacturer]?.image || "",
      });
    });
  });
  return models;
});

// 筛选后的图像模型
const filteredImageModels = computed<ModelCard[]>(() => {
  return filterModels(imageModels.value);
});
//视频模型预设
const videoModelPresets = ref<Record<string, { label: string; value: string }[]>>({});

// 生成视频模型卡片列表
const videoModels = computed<ModelCard[]>(() => {
  const models: ModelCard[] = [];
  Object.entries(videoModelPresets.value).forEach(([manufacturer, presets]) => {
    presets.forEach((preset) => {
      models.push({
        manufacturer,
        manufacturerName: manufacturerNames[manufacturer],
        modelType: "video",
        model: preset.value,
        modelName: preset.label,
        description: `${manufacturerNames[manufacturer]}视频模型`,
        baseUrl: manufacturerDefaultBaseUrls[manufacturer]?.video || "",
      });
    });
  });
  return models;
});

// 筛选后的视频模型
const filteredVideoModels = computed<ModelCard[]>(() => {
  return filterModels(videoModels.value);
});

function getFilteredModels(key: string): ModelCard[] {
  if (key === "text") return filteredTextModels.value;
  if (key === "image") return filteredImageModels.value;
  return filteredVideoModels.value;
}

// 选择模型卡片
function selectModel(model: ModelCard) {
  isCustomModel.value = false;
  modelForm.value = {
    id: 0,
    name: "",
    type: getModelTypeCategory(model.modelType),
    modelType: model.modelType,
    model: model.model,
    baseUrl: model.baseUrl,
    manufacturer: model.manufacturer,
    createTime: 0,
    apiKey: "",
  };
  showConfigModal.value = true;
}

// 选择自定义模型
function selectCustomModel(type: string) {
  const chosenManufacturer = selectedManufacturers.value.length === 1 ? selectedManufacturers.value[0] : "other";
  const normalizedManufacturer = chosenManufacturer.toLowerCase() === "openrouter" ? "openrouter" : chosenManufacturer;
  const defaultBaseUrl = manufacturerDefaultBaseUrls[normalizedManufacturer]?.[type] || "";

  isCustomModel.value = true;
  modelForm.value = {
    id: 0,
    name: "",
    type: type,
    modelType: "",
    model: "",
    baseUrl: defaultBaseUrl,
    manufacturer: normalizedManufacturer,
    createTime: 0,
    apiKey: "",
  };
  showConfigModal.value = true;
}

// 获取当前模型类型对应的大类(text/image/video)
function getModelTypeCategory(modelType: string): string {
  return modelType;
}

// 获取默认 BaseURL 的 placeholder
const getDefaultBaseUrlPlaceholder = computed((): string => {
  const { manufacturer, type } = modelForm.value;
  if (!manufacturer || manufacturer === "runninghub") {
    return "请输入 Base URL";
  }

  if (type && manufacturerDefaultBaseUrls[manufacturer]) {
    const defaultUrl = manufacturerDefaultBaseUrls[manufacturer][type];
    return defaultUrl ? `默认: ${defaultUrl}` : "请输入 Base URL";
  }

  return "请输入 Base URL";
});

const emit = defineEmits(["fetchModelList"]);

function sure() {
  emit("fetchModelList");
  modelShow.value = false;
}
function getData() {
  axios
    .post("/setting/getAiModelList", {
      type: activeTab.value,
    })
    .then((res) => {
      if (activeTab.value === "text") {
        textModelPresets.value = res.data;
      } else if (activeTab.value === "image") {
        imageModelPresets.value = res.data;
      } else if (activeTab.value === "video") {
        videoModelPresets.value = res.data;
      }
    });
}
</script>

<style lang="scss" scoped>
.model-select-dialog {
  :deep(.t-dialog) {
    border: 1px solid var(--tf-border-subtle);
    box-shadow: var(--tf-shadow-2);
  }

  :deep(.t-dialog__header),
  :deep(.t-dialog__body),
  :deep(.t-dialog__footer) {
    background: var(--tf-bg-panel);
  }

  :deep(.t-dialog__header) {
    border-bottom: 1px solid var(--tf-border-subtle);
  }
}

.addModelContainer {
  width: 100%;
  height: 80vh;
  overflow: auto;
}

.model-cards-container {
  padding: 20px;
}

.model-tabs {
  :deep(.t-tabs__nav) {
    margin-bottom: 24px;
  }

  :deep(.t-tabs__nav-item) {
    color: var(--tf-text-secondary);
  }

  :deep(.t-tabs__nav-item.t-is-active) {
    color: var(--tf-text-primary);
  }

  :deep(.t-tabs__bar) {
    background: var(--tf-accent);
  }
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 10px 0;
}

.model-card {
  border: 1px solid var(--tf-border-subtle);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: var(--tf-bg-panel);
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: var(--tf-border-strong);
    background: var(--tf-bg-panel-2);
    transform: translateY(-1px);
  }

  .card-icon {
    font-size: 24px;
    color: var(--tf-accent-hover);
    transition: all 0.25s ease;
    &:deep(.anticon) {
      display: block;
    }
  }

  &:hover .card-icon {
    color: var(--tf-text-primary);
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    margin-bottom: 8px;
    gap: 8px;

    h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: var(--tf-text-primary);
      overflow: hidden;
      flex: 1;
    }

    :deep(.ant-tag) {
      border-radius: 10px;
      border: 1px solid var(--tf-border-subtle);
      font-size: 12px;
      font-weight: 500;
      padding: 4px 10px;
      flex-shrink: 0;
      background: var(--tf-bg-panel-2);
      color: var(--tf-text-secondary);
    }
  }

  .card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .model-description {
      color: var(--tf-text-secondary);
      font-size: 13px;
      line-height: 1.5;
    }

    .model-type {
      font-size: 12px;
      color: var(--tf-text-muted);

      .type-label {
        font-weight: 500;
        margin-right: 4px;
      }
    }
  }
}

.custom-card {
  border: 1px dashed var(--tf-border-strong);
  background: var(--tf-bg-panel-2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;

  &:hover {
    border-color: rgba(124, 132, 255, 0.32);
    background: var(--tf-bg-float);

    .card-icon {
      color: var(--tf-text-primary);
    }

    .card-header h3 {
      color: var(--tf-text-primary);
    }
  }

  .card-icon {
    color: var(--tf-accent-hover);
    font-size: 36px;
    margin-bottom: 8px;
    transition: all 0.25s ease;
  }

  .card-header h3 {
    color: var(--tf-accent-hover);
    font-weight: 600;
    transition: color 0.25s ease;
  }

  .card-body .model-description {
    color: var(--tf-text-secondary);
    text-align: center;
    font-size: 13px;
  }
}

// 筛选和搜索区域样式
.filter-section {
  margin-bottom: 20px;
}

.dialog-divider {
  margin: 16px 0;
  border-color: var(--tf-border-subtle);
}

.search-wrapper {
  margin-bottom: 16px;

  .search-input {
    max-width: 500px;

    :deep(.t-input__wrap) {
      border-radius: 12px;
      border: 1px solid var(--tf-border-subtle);
      background: var(--tf-bg-input);
      transition: all 0.25s ease;

      &:hover {
        border-color: var(--tf-border-strong);
      }

      &:focus-within {
        border-color: var(--tf-accent);
        box-shadow: 0 0 0 3px var(--tf-accent-softer);
      }
    }

    :deep(.t-input) {
      font-size: 14px;
      color: var(--tf-text-primary);
    }
  }
}

.manufacturer-filter {
  border-radius: 12px;
  padding: 16px;
  background: var(--tf-bg-panel-2);
  border: 1px solid var(--tf-border-subtle);
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .filter-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--tf-text-primary);
      display: flex;
      align-items: center;
      gap: 6px;
      :deep(.anticon) {
        color: var(--tf-accent-hover);
      }
    }

    :deep(.ant-btn-link) {
      color: var(--tf-text-secondary);
      padding-inline: 0;
    }
  }

  .manufacturer-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .manufacturer-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 10px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.25s ease;
      border: 1px solid var(--tf-border-subtle);
      background: var(--tf-bg-panel);
      color: var(--tf-text-secondary);
      user-select: none;

      .manufacturer-dot {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: currentColor;
        opacity: 0.72;
      }

      &:hover {
        border-color: var(--tf-border-strong);
        color: var(--tf-text-primary);
        background: var(--tf-bg-float);
      }

      &.ant-tag-checkable-checked {
        background: var(--tf-accent-soft);
        border-color: rgba(124, 132, 255, 0.28);
        color: var(--tf-text-primary);
        font-weight: 500;

        &:hover {
          background: rgba(124, 132, 255, 0.22);
          border-color: rgba(124, 132, 255, 0.34);
        }
      }
    }
  }
}

.filter-result {
  margin-top: 12px;
  padding: 8px 12px;
  background: var(--tf-accent-softer);
  border: 1px solid rgba(124, 132, 255, 0.22);
  border-radius: 10px;

  .result-text {
    font-size: 13px;
    color: var(--tf-text-secondary);

    strong {
      font-weight: 600;
      color: var(--tf-text-primary);
      font-size: 14px;
    }
  }
}

// 空状态样式优化
:deep(.ant-empty) {
  margin: 60px 0;

  .ant-empty-description {
    color: var(--tf-text-secondary);
    font-size: 14px;
  }
}
</style>
