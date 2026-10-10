import { describe, expect, it } from "bun:test";
import {
	laMucHoiThoai,
	MUC_RAIL,
	mucDangMo,
	nhanRail,
} from "@/lib/khung-dieu-huong";
import { onboardingMessages } from "@/lib/messages/onboarding";

const DAU =
	/[ăâđêôơưàảãáạằẳẵắặầẩẫấậèẻẽéẹềểễếệìỉĩíịòỏõóọồổỗốộờởỡớợùủũúụừửữứựỳỷỹýỵ]/i;
const wu = (p: string) => `/onehub${p === "/" ? "" : p}`;
const muc = (key: string) => {
	const m = MUC_RAIL.find((x) => x.key === key);
	if (!m) throw new Error(`khong co muc ${key}`);
	return m;
};

describe("khung dieu huong", () => {
	it("muc hoi thoai nhan ra bang khoa, khong bang nhan", () => {
		expect(laMucHoiThoai(muc("chat"))).toBe(true);
		expect(MUC_RAIL.filter(laMucHoiThoai)).toHaveLength(1);
		expect(laMucHoiThoai({ ...muc("chat"), key: "deals" })).toBe(false);
	});

	it("tam muc, nhan vi co dau va khac nhan en", () => {
		expect(MUC_RAIL).toHaveLength(11);
		for (const m of MUC_RAIL) {
			const vi = nhanRail(m, "vi");
			expect(vi).not.toBe(nhanRail(m, "en"));
			expect(DAU.test(vi)).toBe(true);
		}
	});

	it("muc dang mo theo pathname cua workspace", () => {
		expect(mucDangMo(muc("overview"), "/onehub", wu)).toBe(true);
		expect(mucDangMo(muc("overview"), "/onehub/deals", wu)).toBe(false);
		expect(mucDangMo(muc("chat"), "/onehub/chat/abc", wu)).toBe(true);
		expect(mucDangMo(muc("chat"), "/onehub/agents/x", wu)).toBe(true);
		expect(mucDangMo(muc("companies"), "/onehub/companies/y", wu)).toBe(true);
		expect(mucDangMo(muc("companies"), "/onehub/contacts", wu)).toBe(false);
	});

	it("loi-vao-30-ngay: muc 30 ngay dau dan toi man danh muc", () => {
		const dieuPhoi = muc("onboarding");
		expect(dieuPhoi.href).toBe("/onboarding");
		expect(dieuPhoi.match).toBe("prefix");
		expect(MUC_RAIL.indexOf(dieuPhoi)).toBe(MUC_RAIL.indexOf(muc("okr")) - 1);
		expect(MUC_RAIL.indexOf(muc("okr"))).toBe(
			MUC_RAIL.indexOf(muc("taiLieu")) - 1,
		);
	});

	it("muc-tieu: sau 30 ngay dau, truoc cai dat, nhan Muc tieu/Objectives", () => {
		const mucTieu = muc("okr");
		expect(mucTieu.href).toBe("/okr");
		expect(mucTieu.match).toBe("prefix");
		expect(MUC_RAIL.indexOf(mucTieu)).toBe(
			MUC_RAIL.indexOf(muc("onboarding")) + 1,
		);
		expect(MUC_RAIL.indexOf(mucTieu)).toBe(
			MUC_RAIL.indexOf(muc("taiLieu")) - 1,
		);
		expect(nhanRail(mucTieu, "vi")).toBe("Mục tiêu");
		expect(nhanRail(mucTieu, "en")).toBe("Objectives");
	});

	it("tai-lieu: sau muc tieu, ngay truoc lo trinh, nhan Tai lieu/Documents", () => {
		const taiLieu = muc("taiLieu");
		expect(taiLieu.href).toBe("/tai-lieu");
		expect(taiLieu.match).toBe("prefix");
		expect(MUC_RAIL.indexOf(taiLieu)).toBe(
			MUC_RAIL.indexOf(muc("loTrinh")) - 1,
		);
		expect(nhanRail(taiLieu, "vi")).toBe("Tài liệu");
		expect(nhanRail(taiLieu, "en")).toBe("Documents");
	});

	it("lo-trinh: sau tai lieu, ngay truoc cai dat, nhan Lo trinh/Roadmap", () => {
		const loTrinh = muc("loTrinh");
		expect(loTrinh.href).toBe("/lo-trinh");
		expect(loTrinh.match).toBe("prefix");
		expect(MUC_RAIL.indexOf(loTrinh)).toBe(
			MUC_RAIL.indexOf(muc("settings")) - 1,
		);
		expect(nhanRail(loTrinh, "vi")).toBe("Lộ trình");
		expect(nhanRail(loTrinh, "en")).toBe("Roadmap");
		expect(mucDangMo(loTrinh, "/onehub/lo-trinh", wu)).toBe(true);
		expect(mucDangMo(loTrinh, "/onehub/okr", wu)).toBe(false);
	});

	it("danh-dau-dang-mo: 30 ngay dau sang o danh muc va ho so, khong o cai dat", () => {
		const dieuPhoi = muc("onboarding");
		expect(mucDangMo(dieuPhoi, "/onehub/onboarding", wu)).toBe(true);
		expect(mucDangMo(dieuPhoi, "/onehub/onboarding/ke-hoach-1", wu)).toBe(true);
		expect(mucDangMo(dieuPhoi, "/onehub/settings/onboarding", wu)).toBe(false);
		expect(mucDangMo(dieuPhoi, "/onehub/deals", wu)).toBe(false);
		expect(mucDangMo(muc("settings"), "/onehub/settings/onboarding", wu)).toBe(
			true,
		);
	});

	it("nhan-hai-thu-tieng: nhan 30 ngay dau bang dung tieu de man danh muc", () => {
		const dieuPhoi = muc("onboarding");
		for (const locale of ["vi", "en"] as const) {
			expect(
				nhanRail(dieuPhoi, locale),
				`nhan ${locale} cua muc 30 ngay dau lech tieu de man danh muc`,
			).toBe(onboardingMessages(locale).title);
		}
		expect(nhanRail(dieuPhoi, "vi")).toBe("30 ngày đầu");
		expect(nhanRail(dieuPhoi, "en")).toBe("First 30 days");
	});
});
