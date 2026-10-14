import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db, TrangThaiViec } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { viecBangOutput } from "../src/viec/viec.contracts";
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

const NGAY_MS = 24 * 60 * 60 * 1000;
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

function ngayMai(): string {
	return ngayVN(new Date(Date.now() + NGAY_MS));
}

async function bang(userId: string, nhom: string) {
	const r = await goi(app, "viec.bang", "query", { nhom }, userId);
	if (r.status !== 200) throw new Error(`kv: bang loi ${JSON.stringify(r)}`);
	return viecBangOutput.parse(r.data);
}

function theTren(b: Awaited<ReturnType<typeof bang>>, id: string) {
	for (const c of b.cot) {
		const t = c.viec.find((v) => v.id === id);
		if (t) return { cot: c.trangThai, the: t };
	}
	return null;
}

async function demBang() {
	const [viec, gan, theoDoi, vet] = await Promise.all([
		db.viec.count(),
		db.viecGan.count(),
		db.viecTheoDoi.count(),
		db.viecVet.count(),
	]);
	return JSON.stringify({ viec, gan, theoDoi, vet });
}

async function taoCon(
	userId: string,
	chaId: string,
	tieuDe: string,
	nguoiThucHienId?: string,
) {
	return goi(
		app,
		"viec.taoCon",
		"mutation",
		nguoiThucHienId
			? { chaId, tieuDe, nguoiThucHienId, hanNgay: ngayMai() }
			: { chaId, tieuDe, hanNgay: ngayMai() },
		userId,
	);
}

describe("kv-con-tao", () => {
	test(
		"kv-con-tao: người thực hiện tách việc con — một hàng, mang gắn, người cha theo dõi, vết trên cha",
		async () => {
			const a = await nguoi("kv-con-a", "member");
			const b = await nguoi("kv-con-b", "member");
			const c = await nguoi("kv-con-c", "member");
			const { dealId } = await thoaThuan(app, a.id, "KV Con");
			const p = await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: b.id,
				tieuDe: `kv-con P ${Date.now()}`,
				gan: [{ loai: "deal", id: dealId }],
			});
			const q = await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: b.id,
				tieuDe: `kv-con Q ${Date.now()}`,
				gan: [{ loai: "deal", id: dealId }],
			});
			const r = await taoCon(b.id, p.id, "KV con", c.id);
			expect(r.status, JSON.stringify(r)).toBe(200);
			const con = await db.viec.findMany({ where: { chaId: p.id } });
			if (con.length !== 1) throw new Error("kv: con khong ra dung mot hang");
			const k = con[0];
			if (!k) throw new Error("kv: con khong ra dung mot hang");
			if (k.nguoiGiaoId !== b.id)
				throw new Error("kv: con sai truong nguoiGiaoId");
			if (k.nguoiThucHienId !== c.id) {
				throw new Error("kv: con sai truong nguoiThucHienId");
			}
			if (k.trangThai !== "CHUA_LAM")
				throw new Error("kv: con sai truong trangThai");
			const gan = await db.viecGan.findMany({ where: { viecId: k.id } });
			if (gan.length !== 1 || gan[0]?.dealId !== dealId) {
				throw new Error("kv: con khong mang gan cha");
			}
			const theo = await db.viecTheoDoi.findMany({ where: { viecId: k.id } });
			const maTheo = theo.map((t) => t.userId).sort();
			if (JSON.stringify(maTheo) !== JSON.stringify([a.id])) {
				throw new Error(`kv: nguoi theo doi con sai ${JSON.stringify(maTheo)}`);
			}
			const vetCha = await db.viecVet.findMany({
				where: { viecId: p.id, loai: "them-viec-con" },
			});
			const sau = vetCha[0]?.sau as { tieuDe?: string } | null | undefined;
			if (
				vetCha.length !== 1 ||
				vetCha[0]?.nguoiId !== b.id ||
				sau?.tieuDe !== "KV con"
			) {
				throw new Error("kv: thieu vet them con");
			}
			const bangC = theTren(await bang(c.id, "giao-cho-toi"), k.id);
			if (
				bangC?.cot !== "CHUA_LAM" ||
				bangC.the.cha?.tieuDe !==
					(await db.viec.findUniqueOrThrow({ where: { id: p.id } })).tieuDe
			) {
				throw new Error("kv: con khong len bang nguoi nhan");
			}
			const bangB = await bang(b.id, "giao-cho-toi");
			const theP = theTren(bangB, p.id)?.the;
			if (JSON.stringify(theP?.con) !== JSON.stringify({ xong: 0, tong: 1 })) {
				throw new Error(`kv: dem con sai ${JSON.stringify(theP?.con)}`);
			}
			if (theTren(bangB, q.id)?.the.con !== null) {
				throw new Error("kv: viec khong con co dem");
			}
			await goi(app, "viec.go", "mutation", { id: p.id, dealId }, a.id);
			const ganSau = await db.viecGan.count({
				where: { viecId: k.id, dealId },
			});
			const docK = await goi(app, "viec.get", "query", { id: k.id }, c.id);
			if (ganSau !== 1 || docK.status !== 200) {
				throw new Error("kv: con mat gan khi cha go gan");
			}
		},
		MA_TEST_MS,
	);
});

