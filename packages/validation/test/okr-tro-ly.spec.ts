import { describe, expect, test } from "bun:test";
import { KIEU_KR as KIEU_KR_DB } from "@crm/db/okr-xu-huong";
import { z } from "zod";
import {
	docTranUsd,
	nacCuaDonVi,
	nacCuaViec,
	OKR_PROGRAM_MAC_DINH,
	type OkrProgram,
	okrProgram,
	okrProgramSua,
} from "../src/okr-chuong-trinh";
import { khoaDong } from "../src/okr-kiem-de-xuat";
import { KIEU_KR } from "../src/okr-kr";
import {
	type DongSoan,
	dongDeXuat,
	dongSoan,
	dongSoanTuHang,
	HANG_SOAN,
	hangTuDongSoan,
	ketQuaTroLy,
	nopDeXuat,
	okrTroLyViec,
	trangThaiDeXuat,
	VIEC_TRO_LY,
	type ViecTroLy,
} from "../src/okr-tro-ly";

const HANG_CU = {
	objectiveCap: 5,
	krCap: 5,
	capMode: "canh-bao",
	scoreScale: "0-1",
	weightsOn: false,
	personalOn: false,
	aiOn: false,
	aiDeXuatPhamVi: "tat",
	aiDeXuatDonVi: [],
	aiTomTatPhamVi: "tat",
	aiTomTatDonVi: [],
	aiTranThangUsd: 9,
	duyetCongBo: false,
};

function coChuoiTuDo(schema: z.ZodType): boolean {
	const def = (
		schema as {
			_zod: {
				def: {
					type: string;
					shape?: Record<string, z.ZodType>;
					innerType?: z.ZodType;
				};
			};
		}
	)._zod.def;
	if (def.type === "string") return true;
	if (def.type === "object" && def.shape)
		return Object.values(def.shape).some(coChuoiTuDo);
	if ((def.type === "nullable" || def.type === "optional") && def.innerType)
		return coChuoiTuDo(def.innerType);
	return false;
}

describe("mac-dinh", () => {
	test("một hàng cấu hình cũ sau migration đọc lên là Trợ lý OKR tắt, trần 9", () => {
		expect(okrProgram.parse(HANG_CU)).toEqual(OKR_PROGRAM_MAC_DINH);
		expect(OKR_PROGRAM_MAC_DINH.aiOn).toBe(false);
		expect(OKR_PROGRAM_MAC_DINH.aiTranThangUsd).toBe(9);
		expect(okrProgram.parse(HANG_CU), "hang cu doc len soan tat").toMatchObject(
			{
				aiSoanPhamVi: "tat",
				aiSoanDonVi: [],
				aiSoanAnPhamVi: "tat",
				aiSoanAnDonVi: [],
				aiTranThangDatOkrUsd: null,
			},
		);
	});

	test("parse hỏng nêu tên trường, không nuốt thành rỗng", () => {
		const r = trangThaiDeXuat.safeParse("la");
		expect(r.success).toBe(false);
		const p = okrProgram.safeParse({ ...HANG_CU, aiDeXuatPhamVi: "moi-noi" });
		expect(
			p.success ? [] : p.error.issues.map((i) => i.path.join(".")),
		).toEqual(["aiDeXuatPhamVi"]);
	});
});

describe("khuon-khong-chu", () => {
	test("kết quả về gốc không có trường chữ tự do", () => {
		expect(coChuoiTuDo(ketQuaTroLy)).toBe(false);
	});

	test("đối chứng: khuôn có chuỗi thì bộ dò thấy", () => {
		expect(coChuoiTuDo(z.object({ a: z.string() }))).toBe(true);
	});

	test("khuôn đầu vào và đầu ra chuyển sang JSON Schema không vòng $ref, gốc object", () => {
		for (const k of [nopDeXuat, ketQuaTroLy, okrTroLyViec.options[0]]) {
			const s = z.toJSONSchema(k, { target: "draft-7" });
			expect(s.type).toBe("object");
			expect(JSON.stringify(s)).not.toContain("$ref");
		}
		expect(
			JSON.stringify(
				z.toJSONSchema(z.object({ a: z.json() }), { target: "draft-7" }),
			),
		).toContain("$ref");
	});
});

