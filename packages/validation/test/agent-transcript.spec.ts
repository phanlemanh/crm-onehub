import { describe, expect, test } from "bun:test";
import {
	agentTranscriptItem,
	parseAgentTranscriptItem,
	type Source,
	type Tone,
} from "../src/agent-transcript";

const did = {
	kind: "did",
	id: "t1",
	label: "Đọc thư và cuộc gặp với họ",
	input: { query: "acme" },
	output: { rows: 3 },
	tone: "warning",
	pending: false,
	sources: [
		{ url: "https://example.com/a", title: "A", network: "web" },
	],
	tool: "read_crm_history",
	errorText: "hết lượt gọi",
};

describe("agentTranscriptItem", () => {
	test("nhận một lượt did mang tone warning kèm chuỗi lỗi", () => {
		const item = parseAgentTranscriptItem(did);
		expect(item.kind).toBe("did");
		if (item.kind !== "did") throw new Error("dạng sai");
		expect(item.tone).toBe("warning");
		expect(item.errorText).toBe("hết lượt gọi");
		expect(item.sources[0]?.network).toBe("web");
	});

	test("nhận ba dạng said, reasoned, did", () => {
		expect(parseAgentTranscriptItem({ kind: "said", id: "a", mine: true, text: "chào" }).kind).toBe("said");
		expect(parseAgentTranscriptItem({ kind: "reasoned", id: "b", streaming: false, text: "nghĩ" }).kind).toBe("reasoned");
		expect(parseAgentTranscriptItem(did).kind).toBe("did");
	});

	test("thiếu kind thì ném lỗi nêu tên trường", () => {
		expect(() => parseAgentTranscriptItem({ id: "x", text: "y" })).toThrow(/kind/);
	});

	test("dạng asked không thuộc hình dạng này — nó ở lại apps/app", () => {
		expect(() => parseAgentTranscriptItem({ kind: "asked", id: "q", question: {} })).toThrow(/kind/);
	});

	test("tone ngoài ba giá trị thì ném lỗi nêu tên trường", () => {
		expect(() => parseAgentTranscriptItem({ ...did, tone: "panic" })).toThrow(/tone/);
	});

	test("schema xuất ra dùng được trực tiếp", () => {
		const ok = agentTranscriptItem.safeParse(did);
		expect(ok.success).toBe(true);
	});
});

describe("kiểu suy ra từ schema", () => {
	test("Tone và Source là kiểu, không phải interface viết tay", () => {
		const tone: Tone = "success";
		const source: Source = { url: "https://x.dev", title: "X", network: "github" };
		expect(tone).toBe("success");
		expect(source.network).toBe("github");
	});
});
