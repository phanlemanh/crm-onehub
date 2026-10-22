import { afterAll, beforeAll, describe, expect, spyOn, test } from "bun:test";
import {
	API_KEY_HEADER,
	API_KEY_PLUGIN_OPTIONS,
	API_KEY_USAGE,
	auth,
} from "@crm/auth";
import { db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { BackfillService } from "../src/backfill/backfill.service";
import { createApp } from "../src/create-app";
import { gieoThanhVien } from "./phien-thu";

const suffix = process.env.TEST_RUN_ID ?? "khoa-api-ghi-thua";
const NGUOI = `kagt-${suffix}`;
const GIAY_MS = 1000;
const TUONG_LAI_MS = 10 * 60 * GIAY_MS;
const DUONG = "/api/trpc/contacts.list?input=%7B%7D";
const DI_DUONG_SECONDARY =
	"plugin khoá API đi đường secondary-storage — bản vá khoa-api-ghi-thua đổi cả đường đó, xem lại AC-9";

let app: NestExpressApplication;

async function taoKhoa(ten: string) {
	return auth.api.createApiKey({ body: { name: ten, userId: NGUOI } });
}

async function goi(khoa: string) {
	return request(app.getHttpServer()).get(DUONG).set(API_KEY_HEADER, khoa);
}

async function hang(id: string) {
	return db.apikey.findUniqueOrThrow({
		where: { id },
		select: { lastRequest: true, updatedAt: true },
	});
}

function khongDiDuongSecondary(tuyChon: typeof API_KEY_PLUGIN_OPTIONS): void {
	if (
		tuyChon.storage === "secondary-storage" ||
		tuyChon.customStorage !== undefined
	) {
		throw new Error(DI_DUONG_SECONDARY);
	}
}

async function maLoi(khoa: string): Promise<string | undefined> {
	return auth.api
		.getSession({ headers: new Headers({ [API_KEY_HEADER]: khoa }) })
		.then(
			() => undefined,
			(e: { body?: { code?: string } }) => e.body?.code,
		);
}

beforeAll(async () => {
	app = await createApp();
	await app.listen(0, "127.0.0.1");
	spyOn(app.get(BackfillService), "auto").mockResolvedValue({
		started: false,
	});
	await gieoThanhVien(NGUOI, "member");
});

afterAll(async () => {
	await db.apikey.deleteMany({ where: { referenceId: NGUOI } });
	await app.close();
});

describe("khoa-api-ghi-thua", () => {
	test("khong-ghi-trong-nguong: luot hai trong nguong khong ghi gi", async () => {
		const khoa = await taoKhoa("khong-ghi");
		expect((await hang(khoa.id)).lastRequest).toBeNull();
		expect((await goi(khoa.key)).status, "luot dau phai 200").toBe(200);
		const sauDau = await hang(khoa.id);
		expect(sauDau.lastRequest, "luot dau phai ghi lastRequest").not.toBeNull();
		expect((await goi(khoa.key)).status, "luot hai phai 200").toBe(200);
		expect(await hang(khoa.id), "lastRequest doi o luot trong nguong").toEqual(
			sauDau,
		);
	});

	test("bien-nguong: qua nguong thi ghi, duoi nguong thi khong, tuong lai thi khong", async () => {
		const khoa = await taoKhoa("bien");
		const nguong = API_KEY_USAGE.lastRequestIntervalMs;
		const cu = new Date(Date.now() - nguong - GIAY_MS);
		await db.apikey.update({
			where: { id: khoa.id },
			data: { lastRequest: cu },
		});
		const batDau = Date.now();
		expect((await goi(khoa.key)).status).toBe(200);
		const sauCu = (await hang(khoa.id)).lastRequest?.getTime() ?? 0;
		expect(sauCu, "khong ghi khi da qua nguong").toBeGreaterThanOrEqual(batDau);
		const moi = new Date(Date.now() - nguong + GIAY_MS);
		await db.apikey.update({
			where: { id: khoa.id },
			data: { lastRequest: moi },
		});
		expect((await goi(khoa.key)).status).toBe(200);
		expect(
			(await hang(khoa.id)).lastRequest,
			"ghi khi con trong nguong",
		).toEqual(moi);
		const tuongLai = new Date(Date.now() + TUONG_LAI_MS);
		await db.apikey.update({
			where: { id: khoa.id },
			data: { lastRequest: tuongLai },
		});
		expect(
			(await goi(khoa.key)).status,
			"lastRequest tuong lai lam hong yeu cau",
		).toBe(200);
		expect(
			(await hang(khoa.id)).lastRequest,
			"ghi de lastRequest tuong lai",
		).toEqual(tuongLai);
	});

	test("tu-choi-van-giu: khoa tat va khoa het han van bi tu choi trong nguong", async () => {
		const tat = await taoKhoa("tat");
		const hetHan = await taoKhoa("het-han");
		expect((await goi(tat.key)).status, "doi chung: khoa bat phai 200").toBe(
			200,
		);
		expect(
			(await goi(hetHan.key)).status,
			"doi chung: khoa con han phai 200",
		).toBe(200);
		await db.apikey.update({
			where: { id: tat.id },
			data: { enabled: false },
		});
		await db.apikey.update({
			where: { id: hetHan.id },
			data: { expiresAt: new Date(Date.now() - GIAY_MS) },
		});
		expect((await goi(tat.key)).status, "khoa tat van qua").toBe(401);
		expect(await maLoi(tat.key), "khoa tat van qua").toBe("KEY_DISABLED");
		expect(await maLoi(hetHan.key), "khoa het han van qua").toBe("KEY_EXPIRED");
		expect((await goi(hetHan.key)).status, "khoa het han van qua").toBe(401);
	});

	test("khong-secondary-storage: plugin khoa API cua kho khong di duong secondary-storage", () => {
		khongDiDuongSecondary(API_KEY_PLUGIN_OPTIONS);
		expect(
			() =>
				khongDiDuongSecondary({
					...API_KEY_PLUGIN_OPTIONS,
					storage: "secondary-storage",
				}),
			"storage secondary-storage phai do",
		).toThrow(DI_DUONG_SECONDARY);
		expect(
			() =>
				khongDiDuongSecondary({
					...API_KEY_PLUGIN_OPTIONS,
					customStorage: {
						get: () => null,
						set: () => null,
						delete: () => null,
					},
				}),
			"customStorage phai do",
		).toThrow(DI_DUONG_SECONDARY);
	});
});
