import { describe, expect, test } from "bun:test";
import {
	KHOA_LO_TRINH_DU_LIEU,
	loTrinhDuLieu,
	phanTichLoTrinh,
} from "../src/lo-trinh-du-lieu";

const hang = {
	ma: "LT1",
	cau_giao: "«x»",
	hang: "T2",
	nhom: "crm-chung",
	dung_tren: [],
	trang_thai: "Chưa mở",
	nhom_trang_thai: "chua-bat-dau",
	ho_so: null,
	theo_loi: false,
	co: [],
	bat_khi: "",
	vi_sao: "",
};
const goc = {
	khuon: "lo-trinh-du-lieu",
	phien_ban: 1,
	nguon: ["a.json"],
	ngoai_lo_trinh: [],
	lo_trinh: [
		{
			tep: "a.json",
			ten: "OKR",
			loi: null,
			hang_ke: null,
			can_sua: [],
			tien_do: { tong: 1, da_giao: 0, dang_lam: 0, chua_bat_dau: 1, khac: 0 },
			hang: [hang],
			moc: [],
			da_bac: [],
		},
	],
};

describe("lo-trinh-du-lieu", () => {
	test("doc khoi dung khuon", () => {
		expect(phanTichLoTrinh(goc)).toEqual({
			ok: true,
			duLieu: loTrinhDuLieu.parse(goc),
		});
	});
	test("sai kieu tra duong khoa", () => {
		const hong = { ...goc, lo_trinh: [{ ...goc.lo_trinh[0], hang: "x" }] };
		const kq = phanTichLoTrinh(hong);
		expect(kq.ok).toBe(false);
		if (!kq.ok) expect(kq.duongKhoa).toBe("lo_trinh.0.hang");
	});
	test("khoa la bi bo, khong vo", () => {
		const kq = phanTichLoTrinh({ ...goc, la: 1 });
		expect(kq.ok).toBe(true);
	});
	test("bang khoa du muoi bon cap cua ban 2 co gio may", () => {
		expect(Object.keys(KHOA_LO_TRINH_DU_LIEU).sort()).toEqual([
			"can_sua",
			"chu_kho",
			"da_bac",
			"du_kien",
			"gio_may",
			"gio_may_moc",
			"goc",
			"hang",
			"hang_ke",
			"lo_trinh",
			"moc",
			"moi_nguoi",
			"tien_do",
			"tom_tat",
		]);
	});
	test("hang thieu tom_tat doc thanh null", () => {
		const kq = phanTichLoTrinh(goc);
		expect(kq.ok).toBe(true);
		if (kq.ok)
			for (const lo of kq.duLieu.lo_trinh)
				for (const h of lo.hang) expect(h.tom_tat).toBeNull();
	});
});
