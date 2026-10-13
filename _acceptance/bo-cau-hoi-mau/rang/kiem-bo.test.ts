import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { khuonBo } from "../../tro-ly-doc-kho/rang/quyet-do";
import { BO_MAU } from "./bo-mau-config";
import { khuonBoMau } from "./khuon";
import { demThanhPhan, docTrangMau, kiemBo, type ViPham } from "./kiem-bo";

type CauTho = Record<string, unknown> & { id: string };
type BoTho = { nhan: string; nguon?: string; cau: CauTho[] };

const tho = (): BoTho => JSON.parse(readFileSync(BO_MAU.duong.bo, "utf8"));
const trang = docTrangMau(BO_MAU.duong.trangMau);
const cauCua = (bo: BoTho, id: string): CauTho => {
	const c = bo.cau.find((x) => x.id === id);
	if (!c) throw new Error(`bai thieu cau ${id}`);
	return c;
};
const cua = (ds: ViPham[], luat: ViPham["luat"]) =>
	ds.filter((v) => v.luat === luat);
const gon = (ds: ViPham[]) => ds.map(({ luat, ma }) => ({ luat, ma }));

function moiCa(phaHong: (bo: BoTho) => void): ViPham[] {
	const bo = tho();
	phaHong(bo);
	return kiemBo(bo, trang);
}

describe("khuon", () => {
	test("bo that qua khuonBo cua script cham va khuon chat, 0 vi pham", () => {
		const bo = tho();
		expect(khuonBo.safeParse(bo).success).toBe(true);
		expect(khuonBoMau.safeParse(bo).success).toBe(true);
		expect(cua(kiemBo(bo, trang), "khuon")).toEqual([]);
	});

	const ca: [string, (bo: BoTho) => void, string][] = [
		["khoa la", (bo) => Object.assign(cauCua(bo, "m01"), { xyz: 1 }), "m01"],
		["nhan tam", (bo) => Object.assign(bo, { nhan: "tam" }), "*bo*"],
		[
			"ma trung",
			(bo) => Object.assign(cauCua(bo, "m02"), { id: "m01" }),
			"m01",
		],
		["thieu mau", (bo) => delete cauCua(bo, "m03").mau, "m03"],
		["49 cau", (bo) => bo.cau.splice(49), "*bo*"],
		["khong co nguon", (bo) => delete bo.nguon, "*bo*"],
		[
			"nguon khong noi gia",
			(bo) => Object.assign(bo, { nguon: "Bộ câu do máy soạn" }),
			"*bo*",
		],
	];
	for (const [ten, pha, ma] of ca)
		test(`do: ${ten}`, () => {
			const ds = moiCa(pha);
			expect(gon(ds)).toEqual([{ luat: "khuon", ma }]);
			if (ma !== "*bo*") expect(ds[0]?.cau).toContain(ma);
		});
});

describe("thanh-phan", () => {
	test("bang dem bang dung THANH_PHAN, tong 50, nhom va kho khop tang", () => {
		const bo = khuonBoMau.parse(tho());
		const dem = demThanhPhan(bo);
		expect(dem).toEqual({ ...BO_MAU.thanhPhan, ganTrangS6: BO_MAU.ganTrangS6 });
		expect(Object.values(BO_MAU.thanhPhan).reduce((a, b) => a + b, 0)).toBe(50);
		const anh = {
			S1: { nhom: "co-trang", kho: undefined },
			S2: { nhom: "co-trang", kho: "hai-trang" },
			S3: { nhom: "co-trang", kho: "nguong-ngoai-le" },
			S6: { nhom: "khong-co", kho: undefined },
			S7: { nhom: "khong-dau", kho: undefined },
			"ngoai-kho": { nhom: "khong-phai-quy-dinh", kho: undefined },
		} as const;
		for (const c of bo.cau)
			expect({ id: c.id, nhom: c.nhom, kho: c.kho }).toEqual({
				id: c.id,
				...anh[c.tang],
			});
		expect(cua(kiemBo(tho(), trang), "thanh-phan")).toEqual([]);
	});

	test("do: m40 doi kieu chu viet-tat sang khong-dau", () => {
		const ds = moiCa((bo) =>
			Object.assign(cauCua(bo, "m40"), { kieuChu: "khong-dau" }),
		);
		expect(gon(ds).sort((a, b) => a.ma.localeCompare(b.ma))).toEqual([
			{ luat: "thanh-phan", ma: "S7/khong-dau" },
			{ luat: "thanh-phan", ma: "S7/viet-tat" },
		]);
	});

	test("do: cau S3 mat kho", () => {
		const ds = moiCa((bo) => delete cauCua(bo, "m21").kho);
		expect(gon(ds)).toEqual([{ luat: "thanh-phan", ma: "m21" }]);
		expect(ds[0]?.cau).toContain("m21");
	});
});

