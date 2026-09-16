import { describe, expect, it } from "bun:test";
import { authMessages } from "@/lib/messages/auth";

const TIENG = ["vi", "en"] as const;

const TEN_HANG = ["Google", "Microsoft", "Outlook", "Gmail"] as const;

const NHAN = ["title", "grantOne", "granting", "signOut"] as const;

describe("kho chuoi man xin quyen", () => {
	it("grant ghep dong ten nha cung cap, o ca hai thu tieng", () => {
		for (const tieng of TIENG) {
			const grant = authMessages(tieng).grantAccess.grant;
			const mot = grant("Đất Xanh");
			const hai = grant("Nhà Bè");
			expect(mot).toContain("Đất Xanh");
			expect(hai).toContain("Nhà Bè");
			expect(mot).not.toBe(hai);
		}
	});

	it("bon nhan cua man khong duc san ten mot nha cung cap nao", () => {
		for (const tieng of TIENG) {
			const khoi = authMessages(tieng).grantAccess;
			for (const khoa of NHAN) {
				for (const hang of TEN_HANG) {
					expect(
						khoi[khoa].includes(hang),
						`khoa grantAccess.${khoa} cua ban ${tieng} duc san ten "${hang}": "${khoi[khoa]}"`,
					).toBe(false);
				}
			}
		}
	});

	it("ba cau mo ta khac nhau tung doi mot trong moi thu tieng", () => {
		for (const tieng of TIENG) {
			const khoi = authMessages(tieng).grantAccess;
			const ba = [khoi.google, khoi.microsoft, khoi.both];
			expect(new Set(ba).size, `ban ${tieng}`).toBe(3);
		}
	});
});
