import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import {
	docCaiDatThongBao,
	luuCaiDatThongBao,
} from "@crm/db/cai-dat-thong-bao";
import {
	THU_TU_NHAC,
	type ViecNhac,
	viecCanNhac,
} from "@crm/db/onboarding-nhac";
import { SETTINGS_ID } from "@crm/db/settings";
import { parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import { khoaThongBao, macDinhDayRa } from "@crm/validation/thong-bao";
import {
	chayNhac,
	conMaDuoc,
	duongMo,
	lenLichNhac,
	locDayRa,
} from "../agent/lib/nhac-ke-hoach";
import { dungTin } from "../agent/lib/tin-nhac";
import { ZALO } from "../agent/lib/zalo-config";
import { type BanChup, CHUP, chupTin } from "./support/chup-tin-nhac";
import {
	donDep,
	gieoKeHoach,
	gieoNguoi,
	khopSlack,
	moXuong,
	noiSlack,
	slackGia,
	TIEN_TO,
} from "./support/nhac-gieo";
import {
	HAN_XA,
	HOM_QUA,
	hangCua,
	lucVN,
	NGAY_NHAC,
	ngayCach,
	PHUT_SAU,
} from "./support/nhac-gui-gieo";
import { zaloGia } from "./support/zalo-gia";

export const TOKEN = "1:abc";
export const APP_URL = "https://crm.test";
const TEP_CHUP = join(import.meta.dir, "fixtures/tin-nhac-truoc-tb1.json");
const DIA_CHI_XUONG = /https:\/\/crm\.test\/[^/?\s>|]+/g;

function boTenXuong(ban: BanChup): BanChup {
	const thay = (chu: string) =>
		chu.replace(DIA_CHI_XUONG, "https://crm.test/{xuong}");
	return Object.fromEntries(
		Object.entries(ban).map(([loai, b]) => [
			loai,
			{
				zalo: thay(b.zalo),
				slack: thay(b.slack),
				duong: b.duong === null ? null : thay(b.duong),
			},
		]),
	);
}

export function voiToken<T>(chay: () => Promise<T>): Promise<T> {
	const cu = process.env.ZALO_BOT_TOKEN;
	process.env.ZALO_BOT_TOKEN = TOKEN;
	return chay().finally(() => {
		if (cu === undefined) delete process.env.ZALO_BOT_TOKEN;
		else process.env.ZALO_BOT_TOKEN = cu;
	});
}

export async function batBot(): Promise<void> {
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, zaloBotName: "Bot OneHub" },
		update: { zaloBotName: "Bot OneHub" },
	});
}

export async function donThem(): Promise<void> {
	await db.thongBao.deleteMany({
		where: { nguoiNhanId: { startsWith: TIEN_TO } },
	});
	await db.caiDatThongBao.deleteMany({
		where: { userId: { startsWith: TIEN_TO } },
	});
	await db.zaloLink.deleteMany({
		where: { crmUserId: { startsWith: TIEN_TO } },
	});
	await db.account.deleteMany({ where: { providerId: "slack" } });
	await db.appSetting.updateMany({
		where: { id: SETTINGS_ID },
		data: { zaloBotName: null },
	});
}

async function nguoiNhieuLoai(ten: string, goc: Date) {
	const nguoi = await gieoNguoi(ten);
	await gieoKeHoach({
		camTrich: nguoi.id,
		batDau: ngayCach(goc, -HAN_XA),
		imTu: ngayCach(goc, -HAN_XA),
		buoc: [
			{ nhan: `${ten} tre`, giao: nguoi.id, han: ngayCach(goc, HOM_QUA) },
			{ nhan: `${ten} sap`, giao: nguoi.id, han: ngayCach(goc, 1) },
		],
	});
	return nguoi;
}

async function noiZalo(userId: string, zaloUserId: string): Promise<void> {
	await db.zaloLink.create({
		data: { crmUserId: userId, zaloUserId, zaloDisplayName: zaloUserId },
	});
}

async function viecSeGui(userId: string, now: Date): Promise<ViecNhac[]> {
	return conMaDuoc(
		userId,
		(await viecCanNhac(db, { now, userId, cuaSo: "buoi-sang" })).get(userId) ??
			[],
	);
}

async function tinKyVong(
	userId: string,
	now: Date,
	kenh: "zalo" | "slack",
): Promise<string> {
	const { name } = await db.user.findUniqueOrThrow({
		where: { id: userId },
		select: { name: true },
	});
	const viec = locDayRa(
		await viecSeGui(userId, now),
		await docCaiDatThongBao(db, userId, macDinhDayRa),
	);
	const lienKet = await duongMo(APP_URL);
	return kenh === "zalo"
		? dungTin(name, now, viec, lienKet, "tron", ZALO.tranKyTu, ZALO.loi.goiY)
				.text
		: dungTin(name, now, viec, lienKet).text;
}

