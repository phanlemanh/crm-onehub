import { afterAll, describe, expect, spyOn, test } from "bun:test";
import { db } from "@crm/db";
import { ghiKetQuaHoi } from "@crm/db/tai-lieu-hoi";
import { AgentTriggerService } from "../../api/src/agent/agent-trigger.service";
import { TaiLieuHoiService } from "../../api/src/tai-lieu/tai-lieu-hoi.service";
import lienKetHoi from "../agent/hooks/lien-ket-hoi";
import { TAI_LIEU_AGENT } from "../agent/lib/tai-lieu-config";
import { guiHoiKho } from "../agent/lib/tai-lieu-hoi-phien";
import { lienKetPhienGoc } from "../agent/lib/tai-lieu-lien-ket";
import { dongHoi, hoiTacTu, type YeuCauHoi } from "../agent/lib/zalo-hoi";
import { moPhien } from "../agent/lib/zalo-tra-loi";
import loiDan from "../agent/subagents/tro_ly_kho/instructions";
import {
	type CtxBatDauEve,
	ctxBatDauThat,
	donTroLyKho,
	gieoNguoi,
	ma,
} from "./support/tro-ly-kho-gia";

const HOI = TAI_LIEU_AGENT.hoi;
const LK = HOI.lienKet;
const CUA_SO_MS = HOI.timHoi.soLan * HOI.timHoi.cachMs;

type ThuocTinh = Readonly<Record<string, string>>;
type CtxGoc = {
	session: {
		id: string;
		auth: {
			current: { attributes: ThuocTinh } | null;
			initiator: { attributes: ThuocTinh } | null;
		};
	};
};
type SuKienHook = "session.started" | "turn.started";
type ChayHook = (e: { type: SuKienHook }, c: CtxGoc) => Promise<void>;
type BatDau = (
	e: { type: "session.started" },
	c: CtxBatDauEve,
) => Promise<{ markdown?: string } | null>;

const suKienHook = (
	lienKetHoi as unknown as { events: Partial<Record<SuKienHook, ChayHook>> }
).events;
const batDau = (loiDan as unknown as { events: { "session.started": BatDau } })
	.events["session.started"];

function hookCua(ten: SuKienHook): ChayHook {
	const h = suKienHook[ten];
	expect(typeof h, "hook thieu turn.started").toBe("function");
	return h as ChayHook;
}

const ctx = (
	id: string,
	current: ThuocTinh | null,
	initiator: ThuocTinh | null,
): CtxGoc => ({
	session: {
		id,
		auth: {
			current: current ? { attributes: current } : null,
			initiator: initiator ? { attributes: initiator } : null,
		},
	},
});

const chay = (ten: SuKienHook, c: CtxGoc) => hookCua(ten)({ type: ten }, c);

type GuiTuy = { auth: { attributes: ThuocTinh } };
type SendKho = Parameters<typeof guiHoiKho>[1];

const api = () => new TaiLieuHoiService(db, new AgentTriggerService(db));
const fetcherOk = (async () =>
	Response.json({ ok: true, result: true })) as unknown as typeof fetch;

const CAU = [
	"Nghỉ phép báo trước mấy ngày?",
	"Công tác phí một ngày bao nhiêu?",
	"Thử việc bao lâu?",
] as const;

type Chat = { nguoiId: string; chatId: string };

async function moChat(): Promise<Chat> {
	const nguoi = await gieoNguoi("member");
	return { nguoiId: nguoi.id, chatId: ma("chat") };
}

async function hoiTrong(chat: Chat, text: string): Promise<YeuCauHoi> {
	const ra = await db.$transaction((tx) =>
		hoiTacTu(
			tx,
			{ messageId: ma("msg"), chatId: chat.chatId, text },
			chat.nguoiId,
			new Date(),
		),
	);
	if (ra.loai !== "hoi") throw new Error(`zch: hoiTacTu tra ${ra.loai}`);
	return ra.yeuCau;
}

