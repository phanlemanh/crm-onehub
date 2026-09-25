import { describe, expect, it } from "bun:test";
import {
	GOC_CAI_DAT,
	MUC_CAI_DAT,
	mucCaiDatDangMo,
	NHOM_CAI_DAT,
	nhanCaiDat,
} from "@/lib/cai-dat-dieu-huong";
import { onboardingMessages } from "@/lib/messages/onboarding";

const DAU =
	/[ăâđêôơưàảãáạằẳẵắặầẩẫấậèẻẽéẹềểễếệìỉĩíịòỏõóọồổỗốộờởỡớợùủũúụừửữứựỳỷỹýỵ]/i;
const goc = `/onehub${GOC_CAI_DAT}`;
const dieuPhoi = () => {
	const m = MUC_CAI_DAT.find((x) => x.khoa === "dieuPhoi");
	if (!m) throw new Error("khong co muc dieuPhoi trong thanh ben cai dat");
	return m;
};

describe("thanh ben cai dat", () => {
	it("loi-vao-dieu-phoi: muc dieu phoi dan toi cai dat onboarding, dung cuoi", () => {
		expect(dieuPhoi().href).toBe("/settings/onboarding");
		expect(
			NHOM_CAI_DAT.find((n) => n.khoa === "conNguoi")?.muc.at(-1),
			"dieu phoi khong dung cuoi nhom Con nguoi",
		).toBe(dieuPhoi());
		const onehub = `/onehub${dieuPhoi().href}`;
		expect(mucCaiDatDangMo(onehub, goc, "/onehub/settings/onboarding")).toBe(
			true,
		);
		expect(mucCaiDatDangMo(onehub, goc, "/onehub/settings/sso")).toBe(false);
		expect(mucCaiDatDangMo(goc, goc, "/onehub/settings/onboarding")).toBe(
			false,
		);
	});

	it("nhan-hai-thu-tieng: nhan dieu phoi bang dung tieu de man cai dat", () => {
		for (const locale of ["vi", "en"] as const) {
			expect(
				nhanCaiDat(dieuPhoi(), locale),
				`nhan ${locale} cua muc dieu phoi lech tieu de man cai dat`,
			).toBe(onboardingMessages(locale).settings.title);
		}
		expect(nhanCaiDat(dieuPhoi(), "vi")).toBe("Điều phối 30 ngày");
		expect(nhanCaiDat(dieuPhoi(), "en")).toBe("Onboarding");
		for (const m of MUC_CAI_DAT) {
			expect(nhanCaiDat(m, "vi").length).toBeGreaterThan(0);
			expect(nhanCaiDat(m, "en").length).toBeGreaterThan(0);
		}
		expect(DAU.test(nhanCaiDat(dieuPhoi(), "vi"))).toBe(true);
	});
});
