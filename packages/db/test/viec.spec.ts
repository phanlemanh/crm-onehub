import { describe, expect, it } from "bun:test";
import {
	DO_THI,
	dichDuoc,
	hanhDong,
	parseVetViec,
	quyenDoi,
	TRANG_THAI_VIEC,
	VIEC,
} from "../src/viec";

const BANG = {
	CHUA_LAM: { DANG_LAM: "GT", CHO_DANH_GIA: "GT", XONG: "GT", HUY: "G" },
	DANG_LAM: { CHUA_LAM: "GT", CHO_DANH_GIA: "GT", XONG: "GT", HUY: "G" },
	CHO_DANH_GIA: { DANG_LAM: "G", XONG: "G", HUY: "G" },
	XONG: { DANG_LAM: "G" },
	HUY: { CHUA_LAM: "G" },
} as const;

const GIAO = { giao: true, thucHien: false, theoDoi: false };
const LAM = { giao: false, thucHien: true, theoDoi: false };
const THEO = { giao: false, thucHien: false, theoDoi: true };

describe("viec thuan", () => {
	it("do thi: 20 cap khac nhau, 13 hop le, khop bang thiet ke", () => {
		const cap = TRANG_THAI_VIEC.flatMap((n) =>
			TRANG_THAI_VIEC.filter((d) => d !== n).map((d) => [n, d] as const),
		);
		expect(cap).toHaveLength(20);
		const hopLe = cap.filter(([n, d]) => DO_THI[n][d] !== undefined);
		expect(hopLe).toHaveLength(13);
		for (const [n, d] of cap) {
			const mong = (BANG[n] as Record<string, string | undefined>)[d];
			expect(DO_THI[n][d], `${n}-${d}`).toBe(mong);
		}
	});

	it("quyenDoi: nguoi theo doi khong doi duoc o nao, cap sai la khong-hop-le", () => {
		for (const n of TRANG_THAI_VIEC)
			for (const d of TRANG_THAI_VIEC) {
				if (n === d) continue;
				expect(quyenDoi(n, d, THEO)).toBe(
					DO_THI[n][d] === undefined ? "khong-hop-le" : "khong-quyen",
				);
			}
		expect(quyenDoi("CHO_DANH_GIA", "XONG", LAM)).toBe("khong-quyen");
		expect(quyenDoi("CHUA_LAM", "XONG", LAM)).toBe("duoc");
		expect(quyenDoi("CHUA_LAM", "HUY", GIAO)).toBe("duoc");
		expect(dichDuoc("DANG_LAM", LAM)).toEqual([
			"CHUA_LAM",
			"CHO_DANH_GIA",
			"XONG",
		]);
	});

	it("hanhDong: moi cap hop le co cau lam rieng", () => {
		expect(hanhDong("CHUA_LAM", "DANG_LAM")).toBe(VIEC.lam.batDau);
		expect(hanhDong("XONG", "DANG_LAM")).toBe(VIEC.lam.lamLai);
		expect(hanhDong("HUY", "CHUA_LAM")).toBe(VIEC.lam.moLai);
		expect(VIEC.thongDiep.chiNguoiGiao(VIEC.lam.huy)).toBe(
			"Chỉ người giao được huỷ việc.",
		);
		expect(VIEC.thongDiep.khongChuyenDuoc("XONG", "CHUA_LAM")).toBe(
			"Không chuyển được việc từ «Xong» sang «Chưa làm».",
		);
	});

	it("parseVetViec: dung khuon thi doc, sai khuon thi nem co ma vet", () => {
		const dung = parseVetViec({
			id: "v1",
			loai: "doi-trang-thai",
			truoc: { trangThai: "CHUA_LAM" },
			sau: { trangThai: "DANG_LAM" },
		});
		expect(dung.loai).toBe("doi-trang-thai");
		expect(() =>
			parseVetViec({ id: "v2", loai: "doi-han", truoc: 3, sau: null }),
		).toThrow("Vết việc v2 không đọc được");
	});
});