async function cauDauDaXong(chat: Chat, goc: string): Promise<YeuCauHoi> {
	const y1 = await hoiTrong(chat, CAU[0]);
	await chay(
		"session.started",
		ctx(goc, y1.auth.attributes, y1.auth.attributes),
	);
	await dongHoi(y1.hoiId, { ketQua: "da-tra-loi" });
	return y1;
}

const ctxCauSau = (goc: string, y: YeuCauHoi, dau: YeuCauHoi) =>
	ctx(goc, y.auth.attributes, dau.auth.attributes);

const zaloCua = (id: string) =>
	db.zaloHoi.findUniqueOrThrow({
		where: { id },
		select: { id: true, sessionId: true, ketQua: true },
	});

const khoCua = (id: string) =>
	db.taiLieuHoi.findUniqueOrThrow({
		where: { id },
		select: { id: true, phienId: true, trangThai: true },
	});

async function cauCrm(): Promise<string> {
	const nguoi = await gieoNguoi("member");
	const { hoiId } = await api().hoi(
		{ id: nguoi.id, role: nguoi.role } as never,
		{ cauHoi: "Hoá đơn công tác nộp trong bao lâu?" },
	);
	return hoiId;
}

function dongInfo(info: ReturnType<typeof spyOn>, dong: string): number {
	return info.mock.calls.map((c) => String(c[0])).filter((d) => d === dong)
		.length;
}

const moPhienVoi = (y: YeuCauHoi, goc: string) =>
	moPhien(y, {
		hoi: async () => ({ id: goc }),
		fetcher: fetcherOk,
		token: "zch-token",
		messageId: y.hoiId,
	});

afterAll(donTroLyKho);

