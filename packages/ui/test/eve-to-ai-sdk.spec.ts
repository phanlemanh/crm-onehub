import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import type { DidItem } from "@crm/validation/agent-transcript";
import { parseAgentTranscriptItem } from "@crm/validation/agent-transcript";
import { toToolPart, toUIMessage } from "../src/lib/eve-to-ai-sdk";

type RawTurn = { kind: string; id: string };

type RawRow = { id: string; mine: boolean; items: RawTurn[] };

const rows = JSON.parse(
	readFileSync(new URL("./fixtures/eve-turns.json", import.meta.url), "utf8"),
) as RawRow[];

const turns = rows.flatMap((row) => row.items);

const turnAt = (id: string): RawTurn => {
	const found = turns.find((turn) => turn.id === id);
	if (!found) throw new Error(`vật thử thiếu lượt "${id}"`);
	return found;
};

const itemAt = (id: string) => parseAgentTranscriptItem(turnAt(id));

const didAt = (id: string): DidItem => {
	const item = itemAt(id);
	if (item.kind !== "did") throw new Error(`lượt "${id}" không phải dạng did`);
	return item;
};

describe("vật thử rút từ toTranscript của apps/app", () => {
	it("mang đủ bốn dạng lượt mà kho thật sinh ra", () => {
		expect([...new Set(turns.map((turn) => turn.kind))].sort()).toEqual([
			"asked",
			"did",
			"reasoned",
			"said",
		]);
	});
});

describe("toUIMessage — vai của từng dạng", () => {
	it("said của người dùng mang vai user", () => {
		expect(toUIMessage(itemAt("m1:0")).role).toBe("user");
	});

	it("said của tác nhân mang vai assistant", () => {
		expect(toUIMessage(itemAt("m2:1")).role).toBe("assistant");
	});

	it("reasoned mang vai assistant và phần reasoning", () => {
		const message = toUIMessage(itemAt("m2:0"));

		expect(message.role).toBe("assistant");
		expect(message.parts[0]).toMatchObject({
			type: "reasoning",
			state: "streaming",
		});
	});

	it("did mang vai assistant", () => {
		expect(toUIMessage(didAt("m2:call-neutral")).role).toBe("assistant");
	});

	it("did chưa xong mang state input-available", () => {
		expect(toUIMessage(didAt("m3:call-pending")).parts[0]).toMatchObject({
			type: "dynamic-tool",
			state: "input-available",
		});
	});
});

describe("toToolPart — state của một lượt did", () => {
	it("did đã xong không lỗi thì output-available, giữ nguyên output", () => {
		const part = toToolPart(didAt("m2:call-neutral"));

		expect(part.state).toBe("output-available");
		expect(part.toolName).toBe("read_crm_history");
	});

	it("did tone warning kèm errorText phải là output-error, không phải output-available", () => {
		const item = didAt("m3:call-warning");
		const part = toToolPart(item);

		expect({
			tone: item.tone,
			errorText: item.errorText,
			state: part.state,
		}).toEqual({
			tone: "warning",
			errorText: "hết lượt gọi trong ngày",
			state: "output-error",
		});
	});

	it("did tone success vẫn là output-available", () => {
		expect(toToolPart(didAt("m3:call-success")).state).toBe("output-available");
	});
});

describe("dạng asked không đi qua lớp chuyển", () => {
	it("từ chối bằng lỗi nêu tên dạng", () => {
		const asked = turnAt("m3:call-asked");

		expect(asked.kind).toBe("asked");
		expect(() =>
			toUIMessage(asked as unknown as Parameters<typeof toUIMessage>[0]),
		).toThrow(/asked/);
	});
});
