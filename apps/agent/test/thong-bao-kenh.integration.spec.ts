import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	setSystemTime,
	spyOn,
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
import {
	khoaThongBao,
	LOAI_SU_KIEN,
	type LoaiSuKien,
	MUC_THONG_BAO,
	macDinhDayRa,
	type NoiDungThongBao,
	noiDungThongBao,
	THONG_BAO,
} from "@crm/validation/thong-bao";
import { cauSuKienVi } from "@crm/validation/thong-bao-cau";
import {
	chayNhac,
	conMaDuoc,
	duongMo,
	lenLichNhac,
	locDayRa,
} from "../agent/lib/nhac-ke-hoach";
import { dayThongBaoSuKien } from "../agent/lib/thong-bao-day";
import { dungTin } from "../agent/lib/tin-nhac";
import { ZALO } from "../agent/lib/zalo-config";
import { type BanChup, CHUP, chupTin } from "./support/chup-tin-nhac";
import { MUC_MAU_TAC_NHAN } from "./support/muc-mau-tac-nhan";
import { MUC_MAU_TIN_HIEU } from "./support/muc-mau-tin-hieu";
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

const PHUT_MS = 60 * 1000;

const MAU_SU_KIEN = {
	...MUC_MAU_TAC_NHAN,
	...MUC_MAU_TIN_HIEU,
} satisfies Record<LoaiSuKien, NoiDungThongBao>;

async function ghiSuKien(
	userId: string,
	loai: LoaiSuKien,
	luc: Date,
): Promise<string> {
	const goc = MAU_SU_KIEN[loai];
	const noiDung = noiDungThongBao.parse(
		goc.loai === "tin-hieu-doi-cho"
			? { ...goc, sha: `${goc.sha.slice(0, 30)}${luc.getTime()}`.slice(0, 40) }
			: { ...goc, luotId: `${userId}-${luc.getTime()}` },
	);
	const tinHieu = noiDung.loai === "tin-hieu-doi-cho";
	const h = await db.thongBao.create({
		data: {
			nguoiNhanId: userId,
			nguon: tinHieu ? THONG_BAO.nguon.tinHieu : THONG_BAO.nguon.tacNhan,
			khoa: khoaThongBao(noiDung, luc),
			noiDung,
			duongDan: tinHieu
				? "/tin-hieu"
				: `/chat/${"conversationId" in noiDung ? noiDung.conversationId : ""}`,
			ngayDau: "2026-10-10",
			thayNgay: "2026-10-10",
			taoLuc: luc,
		},
		select: { id: true },
	});
	return h.id;
}

async function batLoai(userId: string, loai: string): Promise<void> {
	await luuCaiDatThongBao(db, userId, loai, true, macDinhDayRa);
}

async function nguoiKenh(kenh: "zalo" | "slack") {
	const n = await gieoNguoi(kenh === "zalo" ? "Zung" : "Son");
	if (kenh === "zalo") {
		await batBot();
		await noiZalo(n.id, `Z-${n.id}`);
	} else {
		await noiSlack(n.id);
		await khopSlack(n.id, `U-${n.id}`);
	}
	return n;
}

function chatId(kenh: "zalo" | "slack", id: string): string {
	return kenh === "zalo" ? `Z-${id}` : `U-${id}`;
}

async function day(
	z: ReturnType<typeof zaloGia>,
	s: ReturnType<typeof slackGia>,
	now: Date,
) {
	return voiToken(() =>
		dayThongBaoSuKien({
			now,
			zaloFetcher: z.fetcher,
			fetcher: s.fetcher,
			appUrl: APP_URL,
		}),
	);
}

function tinGui(
	kenh: "zalo" | "slack",
	z: ReturnType<typeof zaloGia>,
	s: ReturnType<typeof slackGia>,
	id: string,
): string[] {
	return kenh === "zalo" ? tinZalo(z, chatId(kenh, id)) : tinSlack(s);
}

