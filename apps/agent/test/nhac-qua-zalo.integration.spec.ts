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
import { db } from "@crm/db";
import { chonKenh, kenhSeDungCua, type UuTien } from "@crm/db/kenh-thong-bao";
import { NHAC } from "@crm/db/onboarding-nhac";
import { SETTINGS_ID } from "@crm/db/settings";
import {
	bamMa,
	ghiSai,
	taoMaLienKet,
	ZALO_LIEN_KET,
} from "@crm/db/zalo-lien-ket";
import { parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import { capabilitiesFrom } from "../agent/lib/capabilities";
import { chayNhac, lenLichNhac } from "../agent/lib/nhac-ke-hoach";
import { ZALO } from "../agent/lib/zalo-config";
import { pollZalo } from "../agent/lib/zalo-poll";
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
	dongCo,
	gieoGui,
	gieoMuoiHai,
	HAN_XA,
	HOM_QUA,
	hangCua,
	lucVN,
	NGAY_NHAC,
	ngayCach,
	PHUT_SAU,
	tenCongTy,
} from "./support/nhac-gui-gieo";
import { type TinGia, zaloGia } from "./support/zalo-gia";

type DongBang = [UuTien, boolean, boolean, "zalo" | "slack" | null, boolean];

const BANG: DongBang[] = [
	["AUTO", true, true, "zalo", false],
	["AUTO", true, false, "zalo", false],
	["AUTO", false, true, "slack", false],
	["AUTO", false, false, null, false],
	["ZALO", true, true, "zalo", false],
	["ZALO", true, false, "zalo", false],
	["ZALO", false, true, "slack", true],
	["ZALO", false, false, null, false],
	["SLACK", true, true, "slack", false],
	["SLACK", true, false, "zalo", true],
	["SLACK", false, true, "slack", false],
	["SLACK", false, false, null, false],
];

function ghimCua([uu, zalo, slack]: DongBang): string {
	if (uu === "AUTO") return "AUTO khong bao gio lech";
	if (uu === "SLACK" && slack) return "SLACK chon Slack khi Slack duoc";
	return `chon-kenh ${uu} zalo=${zalo} slack=${slack}`;
}

describe("chon-kenh", () => {
	test("chon-kenh: ma tran toan phan 3x2x2", () => {
		expect(BANG.length, "ma tran toan phan 3x2x2").toBe(12);
	});

	for (const dong of BANG) {
		const [uu, zalo, slack, kenh, lech] = dong;
		test(`chon-kenh: ${uu} zalo=${zalo} slack=${slack}`, () => {
			expect(chonKenh(uu, zalo, slack), ghimCua(dong)).toEqual({ kenh, lech });
		});
	}
});

const GOC = new Date("2026-10-10T02:00:00Z");
const PHUT_MS = 60_000;
const TOKEN = "1:abc";
const CHAM_QUET_MS = 60_000;

function sau(goc: Date, ms: number): Date {
	return new Date(goc.getTime() + ms);
}

async function donZalo(): Promise<void> {
	await db.zaloUpdateSeen.deleteMany({});
	await db.zaloLinkAttempt.deleteMany({});
	await db.zaloLink.deleteMany({
		where: { crmUserId: { startsWith: TIEN_TO } },
	});
	await db.zaloLinkCode.deleteMany({
		where: { crmUserId: { startsWith: TIEN_TO } },
	});
	await db.notificationPreference.deleteMany({
		where: { userId: { startsWith: TIEN_TO } },
	});
	await db.appSetting.updateMany({
		where: { id: SETTINGS_ID },
		data: { zaloBotName: null, zaloPolledAt: null },
	});
}

function voiToken<T>(
	giaTri: string | undefined,
	chay: () => Promise<T>,
): Promise<T> {
	const cu = process.env.ZALO_BOT_TOKEN;
	if (giaTri === undefined) delete process.env.ZALO_BOT_TOKEN;
	else process.env.ZALO_BOT_TOKEN = giaTri;
	return chay().finally(() => {
		if (cu === undefined) delete process.env.ZALO_BOT_TOKEN;
		else process.env.ZALO_BOT_TOKEN = cu;
	});
}

async function nhip(tin: TinGia[], now: Date) {
	const z = zaloGia({ tin });
	const ket = await voiToken(TOKEN, () =>
		pollZalo({ fetcher: z.fetcher, now: () => now }),
	);
	return { z, ket };
}

