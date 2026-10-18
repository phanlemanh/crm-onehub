import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { docLichLam } from "@crm/db/du-an";
import { ngayLamKe } from "@crm/db/lich-lam-viec";
import { parseVetViec } from "@crm/db/viec";
import type { NestExpressApplication } from "@nestjs/platform-express";
import {
	boLe,
	donDuAn,
	duAnThu,
	lichCua,
	ngayCua,
	ngayDb,
	viecCoLich,
} from "./support/du-an-gieo";
import {
	donDep,
	gieoBoPhan,
	gieoKeHoach,
	moXuong,
} from "./support/ke-hoach-gieo";
import {
	batApp,
	donViec,
	goi,
	type KetGoi,
	nguoi,
	taoThu,
} from "./support/viec-gieo";

const MA_TEST_MS = 120_000;
const HAI_LAN_MS = 5_000;
const NGAY_LE = "2026-10-26";

let app: NestExpressApplication;

beforeAll(async () => {
	setSystemTime(new Date("2026-10-16T03:00:00.000Z"));
	await moXuong();
	app = await batApp();
});

afterAll(async () => {
	await app.close();
	await boLe(NGAY_LE);
	await donDuAn();
	await donViec();
	await donDep();
	setSystemTime();
});

type Vet = {
	id: string;
	loai: string;
	nguon: string;
	nguoiId: string | null;
	truoc: unknown;
	sau: unknown;
};

async function vetCua(viecId: string): Promise<Vet[]> {
	return db.viecVet.findMany({
		where: { viecId },
		select: {
			id: true,
			loai: true,
			nguon: true,
			nguoiId: true,
			truoc: true,
			sau: true,
		},
		orderBy: { luc: "asc" },
	});
}

async function vetMoi(viecId: string, cu: Vet[]): Promise<Vet[]> {
	const da = new Set(cu.map((v) => v.id));
	return (await vetCua(viecId)).filter((v) => !da.has(v.id));
}

function json<T>(x: T): string {
	return JSON.stringify(x);
}

function boiCua(v: Vet): string | null {
	const doc = parseVetViec(v);
	if (doc.loai !== "doi-bat-dau" && doc.loai !== "doi-han") return null;
	return doc.sau.boi?.id ?? null;
}

type LichDoc = Awaited<ReturnType<typeof lichCua>>;
type LanDoi = { ms: number; status: number };

function ghiDung(r: KetGoi, l: LichDoc, mong: [string, string]): boolean {
	return r.status === 200 && json([l.batDau, l.han]) === json(mong);
}

function haiLanCoGhi(
	[lanA, lanB]: [LanDoi, LanDoi],
	[la, lb]: [LichDoc, LichDoc],
): boolean {
	const coLan = lanA.status === 200 || lanB.status === 200;
	const aDung = lanA.status !== 200 || la.han === "2026-10-23";
	const bDung = lanB.status !== 200 || (lb.batDau ?? "") >= "2026-10-27";
	return coLan && aDung && bDung;
}

function batDauSau(v: Vet): string | null {
	const doc = parseVetViec(v);
	return doc.loai === "doi-bat-dau" ? doc.sau.batDauNgay : null;
}

