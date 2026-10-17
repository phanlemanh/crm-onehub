import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db, TrangThaiViec } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { z } from "zod";
import { duAnLichOutput, duAnListOutput } from "../src/du-an/du-an.contracts";
import { donDuAn, duAnThu, lichCua, viecCoLich } from "./support/du-an-gieo";
import { donDep, moXuong } from "./support/ke-hoach-gieo";
import {
	batApp,
	doiThu,
	donViec,
	goi,
	type KetGoi,
	nguoi,
	taoThu,
} from "./support/viec-gieo";

const MA_TEST_MS = 120_000;
const COT_LIST = [
	"soViec",
	"soXong",
	"batDauSom",
	"hanMuon",
	"mocKe",
	"taoBoi",
] as const;
const DONG = "Dự án đã đóng.";

let app: NestExpressApplication;

beforeAll(async () => {
	await moXuong();
	app = await batApp();
});

afterAll(async () => {
	await app.close();
	await donDuAn();
	await donViec();
	await donDep();
});

function json<T>(x: T): string {
	return JSON.stringify(x);
}

function idCua(r: KetGoi): string {
	return z.object({ id: z.string() }).parse(r.data).id;
}

async function taoDuAnApi(userId: string, ten: string): Promise<string> {
	const r = await goi(app, "duAn.tao", "mutation", { ten }, userId);
	if (r.status !== 200) throw new Error(`dg: tao du an loi ${json(r)}`);
	return idCua(r);
}

async function listCua(userId: string, trangThai: "mo" | "dong") {
	const r = await goi(app, "duAn.list", "query", { trangThai }, userId);
	if (r.status !== 200) throw new Error(`dg: list loi ${json(r)}`);
	return r.data;
}

async function lichDuAn(duAnId: string, userId: string) {
	const r = await goi(app, "duAn.lich", "query", { id: duAnId }, userId);
	if (r.status !== 200) throw new Error(`dg: lich loi ${json(r)}`);
	return duAnLichOutput.parse(r.data);
}

describe("dg-tao", () => {
	test(
		"dg-tao: tạo dự án, chặn tên sai, danh sách mở và đóng",
		async () => {
			const m = await nguoi("dg-m", "member");
			const ten = "Triển khai Ngân hàng A";
			await taoDuAnApi(m.id, ten);
			const ds = await db.duAn.findMany({
				where: { ten },
				select: { id: true, taoBoiId: true },
			});
			if (ds.length !== 1 || ds[0]?.taoBoiId !== m.id) {
				throw new Error(`dg: tao du an sai ${json(ds)}`);
			}
			const vet = await db.duAnVet.count({
				where: { duAnId: ds[0].id, loai: "tao" },
			});
			if (vet !== 1) throw new Error("dg: thieu vet tao");

			for (const sai of ["", "x".repeat(121)]) {
				const truoc = await db.duAn.count();
				const r = await goi(app, "duAn.tao", "mutation", { ten: sai }, m.id);
				if (r.code !== "BAD_REQUEST") {
					throw new Error(`dg: ten sai van tao ${sai.length}`);
				}
				if ((await db.duAn.count()) > truoc) {
					throw new Error("dg: ten sai van ghi");
				}
			}

			const t = await nguoi("dg-t", "member");
			const mo1 = await taoDuAnApi(t.id, "Mở một");
			const mo2 = await taoDuAnApi(t.id, "Mở hai");
			const dong = await taoDuAnApi(t.id, "Đã đóng");
			const d = await goi(app, "duAn.dong", "mutation", { id: dong }, t.id);
			if (d.status !== 200) throw new Error(`dg: dong loi ${json(d)}`);

			const hang = z.array(
				z.looseObject({ id: z.string(), taoBoi: z.object({ id: z.string() }) }),
			);
			const mo = hang
				.parse(await listCua(t.id, "mo"))
				.filter((h) => h.taoBoi.id === t.id);
			const idMo = mo.map((h) => h.id).sort();
			if (json(idMo) !== json([mo1, mo2].sort())) {
				throw new Error(`dg: list mo sai ${json(idMo)}`);
			}
			for (const h of mo) {
				for (const truong of COT_LIST) {
					if (!(truong in h)) throw new Error(`dg: list thieu cot ${truong}`);
				}
			}
			const idDong = hang
				.parse(await listCua(t.id, "dong"))
				.filter((h) => h.taoBoi.id === t.id)
				.map((h) => h.id);
			if (json(idDong) !== json([dong])) throw new Error("dg: list dong sai");

			const r120 = await goi(
				app,
				"duAn.tao",
				"mutation",
				{ ten: "x".repeat(120) },
				m.id,
			);
			if (r120.status !== 200) throw new Error("dg: doi chung ten 120 hong");
			expect(r120.status).toBe(200);
		},
		MA_TEST_MS,
	);
});

