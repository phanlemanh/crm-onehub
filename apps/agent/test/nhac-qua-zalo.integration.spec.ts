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
import { chonKenh, type UuTien } from "@crm/db/kenh-thong-bao";
import { SETTINGS_ID } from "@crm/db/settings";
import {
	bamMa,
	ghiSai,
	taoMaLienKet,
	ZALO_LIEN_KET,
} from "@crm/db/zalo-lien-ket";
import { capabilitiesFrom } from "../agent/lib/capabilities";
import { ZALO } from "../agent/lib/zalo-config";
import { pollZalo } from "../agent/lib/zalo-poll";
import { donDep, gieoNguoi, moXuong, TIEN_TO } from "./support/nhac-gieo";
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