describe("tbk-mac-dinh", () => {
	test("tbk-mac-dinh: c — chua bat thi thong bao su kien khong ra kenh", async () => {
		const goc = new Date("2026-10-10T03:00:00Z");
		const Z = await nguoiKenh("zalo");
		const S = await nguoiKenh("slack");
		for (const n of [Z, S]) {
			await ghiSuKien(n.id, "tac-nhan-xong", goc);
			await ghiSuKien(n.id, "tin-hieu-doi-cho", goc);
		}
		const z = zaloGia();
		const s = slackGia();
		await day(z, s, new Date(goc.getTime() + PHUT_MS));
		await day(z, s, new Date(goc.getTime() + 2 * PHUT_MS));
		expect(
			[...tinZalo(z, chatId("zalo", Z.id)), ...tinSlack(s)],
			"thong bao su kien bi day khi chua bat: tac-nhan-xong",
		).toEqual([]);
		const daDay = await db.thongBao.count({
			where: { nguoiNhanId: { in: [Z.id, S.id] }, dayLuc: { not: null } },
		});
		expect(daDay).toBe(0);
	});
});

describe("tbk-su-kien", () => {
	const loaiSuKien = LOAI_SU_KIEN.filter((l) => !MUC_THONG_BAO[l].macDinhDayRa);

	test("tbk-su-kien: ma tran du bon loai", () => {
		console.log(`tbk-su-kien: so loai ${loaiSuKien.length}`);
		expect(loaiSuKien.length).toBe(4);
	});

	for (const kenh of ["zalo", "slack"] as const) {
		for (const loai of loaiSuKien) {
			test(`tbk-su-kien: ${kenh} × ${loai} — mot tin, cau chuong, duong dan`, async () => {
				const goc = new Date("2026-10-10T03:00:00Z");
				setSystemTime(new Date(goc.getTime() - PHUT_MS));
				const n = await nguoiKenh(kenh);
				await batLoai(n.id, loai);
				setSystemTime(goc);
				const id = await ghiSuKien(n.id, loai, goc);
				const truoc = await db.thongBao.findUniqueOrThrow({ where: { id } });
				const z = zaloGia();
				const s = slackGia();
				await day(z, s, new Date(goc.getTime() + PHUT_MS));
				const tin = tinGui(kenh, z, s, n.id);
				expect(tin.length, "thong bao su kien khong ra kenh").toBe(1);
				const nd = noiDungThongBao.parse(truoc.noiDung);
				if (!(LOAI_SU_KIEN as readonly string[]).includes(nd.loai)) {
					throw new Error("mau khong phai su kien");
				}
				const [cau, duong] = (tin[0] ?? "").split("\n");
				expect(cau, "cau tin khac cau chuong").toBe(
					cauSuKienVi(nd as Parameters<typeof cauSuKienVi>[0]),
				);
				expect(duong ?? "", "duong dan tin khac duong dan thong bao").toMatch(
					new RegExp(`^${APP_URL}/[^/]+${truoc.duongDan}$`),
				);
				const sau = await db.thongBao.findUniqueOrThrow({ where: { id } });
				expect(sau.dayLuc).not.toBeNull();
				expect(sau.dayKenh).toBe(kenh);
				expect(sau.docLuc).toEqual(truoc.docLuc);
				expect(sau.moLuc).toEqual(truoc.moLuc);
				expect(sau.noiDung).toEqual(truoc.noiDung);
			});
		}
	}

	test("tbk-su-kien: e — thong bao ghi truoc luc bat thi khong gui", async () => {
		const goc = new Date("2026-10-10T03:00:00Z");
		const n = await nguoiKenh("zalo");
		await ghiSuKien(n.id, "tac-nhan-xong", new Date(goc.getTime() - PHUT_MS));
		setSystemTime(goc);
		await batLoai(n.id, "tac-nhan-xong");
		const z = zaloGia();
		const s = slackGia();
		await day(z, s, new Date(goc.getTime() + PHUT_MS));
		expect(
			tinZalo(z, chatId("zalo", n.id)),
			"thong bao cu bi day khi vua bat",
		).toEqual([]);
	});

	test("tbk-su-kien: e2 — thong bao ghi dung luc bat van gui", async () => {
		const goc = new Date("2026-10-10T03:00:00Z");
		const n = await nguoiKenh("zalo");
		setSystemTime(goc);
		await batLoai(n.id, "tac-nhan-xong");
		const { doiLuc } = await db.caiDatThongBao.findUniqueOrThrow({
			where: { userId_loai: { userId: n.id, loai: "tac-nhan-xong" } },
		});
		await ghiSuKien(n.id, "tac-nhan-xong", doiLuc);
		const z = zaloGia();
		await day(z, slackGia(), new Date(goc.getTime() + PHUT_MS));
		expect(tinZalo(z, chatId("zalo", n.id)).length).toBe(1);
	});

	test("tbk-su-kien: f — cua so 30 phut", async () => {
		const goc = new Date("2026-10-10T03:00:00Z");
		setSystemTime(new Date(goc.getTime() - 60 * PHUT_MS));
		const n = await nguoiKenh("zalo");
		await batLoai(n.id, "tac-nhan-xong");
		setSystemTime(goc);
		const cu = await ghiSuKien(
			n.id,
			"tac-nhan-xong",
			new Date(goc.getTime() - (THONG_BAO.day.cuaSoPhut + 1) * PHUT_MS),
		);
		const moi = await ghiSuKien(
			n.id,
			"tac-nhan-xong",
			new Date(goc.getTime() - (THONG_BAO.day.cuaSoPhut - 1) * PHUT_MS),
		);
		const z = zaloGia();
		await day(z, slackGia(), goc);
		const hCu = await db.thongBao.findUniqueOrThrow({ where: { id: cu } });
		expect(hCu.dayLuc, "thong bao qua cua so van day").toBeNull();
		expect(tinZalo(z, chatId("zalo", n.id)).length).toBe(1);
		const hMoi = await db.thongBao.findUniqueOrThrow({ where: { id: moi } });
		expect(hMoi.dayLuc).not.toBeNull();
	});

	test("tbk-su-kien: g — bat ma khong co kenh thi khong gui, khong nem", async () => {
		const goc = new Date("2026-10-10T03:00:00Z");
		setSystemTime(new Date(goc.getTime() - PHUT_MS));
		const n = await gieoNguoi("Kha");
		await batLoai(n.id, "tac-nhan-xong");
		setSystemTime(goc);
		const id = await ghiSuKien(n.id, "tac-nhan-xong", goc);
		const z = zaloGia();
		const s = slackGia();
		const ket = await day(z, s, new Date(goc.getTime() + PHUT_MS));
		expect(ket.hong).toBe(0);
		expect([...z.goi, ...s.goi]).toEqual([]);
		const h = await db.thongBao.findUniqueOrThrow({ where: { id } });
		expect(h.dayKenh).toBeNull();
	});

	test("tbk-su-kien: nguoi da roi xuong thi bo qua, nguoi khac van gui", async () => {
		const goc = new Date("2026-10-10T03:00:00Z");
		setSystemTime(new Date(goc.getTime() - PHUT_MS));
		const roi = await nguoiKenh("zalo");
		const con = await nguoiKenh("zalo");
		for (const n of [roi, con]) await batLoai(n.id, "tac-nhan-xong");
		setSystemTime(goc);
		await ghiSuKien(roi.id, "tac-nhan-xong", goc);
		await ghiSuKien(con.id, "tac-nhan-xong", goc);
		await db.member.deleteMany({ where: { userId: roi.id } });
		const z = zaloGia();
		await day(z, slackGia(), new Date(goc.getTime() + PHUT_MS));
		expect(tinZalo(z, chatId("zalo", roi.id))).toEqual([]);
		expect(tinZalo(z, chatId("zalo", con.id)).length).toBe(1);
	});
});