describe("dg-gom", () => {
	test(
		"dg-gom: tạo trong dự án, đưa việc riêng vào, con mang dự án, bớt việc, người chỉ OKR",
		async () => {
			const m = await nguoi("dg-m", "member");
			const a = await nguoi("dg-a", "member");
			const b = await nguoi("dg-b", "member");
			const x = await nguoi("dg-x", "member");
			const P = await taoDuAnApi(m.id, "Gom việc");

			const tieuDe = `dg-gom ${Date.now()}`;
			const c = await goi(
				app,
				"viec.create",
				"mutation",
				{ tieuDe, nguoiThucHienId: b.id, duAnId: P },
				m.id,
			);
			if (c.status !== 200)
				throw new Error(`dg: tao trong du an loi ${json(c)}`);
			const moi = await db.viec.findUniqueOrThrow({
				where: { id: idCua(c) },
				select: { duAnId: true, nguoiGiaoId: true },
			});
			if (moi.duAnId !== P || moi.nguoiGiaoId !== m.id) {
				throw new Error("dg: viec trong du an sai");
			}
			const them = await db.duAnVet.count({
				where: { duAnId: P, loai: "them-viec" },
			});
			if (them !== 1) throw new Error("dg: thieu vet them-viec");

			const V = await taoThu({ nguoiId: a.id, tieuDe: "V riêng", gan: [] });
			const lo = await goi(app, "viec.get", "query", { id: V.id }, x.id);
			if (lo.code !== "NOT_FOUND")
				throw new Error("dg: doi chung viec rieng lo");
			const dua = await goi(
				app,
				"viec.doiDuAn",
				"mutation",
				{ id: V.id, duAnId: P },
				a.id,
			);
			if (dua.status !== 200 || (await lichCua(V.id)).duAnId !== P) {
				throw new Error("dg: doi du an khong ghi");
			}
			const vetDoi = await db.viecVet.findMany({
				where: { viecId: V.id, loai: "doi-du-an" },
				select: { truoc: true, sau: true },
			});
			const sauDoi = z
				.object({ id: z.string() })
				.nullable()
				.safeParse(vetDoi[0]?.sau);
			if (
				vetDoi.length !== 1 ||
				vetDoi[0]?.truoc !== null ||
				sauDoi.data?.id !== P
			) {
				throw new Error(`dg: vet doi-du-an sai ${json(vetDoi)}`);
			}
			const thay = await goi(app, "viec.get", "query", { id: V.id }, x.id);
			if (thay.status !== 200) {
				throw new Error("dg: viec trong du an khong thay");
			}

			const con = await goi(
				app,
				"viec.taoCon",
				"mutation",
				{ chaId: V.id, tieuDe: "Con của V" },
				a.id,
			);
			const conDoc = await db.viec.findFirst({
				where: { chaId: V.id },
				select: { duAnId: true },
			});
			if (con.status !== 200 || conDoc?.duAnId !== P) {
				throw new Error("dg: con khong mang du an");
			}

			await goi(
				app,
				"viec.sua",
				"mutation",
				{ id: V.id, batDauNgay: "2026-10-26", hanNgay: "2026-10-28" },
				a.id,
			);
			const W = await viecCoLich({
				duAnId: P,
				giaoId: a.id,
				tieuDe: "W",
				batDau: "2026-10-19",
				han: "2026-10-21",
			});
			const pt = await goi(
				app,
				"duAn.phuThuocTao",
				"mutation",
				{ truocId: W.id, sauId: V.id },
				a.id,
			);
			const moc = await goi(
				app,
				"duAn.mocTao",
				"mutation",
				{ duAnId: P, ten: "Mốc gom", ngay: "2026-10-30", cho: [V.id] },
				a.id,
			);
			if (pt.status !== 200 || moc.status !== 200) {
				throw new Error(`dg: dung phu thuoc loi ${json({ pt, moc })}`);
			}
			const truocBot = await lichCua(V.id);
			const goTruocV = await db.viecVet.count({
				where: { viecId: V.id, loai: "go-phu-thuoc" },
			});
			const goTruocW = await db.viecVet.count({
				where: { viecId: W.id, loai: "go-phu-thuoc" },
			});
			const bot = await goi(
				app,
				"viec.doiDuAn",
				"mutation",
				{ id: V.id, duAnId: null },
				a.id,
			);
			if (bot.status !== 200) throw new Error(`dg: bot viec loi ${json(bot)}`);
			const sauBot = await lichCua(V.id);
			if (
				sauBot.trangThai !== truocBot.trangThai ||
				sauBot.batDau !== truocBot.batDau ||
				sauBot.han !== truocBot.han
			) {
				throw new Error("dg: bot viec doi viec");
			}
			const conPt = await db.viecPhuThuoc.count({
				where: { OR: [{ truocId: V.id }, { sauId: V.id }] },
			});
			const conMoc = await db.duAnMocCho.count({ where: { viecId: V.id } });
			if (conPt > 0 || conMoc > 0) {
				throw new Error("dg: bot viec con phu thuoc");
			}
			for (const [dau, id, truoc] of [
				["V", V.id, goTruocV],
				["W", W.id, goTruocW],
			] as const) {
				const sau = await db.viecVet.count({
					where: { viecId: id, loai: "go-phu-thuoc" },
				});
				if (sau !== truoc + 1) {
					throw new Error(`dg: go phu thuoc thieu vet ${dau}`);
				}
			}
			const botVet = await db.duAnVet.count({
				where: { duAnId: P, loai: "bot-viec" },
			});
			if (botVet !== 1) throw new Error("dg: thieu vet bot-viec");

			const k = await nguoi("dg-k", "okr");
			const soViec = await db.viec.count({ where: { taoBoiId: m.id } });
			const soVet = await db.viecVet.count({ where: { nguoiId: m.id } });
			const okr = await goi(
				app,
				"viec.create",
				"mutation",
				{ tieuDe: "Cho OKR", nguoiThucHienId: k.id, duAnId: P },
				m.id,
			);
			if (
				okr.code !== "BAD_REQUEST" ||
				!okr.message.includes(k.name) ||
				!okr.message.includes("chỉ OKR")
			) {
				throw new Error(`dg: okr nhan viec du an ${okr.message}`);
			}
			if (
				(await db.viec.count({ where: { taoBoiId: m.id } })) !== soViec ||
				(await db.viecVet.count({ where: { nguoiId: m.id } })) !== soVet
			) {
				throw new Error("dg: okr van ghi");
			}
			expect(botVet).toBe(1);
		},
		MA_TEST_MS,
	);
});

