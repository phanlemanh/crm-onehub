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
import {
	type DatBotYeuCau,
	datBotYeuCau,
	type GuiThuYeuCau,
	guiThuYeuCau,
	ZALO_CAU_NOI,
} from "@crm/validation/zalo-cau-noi";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { z } from "zod";
import {
	zaloGuiThuOutput,
	zaloLuuBotOutput,
	zaloXuongOutput,
} from "../src/zalo/zalo.contracts";
import { ZALO_THONG_DIEP } from "../src/zalo/zalo.service";
import { mintPhien } from "./phien-thu";
import { donDep, gieoThanhVien, moXuong } from "./support/ke-hoach-gieo";

const BI_MAT = "bi-mat-cau-noi";
const TOKEN_T = "1234567890:AbCdEfGh_ij-k";
const TEN_BOT = "Bot OneHub";
const URL_WEBHOOK = "https://tac-tu.test/zalo/webhook";

const ngayJson = z.iso.datetime();
const xuongJson = zaloXuongOutput.extend({ pollCuoi: ngayJson.nullable() });

type TraLoi<T> = { status: number; data: T | null; loi: string };
type ThanCau = DatBotYeuCau | GuiThuYeuCau | null;
type Nhan = { duong: string; than: ThanCau };

const thanCau = z.union([guiThuYeuCau, datBotYeuCau]).nullable().catch(null);
type CotZalo = {
	zaloBotName: string | null;
	zaloBotToken: string | null;
	zaloWebhookSecret: string | null;
	zaloWebhookUrl: string | null;
	zaloWebhookLyDo: string | null;
};

const COT_RONG: CotZalo = {
	zaloBotName: null,
	zaloBotToken: null,
	zaloWebhookSecret: null,
	zaloWebhookUrl: null,
	zaloWebhookLyDo: null,
};

let app: INestApplication;
let caiDatCu: CotZalo | null = null;
const bienCu = {
	AGENT_URL: process.env.AGENT_URL,
	AGENT_BRIDGE_SECRET: process.env.AGENT_BRIDGE_SECRET,
};
const cookieCua = new Map<string, string>();

async function cookie(userId: string): Promise<string> {
	const daCo = cookieCua.get(userId);
	if (daCo) return daCo;
	const { cookie: moi } = await mintPhien(userId);
	cookieCua.set(userId, moi);
	return moi;
}

function traLoi<T>(res: request.Response, schema: z.ZodType<T>): TraLoi<T> {
	return {
		status: res.status,
		data: res.status === 200 ? schema.parse(res.body?.result?.data) : null,
		loi: String(res.body?.error?.message ?? ""),
	};
}

async function goi<T>(
	userId: string,
	thuTuc: string,
	schema: z.ZodType<T>,
	dauVao: Record<string, string> = {},
): Promise<TraLoi<T>> {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/zalo.${thuTuc}`)
		.set("cookie", await cookie(userId))
		.set("content-type", "application/json")
		.send(JSON.stringify(dauVao));
	return traLoi(res, schema);
}

async function xuong(
	userId: string,
): Promise<TraLoi<z.infer<typeof xuongJson>>> {
	const res = await request(app.getHttpServer())
		.get("/api/trpc/zalo.xuong")
		.set("cookie", await cookie(userId));
	return traLoi(res, xuongJson);
}

const luuBot = (userId: string, dauVao: Record<string, string> = {}) =>
	goi(userId, "luuBot", zaloLuuBotOutput, dauVao);
const guiThu = (userId: string) => goi(userId, "guiThu", zaloGuiThuOutput);

async function cotZalo(): Promise<CotZalo> {
	const s = await db.appSetting.findUnique({
		where: { id: SETTINGS_ID },
		select: {
			zaloBotName: true,
			zaloBotToken: true,
			zaloWebhookSecret: true,
			zaloWebhookUrl: true,
			zaloWebhookLyDo: true,
		},
	});
	return s ?? COT_RONG;
}

async function datCot(cot: Partial<CotZalo>): Promise<void> {
	const du = { ...COT_RONG, ...cot };
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, ...du },
		update: du,
	});
}

function tacTuGia(
	traLoiCua: (duong: string, than: ThanCau) => Promise<Response>,
) {
	const nhan: Nhan[] = [];
	const mayChu = Bun.serve({
		port: 0,
		hostname: "127.0.0.1",
		fetch: async (req) => {
			const than = thanCau.parse(await req.json().catch(() => null));
			const duong = new URL(req.url).pathname;
			nhan.push({ duong, than });
			return traLoiCua(duong, than);
		},
	});
	process.env.AGENT_URL = `http://127.0.0.1:${mayChu.port}`;
	process.env.AGENT_BRIDGE_SECRET = BI_MAT;
	return { nhan, dung: () => mayChu.stop(true) };
}

