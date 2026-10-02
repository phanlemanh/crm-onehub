import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	spyOn,
	test,
} from "bun:test";
import { db, Prisma } from "@crm/db";
import {
	KET_QUA_KIEM_SAN_SANG,
	type KetQuaKiemSanSang,
} from "@crm/db/okr-tro-ly-danh-muc";
import type { OkrProgramSua } from "@crm/validation/okr-chuong-trinh";
import type { NguonKhoaHien } from "@crm/validation/okr-tro-ly";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { BackfillService } from "../src/backfill/backfill.service";
import { createApp } from "../src/create-app";
import { aiChiTieuOutput } from "../src/okr/okr.contracts";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const suffix = process.env.TEST_RUN_ID ?? "tro-ly-okr-nguon-khoa";
const id = (phan: string) => `tnk-${suffix}-${phan}`;
const BAY_GIO = new Date("2036-07-20T12:00:00+07:00");
const THANG_DOI_SOAT = "2036-06";
const PHUT_MS = 60_000;

let app: NestExpressApplication;
const nguoi = { quan: id("quan"), thuong: id("thuong") };
const cookie = { quan: "", thuong: "" };

const BANG_NGUON = {
	"san-sang-khoa-rieng": { nguonKhoa: "khoa-rieng", bat: true },
	"san-sang-khoa-chung": { nguonKhoa: "khoa-chung", bat: true },
	"san-sang-oidc": { nguonKhoa: "oidc", bat: true },
	"san-sang": { nguonKhoa: "chua-ro", bat: true },
	"chua-co-khoa-mo-hinh": { nguonKhoa: null, bat: false },
} as const satisfies Record<
	KetQuaKiemSanSang,
	{ nguonKhoa: NguonKhoaHien; bat: boolean }
>;

async function goiTrpc(
	thuTuc: string,
	ai: keyof typeof cookie,
	vao?: OkrProgramSua,
): Promise<{ status: number; data: unknown }> {
	const r =
		vao === undefined
			? await request(app.getHttpServer())
					.get(`/api/trpc/${thuTuc}`)
					.set("cookie", cookie[ai])
			: await request(app.getHttpServer())
					.post(`/api/trpc/${thuTuc}`)
					.set("cookie", cookie[ai])
					.set("content-type", "application/json")
					.send(JSON.stringify(vao));
	return { status: r.status, data: r.body?.result?.data };
}

beforeAll(async () => {
	setSystemTime(BAY_GIO);
	app = await createApp();
	spyOn(app.get(BackfillService), "auto").mockResolvedValue({ started: false });
	spyOn(app.get(AgentTriggerService), "canReachAgent").mockReturnValue(true);
	await gieoThanhVien(nguoi.quan, "admin");
	await gieoThanhVien(nguoi.thuong, "member");
	cookie.quan = (await mintPhien(nguoi.quan)).cookie;
	cookie.thuong = (await mintPhien(nguoi.thuong)).cookie;
	await db.aiDoiSoat.upsert({
		where: { thang: THANG_DOI_SOAT },
		create: {
			thang: THANG_DOI_SOAT,
			tuNgay: new Date("2036-06-01T00:00:00Z"),
			denNgay: new Date("2036-06-30T00:00:00Z"),
			soSoUsd: new Prisma.Decimal(1),
			ketQua: "khop",
		},
		update: {},
	});
	const r = await goiTrpc("okr.setProgram", "quan", {
		aiOn: true,
		aiDeXuatPhamVi: "toan-cong-ty",
		aiTranThangUsd: 9,
	});
	expect(r.status).toBe(200);
});

afterAll(async () => {
	await db.agentTask.deleteMany({
		where: {
			kind: "okr-kiem-san-sang",
			OR: [
				{ subject: { startsWith: id("") } },
				{ dueAt: { gte: new Date(BAY_GIO.getTime() - 60 * PHUT_MS) } },
			],
		},
	});
	await db.aiDoiSoat.deleteMany({ where: { thang: THANG_DOI_SOAT } });
	await db.okrProgramConfig.deleteMany({
		where: { createdById: { in: Object.values(nguoi) } },
	});
	await db.session.deleteMany({
		where: { userId: { in: Object.values(nguoi) } },
	});
	await db.member.deleteMany({
		where: { userId: { in: Object.values(nguoi) } },
	});
	await db.user.deleteMany({ where: { id: { in: Object.values(nguoi) } } });
	await app.close();
	setSystemTime();
});

describe("nguon-khoa", () => {
	test("nguon-khoa: moi ket qua kiem ra dung nguonKhoa, bang rut tu KET_QUA_KIEM_SAN_SANG", async () => {
		await db.agentTask.updateMany({
			where: { kind: "okr-kiem-san-sang", finishedAt: null },
			data: {
				finishedAt: new Date(BAY_GIO.getTime() - 50 * PHUT_MS),
				outcome: "chua-co-khoa-mo-hinh",
			},
		});
		let so = 0;
		for (const [i, ketQua] of KET_QUA_KIEM_SAN_SANG.entries()) {
			const dong = BANG_NGUON[ketQua];
			if (!dong) throw new Error(`ket qua chua co dong: ${ketQua}`);
			const luc = new Date(BAY_GIO.getTime() - (40 - i) * PHUT_MS);
			await db.agentTask.create({
				data: {
					kind: "okr-kiem-san-sang",
					reason: "okr-kiem-san-sang",
					subject: id(`kiem-${i}`),
					dueAt: luc,
					finishedAt: luc,
					outcome: ketQua,
				},
			});
			const r = await goiTrpc("okr.aiChiTieu", "quan");
			expect(r.status).toBe(200);
			const ra = aiChiTieuOutput
				.pick({ nguonKhoa: true, sanSang: true })
				.parse(r.data);
			expect(ra.nguonKhoa, `nguon lech: ${ketQua}`).toBe(dong.nguonKhoa);
			expect(ra.sanSang.bat, `san sang lech: ${ketQua}`).toBe(dong.bat);
			so += 1;
		}
		console.log(`nguon-khoa: ${so}/${KET_QUA_KIEM_SAN_SANG.length} ket qua`);
		expect(so).toBe(Object.keys(BANG_NGUON).length);
	}, 60_000);

	test("nguon-khoa: thanh vien van bi tu choi", async () => {
		expect((await goiTrpc("okr.aiChiTieu", "thuong")).status).toBe(403);
	}, 30_000);
});