async function botDangGhi() {
	return db.appSetting.findUnique({ where: { id: SETTINGS_ID } });
}

async function lienKetCua(zaloUserId: string) {
	return db.zaloLink.findMany({ where: { zaloUserId } });
}

async function quetLinhCanh(linhCanh: string): Promise<string[]> {
	const cot = await db.$queryRaw<{ table_name: string; column_name: string }[]>`
		SELECT table_name, column_name FROM information_schema.columns
		WHERE table_schema = 'public'
		AND data_type IN ('text', 'character varying', 'jsonb', 'json')`;
	const trung: string[] = [];
	for (const { table_name, column_name } of cot) {
		const dem = await db.$queryRawUnsafe<{ n: bigint }[]>(
			`SELECT count(*) AS n FROM "${table_name}" WHERE "${column_name}"::text LIKE $1`,
			`%${linhCanh}%`,
		);
		if ((dem[0]?.n ?? 0n) > 0n) trung.push(`${table_name}.${column_name}`);
	}
	return trung;
}

function maKhac(daDung: string[]): string {
	for (let i = 0; ; i++) {
		const ma = String(i).padStart(ZALO_LIEN_KET.ma.soChuSo, "0");
		if (!daDung.includes(ma)) return ma;
	}
}

describe("zalo", () => {
	beforeEach(async () => {
		await moXuong();
		await donZalo();
	});
	afterEach(() => {
		setSystemTime();
	});
	afterAll(async () => {
		await donZalo();
		await donDep();
	});

	describe("khong-token", () => {
		test("khong-token: khong goi Zalo, zaloBotName null, nang luc tat", async () => {
			const z = zaloGia();
			const nangLuc = await voiToken(undefined, async () => {
				await pollZalo({ fetcher: z.fetcher, now: () => GOC });
				return capabilitiesFrom(null).find((c) => c.id === "ZALO_BOT_TOKEN");
			});
			expect(z.goi.length, "khong token thi khong goi Zalo").toBe(0);
			expect((await botDangGhi())?.zaloBotName ?? null).toBeNull();
			expect(nangLuc?.enabled, "nang luc Zalo tat khi khong token").toBe(false);
		});

		test("khong-token: co token, getMe ok -> ghi ten bot va gio poll", async () => {
			setSystemTime(GOC);
			const z = zaloGia();
			const nangLuc = await voiToken(TOKEN, async () => {
				await pollZalo({ fetcher: z.fetcher });
				return capabilitiesFrom(null).find((c) => c.id === "ZALO_BOT_TOKEN");
			});
			const s = await botDangGhi();
			expect({
				ten: s?.zaloBotName,
				luc: s?.zaloPolledAt?.toISOString(),
				bat: nangLuc?.enabled,
			}).toEqual({ ten: "Bot OneHub", luc: GOC.toISOString(), bat: true });
		});

		test("khong-token: token hong, getMe 401 -> zaloBotName null, khong nem", async () => {
			await db.appSetting.upsert({
				where: { id: SETTINGS_ID },
				create: { id: SETTINGS_ID, zaloBotName: "Bot OneHub" },
				update: { zaloBotName: "Bot OneHub" },
			});
			const loiGhi = spyOn(console, "error").mockImplementation(() => {});
			const z = zaloGia({ getMe: 401 });
			const ket = await voiToken("1:hong", () =>
				pollZalo({ fetcher: z.fetcher, now: () => GOC }),
			);
			loiGhi.mockRestore();
			expect(ket).toEqual({ xuLy: 0, loi: 1 });
			expect(
				(await botDangGhi())?.zaloBotName ?? null,
				"token hong thi Zalo tat",
			).toBeNull();
			expect(z.soGoi("getUpdates"), "token hong thi khong hoi tin").toBe(0);
		});
	});

	describe("noi-ma", () => {
		test("noi-ma: tao ma hai lan, nhan ma lan 2 -> mot lien ket, ma lan 1 chet", async () => {
			const U = await gieoNguoi("Uyen Noima");
			setSystemTime(GOC);
			const m1 = await taoMaLienKet(db, U.id, GOC);
			const m2 = await taoMaLienKet(db, U.id, GOC);
			for (const m of [m1, m2]) {
				expect(m.ma).toMatch(new RegExp(`^\\d{${ZALO_LIEN_KET.ma.soChuSo}}$`));
				expect(m.expiresAt.getTime()).toBe(
					GOC.getTime() + ZALO_LIEN_KET.ma.songMs,
				);
			}
			const hang = await db.zaloLinkCode.findMany({
				where: { crmUserId: U.id },
			});
			expect(hang.length, "mot nguoi mot ma song").toBe(1);
			expect(JSON.stringify(hang), "khong luu ma ro").not.toContain(m2.ma);
			expect(
				await db.zaloLinkCode.findUnique({ where: { codeHash: bamMa(m1.ma) } }),
				"ma cu het song",
			).toBeNull();
			expect(hang[0]?.codeHash).toBe(bamMa(m2.ma));

			const { z } = await nhip(
				[{ messageId: "t1", fromId: "Z", ten: "Zed", text: m2.ma }],
				GOC,
			);
			const lk = await db.zaloLink.findMany({ where: { crmUserId: U.id } });
			expect(lk.map((l) => [l.zaloUserId, l.zaloDisplayName])).toEqual([
				["Z", "Zed"],
			]);
			expect(
				(await db.zaloLinkCode.findUnique({ where: { crmUserId: U.id } }))
					?.usedAt,
			).not.toBeNull();
			expect(
				z.guiToi("Z").map((g) => g.body.text?.includes(U.name)),
				"xac nhan mang ten CRM",
			).toEqual([true]);

			await nhip([{ messageId: "t2", fromId: "Z2", text: m1.ma }], GOC);
			expect(
				(await db.zaloLink.findMany({ where: { crmUserId: U.id } })).map(
					(l) => l.zaloUserId,
				),
				"ma cu het song",
			).toEqual(["Z"]);
		});
	});

	describe("ma-hong", () => {
		test(
			"ma-hong: sai, het han, da dung, chu -> khong lien ket, khong lo ten, 3 lan sai, khong luu chu",
			async () => {
				const U = await gieoNguoi("Uyen Mahong");
				const U2 = await gieoNguoi("Vy Hethan");
				const U3 = await gieoNguoi("Tam Dadung");
				const T = sau(GOC, ZALO_LIEN_KET.ma.songMs + PHUT_MS);
				setSystemTime(GOC);
				const maHetHan = await taoMaLienKet(db, U2.id, GOC);
				setSystemTime(T);
				const maDaDung = await taoMaLienKet(db, U3.id, T);
				await nhip([{ messageId: "mh0", fromId: "Z3", text: maDaDung.ma }], T);
				const maSong = await taoMaLienKet(db, U.id, T);
				const maSai = maKhac([maSong.ma, maHetHan.ma, maDaDung.ma]);
				const linhCanh = `LINHCANH-NQZ-${crypto.randomUUID()}`;

				const { z } = await nhip(
					[
						{ messageId: "mh1", fromId: "Z", text: maSai },
						{ messageId: "mh2", fromId: "Z", text: maHetHan.ma },
						{ messageId: "mh3", fromId: "Z", text: maDaDung.ma },
						{ messageId: "mh4", fromId: "Z", text: linhCanh },
					],
					T,
				);

				expect(
					(await lienKetCua("Z")).length,
					"ma hong khong tao lien ket",
				).toBe(0);
				const tra = z.guiToi("Z").map((g) => g.body.text ?? "");
				expect(tra.length, "moi tin mot tra loi").toBe(4);
				const ten = [U, U2, U3].map((n) => n.name);
				expect(
					tra.filter((t) => ten.some((n) => t.includes(n))),
					"khong lo ten",
				).toEqual([]);
				expect(
					(await db.zaloLinkAttempt.findUnique({ where: { zaloUserId: "Z" } }))
						?.failures,
					"tin khong phai 6 so khong tinh lan sai",
				).toBe(3);
				expect(
					await quetLinhCanh(linhCanh),
					"chu cua tin khong nam o bang nao",
				).toEqual([]);

				await nhip([{ messageId: "mh5", fromId: "Z", text: maSong.ma }], T);
				expect(
					(await lienKetCua("Z")).map((l) => l.crmUserId),
					"ma dung cung fixture thi noi duoc",
				).toEqual([U.id]);
			},
			CHAM_QUET_MS,
		);

		test(
			"ma-hong: doi chung, chen tay linh canh vao AgentTask thi phep quet do",
			async () => {
				await db.agentTask.create({
					data: { kind: "nqz-thu", reason: "LINHCANH-NQZ-777", dueAt: GOC },
				});
				const trung = await quetLinhCanh("LINHCANH-NQZ-777");
				await db.agentTask.deleteMany({ where: { kind: "nqz-thu" } });
				expect(trung, "phep quet thay linh canh da chen").toContain(
					"agentTask.reason",
				);
			},
			CHAM_QUET_MS,
		);
	});

	describe("chong-do", () => {
		test("chong-do: sai du toiDa lan thi bi bo qua, qua cua so thi noi duoc", async () => {
			const U = await gieoNguoi("Uyen Chongdo");
			setSystemTime(GOC);
			for (let i = 0; i < ZALO_LIEN_KET.doMa.toiDa; i++) {
				await ghiSai(db, "Z", GOC);
			}
			const m = await taoMaLienKet(db, U.id, GOC);
			const { z } = await nhip(
				[{ messageId: "cd1", fromId: "Z", text: m.ma }],
				GOC,
			);
			expect(
				{
					lienKet: (await lienKetCua("Z")).length,
					gui: z.soGoi("sendMessage"),
					usedAt:
						(await db.zaloLinkCode.findUnique({ where: { crmUserId: U.id } }))
							?.usedAt ?? null,
				},
				"sai du toiDa lan thi bi bo qua",
			).toEqual({ lienKet: 0, gui: 0, usedAt: null });

			const T = sau(GOC, ZALO_LIEN_KET.doMa.cuaSoMs);
			setSystemTime(T);
			const m2 = await taoMaLienKet(db, U.id, T);
			await nhip([{ messageId: "cd2", fromId: "Z", text: m2.ma }], T);
			expect(
				(await lienKetCua("Z")).map((l) => l.crmUserId),
				"het cua so thi duoc thu lai",
			).toEqual([U.id]);
		});

		test("chong-do: bien, sai toiDa - 1 lan thi ma dung van noi", async () => {
			const U = await gieoNguoi("Uyen Bien");
			setSystemTime(GOC);
			for (let i = 0; i < ZALO_LIEN_KET.doMa.toiDa - 1; i++) {
				await ghiSai(db, "Z", GOC);
			}
			const m = await taoMaLienKet(db, U.id, GOC);
			await nhip([{ messageId: "cb1", fromId: "Z", text: m.ma }], GOC);
			expect(
				(await lienKetCua("Z")).map((l) => l.crmUserId),
				"sai du toiDa lan thi bi bo qua, chua du thi chua",
			).toEqual([U.id]);
		});
	});

	describe("noi-lai", () => {
		test("noi-lai: Z nhan ma cua U2 -> Z sang U2, Z2 roi U2, U1 ve AUTO", async () => {
			const U1 = await gieoNguoi("Uyen Noilai");
			const U2 = await gieoNguoi("Vy Noilai");
			setSystemTime(GOC);
			const m1 = await taoMaLienKet(db, U1.id, GOC);
			const m2 = await taoMaLienKet(db, U2.id, GOC);
			await nhip(
				[
					{ messageId: "nl1", fromId: "Z", text: m1.ma },
					{ messageId: "nl2", fromId: "Z2", text: m2.ma },
				],
				GOC,
			);
			await db.notificationPreference.create({
				data: { userId: U1.id, channel: "ZALO" },
			});
			expect(
				(await db.zaloLink.findMany({ orderBy: { zaloUserId: "asc" } })).map(
					(l) => [l.crmUserId, l.zaloUserId],
				),
				"hai lien ket dau",
			).toEqual([
				[U1.id, "Z"],
				[U2.id, "Z2"],
			]);

			const m3 = await taoMaLienKet(db, U2.id, GOC);
			await nhip([{ messageId: "nl3", fromId: "Z", text: m3.ma }], GOC);

			expect(
				(await lienKetCua("Z")).map((l) => l.crmUserId),
				"Z sang U2",
			).toEqual([U2.id]);
			expect(
				await db.zaloLink.count({
					where: { crmUserId: U2.id, zaloUserId: "Z2" },
				}),
				"U2 bo Z2",
			).toBe(0);
			expect(
				{
					lienKet: await db.zaloLink.count({ where: { crmUserId: U1.id } }),
					uuTien: (
						await db.notificationPreference.findUnique({
							where: { userId: U1.id },
						})
					)?.channel,
				},
				"mat lien ket thi uu tien ZALO ve AUTO",
			).toEqual({ lienKet: 0, uuTien: "AUTO" });
		});
	});

	describe("trung-tin", () => {
		test("trung-tin: cung message_id trong nhip va nhip ke -> xu ly mot lan", async () => {
			const U = await gieoNguoi("Uyen Trungtin");
			setSystemTime(GOC);
			const m = await taoMaLienKet(db, U.id, GOC);
			const tin = { messageId: "tt1", fromId: "Z", text: m.ma };
			const lan1 = await nhip([tin, tin], GOC);
			const lan2 = await nhip([tin], sau(GOC, PHUT_MS));
			expect((await lienKetCua("Z")).map((l) => l.crmUserId)).toEqual([U.id]);
			expect(
				lan1.z.guiToi("Z").length + lan2.z.guiToi("Z").length,
				"mot message_id xu ly mot lan",
			).toBe(1);
		});

		test("trung-tin: getUpdates khong bao gio het -> dung o toiDaMoiNhip", async () => {
			const z = zaloGia({ vatVoTan: true });
			await voiToken(TOKEN, () =>
				pollZalo({ fetcher: z.fetcher, now: () => GOC }),
			);
			expect(
				z.soGoi("getUpdates"),
				"moi nhip toi da toiDaMoiNhip lan getUpdates",
			).toBe(ZALO.poll.toiDaMoiNhip);
		});

		test("trung-tin: tin sai schema giua hai tin tot -> khong nem, ghi message_id, khong danh dau", async () => {
			const loiGhi = spyOn(console, "error").mockImplementation(() => {});
			const { z, ket } = await nhip(
				[
					{ messageId: "tot1", fromId: "Z1", text: "chao" },
					{ messageId: "hong1", fromId: "x", hong: true },
					{ messageId: "tot2", fromId: "Z2", text: "chao" },
				],
				GOC,
			);
			const daGhi = loiGhi.mock.calls.map((c) => c.map(String).join(" "));
			loiGhi.mockRestore();
			expect(ket, "nhip dem mot loi, hai tin tot").toEqual({ xuLy: 2, loi: 1 });
			expect([z.guiToi("Z1").length, z.guiToi("Z2").length]).toEqual([1, 1]);
			expect(
				daGhi.some((d) => d.includes("hong1")),
				"loi ghi ra message_id tin hong",
			).toBe(true);
			expect(
				await db.zaloUpdateSeen.findUnique({ where: { messageId: "hong1" } }),
				"tin hong khong danh dau da xem",
			).toBeNull();
		});
	});
});

