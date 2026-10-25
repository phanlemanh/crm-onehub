import { afterAll, beforeAll, describe, expect, spyOn, test } from "bun:test";
import { API_KEY_HEADER, auth } from "@crm/auth";
import { db } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { BackfillService } from "../src/backfill/backfill.service";
import { createApp } from "../src/create-app";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { gieoThanhVien } from "./phien-thu";

const suffix = process.env.TEST_RUN_ID ?? "okr-khoa-api";
const id = (phan: string) => `oka-${suffix}-${phan}`;

const CAU = {
	khongSua:
		"Chỉ người phụ trách KR hoặc người sửa được mục tiêu mới sửa KR này.",
	khongNhanApi: "KR này không nhận số qua khoá API.",
	kyDaKhoa: "Chu kỳ này ở pha chấm điểm hoặc đã đóng — không ghi được nữa.",
	kyDaQua: "Chu kỳ đã qua ngày cuối — không ghi số nữa.",
	kyChuaToi: "Chu kỳ chưa tới ngày đầu — chưa ghi số được.",
	mocChi01: "KR kiểu «mốc» chỉ nhận 0 (chưa xong) hoặc 1 (xong).",
	phanTramNgoai: "KR kiểu «phần trăm» chỉ nhận giá trị trong 0–100.",
	daBo: "Mục tiêu này đã bỏ.",
} as const;

let app: NestExpressApplication;

const s = {
	p: "",
	okr: "",
	member: "",
	khoaP: "",
	khoaOkr: "",
	khoaMember: "",
	krApiP: "",
	krApiOkr: "",
	krCrmP: "",
	krApiPhanTram: "",
	krApiMoc: "",
	krApiChamDiem: "",
	krApiQuaHan: "",
	krApiChuaToi: "",
	krApiDaBo: "",
};
const taoCac = { user: [] as string[], cycle: [] as string[] };

async function taoCycle(
	phase: string,
	startsOn: string,
	endsOn: string,
): Promise<string> {
	const r = await db.okrCycle.create({
		data: {
			kind: "quy",
			name: id(`ky-${phase}-${taoCac.cycle.length}`),
			startsOn: new Date(`${startsOn}T00:00:00Z`),
			endsOn: new Date(`${endsOn}T00:00:00Z`),
			phase,
			updateWeekday: 1,
		},
	});
	taoCac.cycle.push(r.id);
	return r.id;
}

async function taoKr(
	cycleId: string,
	ownerUserId: string,
	tuy: {
		kind?: string;
		nguon?: "api" | "crm";
		trangThai?: "nhap" | "cong-bo" | "da-bo";
	} = {},
): Promise<string> {
	const objective = await db.okrObjective.create({
		data: {
			cycleId,
			level: "ca-nhan",
			personUserId: ownerUserId,
			ownerUserId,
			kind: "cam-ket",
			status: tuy.trangThai ?? "nhap",
			title: id("mt"),
		},
	});
	const kr = await db.okrKeyResult.create({
		data: {
			objectiveId: objective.id,
			title: id("kr"),
			kind: tuy.kind ?? "tang-toi",
			ownerUserId,
			startValue: 0,
			targetValue: 100,
			currentValue: 0,
			source: tuy.nguon === "api" ? "api" : "tay",
		},
	});
	if (tuy.nguon === "api") {
		await db.okrNguonKr.create({
			data: { keyResultId: kr.id, loai: "api", taoBoiUserId: ownerUserId },
		});
	} else if (tuy.nguon === "crm") {
		await db.okrNguonKr.create({
			data: {
				keyResultId: kr.id,
				loai: "crm",
				chiSo: "thoa-thuan-chot-duoc",
				phamVi: { kieu: "toan-cong-ty" },
				taoBoiUserId: ownerUserId,
			},
		});
	}
	return kr.id;
}

async function taoKhoa(userId: string): Promise<string> {
	const khoa = await auth.api.createApiKey({
		body: { name: id("khoa"), userId },
	});
	return khoa.key;
}

function ghi(khoa: string | null, krId: string, giaTri: number) {
	const req = request(app.getHttpServer())
		.post(`${REST_BRIDGE_PATH}/okr/key-results/${krId}/value`)
		.set("content-type", "application/json");
	if (khoa) req.set(API_KEY_HEADER, khoa);
	return req.send(JSON.stringify({ giaTri }));
}