describe("kv-con-quyen", () => {
	test(
		"kv-con-quyen: sáu ca bị chặn có lời ghim, không ghi gì; con của việc riêng thấy đúng người",
		async () => {
			const a = await nguoi("kv-cq-a", "member");
			const b = await nguoi("kv-cq-b", "member");
			const c = await nguoi("kv-cq-c", "member");
			const w = await nguoi("kv-cq-w", "member");
			const x = await nguoi("kv-cq-x", "member");
			const okr = await nguoi("kv-cq-okr", "okr");
			const tenOkr = (
				await db.user.findUniqueOrThrow({ where: { id: okr.id } })
			).name;
			const { dealId } = await thoaThuan(app, a.id, "KV Con quyen");
			const gan = [{ loai: "deal" as const, id: dealId }];
			const p = await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: b.id,
				nguoiTheoDoiIds: [w.id],
				tieuDe: `kv-cq P ${Date.now()}`,
				gan,
			});
			const k = await taoCon(b.id, p.id, "kv-cq K", c.id);
			const kId = (k.data as { id: string }).id;
			const p2 = await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: b.id,
				tieuDe: `kv-cq P2 ${Date.now()}`,
				gan: [],
			});
			const p3 = await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: b.id,
				tieuDe: `kv-cq P3 ${Date.now()}`,
				gan,
			});
			await doiThu(p3.id, a.id, TrangThaiViec.XONG);

			const CA = [
				{
					ten: "con-cua-con",
					goi: () => taoCon(c.id, kId, "kv-cq con cua con"),
					code: "BAD_REQUEST",
					loi: "Việc con không có việc con.",
				},
				{
					ten: "theo-doi",
					goi: () => taoCon(w.id, p.id, "kv-cq w"),
					code: "FORBIDDEN",
					loi: "Chỉ người giao và người thực hiện được thêm việc con.",
				},
				{
					ten: "thanh-vien-khac",
					goi: () => taoCon(x.id, p.id, "kv-cq x"),
					code: "FORBIDDEN",
					loi: "Chỉ người giao và người thực hiện được thêm việc con.",
				},
				{
					ten: "khong-thay",
					goi: () => taoCon(x.id, p2.id, "kv-cq x rieng"),
					code: "NOT_FOUND",
					loi: `Không có việc nào mang mã ${p2.id}.`,
				},
				{
					ten: "vai-okr",
					goi: () => taoCon(b.id, p.id, "kv-cq okr", okr.id),
					code: "BAD_REQUEST",
					loi: tenOkr,
				},
				{
					ten: "cha-da-khep",
					goi: () => taoCon(b.id, p3.id, "kv-cq khep"),
					code: "BAD_REQUEST",
					loi: "Chỉ thêm việc con cho việc đang mở.",
				},
			];
			for (const ca of CA) {
				const truoc = await demBang();
				const r = await ca.goi();
				const dung =
					r.code === ca.code &&
					(ca.ten === "vai-okr"
						? r.message.includes(ca.loi) && r.message.includes("chỉ OKR")
						: r.message === ca.loi);
				if (!dung) {
					throw new Error(`kv: con quyen ${ca.ten} ${JSON.stringify(r)}`);
				}
				if ((await demBang()) !== truoc) {
					throw new Error(`kv: con bi chan van ghi ${ca.ten}`);
				}
			}
			const xoa = await goi(app, "viec.xoa", "mutation", { id: p.id }, a.id);
			if (xoa.code !== "CONFLICT") {
				throw new Error(`kv: con quyen xoa-cha ${JSON.stringify(xoa)}`);
			}

			const k2 = await taoCon(b.id, p2.id, "kv-cq K2", c.id);
			const k2Id = (k2.data as { id: string }).id;
			const docA = await goi(app, "viec.get", "query", { id: k2Id }, a.id);
			const theoA = await bang(a.id, "dang-theo-doi");
			if (docA.status !== 200 || !theTren(theoA, k2Id)) {
				throw new Error("kv: nguoi giao cha khong thay con rieng");
			}
			const docX = await goi(app, "viec.get", "query", { id: k2Id }, x.id);
			if (docX.code !== "NOT_FOUND") throw new Error("kv: con rieng lot");
		},
		MA_TEST_MS,
	);
});

