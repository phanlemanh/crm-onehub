import { afterAll, beforeAll, describe, test } from "bun:test";
import { db, TrangThaiViec } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { viecBangOutput, viecConOutput } from "../src/viec/viec.contracts";
import type { DauVao } from "./ma-tran-thu";
import { donDep, moXuong } from "./support/ke-hoach-gieo";
import {
	batApp,
	doiThu,
	donViec,
	goi,
	nguoi,
	taoThu,
	thoaThuan,
} from "./support/viec-gieo";

const MA_TEST_MS = 180_000;

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
	if (r.status !== 200) throw new Error(`vca: bang loi ${JSON.stringify(r)}`);
	return viecBangOutput.parse(r.data);
}

async function theCua(userId: string, nhom: string, id: string) {
	for (const c of (await bang(userId, nhom)).cot) {
		const t = c.viec.find((v) => v.id === id);
		if (t) return t;
	}
	throw new Error(`vca: bang khong co the ${id} ${nhom}`);
}

async function conCua(userId: string, id: string) {
	const r = await goi(app, "viec.con", "query", { id }, userId);
	if (r.status !== 200) throw new Error(`vca: con loi ${JSON.stringify(r)}`);
	return viecConOutput.parse(r.data);
}

async function ghi(ten: string, input: DauVao, userId: string) {
	const r = await goi(app, ten, "mutation", input, userId);
	if (r.status !== 200) throw new Error(`vca: ${ten} loi ${JSON.stringify(r)}`);
	return r.data as { id: string };
}

async function demHang() {
	const [viec, gan, theoDoi, vet] = await Promise.all([
		db.viec.count(),
		db.viecGan.count(),
		db.viecTheoDoi.count(),
		db.viecVet.count(),
	]);
	return JSON.stringify({ viec, gan, theoDoi, vet });
}

/** P gắn D (giao a, làm b, theo dõi w); b thêm con K cho c; x không vai. */
async function dungChaCon(nhan: string) {
	const a = await nguoi(`${nhan}-a`, "member");
	const b = await nguoi(`${nhan}-b`, "member");
	const w = await nguoi(`${nhan}-w`, "member");
	const c = await nguoi(`${nhan}-c`, "member");
	const x = await nguoi(`${nhan}-x`, "member");
	const { dealId } = await thoaThuan(app, a.id, `VCA ${nhan}`);
	const tieuDe = `${nhan} P ${Date.now()}`;
	const p = await taoThu({
		nguoiId: a.id,
		nguoiThucHienId: b.id,
		nguoiTheoDoiIds: [w.id],
		tieuDe,
		gan: [{ loai: "deal", id: dealId }],
	});
	const k = await ghi(
		"viec.taoCon",
		{ chaId: p.id, tieuDe: `${nhan} K`, nguoiThucHienId: c.id },
		b.id,
	);
	return { a, b, w, c, x, dealId, p, k, tieuDe };
}

describe("vca-ma-tran", () => {
	test(
		"vca-ma-tran: mười ô người × trạng thái cha của viec.con, đáp án viết sẵn",
		async () => {
			const f = await dungChaCon("vca-mt");
			const DAP_AN = [
				{ nguoi: "a", trangThaiCha: "gan", thayCha: true },
				{ nguoi: "b", trangThaiCha: "gan", thayCha: true },
				{ nguoi: "w", trangThaiCha: "gan", thayCha: true },
				{ nguoi: "c", trangThaiCha: "gan", thayCha: true },
				{ nguoi: "x", trangThaiCha: "gan", thayCha: true },
				{ nguoi: "a", trangThaiCha: "rieng", thayCha: true },
				{ nguoi: "b", trangThaiCha: "rieng", thayCha: true },
				{ nguoi: "w", trangThaiCha: "rieng", thayCha: true },
				{ nguoi: "c", trangThaiCha: "rieng", thayCha: false },
				{ nguoi: "x", trangThaiCha: "rieng", thayCha: false },
			] as const;
			const ma = { a: f.a, b: f.b, w: f.w, c: f.c, x: f.x };
			let daSo = 0;
			for (const trangThaiCha of ["gan", "rieng"] as const) {
				if (trangThaiCha === "rieng") {
					await ghi("viec.go", { id: f.p.id, dealId: f.dealId }, f.a.id);
				}
				for (const o of DAP_AN.filter((d) => d.trangThaiCha === trangThaiCha)) {
					const du = await conCua(ma[o.nguoi].id, f.k.id);
					const ten = `vca-mt-${o.nguoi}`;
					if (o.thayCha) {
						if (du.cha?.id !== f.p.id || du.cha.tieuDe !== f.tieuDe) {
							throw new Error(
								`vca: o ${ten} ${trangThaiCha} mat cha ${JSON.stringify(du.cha)}`,
							);
						}
					} else {
						if (du.cha !== null) {
							throw new Error(`vca: cha lo ${ten} ${JSON.stringify(du.cha)}`);
						}
						if (du.con.length !== 0 || du.conMo !== 0 || du.themDuoc) {
							throw new Error(`vca: o an sai hinh ${JSON.stringify(du)}`);
						}
					}
					daSo += 1;
				}
			}
			if (daSo !== 10) throw new Error(`vca: ma tran thieu o ${daSo}`);
		},
		MA_TEST_MS,
	);
});