async function lichSuQua(khoa: string, krId: string) {
	return request(app.getHttpServer())
		.get(`${REST_BRIDGE_PATH}/okr/key-results/${krId}/snapshots`)
		.set(API_KEY_HEADER, khoa);
}

async function soChupApi(keyResultId: string): Promise<number> {
	return db.okrSoChup.count({ where: { keyResultId, nguon: "api" } });
}

async function vetGhiSoApi(keyResultId: string): Promise<number> {
	return db.okrTrail.count({
		where: { keyResultId, action: "ghi-so-api" },
	});
}

async function giaTriHienTai(keyResultId: string): Promise<number> {
	const r = await db.okrKeyResult.findUniqueOrThrow({
		where: { id: keyResultId },
		select: { currentValue: true },
	});
	return Number(r.currentValue);
}

beforeAll(async () => {
	app = await createApp();
	await app.listen(0, "127.0.0.1");
	spyOn(app.get(BackfillService), "auto").mockResolvedValue({
		started: false,
	});

	s.p = id("p");
	s.okr = id("okr");
	s.member = id("member");
	for (const [userId, vai] of [
		[s.p, "member"],
		[s.okr, "okr"],
		[s.member, "member"],
	] as const) {
		await gieoThanhVien(userId, vai);
		taoCac.user.push(userId);
	}
	s.khoaP = await taoKhoa(s.p);
	s.khoaOkr = await taoKhoa(s.okr);
	s.khoaMember = await taoKhoa(s.member);

	const dangChay = await taoCycle("dang-chay", "2026-01-01", "2030-12-31");
	const chamDiem = await taoCycle("cham-diem", "2020-01-01", "2020-03-31");
	const quaHan = await taoCycle("dang-chay", "2020-01-01", "2020-01-31");
	const chuaToi = await taoCycle("lap-ke-hoach", "2090-01-01", "2090-03-31");

	s.krApiP = await taoKr(dangChay, s.p, { nguon: "api" });
	s.krApiOkr = await taoKr(dangChay, s.okr, { nguon: "api" });
	s.krCrmP = await taoKr(dangChay, s.p, { nguon: "crm" });
	s.krApiPhanTram = await taoKr(dangChay, s.p, {
		nguon: "api",
		kind: "phan-tram",
	});
	s.krApiMoc = await taoKr(dangChay, s.p, { nguon: "api", kind: "moc" });
	s.krApiChamDiem = await taoKr(chamDiem, s.p, { nguon: "api" });
	s.krApiQuaHan = await taoKr(quaHan, s.p, { nguon: "api" });
	s.krApiChuaToi = await taoKr(chuaToi, s.p, { nguon: "api" });
	s.krApiDaBo = await taoKr(dangChay, s.p, {
		nguon: "api",
		trangThai: "da-bo",
	});
});

afterAll(async () => {
	await db.apikey.deleteMany({ where: { referenceId: { in: taoCac.user } } });
	await db.okrTrail.deleteMany({ where: { actorUserId: { in: taoCac.user } } });
	await db.okrSoChup.deleteMany({
		where: { keyResult: { ownerUserId: { in: taoCac.user } } },
	});
	await db.okrNguonKr.deleteMany({
		where: { keyResult: { ownerUserId: { in: taoCac.user } } },
	});
	await db.okrKeyResult.deleteMany({
		where: { ownerUserId: { in: taoCac.user } },
	});
	await db.okrObjective.deleteMany({
		where: { ownerUserId: { in: taoCac.user } },
	});
	await db.okrCycle.deleteMany({ where: { id: { in: taoCac.cycle } } });
	await db.member.deleteMany({ where: { userId: { in: taoCac.user } } });
	await db.user.deleteMany({ where: { id: { in: taoCac.user } } });
	await app.close();
});