describe("dg-bat-dau", () => {
	test(
		"dg-bat-dau: đặt ngày bắt đầu, chặn sau hạn, quyền như viec.sua, không lan sang bước",
		async () => {
			const a = await nguoi("dg-a", "member");
			const b = await nguoi("dg-b", "member");
			const w = await nguoi("dg-w", "member");
			const x = await nguoi("dg-x", "member");
			const p = await duAnThu(a.id);
			const v = await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: b.id,
				nguoiTheoDoiIds: [w.id],
				tieuDe: "V",
				gan: [],
				duAnId: p.id,
				hanNgay: ngayDb("2026-10-23"),
			});

			const cu = await vetCua(v.id);
			const r = await goi(
				app,
				"viec.sua",
				"mutation",
				{ id: v.id, batDauNgay: "2026-10-20" },
				b.id,
			);
			if (r.status !== 200) throw new Error(`dg: bat dau loi ${json(r)}`);
			const doc = await db.viec.findUniqueOrThrow({
				where: { id: v.id },
				select: { batDauNgay: true, hanNgay: true },
			});
			if (doc.batDauNgay?.toISOString() !== "2026-10-20T00:00:00.000Z") {
				throw new Error(
					`dg: bat dau luu sai ${doc.batDauNgay?.toISOString() ?? null}`,
				);
			}
			const moi = await vetMoi(v.id, cu);
			const batDau = moi.filter((h) => h.loai === "doi-bat-dau");
			const h0 = batDau[0];
			if (
				batDau.length !== 1 ||
				!h0 ||
				h0.nguoiId !== b.id ||
				h0.nguon !== "web" ||
				json(h0.truoc) !== json({ batDauNgay: null }) ||
				batDauSau(h0) !== "2026-10-20"
			) {
				throw new Error(`dg: vet doi-bat-dau sai ${json(moi)}`);
			}
			if (ngayCua(doc.hanNgay) !== "2026-10-23") {
				throw new Error("dg: bat dau doi han");
			}

			const cu2 = await vetCua(v.id);
			const sau = await goi(
				app,
				"viec.sua",
				"mutation",
				{ id: v.id, batDauNgay: "2026-10-24" },
				b.id,
			);
			if (
				sau.code !== "BAD_REQUEST" ||
				sau.message !== "Ngày bắt đầu phải trước hay trùng hạn."
			) {
				throw new Error(`dg: bat dau sau han ${json(sau)}`);
			}
			if ((await vetMoi(v.id, cu2)).length > 0) {
				throw new Error("dg: bat dau sai van ghi vet");
			}

			for (const [ten, u] of [
				["dg-w", w],
				["dg-x", x],
			] as const) {
				const mau = await goi(
					app,
					"viec.sua",
					"mutation",
					{ id: v.id, tieuDe: "V doi" },
					u.id,
				);
				const thu = await goi(
					app,
					"viec.sua",
					"mutation",
					{ id: v.id, batDauNgay: "2026-10-21" },
					u.id,
				);
				if (
					thu.code !== "FORBIDDEN" ||
					mau.code !== "FORBIDDEN" ||
					thu.message !== mau.message
				) {
					throw new Error(`dg: quyen bat dau lech ${ten}`);
				}
			}

			const bp = await gieoBoPhan();
			const { plan } = await gieoKeHoach({
				camTrich: a.id,
				buoc: [{ nhan: "Buoc V2", boPhanId: bp.id, han: ngayDb("2026-10-23") }],
			});
			const v2 = await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: b.id,
				tieuDe: "V2",
				gan: [],
				hanNgay: ngayDb("2026-10-23"),
			});
			const buoc = await db.onboardingStep.findFirstOrThrow({
				where: { planId: plan.id },
				select: { id: true, dueAt: true },
			});
			await db.onboardingStep.update({
				where: { id: buoc.id },
				data: { viecId: v2.id },
			});
			const r2 = await goi(
				app,
				"viec.sua",
				"mutation",
				{ id: v2.id, batDauNgay: "2026-10-20" },
				b.id,
			);
			if (r2.status !== 200) throw new Error(`dg: bat dau v2 loi ${json(r2)}`);
			const buocSau = await db.onboardingStep.findUniqueOrThrow({
				where: { id: buoc.id },
				select: { dueAt: true },
			});
			if (buocSau.dueAt.toISOString() !== buoc.dueAt.toISOString()) {
				throw new Error("dg: bat dau lan sang buoc");
			}

			const bang = await goi(
				app,
				"viec.sua",
				"mutation",
				{ id: v.id, batDauNgay: "2026-10-23" },
				b.id,
			);
			if (bang.status !== 200) throw new Error("dg: doi chung bang han hong");
			expect(bang.status).toBe(200);
		},
		MA_TEST_MS,
	);
});