describe("zch-lien-ket", () => {
	test("zch-lien-ket: cau-hai — turn.started gan cau hai vao phien goc, cau dau khong doi", async () => {
		const chat = await moChat();
		const goc = ma("ses-zalo");
		const y1 = await cauDauDaXong(chat, goc);
		const y2 = await hoiTrong(chat, CAU[1]);
		expect(y2.continuationToken).toBe(y1.continuationToken);
		const truoc = await zaloCua(y1.hoiId);
		const info = spyOn(console, "info");
		await chay("turn.started", ctxCauSau(goc, y2, y1));
		const so = dongInfo(info, `${LK.dong} zalo ${y2.hoiId} -> ${goc}`);
		info.mockRestore();
		expect({
			ca: "cau-hai",
			sessionId: (await zaloCua(y2.hoiId)).sessionId,
		}).toEqual({
			ca: "cau-hai",
			sessionId: goc,
		});
		expect(await zaloCua(y1.hoiId)).toEqual(truoc);
		expect(so).toBe(1);
		await moPhienVoi(y2, goc);
		expect(await db.zaloHoi.count({ where: { sessionId: goc } })).toBe(2);
	});

	test("zch-lien-ket: cau-ba — cau thu ba cung phien cung duoc gan", async () => {
		const chat = await moChat();
		const goc = ma("ses-zalo");
		const y1 = await cauDauDaXong(chat, goc);
		const y2 = await hoiTrong(chat, CAU[1]);
		await chay("turn.started", ctxCauSau(goc, y2, y1));
		await moPhienVoi(y2, goc);
		await dongHoi(y2.hoiId, { ketQua: "da-tra-loi" });
		const y3 = await hoiTrong(chat, CAU[2]);
		expect(y3.continuationToken).toBe(y1.continuationToken);
		const truoc = [await zaloCua(y1.hoiId), await zaloCua(y2.hoiId)];
		const info = spyOn(console, "info");
		await chay("turn.started", ctxCauSau(goc, y3, y1));
		const so = dongInfo(info, `${LK.dong} zalo ${y3.hoiId} -> ${goc}`);
		info.mockRestore();
		expect((await zaloCua(y3.hoiId)).sessionId).toBe(goc);
		expect([await zaloCua(y1.hoiId), await zaloCua(y2.hoiId)]).toEqual(truoc);
		expect(so).toBe(1);
		await moPhienVoi(y3, goc);
		expect(await db.zaloHoi.count({ where: { sessionId: goc } })).toBe(3);
	});

	test("zch-lien-ket: mophien-truoc — moPhien ghi truoc thi hook khong doi hang ma van in dong", async () => {
		const chat = await moChat();
		const goc = ma("ses-zalo");
		const y1 = await cauDauDaXong(chat, goc);
		const y2 = await hoiTrong(chat, CAU[1]);
		await moPhienVoi(y2, goc);
		const sauMoPhien = await zaloCua(y2.hoiId);
		expect(sauMoPhien.sessionId).toBe(goc);
		const info = spyOn(console, "info");
		await chay("turn.started", ctxCauSau(goc, y2, y1));
		const so = dongInfo(info, `${LK.dong} zalo ${y2.hoiId} -> ${goc}`);
		info.mockRestore();
		expect(await zaloCua(y2.hoiId)).toEqual(sauMoPhien);
		expect(so).toBe(1);
	});

	test("zch-lien-ket: cau-hai chieu do — thieu auth.current thi hook doc hoiId cua cau dau, cau hai van null", async () => {
		const chat = await moChat();
		const goc = ma("ses-zalo");
		const y1 = await cauDauDaXong(chat, goc);
		const y2 = await hoiTrong(chat, CAU[1]);
		const truoc = await zaloCua(y1.hoiId);
		await chay("turn.started", ctx(goc, null, y1.auth.attributes));
		expect(
			(await zaloCua(y2.hoiId)).sessionId,
			"doc hoiId cua cau dau",
		).toBeNull();
		expect(await zaloCua(y1.hoiId)).toEqual(truoc);
	});

	test("zch-lien-ket: mot-dong-zalo — session.started roi turn.started o cau dau khong ghi de", async () => {
		const chat = await moChat();
		const goc = ma("ses-zalo");
		const y1 = await hoiTrong(chat, CAU[0]);
		const c = ctx(goc, y1.auth.attributes, y1.auth.attributes);
		await chay("session.started", c);
		const sauMot = await zaloCua(y1.hoiId);
		expect(sauMot.sessionId).toBe(goc);
		await chay("turn.started", c);
		expect(await zaloCua(y1.hoiId)).toEqual(sauMot);
		expect(await db.zaloHoi.count({ where: { sessionId: goc } })).toBe(1);
	});

	test("zch-lien-ket: mot-dong-kho — cau CRM qua hai su kien van mot lien ket, guiHoiKho khong nem", async () => {
		const hoiId = await cauCrm();
		const goc = ma("ses-kho");
		let sauMot: Awaited<ReturnType<typeof khoCua>> | null = null;
		let sauHai: Awaited<ReturnType<typeof khoCua>> | null = null;
		const send = (async (_tin: string, tuy: GuiTuy) => {
			const c = ctx(goc, tuy.auth.attributes, tuy.auth.attributes);
			await chay("session.started", c);
			sauMot = await khoCua(hoiId);
			await chay("turn.started", c);
			sauHai = await khoCua(hoiId);
			return { id: goc };
		}) as unknown as SendKho;
		await expect(guiHoiKho(hoiId, send)).resolves.toBeTruthy();
		expect(sauMot).toEqual({ id: hoiId, phienId: goc, trangThai: "DANG_HOI" });
		expect(sauHai).toEqual(sauMot);
		expect(await khoCua(hoiId)).toEqual({
			id: hoiId,
			phienId: goc,
			trangThai: "DANG_HOI",
		});
	});

	test("zch-lien-ket: mot-dong chieu do — hook voi hang da gan phien khac khong ghi de", async () => {
		const chat = await moChat();
		const gocCu = ma("ses-cu");
		const y1 = await hoiTrong(chat, CAU[0]);
		await chay(
			"session.started",
			ctx(gocCu, y1.auth.attributes, y1.auth.attributes),
		);
		const truoc = await zaloCua(y1.hoiId);
		const gocMoi = ma("ses-moi");
		const info = spyOn(console, "info");
		await chay(
			"turn.started",
			ctx(gocMoi, y1.auth.attributes, y1.auth.attributes),
		);
		const so = dongInfo(info, `${LK.dong} zalo ${y1.hoiId} -> ${gocMoi}`);
		info.mockRestore();
		expect(await zaloCua(y1.hoiId), "ghi de phien khac").toEqual(truoc);
		expect(so, "ghi de phien khac").toBe(0);
	});

	test("zch-lien-ket: bang-khong-doi — turn.started voi dau vao la khong doi hang nao", async () => {
		const zalo = await hoiTrong(await moChat(), CAU[0]);
		const zaloDaGan = await hoiTrong(await moChat(), CAU[0]);
		await db.zaloHoi.update({
			where: { id: zaloDaGan.hoiId },
			data: { sessionId: ma("ses-cu") },
		});
		const zaloXong = await hoiTrong(await moChat(), CAU[0]);
		await db.zaloHoi.update({
			where: { id: zaloXong.hoiId },
			data: { ketQua: "da-tra-loi" },
		});
		const khoDaGan = await cauCrm();
		await guiHoiKho(khoDaGan, (async () => ({
			id: ma("ses-that"),
		})) as unknown as SendKho);
		const kho = await cauCrm();
		const ids = {
			zalo: [zalo.hoiId, zaloDaGan.hoiId, zaloXong.hoiId],
			kho: [kho, khoDaGan],
		};
		const chup = async () => ({
			zalo: await db.zaloHoi.findMany({
				where: { id: { in: ids.zalo } },
				select: { id: true, sessionId: true, ketQua: true },
				orderBy: { id: "asc" },
			}),
			kho: await db.taiLieuHoi.findMany({
				where: { id: { in: ids.kho } },
				select: { id: true, phienId: true, trangThai: true },
				orderBy: { id: "asc" },
			}),
		});
		type Ca = { ten: string; thuocTinh: ThuocTinh };
		const BANG: readonly Ca[] = [
			...["okr", "builder", "may-soan", "team-agent", "research"].flatMap(
				(purpose) => [
					{
						ten: `${purpose} hoiId zalo`,
						thuocTinh: { purpose, hoiId: zalo.hoiId },
					},
					{ ten: `${purpose} hoiId kho`, thuocTinh: { purpose, hoiId: kho } },
				],
			),
			{ ten: "vang purpose hoiId zalo", thuocTinh: { hoiId: zalo.hoiId } },
			{ ten: "vang purpose hoiId kho", thuocTinh: { hoiId: kho } },
			{ ten: "zalo thieu hoiId", thuocTinh: { purpose: "zalo" } },
			{
				ten: "zalo hang da gan phien khac",
				thuocTinh: { purpose: "zalo", hoiId: zaloDaGan.hoiId },
			},
			{
				ten: "zalo hang da tra loi",
				thuocTinh: { purpose: "zalo", hoiId: zaloXong.hoiId },
			},
			{
				ten: "kho hang da co phien that",
				thuocTinh: { purpose: "kho", hoiId: khoDaGan },
			},
		];
		expect(BANG).toHaveLength(16);
		let daChay = 0;
		const send = (async () => {
			for (const ca of BANG) {
				const truoc = await chup();
				const info = spyOn(console, "info");
				await chay(
					"turn.started",
					ctx(ma("ses-ca"), ca.thuocTinh, ca.thuocTinh),
				);
				const dong = info.mock.calls.filter((x) =>
					String(x[0]).startsWith(LK.dong),
				);
				info.mockRestore();
				expect({ ca: ca.ten, sau: await chup(), dong: dong.length }).toEqual({
					ca: ca.ten,
					sau: truoc,
					dong: 0,
				});
				daChay += 1;
			}
			return { id: ma("ses-kho") };
		}) as unknown as SendKho;
		await guiHoiKho(kho, send);
		expect(daChay).toBe(BANG.length);
	});

	test("zch-lien-ket: loi-db — loi co so du lieu o cau hai khong nem, ghi dung mot canh bao", async () => {
		const chat = await moChat();
		const goc = ma("ses-zalo");
		const y1 = await cauDauDaXong(chat, goc);
		const y2 = await hoiTrong(chat, CAU[1]);
		const warn = spyOn(console, "warn").mockImplementation(() => {});
		const nem = () => {
			throw new Error("csdl hong");
		};
		const dbHong = {
			zaloHoi: { updateMany: nem, findUnique: nem },
			taiLieuHoi: { updateMany: nem, findUnique: nem },
		} as unknown as typeof db;
		const ra = lienKetPhienGoc(ctxCauSau(goc, y2, y1) as never, {
			db: dbHong,
		});
		await expect(ra).resolves.toBeUndefined();
		const canhBao = warn.mock.calls.filter((c) =>
			String(c[0]).startsWith(LK.canhBao),
		);
		warn.mockRestore();
		expect(canhBao).toHaveLength(1);
		expect((await zaloCua(y2.hoiId)).sessionId).toBeNull();
	});
});

