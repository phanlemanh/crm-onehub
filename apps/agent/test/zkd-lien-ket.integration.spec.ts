import { afterAll, describe, expect, spyOn, test } from "bun:test";
import { db } from "@crm/db";
import { AgentTriggerService } from "../../api/src/agent/agent-trigger.service";
import { TaiLieuHoiService } from "../../api/src/tai-lieu/tai-lieu-hoi.service";
import lienKetHoi from "../agent/hooks/lien-ket-hoi";
import { TAI_LIEU_AGENT } from "../agent/lib/tai-lieu-config";
import { guiHoiKho } from "../agent/lib/tai-lieu-hoi-phien";
import { lienKetPhienGoc } from "../agent/lib/tai-lieu-lien-ket";
import { hoiTacTu, type YeuCauHoi } from "../agent/lib/zalo-hoi";
import { moPhien } from "../agent/lib/zalo-tra-loi";
import { donTroLyKho, gieoNguoi, ma } from "./support/tro-ly-kho-gia";

const LK = TAI_LIEU_AGENT.hoi.lienKet;

type ThuocTinh = Readonly<Record<string, string>>;
type CtxGoc = {
	session: {
		id: string;
		auth: {
			current: { attributes: ThuocTinh };
			initiator: { attributes: ThuocTinh };
		};
	};
};
type BatDauHook = (e: { type: "session.started" }, c: CtxGoc) => Promise<void>;

const hook = (
	lienKetHoi as unknown as {
		events: { "session.started": BatDauHook };
	}
).events["session.started"];

const ctxGoc = (id: string, attributes: ThuocTinh): CtxGoc => ({
	session: {
		id,
		auth: { current: { attributes }, initiator: { attributes } },
	},
});

const chayHook = (id: string, attributes: ThuocTinh) =>
	hook({ type: "session.started" }, ctxGoc(id, attributes));

type GuiTuy = { auth: { attributes: ThuocTinh } };
type SendKho = Parameters<typeof guiHoiKho>[1];

const api = () => new TaiLieuHoiService(db, new AgentTriggerService(db));

async function cauZalo(): Promise<YeuCauHoi> {
	const nguoi = await gieoNguoi("member");
	const ra = await db.$transaction((tx) =>
		hoiTacTu(
			tx,
			{
				messageId: ma("msg"),
				chatId: ma("chat"),
				text: "Nghỉ phép báo trước mấy ngày?",
			},
			nguoi.id,
			new Date(),
		),
	);
	if (ra.loai !== "hoi") throw new Error(`zkd: hoiTacTu tra ${ra.loai}`);
	return ra.yeuCau;
}

async function cauCrm(): Promise<string> {
	const nguoi = await gieoNguoi("member");
	const { hoiId } = await api().hoi(
		{ id: nguoi.id, role: nguoi.role } as never,
		{ cauHoi: "Hoá đơn công tác nộp trong bao lâu?" },
	);
	return hoiId;
}

const fetcherOk = (async () =>
	Response.json({ ok: true, result: true })) as unknown as typeof fetch;

const zaloCua = (id: string) =>
	db.zaloHoi.findUniqueOrThrow({
		where: { id },
		select: { sessionId: true, ketQua: true },
	});

const khoCua = (id: string) =>
	db.taiLieuHoi.findUniqueOrThrow({
		where: { id },
		select: { phienId: true, trangThai: true },
	});

afterAll(donTroLyKho);