describe("vca-bang", () => {
	test(
		"vca-bang: thẻ con trên bảng không mang tiêu đề cha người xem không thấy",
		async () => {
			const f = await dungChaCon("vca-bg");
			const truoc = await theCua(f.c.id, "giao-cho-toi", f.k.id);
			if (truoc.cha?.tieuDe !== f.tieuDe) {
				throw new Error("vca: bang doi chung mat cha");
			}
			await ghi("viec.go", { id: f.p.id, dealId: f.dealId }, f.a.id);
			const sauC = await theCua(f.c.id, "giao-cho-toi", f.k.id);
			if (sauC.cha !== null) {
				throw new Error(`vca: bang lo cha ${JSON.stringify(sauC.cha)}`);
			}
			const sauB = await theCua(f.b.id, "toi-giao", f.k.id);
			if (sauB.cha?.tieuDe !== f.tieuDe) {
				throw new Error("vca: bang nguoi trong cuoc mat cha");
			}
		},
		MA_TEST_MS,
	);
});

/** P2 riêng (giao a, làm b); b thêm K1 (Xong), K2, K3 cho c; a bỏ theo dõi K3. */
async function dungDemCon(nhan: string) {
	const a = await nguoi(`${nhan}-a`, "member");
	const b = await nguoi(`${nhan}-b`, "member");
	const c = await nguoi(`${nhan}-c`, "member");
	const p2 = await taoThu({
		nguoiId: a.id,
		nguoiThucHienId: b.id,
		tieuDe: `${nhan} P2 ${Date.now()}`,
		gan: [],
	});
	const con = async (ten: string) =>
		ghi(
			"viec.taoCon",
			{ chaId: p2.id, tieuDe: `${nhan} ${ten}`, nguoiThucHienId: c.id },
			b.id,
		);
	const k1 = await con("K1");
	await con("K2");
	const k3 = await con("K3");
	const k5 = await con("K5");
	await doiThu(k1.id, c.id, TrangThaiViec.XONG);
	await doiThu(k5.id, b.id, TrangThaiViec.HUY);
	await ghi("viec.boTheoDoi", { id: k3.id }, a.id);
	const docK3 = await goi(app, "viec.get", "query", { id: k3.id }, a.id);
	if (
		docK3.status !== 404 ||
		docK3.message !== `Không có việc nào mang mã ${k3.id}.`
	) {
		throw new Error("vca: fixture K3 van thay");
	}
	return { a, b, c, p2 };
}

describe("vca-dem-con", () => {
	test(
		"vca-dem-con: thẻ cha chỉ đếm con người xem thấy",
		async () => {
			const { a, b, p2 } = await dungDemCon("vca-dc");
			const theA = await theCua(a.id, "toi-giao", p2.id);
			if (
				JSON.stringify(theA.con) !== JSON.stringify({ xong: 1, tong: 2 }) ||
				theA.conMo !== 1
			) {
				throw new Error(
					`vca: dem con lo ${JSON.stringify({ ...theA.con, conMo: theA.conMo })}`,
				);
			}
			const theB = await theCua(b.id, "giao-cho-toi", p2.id);
			if (
				JSON.stringify(theB.con) !== JSON.stringify({ xong: 1, tong: 3 }) ||
				theB.conMo !== 2
			) {
				throw new Error(
					`vca: doi chung dem con ${JSON.stringify({ ...theB.con, conMo: theB.conMo })}`,
				);
			}
			if ((await db.viec.count({ where: { chaId: p2.id } })) !== 4) {
				throw new Error("vca: con bi xoa");
			}
		},
		MA_TEST_MS,
	);
});

