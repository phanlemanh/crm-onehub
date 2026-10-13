import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db, TrangThaiViec } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import {
	viecBangOutput,
	viecCuaToiNhomOutput,
} from "../src/viec/viec.contracts";
import { donDep, moXuong } from "./support/ke-hoach-gieo";
import {
	batApp,
	demVet,
	doiThu,
	donViec,
	goi,
	nguoi,
	taoThu,
	thoaThuan,
} from "./support/viec-gieo";

const NGAY_MS = 24 * 60 * 60 * 1000;
const MA_TEST_MS = 120_000;
const MA_TRAN_MS = 900_000;

type TT = "CHUA_LAM" | "DANG_LAM" | "CHO_DANH_GIA" | "XONG" | "HUY";
type Nguoi = "giao" | "thucHien" | "theoDoi" | "khac" | "quanTri";

const TT_DS: TT[] = ["CHUA_LAM", "DANG_LAM", "CHO_DANH_GIA", "XONG", "HUY"];
const NGUOI_DS: Nguoi[] = ["giao", "thucHien", "theoDoi", "khac", "quanTri"];

const DUOC: Record<TT, Partial<Record<TT, "G" | "GT">>> = {
	CHUA_LAM: { DANG_LAM: "GT", CHO_DANH_GIA: "GT", XONG: "GT", HUY: "G" },
	DANG_LAM: { CHUA_LAM: "GT", CHO_DANH_GIA: "GT", XONG: "GT", HUY: "G" },
	CHO_DANH_GIA: { DANG_LAM: "G", XONG: "G", HUY: "G" },
	XONG: { DANG_LAM: "G" },
	HUY: { CHUA_LAM: "G" },
};

function thanhCong(n: Nguoi, tu: TT, den: TT): boolean {
	const o = DUOC[tu][den];
	if (o === undefined) return false;
	if (o === "G") return n === "giao";
	return n === "giao" || n === "thucHien";
}

const O = NGUOI_DS.flatMap((n) =>
	TT_DS.flatMap((tu) =>
		TT_DS.filter((den) => den !== tu).map((den) => ({
			n,
			tu,
			den,
			ok: thanhCong(n, tu, den),
		})),
	),
);

const SO_O_THANH_CONG = 19;

let app: NestExpressApplication;

beforeAll(async () => {
	await moXuong();
	app = await batApp();
});

afterAll(async () => {
	await app.close();
	await donViec();
	await donDep();
});

async function bang(userId: string, nhom: string) {
	const r = await goi(app, "viec.bang", "query", { nhom }, userId);
	if (r.status !== 200) throw new Error(`kv: bang loi ${JSON.stringify(r)}`);
	return viecBangOutput.parse(r.data);
}

function cotCua(b: Awaited<ReturnType<typeof bang>>, tt: string) {
	const c = b.cot.find((x) => x.trangThai === tt);
	if (!c) throw new Error(`kv: thieu cot ${tt}`);
	return c;
}

async function datTrangThai(
	viecId: string,
	giaoId: string,
	tt: TT,
	now = new Date(),
): Promise<void> {
	if (tt === "CHUA_LAM") return;
	await doiThu(viecId, giaoId, tt as TrangThaiViec, now);
}

describe("kv-bang", () => {
	test(
		"kv-bang: bốn cột theo thứ tự, Xong 7 ngày, Huỷ chỉ đếm",
		async () => {
			const a = await nguoi("kv-a", "member");
			const b = await nguoi("kv-b", "member");
			const { dealId } = await thoaThuan(app, a.id, "KV Bang");
			const gan = [{ loai: "deal" as const, id: dealId }];
			const tao = (tieuDe: string) =>
				taoThu({ nguoiId: a.id, nguoiThucHienId: b.id, tieuDe, gan });
			const now = Date.now();
			await tao("kv-bang chua lam");
			const dang = await tao("kv-bang dang lam");
			await doiThu(dang.id, a.id, TrangThaiViec.DANG_LAM);
			const cho = await tao("kv-bang cho danh gia");
			await doiThu(cho.id, a.id, TrangThaiViec.CHO_DANH_GIA);
			const homQua = await tao("kv-bang xong hom qua");
			await doiThu(
				homQua.id,
				a.id,
				TrangThaiViec.XONG,
				new Date(now - NGAY_MS),
			);
			const cu = await tao("kv-bang xong 10 ngay");
			await doiThu(
				cu.id,
				a.id,
				TrangThaiViec.XONG,
				new Date(now - 10 * NGAY_MS),
			);
			const huy = await tao("kv-bang huy");
			await doiThu(huy.id, a.id, TrangThaiViec.HUY);

			const ra = await bang(b.id, "giao-cho-toi");
			const thuTu = ra.cot.map((c) => c.trangThai);
			if (
				JSON.stringify(thuTu) !==
				JSON.stringify(["CHUA_LAM", "DANG_LAM", "CHO_DANH_GIA", "XONG"])
			) {
				throw new Error(`kv: cot sai thu tu ${JSON.stringify(thuTu)}`);
			}
			const xong = cotCua(ra, "XONG");
			const maXong = xong.viec.map((v) => v.id);
			if (!maXong.includes(homQua.id) || maXong.includes(cu.id)) {
				throw new Error("kv: cot xong sai cua so");
			}
			if (xong.tong !== 2) throw new Error(`kv: tong xong sai ${xong.tong}`);
			const moiCot = ra.cot.flatMap((c) => c.viec.map((v) => v.id));
			if (ra.soHuy !== 1 || moiCot.includes(huy.id)) {
				throw new Error("kv: huy lot vao bang");
			}
			const ds = await goi(
				app,
				"viec.cuaToi",
				"query",
				{ nhom: "giao-cho-toi" },
				b.id,
			);
			const cuaToi = viecCuaToiNhomOutput.parse(ds.data);
			if (!cuaToi.daXong.some((v) => v.id === cu.id)) {
				throw new Error("kv: doi chung danh sach mat viec xong");
			}
		},
		MA_TEST_MS,
	);
});