const APP_URL = "https://crm.test";
const TEN_DAC_BIET = `${TIEN_TO}Minh & Co <HN>`;
const DAI = 200;

function lienKetTron(dong: string): string | null {
	return / — (\S+)$/.exec(dong)?.[1] ?? null;
}

async function batBot(): Promise<void> {
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, zaloBotName: "Bot OneHub" },
		update: { zaloBotName: "Bot OneHub" },
	});
}

async function noiZalo(userId: string, zaloUserId: string): Promise<void> {
	await db.zaloLink.create({
		data: {
			crmUserId: userId,
			zaloUserId,
			zaloDisplayName: `Zalo ${zaloUserId}`,
		},
	});
}

async function uuTien(userId: string, channel: UuTien): Promise<void> {
	await db.notificationPreference.upsert({
		where: { userId },
		create: { userId, channel },
		update: { channel },
	});
}

async function gieoMotViec(ten: string) {
	const nguoi = await gieoNguoi(ten);
	const O = await gieoNguoi(`${ten} cam trich`);
	const goc = lucVN(NGAY_NHAC, PHUT_SAU);
	await gieoKeHoach({
		camTrich: O.id,
		batDau: ngayCach(goc, -HAN_XA),
		imTu: ngayCach(goc, HOM_QUA),
		buoc: [{ nhan: "Tre", giao: nguoi.id, han: ngayCach(goc, HOM_QUA) }],
	});
	return nguoi;
}