describe("kv-dong-cha", () => {
	test(
		"kv-dong-cha: đếm con bỏ Huỷ; đóng cha không chạm con",
		async () => {
			const a = await nguoi("kv-dc-a", "member");
			const b = await nguoi("kv-dc-b", "member");
			const c = await nguoi("kv-dc-c", "member");
			const { dealId } = await thoaThuan(app, a.id, "KV Dong cha");
			const gan = [{ loai: "deal" as const, id: dealId }];
			const p = await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: b.id,
				tieuDe: `kv-dc P ${Date.now()}`,
				gan,
			});
			const q = await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: b.id,
				tieuDe: `kv-dc Q ${Date.now()}`,
				gan,
			});
			const ma: string[] = [];
			for (const t of ["K1", "K2", "K3"]) {
				const r = await taoCon(b.id, p.id, `kv-dc ${t}`, c.id);
				ma.push((r.data as { id: string }).id);
			}
			const [k1, k2, k3] = ma as [string, string, string];
			await doiThu(k1, b.id, TrangThaiViec.XONG);
			await doiThu(k2, b.id, TrangThaiViec.DANG_LAM);
			await doiThu(k3, b.id, TrangThaiViec.HUY);
			const theP = theTren(await bang(b.id, "giao-cho-toi"), p.id)?.the;
			if (
				JSON.stringify(theP?.con) !== JSON.stringify({ xong: 1, tong: 2 }) ||
				theP?.conMo !== 1
			) {
				throw new Error(`kv: dem con tinh ca huy ${JSON.stringify(theP)}`);
			}
			const vetCon = await db.viecVet.count({ where: { viecId: { in: ma } } });
			const r = await goi(
				app,
				"viec.keo",
				"mutation",
				{ id: p.id, den: "XONG", thuTu: [p.id], nguon: "bang-keo" },
				b.id,
			);
			const sau = await db.viec.findMany({
				where: { id: { in: [p.id, ...ma] } },
				select: { id: true, trangThai: true },
			});
			const tt = new Map(sau.map((v) => [v.id, v.trangThai]));
			if (
				r.status !== 200 ||
				tt.get(p.id) !== "XONG" ||
				tt.get(k1) !== "XONG" ||
				tt.get(k2) !== "DANG_LAM" ||
				tt.get(k3) !== "HUY" ||
				(await db.viecVet.count({ where: { viecId: { in: ma } } })) !== vetCon
			) {
				throw new Error("kv: dong cha cham con");
			}
			const theQ = theTren(await bang(b.id, "giao-cho-toi"), q.id)?.the;
			const rq = await goi(
				app,
				"viec.keo",
				"mutation",
				{ id: q.id, den: "XONG", thuTu: [q.id], nguon: "bang-keo" },
				b.id,
			);
			if (theQ?.conMo !== 0 || rq.status !== 200) {
				throw new Error("kv: doi chung dong cha hong");
			}
		},
		MA_TEST_MS,
	);
});
