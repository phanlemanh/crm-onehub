import { describe, expect, test } from "bun:test";
import { settingsMessages } from "@/lib/messages/settings";

describe("chu-bi-go", () => {
	test("chu-bi-go: cau hop bao bang dung nguyen van da khai o hai ngon ngu", () => {
		expect(settingsMessages("vi").model.biGo).toBe(
			"Model đã chọn không còn trên AI Gateway — tác nhân đang chạy model mặc định. Chọn model khác.",
		);
		expect(settingsMessages("en").model.biGo).toBe(
			"The model you chose is no longer on the AI Gateway — the agent is running the default model. Pick another model.",
		);
	});
});
