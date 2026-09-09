import { describe, expect, it } from "bun:test";
import {
	BUILDER_AUTHORIZATION_KEY,
	buildPendingInputRequest,
	commandTypeFromAuthorization,
} from "@crm/validation/builder-question";

const cauHoi = (authorized: boolean) =>
	buildPendingInputRequest(
		{
			kind: "question",
			requestId: "req_1",
			prompt: "Chon mot muc",
			options: [],
		},
		authorized,
	);

describe("api doc ban ghi quyen", () => {
	it("cap hai chieu tren cung ban ghi, khac dung mot truong", () => {
		expect(commandTypeFromAuthorization(cauHoi(true))).toBe("CREATE_AGENT");
		expect(commandTypeFromAuthorization(cauHoi(false))).toBe("CHAT");
	});

	it("ba hinh dang nguon quyen khong dung duoc deu cho CHAT", () => {
		const khongCoTruong = {
			kind: "question",
			requestId: "req_1",
			prompt: "Chon mot muc",
			options: [],
		};
		expect(BUILDER_AUTHORIZATION_KEY in khongCoTruong).toBe(false);
		const hong = [
			null,
			khongCoTruong,
			{ ...cauHoi(true), [BUILDER_AUTHORIZATION_KEY]: "co" },
		];
		expect(hong).toHaveLength(3);
		for (const value of hong) {
			expect(commandTypeFromAuthorization(value)).toBe("CHAT");
		}
	});
});
