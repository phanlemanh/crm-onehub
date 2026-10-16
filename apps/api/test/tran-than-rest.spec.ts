import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { API_KEY_HEADER } from "@crm/auth";
import { db } from "@crm/db";
import { BAN_CHUP_LO_TRINH } from "@crm/validation/ban-chup-lo-trinh";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { z } from "zod";
import { createApp } from "../src/create-app";
import {
	REST_BRIDGE_BODY_LIMIT_BYTES,
	REST_BRIDGE_PATH,
} from "../src/trpc/openapi";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = `ttr${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
const CHU = `${TIEN_TO}-owner`;
const DUONG_BAN_CHUP = `${REST_BRIDGE_PATH}${BAN_CHUP_LO_TRINH.duongRest}`;
const DUONG_KHAC = `${REST_BRIDGE_PATH}/org/divisions`;
const TRAN_CHUNG = REST_BRIDGE_BODY_LIMIT_BYTES;
const TRAN_BAN_CHUP = BAN_CHUP_LO_TRINH.tranThanByte;
const NGUON = BAN_CHUP_LO_TRINH.nguonCrm;
const CHO_MS = 120_000;
const GOC = join(import.meta.dir, "..", "..", "..");
const khoiJson = z.record(z.string(), z.json());
const KHOI_HTML =
	/<script type="application\/json" id="lo-trinh-du-lieu">([\s\S]*?)<\/script>/.exec(
		readFileSync(join(GOC, "LO-TRINH.html"), "utf8"),
	)?.[1];
if (!KHOI_HTML) throw new Error("LO-TRINH.html khong mang khoi");
const KHOI = khoiJson.parse(JSON.parse(KHOI_HTML));
const loi413 = z.looseObject({ code: z.string() });
const ketQuaRa = z.object({ ketQua: z.enum(BAN_CHUP_LO_TRINH.ketQua) });

let app: NestExpressApplication;
let cookie = "";
let khoa = "";

const sha = (c: string) => c.repeat(40);
const banChup = (s: string, luc: string, them: Record<string, string> = {}) =>
	JSON.stringify({
		nguon: NGUON,
		sha: s,
		commitLuc: luc,
		duLieu: KHOI,
		canhBao: [],
		...them,
	});
const dem = (n: number) => {
	const vo = '{"p":""}';
	return `{"p":"${"x".repeat(n - vo.length)}"}`;
};
const gui = (
	duong: string,
	than: string,
	o: { key?: string; cookie?: string } = {},
) => {
	let r = request(app.getHttpServer())
		.post(duong)
		.set("content-type", "application/json");
	if (o.key) r = r.set(API_KEY_HEADER, o.key);
	if (o.cookie) r = r.set("cookie", o.cookie);
	return r.send(than);
};
const don = () => db.banChupLoTrinh.deleteMany({ where: { nguon: NGUON } });

beforeAll(async () => {
	app = await createApp();
	await gieoThanhVien(CHU, "owner");
	cookie = (await mintPhien(CHU)).cookie;
	const r = await request(app.getHttpServer())
		.post("/api/trpc/apiKeys.create")
		.set("cookie", cookie)
		.set("content-type", "application/json")
		.send(
			JSON.stringify({
				name: "ttr-day",
				expiresInDays: null,
				loai: "day-lo-trinh",
			}),
		);
	khoa = z.object({ key: z.string() }).parse(r.body?.result?.data).key;
	await don();
}, CHO_MS);

afterAll(async () => {
	await don();
	await db.apikey.deleteMany({
		where: { referenceId: { startsWith: TIEN_TO } },
	});
	await db.session.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	await app.close();
});

describe("ttr-ban-chup", () => {
	test(
		"ttr-ban-chup: 3 o duong ban chup",
		async () => {
			await don();
			const o1 = banChup(sha("a"), "2026-10-15T08:00:00Z");
			expect(
				Buffer.byteLength(o1) > TRAN_CHUNG,
				"khoi that khong lon hon tran chung",
			).toBe(true);
			const r1 = await gui(DUONG_BAN_CHUP, o1, { key: khoa });
			expect(r1.status, "khoi lo trinh that bi chan vi co").toBe(200);
			expect(ketQuaRa.parse(r1.body).ketQua).toBe("nhan");
			const o2 = banChup(sha("b"), "2026-10-15T09:00:00Z", {
				dem: "x".repeat(1_500_000),
			});
			const r2 = await gui(DUONG_BAN_CHUP, o2, { key: khoa });
			expect(r2.status, "khoi lo trinh that bi chan vi co").toBe(200);
			expect(ketQuaRa.parse(r2.body).ketQua).toBe("nhan");
			const hang = await db.banChupLoTrinh.findUnique({
				where: { nguon: NGUON },
				select: { sha: true },
			});
			expect(hang?.sha).toBe(sha("b"));
			const r3 = await gui(DUONG_BAN_CHUP, dem(TRAN_BAN_CHUP + 1), {
				key: khoa,
			});
			expect(r3.status, "duong ban chup nhan than qua 2 MB").toBe(413);
		},
		CHO_MS,
	);
});

describe("ttr-duong-khac", () => {
	const maTran = [
		[90_000, 401],
		[100_000, 401],
		[100_001, 413],
		[150_000, 413],
		[TRAN_BAN_CHUP + 1, 413],
	] as const;

	test(
		"ttr-duong-khac: 5 o chua dang nhap",
		async () => {
			expect(TRAN_CHUNG, "tran chung khong phai 100 000 byte").toBe(100_000);
			const truoc = await db.division.count();
			const sai: string[] = [];
			for (const [co, kyVong] of maTran) {
				const than = dem(co);
				expect(Buffer.byteLength(than)).toBe(co);
				const r = await gui(DUONG_KHAC, than);
				if (r.status !== kyVong)
					sai.push(`${co} byte: ${r.status} != ${kyVong}`);
				if (kyVong === 401 && r.status === 401)
					expect(loi413.parse(r.body).code).toBe("UNAUTHORIZED");
			}
			expect(sai, "duong REST khac nhan than qua 100 KB").toEqual([]);
			expect(await db.division.count()).toBe(truoc);
		},
		CHO_MS,
	);

	test(
		"ttr-duong-khac: co phien khong noi tran",
		async () => {
			const r = await gui(DUONG_KHAC, dem(150_000), { cookie });
			expect(r.status, "tran than noi theo nguoi gui").toBe(413);
			const nho = await gui(DUONG_KHAC, "{}", { cookie });
			expect(nho.status).not.toBe(413);
		},
		CHO_MS,
	);
});

describe("ttr-khuon-413", () => {
	test(
		"ttr-khuon-413: hai duong tra 413 cung khuon",
		async () => {
			const a = await gui(DUONG_BAN_CHUP, dem(TRAN_BAN_CHUP + 1), {
				key: khoa,
			});
			const b = await gui(DUONG_KHAC, dem(150_000));
			expect([a.status, b.status], "hai duong tra loi 413 khac khuon").toEqual([
				413, 413,
			]);
			expect(
				Object.keys(a.body).sort(),
				"hai duong tra loi 413 khac khuon",
			).toEqual(Object.keys(b.body).sort());
			expect(
				loi413.parse(a.body).code,
				"hai duong tra loi 413 khac khuon",
			).toBe(loi413.parse(b.body).code);
		},
		CHO_MS,
	);
});