describe("dg-moc", () => {
	test(
		"dg-moc: lưu mốc, trễ theo hạn việc chờ, trễ do tự dời, xoá mốc",
		async () => {
			const m = await nguoi("dg-m", "member");
			const P = await taoDuAnApi(m.id, "Mốc");
			const B = await viecCoLich({
				duAnId: P,
				giaoId: m.id,
				tieuDe: "B",
				batDau: "2026-10-27",
				han: "2026-10-28",
			});
			const r = await goi(
				app,
				"duAn.mocTao",
				"mutation",
				{ duAnId: P, ten: "Go-live", ngay: "2026-10-30", cho: [B.id] },
				m.id,
			);
			if (r.status !== 200) throw new Error(`dg: tao moc loi ${json(r)}`);
			const mocId = idCua(r);
			const moc = await db.duAnMoc.findUniqueOrThrow({
				where: { id: mocId },
				select: { ten: true, ngay: true },
			});
			if (
				moc.ten !== "Go-live" ||
				moc.ngay.toISOString() !== "2026-10-30T00:00:00.000Z"
			) {
				throw new Error("dg: moc luu sai");
			}
			const cho = await db.duAnMocCho.findMany({
				where: { mocId },
				select: { viecId: true },
			});
			if (json(cho.map((c) => c.viecId)) !== json([B.id])) {
				throw new Error("dg: moc cho sai");
			}
			const them = await db.duAnVet.count({
				where: { duAnId: P, loai: "them-moc" },
			});
			if (them !== 1) throw new Error("dg: thieu vet them-moc");
			const mocCua = async () => {
				const l = await lichDuAn(P, m.id);
				const h = l.moc.find((x) => x.id === mocId);
				if (!h) throw new Error("dg: lich thieu moc");
				return h;
			};
			if ((await mocCua()).tre !== false) throw new Error("dg: moc tre som");

			await goi(
				app,
				"viec.doiLich",
				"mutation",
				{ id: B.id, batDauNgay: "2026-10-27", hanNgay: "2026-11-02" },
				m.id,
			);
			const ngayMoc = await db.duAnMoc.findUniqueOrThrow({
				where: { id: mocId },
				select: { ngay: true },
			});
			if (ngayMoc.ngay.toISOString() !== "2026-10-30T00:00:00.000Z") {
				throw new Error("dg: moc bi doi");
			}
			const tre = await mocCua();
			if (tre.tre !== true || !tre.treBoi.includes("B")) {
				throw new Error(`dg: moc khong tre ${json(tre)}`);
			}
			const ds = duAnListOutput.parse(await listCua(m.id, "mo"));
			if (ds.find((d) => d.id === P)?.mocKe?.tre !== true) {
				throw new Error("dg: list khong bao tre");
			}

			await goi(
				app,
				"viec.doiLich",
				"mutation",
				{ id: B.id, batDauNgay: "2026-10-27", hanNgay: "2026-10-29" },
				m.id,
			);
			if ((await mocCua()).tre !== false) {
				throw new Error("dg: moc khong het tre");
			}

			const A = await viecCoLich({
				duAnId: P,
				giaoId: m.id,
				tieuDe: "A",
				batDau: "2026-10-19",
				han: "2026-10-22",
			});
			await goi(
				app,
				"duAn.phuThuocTao",
				"mutation",
				{ truocId: A.id, sauId: B.id },
				m.id,
			);
			await goi(
				app,
				"viec.doiLich",
				"mutation",
				{ id: A.id, batDauNgay: "2026-10-19", hanNgay: "2026-10-28" },
				m.id,
			);
			if ((await mocCua()).tre !== true) {
				throw new Error("dg: tu doi khong lam tre");
			}

			const lichB = await lichCua(B.id);
			const xoa = await goi(
				app,
				"duAn.mocXoa",
				"mutation",
				{ id: mocId },
				m.id,
			);
			const conMoc = await db.duAnMoc.count({ where: { id: mocId } });
			const conCho = await db.duAnMocCho.count({ where: { mocId } });
			const vetXoa = await db.duAnVet.count({
				where: { duAnId: P, loai: "xoa-moc" },
			});
			if (
				xoa.status !== 200 ||
				conMoc !== 0 ||
				conCho !== 0 ||
				json(await lichCua(B.id)) !== json(lichB) ||
				vetXoa !== 1
			) {
				throw new Error("dg: xoa moc sai");
			}
			expect(vetXoa).toBe(1);
		},
		MA_TEST_MS,
	);
});

