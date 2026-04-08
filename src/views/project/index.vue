<template>
  <div class="root tf-page">
    <div class="header tf-page-header">
      <div class="tf-page-heading">
        <h2 class="title tf-page-title">我的项目</h2>
        <p class="sub tf-page-description">管理您的所有短剧项目</p>
      </div>
      <button class="addBtn tf-button-primary" @click="routeToCreateProject">
        <i-plus class="addIcon" :size="20" />
        新建项目
      </button>
    </div>
    <div v-if="projects.length === 0" class="empty tf-panel">
      <div class="emptyIcon">
        <i-folder-open class="iconEmpty" :size="48" />
      </div>
      <h3 class="emptyTitle">暂无项目</h3>
      <p class="emptyDesc">创建您的第一个项目，开始AI创作之旅</p>
    </div>

    <div v-else class="list">
      <div v-for="project in projects" :key="project.id" class="card tf-card" @click="openProject(project.id)">
        <div class="content">
          <div class="cardHeader">
            <div class="left">
              <div class="folderIcon">
                <i-folder-open class="iconFolder" :size="24" />
              </div>
              <div>
                <h3 class="name">{{ project.name }}</h3>
                <div class="type">
                  <span class="desc">类型：{{ project.type }}</span>
                </div>
              </div>
            </div>
            <div class="menu">
              <a-popconfirm title="确定要删除这个项目吗？" okText="确定" cancelText="取消" @confirm="deleteProject(project.id)" @click.stop>
                <button class="delBtn">
                  <i-delete :size="14" />
                </button>
              </a-popconfirm>
            </div>
          </div>
          <p v-if="project.intro" class="summary">
            {{ project.intro }}
          </p>
          <div class="time">
            <span>创建于 {{ dayjs(project?.createTime).format("YYYY-MM-DD HH:mm:ss") }}</span>
          </div>
        </div>
      </div>
    </div>
    <addProject v-model="addProjectShow" @getProjects="getProjects" />
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import axios from "@/utils/axios";
import store from "@/stores";
import addProject from "./components/addProject.vue";
const { project } = storeToRefs(store());

const projects = ref<
  {
    id: string;
    name: string;
    intro: string;
    type: string;
    artStyle: string | null;
    videoRatio: string | null;
    projectType: string | null;
    createTime: number;
    updatedAt: number;
  }[]
>([]);

const router = useRouter();
function getProjects() {
  axios
    .post("/project/getProject")
    .then(({ data }) => {
      projects.value = data;
    })
    .catch(() => {
      window.$message.error("获取项目列表失败");
    });
}

onMounted(() => {
  getProjects();
});

function openProject(projectId: string | undefined) {
  const item = projects.value.find((p) => p.id === projectId);
  if (item) project.value = item;
  else return window.$message.error("未找到该项目!");
  router.push(`/projectDetail?id=${projectId}`);
}
const addProjectShow = ref(false);
function routeToCreateProject() {
  addProjectShow.value = true;
}
function deleteProject(projectId: string | undefined) {
  axios
    .post("/project/delProject", { id: projectId })
    .then(() => {
      window.$message.success("项目删除成功");
      getProjects();
    })
    .catch(() => {
      window.$message.error("项目删除失败");
    });
}
</script>

<style lang="scss" scoped>
.root {
  width: 100%;
  background: transparent;

  .header {
    .addBtn {
      display: flex;
      align-items: center;

      .addIcon {
        margin-right: 0.25rem;
      }
    }
  }

  .empty {
    text-align: center;
    padding: 72px 24px;

    .emptyIcon {
      width: 6rem;
      height: 6rem;
      background: var(--tf-bg-panel-2);
      border: 1px solid var(--tf-border-subtle);
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      .iconEmpty {
        color: var(--td-text-color-placeholder);
      }
    }
    .emptyTitle {
      font-size: 1.125rem;
      font-weight: 500;
      color: var(--td-text-color-primary);
      margin-bottom: 0.5rem;
    }
    .emptyDesc {
      color: var(--td-text-color-secondary);
      margin-bottom: 1.5rem;
    }
  }

  .list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
    }

    .card {
      height: 100%;
      cursor: pointer;

      .content {
        padding: 1.5rem;

        .cardHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;

          .left {
            display: flex;
            align-items: center;
            gap: 0.75rem;

            .folderIcon {
              width: 3rem;
              height: 3rem;
              background: var(--tf-accent-soft);
              border: 1px solid rgba(124, 132, 255, 0.2);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;

              .iconFolder {
                color: var(--tf-accent-hover);
              }
            }

            .name {
              font-weight: 600;
              color: var(--tf-text-primary);
              margin: 0 0 4px;
            }

            .type {
              display: flex;
              align-items: center;
              gap: 0.5rem;

              .desc {
                font-size: 13px;
                color: var(--tf-text-secondary);
              }
            }
          }

          .menu {
            position: relative;

            .delBtn {
              padding: 0.5rem;
              color: var(--tf-text-muted);
              border-radius: 10px;
              background: none;
              border: 1px solid transparent;
              transition:
                color 0.2s,
                background 0.2s,
                border-color 0.2s;

              &:hover {
                color: var(--tf-danger);
                border-color: rgba(239, 68, 68, 0.18);
                background: rgba(239, 68, 68, 0.08);
                cursor: pointer;
              }
            }
          }
        }

        .summary {
          color: var(--tf-text-secondary);
          margin-bottom: 1rem;
          font-size: 14px;
          line-height: 1.65;
          line-clamp: 2;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .meta {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          color: var(--td-text-color-secondary);
          font-size: 0.9375rem;
        }
        .time {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--tf-border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--tf-text-muted);
          font-size: 13px;
        }
      }
    }
  }
}
</style>
