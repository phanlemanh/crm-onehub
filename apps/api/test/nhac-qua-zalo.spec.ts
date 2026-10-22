import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { kenhSeDungCua } from "@crm/db/kenh-thong-bao";
import { SETTINGS_ID } from "@crm/db/settings";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	bamMa,
	noiBangMa,
	taoMaLienKet,
	ZALO_LIEN_KET,
} from "@crm/db/zalo-lien-ket";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { z } from "zod";
import { AgentAccessService } from "../src/agent/agent-access.service";
import {
	zaloCuaToiOutput,
	zaloGoOutput,
	zaloLuuUuTienInput,
	zaloLuuUuTienOutput,
	zaloTaoMaOutput,
	zaloXuongOutput,
} from "../src/zalo/zalo.contracts";
import { ZALO_THONG_DIEP, ZaloService } from "../src/zalo/zalo.service";
import { ZaloCauNoiService } from "../src/zalo/zalo-cau-noi.service";
import { mintPhien } from "./phien-thu";
import {
	donDep,
	gieoNguoiNgoai,
	gieoThanhVien as gieoThanhVienKh,
	moXuong,
	token,
} from "./support/ke-hoach-gieo";

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const TEN_BOT = "Bot Nhac Thu";

const ngayJson = z.iso.datetime();
const taoMaJson = zaloTaoMaOutput.extend({ expiresAt: ngayJson });
const cuaToiJson = zaloCuaToiOutput.extend({
	lienKet: z.discriminatedUnion("loai", [
		z.object({ loai: z.literal("chua-noi") }),
		z.object({ loai: z.literal("ma-cho"), expiresAt: ngayJson }),
		z.object({ loai: z.literal("ma-het-han") }),
		z.object({ loai: z.literal("da-noi"), tenZalo: z.string() }),
	]),
});
const xuongJson = zaloXuongOutput.extend({ pollCuoi: ngayJson.nullable() });

type TraLoi<T> = { status: number; data: T | null; loi: string };
type CaiDatZalo = { zaloBotName: string | null; zaloPolledAt: Date | null };
type DauVaoLuu = z.infer<typeof zaloLuuUuTienInput>;

