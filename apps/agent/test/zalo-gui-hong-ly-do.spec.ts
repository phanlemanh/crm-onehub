import { describe, expect, spyOn, test } from "bun:test";
import { db } from "@crm/db";
import { SETTINGS_ID } from "@crm/db/settings";
import { ghiSai, ZALO_LIEN_KET } from "@crm/db/zalo-lien-ket";
import { parseZaloGetUpdates } from "@crm/validation/zalo-update";
import {
	guiZalo,
	LoiHttpZalo,
	moTaLoiZalo,
	zaloGoi,
} from "../agent/lib/zalo-api";
import { ZALO } from "../agent/lib/zalo-config";
import {
	datKhoaLech,
	nhanWebhook,
	type PhuThuocWebhook,
} from "../agent/lib/zalo-webhook";
import { zaloGia } from "./support/zalo-gia";
import { type ChonTin, thanWebhook, yeuCauWebhook } from "./support/zalo-tin";

const GHIM = "ghim-ly-do-h4";
const TOKEN = "111:tok-h4";

function phanHoiChu(status: number, chu: string): typeof fetch {
	return (async () => new Response(chu, { status })) as unknown as typeof fetch;
}

function phanHoi(
	status: number,
	than: Record<string, string | number | boolean>,
): typeof fetch {
	return phanHoiChu(status, JSON.stringify(than));
}

function mangHong(code: string, message: string): typeof fetch {
	return (async () => {
		throw Object.assign(new Error(message), { code });
	}) as unknown as typeof fetch;
}

async function moTaKhiGui(fetcher: typeof fetch): Promise<string> {
	try {
		await guiZalo(TOKEN, "chat-h4", "chu-h4", { fetcher });
	} catch (loi) {
		if (loi instanceof Error) return moTaLoiZalo(loi);
		throw new Error("loi khong phai Error");
	}
	throw new Error("gui khong hong");
}

const thanLoi = (ma: number) => ({
	ok: false,
	error_code: ma,
	description: GHIM,
});

type DongMoTa = readonly [string, typeof fetch, string];

const MA_TRAN_MO_TA = [
	["200 ok-false", phanHoi(200, thanLoi(403)), `zalo-tu-choi 403 «${GHIM}»`],
	["200 ok-false trong", phanHoi(200, { ok: false }), "zalo-tu-choi - «-»"],
	["200 than la", phanHoi(200, { la: 1, ket: 2 }), "hinh-dang-la khoa=la,ket"],
	[
		"http 400",
		phanHoi(400, thanLoi(400)),
		`http-400 zalo-tu-choi 400 «${GHIM}»`,
	],
	[
		"http 401",
		phanHoi(401, thanLoi(401)),
		`http-401 zalo-tu-choi 401 «${GHIM}»`,
	],
	[
		"http 403",
		phanHoi(403, thanLoi(403)),
		`http-403 zalo-tu-choi 403 «${GHIM}»`,
	],
	[
		"http 404",
		phanHoi(404, thanLoi(404)),
		`http-404 zalo-tu-choi 404 «${GHIM}»`,
	],
	[
		"http 408",
		phanHoi(408, thanLoi(408)),
		`http-408 zalo-tu-choi 408 «${GHIM}»`,
	],
	[
		"http 429",
		phanHoi(429, thanLoi(429)),
		`http-429 zalo-tu-choi 429 «${GHIM}»`,
	],
	["http 500 chu", phanHoiChu(500, "<html>loi</html>"), "http-500"],
	["mang", mangHong("ECONNRESET", "socket"), "mang (ECONNRESET)"],
	[
		"dai",
		phanHoi(200, {
			ok: false,
			error_code: 403,
			description: "x".repeat(ZALO.nhatKy.tranMoTa + 50),
		}),
		`zalo-tu-choi 403 «${"x".repeat(ZALO.nhatKy.tranMoTa)}»`,
	],
] as const satisfies readonly DongMoTa[];

describe("mo-ta", () => {
	test("ma trận viết trước: mười hai phản hồi hỏng của sendMessage", async () => {
		let chay = 0;
		for (const [ten, fetcher, mong] of MA_TRAN_MO_TA) {
			const thuc = await moTaKhiGui(fetcher);
			chay++;
			if (ten === "dai" && thuc !== mong)
				throw new Error("dai: khong cat o tran");
			if (ten.startsWith("http 4") && !thuc.includes(GHIM))
				throw new Error(`${ten}: mat description`);
			if (thuc !== mong) throw new Error(`${ten}: mo ta ${thuc} khac ${mong}`);
		}
		expect(chay).toBe(12);
	});
});

