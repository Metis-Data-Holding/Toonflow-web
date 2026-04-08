# Toonflow Design Foundation Phase 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Continue visual convergence after phase 1 by removing the most visible legacy component-library styles and aligning high-frequency panels with `DESIGN.md`.

**Architecture:** Keep all business logic intact and limit work to style/token convergence plus lightweight template shell cleanup. Reuse the global token system in `src/assets/main.css`, then remove local light-theme overrides in modal, table, form, and chat-heavy surfaces in priority order.

**Tech Stack:** Vue 3, TypeScript, Vite, Ant Design Vue, TDesign, Element Plus, VXE Table, SCSS

---

### Task 1: High-Frequency Modal Surface Convergence

**Files:**
- Modify: `src/views/setting/model/modeListDialog.vue`
- Modify: `src/views/projectDetail/components/assetsManager/components/batchGenereate.vue`
- Modify: `src/views/projectDetail/components/scriptManager/components/storyboardImage/detectionImage.vue`
- Modify: `src/views/projectDetail/components/assetsManager/components/addElementDialog.vue`
- Reference: `DESIGN.md`
- Reference: `src/assets/main.css`

**Step 1: Replace local light modal headers**

Remove local white / pale-purple headers, default blues, and one-off shadows. Use deep panel backgrounds, subtle borders, and the single accent color from `DESIGN.md`.

**Step 2: Normalize modal internal structure**

For each modal:
- header uses dark panel / float layer
- body uses panel background
- toolbar uses `tf-toolbar` visual language
- footer buttons have one clear primary action and secondary neutrals

**Step 3: Normalize table and form containers**

Replace hand-built light tables and local VXE light overrides with:
- dark table shell
- quiet header row
- subtle row separators
- consistent focus ring

**Step 4: Verify visually dangerous hardcodes are removed**

Search for remaining `#1890ff`, `#40a9ff`, `#fff`, `#fafafa`, and pale gradient headers in the touched files.

**Step 5: Run verification**

Run:
- `npx prettier --write src/views/setting/model/modeListDialog.vue src/views/projectDetail/components/assetsManager/components/batchGenereate.vue src/views/projectDetail/components/scriptManager/components/storyboardImage/detectionImage.vue src/views/projectDetail/components/assetsManager/components/addElementDialog.vue`
- `yarn eslint src/views/setting/model/modeListDialog.vue src/views/projectDetail/components/assetsManager/components/batchGenereate.vue src/views/projectDetail/components/scriptManager/components/storyboardImage/detectionImage.vue src/views/projectDetail/components/assetsManager/components/addElementDialog.vue`

Expected:
- Formatting succeeds
- No new lint errors in touched files

### Task 2: Settings Shell Convergence

**Files:**
- Modify: `src/views/setting/index.vue`
- Modify: `src/views/setting/skeleton.vue`
- Modify: `src/views/setting/components/requestConfig.vue`
- Modify: `src/views/setting/components/dbConfig.vue`

**Step 1: Apply shared page shell**

Add the same `Page Shell` semantics used in project/task/projectDetail pages:
- page title
- section description
- stable content gutter

**Step 2: Replace legacy percentage section layout**

Remove `10% / 90%` layout in `skeleton.vue`; use fixed title rail or stacked section block based on available width.

**Step 3: Normalize settings action density**

Make destructive actions visually distinct but restrained. Avoid multiple competing primary buttons in one settings block.

**Step 4: Verify**

Run formatter and eslint for the touched settings files.

### Task 3: Chat Surface Convergence

**Files:**
- Modify: `src/components/chat/index.vue`
- Modify: `src/components/chat/chatMessage.vue`

**Step 1: Remove consumer-chat styling**

Replace white message canvas, oversized radii, glossy gradients, and growth hover motion with:
- dark panel message area
- restrained bubbles
- subtle contrast

**Step 2: Clarify primary/secondary actions**

Send remains primary; utility actions become quiet secondary icon buttons.

**Step 3: Verify**

Run formatter and eslint for both files.

### Task 4: Legacy Hardcode Sweep

**Files:**
- Search / patch only when the visual issue is obvious
- Prioritize: `src/components/videoConfig/VideoConfigForm.vue`, `src/components/videoConfig/ImageSelector.vue`, `src/views/projectDetail/components/scriptManager/components/storyboardImage/draggableCanvas.vue`, `src/views/setting/model/modelData.vue`

**Step 1: Replace stray accent hardcodes**

Convert legacy blues, greens, and pale surfaces to shared tokens where safe.

**Step 2: Collapse radius drift**

Reduce outlier radii (4/6/14/20) toward the shared 10/12/16 scale unless functionally necessary.

**Step 3: Verify**

Run targeted formatter / eslint on the files actually changed.

### Task 5: Final Review Pass

**Files:**
- Review all changed files from phase 1 and phase 2

**Step 1: Re-run design audit search**

Run `rg` for:
- `#1890ff|#0052d9|#40a9ff|#fff\\b|#fafafa|background:\\s*#fff|linear-gradient\\(`

**Step 2: Re-check DESIGN.md mapping**

For every modified area, map:
- color rules
- radius / panel rules
- page shell rules
- button hierarchy rules

**Step 3: Verification**

Run:
- `yarn eslint <all touched vue/ts files>`
- `yarn type-check`

Expected:
- ESLint clean on touched files
- `type-check` may still fail on pre-existing repository errors; record those separately and do not conflate them with this phase
