import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { dongTuHang } from "@crm/validation/okr-tro-ly";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import type { z } from "zod";
import {
	DE_XUAT_KARA_MAU,
	napDeXuatKaraMau,
} from "../scripts/okr-mau/nap-de-xuat-kara";
import {
	type alignmentTargetsOutput,
	objectiveOutput,
} from "../src/okr/okr.contracts";
import { OKR } from "../src/okr/okr-config";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { CHU_KY_Q4, datPhaQuy4 } from "./soan-okr-san";
import {
	batDauMau,
	CHO_DB,
	dongMau,
	dungUngDung,
	ghiCauHinh,
	gieoDong,
	goi,
	goiRest,
	ketThucMau,
	kr,
	mt,
	NAC_CAU_HINH,
	ok,
	phienMau,
	type TraLoi,
	tienDongHo,
	type Vao,
} from "./tro-ly-okr-san";

const QUAN_TRI = "le-hai-dang";
const TRUONG_KD_BAC = "nguyen-thi-lan";
const TRUONG_KD_NAM = "ly-thanh-tam";
const P = mt("q4-kd-bac-2");
const LY_DO = "Tăng tỷ lệ chốt";
const CAN_CU = "Mảng X chiếm 30% doanh thu Q3";
const T = OKR.thongDiep;

let app: NestExpressApplication;
let cQuanTri = "";
let cTruong = "";
let cNgoai = "";

type AlignmentTargetsOutput = z.infer<typeof alignmentTargetsOutput>;
type Dich = AlignmentTargetsOutput["targets"][number];
type NoiGop = (typeof objectiveOutput)["_output"]["alignments"][number];

async function patchRest(
	ungDung: NestExpressApplication,
	duong: string,
	than: Vao,
	cookie: string,
): Promise<TraLoi> {
	const res = await request(ungDung.getHttpServer())
		.patch(`${REST_BRIDGE_PATH}${duong}`)
		.set("cookie", cookie)
		.set("content-type", "application/json")
		.send(JSON.stringify(than));
	const thanhCong = res.status < 300;
	return {
		status: res.status,
		data: thanhCong ? res.body : undefined,
		loi: thanhCong ? "" : String(res.body?.message ?? ""),
	};
}

async function dichTrong(objectiveId: string, cookie: string): Promise<Dich[]> {
	const ra = ok<AlignmentTargetsOutput>(
		await goi(app, "okr.alignmentTargets", "query", { objectiveId }, cookie),
		"alignmentTargets",
	);
	const da = await db.okrAlignment.findMany({
		where: { objectiveId },
		select: { targetObjectiveId: true, targetKeyResultId: true },
	});
	const khoa = (o: string | null, k: string | null) => `${o ?? ""}|${k ?? ""}`;
	const daGan = new Set(
		da.map((d) => khoa(d.targetObjectiveId, d.targetKeyResultId)),
	);
	return ra.targets.filter(
		(t) =>
			!daGan.has(
				t.keyResultId === null
					? khoa(t.objectiveId, null)
					: khoa(null, t.keyResultId),
			),
	);
}

const vaoDich = (d: Dich) => ({
	targetObjectiveId: d.keyResultId === null ? d.objectiveId : null,
	targetKeyResultId: d.keyResultId,
});

async function canChinhCua(
	objectiveId: string,
	cookie: string,
): Promise<NoiGop[]> {
	const ra = objectiveOutput.parse(
		ok(
			await goi(app, "okr.objective", "query", { id: objectiveId }, cookie),
			"okr.objective",
		),
	);
	return ra.alignments;
}

async function idCanChinh(objectiveId: string, d: Dich): Promise<string> {
	const g = await db.okrAlignment.findFirstOrThrow({
		where: { objectiveId, ...vaoDich(d) },
		select: { id: true },
	});
	return g.id;
}