type KetGiai = { markdown: string; ms: number };

async function giai(goc: string): Promise<KetGiai> {
	const bd = performance.now();
	const ra = await batDau({ type: "session.started" }, ctxBatDauThat(goc));
	return { markdown: ra?.markdown ?? "", ms: performance.now() - bd };
}

async function cauDauTron(chat: Chat, goc: string) {
	const y1 = await hoiTrong(chat, CAU[0]);
	await chay(
		"session.started",
		ctx(goc, y1.auth.attributes, y1.auth.attributes),
	);
	const ra1 = await giai(goc);
	const t1 = await db.taiLieuHoi.findUniqueOrThrow({
		where: { zaloHoiId: y1.hoiId },
		select: { id: true },
	});
	expect(ra1.markdown).toContain(`Question id: ${t1.id}`);
	await ghiKetQuaHoi(
		db,
		t1.id,
		{ trangThai: "LOI", lyDo: "loi-model" },
		new Date(),
	);
	await dongHoi(y1.hoiId, { ketQua: "da-tra-loi" });
	expect((await khoCua(t1.id)).trangThai).toBe("LOI");
	return { y1, t1: t1.id };
}

describe("zch-chi-dan", () => {
	test("zch-chi-dan: cau-hai — phien con cua cau hai nhan chi dan mang dung cau hai", async () => {
		const chat = await moChat();
		const goc = ma("ses-zalo");
		const { y1, t1 } = await cauDauTron(chat, goc);
		const y2 = await hoiTrong(chat, CAU[1]);
		await chay("turn.started", ctxCauSau(goc, y2, y1));
		const ra = await giai(goc);
		const t2 = await db.taiLieuHoi.findUniqueOrThrow({
			where: { zaloHoiId: y2.hoiId },
			select: { id: true, phienId: true },
		});
		expect(ra.markdown).toContain(`Question id: ${t2.id}`);
		expect(ra.markdown).not.toContain(t1);
		expect(t2.phienId).toBe(goc);
		expect(ra.ms).toBeLessThan(HOI.timHoi.cachMs);
	});

	test("zch-chi-dan: cau-hai chieu do — khong hook o cau hai, lien ket muon thi phien con nhan chi dan dung", async () => {
		const chat = await moChat();
		const goc = ma("ses-zalo");
		await cauDauTron(chat, goc);
		const y2 = await hoiTrong(chat, CAU[1]);
		const warn = spyOn(console, "warn").mockImplementation(() => {});
		const muon = new Promise<void>((r) =>
			setTimeout(async () => {
				await moPhienVoi(y2, goc);
				r();
			}, CUA_SO_MS + HOI.timHoi.cachMs),
		);
		const ra = await giai(goc);
		await muon;
		warn.mockRestore();
		expect(ra.markdown, "chi dan dung o cau hai").toBe(HOI.dungLai.chiDan);
	});
});