async function batLoi(chay: () => Promise<unknown>): Promise<string> {
	try {
		await chay();
	} catch (loi) {
		return loi instanceof Error ? `nem: ${loi.message}` : "nem";
	}
	return "khong nem";
}

describe("gui-kenh", () => {
	beforeEach(async () => {
		await donDep();
		await donZalo();
		await db.account.deleteMany({ where: { providerId: "slack" } });
		await moXuong();
	});
	afterEach(() => {
		setSystemTime();
	});
	afterAll(async () => {
		await donZalo();
		await donDep();
	});

	test("gui-zalo: mot sendMessage toi ZA, khong Slack, chu tron, doc lai hang", async () => {
		const g = await gieoGui();
		await db.company.updateMany({
			where: { onboardingPlans: { some: { id: g.keHoach[0]?.id } } },
			data: { name: TEN_DAC_BIET },
		});
		await noiZalo(g.A.id, "ZA");
		await batBot();
		setSystemTime(g.goc);
		await lenLichNhac(g.goc);
		const z = zaloGia();
		const s = slackGia();
		const ket = await voiToken(TOKEN, async () =>
			chayNhac(await hangCua(g.A.id), {
				fetcher: s.fetcher,
				zaloFetcher: z.fetcher,
				appUrl: APP_URL,
			}),
		);
		const gui = z.guiToi("ZA");
		expect(gui.length, "dung mot sendMessage toi ZA").toBe(1);
		expect(s.goi.length, "khong goi Slack").toBe(0);
		const text = gui[0]?.body.text ?? "";
		for (const cam of ["*", "<http", "|mở kế hoạch>"]) {
			expect(text.includes(cam), `tin Zalo la chu tron: ${cam}`).toBe(false);
		}
		expect(
			text.includes("Minh & Co <HN>") && !text.includes("&amp;"),
			"tin Zalo khong thoat HTML",
		).toBe(true);
		expect(text.indexOf("Quá hạn"), "Quá hạn truoc Sắp hạn").toBeLessThan(
			text.indexOf("Sắp hạn"),
		);
		expect(text.indexOf("Sắp hạn"), "Sắp hạn truoc Kế hoạch im").toBeLessThan(
			text.indexOf("Kế hoạch im"),
		);
		const moiDong = await Promise.all(
			g.keHoach.map(async (k) =>
				dongCo(text, `${await tenCongTy(k.id)} ·`).map((d) =>
					lienKetTron(d)?.endsWith(`?record=plan:${k.id}`),
				),
			),
		);
		expect(moiDong, "dong mo dung ke hoach cua no").toEqual(
			g.keHoach.map(() => [true]),
		);
		const hang = await hangCua(g.A.id);
		const p = parseNhacPayload(hang.payload);
		expect({
			ket,
			outcome: hang.outcome,
			kenh: p.kenh,
			lech: p.lechKenh,
			daGui: (p.daGui ?? []).map((m) => m.planId).sort(),
		}).toEqual({
			ket: "da-gui",
			outcome: "da-gui:4",
			kenh: "zalo",
			lech: false,
			daGui: g.keHoach.map((k) => k.id).sort(),
		});
	});

	test("gui-zalo: doi chung, go ZaloLink thi di Slack", async () => {
		const g = await gieoGui();
		await batBot();
		setSystemTime(g.goc);
		await lenLichNhac(g.goc);
		const z = zaloGia();
		const s = slackGia();
		await voiToken(TOKEN, async () =>
			chayNhac(await hangCua(g.A.id), {
				fetcher: s.fetcher,
				zaloFetcher: z.fetcher,
				appUrl: APP_URL,
			}),
		);
		const p = parseNhacPayload((await hangCua(g.A.id)).payload);
		expect({
			zalo: z.goi.length,
			slack: s.goi.filter((c) => c.url.endsWith("chat.postMessage")).length,
			kenh: p.kenh,
		}).toEqual({ zalo: 0, slack: 1, kenh: "slack" });
	});

	async function guiMuoiHai(tenDai: boolean) {
		const g = await gieoMuoiHai();
		if (tenDai) {
			for (const [i, v] of g.viec.entries()) {
				const ten = `${TIEN_TO}${"X".repeat(DAI)}${i}`;
				await db.company.updateMany({
					where: { onboardingPlans: { some: { id: v.planId } } },
					data: { name: ten },
				});
				v.congTy = ten;
			}
		}
		await noiZalo(g.A.id, "ZA");
		await batBot();
		setSystemTime(g.goc);
		await lenLichNhac(g.goc);
		const z = zaloGia();
		await voiToken(TOKEN, async () =>
			chayNhac(await hangCua(g.A.id), {
				zaloFetcher: z.fetcher,
				appUrl: APP_URL,
			}),
		);
		const text = z.guiToi("ZA")[0]?.body.text ?? "";
		const hien = g.viec.filter((v) =>
			text.includes(`?record=plan:${v.planId}`),
		);
		const daGui = (
			parseNhacPayload((await hangCua(g.A.id)).payload).daGui ?? []
		)
			.map((m) => m.planId)
			.sort();
		return { g, text, hien, daGui };
	}

	test("tran-zalo: ten dai, tin khong vuot tran, dem con lai dung, daGui dung", async () => {
		const { g, text, hien, daGui } = await guiMuoiHai(true);
		const conLai = g.viec.length - hien.length;
		expect(text.length, "tin Zalo khong vuot tran ky tu").toBeLessThanOrEqual(
			ZALO.tranKyTu,
		);
		expect(
			hien.length,
			"ten dai thi cat bot dong theo tran ky tu",
		).toBeLessThan(NHAC.tran);
		expect(text, "dong con lai dem dung so viec khong co trong tin").toContain(
			`và ${conLai} việc nữa`,
		);
		expect(daGui, "daGui dung tap dong co trong tin").toEqual(
			hien.map((v) => v.planId).sort(),
		);
	});

	test("tran-zalo: doi chung, ten ngan thi du NHAC.tran dong", async () => {
		const { g, text, hien, daGui } = await guiMuoiHai(false);
		expect({
			soHien: hien.length,
			conLai: text.includes(`và ${g.viec.length - NHAC.tran} việc nữa`),
			daGui: daGui.length,
		}).toEqual({ soHien: NHAC.tran, conLai: true, daGui: NHAC.tran });
	});

	test("lech-kenh: P Q R S di dung kenh, trang thai trung payload", async () => {
		const [P, Q, R, S] = await Promise.all([
			gieoMotViec("Phuong"),
			gieoMotViec("Quang"),
			gieoMotViec("Rin"),
			gieoMotViec("Son"),
		]);
		if (!P || !Q || !R || !S) throw new Error("gieo thieu nguoi");
		await noiSlack(P.id);
		await batBot();
		await uuTien(P.id, "ZALO");
		await khopSlack(P.id, "U-P");
		await uuTien(Q.id, "SLACK");
		await noiZalo(Q.id, "ZQ");
		await uuTien(R.id, "ZALO");
		await noiZalo(R.id, "ZR");
		await khopSlack(R.id, "U-R");
		await uuTien(S.id, "ZALO");
		const goc = lucVN(NGAY_NHAC, PHUT_SAU);
		setSystemTime(goc);
		await lenLichNhac(goc);
		const chay = async (id: string, token: string | undefined) => {
			const z = zaloGia();
			const s = slackGia();
			return voiToken(token, async () => {
				const truoc = await kenhSeDungCua(db, id, {
					coToken: token !== undefined,
				});
				const ket = await chayNhac(await hangCua(id), {
					fetcher: s.fetcher,
					zaloFetcher: z.fetcher,
					appUrl: APP_URL,
				});
				const hang = await hangCua(id);
				const p = parseNhacPayload(hang.payload);
				return {
					ket,
					outcome: hang.outcome,
					zalo: z.goi.length,
					slack: s.goi.filter((c) => c.url.endsWith("chat.postMessage")).length,
					kenh: p.kenh ?? null,
					lech: p.lechKenh ?? null,
					trangKhop:
						truoc.kenh === (p.kenh ?? null) &&
						(truoc.kenh === null || truoc.lech === p.lechKenh),
				};
			});
		};
		expect(
			await chay(P.id, TOKEN),
			"uu tien khong dung duoc thi di kenh con lai",
		).toEqual({
			ket: "da-gui",
			outcome: "da-gui:1",
			zalo: 0,
			slack: 1,
			kenh: "slack",
			lech: true,
			trangKhop: true,
		});
		expect(
			await chay(Q.id, TOKEN),
			"SLACK khong dung duoc thi di Zalo",
		).toEqual({
			ket: "da-gui",
			outcome: "da-gui:1",
			zalo: 1,
			slack: 0,
			kenh: "zalo",
			lech: true,
			trangKhop: true,
		});
		expect(
			await chay(R.id, undefined),
			"thieu token thi khong goi Zalo",
		).toEqual({
			ket: "da-gui",
			outcome: "da-gui:1",
			zalo: 0,
			slack: 1,
			kenh: "slack",
			lech: true,
			trangKhop: true,
		});
		expect(await chay(S.id, TOKEN), "khong kenh nao thi khong-khop").toEqual({
			ket: "khong-khop",
			outcome: "khong-khop",
			zalo: 0,
			slack: 0,
			kenh: null,
			lech: null,
			trangKhop: true,
		});
	});

	async function chayLoi(send: 500 | "ok-false" | "ok") {
		const A = await gieoMotViec("Loi");
		await noiSlack(A.id);
		await khopSlack(A.id, "U-L");
		await noiZalo(A.id, "ZL");
		await uuTien(A.id, "ZALO");
		await batBot();
		const goc = lucVN(NGAY_NHAC, PHUT_SAU);
		setSystemTime(goc);
		await lenLichNhac(goc);
		const z = zaloGia({ send });
		const s = slackGia();
		const ket = await voiToken(TOKEN, async () =>
			batLoi(async () =>
				chayNhac(await hangCua(A.id), {
					fetcher: s.fetcher,
					zaloFetcher: z.fetcher,
					appUrl: APP_URL,
				}),
			),
		);
		const hang = await hangCua(A.id);
		const p = parseNhacPayload(hang.payload);
		return {
			nem: ket.startsWith("nem"),
			slack: s.goi.length,
			dong: hang.finishedAt !== null,
			coKenh: p.kenh !== undefined,
			coDaGui: p.daGui !== undefined,
		};
	}

	test("zalo-loi: HTTP 500 thi nem, khong Slack, hang chua dong", async () => {
		expect(await chayLoi(500), "Zalo loi khong roi sang Slack").toEqual({
			nem: true,
			slack: 0,
			dong: false,
			coKenh: false,
			coDaGui: false,
		});
	});

	test("zalo-loi: ok false thi nem, khong Slack, hang chua dong", async () => {
		expect(await chayLoi("ok-false"), "ok false la loi").toEqual({
			nem: true,
			slack: 0,
			dong: false,
			coKenh: false,
			coDaGui: false,
		});
	});

	test("zalo-loi: doi chung, ok true thi khong nem va hang dong", async () => {
		expect(await chayLoi("ok")).toEqual({
			nem: false,
			slack: 0,
			dong: true,
			coKenh: true,
			coDaGui: true,
		});
	});

	test("khong-token: token hong, getMe 401 roi nhac di Slack kem lech", async () => {
		const A = await gieoMotViec("Hong");
		await noiSlack(A.id);
		await khopSlack(A.id, "U-H");
		await noiZalo(A.id, "ZH");
		await uuTien(A.id, "ZALO");
		await batBot();
		const goc = lucVN(NGAY_NHAC, PHUT_SAU);
		setSystemTime(goc);
		const z = zaloGia({ getMe: 401 });
		const s = slackGia();
		await voiToken(TOKEN, () =>
			pollZalo({ fetcher: z.fetcher, now: () => goc }),
		);
		await lenLichNhac(goc);
		await voiToken(TOKEN, async () =>
			chayNhac(await hangCua(A.id), {
				fetcher: s.fetcher,
				zaloFetcher: z.fetcher,
				appUrl: APP_URL,
			}),
		);
		const p = parseNhacPayload((await hangCua(A.id)).payload);
		expect(
			{
				send: z.goi.filter((g) => g.method === "sendMessage").length,
				slack: s.goi.filter((c) => c.url.endsWith("chat.postMessage")).length,
				kenh: p.kenh,
				lech: p.lechKenh,
			},
			"token hong thi Zalo tat, nhac di Slack kem lech",
		).toEqual({ send: 0, slack: 1, kenh: "slack", lech: true });
	});
});
