import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

const KHOA_GIA = "re_test_gia";
const NGUOI_GUI = "CRM <no-reply@example.test>";

let app: INestApplication;

function tatThu(): void {
	delete process.env.RESEND_API_KEY;
	delete process.env.MAIL_FROM;
}

function batThu(): void {
	process.env.RESEND_API_KEY = KHOA_GIA;
	process.env.MAIL_FROM = NGUOI_GUI;
}

beforeAll(async () => {
	tatThu();
	const { AppModule } = await import("../src/app.module");
	const mod = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();
	app = mod.createNestApplication({ bodyParser: false });
	await app.init();
});

afterAll(async () => {
	tatThu();
	await app.close();
});

async function tuyChon(): Promise<Record<string, unknown>> {
	const tra = await request(app.getHttpServer())
		.get("/api/trpc/sso.signInOptions")
		.expect(200);
	return tra.body.result.data as Record<string, unknown>;
}

describe("co-tat", () => {
	it("chua khai hai bien thi quenMatKhau false, khai roi thi true tren cung app", async () => {
		tatThu();
		expect((await tuyChon()).quenMatKhau).toBe(false);
		batThu();
		const bat = await tuyChon();
		if (bat.quenMatKhau !== true) {
			throw new Error("co quenMatKhau khong theo cau hinh thu luc goi");
		}
	});
});

describe("co-bat", () => {
	it("khai du hai bien thi tra dung bon truong voi quenMatKhau true", async () => {
		batThu();
		const du = await tuyChon();
		expect(Object.keys(du).sort()).toEqual([
			"google",
			"microsoft",
			"providers",
			"quenMatKhau",
		]);
		expect(du.quenMatKhau).toBe(true);
	});
});