describe("tbk-hong", () => {
	async function mot(): Promise<{ id: string; userId: string; goc: Date }> {
		const goc = new Date("2026-10-10T03:00:00Z");
		setSystemTime(new Date(goc.getTime() - PHUT_MS));
		const n = await nguoiKenh("zalo");
		await noiSlack(n.id);
		await khopSlack(n.id, `U-${n.id}`);
		await db.notificationPreference.create({
			data: { userId: n.id, channel: "ZALO" },
		});
		await batLoai(n.id, "tac-nhan-xong");
		setSystemTime(goc);
		const id = await ghiSuKien(n.id, "tac-nhan-xong", goc);
		return { id, userId: n.id, goc };
	}

	test("tbk-hong: a, b — hai nhip chong va nhip lai van mot tin", async () => {
		const { userId, goc } = await mot();
		const z = zaloGia();
		const s = slackGia();
		const luc = new Date(goc.getTime() + PHUT_MS);
		await Promise.all([day(z, s, luc), day(z, s, luc)]);
		expect(
			tinZalo(z, chatId("zalo", userId)).length,
			"day trung khi hai nhip chong",
		).toBe(1);
		await day(z, s, new Date(goc.getTime() + 2 * PHUT_MS));
		expect(tinZalo(z, chatId("zalo", userId)).length).toBe(1);
	});

	test("tbk-hong: c — Zalo hong khong doi sang Slack, ghi loi", async () => {
		const { id, goc } = await mot();
		const z = zaloGia({ send: 500 });
		const s = slackGia();
		const tat = spyOn(console, "error").mockImplementation(() => {});
		await day(z, s, new Date(goc.getTime() + PHUT_MS));
		tat.mockRestore();
		expect(tinSlack(s), "zalo loi doi sang slack").toEqual([]);
		const h = await db.thongBao.findUniqueOrThrow({ where: { id } });
		expect(h.dayLoi ?? "").not.toBe("");
		expect(h.dayLan).toBe(1);
	});

	test("tbk-hong: d — hong nhip mot, nhip hai gui duoc", async () => {
		const { id, userId, goc } = await mot();
		const tat = spyOn(console, "error").mockImplementation(() => {});
		await day(
			zaloGia({ send: 500 }),
			slackGia(),
			new Date(goc.getTime() + PHUT_MS),
		);
		tat.mockRestore();
		const z = zaloGia();
		await day(z, slackGia(), new Date(goc.getTime() + 2 * PHUT_MS));
		expect(tinZalo(z, chatId("zalo", userId)).length).toBe(1);
		const h = await db.thongBao.findUniqueOrThrow({ where: { id } });
		expect(h.dayLoi).toBeNull();
	});

	test("tbk-hong: e, f — ba lan hong thi thoi, thong bao van con", async () => {
		const { id, goc } = await mot();
		const tat = spyOn(console, "error").mockImplementation(() => {});
		for (let i = 1; i <= THONG_BAO.day.tranLan; i += 1) {
			await day(
				zaloGia({ send: 500 }),
				slackGia(),
				new Date(goc.getTime() + i * PHUT_MS),
			);
		}
		tat.mockRestore();
		const z = zaloGia();
		await day(
			z,
			slackGia(),
			new Date(goc.getTime() + (THONG_BAO.day.tranLan + 1) * PHUT_MS),
		);
		expect(z.soGoi("sendMessage"), "thu lai qua tran").toBe(0);
		const h = await db.thongBao.findUniqueOrThrow({ where: { id } });
		expect(h.dayLan).toBe(THONG_BAO.day.tranLan);
		expect(h.docLuc).toBeNull();
	});
});