describe("408", () => {
	test("getUpdates 408 vẫn là hết tin; sendMessage 408 là lỗi http-408", async () => {
		const tho = await zaloGoi(
			phanHoi(408, thanLoi(408)),
			TOKEN,
			ZALO.poll.lenhKeo,
			{},
		);
		expect(parseZaloGetUpdates(tho).loai).toBe("het");
		const loi = await zaloGoi(
			phanHoi(408, thanLoi(408)),
			TOKEN,
			"sendMessage",
			{},
		).then(
			() => null,
			(e: Error) => e,
		);
		if (!(loi instanceof LoiHttpZalo))
			throw new Error("408 sendMessage bi cho lot");
		expect(loi.status).toBe(408);
		expect(moTaLoiZalo(loi).startsWith("http-408")).toBe(true);
	});
});

type NhatKy = { dong: string[]; tra: () => void };

function batNhatKy(): NhatKy {
	const dong: string[] = [];
	const thu = (...phan: string[]) => {
		dong.push(phan.map(String).join(" "));
	};
	const loi = spyOn(console, "error").mockImplementation(thu);
	const ghi = spyOn(console, "log").mockImplementation(thu);
	return {
		dong,
		tra: () => {
			loi.mockRestore();
			ghi.mockRestore();
		},
	};
}

const KHOA_DUNG = "khoa-dung-h4";
const KHOA_SAI = "khoa-sai-h4";
const CHU_RIENG = "chu-rieng-tu-h4";
const BIEN = { token: TOKEN, khoa: KHOA_DUNG };

async function datLyDo(lyDo: string | null): Promise<void> {
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, zaloWebhookLyDo: lyDo },
		update: { zaloWebhookLyDo: lyDo },
	});
}

async function lyDoHienTai(): Promise<string | null> {
	const s = await db.appSetting.findUnique({
		where: { id: SETTINGS_ID },
		select: { zaloWebhookLyDo: true },
	});
	return s?.zaloWebhookLyDo ?? null;
}

function guiWebhook(
	than: string,
	header: string | null,
	deps: PhuThuocWebhook,
): Promise<Response> {
	return nhanWebhook(yeuCauWebhook(than, header).request, deps);
}

const demDong = (nk: NhatKy, dung: string) =>
	nk.dong.filter((d) => d === dung).length;

const coChua = (nk: NhatKy, chu: string) =>
	nk.dong.filter((d) => d.includes(chu)).length;

describe("bo-qua", () => {
	test("bốn nhánh bỏ qua đều ghi mã nhánh", async () => {
		await db.zaloUpdateSeen.deleteMany({});
		await db.zaloLinkAttempt.deleteMany({});
		const zalo = zaloGia({ send: "ok" });
		const deps = { env: BIEN, fetcher: zalo.fetcher };
		const gui = (chon: ChonTin) =>
			guiWebhook(JSON.stringify(thanWebhook(chon)), KHOA_DUNG, deps);
		for (let i = 0; i < ZALO_LIEN_KET.doMa.toiDa; i++) {
			await ghiSai(db, "zbq3", new Date());
		}
		const nk = batNhatKy();
		try {
			await gui({ messageId: "bq-1", fromId: "zbq1", chatType: "GROUP" });
			await gui({ messageId: "bq-2", fromId: "zbq2", text: "chao" });
			await gui({ messageId: "bq-2", fromId: "zbq2", text: "chao" });
			await gui({ messageId: "bq-3", fromId: "zbq3", text: "chao" });
			await gui({ messageId: "bq-4", fromId: "zbq4", text: "chao" });
		} finally {
			nk.tra();
		}
		const DONG = [
			["khong-rieng", "bq-1"],
			["da-gap", "bq-2"],
			["bi-chan", "bq-3"],
			["chua-noi", "bq-4"],
		] as const;
		let chay = 0;
		for (const [lyDo, id] of DONG) {
			const dong = `[zalo] bo qua message_id=${id} ly_do=${lyDo}`;
			if (demDong(nk, dong) !== 1)
				throw new Error(`${lyDo}: khong co dong bo qua`);
			chay++;
		}
		expect(chay).toBe(4);
		expect(zalo.guiToi("zbq4").map((g) => g.body.text)).toEqual([
			ZALO.loi.huongDan,
		]);
	});
});