function tacTuLuu(): ReturnType<typeof tacTuGia> {
	return tacTuGia(async (duong, than) => {
		if (duong !== ZALO_CAU_NOI.bot) return new Response(null, { status: 404 });
		const yeuCau = datBotYeuCau.parse(than);
		if (yeuCau.token) {
			await datCot({
				zaloBotToken: yeuCau.token,
				zaloBotName: TEN_BOT,
				zaloWebhookSecret: "k".repeat(64),
				zaloWebhookUrl: URL_WEBHOOK,
			});
		}
		return Response.json({
			outcome: "valid",
			tenBot: TEN_BOT,
			webhook: "da-dang-ky",
		});
	});
}

beforeAll(async () => {
	caiDatCu = await cotZalo();
	await moXuong();
	const { AppModule } = await import("../src/app.module");
	const modul: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();
	app = modul.createNestApplication({ bodyParser: false });
	await app.listen(0, "127.0.0.1");
});

afterEach(async () => {
	process.env.AGENT_URL = bienCu.AGENT_URL;
	process.env.AGENT_BRIDGE_SECRET = bienCu.AGENT_BRIDGE_SECRET;
	if (bienCu.AGENT_URL === undefined) delete process.env.AGENT_URL;
	if (bienCu.AGENT_BRIDGE_SECRET === undefined) {
		delete process.env.AGENT_BRIDGE_SECRET;
	}
	await datCot(COT_RONG);
});

afterAll(async () => {
	await app.close();
	await donDep();
	await datCot(caiDatCu ?? COT_RONG);
});

describe("luu-bot-api", () => {
	test("luu-bot-api: quan tri luu token -> mot yeu cau dung truong, xuong che token", async () => {
		const Q = await gieoThanhVien("Quan Tri Luu", "admin");
		const tt = tacTuLuu();
		try {
			const ket = await luuBot(Q.id, { token: TOKEN_T });
			const x = await xuong(Q.id);
			expect(
				JSON.stringify(ket).includes(TOKEN_T) ||
					JSON.stringify(x).includes(TOKEN_T),
				"token khong ve trinh duyet",
			).toBe(false);
			expect(tt.nhan.length, "tac tu nhan dung mot yeu cau").toBe(1);
			expect(
				datBotYeuCau.parse(tt.nhan[0]?.than).token,
				"API gui dung token tac tu doc",
			).toBe(TOKEN_T);
			expect({
				nguon: x.data?.nguonToken,
				goi: x.data?.goiToken,
				webhook: x.data?.webhook.trangThai,
			}).toEqual({
				nguon: "man-hinh",
				goi: TOKEN_T.slice(-4),
				webhook: "da-dang-ky",
			});
		} finally {
			tt.dung();
		}
	});
});

