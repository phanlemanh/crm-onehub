import { describe, expect, it } from "bun:test";
import {
	laMucHoiThoai,
	MUC_RAIL,
	mucDangMo,
	nhanRail,
} from "@/lib/khung-dieu-huong";

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

	it("bay muc, nhan vi co dau va khac nhan en", () => {
		expect(MUC_RAIL).toHaveLength(7);
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
});
