import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { SETTINGS_ID } from "@crm/db/settings";
import { noiBangMa, taoMaLienKet } from "@crm/db/zalo-lien-ket";
import type { DatBotPhanHoi, DatBotYeuCau } from "@crm/validation/zalo-cau-noi";
import { ZALO_LY_DO } from "@crm/validation/zalo-update";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { mintPhien } from "./phien-thu";
import { donDep, gieoThanhVien, moXuong } from "./support/ke-hoach-gieo";

const BI_MAT = "bi-mat-doi-bot-api";
const TOKEN_MOI = "222:moi";
const TEN_MOI = "Bot Mới";
const URL_WEBHOOK = "https://crm.thu.test/zalo/webhook";
const [, , KHOA_LECH] = ZALO_LY_DO;

type Bien = "AGENT_URL" | "AGENT_BRIDGE_SECRET";
const TEN_BIEN: Bien[] = ["AGENT_URL", "AGENT_BRIDGE_SECRET"];

let app: INestApplication;
const bienCu = new Map<Bien, string | undefined>(
	TEN_BIEN.map((k) => [k, process.env[k]]),
);
const dung: (() => void)[] = [];
const nguoiDaGieo: string[] = [];

function datBien(k: Bien, v: string | undefined): void {
	if (v === undefined) delete process.env[k];
	else process.env[k] = v;
}

function tacTuGia(traLoi: DatBotPhanHoi[]) {
	const than: string[] = [];
	const hang = [...traLoi];
	const mayChu = Bun.serve({
		port: 0,
		fetch: async (req) => {
			than.push(await req.text());
			return Response.json(
				hang.shift() ?? { outcome: "invalid", reason: "het" },
			);
		},
	});
	datBien("AGENT_URL", `http://127.0.0.1:${mayChu.port}`);
	datBien("AGENT_BRIDGE_SECRET", BI_MAT);
	dung.push(() => mayChu.stop(true));
	return { than };
}

async function quanTri(ten: string): Promise<string> {
	const q = await gieoThanhVien(ten, "admin");
	nguoiDaGieo.push(q.id);
	return (await mintPhien(q.id)).cookie;
}

async function luuBot(cookie: string, input: DatBotYeuCau) {
	return request(app.getHttpServer())
		.post("/api/trpc/zalo.luuBot")
		.set("cookie", cookie)
		.set("content-type", "application/json")
		.send(JSON.stringify(input));
}

async function hoi(cookie: string, duong: "zalo.cuaToi" | "zalo.xuong") {
	return request(app.getHttpServer())
		.get(`/api/trpc/${duong}`)
		.set("cookie", cookie);
}

async function datCot(lyDo: string | null, url: string | null): Promise<void> {
	const cot = {
		zaloBotName: "Bot Thu",
		zaloWebhookUrl: url,
		zaloWebhookLyDo: lyDo,
	};
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, ...cot },
		update: cot,
	});
}

beforeAll(async () => {
	await moXuong();
	const { AppModule } = await import("../src/app.module");
	const modul: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();
	app = modul.createNestApplication({ bodyParser: false });
	await app.init();
});

afterEach(async () => {
	for (const d of dung.splice(0)) d();
	for (const [k, v] of bienCu) datBien(k, v);
	await db.appSetting.updateMany({
		where: { id: SETTINGS_ID },
		data: { zaloBotName: null, zaloWebhookUrl: null, zaloWebhookLyDo: null },
	});
});

afterAll(async () => {
	await db.zaloLink.deleteMany({ where: { crmUserId: { in: nguoiDaGieo } } });
	await db.notificationPreference.deleteMany({
		where: { userId: { in: nguoiDaGieo } },
	});
	await app.close();
	await donDep();
});

describe("luu-bot-qua-api", () => {
	test("API chuyển câu hỏi đổi bot cho màn và chuyển cờ xác nhận cho agent", async () => {
		const cookie = await quanTri("Quan Tri Doi Bot");
		const tacTu = tacTuGia([
			{ outcome: "can-xac-nhan-doi-bot", soLienKet: 3, tenBotMoi: TEN_MOI },
			{ outcome: "valid", tenBot: TEN_MOI, webhook: "da-dang-ky" },
		]);
		const hoiLai = await luuBot(cookie, { token: TOKEN_MOI });
		expect(hoiLai.status).toBe(200);
		expect(hoiLai.body?.result?.data).toEqual({
			ketQua: "can-xac-nhan-doi-bot",
			soLienKet: 3,
			tenBotMoi: TEN_MOI,
		});
		const dongY = await luuBot(cookie, {
			token: TOKEN_MOI,
			xacNhanDoiBot: true,
		});
		expect(dongY.status).toBe(200);
		expect(dongY.body?.result?.data).toEqual({
			tenBot: TEN_MOI,
			webhook: "da-dang-ky",
		});
		const nhan: { xacNhanDoiBot?: boolean } = JSON.parse(tacTu.than[1] ?? "{}");
		if (nhan.xacNhanDoiBot !== true) throw new Error("co xac nhan bi bo o API");
	});
});

describe("can-noi-lai", () => {
	test("người đã chọn Zalo mà mất liên kết được báo cần nối lại", async () => {
		const tao = async (ten: string) => {
			const n = await gieoThanhVien(ten);
			nguoiDaGieo.push(n.id);
			return { id: n.id, cookie: (await mintPhien(n.id)).cookie };
		};
		const A = await tao("Nguoi A Mat Lien Ket");
		const B = await tao("Nguoi B Chua Chon");
		const C = await tao("Nguoi C Con Lien Ket");
		for (const { id } of [A, C]) {
			await db.notificationPreference.create({
				data: { userId: id, channel: "ZALO" },
			});
		}
		const { ma } = await taoMaLienKet(db, C.id);
		const noi = await noiBangMa(db, {
			ma,
			zaloUserId: `z-${C.id}`,
			tenZalo: "C tren Zalo",
			now: new Date(),
		});
		expect(noi.loai).toBe("da-noi");
		const canNoiLai = async (cookie: string) => {
			const r = await hoi(cookie, "zalo.cuaToi");
			expect(r.status).toBe(200);
			return r.body?.result?.data?.canNoiLai;
		};
		if ((await canNoiLai(A.cookie)) !== true)
			throw new Error("A khong duoc bao noi lai");
		expect(await canNoiLai(B.cookie)).toBe(false);
		expect(await canNoiLai(C.cookie)).toBe(false);
	});
});

describe("canh-bao-khoa", () => {
	test("lý do khoá lệch tới màn Kết nối, không bị gộp vào đã đăng ký", async () => {
		const cookie = await quanTri("Quan Tri Khoa Lech");
		await datCot(KHOA_LECH, URL_WEBHOOK);
		const lech = await hoi(cookie, "zalo.xuong");
		expect(lech.status).toBe(200);
		if (lech.body?.result?.data?.webhook?.trangThai !== KHOA_LECH)
			throw new Error("khoa-lech bi giau o API");
		await datCot(null, URL_WEBHOOK);
		const dung = await hoi(cookie, "zalo.xuong");
		expect(dung.body?.result?.data?.webhook?.trangThai).toBe("da-dang-ky");
	});
});
