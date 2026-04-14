import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = "/Users/hongbo/MetisProjects/Toonflow-web";

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const projectDetail = read("src/views/projectDetail/index.vue");
const overview = read("src/views/projectDetail/components/overview/index.vue");
const assetsManager = read("src/views/projectDetail/components/assetsManager/index.vue");

assert(projectDetail.includes("color: var(--tf-accent-hover);"), "项目详情导航激活态未使用主题强调色");
assert(projectDetail.includes("box-shadow: 0 0 16px var(--tf-accent-soft);"), "项目详情导航底部高亮线未使用主题柔和色");
assert(!projectDetail.includes("#62e0ac"), "项目详情导航仍包含固定青绿色");

assert(!overview.includes("#62e0ac"), "项目概览仍包含固定青绿色");
assert(!overview.includes("statMint") && !overview.includes("statBlue") && !overview.includes("statEmerald") && !overview.includes("statAmber"), "项目概览仍保留固定色分类");
assert(overview.includes("border: 1px solid var(--tf-accent-soft);"), "项目概览卡片边框未使用主题柔和色");
assert(overview.includes("color: var(--tf-accent-hover);"), "项目概览图标或统计值未使用主题强调色");

assert(!assetsManager.includes("#62e0ac"), "资产管理数量角标仍包含固定青绿色");
assert(assetsManager.includes("background: linear-gradient(180deg, var(--tf-accent-softer) 0%, rgba(255, 255, 255, 0.02) 100%);"), "资产管理数量角标背景未使用主题变量");
assert(assetsManager.includes("color: var(--tf-accent-hover);"), "资产管理数量角标未使用主题强调色");

console.log("project detail theme accent checks passed");
