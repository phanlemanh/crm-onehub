import { afterAll, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { SETTINGS_ID } from "@crm/db/settings";
import { taoMaLienKet } from "@crm/db/zalo-lien-ket";
import { nhanWebhook } from "../agent/lib/zalo-webhook";
import tinGoc from "./fixtures/zalo-tin-that.json";
import { donDep, gieoNguoi, moXuong, TIEN_TO } from "./support/nhac-gieo";
import { zaloGia } from "./support/zalo-gia";
import {
	type ChonTin,
	thanWebhook,
	thanWebhookCoVo,
	yeuCauWebhook,
} from "./support/zalo-tin";

const GOC = new Date("2026-10-10T02:00:00Z");
const DU_BIEN = { token: "1:abc", khoa: "khoa-webhook-du-dai" };
const DAU_LOG = "[zalo] webhook sai khuon";
const DONG_LOG = /khoa=(\S*) khoa_message=(\S*) message_id=(\S+):/;
const BI_MAT = "NOI-DUNG-BI-MAT";

type Khuon = "that" | "vo";

const DUNG = {
	that: thanWebhook,
	vo: thanWebhookCoVo,
} satisfies Record<Khuon, (chon: ChonTin) => unknown>;

async function donZalo(): Promise<void> {
	await db.zaloUpdateSeen.deleteMany({});
	await db.zaloLinkAttempt.deleteMany({});
	await db.zaloLink.deleteMany({
		where: { crmUserId: { startsWith: TIEN_TO } },
	});
	await db.zaloLinkCode.deleteMany({
		where: { crmUserId: { startsWith: TIEN_TO } },
	});
	await db.appSetting.updateMany({
		where: { id: SETTINGS_ID },
		data: { zaloBotName: null, zaloPolledAt: null },
	});
}

async function gieoMa(ten: string) {
	const nguoi = await gieoNguoi(ten);
	const { ma } = await taoMaLienKet(db, nguoi.id, GOC);
	return { nguoi, ma };
}

async function gui(tho: string, z: ReturnType<typeof zaloGia>) {
	return nhanWebhook(yeuCauWebhook(tho, DU_BIEN.khoa).request, {
		fetcher: z.fetcher,
		now: () => GOC,
		env: DU_BIEN,
	});
}

async function demBang() {
	const [lienKet, daThay, lanSai] = await Promise.all([
		db.zaloLink.count(),
		db.zaloUpdateSeen.count(),
		db.zaloLinkAttempt.count(),
	]);
	return { lienKet, daThay, lanSai };
}

function ngheLog() {
	const log: string[] = [];
	const nghe = spyOn(console, "error").mockImplementation((...a: unknown[]) => {
		log.push(a.map((x) => Bun.inspect(x, { depth: 10 })).join(" "));
	});
	return { log, tha: () => nghe.mockRestore() };
}

beforeEach(async () => {
	await moXuong();
	await donZalo();
});

afterAll(async () => {
	await donZalo();
	await donDep();
});

describe("hai-khuon-noi", () => {
	test("hai-khuon-noi: khuon that va khuon co vo deu noi dung nguoi", async () => {
		const O: {
			ten: Khuon;
			messageId: string;
			fromId: string;
			tenZalo: string;
			khoa: string[];
		}[] = [
			{
				ten: "that",
				messageId: "hk-that",
				fromId: "Z1",
				tenZalo: "Zed Mot",
				khoa: ["event_name", "message"],
			},
			{
				ten: "vo",
				messageId: "hk-vo",
				fromId: "Z2",
				tenZalo: "Zed Hai",
				khoa: ["ok", "result"],
			},
		];
		const z = zaloGia();
		let soO = 0;
		for (const o of O) {
			const { nguoi, ma } = await gieoMa(`Nguoi ${o.ten}`);
			const than = DUNG[o.ten]({
				messageId: o.messageId,
				fromId: o.fromId,
				ten: o.tenZalo,
				text: ma,
			});
			expect(Object.keys(than), `${o.ten}: khoa cap dau`).toEqual(o.khoa);
			const res = await gui(JSON.stringify(than), z);
			expect(res.status, `${o.ten}: tra 200`).toBe(200);
			const lienKet = await db.zaloLink.findMany({
				where: { crmUserId: nguoi.id },
			});
			expect(
				lienKet.map((l) => [l.zaloUserId, l.zaloDisplayName]),
				`khuon ${o.ten} phai noi duoc`,
			).toEqual([[o.fromId, o.tenZalo]]);
			const maDaDung = await db.zaloLinkCode.findUnique({
				where: { crmUserId: nguoi.id },
			});
			expect(maDaDung?.usedAt ?? null, `${o.ten}: ma da dung`).not.toBeNull();
			expect(
				await db.zaloUpdateSeen.count({ where: { messageId: o.messageId } }),
				`${o.ten}: mot hang da thay`,
			).toBe(1);
			const traLoi = z.guiToi(o.fromId);
			expect(traLoi.length, `${o.ten}: mot tin tra loi`).toBe(1);
			expect(
				traLoi[0]?.body.text?.includes(nguoi.name),
				`${o.ten}: tra loi mang ten CRM cua dung nguoi`,
			).toBe(true);
			soO += 1;
		}
		expect(soO, "hai o").toBe(2);
	});
});

describe("trung-hai-khuon", () => {
	const THU_TU: [Khuon, Khuon][] = [
		["that", "vo"],
		["vo", "that"],
	];

	test("trung-hai-khuon: ma tran hai thu tu viet truoc", () => {
		expect(THU_TU.length, "hai thu tu").toBe(2);
	});

	for (const [i, [dau, sau]] of THU_TU.entries()) {
		test(`trung-hai-khuon: ${dau} roi ${sau} -> mot lien ket, mot tin`, async () => {
			const { nguoi, ma } = await gieoMa(`Nguoi trung ${i}`);
			const z = zaloGia();
			const chon = { messageId: `th-${i}`, fromId: `ZT${i}`, text: ma };
			for (const khuon of [dau, sau]) {
				const res = await gui(JSON.stringify(DUNG[khuon](chon)), z);
				expect(res.status, `${khuon}: tra 200`).toBe(200);
			}
			expect(
				await db.zaloLink.count({ where: { crmUserId: nguoi.id } }),
				"mot lien ket",
			).toBe(1);
			expect(
				await db.zaloUpdateSeen.count({ where: { messageId: chon.messageId } }),
				"mot hang da thay",
			).toBe(1);
			expect(
				{
					traLoi: z.guiToi(chon.fromId).length,
					daThay: await db.zaloUpdateSeen.count(),
				},
				"chong trung khong phu thuoc vo",
			).toEqual({ traLoi: 1, daThay: 1 });
		});
	}

	test("trung-hai-khuon: doi chung — hai message_id khac nhau -> hai lien ket, hai tin", async () => {
		const z = zaloGia();
		const nguoi: string[] = [];
		for (const i of [0, 1]) {
			const { nguoi: n, ma } = await gieoMa(`Nguoi doi chung ${i}`);
			nguoi.push(n.id);
			const res = await gui(
				JSON.stringify(
					thanWebhook({ messageId: `dc-${i}`, fromId: `ZD${i}`, text: ma }),
				),
				z,
			);
			expect(res.status).toBe(200);
		}
		expect(
			await db.zaloLink.count({ where: { crmUserId: { in: nguoi } } }),
			"hai lien ket",
		).toBe(2);
		expect(z.soGoi("sendMessage"), "hai tin").toBe(2);
	});
});

describe("sai-khuon-log", () => {
	test("sai-khuon-log: bon o -> 200, khong ghi, mot dong log goi ten khoa", async () => {
		const { nguoi } = await gieoMa("Nguoi sai khuon");
		const b = thanWebhook({
			messageId: "sk-b",
			fromId: "ZS",
			text: `${BI_MAT}-b`,
		});
		const bHong = {
			event_name: b.event_name,
			message: {
				...b.message,
				from: {
					display_name: b.message.from.display_name,
					is_bot: b.message.from.is_bot,
				},
			},
		};
		const c = thanWebhookCoVo({
			messageId: "sk-c",
			fromId: "ZS",
			text: `${BI_MAT}-c`,
		});
		const cHong = {
			ok: c.ok,
			result: {
				event_name: c.result.event_name,
				message: {
					chat: c.result.message.chat,
					text: c.result.message.text,
					message_id: c.result.message.message_id,
					date: c.result.message.date,
				},
			},
		};
		const CA: [string, string, string, string, string][] = [
			["a", "khong-json", "", "", "?"],
			[
				"b",
				JSON.stringify(bHong),
				"event_name,message",
				Object.keys(bHong.message).join(","),
				"sk-b",
			],
			[
				"c",
				JSON.stringify(cHong),
				"ok,result",
				Object.keys(cHong.result.message).join(","),
				"sk-c",
			],
			["d", JSON.stringify({ event_name: "x" }), "event_name", "", "?"],
		];
		expect(CA.length, "ma tran bon o sai khuon").toBe(4);
		const z = zaloGia();
		const { log, tha } = ngheLog();
		try {
			for (const [ten, than, khoa, khoaMessage, messageId] of CA) {
				const truoc = await demBang();
				const lenh = log.length;
				const res = await gui(than, z);
				expect(res.status, `${ten}: tra 200`).toBe(200);
				expect(await demBang(), `${ten}: khong ghi`).toEqual(truoc);
				expect(z.soGoi("sendMessage"), `${ten}: khong tra loi`).toBe(0);
				const moi = log.slice(lenh);
				const dong = moi.filter((l) => l.includes(DAU_LOG));
				expect(dong.length, `${ten}: mot dong log sai khuon`).toBe(1);
				expect(
					DONG_LOG.exec(dong[0] ?? "")?.slice(1, 4),
					`${ten}: log in khoa cua message`,
				).toEqual([khoa, khoaMessage, messageId]);
				expect(
					moi.join("\n"),
					`${ten}: log khong mang noi dung tin`,
				).not.toContain(BI_MAT);
			}
		} finally {
			tha();
		}
		const maCon = await db.zaloLinkCode.findUnique({
			where: { crmUserId: nguoi.id },
		});
		expect(maCon?.usedAt ?? null, "ma van song").toBeNull();
	});

	test("sai-khuon-log: doi chung — than hop le -> khong dong sai khuon, noi", async () => {
		const { nguoi, ma } = await gieoMa("Nguoi hop le");
		const z = zaloGia();
		const { log, tha } = ngheLog();
		try {
			const res = await gui(
				JSON.stringify(
					thanWebhook({ messageId: "sk-ok", fromId: "ZK", text: ma }),
				),
				z,
			);
			expect(res.status).toBe(200);
		} finally {
			tha();
		}
		expect(
			log.filter((l) => l.includes(DAU_LOG)).length,
			"than hop le khong ghi dong sai khuon",
		).toBe(0);
		expect(
			await db.zaloLink.count({ where: { crmUserId: nguoi.id } }),
			"than hop le thi noi",
		).toBe(1);
	});
});

describe("gia-khuon-that", () => {
	test("gia-khuon-that: Zalo gia rut tu fixture that va dong log production", () => {
		const chon = {
			messageId: "gk-1",
			fromId: "ZG",
			ten: "Zed Gia",
			text: "123456",
		};
		const coVo = thanWebhookCoVo(chon);
		const mong = structuredClone(tinGoc.result);
		mong.message.message_id = chon.messageId;
		mong.message.from.id = chon.fromId;
		mong.message.chat.id = chon.fromId;
		mong.message.from.display_name = chon.ten;
		mong.message.text = chon.text;
		expect(coVo.result, "gia khong rut tu fixture").toEqual(mong);
		expect(thanWebhook(chon), "khuon that la result bo vo").toEqual(
			coVo.result,
		);
		const dongLog = readFileSync(
			join(import.meta.dir, "fixtures/zalo-webhook-log-that.txt"),
			"utf8",
		);
		const khoaThat = /khoa=(\S*)/.exec(dongLog)?.[1];
		expect(khoaThat, "dong log production co khoa").toBeDefined();
		expect(
			Object.keys(thanWebhook(chon)).join(","),
			"khoa cap dau rut tu log production",
		).toBe(khoaThat ?? "");
		expect(Object.keys(coVo), "khuon co vo").toEqual(["ok", "result"]);
	});
});
