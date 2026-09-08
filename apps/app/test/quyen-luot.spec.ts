import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const BA_DUONG = [
	{
		ten: "nut Tao tac nhan",
		file: "components/agent-builder/new-agent-dialog.tsx",
		ghim: 'commandType: "CREATE_AGENT"',
	},
	{
		ten: "go tay trong hoi thoai",
		file: "components/agent-builder/agent-composer.tsx",
		ghim: "state.command?.commandType ?? builderCommandType(message)",
	},
	{
		ten: "follow-up tren agent da deploy",
		file: "components/agent-builder/agent-builder-chat.tsx",
		ghim: 'commandType: "CREATE_AGENT"',
	},
] as const;

describe("ba duong vao khong doi", () => {
	it("moi duong giu dung gia tri ghim tai SHA 9ec0251", () => {
		expect(BA_DUONG).toHaveLength(3);
		for (const duong of BA_DUONG) {
			const nguon = readFileSync(
				join(import.meta.dir, "..", duong.file),
				"utf8",
			);
			expect(nguon.length).toBeGreaterThan(200);
			if (!nguon.includes(duong.ghim)) {
				throw new Error(
					`${duong.ten} (${duong.file}) khong con giu gia tri ghim`,
				);
			}
		}
	});

	it("go tay mac dinh CHAT khi khong co slash-command", async () => {
		const { builderCommandType } = await import("../lib/agent-builder");
		expect(builderCommandType("Summarize the open risks")).toBe("CHAT");
	});
});
