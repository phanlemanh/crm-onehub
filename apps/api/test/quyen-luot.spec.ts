import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	BUILDER_AUTHORIZATION_KEY,
	commandTypeFromAuthorization,
} from "@crm/validation/builder-question";

type CoQuyen = { [BUILDER_AUTHORIZATION_KEY]?: unknown };

const cauHoi = (over: CoQuyen = {}) => ({
	kind: "question",
	requestId: "req_1",
	prompt: "Chon mot muc",
	options: [],
	...over,
});

describe("api doc ban ghi quyen", () => {
	it("cap hai chieu tren cung ban ghi, khac dung mot truong", () => {
		expect(
			commandTypeFromAuthorization(
				cauHoi({ [BUILDER_AUTHORIZATION_KEY]: true }),
			),
		).toBe("CREATE_AGENT");
		expect(
			commandTypeFromAuthorization(
				cauHoi({ [BUILDER_AUTHORIZATION_KEY]: false }),
			),
		).toBe("CHAT");
	});

	it("ba hinh dang nguon quyen khong dung duoc deu cho CHAT", () => {
		const hong = [
			null,
			cauHoi(),
			cauHoi({ [BUILDER_AUTHORIZATION_KEY]: "co" }),
		];
		expect(hong).toHaveLength(3);
		for (const value of hong) {
			expect(commandTypeFromAuthorization(value)).toBe("CHAT");
		}
	});

	it("service khong con ghim cung CREATE_AGENT cho cau tra loi", () => {
		const nguon = readFileSync(
			join(import.meta.dir, "../src/conversations/conversations.service.ts"),
			"utf8",
		);
		expect(nguon.includes("commandTypeFromAuthorization(")).toBe(true);
		const tao = nguon.slice(nguon.indexOf("inputRequestId: input.requestId"));
		expect(tao.slice(0, 220).includes('commandType: "CREATE_AGENT"')).toBe(
			false,
		);
	});
});
