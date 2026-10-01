import { appendFileSync } from "node:fs";
import { db } from "@crm/db";
import { defineEval, type EveEvalContext } from "eve/evals";
import { equals } from "eve/evals/expect";
import { TAI_LIEU_AGENT } from "../../agent/lib/tai-lieu-config";
import { ZALO } from "../../agent/lib/zalo-config";
import {
	CHAM_BO_DO_ENV,
	docKeHoach,
	type KeHoachChamBoDo,
	type KetQuaChamBoDo,
} from "./ke-hoach";

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;

const CHAM = {
	khoDo: /\/crm_[a-z0-9_]+_do(\?|$)/,
	dispatch: "/internal/crm/dispatch",
	cho: {
		hoiMs: TAI_LIEU_AGENT.hoi.hanTraLoiMs + MINUTE_MS,
		zaloMs: 4 * MINUTE_MS,
		luotMs: MINUTE_MS,
		nhipMs: 500,
	},
	timeoutMs: 45 * MINUTE_MS,
	dangHoi: "dang-hoi",
} as const;

type SuKien = { readonly type: string; readonly data?: unknown };
type Moi = {
	url: string;
	secret: string;
	keHoach: KeHoachChamBoDo;
	ra: string;
};

function moiTruong(t: EveEvalContext): Moi | null {
	const url = process.env.DATABASE_URL ?? "";
	const secret = process.env.AGENT_BRIDGE_SECRET?.trim() ?? "";
	const tep = process.env[CHAM_BO_DO_ENV.keHoach]?.trim() ?? "";
	const ra = process.env[CHAM_BO_DO_ENV.ketQua]?.trim() ?? "";
	if (!CHAM.khoDo.test(url) || !secret || !tep || !ra) {
		t.skip(
			"Chỉ chạy qua _acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts trên kho đo dùng-một-lần.",
		);
		return null;
	}
	return { url, secret, keHoach: docKeHoach(tep), ra };
}

function chia<T>(ds: readonly T[], co: number): T[][] {
	return Array.from({ length: Math.ceil(ds.length / co) }, (_, i) =>
		ds.slice(i * co, (i + 1) * co),
	);
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
		await new Promise((r) => setTimeout(r, CHAM.cho.nhipMs));
	}
	return null;
}

function tenCon(events: readonly SuKien[]): string[] {
	return events.flatMap((e) => {
		if (e.type !== "subagent.called") return [];
		const ten = (e.data as { name?: string } | undefined)?.name;
		return ten ? [ten] : [];
	});
}

async function conDaGoi(t: EveEvalContext, phien: string): Promise<string[]> {
	const hen = new Promise<null>((r) =>
		setTimeout(() => r(null), CHAM.cho.luotMs),
	);
	const luot = await Promise.race([t.target.watchTurn(phien).result(), hen]);
	return luot ? tenCon(luot.events) : [];
}

function ghi(ra: string, kq: KetQuaChamBoDo): void {
	appendFileSync(ra, `${JSON.stringify(kq)}\n`);
}

const luotMot = defineEval({
	description:
		"Chấm bộ câu đo — lượt một: mỗi câu là một hàng hỏi kênh CRM, /internal/crm/dispatch mở phiên eve thật và tro_ly_kho trả lời.",
	tags: ["tro-ly-kho", "integration"],
	timeoutMs: CHAM.timeoutMs,
	async test(t) {
		const m = moiTruong(t);
		if (!m) return;
		for (const lo of chia(m.keHoach.mot, m.keHoach.lo)) {
			const hang = await Promise.all(
				lo.map((c) =>
					db.taiLieuHoi.create({
						data: { nguoiHoiId: c.nguoiId, kenh: "CRM", cauHoi: c.cau },
						select: { id: true },
					}),
				),
			);
			const ids = hang.map((h) => h.id);
			const r = await t.target.fetch(CHAM.dispatch, {
				method: "POST",
				headers: { authorization: `Bearer ${m.secret}` },
			});
			await t.require(r.status, equals(202));
			const xong = await cho(
				async () =>
					(await db.taiLieuHoi.count({
						where: { id: { in: ids }, trangThai: "DANG_HOI" },
					})) === 0 || null,
				t.signal,
				CHAM.cho.hoiMs,
			);
			for (const [i, c] of lo.entries()) {
				const hoiId = ids[i] ?? "";
				const h = await db.taiLieuHoi.findUniqueOrThrow({
					where: { id: hoiId },
					select: { phienId: true },
				});
				const phienId = h.phienId?.startsWith("gui:") ? null : h.phienId;
				ghi(m.ra, {
					luot: 1,
					id: c.id,
					hoiId,
					phienId,
					conGoi: phienId ? await conDaGoi(t, phienId) : [],
					loi: xong ? null : "het-cho",
				});
			}
		}
	},
});

async function hoiQuaZalo(
	t: EveEvalContext,
	c: KeHoachChamBoDo["hai"][number],
): Promise<KetQuaChamBoDo> {
	const { messageId } = c;
	const r = await t.target.fetch(ZALO.webhook.duong, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			[ZALO.webhook.header]: process.env.ZALO_WEBHOOK_SECRET ?? "",
		},
		body: c.than,
	});
	const chuaCo = {
		luot: 2 as const,
		id: c.id,
		messageId,
		zaloHoiId: null,
		phienId: null,
		ketQua: null,
		conGoi: [],
	};
	if (r.status !== ZALO.http.ok)
		return { ...chuaCo, loi: `webhook ${r.status}` };
	const gui = Date.now();
	let thayPhien = false;
	const daXong = await cho(
		async () => {
			const h = await db.zaloHoi.findUnique({ where: { messageId } });
			if (h?.sessionId && !thayPhien) {
				thayPhien = true;
				t.log(`${c.id}: zaloHoi.sessionId sau ${Date.now() - gui} ms`);
			}
			return h && h.ketQua !== CHAM.dangHoi ? h : null;
		},
		t.signal,
		CHAM.cho.zaloMs,
	);
	const h = daXong ?? (await db.zaloHoi.findUnique({ where: { messageId } }));
	if (!h) return { ...chuaCo, loi: "khong co hang zaloHoi" };
	return {
		...chuaCo,
		zaloHoiId: h.id,
		phienId: h.sessionId,
		ketQua: h.ketQua,
		conGoi: h.sessionId ? await conDaGoi(t, h.sessionId) : [],
		loi: daXong ? null : "het-cho",
	};
}

const luotHai = defineEval({
	description:
		"Chấm bộ câu đo — lượt hai: mỗi câu là một tin Zalo qua /zalo/webhook, phiên agent gốc purpose zalo của eve quyết có chuyển cho tro_ly_kho không.",
	tags: ["tro-ly-kho", "integration"],
	timeoutMs: CHAM.timeoutMs,
	async test(t) {
		const m = moiTruong(t);
		if (!m) return;
		for (const lo of chia(m.keHoach.hai, m.keHoach.lo)) {
			const kq = await Promise.all(lo.map((c) => hoiQuaZalo(t, c)));
			for (const k of kq) ghi(m.ra, k);
		}
	},
});

export default [luotMot, luotHai];
