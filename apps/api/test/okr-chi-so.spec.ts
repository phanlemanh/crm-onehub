import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { banGhiChiSo, chupKrCrm, demChiSo, khoangKy } from "@crm/db/okr-chi-so";
import {
	BAC_GHI_DANH,
	type BacGhiDanh,
	type DinhNghiaChiSo,
	MA_CHI_SO,
	type MaChiSo,
	type PhamViChiSo,
} from "@crm/validation/okr-chi-so";
import { parseOkrNguon } from "@crm/validation/okr-nguon";
import { gieoSanChiSo, KY, type SanChiSo } from "./okr-so-san";

type PhamViKhoa =
	| "toan-cong-ty"
	| "bo-phan:B1"
	| "bo-phan:B2"
	| "phong-ban:P1"
	| "phong-ban:P2"
	| "phong-ban:P3"
	| "nguoi:a"
	| "nguoi:b"
	| "nguoi:c"
	| "nguoi:d"
	| "nguoi:e";

const MA_TRAN: [MaChiSo, PhamViKhoa, number, BacGhiDanh?][] = [
	["thoa-thuan-chot-duoc", "toan-cong-ty", 4],
	["thoa-thuan-chot-duoc", "bo-phan:B1", 3],
	["thoa-thuan-chot-duoc", "phong-ban:P1", 2],
	["thoa-thuan-chot-duoc", "nguoi:a", 1],
	["thoa-thuan-moi", "toan-cong-ty", 5],
	["thoa-thuan-moi", "bo-phan:B1", 3],
	["thoa-thuan-moi", "phong-ban:P1", 2],
	["thoa-thuan-moi", "nguoi:a", 1],
	["goi-hen-duoc", "toan-cong-ty", 5],
	["goi-hen-duoc", "bo-phan:B1", 4],
	["goi-hen-duoc", "phong-ban:P1", 3],
	["goi-hen-duoc", "nguoi:a", 2],
	["buoc-xong-dung-han", "toan-cong-ty", 5],
	["buoc-xong-dung-han", "bo-phan:B1", 4],
	["buoc-xong-dung-han", "phong-ban:P1", 3],
	["buoc-xong-dung-han", "nguoi:a", 2],
	["ghi-danh-dat-bac", "toan-cong-ty", 3, "tai-khoan"],
	["ghi-danh-dat-bac", "bo-phan:B1", 2, "tai-khoan"],
	["ghi-danh-dat-bac", "phong-ban:P1", 2, "tai-khoan"],
	["ghi-danh-dat-bac", "nguoi:a", 1, "tai-khoan"],
	["form-thanh-ca-nhan", "toan-cong-ty", 5],
	["form-thanh-ca-nhan", "bo-phan:B1", 3],
	["form-thanh-ca-nhan", "phong-ban:P1", 2],
	["form-thanh-ca-nhan", "nguoi:a", 1],
	["email-gui-ra", "toan-cong-ty", 6],
	["email-gui-ra", "bo-phan:B1", 4],
	["email-gui-ra", "phong-ban:P1", 3],
	["email-gui-ra", "nguoi:a", 2],
	["ghi-danh-dat-bac", "toan-cong-ty", 3, "tai-khoan"],
	["ghi-danh-dat-bac", "toan-cong-ty", 4, "khoa-hoc"],
	["ghi-danh-dat-bac", "toan-cong-ty", 2, "hoat-dong"],
	["ghi-danh-dat-bac", "toan-cong-ty", 1, "giao-dich-dau"],
];

const BAC_MAC_DINH = "tai-khoan" satisfies BacGhiDanh;
const PHAM_VI_KHAC: PhamViKhoa[] = [
	"bo-phan:B1",
	"bo-phan:B2",
	"phong-ban:P1",
	"phong-ban:P2",
	"phong-ban:P3",
	"nguoi:a",
	"nguoi:b",
	"nguoi:c",
	"nguoi:d",
	"nguoi:e",
];

let san: SanChiSo;

