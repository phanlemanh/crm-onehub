import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import type { z } from "zod";
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
	dungUngDung,
	goi,
	goiRest,
	ketThucMau,
	mt,
	ok,
	phienMau,
	type TraLoi,
	tienDongHo,
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
	than: Record<string, unknown>,
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
