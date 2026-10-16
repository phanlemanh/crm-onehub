import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db, Prisma } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import {
	CHU_SO_DO,
	mtSoDo,
	mucTieuThuan,
	NGUOI_XEM_HEP,
	napCaSoDo,
} from "../scripts/okr-mau/ca-so-do";
import { idMau } from "../scripts/okr-mau/cau-hinh";
import { mucTieuOutput } from "../src/okr/okr.contracts";
import {
	cayCanChinhOutput,
	type QuanhMucTieuOutput,
	quanhMucTieuOutput,
} from "../src/okr/okr-xem.contracts";
import { gopQuanhMucTieu } from "../src/okr/quanh-muc-tieu";
import { congTy } from "./okr-mau-san";
import { CHU_KY_Q4 } from "./soan-okr-san";
import {
	batDauMau,
	CHO_DB,
	dungUngDung,
	goi,
	ketThucMau,
	nguoi,
	ok,
	phienMau,
} from "./tro-ly-okr-san";

const CONG_BO = new Date("2026-10-01T02:00:00Z");
const QUAN_TRI = congTy().nguoi.find((n) => n.vai === "admin")?.ma ?? "";
const KY_NAM = idMau("chu-ky", "nam");
const krMau = (ma: string) => idMau("kr", ma);

const N1 = mtSoDo("n1");
const N1K1 = krMau("n1-k1");
const N1K2 = krMau("n1-k2");
const A1 = mtSoDo("sd-a-1");
const A1K1 = krMau("sd-a-1-k1");
const P1 = mtSoDo("sd-a1-1");
const P3 = mtSoDo("sd-a3-1");
const G = mtSoDo("sd-g");
const KHONG_GOP = mtSoDo("sd-b-1");

const NY = mtSoDo("dh5-ny");
const NYK1 = krMau("dh5-ny-k1");
const BQ = mtSoDo("dh5-bq");
const PQ = mtSoDo("dh5-pq");
const X = mtSoDo("dh5-x");
const GT = mtSoDo("dh5-gt");
const TEN_GT = "DH5 · mục tiêu giới hạn phía trên";

let app: NestExpressApplication;
const phien = new Map<string, string>();

async function napCaDh5() {
	const chu = nguoi(CHU_SO_DO);
	const bp = idMau("bp", "sd-a");
	const pb = idMau("pb", "sd-a1");
	const mt = (
		id: string,
		cycleId: string,
		level: "onehub" | "bo-phan" | "phong-ban",
		title: string,
		hienThi: "cong-khai" | "gioi-han" = "cong-khai",
	) => ({
		id,
		cycleId,
		level,
		divisionId: level === "bo-phan" ? bp : null,
		departmentId: level === "phong-ban" ? pb : null,
		ownerUserId: chu,
		kind: "cam-ket" as const,
		status: "cong-bo" as const,
		hienThi,
		title,
		publishedAt: CONG_BO,
		position: 990,
	});
	await db.okrObjective.createMany({
		data: [
			mt(NY, KY_NAM, "onehub", "DH5 · mục tiêu công ty kỳ năm"),
			mt(BQ, CHU_KY_Q4, "bo-phan", "DH5 · bộ phận kỳ quý"),
			mt(PQ, CHU_KY_Q4, "phong-ban", "DH5 · phòng ban kỳ quý"),
			mt(X, CHU_KY_Q4, "phong-ban", "DH5 · mục tiêu X người xem hẹp thấy"),
			mt(GT, CHU_KY_Q4, "bo-phan", TEN_GT, "gioi-han"),
		],
	});
	await db.okrKeyResult.create({
		data: {
			id: NYK1,
			objectiveId: NY,
			title: "DH5 · KR công ty kỳ năm",
			kind: "tang-toi",
			ownerUserId: chu,
			startValue: new Prisma.Decimal(0),
			targetValue: new Prisma.Decimal(100),
			currentValue: new Prisma.Decimal(10),
			position: 0,
		},
	});
	await db.okrAlignment.createMany({
		data: [
			{ objectiveId: BQ, targetObjectiveId: null, targetKeyResultId: NYK1 },
			{ objectiveId: PQ, targetObjectiveId: BQ, targetKeyResultId: null },
			{ objectiveId: X, targetObjectiveId: GT, targetKeyResultId: null },
			{ objectiveId: GT, targetObjectiveId: null, targetKeyResultId: N1K1 },
		],
	});
}