async function khoaDaGhi(userId: string): Promise<string[]> {
	const hang = await db.thongBao.findMany({
		where: { nguoiNhanId: userId },
		select: { khoa: true },
	});
	return hang.map((h) => h.khoa).sort();
}

async function payloadCua(userId: string) {
	return parseNhacPayload((await hangCua(userId)).payload);
}

type BaNguoi = {
	Z: { id: string };
	S: { id: string };
	goc: Date;
};

async function gieoHaiKenh(): Promise<BaNguoi> {
	const goc = lucVN(NGAY_NHAC, PHUT_SAU);
	const Z = await nguoiNhieuLoai("Zung", goc);
	const S = await nguoiNhieuLoai("Son", goc);
	await batBot();
	await noiZalo(Z.id, "ZZ");
	await noiSlack(S.id);
	await khopSlack(S.id, "U-TBK-S");
	setSystemTime(goc);
	await lenLichNhac(goc);
	return { Z, S, goc };
}

async function chayCho(
	userId: string,
	z: ReturnType<typeof zaloGia>,
	s: ReturnType<typeof slackGia>,
) {
	return voiToken(async () =>
		chayNhac(await hangCua(userId), {
			fetcher: s.fetcher,
			zaloFetcher: z.fetcher,
			appUrl: APP_URL,
		}),
	);
}

function tinSlack(s: ReturnType<typeof slackGia>): string[] {
	return s.goi
		.filter((g) => g.url.endsWith("chat.postMessage"))
		.map((g) => g.body.text ?? "");
}

function tinZalo(z: ReturnType<typeof zaloGia>, chatId: string): string[] {
	return z.guiToi(chatId).map((g) => g.body.text ?? "");
}

beforeEach(async () => {
	await donDep();
	await donThem();
	await moXuong();
});

afterEach(() => {
	setSystemTime();
});

afterAll(async () => {
	await donThem();
	await donDep();
});

describe("tbk-mac-dinh", () => {
	test("tbk-mac-dinh: 0 — ban chup du moi loai nhac sang", () => {
		const banChup = JSON.parse(readFileSync(TEP_CHUP, "utf8")) as BanChup;
		const thieu = THU_TU_NHAC.filter((l) => !(l in banChup));
		expect(thieu, `fixture thieu loai: ${thieu.join(", ")}`).toEqual([]);
	});

	test("tbk-mac-dinh: a — chua doi cai dat, tin moi loai trung tung byte ban chup", async () => {
		const nguoi = await gieoNguoi("Lan");
		const caiDat = await docCaiDatThongBao(db, nguoi.id, macDinhDayRa);
		const dungTinSauLoc: typeof dungTin = (ten, luc, viec, ...con) =>
			dungTin(ten, luc, locDayRa(viec, caiDat), ...con);
		const banChup = boTenXuong(
			JSON.parse(readFileSync(TEP_CHUP, "utf8")) as BanChup,
		);
		const hienTai = boTenXuong(
			await chupTin(dungTinSauLoc, await duongMo(CHUP.appUrl), {
				tranKyTu: ZALO.tranKyTu,
				goiY: ZALO.loi.goiY,
			}),
		);
		console.log(
			`tbk-mac-dinh a: so loai so sanh ${Object.keys(banChup).length}`,
		);
		expect(Object.keys(hienTai).length).toBe(Object.keys(banChup).length);
		for (const loai of Object.keys(banChup)) {
			expect(hienTai[loai], `tin sang lech ban chup: ${loai}`).toEqual(
				banChup[loai],
			);
		}
	});

	test("tbk-mac-dinh: b — chua doi cai dat, moi muc vao tin va vao chuong", async () => {
		const { Z, S, goc } = await gieoHaiKenh();
		const K = await nguoiNhieuLoai("Kha", goc);
		await lenLichNhac(goc);
		const z = zaloGia();
		const s = slackGia();
		for (const nguoi of [Z, S, K]) await chayCho(nguoi.id, z, s);
		for (const [nhan, nguoi] of [
			["Z", Z],
			["S", S],
			["K", K],
		] as const) {
			const p = await payloadCua(nguoi.id);
			const tinh = [...(p.mucTinh?.khoa ?? [])].sort();
			expect(tinh.length, `${nhan} khong co muc`).toBeGreaterThan(0);
			expect(
				await khoaDaGhi(nguoi.id),
				`${nhan} muc thieu trong chuong`,
			).toEqual(tinh);
			if (nhan !== "K") {
				expect(
					[...(p.daGuiKhoa ?? [])].sort(),
					`${nhan} mac dinh ma tin thieu muc`,
				).toEqual(tinh);
			}
		}
		expect(tinZalo(z, "ZZ")).toEqual([await tinKyVong(Z.id, goc, "zalo")]);
		expect(tinSlack(s)).toEqual([await tinKyVong(S.id, goc, "slack")]);
	});
});