describe("dg-keo-thanh", () => {
	test(
		"dg-keo-thanh: doiLich ghi hai ngày với nguồn gantt, kéo mép chỉ đổi hạn, người ngoài bị chặn",
		async () => {
			const a = await nguoi("dg-a", "member");
			const b = await nguoi("dg-b", "member");
			const x = await nguoi("dg-x", "member");
			const p = await duAnThu(a.id);
			const v = await viecCoLich({
				duAnId: p.id,
				giaoId: a.id,
				thucHienId: b.id,
				tieuDe: "V",
				batDau: "2026-10-19",
				han: "2026-10-21",
			});

			const cu = await vetCua(v.id);
			const r = await goi(
				app,
				"viec.doiLich",
				"mutation",
				{ id: v.id, batDauNgay: "2026-10-21", hanNgay: "2026-10-23" },
				b.id,
			);
			const l = await lichCua(v.id);
			if (
				r.status !== 200 ||
				l.batDau !== "2026-10-21" ||
				l.han !== "2026-10-23"
			) {
				throw new Error("dg: doi lich khong ghi");
			}
			const moi = await vetMoi(v.id, cu);
			const dung = (loai: string) =>
				moi.filter(
					(h) => h.loai === loai && h.nguon === "gantt" && h.nguoiId === b.id,
				).length === 1;
			if (moi.length !== 2 || !dung("doi-bat-dau") || !dung("doi-han")) {
				throw new Error(`dg: vet keo thanh sai ${json(moi)}`);
			}

			const cu2 = await vetCua(v.id);
			await goi(
				app,
				"viec.doiLich",
				"mutation",
				{ id: v.id, batDauNgay: "2026-10-21", hanNgay: "2026-10-26" },
				b.id,
			);
			const moi2 = await vetMoi(v.id, cu2);
			if (moi2.length !== 1 || moi2[0]?.loai !== "doi-han") {
				throw new Error("dg: keo mep ghi thua");
			}

			const cu3 = await vetCua(v.id);
			const rx = await goi(
				app,
				"viec.doiLich",
				"mutation",
				{ id: v.id, batDauNgay: "2026-10-22", hanNgay: "2026-10-27" },
				x.id,
			);
			if (rx.code !== "FORBIDDEN") throw new Error("dg: x keo duoc");
			if ((await vetMoi(v.id, cu3)).length > 0) {
				throw new Error("dg: x keo van ghi");
			}

			const cu4 = await vetCua(v.id);
			await goi(
				app,
				"viec.sua",
				"mutation",
				{ id: v.id, hanNgay: "2026-10-27" },
				b.id,
			);
			const moi4 = await vetMoi(v.id, cu4);
			if (moi4.length !== 1 || moi4[0]?.nguon !== "web") {
				throw new Error("dg: nguon web bi doi");
			}
			expect(moi4[0]?.loai).toBe("doi-han");
		},
		MA_TEST_MS,
	);
});