describe("kv-keo", () => {
	test(
		"kv-keo: kéo và chọn menu ghi đúng trạng thái, cột đo và nguồn",
		async () => {
			const a = await nguoi("kv-a", "member");
			const b = await nguoi("kv-b", "member");
			const { dealId } = await thoaThuan(app, a.id, "KV Keo");
			const gan = [{ loai: "deal" as const, id: dealId }];
			const v = await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: b.id,
				tieuDe: `kv-keo ${Date.now()}`,
				gan,
			});
			const r = await goi(
				app,
				"viec.keo",
				"mutation",
				{ id: v.id, den: "DANG_LAM", thuTu: [v.id], nguon: "bang-keo" },
				b.id,
			);
			expect(r.status, JSON.stringify(r)).toBe(200);
			const sau = await db.viec.findUniqueOrThrow({ where: { id: v.id } });
			if (sau.trangThai !== "DANG_LAM") {
				throw new Error("kv: keo khong doi trang thai");
			}
			if (sau.roiChuaLamLuc === null) {
				throw new Error("kv: keo khong ghi roiChuaLamLuc");
			}
			const vet = await db.viecVet.findMany({
				where: { viecId: v.id, loai: "doi-trang-thai" },
			});
			const d = vet[0];
			if (
				vet.length !== 1 ||
				d?.nguoiId !== b.id ||
				JSON.stringify(d?.truoc) !==
					JSON.stringify({ trangThai: "CHUA_LAM" }) ||
				JSON.stringify(d?.sau) !== JSON.stringify({ trangThai: "DANG_LAM" }) ||
				d?.nguon !== "bang-keo"
			) {
				throw new Error(`kv: vet keo sai ${JSON.stringify(vet)}`);
			}
			await goi(
				app,
				"viec.keo",
				"mutation",
				{ id: v.id, den: "CHO_DANH_GIA", thuTu: [v.id], nguon: "bang-menu" },
				b.id,
			);
			const moi = await db.viecVet.findFirst({
				where: { viecId: v.id, loai: "doi-trang-thai" },
				orderBy: { luc: "desc" },
			});
			if (moi?.nguon !== "bang-menu") {
				throw new Error("kv: vet menu sai nguon");
			}
			const v2 = await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: b.id,
				tieuDe: `kv-keo web ${Date.now()}`,
				gan,
			});
			await goi(
				app,
				"viec.doiTrangThai",
				"mutation",
				{ id: v2.id, den: "DANG_LAM" },
				b.id,
			);
			const web = await db.viecVet.findFirst({
				where: { viecId: v2.id, loai: "doi-trang-thai" },
			});
			if (web?.nguon !== "web") throw new Error("kv: nguon web bi doi");
		},
		MA_TEST_MS,
	);
});

