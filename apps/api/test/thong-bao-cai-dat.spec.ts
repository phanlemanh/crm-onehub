import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import type { WorkspaceRole } from "@crm/auth";
import { db } from "@crm/db";
import { kenhSeDungCua } from "@crm/db/kenh-thong-bao";
import { SETTINGS_ID } from "@crm/db/settings";
import { LOAI_THONG_BAO, MUC_THONG_BAO } from "@crm/validation/thong-bao";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { createApp } from "../src/create-app";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = `tbk${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
const NGUOI = ["a", "b", "okr"] as const;
type Nguoi = (typeof NGUOI)[number];
const VAI = {
	a: "member",
	b: "member",
	okr: "okr",
} satisfies Record<Nguoi, WorkspaceRole>;

let app: NestExpressApplication;
const cookie = {} as Record<Nguoi, string>;
const uid = (n: Nguoi) => `${TIEN_TO}-${n}`;

type CaiDat = {
	kenh: "zalo" | "slack" | null;
	lyDo: string | null;
	loai: { loai: string; muc: string; dayRa: boolean; macDinh: boolean }[];
};

async function trpc(
	n: Nguoi | null,
	thuTuc: string,
	vao?: unknown,
): Promise<{ status: number; data: unknown }> {
	const goi =
		vao === undefined
			? request(app.getHttpServer()).get(`/api/trpc/${thuTuc}`)
			: request(app.getHttpServer())
					.post(`/api/trpc/${thuTuc}`)
					.set("content-type", "application/json")
					.send(JSON.stringify(vao));
	const r = n === null ? await goi : await goi.set("cookie", cookie[n]);
	return { status: r.status, data: r.body?.result?.data };
}

async function caiDat(n: Nguoi): Promise<CaiDat> {
	const r = await trpc(n, "thongBao.caiDat");
	expect(r.status).toBe(200);
	return r.data as CaiDat;
}

async function donKenh(): Promise<void> {
	const ids = NGUOI.map(uid);
	await db.caiDatThongBao.deleteMany({ where: { userId: { in: ids } } });
	await db.zaloLink.deleteMany({ where: { crmUserId: { in: ids } } });
	await db.slackMemberMatch.deleteMany({ where: { crmUserId: { in: ids } } });
	await db.notificationPreference.deleteMany({
		where: { userId: { in: ids } },
	});
	await db.account.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	await db.appSetting.updateMany({
		where: { id: SETTINGS_ID },
		data: { zaloBotName: null },
	});
}

beforeAll(async () => {
	app = await createApp();
	await app.listen(0, "127.0.0.1");
	for (const n of NGUOI) {
		await gieoThanhVien(uid(n), VAI[n]);
		cookie[n] = (await mintPhien(uid(n))).cookie;
	}
}, 120_000);

beforeEach(async () => {
	await donKenh();
});

afterAll(async () => {
	await donKenh();
	await db.session.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	await app.close();
});

describe("tbk-api", () => {
	test("tbk-api: a — doc tra moi loai dung mot lan, theo muc, mac dinh", async () => {
		const cd = await caiDat("a");
		expect(cd.loai.map((l) => l.loai)).toEqual([...LOAI_THONG_BAO]);
		for (const l of cd.loai) {
			const muc = MUC_THONG_BAO[l.loai as (typeof LOAI_THONG_BAO)[number]];
			expect(l.muc, `muc lech: ${l.loai}`).toBe(muc.muc);
			expect(l.dayRa, `mac dinh lech: ${l.loai}`).toBe(muc.macDinhDayRa);
			expect(l.macDinh).toBe(true);
		}
	});

	test("tbk-api: b, c — luu cua minh, nguoi khac khong doi, trung mac dinh thi xoa hang", async () => {
		const luu = await trpc("a", "thongBao.luuCaiDat", {
			loai: "okr-duoc-giao",
			dayRa: false,
		});
		expect(luu.status).toBe(200);
		const a = (await caiDat("a")).loai.find((l) => l.loai === "okr-duoc-giao");
		expect(a).toMatchObject({ dayRa: false, macDinh: false });
		const b = (await caiDat("b")).loai.find((l) => l.loai === "okr-duoc-giao");
		expect(b?.macDinh, "luu doi cai dat nguoi khac").toBe(true);
		await trpc("a", "thongBao.luuCaiDat", {
			loai: "okr-duoc-giao",
			dayRa: true,
		});
		expect(
			await db.caiDatThongBao.count({ where: { userId: uid("a") } }),
			"hang mac dinh con trong kho",
		).toBe(0);
		expect(
			(await caiDat("a")).loai.find((l) => l.loai === "okr-duoc-giao")?.macDinh,
		).toBe(true);
	});

	test("tbk-api: d — loai la bi tu choi, khong co cach tat chuong", async () => {
		const la = await trpc("a", "thongBao.luuCaiDat", {
			loai: "khong-co",
			dayRa: true,
		});
		expect(la.status).toBe(400);
		const chuong = await trpc("a", "thongBao.luuCaiDat", {
			loai: "okr-duoc-giao",
			dayRa: true,
			chuong: false,
		});
		expect(chuong.status, "nhan truong chuong").toBe(400);
	});

	test("tbk-api: e — kenh trong cai dat bang kenh se gui, nam ca", async () => {
		const a = uid("a");
		const ca: { ten: string; dung: () => Promise<void> }[] = [
			{ ten: "khong kenh", dung: async () => {} },
			{
				ten: "zalo",
				dung: async () => {
					await db.appSetting.upsert({
						where: { id: SETTINGS_ID },
						create: { id: SETTINGS_ID, zaloBotName: "Bot" },
						update: { zaloBotName: "Bot" },
					});
					await db.zaloLink.create({
						data: { crmUserId: a, zaloUserId: "ZA", zaloDisplayName: "ZA" },
					});
				},
			},
			{
				ten: "slack",
				dung: async () => {
					await db.account.create({
						data: {
							id: `${TIEN_TO}-slack`,
							accountId: `${TIEN_TO}-T`,
							providerId: "slack",
							userId: a,
							accessToken: "xoxb-tbk",
						},
					});
					await db.slackMemberMatch.create({
						data: { crmUserId: a, slackUserId: "UA" },
					});
				},
			},
			{
				ten: "uu tien zalo chi slack dung duoc",
				dung: async () => {
					await db.notificationPreference.create({
						data: { userId: a, channel: "ZALO" },
					});
					await db.account.create({
						data: {
							id: `${TIEN_TO}-slack`,
							accountId: `${TIEN_TO}-T`,
							providerId: "slack",
							userId: a,
							accessToken: "xoxb-tbk",
						},
					});
					await db.slackMemberMatch.create({
						data: { crmUserId: a, slackUserId: "UA" },
					});
				},
			},
			{
				ten: "zalo link nhung xuong chua bat bot",
				dung: async () => {
					await db.zaloLink.create({
						data: { crmUserId: a, zaloUserId: "ZA", zaloDisplayName: "ZA" },
					});
				},
			},
		];
		console.log(`tbk-api e: so o ${ca.length}`);
		for (const o of ca) {
			await donKenh();
			await o.dung();
			const cd = await caiDat("a");
			const se = await kenhSeDungCua(db, a, { coToken: true });
			expect(cd.kenh, `kenh cai dat lech kenh gui: ${o.ten}`).toBe(se.kenh);
			if (cd.kenh === null) {
				expect(cd.lyDo ?? "", `thieu ly do: ${o.ten}`).not.toBe("");
			}
		}
	});

	test("tbk-api: f — chua dang nhap bi tu choi, vai chi OKR dung duoc", async () => {
		expect((await trpc(null, "thongBao.caiDat")).status).toBe(401);
		expect(
			(
				await trpc("okr", "thongBao.luuCaiDat", {
					loai: "tac-nhan-xong",
					dayRa: true,
				})
			).status,
		).toBe(200);
		const okr = (await caiDat("okr")).loai.find(
			(l) => l.loai === "tac-nhan-xong",
		);
		expect(okr).toMatchObject({ dayRa: true, macDinh: false });
	});

	test("tbk-api: g — hang loai la khong lam hong doc", async () => {
		await db.caiDatThongBao.create({
			data: { userId: uid("a"), loai: "loai-da-bo", dayRa: true },
		});
		const cd = await caiDat("a");
		expect(cd.loai.length, "loai la lam hong thu tuc doc").toBe(
			LOAI_THONG_BAO.length,
		);
	});
});