describe("tran-nhap", () => {
	test("dấu phẩy và dấu chấm thập phân; âm, chữ, quá 20 bị chặn", () => {
		expect(
			["7,5", "7.50", "0", "20", "-1", "abc", "21", "7,555"].map(docTranUsd),
		).toEqual([7.5, 7.5, 0, 20, null, null, null, null]);
	});

	test("mọi trần hai số lẻ từ 0 tới 20 đều lưu được", () => {
		const hong = Array.from({ length: 2001 }, (_, i) => i / 100).filter(
			(n) => !okrProgram.shape.aiTranThangUsd.safeParse(n).success,
		);
		expect(hong).toEqual([]);
		expect(["8,2", "1,1", "9.2", "2,3"].map(docTranUsd)).toEqual([
			8.2, 1.1, 9.2, 2.3,
		]);
		expect(okrProgram.shape.aiTranThangUsd.safeParse(1.005).success).toBe(
			false,
		);
	});
});

describe("don-vi-duoc-bat", () => {
	const ct = (p: Partial<OkrProgram>): OkrProgram => ({
		...OKR_PROGRAM_MAC_DINH,
		aiOn: true,
		...p,
	});
	const phongA = { onehub: false, boPhanId: "bp-b", phongBanId: "pb-a" };
	const phongNgoai = { onehub: false, boPhanId: "bp-c", phongBanId: "pb-x" };
	const onehub = { onehub: true, boPhanId: null, phongBanId: null };

	test("ma trận viết trước", () => {
		const o = [
			[ct({ aiOn: false, aiDeXuatPhamVi: "toan-cong-ty" }), phongA, "tat"],
			[ct({ aiDeXuatPhamVi: "tat" }), phongA, "viec-tat"],
			[
				ct({ aiDeXuatPhamVi: "danh-sach", aiDeXuatDonVi: [] }),
				phongA,
				"don-vi-chua-bat",
			],
			[
				ct({ aiDeXuatPhamVi: "danh-sach", aiDeXuatDonVi: ["bp-b"] }),
				phongA,
				"bat",
			],
			[
				ct({ aiDeXuatPhamVi: "danh-sach", aiDeXuatDonVi: ["bp-b"] }),
				phongNgoai,
				"don-vi-chua-bat",
			],
			[
				ct({ aiDeXuatPhamVi: "danh-sach", aiDeXuatDonVi: ["onehub"] }),
				onehub,
				"bat",
			],
			[ct({ aiDeXuatPhamVi: "toan-cong-ty" }), phongNgoai, "bat"],
		] as const;
		expect(o.map(([c, d]) => nacCuaDonVi(c, "de-xuat", d))).toEqual(
			o.map(([, , m]) => m),
		);
		const rong = nacCuaDonVi(
			ct({ aiDeXuatPhamVi: "danh-sach", aiDeXuatDonVi: [] }),
			"de-xuat",
			phongA,
		);
		if (rong === "bat") throw new Error("rong la tat ca");
	});

	test("hai việc tách phạm vi", () => {
		const c = ct({
			aiDeXuatPhamVi: "danh-sach",
			aiDeXuatDonVi: ["onehub"],
			aiTomTatPhamVi: "toan-cong-ty",
		});
		expect([
			nacCuaDonVi(c, "de-xuat", phongA),
			nacCuaDonVi(c, "tom-tat-tuan", phongA),
		]).toEqual(["don-vi-chua-bat", "bat"]);
	});
});

