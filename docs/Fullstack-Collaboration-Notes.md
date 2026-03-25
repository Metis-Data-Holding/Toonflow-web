# Fullstack Collaboration Notes

> 用途：
> 这是一份前后端共享的变更协作文档。
> 每次涉及前后端联动的需求，都新增一个 Change 条目。
> 每次由发起仓库负责创建 Change 条目，填写相关内容。
> Toonflow-app 仓库负责填写后端相关内容，Toonflow-web 仓库负责填写前端相关内容。

---

## 状态说明
- `DRAFT`：需求刚建立，尚未开始开发
- `BACKEND_DONE`：后端已完成，等待前端同步
- `READY_FOR_JOINT_TEST`：前后端都已完成，待联调
- `DONE`：联调通过，需求完成
- `BLOCKED`：被阻塞，需要记录原因
- `CANCELLED`：需求取消

---

## Change-001
- 标题：`OpenRouter 文本模型接入与动态模型拉取`
- 日期：`2026-03-25`
- 发起仓库：`Toonflow-app`
- 需求背景：当前大模型配置中缺少 OpenRouter 支持，导致 `testAI` 连通测试无法通过；同时前端缺少可直接拉取 OpenRouter 模型列表的后端接口。
- 状态：`DONE`
- 是否影响前后端联动：`是`
- 关联 issue / PR / commit：`Toonflow-app: commit 3215454 (feat: 增加 OpenRouter 文本模型接入与模型拉取接口)`
- 备注：前端已接入 OpenRouter 模型动态拉取、保存与 testAI 闭环。

### 后端改动
- 参考：`../Toonflow-app/docs/Fullstack-Collaboration-Notes.md` 中 Change-001 后端内容

### 前端改动
- 受影响页面/组件：
  - 模型选择弹窗 `modeListDialog`
  - 模型配置弹窗 `addModelDialog`
  - 模型管理与测试 `modelData`
- 受影响 API / 类型：
  - 新增调用：`POST /api/setting/getOpenRouterModels`
  - 配置提交：`POST /api/setting/addModel`、`POST /api/setting/updateModel`
  - 连通测试：`POST /api/other/testAI`
  - 返回类型：`{ openrouter: Array<{ label: string; value: string }> }`
- 修改方案：
  - OpenRouter 场景 Base URL 自动回填为 `https://openrouter.ai/api/v1`，并只读展示（不可编辑）
  - API Key 输入框失焦自动拉取模型列表，并提供“刷新模型”按钮
  - 模型输入改为“可搜索下拉 + 可手输”模式
  - 保存与测试时统一发送 `manufacturer: "openrouter"`
- 是否有阻塞：`否`
- 实际修改内容：
  - 增加 OpenRouter 厂商映射与默认参数
  - 接入 OpenRouter 模型拉取接口并联动 UI
  - 统一 add/update/testAI 的 manufacturer/baseUrl 发送策略
- 前端涉及文件：
  - `src/views/setting/model/addModelDialog.vue`
  - `src/views/setting/model/modeListDialog.vue`
  - `src/views/setting/model/modelData.vue`
- 验证方式：
  - 配置 OpenRouter -> 自动/手动拉取模型 -> 保存 -> testAI 连接测试
  - 运行 `npm run type-check`

### 联调结果
- 联调结论：联调通过（配置 OpenRouter -> 拉取模型 -> 保存 -> testAI 全链路正常）
- 遗留问题：暂无阻塞项；Gemini 连通问题不在本次 Change-001 范围内