function phamVi(pv: PhamViKhoa): PhamViChiSo {
	if (pv === "toan-cong-ty") return { kieu: "toan-cong-ty" };
	const [kieu, ten] = pv.split(":");
	if (kieu === "bo-phan") {
		return { kieu, id: san.id.boPhan[ten === "B1" ? "B1" : "B2"] };
	}
	if (kieu === "phong-ban") {
		const pb = ten === "P1" ? "P1" : ten === "P2" ? "P2" : "P3";
		return { kieu, id: san.id.phongBan[pb] };
	}
	const k =
		ten === "a" || ten === "b" || ten === "c" || ten === "d" ? ten : "e";
	return { kieu: "nguoi", id: san.id.nguoi[k] };
}

function dinhNghia(
	chiSo: MaChiSo,
	pv: PhamViKhoa,
	bac?: BacGhiDanh,
): DinhNghiaChiSo {
	const b = bac ?? (chiSo === "ghi-danh-dat-bac" ? BAC_MAC_DINH : undefined);
	return { chiSo, phamVi: phamVi(pv), bac: b };
}

const kyDu = () => khoangKy(KY.startsOn, KY.endsOn, "2026-12-31");

async function idsCua(chiSo: MaChiSo, pv: PhamViKhoa, bac?: BacGhiDanh) {
	const ds = await banGhiChiSo(db, dinhNghia(chiSo, pv, bac), kyDu(), {
		bo: 0,
		lay: 500,
	});
	return ds.dong.map((d) => d.id).sort();
}

