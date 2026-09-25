import { beforeAll, describe, expect, test } from "bun:test";
import { db, setPrismaLogSink } from "@crm/db";
import {
	type AiHoacCookie,
	CHUONG_TRINH_RONG,
	dungSan,
	goi,
	goiQuery,
	type Json,
	kyDangChay,
	ma,
	ok,
	phien,
} from "./okr-san";

dungSan();

const NGUONG_MS = 1000;

async function gieo(
	cycleId: string,
	soBoPhan: number,
	moiBoPhan: number,
	moiDonVi: number,
	moiMucTieu: number,
) {
	const boPhan = await db.division.createManyAndReturn({
		data: Array.from({ length: soBoPhan }, (_, i) => ({
			name: ma(`hn-bp-${i}`),
			position: 1000 + i,
		})),
		select: { id: true },
	});
	const phongBan = await db.department.createManyAndReturn({
		data: boPhan.flatMap((b, i) =>
			Array.from({ length: moiBoPhan }, (_, j) => ({
				name: ma(`hn-pb-${i}-${j}`),
				position: 1000 + i * moiBoPhan + j,
				divisionId: b.id,
			})),
		),
		select: { id: true, divisionId: true },
	});
	const bayGio = new Date();
	const mucTieu = await db.okrObjective.createManyAndReturn({
		data: phongBan.flatMap((p) =>
			Array.from({ length: moiDonVi }, () => ({
				cycleId,
				level: "phong-ban",
				departmentId: p.id,
				ownerUserId: phien.quan.nguoi,
				kind: "cam-ket",
				status: "cong-bo",
				title: ma("hn-mt"),
				publishedAt: bayGio,
			})),
		),
		select: { id: true },
	});
	await db.okrKeyResult.createMany({
		data: mucTieu.flatMap((m) =>
			Array.from({ length: moiMucTieu }, (_, k) => ({
				objectiveId: m.id,
				title: ma("hn-kr"),
				kind: "tang-toi",
				ownerUserId: phien.quan.nguoi,
				startValue: 0,
				targetValue: 100,
				currentValue: 10 * k,
				position: k,
				startLockedAt: bayGio,
			})),
		),
	});
	return { boPhan: boPhan[0]?.id ?? "", soMucTieu: mucTieu.length };
}

async function doLuot(
	thuTuc: string,
	vao: Json,
	ai: AiHoacCookie = "quan",
): Promise<{ ms: number; cau: number }> {
	let cau = 0;
	setPrismaLogSink((r) => {
		if (r.level === "query") cau += 1;
	});
	const bat = performance.now();
	const tra = await goiQuery(thuTuc, ai, vao);
	const ms = performance.now() - bat;
	setPrismaLogSink(null);
	expect(`${thuTuc}: HTTP ${tra.status}`).toBe(`${thuTuc}: HTTP 200`);
	return { ms, cau };
}

const DEM_DUOC = process.env.PRISMA_LOG_QUERIES === "true";

type Cap = readonly [string, Json, Json];

let cap: Cap[] = [];

describe("hieu-nang", () => {
	beforeAll(async () => {
		ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
		const kyNho = await kyDangChay("hn-nho");
		const kyLon = await kyDangChay("hn-lon");
		const nho = await gieo(kyNho, 1, 5, 1, 1);
		const lon = await gieo(kyLon, 10, 5, 8, 5);
		expect([nho.soMucTieu, lon.soMucTieu]).toEqual([5, 400]);
		const loc = {
			phuTrach: [phien.quan.nguoi],
			loai: ["cam-ket"],
			trangThai: ["cong-bo"],
		};
		cap = [
			["okr.toanCanh", { cycleId: kyNho }, { cycleId: kyLon }],
			[
				"okr.danhSach",
				{ cycleId: kyNho, unit: { loai: "bp", id: nho.boPhan }, loc },
				{ cycleId: kyLon, unit: { loai: "bp", id: lon.boPhan }, loc },
			],
			["okr.sucKhoe", { cycleId: kyNho }, { cycleId: kyLon }],
		];
	}, 120_000);

	test("hieu-nang: 50 phong ban × 2.000 KR duoi 1 giay", async () => {
		expect(cap.length).toBe(3);
		for (const [thuTuc, , vaoLon] of cap) {
			await doLuot(thuTuc, vaoLon);
			const b = await doLuot(thuTuc, vaoLon);
			console.log(`${thuTuc}: ${Math.round(b.ms)} ms ở 50 đơn vị`);
			expect(
				`${thuTuc}: ${b.ms < NGUONG_MS ? "dưới" : "TRÊN"} ${NGUONG_MS} ms`,
			).toBe(`${thuTuc}: dưới ${NGUONG_MS} ms`);
		}
	}, 120_000);

	test.if(DEM_DUOC)(
		"hieu-nang: so cau truy van khong tang theo so don vi",
		async () => {
			expect(cap.length).toBe(3);
			for (const [thuTuc, vaoNho, vaoLon] of cap) {
				await doLuot(thuTuc, vaoLon);
				const a = await doLuot(thuTuc, vaoNho);
				const b = await doLuot(thuTuc, vaoLon);
				expect(`${thuTuc} đếm được câu truy vấn: ${a.cau > 0}`).toBe(
					`${thuTuc} đếm được câu truy vấn: true`,
				);
				expect(
					`${thuTuc}: số câu 5 đơn vị = ${a.cau}, 50 đơn vị = ${b.cau}`,
				).toBe(`${thuTuc}: số câu 5 đơn vị = ${a.cau}, 50 đơn vị = ${a.cau}`);
			}
		},
		120_000,
	);
});
