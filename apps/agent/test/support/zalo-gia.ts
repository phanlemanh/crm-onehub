import { z } from "zod";

const thanGoi = z.record(z.string(), z.string());

export type LoiGoiZalo = {
	method: string;
	token: string;
	body: z.infer<typeof thanGoi>;
};

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
	getMe?: "ok" | 401 | 500 | "la" | "ok-false-401" | "ok-false-500" | "mang";
	getMeTho?: { http: number; than: "chu" | { ma: number } };
	tenBot?: string;
	send?: "ok" | 500 | "ok-false" | "la";
	vatVoTan?: boolean;
	chiGiaoKhiMo?: TinDen[];
	webhookInfo?: 404 | 500 | "la" | { url: string };
	setWebhook?: "ok-false" | "loi-mang" | { outcome: string };
	goiNguoc?: (url: string, khoa: string) => Promise<number>;
};

export const TRAN_BAO_VE_VO_TAN = 100;

const HET_TIN = { ok: false, error_code: 408, description: "timeout" };

const HET_TIN_THAT = {
	ok: false,
	description: "Request timeout",
	error_code: 408,
};

function traDatWebhook(url: string, outcome = "webhook.ok"): Response {
	return Response.json({
		ok: true,
		result: {
			url,
			updated_at: 1,
			verification: {
				ok: true,
				url,
				outcome,
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
	const g = chon.getMeTho;
	if (g) {
		if (g.than === "chu") return new Response("loi", { status: g.http });
		return Response.json(
			{ ok: false, error_code: g.than.ma, description: "x" },
			{ status: g.http },
		);
	}
	if (chon.getMe === 401) {
		return Response.json(
			{ ok: false, error_code: 401, description: "Unauthorized" },
			{ status: 401 },
		);
	}
	if (chon.getMe === 500) return new Response("loi", { status: 500 });
	if (chon.getMe === "la") {
		return Response.json({ ok: true, result: { khac: 1 } });
	}
	if (chon.getMe === "ok-false-401") {
		return Response.json({
			ok: false,
			error_code: 401,
			description: "Unauthorized",
		});
	}
	if (chon.getMe === "ok-false-500") {
		return Response.json({
			ok: false,
			error_code: 500,
			description: "Internal error",
		});
	}
	return Response.json({
		ok: true,
		result: {
			id: "b1",
			account_name: "bot.uipSwwnr",
			account_type: "BASIC",
			can_join_groups: false,
			display_name: chon.tenBot ?? "Bot OneHub",
		},
	});
}

function traWebhookInfo(chon: ChonZaloGia): Response {
	const w = chon.webhookInfo ?? 404;
	if (w === 404) {
		return Response.json(
			{ ok: false, error_code: 404, description: "Not Found" },
			{ status: 404 },
		);
	}
	if (w === 500) return new Response("loi", { status: 500 });
	if (w === "la") return Response.json({ ok: true, result: { khac: 1 } });
	return Response.json({ ok: true, result: { url: w.url, updated_at: 1 } });
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
	if (chon.send === "la") {
		return Response.json({ ok: true, result: { khac: 1 } });
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
	const goiNguoc: number[] = [];
	const hang = [...(chon.tin ?? [])];
	let soTinVoTan = 0;
	const tinKe = (): TinGia | undefined => {
		if (!chon.vatVoTan) return hang.shift();
		if (soTinVoTan >= TRAN_BAO_VE_VO_TAN) return undefined;
		soTinVoTan += 1;
		return { messageId: `v${soTinVoTan}`, fromId: "zv", text: "chao" };
	};
	const giaoKhiMo = hangGiaoKhiMo(chon.chiGiaoKhiMo ?? []);
	const fetcher = (async (
		input: Parameters<typeof fetch>[0],
		init?: RequestInit,
	) => {
		const phan = String(input).split("/");
		const method = phan.at(-1) ?? "";
		const token = (phan.at(-2) ?? "").replace(/^bot/, "");
		const body = thanGoi.parse(JSON.parse(String(init?.body ?? "{}")));
		goi.push({ method, token, body });
		if (method === "getMe") {
			if (chon.getMe === "mang") throw new TypeError("fetch failed");
			return traGetMe(chon);
		}
		if (method === "sendMessage") return traSend(chon, goi.length);
		if (method === "setWebhook") {
			if (chon.goiNguoc) {
				goiNguoc.push(
					await chon.goiNguoc(body.url ?? "", body.secret_token ?? ""),
				);
			}
			const kieu = chon.setWebhook;
			if (kieu === "loi-mang") throw new Error("mang Zalo gia dut");
			if (kieu === "ok-false") {
				return Response.json({
					ok: false,
					error_code: 400,
					description: "bad",
				});
			}
			return traDatWebhook(body.url ?? "", kieu?.outcome);
		}
		if (method === "deleteWebhook") return traXoaWebhook();
		if (method === "getWebhookInfo") return traWebhookInfo(chon);
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
		goiNguoc,
		guiToi,
		soGoi,
		datDongHo: giaoKhiMo.datDongHo,
		dongHo: giaoKhiMo.dongHo,
	};
}
