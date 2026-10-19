import { nopTraLoiInput } from "@crm/validation/okr-tra-loi";
import { defineTool } from "eve/tools";
import { canPhienHoi } from "../lib/hoi-doc";
import { ketQuaTraLoi, nopTraLoi } from "../lib/hoi-tra-loi";

export default defineTool({
	description:
		"Submit the answer once, at the end of the turn. loai tra-loi: each sentence (chu) cites in trich the Mục tiêu (objective) or KR it talks about, read earlier with tim_okr or doc_okr; every number in a sentence must be a progress, start, current, target or expected value of what it cites, or the count of the Mục tiêu or KR it cites, or a year or quarter. loai khong-biet: nothing the asker may see answers it. loai ngoai-pham-vi: a request to change OKR or a question that is not about OKR. A rejection names the citation or number to fix; fix it and submit the whole answer again.",
	inputSchema: nopTraLoiInput,
	outputSchema: ketQuaTraLoi,
	execute: async (input, ctx) => {
		const p = canPhienHoi(ctx);
		if ("ok" in p) return p;
		return nopTraLoi(p.userId, input);
	},
});
