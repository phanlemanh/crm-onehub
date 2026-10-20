import { appendFileSync } from "node:fs";
import { db } from "@crm/db";
import { defineEval, type EveEvalContext } from "eve/evals";
import { ZALO } from "../../agent/lib/zalo-config";
import {
	CAU_THU_HAI_ENV,
	docKeHoachCauThuHai,
	type KeHoachCauThuHai,
	type KetQuaCauThuHai,
} from "./cau-thu-hai-ke-hoach";

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;

const CAU_HAI = {
	khoDo: /\/crm_[a-z0-9_]+_do(\?|$)/,
	choCauMs: 4 * MINUTE_MS,
	nhipMs: 500,
	langMs: 5 * SECOND_MS,
	timeoutMs: 40 * MINUTE_MS,
	dangHoi: "dang-hoi",
} as const;

type Moi = { keHoach: KeHoachCauThuHai; ra: string };

function moiTruong(t: EveEvalContext): Moi | null {
	const url = process.env.DATABASE_URL ?? "";
	const tep = process.env[CAU_THU_HAI_ENV.keHoach]?.trim() ?? "";
	const ra = process.env[CAU_THU_HAI_ENV.ketQua]?.trim() ?? "";
	if (!CAU_HAI.khoDo.test(url) || !tep || !ra) {
		t.skip(
			"Chỉ chạy qua _acceptance/zalo-cau-thu-hai-lien-ket/rang/do.ts trên kho đo dùng-một-lần.",
		);
		return null;
	}
	return { keHoach: docKeHoachCauThuHai(tep), ra };
}

async function cho<T>(
	doc: () => Promise<T | null>,
	signal: AbortSignal,
	toiDaMs: number,
): Promise<T | null> {
	const het = Date.now() + toiDaMs;
	while (Date.now() < het && !signal.aborted) {
		const v = await doc();
		if (v) return v;
		await new Promise((r) => setTimeout(r, CAU_HAI.nhipMs));
	}
	return null;
}

type Chuoi = KeHoachCauThuHai["chuoi"][number];
type Cau = Chuoi["cau"][number];

async function hoiMotCau(
	t: EveEvalContext,
	nguoi: string,
	thuTu: number,
	c: Cau,
): Promise<KetQuaCauThuHai> {
	const chuaCo: KetQuaCauThuHai = {
		nguoi,
		thuTu,
		maCau: c.maCau,
		messageId: c.messageId,
		guiLuc: Date.now(),
		zaloHoiId: null,
		sessionId: null,
		ketQua: null,
		tlhId: null,
		tlhZaloHoiId: null,
		tlhTrangThai: null,
		tlhLyDo: null,
		loi: null,
	};
	const r = await t.target.fetch(ZALO.webhook.duong, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			[ZALO.webhook.header]: process.env.ZALO_WEBHOOK_SECRET ?? "",
		},
		body: c.than,
	});
	if (r.status !== ZALO.http.ok)
		return { ...chuaCo, loi: `webhook ${r.status}` };
	const xong = await cho(
		async () => {
			const h = await db.zaloHoi.findUnique({
				where: { messageId: c.messageId },
			});
			return h && h.ketQua !== CAU_HAI.dangHoi ? h : null;
		},
		t.signal,
		CAU_HAI.choCauMs,
	);
	if (xong) await new Promise((r) => setTimeout(r, CAU_HAI.langMs));
	const h =
		xong ??
		(await db.zaloHoi.findUnique({ where: { messageId: c.messageId } }));
	if (!h) return { ...chuaCo, loi: "khong co hang zaloHoi" };
	const tlh = await db.taiLieuHoi.findUnique({
		where: { zaloHoiId: h.id },
		select: { id: true, zaloHoiId: true, trangThai: true, lyDo: true },
	});
	t.log(`${nguoi} cau ${thuTu}: ${h.ketQua} phien ${h.sessionId ?? "?"}`);
	return {
		...chuaCo,
		zaloHoiId: h.id,
		sessionId: h.sessionId,
		ketQua: h.ketQua,
		tlhId: tlh?.id ?? null,
		tlhZaloHoiId: tlh?.zaloHoiId ?? null,
		tlhTrangThai: tlh?.trangThai ?? null,
		tlhLyDo: tlh?.lyDo ?? null,
		loi: xong ? null : "het-cho",
	};
}

async function hoiCaChuoi(
	t: EveEvalContext,
	ch: Chuoi,
	ra: string,
): Promise<void> {
	for (const [i, c] of ch.cau.entries()) {
		const kq = await hoiMotCau(t, ch.nguoi, i + 1, c);
		appendFileSync(ra, `${JSON.stringify(kq)}\n`);
	}
}

export default defineEval({
	description:
		"Câu Zalo thứ hai, thứ ba trong ngày: mỗi người gửi ba tin kho liên tiếp qua /zalo/webhook, cùng một phiên gốc eve; trợ lý kho phải nhận đúng câu của lượt.",
	tags: ["tro-ly-kho", "zalo", "integration"],
	timeoutMs: CAU_HAI.timeoutMs,
	async test(t) {
		const m = moiTruong(t);
		if (!m) return;
		await Promise.all(m.keHoach.chuoi.map((ch) => hoiCaChuoi(t, ch, m.ra)));
	},
});
