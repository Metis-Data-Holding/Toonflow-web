<template>
  <div class="overviewMain">
    <div class="overviewHeader">
      <h2 class="overviewTitle">项目概览</h2>
    </div>
    <div class="overviewStats">
      <div v-for="stat in stats" :key="stat.label" :class="['statGridItem', stat.color]">
        <div class="statGridTop">
          <div class="statIcon">
            <component :is="stat.icon" :size="22" />
          </div>
          <div class="statContent">
            <span class="statLabel">{{ stat.label }}</span>
            <span class="statValue">{{ stat.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="overviewPanels">
      <section class="projectSummary overviewPanel">
        <div class="panelHeader">
          <div>
            <h3 class="panelTitle">小说简介</h3>
          </div>
          <t-button variant="text" class="panelAction" @click="handleIntroEdit">
            <template #icon>
              <i-editor theme="outline" size="15" fill="currentColor" />
            </template>
            编辑
          </t-button>
        </div>

        <div class="panelBody">
          <p class="summaryText" v-if="!introEdit">{{ project?.intro || "暂无简介" }}</p>
          <a-textarea
            v-else
            v-model:value="introEditData"
            :autosize="{ minRows: 6, maxRows: 10 }"
            class="overviewTextarea"
            placeholder="输入项目简介..." />
        </div>

        <div v-if="introEdit" class="panelFooter">
          <a-button class="panelSecondaryBtn" @click="() => (introEdit = false)">取消</a-button>
          <a-button class="panelPrimaryBtn" type="primary" @click="updateProjectIntro">保存</a-button>
        </div>
      </section>

      <section class="projectInfo overviewPanel">
        <div class="panelHeader">
          <div>
            <h3 class="panelTitle">全局设置</h3>
          </div>
          <t-button v-if="!globalSettingEdit" variant="text" class="panelAction" @click="handleGlobalSettingEdit">
            <template #icon>
              <i-editor theme="outline" size="15" fill="currentColor" />
            </template>
            编辑
          </t-button>
        </div>

        <div v-if="!globalSettingEdit" class="infoList">
          <div class="infoItem">
            <label class="infoLabel">项目类型</label>
            <span class="infoValue">{{ project?.projectType || "无类型" }}</span>
          </div>
          <div class="infoItem">
            <label class="infoLabel">影片比例</label>
            <span class="infoValue">{{ project?.videoRatio || "16:9" }}</span>
          </div>
          <div class="infoItem">
            <label class="infoLabel">画风</label>
            <span class="infoValue">{{ project?.artStyle || "动漫" }}</span>
          </div>
          <div class="infoItem">
            <label class="infoLabel">小说类型</label>
            <span class="infoValue">{{ project?.type || "无类型" }}</span>
          </div>
        </div>

        <div v-else class="infoEditGrid">
          <div class="infoField">
            <label class="infoLabel">项目类型</label>
            <t-select v-model="projectEditData.projectType" class="overviewSelect" placeholder="选择项目类型">
              <t-option key="基于小说原文" label="基于小说原文" value="基于小说原文" />
              <t-option key="基于剧本" label="基于剧本" value="基于剧本" />
            </t-select>
          </div>
          <div class="infoField">
            <label class="infoLabel">影片比例</label>
            <t-select v-model="projectEditData.videoRatio" class="overviewSelect" placeholder="选择影片比例">
              <t-option key="16:9" label="16:9" value="16:9" />
              <t-option key="4:3" label="9:16" value="9:16" />
            </t-select>
          </div>
          <div class="infoField">
            <label class="infoLabel">画风</label>
            <a-input v-model:value="projectEditData.artStyle" class="overviewInput" placeholder="选择画风" readonly @click="selectArtStyle" />
          </div>
          <div class="infoField">
            <label class="infoLabel">小说类型</label>
            <a-input v-model:value="projectEditData.type" class="overviewInput" placeholder="输入小说类型" />
          </div>
        </div>

        <div v-if="globalSettingEdit" class="panelFooter">
          <a-button class="panelSecondaryBtn" @click="() => (globalSettingEdit = false)">取消</a-button>
          <a-button class="panelPrimaryBtn" type="primary" @click="updateProject">保存</a-button>
        </div>
      </section>
    </div>
    <artStyle v-model:artStyleShow="artStyleShow" v-model:artStyleData="projectEditData.artStyle" />
  </div>
</template>

<script setup lang="ts">
import axios from "@/utils/axios";
import store from "@/stores";
import artStyle from "@/views/project/components/artStyle.vue";
const { project, projectId } = storeToRefs(store());

const globalSettingEdit = ref(false);
const introEdit = ref(false);
const introEditData = ref("");
function handleIntroEdit() {
  introEdit.value = true;
  introEditData.value = project.value?.intro ?? "暂无简介";
}
function handleGlobalSettingEdit() {
  projectEditData.value = {
    videoRatio: project.value?.videoRatio ?? "16:9",
    artStyle: project.value?.artStyle ?? "动漫",
    type: project.value?.type ?? "",
    projectType: project.value?.projectType ?? "",
  };
  globalSettingEdit.value = true;
}
const projectEditData = ref<{ videoRatio: string; artStyle: string; type: string; projectType: string }>({
  videoRatio: project.value?.videoRatio ?? "16:9",
  artStyle: project.value?.artStyle ?? "动漫",
  type: project.value?.type ?? "",
  projectType: project.value?.projectType ?? "",
});
onMounted(() => {
  getStats();
});
interface Stats {
  roleCount: number;
  scriptCount: number;
  storyboardCount: number;
  videoCount: number;
}
const statsData = ref<Stats>({
  roleCount: 0,
  scriptCount: 0,
  storyboardCount: 0,
  videoCount: 0,
});
async function getStats() {
  try {
    const res = await axios.post("/project/getProjectCount", { projectId: projectId.value });
    statsData.value = res.data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      window.$message.error("获取项目统计信息失败：" + err.message);
    }
  }
}
const stats = computed(() => [
  {
    label: "角色数量",
    value: statsData.value.roleCount || 0,
    icon: "i-peoples",
    color: "statMint",
  },
  {
    label: "剧本集数",
    value: statsData.value.scriptCount || 0,
    icon: "i-doc-detail",
    color: "statBlue",
  },
  {
    label: "分镜数量",
    value: statsData.value.storyboardCount || 0,
    icon: "i-carousel-video",
    color: "statEmerald",
  },
  {
    label: "视频数量",
    value: statsData.value.videoCount || 0,
    icon: "i-video-one",
    color: "statAmber",
  },
]);
function updateProjectIntro() {
  axios
    .post("/project/updateProject", {
      id: projectId.value,
      intro: introEditData.value,
    })
    .then(async () => {
      await store().setProjectById(projectId.value);
      window.$message.success("项目简介更新成功");
      introEdit.value = false;
    })
    .catch(() => {
      window.$message.error("项目简介更新失败");
    });
}
function updateProject() {
  axios
    .post("/project/updateProject", {
      id: projectId.value,
      type: projectEditData.value.type,
      artStyle: projectEditData.value.artStyle,
      videoRatio: projectEditData.value.videoRatio,
      projectType: projectEditData.value.projectType,
    })
    .then(async () => {
      await store().setProjectById(projectId.value);
      window.$message.success("全局设置更新成功");
      globalSettingEdit.value = false;
    })
    .catch(() => {
      window.$message.error("全局设置更新失败");
    });
}
const artStyleShow = ref<boolean>(false);
function selectArtStyle() {
  artStyleShow.value = true;
}
</script>

<style lang="scss" scoped>
.overviewMain {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.overviewHeader {
  .overviewTitle {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 600;
    color: var(--tf-text-primary);
  }

  .overviewSub {
    margin: 0;
    color: var(--tf-text-secondary);
    font-size: 14px;
  }
}

.overviewStats {
  position: relative;
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 24px;
  padding-bottom: 28px;

  &::after {
    content: "";
    position: absolute;
    left: 2px;
    right: 2px;
    bottom: 0;
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
  }

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1120px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .statGridItem {
    position: relative;
    min-height: 182px;
    padding: 34px 22px 28px;
    border-radius: 18px;
    border: 1px solid rgba(98, 224, 172, 0.22);
    background: rgba(255, 255, 255, 0.018);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.03),
      0 16px 36px rgba(0, 0, 0, 0.24);
    overflow: hidden;

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      border: 1px solid transparent;
      opacity: 0.65;
    }

    &.statMint::after {
      border-color: rgba(98, 224, 172, 0.42);
      box-shadow: 0 0 24px rgba(98, 224, 172, 0.12);
    }

    &.statBlue::after {
      border-color: rgba(98, 224, 172, 0.38);
      box-shadow: 0 0 24px rgba(98, 224, 172, 0.1);
    }

    &.statEmerald::after {
      border-color: rgba(98, 224, 172, 0.38);
      box-shadow: 0 0 24px rgba(98, 224, 172, 0.1);
    }

    &.statAmber::after {
      border-color: rgba(98, 224, 172, 0.38);
      box-shadow: 0 0 24px rgba(98, 224, 172, 0.1);
    }

    .statGridTop {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin-bottom: 0;
      min-height: 100%;
      padding-inline: 10px;
    }

    .statContent {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 18px;
      flex: 0 1 200px;
      min-width: 0;
    }

    .statIcon {
      width: 48px;
      height: 48px;
      transform: translateX(-18px);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #62e0ac;
      background: rgba(98, 224, 172, 0.1);
      border: 1px solid rgba(98, 224, 172, 0.16);
    }

    &.statMint .statIcon {
      color: #62e0ac;
    }

    &.statBlue .statIcon {
      color: #62e0ac;
    }

    &.statEmerald .statIcon {
      color: #62e0ac;
    }

    &.statAmber .statIcon {
      color: #62e0ac;
    }

    .statLabel {
      font-size: 17px;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: var(--tf-text-primary);
      line-height: 1.35;
      white-space: nowrap;
    }

    .statValue {
      font-size: 30px;
      font-weight: 700;
      color: var(--tf-text-primary);
      line-height: 1;
      letter-spacing: -0.03em;
    }
  }
}

