import { describe, expect, test } from "bun:test";
import { chonKenh, type UuTien } from "@crm/db/kenh-thong-bao";

type DongBang = [UuTien, boolean, boolean, "zalo" | "slack" | null, boolean];

const BANG: DongBang[] = [
	["AUTO", true, true, "zalo", false],
	["AUTO", true, false, "zalo", false],
	["AUTO", false, true, "slack", false],
	["AUTO", false, false, null, false],
	["ZALO", true, true, "zalo", false],
	["ZALO", true, false, "zalo", false],
	["ZALO", false, true, "slack", true],
	["ZALO", false, false, null, false],
	["SLACK", true, true, "slack", false],
	["SLACK", true, false, "zalo", true],
	["SLACK", false, true, "slack", false],
	["SLACK", false, false, null, false],
];

function ghimCua([uu, zalo, slack]: DongBang): string {
	if (uu === "AUTO") return "AUTO khong bao gio lech";
	if (uu === "SLACK" && slack) return "SLACK chon Slack khi Slack duoc";
	return `chon-kenh ${uu} zalo=${zalo} slack=${slack}`;
}

describe("chon-kenh", () => {
	test("chon-kenh: ma tran toan phan 3x2x2", () => {
		expect(BANG.length, "ma tran toan phan 3x2x2").toBe(12);
	});

	for (const dong of BANG) {
		const [uu, zalo, slack, kenh, lech] = dong;
		test(`chon-kenh: ${uu} zalo=${zalo} slack=${slack}`, () => {
			expect(chonKenh(uu, zalo, slack), ghimCua(dong)).toEqual({ kenh, lech });
		});
	}
});