beforeAll(async () => {
	await batDauMau();
	await datPhaQuy4("lap-ke-hoach");
	app = await dungUngDung();
	cQuanTri = await phienMau(QUAN_TRI);
	cTruong = await phienMau(TRUONG_KD_BAC);
	cNgoai = await phienMau(TRUONG_KD_NAM);
	await ghiCauHinh(app, cQuanTri, NAC_CAU_HINH.bat);
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

describe("l4-gan", () => {
	test(
		"gắn tay mang lý do đã cắt và căn cứ, không mang dấu Kara — tRPC và REST",
		async () => {
			const dich = await dichTrong(P, cTruong);
			if (dich.length < 4) throw new Error(`thieu dich de gan: ${dich.length}`);
			const [d1, d2, d3, d4] = dich as [Dich, Dich, Dich, Dich];
			tienDongHo();
			ok(
				await goi(
					app,
					"okr.addAlignment",
					"mutation",
					{
						objectiveId: P,
						...vaoDich(d1),
						lyDo: `  ${LY_DO}  `,
						canCu: CAN_CU,
					},
					cTruong,
				),
				"gan trpc",
			);
			tienDongHo();
			ok(
				await goiRest(
					app,
					"POST",
					"/okr/alignments",
					{
						objectiveId: P,
						...vaoDich(d2),
						lyDo: `  ${LY_DO}  `,
						canCu: CAN_CU,
					},
					cTruong,
				),
				"gan rest",
			);
			tienDongHo();
			ok(
				await goi(
					app,
					"okr.addAlignment",
					"mutation",
					{ objectiveId: P, ...vaoDich(d3) },
					cTruong,
				),
				"gan khong ly do",
			);
			const ds = await canChinhCua(P, cTruong);
			let kiem = 0;
			for (const d of [d1, d2]) {
				const id = await idCanChinh(P, d);
				const g = ds.find((x) => x.alignmentId === id);
				if (!g || g.lyDo !== LY_DO)
					throw new Error(`ly do gan tay bi roi: ${g?.lyDo ?? "khong co"}`);
				expect([g.canCu, g.lyDoTuKara, g.mucTin]).toEqual([
					CAN_CU,
					false,
					"co-so-lieu",
				]);
				kiem++;
			}
			expect(kiem).toBe(2);
			const id3 = await idCanChinh(P, d3);
			const g3 = ds.find((x) => x.alignmentId === id3);
			expect([g3?.lyDo, g3?.canCu, g3?.lyDoTuKara, g3?.mucTin]).toEqual([
				null,
				null,
				false,
				"chua-co-ly-do",
			]);
			const truoc = await db.okrAlignment.count({ where: { objectiveId: P } });
			tienDongHo();
			const tuChoi = await goi(
				app,
				"okr.addAlignment",
				"mutation",
				{ objectiveId: P, ...vaoDich(d4), lyDo: "   ", canCu: CAN_CU },
				cTruong,
			);
			expect([tuChoi.status, tuChoi.loi]).toEqual([
				400,
				T.canChinh.canCuCanLyDo,
			]);
			const sau = await db.okrAlignment.count({ where: { objectiveId: P } });
			if (sau !== truoc) throw new Error("tao can chinh khi bi tu choi");
		},
		CHO_DB,
	);
});

type CaQuyen = {
	ten: string;
	dung: () => Promise<{ id: string; cookie: string; tra: () => Promise<void> }>;
};

async function ganTrucTiep(objectiveId: string): Promise<string> {
	const dich = await dichTrong(objectiveId, cQuanTri).catch(() => []);
	const d = dich[0];
	const g = await db.okrAlignment.create({
		data: {
			objectiveId,
			...(d
				? vaoDich(d)
				: { targetObjectiveId: mt("n1"), targetKeyResultId: null }),
			lyDo: "Lý do gốc",
			canCu: null,
			lyDoTuKara: false,
		},
	});
	return g.id;
}

describe("l4-quyen", () => {
	test(
		"sửa lý do bị từ chối đúng như gỡ căn chỉnh ở năm ca, căn chỉnh không đổi",
		async () => {
			const giuNguyen = async () => {};
			const CA: CaQuyen[] = [
				{
					ten: "nguoi-khong-sua-duoc",
					dung: async () => ({
						id: await ganTrucTiep(mt("q4-kd-bac-1")),
						cookie: cNgoai,
						tra: giuNguyen,
					}),
				},
				{
					ten: "id-khong-co",
					dung: async () => ({
						id: "khong-co-can-chinh-nay",
						cookie: cTruong,
						tra: giuNguyen,
					}),
				},
				{
					ten: "muc-tieu-da-bo",
					dung: async () => ({
						id: await ganTrucTiep(mt("q4-kho-van-bo")),
						cookie: cQuanTri,
						tra: giuNguyen,
					}),
				},
				{
					ten: "muc-tieu-cho-duyet",
					dung: async () => ({
						id: await ganTrucTiep(mt("q4-kd-nam-3")),
						cookie: cQuanTri,
						tra: giuNguyen,
					}),
				},
				{
					ten: "chu-ky-khong-ghi-duoc",
					dung: async () => {
						const id = await ganTrucTiep(mt("q4-kd-bac-1"));
						await db.okrCycle.update({
							where: { id: CHU_KY_Q4 },
							data: { phase: "da-dong" },
						});
						return {
							id,
							cookie: cTruong,
							tra: () => datPhaQuy4("lap-ke-hoach"),
						};
					},
				},
			];
			let chay = 0;
			for (const ca of CA) {
				const { id, cookie, tra } = await ca.dung();
				try {
					const truoc = await db.okrAlignment.findUnique({ where: { id } });
					tienDongHo();
					const sua = await goi(
						app,
						"okr.suaLyDoCanChinh",
						"mutation",
						{ id, lyDo: "Lý do mới", canCu: null },
						cookie,
					);
					const go = await goi(
						app,
						"okr.removeAlignment",
						"mutation",
						{ id },
						cookie,
					);
					if (sua.status === 200)
						throw new Error(`sua ly do lot qua: ${ca.ten}`);
					expect(`${ca.ten}: ${sua.status} ${sua.loi}`).toBe(
						`${ca.ten}: ${go.status} ${go.loi}`,
					);
					const sau = await db.okrAlignment.findUnique({ where: { id } });
					expect(sau?.lyDo ?? null).toBe(truoc?.lyDo ?? null);
					chay++;
				} finally {
					await tra();
				}
			}
			expect(chay).toBe(5);
			const id = await ganTrucTiep(mt("q4-kd-bac-1"));
			tienDongHo();
			ok(
				await goi(
					app,
					"okr.suaLyDoCanChinh",
					"mutation",
					{ id, lyDo: "Lý do mới", canCu: null },
					cTruong,
				),
				"doi chung duong",
			);
			await db.okrAlignment.deleteMany({
				where: { lyDo: { in: ["Lý do gốc", "Lý do mới"] } },
			});
		},
		CHO_DB,
	);
});

const Q1 = mt("q4-kd-bac-1");
const Q2 = mt("q4-kd-nam-2");
const LY_DO_KARA = "Bán lẻ miền Bắc kéo doanh thu hợp đồng mới của quý.";
const CAN_CU_KARA = "Bán lẻ miền Bắc đạt 6 tỷ đồng hợp đồng chốt được";
const daNhan = { a: "", b: "" };

async function nhanhTrong(
	objectiveId: string,
	cookie: string,
): Promise<Dich[]> {
	const da = await db.okrAlignment.findMany({
		where: { objectiveId },
		select: {
			targetObjectiveId: true,
			targetKeyResult: { select: { objectiveId: true } },
		},
	});
	const goc = new Set(
		da.map((d) => d.targetObjectiveId ?? d.targetKeyResult?.objectiveId),
	);
	const theoGoc = new Map<string, Dich>();
	for (const d of await dichTrong(objectiveId, cookie))
		if (!goc.has(d.objectiveId) && !theoGoc.has(d.objectiveId))
			theoGoc.set(d.objectiveId, d);
	return [...theoGoc.values()];
}

async function gieoCanChinh(
	objectiveId: string,
	cookie: string,
	can: { lyDo: string; canCu: string | null }[],
): Promise<{ id: string; dich: Dich }[]> {
	const nhanh = await nhanhTrong(objectiveId, cookie);
	if (nhanh.length < can.length)
		throw new Error(`thieu nhanh de gieo: ${nhanh.length} < ${can.length}`);
	const dich = nhanh.slice(0, can.length);
	const ids = await gieoDong(
		objectiveId,
		null,
		can.map((c, i) =>
			dongMau({
				loai: "can-chinh",
				objectiveId,
				...vaoDich(dich[i] as Dich),
				lyDo: c.lyDo,
				canCu: c.canCu,
			}),
		),
	);
	return ids.map((id, i) => ({ id, dich: dich[i] as Dich }));
}

const quyet = (vao: Vao, cookie: string) =>
	goi(app, "okr.troLyQuyet", "mutation", vao, cookie);
const quyetRest = (deXuatId: string, than: Vao, cookie: string) =>
	goiRest(
		app,
		"POST",
		"/okr/assistant/suggestions/{deXuatId}/decision",
		{ deXuatId, ...than },
		cookie,
	);

async function canChinhTheoDich(
	objectiveId: string,
	d: Dich,
	cookie: string,
): Promise<NoiGop | undefined> {
	const id = await idCanChinh(objectiveId, d);
	return (await canChinhCua(objectiveId, cookie)).find(
		(g) => g.alignmentId === id,
	);
}

let gieoQ1: { id: string; dich: Dich }[] = [];

async function canGieoQ1(): Promise<{ id: string; dich: Dich }[]> {
	if (gieoQ1.length === 0)
		gieoQ1 = await gieoCanChinh(Q1, cTruong, [
			{ lyDo: LY_DO_KARA, canCu: CAN_CU_KARA },
			{ lyDo: `${LY_DO_KARA} Không số.`, canCu: null },
		]);
	return gieoQ1;
}

async function canNhanA(): Promise<string> {
	if (daNhan.a) return daNhan.a;
	const [co] = (await canGieoQ1()) as [{ id: string; dich: Dich }];
	tienDongHo();
	ok(await quyet({ deXuatId: co.id, cach: "nhan" }, cTruong), "nhan a");
	daNhan.a = await idCanChinh(Q1, co.dich);
	return daNhan.a;
}

async function canNhanB(): Promise<string> {
	if (daNhan.b) return daNhan.b;
	const [d] = (await gieoCanChinh(Q2, cNgoai, [
		{ lyDo: LY_DO_KARA, canCu: CAN_CU_KARA },
	])) as [{ id: string; dich: Dich }];
	tienDongHo();
	ok(
		await quyet(
			{ deXuatId: d.id, cach: "sua", giaTri: LY_DO_KARA, canCu: CAN_CU_KARA },
			cNgoai,
		),
		"nhan b y chu",
	);
	daNhan.b = await idCanChinh(Q2, d.dich);
	return daNhan.b;
}

describe("l4-danh-sach", () => {
	test(
		"troLyDanhSach trả căn cứ của dòng căn chỉnh Kara",
		async () => {
			await canGieoQ1();
			const ds = ok<{ dong: { id: string; canCu: string | null }[] }>(
				await goi(
					app,
					"okr.troLyDanhSach",
					"query",
					{ objectiveId: Q1 },
					cTruong,
				),
				"troLyDanhSach",
			);
			const [co, khong] = gieoQ1 as [
				{ id: string; dich: Dich },
				{ id: string; dich: Dich },
			];
			const dCo = ds.dong.find((d) => d.id === co.id);
			if (dCo?.canCu !== CAN_CU_KARA)
				throw new Error(
					`danh sach roi can cu: ${dCo?.canCu ?? "khong co dong"}`,
				);
			expect(ds.dong.find((d) => d.id === khong.id)?.canCu).toBeNull();
		},
		CHO_DB,
	);
});

describe("l4-nhan", () => {
	test(
		"nhận đề xuất ghi lý do, căn cứ, dấu Kara — tRPC và REST; Hoàn tác gỡ đúng căn chỉnh",
		async () => {
			const [co, khong] = (await canGieoQ1()) as [
				{ id: string; dich: Dich },
				{ id: string; dich: Dich },
			];
			tienDongHo();
			expect(
				ok<{ ok: boolean }>(
					await quyet({ deXuatId: co.id, cach: "nhan" }, cTruong),
					"nhan trpc",
				).ok,
			).toBe(true);
			tienDongHo();
			expect(
				ok<{ ok: boolean }>(
					await quyetRest(khong.id, { cach: "nhan" }, cTruong),
					"nhan rest",
				).ok,
			).toBe(true);
			const g1 = await canChinhTheoDich(Q1, co.dich, cTruong);
			if (g1?.lyDo !== LY_DO_KARA)
				throw new Error(`nhan de xuat roi ly do: ${g1?.lyDo ?? "khong co"}`);
			expect([g1.canCu, g1.lyDoTuKara, g1.mucTin]).toEqual([
				CAN_CU_KARA,
				true,
				"co-so-lieu",
			]);
			const g2 = await canChinhTheoDich(Q1, khong.dich, cTruong);
			expect([g2?.lyDo, g2?.canCu, g2?.lyDoTuKara, g2?.mucTin]).toEqual([
				`${LY_DO_KARA} Không số.`,
				null,
				true,
				"dat-cuoc",
			]);
			daNhan.a = g1.alignmentId;
			tienDongHo();
			ok(
				await goi(
					app,
					"okr.removeAlignment",
					"mutation",
					{ id: g2?.alignmentId },
					cTruong,
				),
				"hoan tac",
			);
			const con = (await canChinhCua(Q1, cTruong)).map((g) => g.alignmentId);
			expect(con).toContain(g1.alignmentId);
			expect(con).not.toContain(g2?.alignmentId);
		},
		CHO_DB,
	);
});

describe("l4-sua-de-xuat", () => {
	test(
		"sửa rồi nhận: chữ người, mất dấu Kara; y chữ Kara thì như nhận — tRPC và REST",
		async () => {
			const [d1, d2, d3] = (await gieoCanChinh(Q2, cNgoai, [
				{ lyDo: LY_DO_KARA, canCu: CAN_CU_KARA },
				{ lyDo: LY_DO_KARA, canCu: CAN_CU_KARA },
				{ lyDo: LY_DO_KARA, canCu: CAN_CU_KARA },
			])) as [
				{ id: string; dich: Dich },
				{ id: string; dich: Dich },
				{ id: string; dich: Dich },
			];
			const L2 = "Lý do người duyệt viết lại";
			const C2 = "Căn cứ người duyệt";
			const C3 = "Căn cứ gửi qua REST";
			tienDongHo();
			const thieu = await quyet(
				{ deXuatId: d1.id, cach: "sua", canCu: C2 },
				cNgoai,
			);
			expect([thieu.status, thieu.loi]).toEqual([400, T.canChinh.canCuCanLyDo]);
			const thieuGiaTri = await quyet({ deXuatId: d1.id, cach: "sua" }, cNgoai);
			expect([thieuGiaTri.status, thieuGiaTri.loi]).toEqual([
				400,
				T.troLy.canGiaTri,
			]);
			tienDongHo();
			ok(
				await quyet(
					{ deXuatId: d1.id, cach: "sua", giaTri: L2, canCu: C2 },
					cNgoai,
				),
				"sua trpc",
			);
			const g1 = await canChinhTheoDich(Q2, d1.dich, cNgoai);
			if (g1?.lyDoTuKara !== false)
				throw new Error("sua roi nhan van dau Kara");
			expect([g1.lyDo, g1.canCu]).toEqual([L2, C2]);
			const h1 = await db.okrDeXuat.findUniqueOrThrow({ where: { id: d1.id } });
			expect([h1.trangThai, h1.giaTriCuoi]).toEqual(["sua", L2]);
			tienDongHo();
			ok(
				await quyetRest(
					d2.id,
					{ cach: "sua", giaTri: `${L2} REST`, canCu: C3 },
					cNgoai,
				),
				"sua rest",
			);
			const g2 = await canChinhTheoDich(Q2, d2.dich, cNgoai);
			expect([g2?.lyDo, g2?.canCu, g2?.lyDoTuKara]).toEqual([
				`${L2} REST`,
				C3,
				false,
			]);
			tienDongHo();
			ok(
				await quyet(
					{
						deXuatId: d3.id,
						cach: "sua",
						giaTri: `  ${LY_DO_KARA}  `,
						canCu: CAN_CU_KARA,
					},
					cNgoai,
				),
				"sua y chu",
			);
			const g3 = await canChinhTheoDich(Q2, d3.dich, cNgoai);
			if (g3?.lyDoTuKara !== true) throw new Error("sua y chu van ha co");
			expect([g3.lyDo, g3.canCu]).toEqual([LY_DO_KARA, CAN_CU_KARA]);
			const h3 = await db.okrDeXuat.findUniqueOrThrow({ where: { id: d3.id } });
			expect(h3.trangThai).toBe("nhan");
			daNhan.b = g3.alignmentId;
		},
		CHO_DB,
	);
});

describe("l4-sua-sau-gan", () => {
	test(
		"sửa lý do sau khi gắn: hạ dấu Kara, một dòng vết; y nguyên thì không ghi — tRPC và REST",
		async () => {
			const a = await canNhanA();
			const b = await canNhanB();
			const soVet = () =>
				db.okrTrail.count({
					where: { objectiveId: Q1, action: "sua-ly-do-can-chinh" },
				});
			const truoc = await db.okrAlignment.findUniqueOrThrow({
				where: { id: a },
			});
			const v0 = await soVet();
			tienDongHo();
			ok(
				await goi(
					app,
					"okr.suaLyDoCanChinh",
					"mutation",
					{ id: a, lyDo: "Lý do người", canCu: "Căn cứ người" },
					cTruong,
				),
				"sua trpc",
			);
			const doc = async () =>
				(await canChinhCua(Q1, cTruong)).find((g) => g.alignmentId === a);
			const s1 = await doc();
			if (s1?.lyDoTuKara !== false)
				throw new Error("co Kara con sau khi nguoi sua");
			expect([s1.lyDo, s1.canCu, s1.mucTin]).toEqual([
				"Lý do người",
				"Căn cứ người",
				"co-so-lieu",
			]);
			expect(await soVet()).toBe(v0 + 1);
			const vet = await db.okrTrail.findFirstOrThrow({
				where: { objectiveId: Q1, action: "sua-ly-do-can-chinh" },
				orderBy: { at: "desc" },
			});
			expect([vet.before, vet.after]).toEqual([
				{ alignmentId: a, lyDo: truoc.lyDo, canCu: truoc.canCu },
				{ alignmentId: a, lyDo: "Lý do người", canCu: "Căn cứ người" },
			]);
			tienDongHo();
			ok(
				await patchRest(
					app,
					`/okr/alignments/${a}`,
					{ lyDo: "Lý do REST", canCu: "Căn cứ REST" },
					cTruong,
				),
				"sua rest moi",
			);
			const s2 = await doc();
			expect([s2?.lyDo, s2?.canCu, s2?.lyDoTuKara]).toEqual([
				"Lý do REST",
				"Căn cứ REST",
				false,
			]);
			expect(await soVet()).toBe(v0 + 2);
			tienDongHo();
			ok(
				await patchRest(
					app,
					`/okr/alignments/${a}`,
					{ lyDo: "Lý do REST", canCu: "Căn cứ REST" },
					cTruong,
				),
				"sua rest y nguyen",
			);
			expect(await soVet()).toBe(v0 + 2);
			const bTruoc = await db.okrAlignment.findUniqueOrThrow({
				where: { id: b },
			});
			tienDongHo();
			ok(
				await goi(
					app,
					"okr.suaLyDoCanChinh",
					"mutation",
					{ id: b, lyDo: bTruoc.lyDo, canCu: bTruoc.canCu },
					cNgoai,
				),
				"b y nguyen",
			);
			const bSau = await db.okrAlignment.findUniqueOrThrow({
				where: { id: b },
			});
			expect(bSau.lyDoTuKara).toBe(true);
			tienDongHo();
			ok(
				await goi(
					app,
					"okr.suaLyDoCanChinh",
					"mutation",
					{ id: a, lyDo: "  ", canCu: null },
					cTruong,
				),
				"xoa ly do",
			);
			expect((await doc())?.mucTin).toBe("chua-co-ly-do");
		},
		CHO_DB,
	);
});

const CA_MAN = JSON.parse(
	readFileSync(
		join(
			import.meta.dir,
			"../../../_acceptance/gan-tay-va-kara-co-ly-do/rang/ca-man.json",
		),
		"utf8",
	),
) as {
	nguoiXem: string;
	mucTieu: string;
	dichKr: string;
	lyDo: string;
	canCu: string;
};

let taskMau = "";
async function canNapMau(): Promise<string> {
	if (!taskMau) taskMau = await napDeXuatKaraMau();
	return taskMau;
}

describe("l4-mau", () => {
	test(
		"bộ mẫu có đề xuất căn chỉnh của Kara mang căn cứ, ghi qua công cụ thật, không chèn thẳng bảng",
		async () => {
			const taskId = await canNapMau();
			const hang = await db.okrDeXuat.findMany({
				where: { loai: "can-chinh", trangThai: "cho", taskId },
			});
			const coCanCu = hang.filter(
				(h) => dongTuHang(h).canCu === DE_XUAT_KARA_MAU.canCu,
			);
			expect(coCanCu.length).toBeGreaterThanOrEqual(1);
			const viec = await db.agentTask.findUniqueOrThrow({
				where: { id: taskId },
				select: { kind: true },
			});
			expect(viec.kind).toBe("okr-de-xuat");
			const thuMuc = join(import.meta.dir, "../scripts/okr-mau");
			const chenThang = readdirSync(thuMuc)
				.filter((t) => t.endsWith(".ts"))
				.flatMap((t) =>
					/okrDeXuat\.create(Many)?\(/.test(
						readFileSync(join(thuMuc, t), "utf8"),
					)
						? [t]
						: [],
				);
			expect(chenThang).toEqual([]);
			const boGhi = readFileSync(
				join(import.meta.dir, "../../agent/agent/lib/okr/nop-de-xuat.ts"),
				"utf8",
			);
			expect(boGhi.match(/okrDeXuat\.createMany\(/g)?.length).toBe(1);
			expect(CA_MAN.mucTieu).toBe(DE_XUAT_KARA_MAU.mucTieu);
			expect([CA_MAN.lyDo, CA_MAN.canCu]).toEqual([
				DE_XUAT_KARA_MAU.lyDo,
				DE_XUAT_KARA_MAU.canCu,
			]);
		},
		CHO_DB,
	);
});

describe("l4-man-doc-lai", () => {
	test(
		"ca màn: người xem thấy đề xuất mẫu, nhận thì có số liệu với dấu Kara, bỏ căn cứ thì đặt cược",
		async () => {
			const mtMan = mt(CA_MAN.mucTieu);
			const cXem = await phienMau(CA_MAN.nguoiXem);
			await canNapMau();
			const ds = ok<{
				dong: {
					id: string;
					loai: string;
					lyDo: string;
					canCu: string | null;
				}[];
			}>(
				await goi(
					app,
					"okr.troLyDanhSach",
					"query",
					{ objectiveId: mtMan },
					cXem,
				),
				"troLyDanhSach ca man",
			);
			const canChinh = ds.dong.filter((d) => d.loai === "can-chinh");
			expect(canChinh.length).toBe(1);
			const d = canChinh[0] as (typeof canChinh)[number];
			expect([d.lyDo, d.canCu]).toEqual([CA_MAN.lyDo, CA_MAN.canCu]);
			tienDongHo();
			ok(await quyet({ deXuatId: d.id, cach: "nhan" }, cXem), "nhan ca man");
			const dichKr = await db.okrKeyResult.findUniqueOrThrow({
				where: { id: kr(CA_MAN.dichKr) },
				select: { id: true },
			});
			const g = (await canChinhCua(mtMan, cXem)).find(
				(x) => x.targetKeyResultId === dichKr.id,
			);
			expect([g?.lyDo, g?.canCu, g?.lyDoTuKara, g?.mucTin]).toEqual([
				CA_MAN.lyDo,
				CA_MAN.canCu,
				true,
				"co-so-lieu",
			]);
			tienDongHo();
			ok(
				await goi(
					app,
					"okr.suaLyDoCanChinh",
					"mutation",
					{ id: g?.alignmentId, lyDo: CA_MAN.lyDo, canCu: null },
					cXem,
				),
				"bo can cu",
			);
			const sau = (await canChinhCua(mtMan, cXem)).find(
				(x) => x.alignmentId === g?.alignmentId,
			);
			expect([sau?.lyDo, sau?.canCu, sau?.lyDoTuKara, sau?.mucTin]).toEqual([
				CA_MAN.lyDo,
				null,
				false,
				"dat-cuoc",
			]);
		},
		CHO_DB,
	);
});
