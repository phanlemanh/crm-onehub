import { defineTool } from "eve/tools";
import { canPhienHoi, locTim, timOkr } from "../lib/hoi-doc";

export default defineTool({
	description:
		"Find OKR the asker may see: published Mục tiêu with their KR, progress, expected progress and status (dung-nhip, cham-nhip, truot, chua-co-ky-vong). Filter by text in a Mục tiêu or KR title (tu), cycle (cycleId), only the asker's own (cuaToi), or status (tinhTrang). Without cycleId it reads the current quarter; chuKy lists every cycle the asker may see with its id, and conThem: true means the list was cut. Anything the asker may not see is never returned; an empty result (rong: true) means nothing visible matches.",
	inputSchema: locTim,
	execute: async (input, ctx) => {
		const p = canPhienHoi(ctx);
		if ("ok" in p) return p;
		return timOkr(p.userId, input);
	},
});
