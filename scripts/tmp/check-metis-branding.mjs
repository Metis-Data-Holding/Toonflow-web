import { readFileSync } from "node:fs";

const checks = [
  { file: "index.html", mustInclude: "Metis", mustExclude: ">Toonflow<" },
  { file: "src/components/sider.vue", mustInclude: "Metis", mustExclude: "Toonflow" },
  { file: "src/pages/workbench/index.vue", mustInclude: "Metis", mustExclude: "Toonflow" },
  { file: "src/pages/login/index.vue", mustInclude: "Metis", mustExclude: "Toonflow" },
  { file: "src/views/setting/components/about.vue", mustInclude: "Metis", mustExclude: "ToonFlow" },
  { file: "src/views/setting/components/officialConfig.vue", mustInclude: "Metis官方apiKey", mustExclude: "Toonflow官方apiKey" },
  { file: "src/views/projectDetail/components/outlineManager/index.vue", mustInclude: "欢迎使用Metis", mustExclude: "欢迎使用Toonflow" },
  { file: "src/views/projectDetail/components/scriptManager/components/storyboardImage/storyboardChat.vue", mustInclude: "欢迎使用Metis", mustExclude: "欢迎使用Toonflow" },
];

for (const check of checks) {
  const source = readFileSync(new URL(`../../${check.file}`, import.meta.url), "utf8");
  if (!source.includes(check.mustInclude) || source.includes(check.mustExclude)) {
    console.error(`Branding check failed for ${check.file}`);
    process.exit(1);
  }
}

console.log("Metis branding is applied to all key user-facing entry points.");