describe("nac", () => {
	const DON_VI = {
		OneHub: { onehub: true, boPhanId: null, phongBanId: null },
		"bo phan B": { onehub: false, boPhanId: "bp-b", phongBanId: null },
		"phong trong B": { onehub: false, boPhanId: "bp-b", phongBanId: "pb-b1" },
		"phong ngoai B": { onehub: false, boPhanId: "bp-c", phongBanId: "pb-c1" },
		"ca nhan trong B": {
			onehub: false,
			boPhanId: "bp-b",
			phongBanId: "pb-b2",
		},
	} as const;

	const PHAM_VI = {
		tat: { phamVi: "tat", donVi: [] },
		"toan-cong-ty": { phamVi: "toan-cong-ty", donVi: [] },
		"danh-sach[]": { phamVi: "danh-sach", donVi: [] },
		"danh-sach[onehub]": { phamVi: "danh-sach", donVi: ["onehub"] },
		"danh-sach[bp-b]": { phamVi: "danh-sach", donVi: ["bp-b"] },
	} as const;

	const NAC = {
		V: "viec-tat",
		C: "don-vi-chua-bat",
		A: "an",
		B: "bat",
	} as const;

	const BANG_BAT = {
		tat: {
			tat: "VVVVV",
			"toan-cong-ty": "AAAAA",
			"danh-sach[]": "CCCCC",
			"danh-sach[onehub]": "ACCCC",
			"danh-sach[bp-b]": "CAACA",
		},
		"toan-cong-ty": {
			tat: "BBBBB",
			"toan-cong-ty": "BBBBB",
			"danh-sach[]": "BBBBB",
			"danh-sach[onehub]": "BBBBB",
			"danh-sach[bp-b]": "BBBBB",
		},
		"danh-sach[]": {
			tat: "CCCCC",
			"toan-cong-ty": "AAAAA",
			"danh-sach[]": "CCCCC",
			"danh-sach[onehub]": "ACCCC",
			"danh-sach[bp-b]": "CAACA",
		},
		"danh-sach[onehub]": {
			tat: "BCCCC",
			"toan-cong-ty": "BAAAA",
			"danh-sach[]": "BCCCC",
			"danh-sach[onehub]": "BCCCC",
			"danh-sach[bp-b]": "BAACA",
		},
		"danh-sach[bp-b]": {
			tat: "CBBCB",
			"toan-cong-ty": "ABBAB",
			"danh-sach[]": "CBBCB",
			"danh-sach[onehub]": "ABBCB",
			"danh-sach[bp-b]": "CBBCB",
		},
	} satisfies Record<
		keyof typeof PHAM_VI,
		Record<keyof typeof PHAM_VI, string>
	>;

	const cauHinh = (
		viec: ViecTroLy,
		aiOn: boolean,
		bat: keyof typeof PHAM_VI,
		an: keyof typeof PHAM_VI,
	): OkrProgram => {
		const b = PHAM_VI[bat];
		const a = PHAM_VI[an];
		const goc = { ...OKR_PROGRAM_MAC_DINH, aiOn };
		if (viec === "de-xuat")
			return {
				...goc,
				aiDeXuatPhamVi: b.phamVi,
				aiDeXuatDonVi: [...b.donVi],
				aiDeXuatAnPhamVi: a.phamVi,
				aiDeXuatAnDonVi: [...a.donVi],
			};
		if (viec === "tom-tat-tuan")
			return {
				...goc,
				aiTomTatPhamVi: b.phamVi,
				aiTomTatDonVi: [...b.donVi],
				aiTomTatAnPhamVi: a.phamVi,
				aiTomTatAnDonVi: [...a.donVi],
			};
		return {
			...goc,
			aiSoanPhamVi: b.phamVi,
			aiSoanDonVi: [...b.donVi],
			aiSoanAnPhamVi: a.phamVi,
			aiSoanAnDonVi: [...a.donVi],
		};
	};

	test("nac: ma trận toàn phần aiOn × Bật cho × Chế độ ẩn cho × đơn vị, bật thắng ẩn", () => {
		const tenPhamVi = Object.keys(PHAM_VI) as (keyof typeof PHAM_VI)[];
		const tenDonVi = Object.keys(DON_VI) as (keyof typeof DON_VI)[];
		const lech: string[] = [];
		let soO = 0;
		let soKhangDinh = 0;
		for (const viec of VIEC_TRO_LY) {
			for (const aiOn of [false, true]) {
				for (const bat of tenPhamVi) {
					for (const an of tenPhamVi) {
						const ct = cauHinh(viec, aiOn, bat, an);
						tenDonVi.forEach((dv, i) => {
							soO += 1;
							const chu = BANG_BAT[bat][an][i] as keyof typeof NAC;
							const mong = aiOn ? NAC[chu] : "tat";
							const ra = nacCuaDonVi(ct, viec, DON_VI[dv]);
							soKhangDinh += 1;
							if (ra !== mong) {
								lech.push(
									`${viec} aiOn=${aiOn} bat=${bat} an=${an} × ${dv}: mong ${mong}, ra ${ra}`,
								);
							}
						});
					}
				}
			}
		}
		console.log(`nac: ${soO} o, ${soKhangDinh} khang dinh`);
		expect(lech).toEqual([]);
		expect(soKhangDinh).toBe(soO);
		expect(soO).toBe(VIEC_TRO_LY.length * 2 * 5 * 5 * 5);
	});

	test("nac: không có đơn vị, việc chỉ bật chế độ ẩn đọc là ẩn, không là việc tắt", () => {
		const ct = (p: Partial<OkrProgram>) =>
			okrProgram.parse({ ...OKR_PROGRAM_MAC_DINH, aiOn: true, ...p });
		expect([
			nacCuaViec(
				ct({ aiOn: false, aiDeXuatPhamVi: "toan-cong-ty" }),
				"de-xuat",
			),
			nacCuaViec(ct({ aiDeXuatPhamVi: "toan-cong-ty" }), "de-xuat"),
			nacCuaViec(
				ct({ aiDeXuatPhamVi: "danh-sach", aiDeXuatDonVi: ["onehub"] }),
				"de-xuat",
			),
			nacCuaViec(ct({ aiDeXuatAnPhamVi: "toan-cong-ty" }), "de-xuat"),
			nacCuaViec(ct({ aiDeXuatAnPhamVi: "toan-cong-ty" }), "tom-tat-tuan"),
			nacCuaViec(ct({}), "de-xuat"),
		]).toEqual(["tat", "bat", "bat", "an", "viec-tat", "viec-tat"]);
	});

	test("nac: hàng cấu hình cũ không có bốn trường ẩn đọc ra cả hai việc tắt", () => {
		const ct = okrProgram.parse(HANG_CU);
		expect({
			deXuat: [ct.aiDeXuatPhamVi, ct.aiDeXuatAnPhamVi, ct.aiDeXuatAnDonVi],
			tomTat: [ct.aiTomTatPhamVi, ct.aiTomTatAnPhamVi, ct.aiTomTatAnDonVi],
		}).toEqual({ deXuat: ["tat", "tat", []], tomTat: ["tat", "tat", []] });
		expect(ct).toEqual(OKR_PROGRAM_MAC_DINH);
	});

	test("nac: sửa một phần không tự đặt lại bốn trường ẩn", () => {
		expect(okrProgramSua.parse({ aiOn: true })).toEqual({ aiOn: true });
	});

	test("nac: việc đề xuất cũ không mang nấc đọc là bật; nấc tắt không nhận", () => {
		const viec = {
			viec: "de-xuat",
			objectiveId: "mt",
			keyResultId: null,
			nguoiYeuCau: "u",
			inputHash: "h",
		};
		const cu = okrTroLyViec.parse(viec);
		expect(cu.viec === "de-xuat" ? cu.nac : null).toBe("bat");
		expect(okrTroLyViec.safeParse({ ...viec, nac: "an" }).success).toBe(true);
		expect(okrTroLyViec.safeParse({ ...viec, nac: "tat" }).success).toBe(false);
	});
});

