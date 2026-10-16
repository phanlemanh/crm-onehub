import { afterAll, describe, expect, spyOn, test } from "bun:test";
import { db } from "@crm/db";
import { AgentTriggerService } from "../../api/src/agent/agent-trigger.service";
import { TaiLieuHoiService } from "../../api/src/tai-lieu/tai-lieu-hoi.service";
import lienKetHoi from "../agent/hooks/lien-ket-hoi";
import { TAI_LIEU_AGENT } from "../agent/lib/tai-lieu-config";
import { guiHoiKho } from "../agent/lib/tai-lieu-hoi-phien";
import { hoiTacTu, type YeuCauHoi } from "../agent/lib/zalo-hoi";
import { moPhien } from "../agent/lib/zalo-tra-loi";
import loiDan, { LOI_DAN } from "../agent/subagents/tro_ly_kho/instructions";
import {
	type CtxBatDauEve,
	ctxBatDauThat,
	donTroLyKho,
	gieoNguoi,
	ma,
} from "./support/tro-ly-kho-gia";

const HOI = TAI_LIEU_AGENT.hoi;
const CUA_SO_MS = HOI.timHoi.soLan * HOI.timHoi.cachMs;

type ThuocTinh = Readonly<Record<string, string>>;
type BatDauHook = (
	e: { type: "session.started" },
	c: {
		session: {
			id: string;
			auth: {
				current: { attributes: ThuocTinh };
				initiator: { attributes: ThuocTinh };
			};
		};
	},
) => Promise<void>;
type BatDau = (
	e: { type: "session.started" },
	c: CtxBatDauEve,
) => Promise<{ markdown?: string } | null>;

const hook = (
	lienKetHoi as unknown as {
		events: { "session.started": BatDauHook };
	}
).events["session.started"];
const batDau = (loiDan as unknown as { events: { "session.started": BatDau } })
	.events["session.started"];

const chayHook = (id: string, attributes: ThuocTinh) =>
	hook(
		{ type: "session.started" },
		{
			session: {
				id,
				auth: { current: { attributes }, initiator: { attributes } },
			},
		},
	);

type SendKho = Parameters<typeof guiHoiKho>[1];
type GuiTuy = { auth: { attributes: ThuocTinh } };

const api = () => new TaiLieuHoiService(db, new AgentTriggerService(db));
const fetcherOk = (async () =>
	Response.json({ ok: true, result: true })) as unknown as typeof fetch;

async function cauZalo(): Promise<YeuCauHoi> {
	const nguoi = await gieoNguoi("member");
	const ra = await db.$transaction((tx) =>
		hoiTacTu(
			tx,
			{
				messageId: ma("msg"),
				chatId: ma("chat"),
				text: "Công tác phí một ngày bao nhiêu?",
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
		{ cauHoi: "Thử việc bao lâu?" },
	);
	return hoiId;
}

type KetGiai = { markdown: string; ms: number };

async function giai(goc: string): Promise<KetGiai> {
	const bd = performance.now();
	const ra = await batDau({ type: "session.started" }, ctxBatDauThat(goc));
	return { markdown: ra?.markdown ?? "", ms: performance.now() - bd };
}

type Duong = {
	ten: "zalo" | "crm";
	chay: (coHook: boolean) => Promise<{ ket: KetGiai; hoiId: string }>;
};

const DUONG: readonly Duong[] = [
	{
		ten: "zalo",
		chay: async (coHook) => {
			const y = await cauZalo();
			const goc = ma("ses-zalo");
			let ket: KetGiai = { markdown: "", ms: 0 };
			await moPhien(y, {
				hoi: async (yc) => {
					if (coHook) await chayHook(goc, yc.auth.attributes);
					ket = await giai(goc);
					return { id: goc };
				},
				fetcher: fetcherOk,
				token: "zkd-token",
				messageId: y.hoiId,
			});
			const hang = await db.taiLieuHoi.findUnique({
				where: { zaloHoiId: y.hoiId },
				select: { id: true },
			});
			return { ket, hoiId: hang?.id ?? "" };
		},
	},
	{
		ten: "crm",
		chay: async (coHook) => {
			const hoiId = await cauCrm();
			const goc = ma("ses-kho");
			let ket: KetGiai = { markdown: "", ms: 0 };
			const send = (async (_tin: string, tuy: GuiTuy) => {
				if (coHook) await chayHook(goc, tuy.auth.attributes);
				ket = await giai(goc);
				return { id: goc };
			}) as unknown as SendKho;
			await guiHoiKho(hoiId, send);
			return { ket, hoiId };
		},
	},
];

afterAll(async () => {
	await db.agentEvent.deleteMany({ where: { type: HOI.saiCho } });
	await donTroLyKho();
});

describe("zkd-chi-dan", () => {
	test("zkd-chi-dan: hai duong viet truoc", () => {
		expect(DUONG.map((d) => d.ten)).toEqual(["zalo", "crm"]);
	});

	for (const d of DUONG) {
		test(`zkd-chi-dan: tim-ngay ${d.ten} — hook da ghi thi chi dan mang ma cau o lan tra dau`, async () => {
			const { ket, hoiId } = await d.chay(true);
			expect(hoiId).not.toBe("");
			expect({
				duong: d.ten,
				coMa: ket.markdown.includes(`Question id: ${hoiId}`),
			}).toEqual({
				duong: d.ten,
				coMa: true,
			});
			expect({ duong: d.ten, nhanh: ket.ms < HOI.timHoi.cachMs }).toEqual({
				duong: d.ten,
				nhanh: true,
			});
		});

		test(`zkd-chi-dan: chieu do ${d.ten} — khong co hook, lien ket ghi sau cua so tra thi nhan chi dan dung`, async () => {
			const { ket } = await d.chay(false);
			expect({ duong: d.ten, markdown: ket.markdown }).toEqual({
				duong: d.ten,
				markdown: HOI.dungLai.chiDan,
			});
			expect(ket.ms).toBeGreaterThanOrEqual(CUA_SO_MS - HOI.timHoi.cachMs);
		});
	}

	test("zkd-chi-dan: dung-lai — khong co cau hoi thi khong nem, tra chi dan dung, mot su kien sai cho, mot canh bao", async () => {
		const warn = spyOn(console, "warn");
		const ctx = ctxBatDauThat(ma("ses-trong"));
		const ra = await batDau({ type: "session.started" }, ctx);
		const canhBao = warn.mock.calls.filter(
			(c) => String(c[0]) === HOI.dungLai.canhBao,
		);
		warn.mockRestore();
		const markdown = ra?.markdown ?? "";
		expect(markdown).toBe(HOI.dungLai.chiDan);
		expect(markdown).not.toContain("Question id");
		expect(markdown).not.toBe(LOI_DAN);
		expect(
			await db.agentEvent.count({
				where: { type: HOI.saiCho, sessionId: ctx.session.id },
			}),
		).toBe(1);
		expect(canhBao).toHaveLength(1);
	});
});