let app: INestApplication;
let caiDatCu: CaiDatZalo | null = null;
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
	dauVao?: DauVaoLuu,
): Promise<TraLoi<T>> {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/zalo.${thuTuc}`)
		.set("cookie", await cookie(userId))
		.set("content-type", "application/json")
		.send(JSON.stringify(dauVao ?? {}));
	return traLoi(res, schema);
}

async function doc<T>(
	userId: string,
	thuTuc: string,
	schema: z.ZodType<T>,
): Promise<TraLoi<T>> {
	const res = await request(app.getHttpServer())
		.get(`/api/trpc/zalo.${thuTuc}`)
		.set("cookie", await cookie(userId));
	return traLoi(res, schema);
}

const taoMa = (userId: string) => goi(userId, "taoMa", taoMaJson);
const go = (userId: string) => goi(userId, "go", zaloGoOutput);
const luu = (userId: string, channel: DauVaoLuu["channel"]) =>
	goi(userId, "luuUuTien", zaloLuuUuTienOutput, { channel });
const cuaToi = (userId: string) => doc(userId, "cuaToi", cuaToiJson);
const xuong = (userId: string) => doc(userId, "xuong", xuongJson);

function dichVu(): ZaloService {
	return new ZaloService(
		db,
		new AgentAccessService(db),
		new ZaloCauNoiService(),
	);
}

async function datBot(
	zaloBotName: string | null,
	zaloPolledAt: Date | null = null,
): Promise<void> {
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, zaloBotName, zaloPolledAt },
		update: { zaloBotName, zaloPolledAt },
	});
}

async function noiThat(userId: string, tenZalo: string): Promise<void> {
	const { ma } = await taoMaLienKet(db, userId);
	const ketQua = await noiBangMa(db, {
		ma,
		zaloUserId: `zalo-${token()}`,
		tenZalo,
		now: new Date(),
	});
	expect(ketQua.loai).toBe("da-noi");
}

async function uuTienCua(userId: string): Promise<string> {
	const hang = await db.notificationPreference.findUnique({
		where: { userId },
	});
	return hang?.channel ?? "AUTO";
}

beforeAll(async () => {
	caiDatCu = await db.appSetting.findUnique({
		where: { id: SETTINGS_ID },
		select: { zaloBotName: true, zaloPolledAt: true },
	});
	await moXuong();
	await datBot(TEN_BOT, new Date());
	const { AppModule } = await import("../src/app.module");
	const modul: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();
	app = modul.createNestApplication({ bodyParser: false });
	await app.listen(0, "127.0.0.1");
});

afterAll(async () => {
	await app.close();
	await donDep();
	if (caiDatCu) {
		await datBot(caiDatCu.zaloBotName, caiDatCu.zaloPolledAt);
	} else {
		await db.appSetting.deleteMany({ where: { id: SETTINGS_ID } });
	}
});

describe("tao-ma-api", () => {
	test("tao-ma-api: hai lan qua tRPC, mot hang, bam dung ma lan 2, khong ma ro", async () => {
		const U = await gieoThanhVienKh("Uyen");
		const a = await taoMa(U.id);
		const b = await taoMa(U.id);
		const hang = await db.zaloLinkCode.findMany({
			where: { crmUserId: U.id },
		});
		const maLan2 = String(b.data?.ma);
		expect(
			hang.map((h) => h.codeHash),
			"mot nguoi mot ma song",
		).toEqual([bamMa(maLan2)]);
		expect([a.status, b.status]).toEqual([200, 200]);
		for (const lan of [a, b]) {
			expect(lan.data?.ma).toMatch(/^\d{6}$/);
			expect(lan.data?.expiresAt).toBeString();
		}
		expect(JSON.stringify(hang)).not.toContain(maLan2);
	});

	test("tao-ma-api: nguoi ngoai xuong bi tu choi, khong hang ma", async () => {
		const N = await gieoNguoiNgoai("Ngoai");
		const r = await taoMa(N.id);
		expect(r.status, "nguoi ngoai xuong khong tao duoc ma").toBe(403);
		expect(await db.zaloLinkCode.count({ where: { crmUserId: N.id } })).toBe(0);
	});

	test("tao-ma-api: doi chung, them vao xuong thi tao duoc", async () => {
		const N = await gieoNguoiNgoai("Ngoai2");
		await db.member.create({
			data: {
				id: `m-${N.id}`,
				organizationId: WORKSPACE_ID,
				userId: N.id,
				role: "member",
				createdAt: new Date(),
			},
		});
		expect((await taoMa(N.id)).status).toBe(200);
		expect(await db.zaloLinkCode.count({ where: { crmUserId: N.id } })).toBe(1);
	});
});

describe("go-zalo", () => {
	test("go-zalo: go xoa lien ket, ZALO ve AUTO, SLACK giu nguyen, chua noi khong nem", async () => {
		await datBot(TEN_BOT, new Date());
		const U3 = await gieoThanhVienKh("U3");
		const U4 = await gieoThanhVienKh("U4");
		const U5 = await gieoThanhVienKh("U5");
		await noiThat(U3.id, "Zalo U3");
		await noiThat(U4.id, "Zalo U4");
		await db.notificationPreference.create({
			data: { userId: U3.id, channel: "ZALO" },
		});
		await db.notificationPreference.create({
			data: { userId: U4.id, channel: "SLACK" },
		});
		await db.notificationPreference.create({
			data: { userId: U5.id, channel: "SLACK" },
		});

		const r3 = await go(U3.id);
		const r4 = await go(U4.id);
		expect([r3.status, r4.status]).toEqual([200, 200]);
		expect(r3.data).toEqual({ ok: true });

		expect(
			await db.zaloLink.count({
				where: { crmUserId: { in: [U3.id, U4.id] } },
			}),
		).toBe(0);
		expect(await uuTienCua(U3.id)).toBe("AUTO");
		expect(await uuTienCua(U4.id), "go Zalo khong dung toi uu tien SLACK").toBe(
			"SLACK",
		);

		const r5 = await go(U5.id);
		expect(`${r5.status} ${r5.loi}`).toBe("200 ");
		expect(await uuTienCua(U5.id)).toBe("SLACK");
	});
});

describe("luu-uu-tien", () => {
	test("luu-uu-tien: chua dung duoc thi may chu tu choi, dung duoc thi luu", async () => {
		await datBot(TEN_BOT, new Date());
		const U = await gieoThanhVienKh("Uluu");

		const zalo = await luu(U.id, "ZALO");
		expect(zalo.status, "may chu tu choi kenh chua dung duoc").toBe(400);
		expect(zalo.loi).toBe(ZALO_THONG_DIEP.zaloChuaDung);
		expect(zalo.loi).toContain("Zalo");
		expect(await uuTienCua(U.id)).toBe("AUTO");

		const slack = await luu(U.id, "SLACK");
		expect(slack.status).toBe(400);
		expect(slack.loi).toBe(ZALO_THONG_DIEP.slackChuaDung);
		expect(slack.loi).toContain("Slack");
		expect(await uuTienCua(U.id)).toBe("AUTO");

		const auto = await luu(U.id, "AUTO");
		expect(`${auto.status} ${auto.loi}`).toBe("200 ");
		expect(auto.data).toEqual({ channel: "AUTO" });
		expect(await uuTienCua(U.id)).toBe("AUTO");

		await noiThat(U.id, "Zalo Uluu");
		const lai = await luu(U.id, "ZALO");
		expect(`${lai.status} ${lai.loi}`).toBe("200 ");
		expect(await uuTienCua(U.id)).toBe("ZALO");
	});
});

describe("trang-thai", () => {
	test("trang-thai: xuong dem thanh vien da noi, bo nguoi da roi", async () => {
		const pollCuoi = new Date(Date.now() - MINUTE_MS);
		await datBot(TEN_BOT, pollCuoi);
		const nguoiGoi = await gieoThanhVienKh("nqz-goi");
		const truoc = await xuong(nguoiGoi.id);
		expect(truoc.status).toBe(200);

		const tenBay = [1, 2, 3, 4, 5, 6, 7].map((i) => `nqz-xuong-${i}`);
		const bay: Array<{ id: string; name: string }> = [];
		for (const ten of tenBay) bay.push(await gieoThanhVienKh(ten));
		for (const nguoi of [bay[0], bay[3], bay[5]]) {
			if (nguoi) await noiThat(nguoi.id, `Zalo ${nguoi.name}`);
		}
		const daRoi = await gieoThanhVienKh("nqz-xuong-roi");
		await noiThat(daRoi.id, "Zalo da roi");
		await db.member.deleteMany({ where: { userId: daRoi.id } });

		const sau = await xuong(nguoiGoi.id);
		expect(sau.status).toBe(200);
		expect(sau.data?.bat).toBe(true);
		expect(sau.data?.tenBot).toBe(TEN_BOT);
		expect(sau.data?.pollCuoi).toBe(pollCuoi.toISOString());

		expect(
			(sau.data?.daNoi ?? 0) - (truoc.data?.daNoi ?? 0),
			"nguoi da roi khong duoc dem",
		).toBe(3);
		expect((sau.data?.tong ?? 0) - (truoc.data?.tong ?? 0)).toBe(7);
		const nguoi = sau.data?.nguoi ?? [];
		const cuaBay = nguoi.filter((n) => bay.some((b) => b.id === n.id));
		expect(cuaBay.map((n) => n.ten)).toEqual(tenBay);
		expect(cuaBay.filter((n) => n.tenZalo !== null).length).toBe(3);
		expect(nguoi.some((n) => n.id === daRoi.id)).toBe(false);
	});

	test("trang-thai: im theo ZALO_LIEN_KET.imSauMs, goi thang service voi now", async () => {
		const pollCuoi = new Date(Date.now() - MINUTE_MS);
		await datBot(TEN_BOT, pollCuoi);
		const U = await gieoThanhVienKh("nqz-im");
		const cu = await dichVu().xuong(
			U.id,
			new Date(pollCuoi.getTime() + ZALO_LIEN_KET.imSauMs + SECOND_MS),
		);
		expect(cu.im, "poll cu hon imSauMs thi im").toBe(true);
		const moi = await dichVu().xuong(
			U.id,
			new Date(pollCuoi.getTime() + ZALO_LIEN_KET.imSauMs - SECOND_MS),
		);
		expect(moi.im, "poll moi hon imSauMs thi khong im").toBe(false);
	});

	test("trang-thai: zaloBotName null thi bat false", async () => {
		await datBot(null, null);
		const U = await gieoThanhVienKh("nqz-tat");
		const r = await xuong(U.id);
		expect(r.status).toBe(200);
		expect(r.data?.bat).toBe(false);
		expect(r.data?.tenBot).toBe(null);
		await datBot(TEN_BOT, new Date());
	});

	test("trang-thai: ca nhan uu tien SLACK, da noi, khong khop Slack", async () => {
		await datBot(TEN_BOT, new Date());
		const U = await gieoThanhVienKh("nqz-canhan");
		await noiThat(U.id, "Zalo Ca Nhan");
		await db.notificationPreference.create({
			data: { userId: U.id, channel: "SLACK" },
		});

		const bat = await cuaToi(U.id);
		expect(bat.status).toBe(200);
		expect(bat.data?.uuTien).toBe("SLACK");
		expect(bat.data?.lech).toBe(true);
		expect(bat.data?.kenhSeDung).toBe("zalo");
		const luat = await kenhSeDungCua(db, U.id, { coToken: true });
		expect({ kenh: luat.kenh, lech: luat.lech }).toEqual({
			kenh: bat.data?.kenhSeDung ?? null,
			lech: bat.data?.lech ?? false,
		});

		await datBot(null, null);
		const tat = await cuaToi(U.id);
		expect(tat.status).toBe(200);
		expect(tat.data?.kenhSeDung).toBe(null);
		await datBot(TEN_BOT, new Date());
	});
});

describe("trang-thai-lien-ket", () => {
	test("trang-thai-lien-ket: bon dong chua-noi, ma-cho, ma-het-han, da-noi", async () => {
		await datBot(TEN_BOT, new Date());
		const U = await gieoThanhVienKh("nqz-lienket");

		const khongMa = await cuaToi(U.id);
		expect(khongMa.status).toBe(200);
		expect(khongMa.data?.lienKet).toEqual({ loai: "chua-noi" });

		const { ma, expiresAt } = await taoMaLienKet(db, U.id);
		const cho = await cuaToi(U.id);
		expect(cho.data?.lienKet).toEqual({
			loai: "ma-cho",
			expiresAt: expiresAt.toISOString(),
		});
		expect(JSON.stringify(cho.data)).not.toContain(ma);

		const hetHan = await dichVu().cuaToi(
			U.id,
			new Date(Date.now() + ZALO_LIEN_KET.ma.songMs + SECOND_MS),
		);
		expect(hetHan.lienKet, "ma qua han la ma-het-han").toEqual({
			loai: "ma-het-han",
		});

		const ketQua = await noiBangMa(db, {
			ma,
			zaloUserId: `zalo-${token()}`,
			tenZalo: "Uyen Zalo",
			now: new Date(),
		});
		expect(ketQua.loai).toBe("da-noi");
		const daNoi = await cuaToi(U.id);
		expect(daNoi.data?.lienKet, "da noi thang ma cho").toEqual({
			loai: "da-noi",
			tenZalo: "Uyen Zalo",
		});
	});
});