describe("dg-phu-thuoc", () => {
	test(
		"dg-phu-thuoc: tạo, bảng từ chối bảy ô, vòng ba đỉnh, gỡ",
		async () => {
			const a = await nguoi("dg-a", "member");
			const q = await nguoi("dg-q", "member");
			const w = await nguoi("dg-w", "member");
			const x = await nguoi("dg-x", "member");
			const p = await duAnThu(a.id);
			const p2 = await duAnThu(a.id, "Dự án khác");
			const A = await viecCoLich({
				duAnId: p.id,
				giaoId: a.id,
				tieuDe: "A",
				batDau: "2026-10-19",
				han: "2026-10-21",
			});
			const B = await taoThu({
				nguoiId: a.id,
				nguoiThucHienId: q.id,
				nguoiTheoDoiIds: [w.id],
				tieuDe: "B",
				gan: [],
				duAnId: p.id,
				hanNgay: ngayDb("2026-10-23"),
			});
			await goi(
				app,
				"viec.sua",
				"mutation",
				{ id: B.id, batDauNgay: "2026-10-22" },
				a.id,
			);

			const r = await goi(
				app,
				"duAn.phuThuocTao",
				"mutation",
				{ truocId: A.id, sauId: B.id },
				q.id,
			);
			if (r.status !== 200) throw new Error(`dg: phu thuoc loi ${json(r)}`);
			const so = await db.viecPhuThuoc.count({
				where: { truocId: A.id, sauId: B.id },
			});
			if (so !== 1) throw new Error("dg: phu thuoc khong ghi");
			const them = await db.viecVet.count({
				where: { viecId: B.id, loai: "them-phu-thuoc" },
			});
			if (them !== 1) throw new Error("dg: thieu vet them-phu-thuoc");
			const lich = await goi(app, "duAn.lich", "query", { id: p.id }, q.id);
			const dsLich = (
				lich.data as { viec: { id: string; phaiCho: string[] }[] }
			)?.viec;
			const hangB = dsLich?.find((h) => h.id === B.id);
			if (!hangB?.phaiCho.includes(A.id)) {
				throw new Error("dg: lich thieu phu thuoc");
			}

			const Akhac = await viecCoLich({
				duAnId: p2.id,
				giaoId: a.id,
				tieuDe: "A khac",
				batDau: "2026-10-19",
				han: "2026-10-21",
			});
			const Athieu = await viecCoLich({
				duAnId: p.id,
				giaoId: a.id,
				tieuDe: "A thieu",
			});
			const chiGiao =
				"Chỉ người giao và người thực hiện của «B» được đặt việc phải chờ.";
			const bangO: {
				o: string;
				truocId: string;
				sauId: string;
				nguoiId: string;
				code: string;
				message: string;
			}[] = [
				{
					o: "vong",
					truocId: B.id,
					sauId: A.id,
					nguoiId: a.id,
					code: "BAD_REQUEST",
					message: "Phụ thuộc này tạo vòng: «B» → «A» → «B».",
				},
				{
					o: "khac-du-an",
					truocId: Akhac.id,
					sauId: B.id,
					nguoiId: q.id,
					code: "BAD_REQUEST",
					message: "Hai việc phải cùng một dự án.",
				},
				{
					o: "tu-cho",
					truocId: B.id,
					sauId: B.id,
					nguoiId: q.id,
					code: "BAD_REQUEST",
					message: "Một việc không chờ chính nó.",
				},
				{
					o: "lan-hai",
					truocId: A.id,
					sauId: B.id,
					nguoiId: q.id,
					code: "BAD_REQUEST",
					message: "Hai việc này đã có phụ thuộc.",
				},
				{
					o: "thieu-ngay",
					truocId: Athieu.id,
					sauId: B.id,
					nguoiId: q.id,
					code: "BAD_REQUEST",
					message: "Đặt ngày bắt đầu và hạn cho cả hai việc trước.",
				},
				{
					o: "theo-doi",
					truocId: Athieu.id,
					sauId: B.id,
					nguoiId: w.id,
					code: "FORBIDDEN",
					message: chiGiao,
				},
				{
					o: "khac",
					truocId: Athieu.id,
					sauId: B.id,
					nguoiId: x.id,
					code: "FORBIDDEN",
					message: chiGiao,
				},
			];
			await db.viec.update({
				where: { id: Athieu.id },
				data: { batDauNgay: null, hanNgay: null },
			});
			const daChay: string[] = [];
			for (const o of bangO) {
				if (o.o === "theo-doi") {
					await db.viec.update({
						where: { id: Athieu.id },
						data: {
							batDauNgay: ngayDb("2026-10-12"),
							hanNgay: ngayDb("2026-10-13"),
						},
					});
				}
				const truocPt = await db.viecPhuThuoc.count();
				const truocVet = await db.viecVet.count();
				const kq: KetGoi = await goi(
					app,
					"duAn.phuThuocTao",
					"mutation",
					{ truocId: o.truocId, sauId: o.sauId },
					o.nguoiId,
				);
				if (kq.code !== o.code || kq.message !== o.message) {
					throw new Error(`dg: tu choi lech ${o.o} ${json(kq)}`);
				}
				if (
					(await db.viecPhuThuoc.count()) !== truocPt ||
					(await db.viecVet.count()) !== truocVet
				) {
					throw new Error(`dg: tu choi van ghi ${o.o}`);
				}
				daChay.push(o.o);
			}
			if (daChay.length !== 7) {
				throw new Error(`dg: bang tu choi thieu ${daChay.length}`);
			}

			const p3 = await duAnThu(a.id, "Vòng ba");
			const tao3 = (tieuDe: string, batDau: string, han: string) =>
				viecCoLich({ duAnId: p3.id, giaoId: a.id, tieuDe, batDau, han });
			const A3 = await tao3("A", "2026-10-19", "2026-10-19");
			const B3 = await tao3("B", "2026-10-20", "2026-10-20");
			const C3 = await tao3("C", "2026-10-21", "2026-10-21");
			for (const [t, s] of [
				[A3, B3],
				[B3, C3],
			] as const) {
				const k = await goi(
					app,
					"duAn.phuThuocTao",
					"mutation",
					{ truocId: t.id, sauId: s.id },
					a.id,
				);
				if (k.status !== 200)
					throw new Error(`dg: dung vong ba loi ${json(k)}`);
			}
			const ba = await goi(
				app,
				"duAn.phuThuocTao",
				"mutation",
				{ truocId: C3.id, sauId: A3.id },
				a.id,
			);
			if (ba.message !== "Phụ thuộc này tạo vòng: «C» → «A» → «B» → «C».") {
				throw new Error("dg: vong ba dinh lot");
			}

			const xoa = await goi(
				app,
				"duAn.phuThuocXoa",
				"mutation",
				{ truocId: A.id, sauId: B.id },
				q.id,
			);
			const con = await db.viecPhuThuoc.count({
				where: { truocId: A.id, sauId: B.id },
			});
			const go = await db.viecVet.count({
				where: { viecId: B.id, loai: "go-phu-thuoc" },
			});
			if (xoa.status !== 200 || con !== 0 || go !== 1) {
				throw new Error("dg: go phu thuoc sai");
			}
			expect(daChay.length).toBe(7);
		},
		MA_TEST_MS,
	);
});

