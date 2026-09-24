import { z } from "zod";

const thanGoi = z.record(z.string(), z.string());

export type LoiGoiZalo = { method: string; body: z.infer<typeof thanGoi> };

export type TinGia = {
	messageId: string;
	fromId: string;
	ten?: string;
	text?: string;
	hong?: boolean;
};

export type TinDen = { giay: number; than: unknown };

export type ChonZaloGia = {
	tin?: TinGia[];
	getMe?: "ok" | 401;
	send?: "ok" | 500 | "ok-false";
	vatVoTan?: boolean;
	chiGiaoKhiMo?: TinDen[];
};

export const TRAN_BAO_VE_VO_TAN = 100;

const HET_TIN = { ok: false, error_code: 408, description: "timeout" };

const HET_TIN_THAT = {
	ok: false,
	description: "Request timeout",
	error_code: 408,
};

function traDatWebhook(url: string): Response {
	return Response.json({
		ok: true,
		result: {
			url,
			updated_at: 1,
			verification: {
				ok: true,
				url,
				outcome: "webhook.ok",
				hint: "Your endpoint responded successfully.",
			},
		},
	});
}

function traXoaWebhook(): Response {
	return Response.json({ ok: true, result: { url: "", updated_at: 1 } });
}

function hangGiaoKhiMo(dau: TinDen[]) {
	const hang = [...dau].sort((x, y) => x.giay - y.giay);
	let giay = 0;
	const goi = (timeoutGiay: number): Response => {
		const tu = giay;
		const den = tu + timeoutGiay;
		while (hang.length > 0 && (hang[0]?.giay ?? den) < tu) hang.shift();
		const dauHang = hang[0];
		if (dauHang && dauHang.giay < den) {
			hang.shift();
			giay = dauHang.giay;
			return Response.json(dauHang.than);
		}
		giay = den;
		return Response.json(HET_TIN_THAT);
	};
	return {
		goi,
		datDongHo: (moi: number) => {
			giay = moi;
		},
		dongHo: () => giay,
	};
}

function traGetMe(chon: ChonZaloGia): Response {
	if (chon.getMe === 401) {
		return Response.json(
			{ ok: false, error_code: 401, description: "Unauthorized" },
			{ status: 401 },
		);
	}
	return Response.json({
		ok: true,
		result: {
			id: "b1",
			account_name: "Bot OneHub",
			account_type: "BASIC",
			can_join_groups: false,
		},
	});
}

function traSend(chon: ChonZaloGia, soGoi: number): Response {
	if (chon.send === 500) return new Response("loi", { status: 500 });
	if (chon.send === "ok-false") {
		return Response.json({
			ok: false,
			error_code: 400,
			description: "blocked",
		});
	}
	return Response.json({
		ok: true,
		result: { message_id: `s${soGoi}`, date: 1 },
	});
}

function traTin(t: TinGia): Response {
	const from = t.hong
		? { display_name: "x", is_bot: false }
		: { id: t.fromId, display_name: t.ten ?? `Ten ${t.fromId}`, is_bot: false };
	return Response.json({
		ok: true,
		result: {
			message: {
				from,
				chat: { id: t.fromId, chat_type: "PRIVATE" },
				text: t.text,
				message_id: t.messageId,
				date: 1,
			},
			event_name: "message.text.received",
		},
	});
}

export function zaloGia(chon: ChonZaloGia = {}) {
	const goi: LoiGoiZalo[] = [];
	const hang = [...(chon.tin ?? [])];
	let soTinVoTan = 0;
	const tinKe = (): TinGia | undefined => {
		if (!chon.vatVoTan) return hang.shift();
		if (soTinVoTan >= TRAN_BAO_VE_VO_TAN) return undefined;
		soTinVoTan += 1;
		return { messageId: `v${soTinVoTan}`, fromId: "zv", text: "chao" };
	};
	const giaoKhiMo = hangGiaoKhiMo(chon.chiGiaoKhiMo ?? []);
	const fetcher = (async (input: RequestInfo | URL, init?: RequestInit) => {
		const method = String(input).split("/").at(-1) ?? "";
		const body = thanGoi.parse(JSON.parse(String(init?.body ?? "{}")));
		goi.push({ method, body });
		if (method === "getMe") return traGetMe(chon);
		if (method === "sendMessage") return traSend(chon, goi.length);
		if (method === "setWebhook") return traDatWebhook(body.url ?? "");
		if (method === "deleteWebhook") return traXoaWebhook();
		if (chon.chiGiaoKhiMo) return giaoKhiMo.goi(Number(body.timeout ?? "0"));
		const t = tinKe();
		return t ? traTin(t) : Response.json(HET_TIN, { status: 408 });
	}) as typeof fetch;
	const guiToi = (id: string) =>
		goi.filter((g) => g.method === "sendMessage" && g.body.chat_id === id);
	const soGoi = (method: string) =>
		goi.filter((g) => g.method === method).length;
	return {
		fetcher,
		goi,
		guiToi,
		soGoi,
		datDongHo: giaoKhiMo.datDongHo,
		dongHo: giaoKhiMo.dongHo,
	};
}
