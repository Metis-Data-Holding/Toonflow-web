import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../src/views/projectDetail/components/outlineManager/components/outline.vue", import.meta.url), "utf8");

const hasLegacyLightSurfaces =
  source.includes("background: var(--mainGradient);") ||
  source.includes("background: var(--td-brand-color-light);") ||
  source.includes("background: rgba(255, 255, 255, 0.2);");

if (hasLegacyLightSurfaces) {
  console.error("Outline manager still uses legacy light surface backgrounds that conflict with the dark UI.");
  process.exit(1);
}

console.log("Outline manager surface styles are aligned to the dark UI tokens.");