beforeAll(async () => {
	app = await dungUngDung();
	await batDauMau();
	await napCaSoDo(db, { luc: CONG_BO });
	await napCaDh5();
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

async function cookie(ma: string): Promise<string> {
	const co = phien.get(ma);
	if (co) return co;
	const moi = await phienMau(ma);
	phien.set(ma, moi);
	return moi;
}

async function quanh(id: string, ma: string): Promise<QuanhMucTieuOutput> {
	const tra = await goi(
		app,
		"okr.quanhMucTieu",
		"query",
		{ objectiveId: id },
		await cookie(ma),
	);
	return quanhMucTieuOutput.parse(ok(tra, `quanh ${id} ${ma}`));
}

const phiaTren = (q: QuanhMucTieuOutput) =>
	new Set(q.nut.filter((n) => n.phia === "tren").map((n) => n.id));
const phiaDuoi = (q: QuanhMucTieuOutput) =>
	new Set(q.nut.filter((n) => n.phia === "duoi").map((n) => n.id));
const canhCua = (q: QuanhMucTieuOutput) =>
	new Set(q.canh.map((c) => `${c.tu}->${c.den} ${c.loai}`));

function khongLapNut(q: QuanhMucTieuOutput) {
	const dem = new Map<string, number>();
	for (const n of q.nut) dem.set(n.id, (dem.get(n.id) ?? 0) + 1);
	for (const [id, n] of dem) if (n > 1) throw new Error(`nut lap: ${id}`);
}

describe("dh5-len", () => {
	test("đường lên tới KR công ty theo ma trận bốn tâm và ca kỳ cha", async () => {
		const pq = await quanh(PQ, QUAN_TRI);
		const gopPq = pq.gopLenCongTy.map((g) => [g.kr?.id ?? null, g.mucTieu.id]);
		if (!gopPq.some(([k, m]) => k === NYK1 && m === NY))
			throw new Error("mat duong len ky cha");
		expect(gopPq).toEqual([[NYK1, NY]]);

		let soTam = 0;

		const p1 = await quanh(P1, QUAN_TRI);
		soTam += 1;
		khongLapNut(p1);
		if (phiaTren(p1).size < 3) throw new Error("doi chung duong: thieu nut");
		if (p1.nut.some((n) => n.id === N1K2))
			throw new Error("kr ngoai duong: n1-k2");
		expect(phiaTren(p1)).toEqual(new Set([A1, N1K1, N1]));
		expect(canhCua(p1)).toEqual(
			new Set([
				`${N1}->${N1K1} cua`,
				`${N1K1}->${A1} gop`,
				`${A1}->${P1} gop`,
				...[...phiaDuoi(p1)].map((k) => `${P1}->${k} cua`),
			]),
		);
		expect(
			p1.gopLenCongTy.map((g) => [g.kr?.id ?? null, g.mucTieu.id]),
		).toEqual([[N1K1, N1]]);

		const p3 = await quanh(P3, QUAN_TRI);
		soTam += 1;
		khongLapNut(p3);
		for (const id of [A1, N1K1, N1])
			expect(p3.nut.filter((n) => n.id === id).length).toBe(1);
		expect(canhCua(p3).has(`${N1}->${P3} gop`)).toBe(true);
		const gopP3 = new Set(
			p3.gopLenCongTy.map((g) => `${g.kr?.id ?? "-"}|${g.mucTieu.id}`),
		);
		expect(gopP3).toEqual(new Set([`${N1K1}|${N1}`, `-|${N1}`]));

		const n1 = await quanh(N1, QUAN_TRI);
		soTam += 1;
		expect(n1.laCongTy).toBe(true);
		expect(phiaTren(n1).size).toBe(0);
		expect(n1.gopLenCongTy).toEqual([]);

		const kg = await quanh(KHONG_GOP, QUAN_TRI);
		soTam += 1;
		expect(phiaTren(kg).size).toBe(0);
		expect(kg.gopLenCongTy).toEqual([]);
		expect(soTam).toBe(4);
	});
});

const thuan = () => {
	const T = "t";
	return [
		mucTieuThuan({
			id: T,
			level: "bo-phan",
			unitId: "A",
			krs: [
				{ id: "t-k1", kind: "tang-toi", progress: 10 },
				{ id: "t-k2", kind: "tang-toi", progress: 20 },
			],
		}),
		mucTieuThuan({
			id: "c1",
			level: "phong-ban",
			unitId: "A1",
			gop: [{ dichMucTieu: T }],
		}),
		mucTieuThuan({
			id: "c2",
			level: "phong-ban",
			unitId: "A2",
			gop: [{ dichMucTieu: T, dichKr: "t-k2" }],
		}),
		mucTieuThuan({
			id: "d",
			level: "phong-ban",
			unitId: "A3",
			gop: [{ dichMucTieu: "c1" }],
		}),
		mucTieuThuan({
			id: "x",
			level: "phong-ban",
			unitId: "B1",
			gop: [{ dichMucTieu: "y" }],
		}),
		mucTieuThuan({
			id: "y",
			level: "phong-ban",
			unitId: "B2",
			gop: [{ dichMucTieu: "x" }],
		}),
	];
};

describe("dh5-xuong", () => {
	test("phía dưới đúng một bậc, vòng góp không lặp nút", async () => {
		const q = gopQuanhMucTieu(thuan(), "t");
		if (!q) throw new Error("tam khong co");
		if (q.nut.some((n) => n.id === "d"))
			throw new Error("xuong qua mot bac: D");
		expect(phiaDuoi(q)).toEqual(new Set(["t-k1", "t-k2", "c1", "c2"]));
		expect(canhCua(q)).toEqual(
			new Set(["t->t-k1 cua", "t->t-k2 cua", "t->c1 gop", "t-k2->c2 gop"]),
		);

		const bd = performance.now();
		const v = gopQuanhMucTieu(thuan(), "x");
		if (!v || performance.now() - bd > 1000)
			throw new Error("vong gop lap nut");
		try {
			khongLapNut(v);
		} catch {
			throw new Error("vong gop lap nut");
		}

		const a = await quanh(A1, QUAN_TRI);
		for (const id of [A1K1, P1, P3]) expect(phiaDuoi(a).has(id)).toBe(true);
	});
});

describe("dh5-quyen", () => {
	test("mục tiêu giới hạn phía dưới và phía trên không lộ; tâm không thấy là NOT_FOUND", async () => {
		const tenG = mucTieuOutput.parse(
			ok(
				await goi(
					app,
					"okr.objective",
					"query",
					{ id: G },
					await cookie(CHU_SO_DO),
				),
				"ten G",
			),
		).title;

		const quanTri = await quanh(A1, QUAN_TRI);
		if (!quanTri.nut.some((n) => n.id === G))
			throw new Error("doi chung duong: quan tri khong thay G");
		const hep = await quanh(A1, NGUOI_XEM_HEP);
		if (JSON.stringify(hep).includes(tenG))
			throw new Error("lo ten muc tieu gioi han");
		expect(hep.nut.some((n) => n.id === G)).toBe(false);
		expect(hep.canh.some((c) => c.tu === G || c.den === G)).toBe(false);

		const cay = cayCanChinhOutput.parse(
			ok(
				await goi(
					app,
					"okr.cayCanChinh",
					"query",
					{ cycleId: CHU_KY_Q4 },
					await cookie(NGUOI_XEM_HEP),
				),
				"cay hep",
			),
		);
		const idCay = new Set<string>();
		const di = (n: { loai: string; id: string; children: unknown[] }) => {
			if (n.loai === "muc-tieu") idCay.add(n.id);
			for (const c of n.children as (typeof n)[]) di(c);
		};
		for (const r of [...cay.roots, ...cay.chuaCanChinh]) di(r);
		for (const n of hep.nut)
			if (n.loai === "muc-tieu" && !idCay.has(n.id))
				throw new Error(`ngoai tap cay: ${n.id}`);

		const soNoi = await db.okrAlignment.count({
			where: { objectiveId: X, targetObjectiveId: GT },
		});
		if (soNoi !== 1) throw new Error("doi chung duong: thieu can chinh X->GT");
		const gtQt = await quanh(GT, QUAN_TRI);
		if (!phiaTren(gtQt).has(N1K1))
			throw new Error("doi chung duong: GT khong gop len n1-k1");
		const xHep = await quanh(X, NGUOI_XEM_HEP);
		if (JSON.stringify(xHep).includes(TEN_GT))
			throw new Error("lo muc tieu gioi han phia tren");
		expect(xHep.nut.some((n) => n.id === GT)).toBe(false);
		expect(xHep.canh.some((c) => c.tu === GT || c.den === GT)).toBe(false);
		expect(xHep.gopLenCongTy).toEqual([]);

		for (const [id, nhan] of [
			[G, "tam gioi han"],
			["khong-co-muc-tieu-nay", "tam khong ton tai"],
		] as const) {
			const tra = await goi(
				app,
				"okr.quanhMucTieu",
				"query",
				{ objectiveId: id },
				await cookie(NGUOI_XEM_HEP),
			);
			if (tra.status !== 404)
				throw new Error(`${nhan} khong tra NOT_FOUND: HTTP ${tra.status}`);
		}
	});
});
