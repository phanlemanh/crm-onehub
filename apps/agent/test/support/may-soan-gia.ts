import { db } from "@crm/db";
import type { SendFn } from "eve/channels";
import hookDong from "../../agent/hooks/dong-may-soan";
import type { BanNop } from "../../agent/lib/tai-lieu-nop";
import hookSo from "../../agent/subagents/may_soan/hooks/so-chi-phi";
import loiDanMaySoan from "../../agent/subagents/may_soan/instructions";
import nopBanDeXuat from "../../agent/subagents/may_soan/tools/nop_ban_de_xuat";

type ThuocTinh = Record<string, string>;

export type CtxMaySoan = {
	session: {
		id: string;
		parent?: { sessionId: string; rootSessionId: string } | null;
		auth: {
			current: { attributes: ThuocTinh };
			initiator: { attributes: ThuocTinh };
		};
	};
};

export type GoiGia = {
	nguonId: string;
	trangThaiLucGoi: string;
	ctx: CtxMaySoan;
	con: CtxMaySoan;
};

export type ModelGia = { send: SendFn; goi: GoiGia[] };

export function sendGia(loi?: Error): ModelGia {
	const goi: GoiGia[] = [];
	let dem = 0;
	const send = (async (
		_tin: Parameters<SendFn>[0],
		tuyChon: { auth: { attributes: ThuocTinh } },
	) => {
		if (loi) throw loi;
		const thuocTinh = tuyChon.auth.attributes;
		const nguonId = thuocTinh.nguonId ?? "";
		const n = await db.taiLieuNguon.findUniqueOrThrow({
			where: { id: nguonId },
			select: { trangThai: true },
		});
		dem += 1;
		const id = `ses-may-soan-${nguonId}-${dem}`;
		goi.push({
			nguonId,
			trangThaiLucGoi: n.trangThai,
			con: ctxCon(id),
			ctx: {
				session: {
					id,
					auth: {
						current: { attributes: thuocTinh },
						initiator: { attributes: thuocTinh },
					},
				},
			},
		});
		return { id };
	}) as unknown as SendFn;
	return { send, goi };
}

let demCon = 0;

export function ctxCon(phienGoc: string): CtxMaySoan {
	demCon += 1;
	return {
		session: {
			id: `ses-con-${phienGoc}-${demCon}`,
			parent: { sessionId: phienGoc, rootSessionId: phienGoc },
			auth: {
				current: { attributes: {} },
				initiator: { attributes: {} },
			},
		},
	};
}

type Execute = (input: BanNop, ctx: CtxMaySoan) => Promise<unknown>;

export async function nop(
	ban: BanNop,
	ctx: CtxMaySoan,
): Promise<string | null> {
	try {
		await (nopBanDeXuat.execute as unknown as Execute)(ban, ctx);
		return null;
	} catch (loi) {
		return loi instanceof Error ? loi.message : String(loi);
	}
}

type XuLyBuoc = (
	event: {
		type: "step.completed";
		meta: { id: string; at: string };
		data: { usage: { inputTokens: number; outputTokens: number } };
	},
	ctx: CtxMaySoan,
) => Promise<void>;

let demBuoc = 0;
export async function buocXong(
	ctx: CtxMaySoan,
	usage: { inputTokens: number; outputTokens: number },
): Promise<void> {
	demBuoc += 1;
	const xuLy = hookSo.events?.["step.completed"] as unknown as XuLyBuoc;
	await xuLy(
		{
			type: "step.completed",
			meta: { id: `buoc-${demBuoc}`, at: new Date().toISOString() },
			data: { usage },
		},
		ctx,
	);
}

type XuLyKetQua = (
	event: { type: "action.result"; data: unknown },
	ctx: CtxMaySoan,
) => Promise<void>;

export async function ketQua(
	ctx: CtxMaySoan,
	isError: boolean,
	message?: string,
): Promise<void> {
	const xuLy = hookDong.events?.["action.result"] as unknown as XuLyKetQua;
	await xuLy(
		{
			type: "action.result",
			data: {
				result: {
					kind: "subagent-result",
					subagentName: "may_soan",
					isError,
					output: message ? { message } : { tomTat: "xong" },
				},
			},
		},
		ctx,
	);
}

type XuLyLoiDan = (
	event: { type: "session.started" },
	ctx: CtxMaySoan,
) => Promise<unknown>;

export async function loiDanNhan(ctx: CtxMaySoan): Promise<string> {
	const dong = loiDanMaySoan as unknown as {
		events: { "session.started": XuLyLoiDan };
	};
	const ra = await dong.events["session.started"](
		{ type: "session.started" },
		ctx,
	);
	return JSON.stringify(ra);
}
