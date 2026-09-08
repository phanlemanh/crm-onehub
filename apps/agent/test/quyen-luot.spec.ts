import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	BUILDER_AUTHORIZATION_KEY,
	commandTypeFromAuthorization,
	readBuilderAuthorization,
} from "@crm/validation/builder-question";
import { builderCommandType } from "../agent/lib/custom-agent-dispatch";

const banGhi = (authorized: boolean) => ({
	kind: "question",
	requestId: "req_1",
	prompt: "Chon mot muc",
	options: [],
	[BUILDER_AUTHORIZATION_KEY]: authorized,
});

describe("ke-thua", () => {
	it("ke-thua: doc duoc ca hai chieu tren cung khuon", () => {
		expect(readBuilderAuthorization(banGhi(true))).toBe(true);
		expect(readBuilderAuthorization(banGhi(false))).toBe(false);
	});

	it("ke-thua: sai khuon thi nem loi CO THONG DIEP, khong nuot", () => {
		const hong = [
			null,
			{ kind: "question", requestId: "req_1", prompt: "x", options: [] },
			{ ...banGhi(true), [BUILDER_AUTHORIZATION_KEY]: "co" },
		];
		expect(hong).toHaveLength(3);
		for (const value of hong) {
			expect(() => readBuilderAuthorization(value)).toThrow(
				"Builder input request is missing a usable authorization flag.",
			);
		}
	});

	it("ke-thua: cho ghi truyen quyen cua luot hoi, khong tu bia", () => {
		const nguon = readFileSync(
			join(import.meta.dir, "../agent/lib/builder-input.ts"),
			"utf8",
		);
		expect(nguon).toContain("BUILDER_AUTHORIZATION_KEY");
		expect(nguon).not.toContain(`"${BUILDER_AUTHORIZATION_KEY}"`);
		const goi = readFileSync(
			join(import.meta.dir, "../agent/channels/crm.ts"),
			"utf8",
		);
		expect(goi).toContain("builderTurnAuthorized(ctx)");
	});

	it("ke-thua: suy commandType dong khi khong doc duoc", () => {
		expect(commandTypeFromAuthorization(banGhi(true))).toBe("CREATE_AGENT");
		expect(commandTypeFromAuthorization(banGhi(false))).toBe("CHAT");
		expect(commandTypeFromAuthorization(null)).toBe("CHAT");
		expect(commandTypeFromAuthorization({ kind: "question" })).toBe("CHAT");
	});
});

describe("suy-dien", () => {
	it("suy-dien: message co inputResponse KHONG con nang quyen", () => {
		const traLoi = [
			{
				text: "co",
				resources: [],
				inputResponse: { requestId: "r1", text: "co" },
			},
			{
				text: "co",
				resources: [],
				inputResponse: { requestId: "r1", optionId: "o1" },
			},
		];
		expect(traLoi).toHaveLength(2);
		for (const message of traLoi) {
			expect(builderCommandType("CHAT", message)).toBe("CHAT");
			expect(builderCommandType("CREATE_AGENT", message)).toBe("CREATE_AGENT");
		}
	});

	it("suy-dien: khong con cho nao suy quyen tu hinh dang tin nhan", () => {
		const nguon = readFileSync(
			join(import.meta.dir, "../agent/lib/custom-agent-dispatch.ts"),
			"utf8",
		);
		expect(nguon).not.toContain('? "CREATE_AGENT" :');
	});
});