describe("kieu-kr", () => {
	test("sáu kiểu KR của hàm xu hướng khớp khuôn KR", () => {
		expect([...KIEU_KR_DB]).toEqual([...KIEU_KR]);
	});
});

describe("dong-soan", () => {
	const mtMoi: DongSoan = {
		loai: "muc-tieu-moi",
		cuocSoanId: "cs1",
		khoa: "mt-1",
		ten: "Giao hàng đúng hẹn trên tuyến Bắc",
		viSaoLucNay: "Quý này mở thêm kho vệ tinh.",
		loaiMucTieu: "cam-ket",
		viSao: "Đúng hẹn là điều đối tác nhắc nhiều nhất.",
		canChinhId: null,
		dich: null,
	};
	const krMoi: DongSoan = {
		loai: "kr-moi",
		cuocSoanId: "cs1",
		khoa: "kr-1",
		chaKhoa: "mt-1",
		ten: "Giảm thời gian giao trung bình",
		kieu: "giam-xuong",
		donVi: "giờ",
		khoiDiemGoiY: 36,
		viSao: "Kỳ trước chốt 36 giờ.",
		dich: null,
	};
	const ccMoi: DongSoan = {
		loai: "can-chinh-moi",
		cuocSoanId: "cs1",
		khoa: "cc-1",
		chaKhoa: "mt-1",
		targetObjectiveId: "mt-cap-tren",
		targetKeyResultId: null,
		viSao: "Nối vào Mục tiêu tăng trưởng miền Bắc của Khối.",
		dich: null,
	};

	test("ba loại dòng mới qua dongDeXuat; đích luôn null; căn chỉnh mới cần đúng một đích", () => {
		for (const d of [mtMoi, krMoi, ccMoi])
			expect(dongDeXuat.parse(d)).toEqual(d);
		expect(
			dongSoan.safeParse({ ...krMoi, dich: 10 }).success,
			"dich khac null lot",
		).toBe(false);
		expect(
			dongSoan.safeParse({ ...ccMoi, targetKeyResultId: "kr-x" }).success,
			"can chinh hai dich lot",
		).toBe(false);
		expect(
			dongSoan.safeParse({ ...krMoi, donVi: "" }).success,
			"kr-moi thieu don vi phai parse duoc de ghi bi-loai",
		).toBe(true);
	});

	test("khoaDong: muc-tieu-moi và kr-moi theo tên chuẩn hoá, can-chinh-moi theo cha và đích", () => {
		expect(khoaDong(mtMoi)).toBe(
			"muc-tieu-moi:giao hàng đúng hẹn trên tuyến bắc",
		);
		expect(
			khoaDong({ ...krMoi, ten: "  GIẢM   thời gian giao trung bình " }),
		).toBe("kr-moi:giảm thời gian giao trung bình");
		expect(khoaDong(ccMoi)).toBe("can-chinh-moi:mt-1:mt-cap-tren");
	});

	test("hangTuDongSoan ↔ dongSoanTuHang: đi một vòng không mất trường; hàng soạn không có Mục tiêu và việc", () => {
		for (const d of [mtMoi, krMoi, ccMoi]) {
			const hang = hangTuDongSoan(d, "phien-eve-1");
			expect(hang.objectiveId, "objectiveId phai la chuoi rong").toBe(
				HANG_SOAN.objectiveId,
			);
			expect(hang.taskId).toBe("phien-eve-1");
			expect(hang.dich).toBeNull();
			expect(hang.lyDo).toBe(d.viSao);
			expect(dongSoanTuHang(hang)).toEqual(d);
		}
		expect(() =>
			dongSoanTuHang({
				...hangTuDongSoan(krMoi, "phien-eve-1"),
				loai: "muc-tieu-moi",
			}),
		).toThrow(/hang soan lech/);
	});
});