describe("vca-khop-khung", () => {
	test(
		"vca-khop-khung: số trên thẻ bảng khớp viec.con của cùng người",
		async () => {
			const { a, b, c, p2 } = await dungDemCon("vca-kk");
			if (!(await conCua(b.id, p2.id)).con.some((k) => k.trangThai === "HUY")) {
				throw new Error("vca: fixture thieu con huy");
			}
			for (const [ten, u, nhom] of [
				["vca-kk-b", b, "giao-cho-toi"],
				["vca-kk-a", a, "toi-giao"],
			] as const) {
				const the = await theCua(u.id, nhom, p2.id);
				const du = await conCua(u.id, p2.id);
				const khongHuy = du.con.filter((k) => k.trangThai !== "HUY");
				const khung = {
					tong: khongHuy.length,
					xong: khongHuy.filter((k) => k.trangThai === "XONG").length,
					conMo: du.conMo,
				};
				const tren = {
					tong: the.con?.tong ?? 0,
					xong: the.con?.xong ?? 0,
					conMo: the.conMo,
				};
				if (JSON.stringify(khung) !== JSON.stringify(tren)) {
					throw new Error(
						`vca: bang lech khung ${ten} ${JSON.stringify({ khung, tren })}`,
					);
				}
			}

			const p3 = await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: b.id,
				tieuDe: `vca-kk P3 ${Date.now()}`,
				gan: [],
			});
			const k4 = await ghi(
				"viec.taoCon",
				{ chaId: p3.id, tieuDe: "vca-kk K4", nguoiThucHienId: c.id },
				b.id,
			);
			await ghi("viec.boTheoDoi", { id: k4.id }, a.id);
			const p3B = await theCua(b.id, "giao-cho-toi", p3.id);
			if (JSON.stringify(p3B.con) !== JSON.stringify({ xong: 0, tong: 1 })) {
				throw new Error(`vca: doi chung P3 ${JSON.stringify(p3B.con)}`);
			}
			const p3A = await theCua(a.id, "toi-giao", p3.id);
			if (p3A.con !== null || p3A.conMo !== 0) {
				throw new Error(
					`vca: con an het van dem ${JSON.stringify({ con: p3A.con, conMo: p3A.conMo })}`,
				);
			}
			const dong = await goi(
				app,
				"viec.doiTrangThai",
				"mutation",
				{ id: p3.id, den: "XONG" },
				a.id,
			);
			if (dong.status !== 200) {
				throw new Error(`vca: dong P3 loi ${JSON.stringify(dong)}`);
			}
			const k4Sau = await db.viec.findUniqueOrThrow({ where: { id: k4.id } });
			if (k4Sau.trangThai !== TrangThaiViec.CHUA_LAM) {
				throw new Error("vca: dong cha cham con");
			}
		},
		MA_TEST_MS,
	);
});

describe("vca-tinh-luc-doc", () => {
	test(
		"vca-tinh-luc-doc: câu đọc không ghi; gắn lại thì cha hiện lại",
		async () => {
			const f = await dungChaCon("vca-td");
			await ghi("viec.go", { id: f.p.id, dealId: f.dealId }, f.a.id);
			if ((await conCua(f.c.id, f.k.id)).cha !== null) {
				throw new Error("vca: fixture cha chua an");
			}
			const truoc = await demHang();
			for (let i = 0; i < 5; i += 1) {
				await conCua(f.c.id, f.k.id);
				await bang(f.c.id, "giao-cho-toi");
			}
			const sau = await demHang();
			if (truoc !== sau) throw new Error(`vca: cau doc ghi ${truoc} ${sau}`);

			await ghi("viec.gan", { id: f.p.id, dealId: f.dealId }, f.a.id);
			if ((await conCua(f.c.id, f.k.id)).cha?.tieuDe !== f.tieuDe) {
				throw new Error("vca: gan lai khong hien cha viec.con");
			}
			if (
				(await theCua(f.c.id, "giao-cho-toi", f.k.id)).cha?.tieuDe !== f.tieuDe
			) {
				throw new Error("vca: gan lai khong hien cha viec.bang");
			}
		},
		MA_TEST_MS,
	);
});

describe("vca-quet", () => {
	test(
		"vca-quet: sáu câu đọc người làm việc con chạm được không mang tên hay mã việc cha riêng",
		async () => {
			const f = await dungChaCon("vca-q");
			const dau = f.tieuDe;
			const CAU_DOC = [
				{ ten: "viec.get", input: { id: f.k.id } },
				{ ten: "viec.lichSu", input: { id: f.k.id } },
				{ ten: "viec.con", input: { id: f.k.id } },
				{ ten: "viec.bang", input: { nhom: "giao-cho-toi" } },
				{ ten: "viec.cuaToi", input: { nhom: "giao-cho-toi" } },
				{ ten: "viec.cuaBanGhi", input: { dealId: f.dealId } },
			] as const;
			const doc = async () => {
				const ra = new Map<string, string>();
				for (const c of CAU_DOC) {
					const r = await goi(app, c.ten, "query", c.input, f.c.id);
					if (r.status !== 200) {
						throw new Error(`vca: quet loi ${c.ten} ${JSON.stringify(r)}`);
					}
					ra.set(c.ten, JSON.stringify(r.data));
				}
				return ra;
			};
			const truoc = await doc();
			for (const ten of ["viec.con", "viec.bang"]) {
				if (!truoc.get(ten)?.includes(dau)) {
					throw new Error(`vca: quet doi chung mat cha ${ten}`);
				}
			}
			await ghi("viec.go", { id: f.p.id, dealId: f.dealId }, f.a.id);
			const sau = await doc();
			let daQuet = 0;
			for (const c of CAU_DOC) {
				const json = sau.get(c.ten) ?? "";
				if (json.includes(dau) || json.includes(f.p.id)) {
					throw new Error(`vca: quet lo ${c.ten}`);
				}
				daQuet += 1;
			}
			if (daQuet !== 6) throw new Error(`vca: quet thieu cau ${daQuet}`);
		},
		MA_TEST_MS,
	);
});