describe("webhook-thu", () => {
	test("sự kiện thử của Zalo không bị ghi là sai khuôn", async () => {
		const THAN_THU = {
			event_name: "message.text.received",
			message: { date: 1, message_id: "webhook-test", text: "test" },
		};
		const nk = batNhatKy();
		let thu: Response;
		try {
			thu = await guiWebhook(JSON.stringify(THAN_THU), KHOA_DUNG, {
				env: BIEN,
			});
			await guiWebhook(
				JSON.stringify({ message: { message_id: "m1" } }),
				KHOA_DUNG,
				{ env: BIEN },
			);
		} finally {
			nk.tra();
		}
		expect(thu.status).toBe(200);
		if (coChua(nk, "sai khuon") !== 1 || !nk.dong.at(-1)?.includes("sai khuon"))
			throw new Error("webhook-test van ghi sai khuon");
		expect(demDong(nk, "[zalo] webhook-test")).toBe(1);
	});
});

describe("webhook-403", () => {
	test("khoá lệch đặt lý do bền đúng một lần, kẻ lạ không bật cảnh báo", async () => {
		const zalo = zaloGia({ send: "ok" });
		let tong = 0;
		const deps: PhuThuocWebhook = {
			env: BIEN,
			fetcher: zalo.fetcher,
			datKhoaLech: async () => {
				const n = await datKhoaLech();
				tong += n;
				return n;
			},
		};
		const tin = (i: number) =>
			JSON.stringify(
				thanWebhook({
					messageId: `w403-${i}`,
					fromId: "zw403",
					text: CHU_RIENG,
				}),
			);
		await datLyDo(null);
		const nk = batNhatKy();
		try {
			const dongThoi = await Promise.all(
				[1, 2, 3].map((i) => guiWebhook(tin(i), KHOA_SAI, deps)),
			);
			const lanLuot: Response[] = [];
			for (const i of [4, 5, 6])
				lanLuot.push(await guiWebhook(tin(i), KHOA_SAI, deps));
			expect([...dongThoi, ...lanLuot].map((r) => r.status)).toEqual([
				403, 403, 403, 403, 403, 403,
			]);
			expect(demDong(nk, "[zalo] webhook 403 ly_do=khoa-lech")).toBe(6);
			if ((await lyDoHienTai()) !== "khoa-lech")
				throw new Error("403 khong dat ly do khoa-lech");
			if (tong !== 1) throw new Error("403 ghi lai moi yeu cau");

			await datLyDo(null);
			const thieu = await guiWebhook(tin(7), null, deps);
			expect(thieu.status).toBe(403);
			expect(demDong(nk, "[zalo] webhook 403 ly_do=thieu-khoa")).toBe(1);
			expect(await lyDoHienTai()).toBeNull();

			const la = await guiWebhook(JSON.stringify({ x: 1 }), KHOA_SAI, deps);
			expect(la.status).toBe(403);
			expect(demDong(nk, "[zalo] webhook 403 ly_do=khoa-lech")).toBe(7);
			if ((await lyDoHienTai()) !== null)
				throw new Error("ke la bat canh bao gia");

			const truoc = await db.appSetting.findUnique({
				where: { id: SETTINGS_ID },
			});
			const chuaCo = await guiWebhook(tin(8), KHOA_SAI, {
				...deps,
				env: { token: null, khoa: null },
			});
			expect(chuaCo.status).toBe(404);
			expect(demDong(nk, "[zalo] webhook 404 ly_do=chua-co-bot")).toBe(1);
			expect(
				await db.appSetting.findUnique({ where: { id: SETTINGS_ID } }),
			).toEqual(truoc);

			const dung = await guiWebhook(tin(9), KHOA_DUNG, deps);
			expect(dung.status).toBe(200);
		} finally {
			nk.tra();
		}
		expect(coChua(nk, "webhook 403")).toBe(8);
		for (const bi of [KHOA_SAI, KHOA_DUNG, CHU_RIENG]) {
			if (coChua(nk, bi) > 0) throw new Error(`lo ${bi} trong nhat ky`);
		}
	});
});