describe("okr-khoa-api", () => {
	test("khoa nguoi phu trach hop le: 200, +1 okrSoChup api, +1 vet ghi-so-api, currentValue = gia tri gui; lan hai cung ngay them dong nua va lichSuSo tra gia tri lan hai", async () => {
		const homNay = ngayVN(new Date());

		const res1 = await ghi(s.khoaP, s.krApiP, 42);
		expect(`lan 1: HTTP ${res1.status} ${JSON.stringify(res1.body)}`).toBe(
			`lan 1: HTTP 200 ${JSON.stringify({ id: s.krApiP, ngay: homNay })}`,
		);
		expect(await soChupApi(s.krApiP)).toBe(1);
		expect(await vetGhiSoApi(s.krApiP)).toBe(1);
		expect(await giaTriHienTai(s.krApiP)).toBe(42);

		const res2 = await ghi(s.khoaP, s.krApiP, 55);
		expect(`lan 2: HTTP ${res2.status}`).toBe("lan 2: HTTP 200");
		expect(await soChupApi(s.krApiP)).toBe(2);
		expect(await vetGhiSoApi(s.krApiP)).toBe(2);
		expect(await giaTriHienTai(s.krApiP)).toBe(55);

		const lichSu = await lichSuQua(s.khoaP, s.krApiP);
		expect(lichSu.status).toBe(200);
		const dongHomNay = (
			lichSu.body as { dong: { ngay: string; giaTri: number }[] }
		).dong.filter((d) => d.ngay === homNay);
		expect(dongHomNay.length).toBe(2);
		expect(dongHomNay[0]?.giaTri, "lichSuSo tra dong moi nhat truoc").toBe(55);
	});

	test("khoa vai chi-okr phu trach mot KR nguon api khac: 200", async () => {
		const truoc = {
			soChup: await soChupApi(s.krApiOkr),
			vet: await vetGhiSoApi(s.krApiOkr),
		};
		const res = await ghi(s.khoaOkr, s.krApiOkr, 10);
		expect(`HTTP ${res.status}`).toBe("HTTP 200");
		expect(await soChupApi(s.krApiOkr)).toBe(truoc.soChup + 1);
		expect(await vetGhiSoApi(s.krApiOkr)).toBe(truoc.vet + 1);
		expect(await giaTriHienTai(s.krApiOkr)).toBe(10);
	});

	test("khoa thanh vien khong sua duoc KR nay: 403, khong ghi gi", async () => {
		const truoc = {
			soChup: await soChupApi(s.krApiP),
			vet: await vetGhiSoApi(s.krApiP),
			giaTri: await giaTriHienTai(s.krApiP),
		};
		const res = await ghi(s.khoaMember, s.krApiP, 99);
		expect(`HTTP ${res.status} ${res.body?.message}`).toBe(
			`HTTP 403 ${CAU.khongSua}`,
		);
		expect(await soChupApi(s.krApiP)).toBe(truoc.soChup);
		expect(await vetGhiSoApi(s.krApiP)).toBe(truoc.vet);
		expect(await giaTriHienTai(s.krApiP)).toBe(truoc.giaTri);
	});

	test("khong co khoa: 401, khong ghi gi", async () => {
		const truoc = {
			soChup: await soChupApi(s.krApiP),
			vet: await vetGhiSoApi(s.krApiP),
			giaTri: await giaTriHienTai(s.krApiP),
		};
		const res = await ghi(null, s.krApiP, 1);
		expect(`HTTP ${res.status}`).toBe("HTTP 401");
		expect(await soChupApi(s.krApiP)).toBe(truoc.soChup);
		expect(await vetGhiSoApi(s.krApiP)).toBe(truoc.vet);
		expect(await giaTriHienTai(s.krApiP)).toBe(truoc.giaTri);
	});

	test("KR nguon crm khong nhan so qua khoa API: 400, khong ghi gi", async () => {
		const truoc = {
			soChup: await soChupApi(s.krCrmP),
			vet: await vetGhiSoApi(s.krCrmP),
			giaTri: await giaTriHienTai(s.krCrmP),
		};
		const res = await ghi(s.khoaP, s.krCrmP, 5);
		expect(`HTTP ${res.status} ${res.body?.message}`).toBe(
			`HTTP 400 ${CAU.khongNhanApi}`,
		);
		expect(await soChupApi(s.krCrmP)).toBe(truoc.soChup);
		expect(await vetGhiSoApi(s.krCrmP)).toBe(truoc.vet);
		expect(await giaTriHienTai(s.krCrmP)).toBe(truoc.giaTri);
	});

	test("KR kieu phan-tram nhan gia tri 120: 400, khong ghi gi", async () => {
		const truoc = {
			soChup: await soChupApi(s.krApiPhanTram),
			vet: await vetGhiSoApi(s.krApiPhanTram),
			giaTri: await giaTriHienTai(s.krApiPhanTram),
		};
		const res = await ghi(s.khoaP, s.krApiPhanTram, 120);
		expect(`HTTP ${res.status} ${res.body?.message}`).toBe(
			`HTTP 400 ${CAU.phanTramNgoai}`,
		);
		expect(await soChupApi(s.krApiPhanTram)).toBe(truoc.soChup);
		expect(await vetGhiSoApi(s.krApiPhanTram)).toBe(truoc.vet);
		expect(await giaTriHienTai(s.krApiPhanTram)).toBe(truoc.giaTri);
	});

	test("KR kieu moc nhan gia tri 2: 400, khong ghi gi", async () => {
		const truoc = {
			soChup: await soChupApi(s.krApiMoc),
			vet: await vetGhiSoApi(s.krApiMoc),
			giaTri: await giaTriHienTai(s.krApiMoc),
		};
		const res = await ghi(s.khoaP, s.krApiMoc, 2);
		expect(`HTTP ${res.status} ${res.body?.message}`).toBe(
			`HTTP 400 ${CAU.mocChi01}`,
		);
		expect(await soChupApi(s.krApiMoc)).toBe(truoc.soChup);
		expect(await vetGhiSoApi(s.krApiMoc)).toBe(truoc.vet);
		expect(await giaTriHienTai(s.krApiMoc)).toBe(truoc.giaTri);
	});

	test("chu ky o pha cham-diem: tu choi, khong ghi gi", async () => {
		const truoc = {
			soChup: await soChupApi(s.krApiChamDiem),
			vet: await vetGhiSoApi(s.krApiChamDiem),
			giaTri: await giaTriHienTai(s.krApiChamDiem),
		};
		const res = await ghi(s.khoaP, s.krApiChamDiem, 7);
		expect(`HTTP ${res.status} ${res.body?.message}`).toBe(
			`HTTP 400 ${CAU.kyDaKhoa}`,
		);
		expect(await soChupApi(s.krApiChamDiem)).toBe(truoc.soChup);
		expect(await vetGhiSoApi(s.krApiChamDiem)).toBe(truoc.vet);
		expect(await giaTriHienTai(s.krApiChamDiem)).toBe(truoc.giaTri);
	});

	test("hom nay da qua ngay cuoi chu ky du pha van dang-chay: tu choi, khong ghi gi", async () => {
		const truoc = {
			soChup: await soChupApi(s.krApiQuaHan),
			vet: await vetGhiSoApi(s.krApiQuaHan),
			giaTri: await giaTriHienTai(s.krApiQuaHan),
		};
		const res = await ghi(s.khoaP, s.krApiQuaHan, 8);
		expect(`HTTP ${res.status} ${res.body?.message}`).toBe(
			`HTTP 400 ${CAU.kyDaQua}`,
		);
		expect(await soChupApi(s.krApiQuaHan)).toBe(truoc.soChup);
		expect(await vetGhiSoApi(s.krApiQuaHan)).toBe(truoc.vet);
		expect(await giaTriHienTai(s.krApiQuaHan)).toBe(truoc.giaTri);
	});

	test("hom nay truoc ngay dau chu ky: tu choi, khong ghi gi", async () => {
		const truoc = {
			soChup: await soChupApi(s.krApiChuaToi),
			vet: await vetGhiSoApi(s.krApiChuaToi),
			giaTri: await giaTriHienTai(s.krApiChuaToi),
		};
		const res = await ghi(s.khoaP, s.krApiChuaToi, 6);
		expect(`HTTP ${res.status} ${res.body?.message}`).toBe(
			`HTTP 400 ${CAU.kyChuaToi}`,
		);
		expect(await soChupApi(s.krApiChuaToi)).toBe(truoc.soChup);
		expect(await vetGhiSoApi(s.krApiChuaToi)).toBe(truoc.vet);
		expect(await giaTriHienTai(s.krApiChuaToi)).toBe(truoc.giaTri);
	});

	test("muc tieu da bo: tu choi, khong ghi gi", async () => {
		const truoc = {
			soChup: await soChupApi(s.krApiDaBo),
			vet: await vetGhiSoApi(s.krApiDaBo),
			giaTri: await giaTriHienTai(s.krApiDaBo),
		};
		const res = await ghi(s.khoaP, s.krApiDaBo, 9);
		expect(`HTTP ${res.status} ${res.body?.message}`).toBe(
			`HTTP 400 ${CAU.daBo}`,
		);
		expect(await soChupApi(s.krApiDaBo)).toBe(truoc.soChup);
		expect(await vetGhiSoApi(s.krApiDaBo)).toBe(truoc.vet);
		expect(await giaTriHienTai(s.krApiDaBo)).toBe(truoc.giaTri);
	});
});
