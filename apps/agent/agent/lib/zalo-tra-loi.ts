import { db } from "@crm/db";
import { guiZalo, moTaLoiZalo, zaloGoiTho, zaloToken } from "./zalo-api";
import { ZALO } from "./zalo-config";
import {
	chatCuaToken,
	dongHoi,
	type HangDangHoi,
	hangDangHoi,
	type YeuCauHoi,
} from "./zalo-hoi";
import { locTraLoi } from "./zalo-loc";

export type SuKienZalo = {
	continuationToken?: string;
	hoiId?: string | null;
	sessionId?: string | null;
};

export type PhuThuocTraLoi = {
	fetcher?: typeof fetch;
	now?: () => Date;
	token?: string | null;
};

type TongToken = { vao: number | null; ra: number | null };

const CHON_HANG = {
	id: true,
	messageId: true,
	zaloChatId: true,
	hoiLuc: true,
	sessionId: true,
} as const;

async function timHang(sk: SuKienZalo): Promise<HangDangHoi | null> {
	if (sk.hoiId) {
		return db.zaloHoi.findFirst({
			where: { id: sk.hoiId, ketQua: "dang-hoi" },
			select: CHON_HANG,
		});
	}
	const chat = chatCuaToken(sk.continuationToken);
	return chat ? hangDangHoi(chat) : null;
}

function ghiLac(sk: SuKienZalo, suKien: string): void {
	console.error(
		`[zalo] ${suKien} khong con cau dang hoi hoiId=${sk.hoiId ?? "?"} zaloChatId=${chatCuaToken(sk.continuationToken) ?? "?"}`,
	);
}

async function tongToken(
	sessionId: string | null,
	tu: Date,
): Promise<TongToken> {
	if (!sessionId) return { vao: null, ra: null };
	const [dong] = await db.$queryRaw<
		{ vao: number | null; ra: number | null }[]
	>`
		SELECT
			SUM(("data"->'usage'->>'inputTokens')::numeric)::int AS vao,
			SUM(("data"->'usage'->>'outputTokens')::numeric)::int AS ra
		FROM "agentEvent"
		WHERE "sessionId" = ${sessionId}
			AND "type" = 'step.completed'
			AND "emittedAt" >= ${tu}
	`;
	return { vao: dong?.vao ?? null, ra: dong?.ra ?? null };
}

async function tokenBot(deps: PhuThuocTraLoi): Promise<string | null> {
	return deps.token === undefined ? zaloToken() : deps.token;
}

export async function traLoiVe(
	sk: SuKienZalo,
	text: string,
	deps: PhuThuocTraLoi = {},
): Promise<void> {
	const hang = await timHang(sk);
	if (!hang) {
		ghiLac(sk, "tra loi");
		return;
	}
	const now = (deps.now ?? (() => new Date()))();
	const token = await tongToken(sk.sessionId ?? hang.sessionId, hang.hoiLuc);
	const daDong = await dongHoi(hang.id, {
		ketQua: "da-tra-loi",
		traLoiLuc: now,
		doTreMs: now.getTime() - hang.hoiLuc.getTime(),
		tokenVao: token.vao,
		tokenRa: token.ra,
	});
	if (!daDong) {
		ghiLac(sk, "tra loi");
		return;
	}
	const bot = await tokenBot(deps);
	try {
		if (!bot) throw new Error("khong co token bot");
		for (const phan of locTraLoi(text)) {
			await guiZalo(bot, hang.zaloChatId, phan, { fetcher: deps.fetcher });
		}
	} catch (loi) {
		console.error(
			`[zalo] gui tra loi hong message_id=${hang.messageId}: ${loi instanceof Error ? moTaLoiZalo(loi) : "khong-ro"}`,
		);
		await db.zaloHoi.update({
			where: { id: hang.id },
			data: { ketQua: "gui-hong" },
		});
	}
}

async function dongVaBao(
	sk: SuKienZalo,
	cau: string,
	deps: PhuThuocTraLoi,
): Promise<void> {
	const hang = await timHang(sk);
	if (!hang) {
		ghiLac(sk, "loi");
		return;
	}
	if (!(await dongHoi(hang.id, { ketQua: "loi" }))) return;
	const bot = await tokenBot(deps);
	if (!bot) return;
	try {
		await guiZalo(bot, hang.zaloChatId, cau, { fetcher: deps.fetcher });
	} catch (loi) {
		console.error(
			`[zalo] gui bao loi hong message_id=${hang.messageId}: ${loi instanceof Error ? moTaLoiZalo(loi) : "khong-ro"}`,
		);
	}
}

export async function capNhatToken(sk: SuKienZalo): Promise<void> {
	if (!sk.hoiId) return;
	const hang = await db.zaloHoi.findUnique({
		where: { id: sk.hoiId },
		select: { hoiLuc: true, sessionId: true },
	});
	if (!hang) return;
	const token = await tongToken(sk.sessionId ?? hang.sessionId, hang.hoiLuc);
	if (token.vao === null && token.ra === null) return;
	await db.zaloHoi.update({
		where: { id: sk.hoiId },
		data: { tokenVao: token.vao, tokenRa: token.ra },
	});
}

export async function loiVe(
	sk: SuKienZalo,
	deps: PhuThuocTraLoi = {},
): Promise<void> {
	await dongVaBao(sk, ZALO.loi.tacTuLoi, deps);
}

export async function canHoiLai(
	sk: SuKienZalo,
	doiToken: (token: string) => void,
	deps: PhuThuocTraLoi = {},
): Promise<void> {
	doiToken(`${ZALO.hoi.tienToBo}${sk.hoiId ?? Date.now()}`);
	await dongVaBao(sk, ZALO.loi.canHoiLai, deps);
}

export type PhuThuocMoPhien = {
	hoi: (y: YeuCauHoi) => Promise<{ id: string }>;
	fetcher: typeof fetch;
	token: string;
	messageId: string;
};

export async function moPhien(
	y: YeuCauHoi,
	deps: PhuThuocMoPhien,
): Promise<void> {
	try {
		await zaloGoiTho(deps.fetcher, deps.token, "sendChatAction", {
			chat_id: y.chatId,
			action: "typing",
		});
	} catch (loi) {
		console.error(
			`[zalo] sendChatAction hong message_id=${deps.messageId}: ${loi instanceof Error ? moTaLoiZalo(loi) : "khong-ro"}`,
		);
	}
	try {
		const phien = await deps.hoi(y);
		await db.zaloHoi.updateMany({
			where: { id: y.hoiId },
			data: { sessionId: phien.id },
		});
	} catch (loi) {
		console.error(
			`[zalo] khong mo duoc phien message_id=${deps.messageId}: ${loi instanceof Error ? moTaLoiZalo(loi) : "khong-ro"}`,
		);
		await loiVe(
			{ hoiId: y.hoiId },
			{ fetcher: deps.fetcher, token: deps.token },
		);
	}
}