describe("dg-tu-doi", () => {
	test(
		"dg-tu-doi: chuỗi AC-7 dời theo lịch thật, nguyên khối, không kéo lùi, hai lần cùng lúc",
		async () => {
			const o = await nguoi("dg-o", "admin");
			const a = await nguoi("dg-a", "member");
			const q = await nguoi("dg-q", "member");
			const le = await goi(
				app,
				"lichLamViec.themNgayLe",
				"mutation",
				{ ngay: NGAY_LE, ten: "Lễ thử" },
				o.id,
			);
			if (le.status !== 200) throw new Error(`dg: them le loi ${json(le)}`);

			const p = await duAnThu(a.id);
			const A = await viecCoLich({
				duAnId: p.id,
				giaoId: a.id,
				tieuDe: "A",
				batDau: "2026-10-19",
				han: "2026-10-21",
			});
			const B = await viecCoLich({
				duAnId: p.id,
				giaoId: q.id,
				tieuDe: "B",
				batDau: "2026-10-22",
				han: "2026-10-23",
			});
			const C = await viecCoLich({
				duAnId: p.id,
				giaoId: q.id,
				tieuDe: "C",
				batDau: "2026-10-27",
				han: "2026-10-28",
			});
			const D = await viecCoLich({
				duAnId: p.id,
				giaoId: a.id,
				tieuDe: "D",
				batDau: "2026-11-10",
				han: "2026-11-11",
			});
			const F = await viecCoLich({
				duAnId: p.id,
				giaoId: a.id,
				tieuDe: "F",
				batDau: "2026-10-20",
				han: "2026-10-22",
			});
			for (const [t, s, ai] of [
				[A, B, q],
				[B, C, q],
				[A, D, a],
			] as const) {
				const k = await goi(
					app,
					"duAn.phuThuocTao",
					"mutation",
					{ truocId: t.id, sauId: s.id },
					ai.id,
				);
				if (k.status !== 200) throw new Error(`dg: dung chuoi loi ${json(k)}`);
			}
			const lichF = await lichCua(F.id);

			const chan = await goi(
				app,
				"viec.sua",
				"mutation",
				{ id: B.id, tieuDe: "B doi" },
				a.id,
			);
			if (chan.code !== "FORBIDDEN") {
				throw new Error(`dg: tien de a sua duoc B ${json(chan)}`);
			}

			const ten = `dg_tiem_${C.id}`;
			const vetTruoc = new Map<string, Vet[]>();
			for (const v of [A, B, C]) vetTruoc.set(v.id, await vetCua(v.id));
			const lichTruoc = await Promise.all([A, B, C].map((v) => lichCua(v.id)));
			await db.$executeRawUnsafe(
				`CREATE OR REPLACE FUNCTION ${ten}() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'dg tiem loi'; END $$ LANGUAGE plpgsql`,
			);
			await db.$executeRawUnsafe(
				`CREATE TRIGGER ${ten} BEFORE UPDATE ON viec FOR EACH ROW WHEN (NEW.id = '${C.id}') EXECUTE FUNCTION ${ten}()`,
			);
			let tiem: KetGoi;
			try {
				tiem = await goi(
					app,
					"viec.doiLich",
					"mutation",
					{ id: A.id, batDauNgay: "2026-10-19", hanNgay: "2026-10-23" },
					a.id,
				);
			} finally {
				await db.$executeRawUnsafe(`DROP TRIGGER IF EXISTS ${ten} ON viec`);
				await db.$executeRawUnsafe(`DROP FUNCTION IF EXISTS ${ten}()`);
			}
			const lichSauTiem = await Promise.all(
				[A, B, C].map((v) => lichCua(v.id)),
			);
			let vetLot = 0;
			for (const v of [A, B, C]) {
				vetLot += (await vetMoi(v.id, vetTruoc.get(v.id) ?? [])).length;
			}
			if (
				tiem.status === 200 ||
				json(lichSauTiem) !== json(lichTruoc) ||
				vetLot > 0
			) {
				throw new Error("dg: tu doi khong nguyen khoi");
			}

			const vetB = await vetCua(B.id);
			const vetC = await vetCua(C.id);
			const lichD = {
				batDau: "2026-11-10",
				han: "2026-11-11",
				duAnId: p.id,
				trangThai: "CHUA_LAM",
			};
			const keo = await goi(
				app,
				"viec.doiLich",
				"mutation",
				{ id: A.id, batDauNgay: "2026-10-19", hanNgay: "2026-10-23" },
				a.id,
			);
			const lb = await lichCua(B.id);
			const lc = await lichCua(C.id);
			const tuDoiB = (await vetMoi(B.id, vetB)).filter(
				(h) => h.nguon === "tu-doi",
			);
			if (
				keo.code === "FORBIDDEN" ||
				lb.batDau === "2026-10-22" ||
				tuDoiB.length === 0 ||
				tuDoiB.some((h) => h.nguoiId !== a.id)
			) {
				throw new Error("dg: tu doi doi quyen o sau");
			}
			if (keo.status !== 200) throw new Error(`dg: tu doi sai ${json(keo)}`);
			if (
				lb.batDau !== "2026-10-27" ||
				lb.han !== "2026-10-28" ||
				lc.batDau !== "2026-10-29" ||
				lc.han !== "2026-10-30"
			) {
				throw new Error(`dg: tu doi sai ${json({ B: lb, C: lc })}`);
			}
			const lichD2 = await lichCua(D.id);
			if (json(lichD2) !== json(lichD)) {
				if ((lichD2.batDau ?? "") < (lichD.batDau ?? "")) {
					throw new Error("dg: keo lui that");
				}
				throw new Error("dg: d bi doi");
			}
			for (const [ten2, v, cu, boi] of [
				["B", B, vetB, A.id],
				["C", C, vetC, B.id],
			] as const) {
				const moi = await vetMoi(v.id, cu);
				const dung = (loai: string) =>
					moi.filter(
						(h) =>
							h.loai === loai &&
							h.nguon === "tu-doi" &&
							boiCua(h) === boi &&
							h.nguoiId === a.id,
					).length === 1;
				if (moi.length !== 2 || !dung("doi-bat-dau") || !dung("doi-han")) {
					throw new Error(`dg: vet tu doi sai ${ten2} ${json(moi)}`);
				}
			}
			const daDoi = (keo.data as { daDoi: { id: string }[] }).daDoi
				.map((d) => d.id)
				.sort();
			if (json(daDoi) !== json([B.id, C.id].sort())) {
				throw new Error("dg: khong bao da doi");
			}

			const som = await goi(
				app,
				"viec.sua",
				"mutation",
				{ id: B.id, batDauNgay: NGAY_LE },
				q.id,
			);
			if (
				som.code !== "BAD_REQUEST" ||
				som.message !== "Việc này phải bắt đầu sau khi «A» xong (hạn 23/10)."
			) {
				throw new Error(`dg: dat som khong chan ${json(som)}`);
			}

			const E = await viecCoLich({
				duAnId: p.id,
				giaoId: a.id,
				tieuDe: "E",
				batDau: "2026-10-22",
				han: "2026-10-23",
			});
			const vetE = await vetCua(E.id);
			const tE = await goi(
				app,
				"duAn.phuThuocTao",
				"mutation",
				{ truocId: A.id, sauId: E.id },
				a.id,
			);
			const lE = await lichCua(E.id);
			const tuDoiE = (await vetMoi(E.id, vetE)).filter(
				(h) => h.nguon === "tu-doi",
			);
			if (
				tE.status !== 200 ||
				lE.batDau !== "2026-10-27" ||
				tuDoiE.length === 0
			) {
				throw new Error("dg: tao phu thuoc khong doi");
			}

			const keoSom = await goi(
				app,
				"viec.doiLich",
				"mutation",
				{ id: A.id, batDauNgay: "2026-10-19", hanNgay: "2026-10-20" },
				a.id,
			);
			if (!ghiDung(keoSom, await lichCua(A.id), ["2026-10-19", "2026-10-20"])) {
				throw new Error(`dg: keo som khong ghi ${json(keoSom)}`);
			}
			const lb2 = await lichCua(B.id);
			const lc2 = await lichCua(C.id);
			if (
				json([lb2.batDau, lb2.han, lc2.batDau, lc2.han]) !==
				json(["2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30"])
			) {
				throw new Error("dg: keo lui that");
			}

			const doLan = async (
				id: string,
				batDau: string,
				han: string,
				ai: string,
			) => {
				const t0 = performance.now();
				const r = await goi(
					app,
					"viec.doiLich",
					"mutation",
					{ id, batDauNgay: batDau, hanNgay: han },
					ai,
				);
				return { ms: performance.now() - t0, status: r.status };
			};
			const [lanA, lanB] = await Promise.all([
				doLan(A.id, "2026-10-19", "2026-10-23", a.id),
				doLan(B.id, "2026-10-27", "2026-10-29", q.id),
			]);
			if ([lanA, lanB].some((l) => l.ms > HAI_LAN_MS)) {
				throw new Error("dg: hai lan doi treo");
			}
			const sau = await Promise.all([lichCua(A.id), lichCua(B.id)]);
			if (!haiLanCoGhi([lanA, lanB], sau)) {
				throw new Error(`dg: hai lan doi khong ghi ${json([lanA, lanB, sau])}`);
			}
			const lichThat = await db.$transaction((tx) => docLichLam(tx));
			const canh = await db.viecPhuThuoc.findMany({
				where: { truoc: { duAnId: p.id } },
				select: {
					truoc: { select: { tieuDe: true, hanNgay: true } },
					sau: { select: { tieuDe: true, batDauNgay: true } },
				},
			});
			const vo = canh.filter((c) => {
				const han = ngayCua(c.truoc.hanNgay);
				const bat = ngayCua(c.sau.batDauNgay);
				return han !== null && bat !== null && bat < ngayLamKe(han, lichThat);
			});
			if (vo.length > 0) {
				throw new Error(`dg: hai lan doi vo rang buoc ${json(vo)}`);
			}

			if (json(await lichCua(F.id)) !== json(lichF)) {
				throw new Error("dg: tu doi lan ra ngoai");
			}
			expect(vo.length).toBe(0);
		},
		MA_TEST_MS,
	);
});
