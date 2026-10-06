import { describe, expect, test } from "bun:test";
import { FIELDS_AGENT } from "../agent/lib/fields-config";

describe("chu-truong", () => {
	test("chu-truong: cau tu choi dung nguyen van da khai", () => {
		expect(FIELDS_AGENT.tuChoi).toBe(
			"Only a workspace owner or admin can change the team's fields. Ask one of them to do it from Settings › Fields.",
		);
		expect(FIELDS_AGENT.suKien).toBe("truong.doi-qua-chat");
	});
});