describe("tbk-loc", () => {
	async function baLoai(userId: string, now: Date): Promise<string[]> {
		const loai = [
			...new Set((await viecSeGui(userId, now)).map((v) => v.loai)),
		];
		expect(
			loai.length,
			"nguoi gieo chua du ba loai muc",
		).toBeGreaterThanOrEqual(3);
		return loai.slice(0, 3);
	}

	for (const kenh of ["zalo", "slack"] as const) {
		test(`tbk-loc: a — ${kenh} tat mot loai thi tin bo loai do, chuong van du`, async () => {
			const { Z, S, goc } = await gieoHaiKenh();
			const nguoi = kenh === "zalo" ? Z : S;
			const [A] = await baLoai(nguoi.id, goc);
			await luuCaiDatThongBao(db, nguoi.id, A as string, false, macDinhDayRa);
			const z = zaloGia();
			const s = slackGia();
			const ket = await chayCho(nguoi.id, z, s);
			expect(ket).toBe("da-gui");
			const tin = kenh === "zalo" ? tinZalo(z, "ZZ") : tinSlack(s);
			expect(tin, "tin khong khop danh sach da loc").toEqual([
				await tinKyVong(nguoi.id, goc, kenh),
			]);
			const p = await payloadCua(nguoi.id);
			const tinh = [...(p.mucTinh?.khoa ?? [])].sort();
			expect(await khoaDaGhi(nguoi.id), "muc da tat mat khoi chuong").toEqual(
				tinh,
			);
			const viec = await viecSeGui(nguoi.id, goc);
			const khoaA = viec
				.filter((v) => v.loai === A)
				.map((v) => khoaThongBao(v, goc));
			const khoaCon = viec
				.filter((v) => v.loai !== A)
				.map((v) => khoaThongBao(v, goc))
				.sort();
			for (const k of khoaA) {
				expect(p.daGuiKhoa ?? [], "daGuiKhoa gom muc da tat").not.toContain(k);
			}
			expect([...(p.daGuiKhoa ?? [])].sort()).toEqual(khoaCon);
		});

		test(`tbk-loc: b — ${kenh} tat het moi loai hom nay thi khong gui tin`, async () => {
			const { Z, S, goc } = await gieoHaiKenh();
			const nguoi = kenh === "zalo" ? Z : S;
			const viec = await viecSeGui(nguoi.id, goc);
			for (const loai of new Set(viec.map((v) => v.loai))) {
				await luuCaiDatThongBao(db, nguoi.id, loai, false, macDinhDayRa);
			}
			const z = zaloGia();
			const s = slackGia();
			const ket = await chayCho(nguoi.id, z, s);
			expect(ket, "tat het van gui tin").toBe("da-tat-het");
			expect(
				[...tinZalo(z, "ZZ"), ...tinSlack(s)],
				"tat het van gui tin",
			).toEqual([]);
			const p = await payloadCua(nguoi.id);
			expect(await khoaDaGhi(nguoi.id)).toEqual(
				[...(p.mucTinh?.khoa ?? [])].sort(),
			);
			expect(p.daGuiKhoa).toEqual([]);
		});

		test(`tbk-loc: c — ${kenh} bat lai thi sang sau co lai muc`, async () => {
			const { Z, S, goc } = await gieoHaiKenh();
			const nguoi = kenh === "zalo" ? Z : S;
			const [A] = await baLoai(nguoi.id, goc);
			await luuCaiDatThongBao(db, nguoi.id, A as string, false, macDinhDayRa);
			await chayCho(nguoi.id, zaloGia(), slackGia());
			await luuCaiDatThongBao(db, nguoi.id, A as string, true, macDinhDayRa);
			const sangSau = ngayCach(goc, 1);
			setSystemTime(sangSau);
			await lenLichNhac(sangSau);
			const hang = await db.agentTask.findMany({
				where: { subject: { startsWith: `user:${nguoi.id}:` } },
				orderBy: { createdAt: "desc" },
			});
			const moi = hang[0];
			if (!moi) throw new Error("khong co luot sang sau");
			const z = zaloGia();
			const s = slackGia();
			await voiToken(async () =>
				chayNhac(moi, {
					fetcher: s.fetcher,
					zaloFetcher: z.fetcher,
					appUrl: APP_URL,
				}),
			);
			const p = parseNhacPayload(
				(await db.agentTask.findUniqueOrThrow({ where: { id: moi.id } }))
					.payload,
			);
			const viec = await viecSeGui(nguoi.id, sangSau);
			const khoaA = viec
				.filter((v) => v.loai === A)
				.map((v) => khoaThongBao(v, sangSau));
			expect(khoaA.length, "sang sau khong con muc loai A").toBeGreaterThan(0);
			for (const k of khoaA) expect(p.daGuiKhoa ?? []).toContain(k);
		});
	}
});