.overviewPanels {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 1120px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.overviewPanel {
  display: flex;
  flex-direction: column;
  min-height: 320px;
  padding: 24px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.016);
  border: 1px solid var(--tf-border-strong);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 18px 36px rgba(0, 0, 0, 0.22);
}

.panelHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;

  .panelTitle {
    margin: 0 0 6px;
    font-size: 17px;
    font-weight: 600;
    color: var(--tf-text-primary);
  }

  .panelDescription {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--tf-text-secondary);
    max-width: 320px;
  }
}

.panelAction {
  color: var(--tf-text-secondary);
  border-radius: 10px;

  &:hover {
    color: var(--tf-accent-hover);
    background: rgba(124, 132, 255, 0.08);
  }
}

.panelBody {
  flex: 1;
}

.summaryText {
  margin: 0;
  color: var(--tf-text-secondary);
  line-height: 1.8;
  white-space: pre-wrap;
}

.panelFooter {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.panelSecondaryBtn {
  border-radius: 10px;
}

.panelPrimaryBtn {
  border-radius: 10px;
}

.infoList {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;

  .infoItem {
    display: grid;
    grid-template-columns: minmax(120px, 160px) 1fr;
    align-items: center;
    gap: 24px;
    padding: 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    &:first-child {
      padding-top: 0;
    }
  }
}

.infoEditGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;

  @media (min-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.infoField {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.infoLabel {
  font-size: 12px;
  color: var(--tf-text-tertiary);
  letter-spacing: 0.02em;
}

.infoValue {
  color: var(--tf-text-primary);
  font-size: 15px;
  font-weight: 500;
  justify-self: end;
  text-align: right;
}

:deep(.overviewTextarea .ant-input),
:deep(.overviewInput.ant-input) {
  padding: 14px 16px;
  border-radius: 12px;
  border-color: var(--tf-border-strong);
  background: rgba(255, 255, 255, 0.03);
  color: var(--tf-text-primary);

  &:hover {
    border-color: rgba(255, 255, 255, 0.16);
  }

  &:focus,
  &:focus-within {
    border-color: rgba(124, 132, 255, 0.42);
    box-shadow: 0 0 0 3px rgba(124, 132, 255, 0.12);
  }
}

:deep(.overviewTextarea .ant-input::placeholder),
:deep(.overviewInput.ant-input::placeholder) {
  color: var(--tf-text-tertiary);
}

:deep(.overviewSelect .t-input),
:deep(.overviewSelect .t-input__inner) {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-color: var(--tf-border-strong);
  color: var(--tf-text-primary);
}

:deep(.overviewSelect .t-input:hover) {
  border-color: rgba(255, 255, 255, 0.16);
}

:deep(.overviewSelect .t-input.is-focused) {
  border-color: rgba(124, 132, 255, 0.42);
  box-shadow: 0 0 0 3px rgba(124, 132, 255, 0.12);
}

:deep(.overviewSelect .t-input__inner::placeholder) {
  color: var(--tf-text-tertiary);
}

:deep(.overviewSelect .t-input__suffix),
:deep(.overviewSelect .t-select__right-icon) {
  color: var(--tf-text-tertiary);
}

:deep(.panelSecondaryBtn.ant-btn) {
  background: rgba(255, 255, 255, 0.04);
  border-color: var(--tf-border-strong);
  color: var(--tf-text-secondary);

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.16);
    color: var(--tf-text-primary);
  }
}

:deep(.panelPrimaryBtn.ant-btn-primary) {
  background: var(--tf-accent);
  border-color: var(--tf-accent);

  &:hover {
    background: var(--tf-accent-hover);
    border-color: var(--tf-accent-hover);
  }
}
</style>