describe("token-sai-api", () => {
	test("token-sai-api: sai dang -> loi noi ro, khong goi tac tu, AppSetting khong doi", async () => {
		const Q = await gieoThanhVien("Quan Tri Sai", "admin");
		const tt = tacTuLuu();
		try {
			const truoc = await cotZalo();
			const r = await luuBot(Q.id, { token: "aBcDeFgHiJkLmNoPqR" });
			expect(tt.nhan.length, "sai dang thi khong goi tac tu").toBe(0);
			expect(r.status).toBe(400);
			expect(r.loi).toContain("<số>:<chuỗi>");
			expect(r.loi).toContain("Secret Token");
			expect(await cotZalo(), "AppSetting khong doi").toEqual(truoc);
		} finally {
			tt.dung();
		}
	});

	test("token-sai-api: doi chung, dung dang (ke ca co khoang trang) -> goi tac tu", async () => {
		const Q = await gieoThanhVien("Quan Tri Dung", "admin");
		const tt = tacTuLuu();
		try {
			await luuBot(Q.id, { token: "12345:abc" });
			await luuBot(Q.id, { token: "  12345:abc\n" });
			expect(tt.nhan.length).toBe(2);
			expect(
				datBotYeuCau.parse(tt.nhan[1]?.than).token,
				"cat khoang trang",
			).toBe("12345:abc");
		} finally {
			tt.dung();
		}
	});

	test("token-sai-api: dang ky lai khong kem token -> mot yeu cau khong co truong token", async () => {
		const Q = await gieoThanhVien("Quan Tri Dang Ky Lai", "admin");
		const tt = tacTuLuu();
		try {
			const r = await luuBot(Q.id, {});
			expect(r.status).toBe(200);
			expect(tt.nhan.length).toBe(1);
			const than = datBotYeuCau.parse(tt.nhan[0]?.than);
			expect("token" in than, "khong truong token").toBe(false);
		} finally {
			tt.dung();
		}
	});

	test("token-sai-api: tac tu tra invalid -> loi mang ly do cua tac tu", async () => {
		const Q = await gieoThanhVien("Quan Tri Tu Choi", "admin");
		const tt = tacTuGia(async () =>
			Response.json({
				outcome: "invalid",
				reason: "Zalo không nhận token này.",
			}),
		);
		try {
			const r = await luuBot(Q.id, { token: "12345:abc" });
			expect({ status: r.status, loi: r.loi }).toEqual({
				status: 400,
				loi: "Zalo không nhận token này.",
			});
		} finally {
			tt.dung();
		}
	});
});

describe("quyen-api", () => {
	test("quyen-api: thanh vien thuong -> cam, khong goi tac tu, xuong khong co goi token", async () => {
		const M = await gieoThanhVien("Thanh Vien Thuong", "member");
		await datCot({ zaloBotToken: TOKEN_T, zaloBotName: TEN_BOT });
		const tt = tacTuLuu();
		try {
			const truoc = await cotZalo();
			const r = await luuBot(M.id, { token: TOKEN_T });
			expect(r.status, "thanh vien thuong bi cam").toBe(403);
			expect(tt.nhan.length, "khong goi tac tu").toBe(0);
			expect(await cotZalo()).toEqual(truoc);
			const x = await xuong(M.id);
			expect({
				canManage: x.data?.canManage,
				goi: x.data?.goiToken,
			}).toEqual({ canManage: false, goi: null });
		} finally {
			tt.dung();
		}
	});

	test("quyen-api: doi chung, quan tri -> goi tac tu", async () => {
		const Q = await gieoThanhVien("Quan Tri Quyen", "admin");
		const tt = tacTuLuu();
		try {
			await luuBot(Q.id, { token: TOKEN_T });
			expect(tt.nhan.length).toBe(1);
		} finally {
			tt.dung();
		}
	});
});

describe("xuong-webhook", () => {
	test("xuong-webhook: ba cau hinh -> ba trang thai", async () => {
		const Q = await gieoThanhVien("Quan Tri Xuong", "admin");
		const CA: [Partial<CotZalo>, string][] = [
			[{ zaloBotName: TEN_BOT, zaloWebhookUrl: URL_WEBHOOK }, "da-dang-ky"],
			[{ zaloBotName: TEN_BOT }, "chua-dang-ky"],
			[{ zaloBotName: TEN_BOT, zaloWebhookLyDo: "can-https" }, "can-https"],
		];
		const thucTe: string[] = [];
		for (const [cot] of CA) {
			await datCot(cot);
			thucTe.push(String((await xuong(Q.id)).data?.webhook.trangThai));
		}
		expect(thucTe).toEqual(CA.map(([, ky]) => ky));
	});

	test("xuong-webhook: bot song, token rong -> nguon env", async () => {
		const Q = await gieoThanhVien("Quan Tri Env", "admin");
		await datCot({ zaloBotName: TEN_BOT });
		expect((await xuong(Q.id)).data?.nguonToken).toBe("env");
	});
});