describe("dg-vong-doi", () => {
	test(
		"dg-vong-doi: đóng không đụng việc, dự án đóng chặn thêm, mở lại, xoá khi chưa có lịch sử",
		async () => {
			const t = await nguoi("dg-t", "member");
			const P = await taoDuAnApi(t.id, "Vòng đời");
			const tao = (tieuDe: string) =>
				viecCoLich({
					duAnId: P,
					giaoId: t.id,
					tieuDe,
					batDau: "2026-10-19",
					han: "2026-10-21",
				});
			const mo = await tao("Mở");
			const xong = await tao("Xong");
			const huy = await tao("Huỷ");
			await doiThu(xong.id, t.id, TrangThaiViec.XONG);
			await doiThu(huy.id, t.id, TrangThaiViec.HUY);
			const ba = [mo.id, xong.id, huy.id];
			const docBa = () =>
				db.viec.findMany({
					where: { id: { in: ba } },
					select: { id: true, trangThai: true, khepLuc: true },
					orderBy: { id: "asc" },
				});
			const truocDong = await docBa();

			const d = await goi(app, "duAn.dong", "mutation", { id: P }, t.id);
			const doc = await db.duAn.findUniqueOrThrow({
				where: { id: P },
				select: { dongLuc: true },
			});
			const vetDong = await db.duAnVet.count({
				where: { duAnId: P, loai: "dong" },
			});
			if (d.status !== 200 || doc.dongLuc === null || vetDong !== 1) {
				throw new Error("dg: dong khong ghi");
			}
			const sauDong = await docBa();
			for (const [i, v] of sauDong.entries()) {
				if (json(v) !== json(truocDong[i])) {
					throw new Error(`dg: dong doi viec ${v.id}`);
				}
			}
			const hang = z.array(z.object({ id: z.string() }).loose());
			const coTrong = async (tt: "mo" | "dong") =>
				hang.parse(await listCua(t.id, tt)).some((h) => h.id === P);
			if ((await coTrong("mo")) || !(await coTrong("dong"))) {
				throw new Error("dg: dong khong doi danh sach");
			}

			const ngoai = await taoThu({ nguoiId: t.id, tieuDe: "Ngoài", gan: [] });
			const chan: [string, () => ReturnType<typeof goi>][] = [
				[
					"viec.create",
					() =>
						goi(
							app,
							"viec.create",
							"mutation",
							{ tieuDe: "Mới", duAnId: P },
							t.id,
						),
				],
				[
					"duAn.mocTao",
					() =>
						goi(
							app,
							"duAn.mocTao",
							"mutation",
							{ duAnId: P, ten: "Mốc", ngay: "2026-10-30", cho: [] },
							t.id,
						),
				],
				[
					"duAn.phuThuocTao",
					() =>
						goi(
							app,
							"duAn.phuThuocTao",
							"mutation",
							{ truocId: mo.id, sauId: xong.id },
							t.id,
						),
				],
				[
					"viec.doiDuAn",
					() =>
						goi(
							app,
							"viec.doiDuAn",
							"mutation",
							{ id: ngoai.id, duAnId: P },
							t.id,
						),
				],
			];
			for (const [ten, chay] of chan) {
				const r = await chay();
				if (r.code !== "BAD_REQUEST" || r.message !== DONG) {
					throw new Error(`dg: du an dong van them ${ten}`);
				}
			}
			const tt = await goi(
				app,
				"viec.doiTrangThai",
				"mutation",
				{ id: mo.id, den: "DANG_LAM" },
				t.id,
			);
			if (tt.status !== 200) throw new Error("dg: dong khoa viec");

			const ml = await goi(app, "duAn.moLai", "mutation", { id: P }, t.id);
			const docMl = await db.duAn.findUniqueOrThrow({
				where: { id: P },
				select: { dongLuc: true },
			});
			const vetMl = await db.duAnVet.count({
				where: { duAnId: P, loai: "mo-lai" },
			});
			if (ml.status !== 200 || docMl.dongLuc !== null || vetMl !== 1) {
				throw new Error("dg: mo lai sai");
			}

			const R = await duAnThu(t.id, "Rỗng");
			const xr = await goi(app, "duAn.xoa", "mutation", { id: R.id }, t.id);
			if (
				xr.status !== 200 ||
				(await db.duAn.count({ where: { id: R.id } })) !== 0
			) {
				throw new Error("dg: xoa du an rong hong");
			}
			const xp = await goi(app, "duAn.xoa", "mutation", { id: P }, t.id);
			if (xp.code !== "CONFLICT") throw new Error("dg: xoa du an co lich su");

			const c = await goi(
				app,
				"viec.create",
				"mutation",
				{
					tieuDe: "V chưa lịch sử",
					duAnId: P,
					batDauNgay: "2026-10-12",
					hanNgay: "2026-10-13",
				},
				t.id,
			);
			if (c.status !== 200) throw new Error(`dg: tao V loi ${json(c)}`);
			const V = idCua(c);
			const W2 = await tao("W2");
			const pt = await goi(
				app,
				"duAn.phuThuocTao",
				"mutation",
				{ truocId: V, sauId: W2.id },
				t.id,
			);
			const mc = await goi(
				app,
				"duAn.mocTao",
				"mutation",
				{ duAnId: P, ten: "Mốc V", ngay: "2026-10-30", cho: [V] },
				t.id,
			);
			if (pt.status !== 200 || mc.status !== 200) {
				throw new Error(`dg: dung V loi ${json({ pt, mc })}`);
			}
			const xv = await goi(app, "viec.xoa", "mutation", { id: V }, t.id);
			const conPt = await db.viecPhuThuoc.count({
				where: { OR: [{ truocId: V }, { sauId: V }] },
			});
			const conMoc = await db.duAnMocCho.count({ where: { viecId: V } });
			if (xv.status !== 200 || conPt > 0 || conMoc > 0) {
				throw new Error(`dg: xoa viec de phu thuoc mo coi ${json(xv)}`);
			}
			expect(xv.status).toBe(200);
		},
		MA_TEST_MS,
	);
});
