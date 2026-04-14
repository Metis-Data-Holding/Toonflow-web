import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../src/components/chat/chatMessage.vue", import.meta.url), "utf8");

const userTextBubbleUsesBorderedVariant = /<McBubble\s+v-if="item\.type === 'text'"\s+:align="'right'"\s+:variant="'bordered'"/.test(source);

if (!userTextBubbleUsesBorderedVariant) {
  console.error("User text bubble is still using the default MateChat filled variant instead of the dark-theme bordered variant.");
  process.exit(1);
}

console.log("User text bubble uses the bordered variant required by the dark chat theme.");
