import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "bun:test";
import {
	BUILDER_AUTHORIZATION_KEY,
	commandTypeFromAuthorization,
	readBuilderAuthorization,
} from "@crm/validation/builder-question";

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

	it("ke-thua: suy commandType dong khi khong doc duoc", () => {
		expect(commandTypeFromAuthorization(banGhi(true))).toBe("CREATE_AGENT");
		expect(commandTypeFromAuthorization(banGhi(false))).toBe("CHAT");
		expect(commandTypeFromAuthorization(null)).toBe("CHAT");
		expect(commandTypeFromAuthorization({ kind: "question" })).toBe("CHAT");
	});
});