describe("kv-ma-tran", () => {
	test(
		"kv-ma-tran: 5 người × 20 cặp = 100 ô, kéo trùng đổi trạng thái; chuyenDuoc 12 hàng",
		async () => {
			const giao = await nguoi("kv-mt-giao", "member");
			const thucHien = await nguoi("kv-mt-th", "member");
			const theoDoi = await nguoi("kv-mt-td", "member");
			const khac = await nguoi("kv-mt-khac", "member");
			const quanTri = await nguoi("kv-mt-qt", "admin");
			const ma: Record<Nguoi, string> = {
				giao: giao.id,
				thucHien: thucHien.id,
				theoDoi: theoDoi.id,
				khac: khac.id,
				quanTri: quanTri.id,
			};
			const { dealId } = await thoaThuan(app, giao.id, "KV Ma tran");
			const gan = [{ loai: "deal" as const, id: dealId }];
			const moi = async (tt: TT, nhan: string) => {
				const v = await taoThu({
					nguoiId: giao.id,
					nguoiThucHienId: thucHien.id,
					nguoiTheoDoiIds: [theoDoi.id],
					tieuDe: `kv-mt ${nhan} ${Date.now()}`,
					gan,
				});
				await datTrangThai(v.id, giao.id, tt);
				return v.id;
			};
			let soAssert = 0;
			let soThanhCong = 0;
			for (const o of O) {
				const vDoi = await moi(o.tu, `${o.n} ${o.tu} ${o.den} doi`);
				const vKeo = await moi(o.tu, `${o.n} ${o.tu} ${o.den} keo`);
				const rDoi = await goi(
					app,
					"viec.doiTrangThai",
					"mutation",
					{ id: vDoi, den: o.den },
					ma[o.n],
				);
				const vetTruoc = await demVet(vKeo);
				const rKeo = await goi(
					app,
					"viec.keo",
					"mutation",
					{ id: vKeo, den: o.den, thuTu: [vKeo], nguon: "bang-keo" },
					ma[o.n],
				);
				const a = {
					ok: rDoi.status === 200,
					code: rDoi.code,
					message: rDoi.message,
				};
				const b = {
					ok: rKeo.status === 200,
					code: rKeo.code,
					message: rKeo.message,
				};
				if (JSON.stringify(a) !== JSON.stringify(b)) {
					throw new Error(
						`kv: o ${o.n} ${o.tu}->${o.den} lech ${JSON.stringify({ doi: a, keo: b })}`,
					);
				}
				if (a.ok !== o.ok) {
					throw new Error(
						`kv: o ${o.n} ${o.tu}->${o.den} lech ${JSON.stringify({ can: o.ok, thay: a })}`,
					);
				}
				if (!b.ok) {
					const thuTu = await db.viecThuTu.count({ where: { viecId: vKeo } });
					if ((await demVet(vKeo)) !== vetTruoc || thuTu !== 0) {
						throw new Error(`kv: o tu choi van ghi ${o.n} ${o.tu}->${o.den}`);
					}
				}
				if (b.ok) soThanhCong++;
				soAssert++;
			}
			if (soAssert !== 100) throw new Error(`kv: ma tran thieu o ${soAssert}`);
			if (soThanhCong !== SO_O_THANH_CONG) {
				throw new Error(`kv: so o thanh cong ${soThanhCong}`);
			}

			const HANG: { n: Nguoi; nhom: string }[] = [
				{ n: "giao", nhom: "toi-giao" },
				{ n: "thucHien", nhom: "giao-cho-toi" },
				{ n: "theoDoi", nhom: "dang-theo-doi" },
			];
			const COT_BANG: TT[] = ["CHUA_LAM", "DANG_LAM", "CHO_DANH_GIA", "XONG"];
			const theoTT = new Map<TT, string>();
			for (const tt of COT_BANG) theoTT.set(tt, await moi(tt, `bang ${tt}`));
			let soHang = 0;
			for (const h of HANG) {
				const ra = await bang(ma[h.n], h.nhom);
				for (const tt of COT_BANG) {
					const id = theoTT.get(tt);
					const the = cotCua(ra, tt).viec.find((v) => v.id === id);
					if (!the)
						throw new Error(`kv: chuyenDuoc lech ${h.n} ${tt} khong co the`);
					const can = TT_DS.filter(
						(den) => den !== tt && thanhCong(h.n, tt, den),
					).sort();
					const thay = [...the.chuyenDuoc].sort();
					if (JSON.stringify(can) !== JSON.stringify(thay)) {
						throw new Error(
							`kv: chuyenDuoc lech ${h.n} ${tt} ${JSON.stringify({ can, thay })}`,
						);
					}
					soHang++;
				}
			}
			if (soHang !== 12) throw new Error(`kv: chuyenDuoc thieu hang ${soHang}`);
		},
		MA_TRAN_MS,
	);
});