describe("trang-mong", () => {
	test("tap trang doc tu thu muc that, bo that 0 vi pham", () => {
		expect(trang.size).toBe(8);
		expect(cua(kiemBo(tho(), trang), "trang-mong")).toEqual([]);
	});

	const ca: [string, (bo: BoTho) => void, string][] = [
		[
			"trang khong co",
			(bo) => Object.assign(cauCua(bo, "m02"), { mong: [["phu-cap-xang"]] }),
			"m02",
		],
		[
			"S2 mot nhom",
			(bo) => Object.assign(cauCua(bo, "m16"), { mong: [["hoa-hong"]] }),
			"m16",
		],
		[
			"bien the khac trang",
			(bo) => Object.assign(cauCua(bo, "m37"), { bienTheCua: "m12" }),
			"m37",
		],
		[
			"ganTrang khong co",
			(bo) => Object.assign(cauCua(bo, "m29"), { ganTrang: "phu-cap-xang" }),
			"m29",
		],
		[
			"S6 co mong",
			(bo) => Object.assign(cauCua(bo, "m33"), { mong: [["bao-mat"]] }),
			"m33",
		],
	];
	for (const [ten, pha, ma] of ca)
		test(`do: ${ten}`, () => {
			const ds = cua(moiCa(pha), "trang-mong");
			expect(gon(ds)).toEqual([{ luat: "trang-mong", ma }]);
			expect(ds[0]?.cau).toContain(ma);
		});
});

describe("y-trong-yeu", () => {
	test("moi y la chuoi con NFC cua trang mong doi, bo that 0 vi pham", () => {
		expect(cua(kiemBo(tho(), trang), "y-trong-yeu")).toEqual([]);
	});

	test("doi chung duong: y viet dang NFD van khop", () => {
		const ds = moiCa((bo) => {
			const c = cauCua(bo, "m03");
			Object.assign(c, { y: (c.y as string[]).map((y) => y.normalize("NFD")) });
		});
		expect(cua(ds, "y-trong-yeu")).toEqual([]);
	});

	const ca: [string, (bo: BoTho) => void, string][] = [
		[
			"sua con so",
			(bo) => {
				const c = cauCua(bo, "m01");
				Object.assign(c, {
					y: (c.y as string[]).map((y) => y.replace("1,2%", "1,5%")),
				});
			},
			"m01",
		],
		[
			"y tu trang khac",
			(bo) =>
				Object.assign(cauCua(bo, "m26"), {
					y: ["Công tác phí trong nước là 300.000 đồng mỗi ngày"],
				}),
			"m26",
		],
		[
			"S6 co y",
			(bo) => Object.assign(cauCua(bo, "m33"), { y: ["Dữ liệu khách hàng"] }),
			"m33",
		],
		["S1 khong co y", (bo) => delete cauCua(bo, "m02").y, "m02"],
	];
	for (const [ten, pha, ma] of ca)
		test(`do: ${ten}`, () => {
			const ds = cua(moiCa(pha), "y-trong-yeu");
			expect(gon(ds)).toEqual([{ luat: "y-trong-yeu", ma }]);
			expect(ds[0]?.cau).toContain(ma);
		});
});

describe("rieng-tu", () => {
	test("bo that 0 vi pham", () => {
		expect(cua(kiemBo(tho(), trang), "rieng-tu")).toEqual([]);
	});

	test("doi chung duong: so trong cau hoi thuong khong bi bat", () => {
		const ds = moiCa((bo) => {
			const c = cauCua(bo, "m01");
			Object.assign(c, {
				cau: `${c.cau} 300.000 đồng, 24 giờ, tầng 2, 31 tháng 3`,
			});
		});
		expect(cua(ds, "rieng-tu")).toEqual([]);
	});

	const ca: [string, string][] = [
		["0912345678", "dien-thoai"],
		["+84 912 345 678", "dien-thoai"],
		["lan.nguyen@congty.vn", "email"],
		["HĐ số 2026/123", "so-hop-dong"],
	];
	for (const [chen, loai] of ca)
		test(`do: ${loai} «${chen}»`, () => {
			const ds = moiCa((bo) => {
				const c = cauCua(bo, "m01");
				Object.assign(c, { cau: `${c.cau} ${chen}` });
			});
			expect(gon(ds)).toEqual([{ luat: "rieng-tu", ma: "m01" }]);
			expect(ds[0]?.cau).toContain(loai);
		});
});

describe("cli", () => {
	const lenh = join(BO_MAU.duong.hoSo, "rang", "kiem-bo.ts");

	test("bo that: thoat 0, in tong va nam luat", () => {
		const r = spawnSync("bun", [lenh], { encoding: "utf8" });
		expect(r.status).toBe(0);
		expect(r.stdout).toContain("bo-mau: 50 cau, 0 vi pham");
		for (const l of [
			"khuon",
			"thanh-phan",
			"trang-mong",
			"y-trong-yeu",
			"rieng-tu",
		])
			expect(r.stdout).toContain(`luat ${l}: 0`);
	});

	test("do: ban sao tro trang khong co thi thoat 1 va ghim luat, ma", () => {
		const thuMuc = mkdtempSync(join(tmpdir(), "bcm-"));
		try {
			const bo = tho();
			Object.assign(cauCua(bo, "m02"), { mong: [["phu-cap-xang"]] });
			const tep = join(thuMuc, "bo.json");
			writeFileSync(tep, JSON.stringify(bo));
			const r = spawnSync("bun", [lenh, "--bo", tep], { encoding: "utf8" });
			expect(r.status).toBe(1);
			expect(r.stdout).toMatch(/trang-mong m02/);
		} finally {
			rmSync(thuMuc, { recursive: true, force: true });
		}
	});
});