describe("gui-thu-api", () => {
	test("gui-thu-api: khong kenh -> loi; kenh zalo -> ket qua, dung userId cua phien", async () => {
		const U = await gieoThanhVien("Uyen Gui Thu Api", "member");
		let kenh: "zalo" | null = null;
		const tt = tacTuGia(async () => Response.json({ kenh, lech: false }));
		try {
			const r1 = await guiThu(U.id);
			expect(r1.status).toBe(400);
			expect(r1.loi).toContain("chưa có kênh nào");
			kenh = "zalo";
			const r2 = await guiThu(U.id);
			expect(r2.data).toEqual({ kenh: "zalo" });
			expect(guiThuYeuCau.parse(tt.nhan[1]?.than).userId).toBe(U.id);
		} finally {
			tt.dung();
		}
	});

	test("gui-thu-api: khong cau noi -> loi yeu cau, khong 500", async () => {
		const U = await gieoThanhVien("Uyen Khong Cau", "member");
		process.env.AGENT_BRIDGE_SECRET = "";
		const r = await guiThu(U.id);
		expect(r.status).toBe(400);
		expect(r.loi).toBe(ZALO_THONG_DIEP.cauNoi["thieu-cau-noi"]());
	});

	test("gui-thu-api: tac tu khong ai nghe -> loi tac tu chua noi duoc", async () => {
		const U = await gieoThanhVien("Uyen Cong Chet", "member");
		const tt = tacTuGia(async () => new Response(null));
		tt.dung();
		const r = await guiThu(U.id);
		expect(r.status).toBe(400);
		expect(r.loi).toBe(ZALO_THONG_DIEP.cauNoi["khong-toi-duoc"]());
	});
});

async function gieoBaHang(userId: string, zaloUserId: string): Promise<void> {
	const { ma } = await taoMaLienKet(db, userId);
	await noiBangMa(db, { ma, zaloUserId, tenZalo: zaloUserId, now: new Date() });
	await taoMaLienKet(db, userId);
	await db.notificationPreference.create({ data: { userId, channel: "ZALO" } });
}

async function demBaHang(userId: string) {
	return {
		lienKet: await db.zaloLink.count({ where: { crmUserId: userId } }),
		ma: await db.zaloLinkCode.count({ where: { crmUserId: userId } }),
		uuTien: await db.notificationPreference.count({ where: { userId } }),
	};
}

describe("go-thanh-vien", () => {
	test("go-thanh-vien: go U khoi xuong -> U mat ba hang Zalo, V con nguyen", async () => {
		const Q = await gieoThanhVien("Quan Tri Go", "admin");
		const U = await gieoThanhVien("Uyen Roi Xuong", "member");
		const V = await gieoThanhVien("Vinh O Lai", "member");
		await gieoBaHang(U.id, `zu-${U.id}`);
		await gieoBaHang(V.id, `zv-${V.id}`);
		const res = await request(app.getHttpServer())
			.post("/api/trpc/workspace.removeMember")
			.set("cookie", await cookie(Q.id))
			.set("content-type", "application/json")
			.send(JSON.stringify({ memberId: `m-${U.id}` }));
		expect(res.status, "quan tri go duoc").toBe(200);
		expect(
			await demBaHang(U.id),
			"nguoi roi xuong bi go lien ket Zalo",
		).toEqual({ lienKet: 0, ma: 0, uuTien: 0 });
		expect(await demBaHang(V.id), "nguoi o lai con nguyen").toEqual({
			lienKet: 1,
			ma: 1,
			uuTien: 1,
		});
	});
});