describe("zkd-lien-ket", () => {
	test("zkd-lien-ket: zalo-som — hook ghi sessionId truoc khi moPhien ghi, ghi lai cung gia tri", async () => {
		const info = spyOn(console, "info");
		const y = await cauZalo();
		const goc = ma("ses-zalo");
		let trongHook: string | null | undefined;
		await moPhien(y, {
			hoi: async (yc) => {
				await chayHook(goc, yc.auth.attributes);
				trongHook = (await zaloCua(yc.hoiId)).sessionId;
				return { id: goc };
			},
			fetcher: fetcherOk,
			token: "zkd-token",
			messageId: y.hoiId,
		});
		const dong = info.mock.calls
			.map((c) => String(c[0]))
			.filter((d) => d === `${LK.dong} zalo ${y.hoiId} -> ${goc}`);
		info.mockRestore();
		expect({ ca: "zalo-som", trongHook }).toEqual({
			ca: "zalo-som",
			trongHook: goc,
		});
		expect((await zaloCua(y.hoiId)).sessionId).toBe(goc);
		expect(await db.zaloHoi.count({ where: { sessionId: goc } })).toBe(1);
		expect(dong).toHaveLength(1);
	});

	test("zkd-lien-ket: zalo-som chieu do — hook voi hoiId cua hang khac khong ghi hang dich", async () => {
		const dich = await cauZalo();
		const khac = await cauZalo();
		await chayHook(ma("ses-lech"), { ...khac.auth.attributes });
		expect({
			ca: "zalo-som",
			dich: (await zaloCua(dich.hoiId)).sessionId,
		}).toEqual({
			ca: "zalo-som",
			dich: null,
		});
	});

	test("zkd-lien-ket: crm-som — hook ghi phienId thay dau cho, guiHoiKho ghi lai khong nem", async () => {
		const hoiId = await cauCrm();
		const goc = ma("ses-kho");
		let trongHook: string | null | undefined;
		const send = (async (_tin: string, tuy: GuiTuy) => {
			expect((await khoCua(hoiId)).phienId).toBe(`gui:${hoiId}`);
			await chayHook(goc, tuy.auth.attributes);
			trongHook = (await khoCua(hoiId)).phienId;
			return { id: goc };
		}) as unknown as SendKho;
		await guiHoiKho(hoiId, send);
		expect({ ca: "crm-som", trongHook }).toEqual({
			ca: "crm-som",
			trongHook: goc,
		});
		expect(await khoCua(hoiId)).toEqual({
			phienId: goc,
			trangThai: "DANG_HOI",
		});
		expect(await db.taiLieuHoi.count({ where: { phienId: goc } })).toBe(1);
	});

	test("zkd-lien-ket: crm-som chieu do — hang chua mang dau cho thi hook khong ghi", async () => {
		const hoiId = await cauCrm();
		await chayHook(ma("ses-kho"), { purpose: "kho", hoiId });
		expect({ ca: "crm-som", phienId: (await khoCua(hoiId)).phienId }).toEqual({
			ca: "crm-som",
			phienId: null,
		});
	});

	test("zkd-lien-ket: crm-ghi-lai — send tra ma phien khac sau hook thi phienId khong bi ghi de", async () => {
		const hoiId = await cauCrm();
		const goc = ma("ses-kho");
		const send = (async (_tin: string, tuy: GuiTuy) => {
			await chayHook(goc, tuy.auth.attributes);
			return { id: ma("ses-khac") };
		}) as unknown as SendKho;
		await guiHoiKho(hoiId, send);
		expect({
			ca: "crm-ghi-lai",
			phienId: (await khoCua(hoiId)).phienId,
		}).toEqual({
			ca: "crm-ghi-lai",
			phienId: goc,
		});
	});

	test("zkd-lien-ket: khong-ghi — bang ca viet truoc, khong hang nao doi", async () => {
		const zalo = await cauZalo();
		const zaloDaGan = await cauZalo();
		await db.zaloHoi.update({
			where: { id: zaloDaGan.hoiId },
			data: { sessionId: ma("ses-cu") },
		});
		const zaloXong = await cauZalo();
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
			...["okr", "builder", "may-soan", "team-agent"].flatMap((purpose) => [
				{
					ten: `${purpose} hoiId zalo`,
					thuocTinh: { purpose, hoiId: zalo.hoiId },
				},
				{ ten: `${purpose} hoiId kho`, thuocTinh: { purpose, hoiId: kho } },
			]),
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
		expect(BANG).toHaveLength(14);
		const send = (async () => {
			for (const ca of BANG) {
				const truoc = await chup();
				await chayHook(ma("ses-ca"), ca.thuocTinh);
				expect({ ca: ca.ten, sau: await chup() }).toEqual({
					ca: ca.ten,
					sau: truoc,
				});
			}
			return { id: ma("ses-kho") };
		}) as unknown as SendKho;
		await guiHoiKho(kho, send);
	});

	test("zkd-lien-ket: loi-csdl — loi co so du lieu khong nem, ghi dung mot canh bao", async () => {
		const warn = spyOn(console, "warn").mockImplementation(() => {});
		const nem = () => {
			throw new Error("csdl hong");
		};
		const dbHong = {
			zaloHoi: { updateMany: nem, findUnique: nem },
			taiLieuHoi: { updateMany: nem, findUnique: nem },
		} as unknown as typeof db;
		const ra = lienKetPhienGoc(
			ctxGoc(ma("ses-hong"), {
				purpose: "zalo",
				hoiId: "cxxxxxxxxxxxxxxxxxxxxxxx",
			}),
			{
				db: dbHong,
			},
		);
		await expect(ra).resolves.toBeUndefined();
		const canhBao = warn.mock.calls.filter((c) =>
			String(c[0]).startsWith(LK.canhBao),
		);
		warn.mockRestore();
		expect(canhBao).toHaveLength(1);
	});
});