describe("kv-thu-tu", () => {
	test(
		"kv-thu-tu: kéo lên đầu cột giữ thứ tự riêng, không vết, không thành lịch sử",
		async () => {
			const a = await nguoi("kv-tt-a", "member");
			const b = await nguoi("kv-tt-b", "member");
			const x = await nguoi("kv-tt-x", "member");
			const now = Date.now();
			const tao = (tieuDe: string, han: number) =>
				taoThu({
					nguoiId: a.id,
					nguoiThucHienId: b.id,
					tieuDe,
					hanNgay: new Date(now + han * NGAY_MS),
					gan: [],
				});
			const v1 = await tao("kv-tt V1", 1);
			const v2 = await tao("kv-tt V2", 2);
			const v3 = await tao("kv-tt V3", 3);
			const rieng = await taoThu({
				nguoiId: x.id,
				tieuDe: "kv-tt rieng X",
				gan: [],
			});
			const vetTruoc = await db.viecVet.count({
				where: { viecId: { in: [v1.id, v2.id, v3.id] } },
			});
			const r = await goi(
				app,
				"viec.keo",
				"mutation",
				{
					id: v3.id,
					den: "CHUA_LAM",
					thuTu: [v3.id, rieng.id, v1.id, v2.id],
					nguon: "bang-keo",
				},
				b.id,
			);
			expect(r.status, JSON.stringify(r)).toBe(200);
			const cotB = cotCua(await bang(b.id, "giao-cho-toi"), "CHUA_LAM")
				.viec.map((v) => v.id)
				.filter((id) => [v1.id, v2.id, v3.id].includes(id));
			if (JSON.stringify(cotB) !== JSON.stringify([v3.id, v1.id, v2.id])) {
				throw new Error(`kv: thu tu khong giu ${JSON.stringify(cotB)}`);
			}
			const cotA = cotCua(await bang(a.id, "toi-giao"), "CHUA_LAM")
				.viec.map((v) => v.id)
				.filter((id) => [v1.id, v2.id, v3.id].includes(id));
			if (JSON.stringify(cotA) !== JSON.stringify([v1.id, v2.id, v3.id])) {
				throw new Error("kv: thu tu lan sang nguoi khac");
			}
			const vetSau = await db.viecVet.count({
				where: { viecId: { in: [v1.id, v2.id, v3.id] } },
			});
			if (vetSau !== vetTruoc) throw new Error("kv: sap xep ghi vet");
			const khoa = await db.viecThuTu.count({ where: { userId: b.id } });
			if (khoa !== 3) throw new Error(`kv: khoa thu tu sai so ${khoa}`);
			const la = await db.viecThuTu.count({ where: { viecId: rieng.id } });
			if (la !== 0) throw new Error("kv: khoa ghi cho viec khong thay");
			const xoa = await goi(app, "viec.xoa", "mutation", { id: v3.id }, a.id);
			if (xoa.status !== 200) throw new Error("kv: sap xep lam co lich su");
			const v4 = await tao("kv-tt V4", 9);
			const dau = cotCua(await bang(b.id, "giao-cho-toi"), "CHUA_LAM").viec[0];
			if (dau?.id !== v4.id) throw new Error("kv: viec moi khong len dau");
		},
		MA_TEST_MS,
	);
});

describe("kv-tranh-chap", () => {
	test(
		"kv-tranh-chap: kéo việc vừa bị huỷ bị từ chối, không ghi gì",
		async () => {
			const a = await nguoi("kv-tc-a", "member");
			const b = await nguoi("kv-tc-b", "member");
			const v = await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: b.id,
				tieuDe: `kv-tc ${Date.now()}`,
				gan: [],
			});
			await doiThu(v.id, a.id, TrangThaiViec.HUY);
			const r = await goi(
				app,
				"viec.keo",
				"mutation",
				{ id: v.id, den: "DANG_LAM", thuTu: [v.id], nguon: "bang-keo" },
				b.id,
			);
			if (
				r.code !== "BAD_REQUEST" ||
				r.message !== "Không chuyển được việc từ «Huỷ» sang «Đang làm»."
			) {
				throw new Error(`kv: tranh chap sai loi ${JSON.stringify(r)}`);
			}
			const vetB = await db.viecVet.count({
				where: { viecId: v.id, nguoiId: b.id },
			});
			const khoa = await db.viecThuTu.count({ where: { viecId: v.id } });
			if (vetB !== 0 || khoa !== 0) throw new Error("kv: tranh chap van ghi");
			const v5 = await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: b.id,
				tieuDe: `kv-tc v5 ${Date.now()}`,
				gan: [],
			});
			const ok = await goi(
				app,
				"viec.keo",
				"mutation",
				{ id: v5.id, den: "DANG_LAM", thuTu: [v5.id], nguon: "bang-keo" },
				b.id,
			);
			if (ok.status !== 200) throw new Error("kv: doi chung tranh chap hong");
		},
		MA_TEST_MS,
	);
});
