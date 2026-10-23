import { describe, expect, test } from "bun:test";
import {
	choTinHieu,
	doiCho,
	KHOA_CHO_TIN_HIEU,
} from "@crm/validation/tin-hieu-cho";
import { dungKhoiMau } from "./support/khoi-tin-hieu-mau";

const MA = [
	"crm-1",
	"crm-2",
	"crm-3",
	"crm-4",
	"crm-5",
	"crm-6",
	"crm-7",
	"crm-8",
];

const KHOI = dungKhoiMau({
	tinHieu: MA.map((ma) => ({ ma })),
	nhom: [
		{ ma: "n1", ten: "Nhóm một", tinHieu: ["crm-1"] },
		{ ma: "n2", ten: "Nhóm hai", tinHieu: ["crm-2"] },
		{ ma: "n3", ten: "Nhóm ba", tinHieu: ["crm-3"] },
		{ ma: "n4", ten: "Nhóm bốn", tinHieu: ["crm-4"] },
		{ ma: "n5", ten: "Nhóm năm", tinHieu: ["crm-5"] },
	],
	le: [{ ma: "crm-6", lyDo: "trùng" }],
	daPhu: [{ ma: "crm-7", hoSo: "gui-tin-hieu-trong-crm" }],
	hang: [
		{
			ma: "M1",
			cauGiao: "«Việc chưa»",
			phu: ["n1"],
			trangThai: "chua-bat-dau",
		},
		{ ma: "M2", cauGiao: "«Việc đang»", phu: ["n2"], trangThai: "dang-lam" },
		{ ma: "M3", cauGiao: "«Việc giao»", phu: ["n3"], trangThai: "da-giao" },
	],
	chanTroi: [{ ma: "C1", lyDo: "chờ", phu: ["n4"] }],
});

describe("tin-hieu-cho", () => {
	test("khối do kit vẽ cho đúng khoá chỗ của từng loại", () => {
		const kq = choTinHieu(KHOI);
		if (kq.kieu !== "co")
			throw new Error(`khối mẫu không đọc được: ${kq.kieu}`);
		const khoa = Object.fromEntries(
			[...kq.theoMa].map(([ma, c]) => [ma, c.khoa]),
		);
		expect(khoa).toEqual({
			"crm-1": "chua-bat-dau",
			"crm-2": "dang-lam",
			"crm-3": "da-giao",
			"crm-4": "chan-troi",
			"crm-5": "nhom-chua-cat",
			"crm-6": "le",
			"crm-7": "da-phu",
			"crm-8": "cho-gom",
		});
		expect(new Set(Object.values(khoa))).toEqual(
			new Set(KHOA_CHO_TIN_HIEU.filter((k) => k !== "hang-khac")),
		);
		expect(kq.theoMa.get("crm-2")?.tenViec).toBe("Việc đang");
		expect(kq.theoMa.get("crm-5")?.tenNhom).toBe("Nhóm năm");
	});

	test("doiCho chỉ trả mã có chỗ người gửi thấy khác", () => {
		const cu = choTinHieu(
			dungKhoiMau({
				tinHieu: MA.map((ma) => ({ ma })),
				nhom: [{ ma: "n5", ten: "Nhóm năm", tinHieu: ["crm-5"] }],
			}),
		);
		const moi = choTinHieu(KHOI);
		const doi = doiCho(cu, moi).map((d) => d.ma);
		expect(doi.sort()).toEqual(
			["crm-1", "crm-2", "crm-3", "crm-4", "crm-6", "crm-7"].sort(),
		);
	});

	test("bản cũ hay bản mới không đọc được thì không có lần đổi nào", () => {
		const moi = choTinHieu(KHOI);
		const { tin_hieu: _bo, ...khongTinHieu } = KHOI;
		const vang = choTinHieu(khongTinHieu);
		const hong = choTinHieu({ ...KHOI, tin_hieu: [{ id: 1 }] });
		expect(vang.kieu).toBe("khong-co");
		expect(hong.kieu).toBe("hong");
		expect(doiCho(vang, moi)).toEqual([]);
		expect(doiCho(hong, moi)).toEqual([]);
		expect(doiCho(moi, hong)).toEqual([]);
	});
});