describe("dem", () => {
	beforeAll(async () => {
		san = await gieoSanChiSo();
	});

	afterAll(async () => {
		await san.don();
	});

	test("khoangKy lấy ranh giới ngày theo giờ Việt Nam, chặn trên bởi endsOn", () => {
		const iso = (k: { tu: Date; den: Date }) => ({
			tu: k.tu.toISOString(),
			den: k.den.toISOString(),
		});
		expect(iso(khoangKy(KY.startsOn, KY.endsOn, "2026-12-31"))).toEqual({
			tu: "2026-09-30T17:00:00.000Z",
			den: "2026-12-31T17:00:00.000Z",
		});
		expect(iso(khoangKy(KY.startsOn, KY.endsOn, "2026-10-15"))).toEqual({
			tu: "2026-09-30T17:00:00.000Z",
			den: "2026-10-15T17:00:00.000Z",
		});
		expect(iso(khoangKy(KY.startsOn, KY.endsOn, "2027-02-01"))).toEqual({
			tu: "2026-09-30T17:00:00.000Z",
			den: "2026-12-31T17:00:00.000Z",
		});
	});

	test("ma trận viết trước có 32 ô", () => {
		expect(MA_TRAN.length).toBe(32);
	});

	for (const [chiSo, pv, mong, bac] of MA_TRAN) {
		test(`${chiSo} × ${pv}${bac ? ` × ${bac}` : ""}`, async () => {
			const dn = dinhNghia(chiSo, pv, bac);
			const k = kyDu();
			const dem = await demChiSo(db, dn, k);
			const ds = await banGhiChiSo(db, dn, k, { bo: 0, lay: 500 });
			expect({
				o: `${chiSo}×${pv}`,
				dem,
				dong: ds.dong.length,
				tong: ds.tong,
			}).toEqual({ o: `${chiSo}×${pv}`, dem: mong, dong: mong, tong: mong });
		});
	}

	test("bảy ô toàn công ty liệt kê đúng tập bản ghi đã gieo", async () => {
		for (const chiSo of MA_CHI_SO) {
			expect({ chiSo, ids: await idsCua(chiSo, "toan-cong-ty") }).toEqual({
				chiSo,
				ids: [...san.dieuKien[chiSo]].sort(),
			});
		}
		for (const bac of BAC_GHI_DANH) {
			expect({
				bac,
				ids: await idsCua("ghi-danh-dat-bac", "toan-cong-ty", bac),
			}).toEqual({ bac, ids: [...san.ghiDanhTheoBac[bac]].sort() });
		}
	});

	test("form của cá nhân không phụ trách chỉ có ở toàn công ty", async () => {
		const chiSo = "form-thanh-ca-nhan";
		expect(await idsCua(chiSo, "toan-cong-ty")).toContain(san.id.formKhongChu);
		for (const pv of PHAM_VI_KHAC) {
			expect({
				pv,
				co: (await idsCua(chiSo, pv)).includes(san.id.formKhongChu),
			}).toEqual({
				pv,
				co: false,
			});
		}
	});

	test("bo-phan:B1 bằng P1 cộng P2 ở mọi chỉ số", async () => {
		for (const chiSo of MA_CHI_SO) {
			const b1 = await idsCua(chiSo, "bo-phan:B1");
			const p1p2 = [
				...(await idsCua(chiSo, "phong-ban:P1")),
				...(await idsCua(chiSo, "phong-ban:P2")),
			].sort();
			const dem = await demChiSo(db, dinhNghia(chiSo, "bo-phan:B1"), kyDu());
			expect({ chiSo, b1, dem }).toEqual({
				chiSo,
				b1: p1p2,
				dem: p1p2.length,
			});
		}
	});

	test("người e không phòng ban: đếm ở nguoi:e, vắng ở mọi phòng ban", async () => {
		for (const chiSo of ["thoa-thuan-moi", "email-gui-ra"] as const) {
			const cuaE = san.id.cuaE[chiSo];
			expect({ chiSo, ids: await idsCua(chiSo, "nguoi:e") }).toEqual({
				chiSo,
				ids: [cuaE],
			});
			expect(await demChiSo(db, dinhNghia(chiSo, "nguoi:e"), kyDu())).toBe(1);
			expect(await idsCua(chiSo, "toan-cong-ty")).toContain(cuaE);
			for (const pv of [
				"bo-phan:B1",
				"bo-phan:B2",
				"phong-ban:P1",
				"phong-ban:P2",
				"phong-ban:P3",
			] as const) {
				expect({
					chiSo,
					pv,
					co: (await idsCua(chiSo, pv)).includes(cuaE),
				}).toEqual({
					chiSo,
					pv,
					co: false,
				});
			}
		}
	});

	test("thư gửi từ địa chỉ viết hoa vẫn là email gửi ra của thành viên", async () => {
		expect(await idsCua("email-gui-ra", "nguoi:a")).toContain(
			san.id.thuVietHoa,
		);
	});

	test("trang nối nhau bằng đúng danh sách đầy đủ", async () => {
		const dn = dinhNghia("email-gui-ra", "toan-cong-ty");
		const du = await banGhiChiSo(db, dn, kyDu(), { bo: 0, lay: 500 });
		const trang = [];
		for (let bo = 0; bo < du.tong; bo += 2) {
			const t = await banGhiChiSo(db, dn, kyDu(), { bo, lay: 2 });
			expect(t.tong).toBe(du.tong);
			trang.push(...t.dong);
		}
		expect(trang).toEqual(du.dong);
	});

	test("chupKrCrm ghi một dòng mỗi ngày, chép định nghĩa, số hiện tại theo ngày mới nhất", async () => {
		const kr = san.id.kr;
		const chup = (ngay: string) => chupKrCrm(db, kr, ngay, parseOkrNguon);
		const hienTai = async () =>
			Number(
				(
					await db.okrKeyResult.findUniqueOrThrow({
						where: { id: kr },
						select: { currentValue: true },
					})
				).currentValue,
			);
		expect(await chup("2026-10-15")).toEqual({ ghi: 1, giaTri: 1 });
		expect(await hienTai()).toBe(1);
		expect(await chup("2026-10-15")).toEqual({ ghi: 0, giaTri: 1 });
		expect(await chup("2026-12-31")).toEqual({ ghi: 1, giaTri: 2 });
		expect(await hienTai()).toBe(2);
		expect(await chup("2026-11-01")).toEqual({ ghi: 1, giaTri: 1 });
		expect(await hienTai()).toBe(2);
		const dong = await db.okrSoChup.findMany({
			where: { keyResultId: kr },
			orderBy: { ngay: "asc" },
			select: {
				ngay: true,
				giaTri: true,
				nguon: true,
				chiSo: true,
				phamVi: true,
				bac: true,
			},
		});
		expect(
			dong.map((d) => ({
				...d,
				ngay: d.ngay.toISOString().slice(0, 10),
				giaTri: Number(d.giaTri),
			})),
		).toEqual(
			(
				[
					["2026-10-15", 1],
					["2026-11-01", 1],
					["2026-12-31", 2],
				] as const
			).map(([ngay, giaTri]) => ({
				ngay,
				giaTri,
				nguon: "crm",
				chiSo: "thoa-thuan-chot-duoc",
				phamVi: { kieu: "phong-ban", id: san.id.phongBan.P1 },
				bac: null,
			})),
		);
	});
});
