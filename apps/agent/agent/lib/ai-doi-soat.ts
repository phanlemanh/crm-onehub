import { db } from "@crm/db";
import { PRIORITY } from "@crm/db/agent-tasks";
import {
	chiTieuKhung,
	ghiDoiSoat,
	khungThangUTC,
	thangTruoc,
	thangVN,
} from "@crm/db/ai-chi-phi";
import { ketQuaDoiSoat } from "@crm/db/ai-chi-phi-danh-muc";
import { lockIdempotencyKey } from "@crm/db/idempotency";
import { z } from "zod";
import { completeTask, type LeasedTask } from "./tasks";

export const AI_DOI_SOAT = {
	ngayChay: 2,
	gioChayVN: 9,
	lyDo: "ai-doi-soat",
	baoCaoUrl: "https://ai-gateway.vercel.sh/v1/report",
	hetGioMs: 30_000,
} as const;

export class KhongCoKhoaRieng extends Error {}

export type BaoCaoGateway = (khung: {
	tu: string;
	den: string;
}) => Promise<number>;

export class LoiGateway extends Error {
	constructor(readonly ma: string) {
		super(ma);
	}
}

const baoCaoGatewayDoc = z.object({
	results: z.array(z.object({ total_cost: z.number() })),
});

export const baoCaoGatewayThat: BaoCaoGateway = async ({ tu, den }) => {
	const khoa = process.env.AI_GATEWAY_API_KEY?.trim();
	if (!khoa) throw new KhongCoKhoaRieng();
	const url = new URL(AI_DOI_SOAT.baoCaoUrl);
	url.searchParams.set("start_date", tu);
	url.searchParams.set("end_date", den);
	url.searchParams.set("group_by", "day");
	url.searchParams.set("api_key_id", "self");
	const r = await fetch(url, {
		headers: { authorization: `Bearer ${khoa}` },
		signal: AbortSignal.timeout(AI_DOI_SOAT.hetGioMs),
	});
	if (!r.ok) throw new LoiGateway(String(r.status));
	const doc = baoCaoGatewayDoc.safeParse(await r.json());
	if (!doc.success) throw new LoiGateway("bao-cao-khong-doc-duoc");
	return doc.data.results.reduce((s, dong) => s + dong.total_cost, 0);
};

const payloadDoiSoat = z.object({ thang: z.string().regex(/^\d{4}-\d{2}$/) });

const ngay = (d: Date) => d.toISOString().slice(0, 10);

function maLoi(loi: unknown): string {
	if (loi instanceof KhongCoKhoaRieng) return "khong-co-khoa-rieng";
	if (loi instanceof LoiGateway) return `loi-gateway:${loi.ma}`;
	return `loi-gateway:${loi instanceof Error ? loi.name : "khong-ro"}`;
}

export async function chayDoiSoat(
	task: Pick<LeasedTask, "id" | "payload">,
	baoCao: BaoCaoGateway = baoCaoGatewayThat,
): Promise<void> {
	const p = payloadDoiSoat.safeParse(task.payload);
	if (!p.success) {
		await completeTask(task.id, "hong:payload");
		return;
	}
	const { thang } = p.data;
	const { tu, den } = khungThangUTC(thang);
	const soSo = (await chiTieuKhung(db, tu, den)).tongUsd;
	try {
		const soGateway = await baoCao({
			tu: ngay(tu),
			den: ngay(new Date(den.getTime() - 1)),
		});
		const kq = ketQuaDoiSoat(soSo, soGateway);
		await ghiDoiSoat(db, {
			thang,
			soSoUsd: soSo,
			soGatewayUsd: soGateway,
			lechPhanTram: kq.lechPhanTram,
			ketQua: kq.ketQua,
			lyDo: null,
		});
		await completeTask(task.id, `doi-soat:${kq.ketQua}`);
	} catch (loi) {
		const lyDo = maLoi(loi);
		await ghiDoiSoat(db, {
			thang,
			soSoUsd: soSo,
			soGatewayUsd: null,
			lechPhanTram: null,
			ketQua: "khong-doi-soat-duoc",
			lyDo,
		});
		await completeTask(task.id, `doi-soat:khong-doi-soat-duoc:${lyDo}`);
	}
}

export async function lenLichDoiSoat(now: Date = new Date()): Promise<boolean> {
	const thang = thangTruoc(thangVN(now));
	const subject = `ai-doi-soat:${thang}`;
	const hai = (n: number) => String(n).padStart(2, "0");
	const hanNgay = new Date(
		`${thangVN(now)}-${hai(AI_DOI_SOAT.ngayChay)}T${hai(AI_DOI_SOAT.gioChayVN)}:00:00+07:00`,
	);
	if (now < hanNgay) return false;
	const da = await db.agentTask.findFirst({
		where: { kind: "ai-doi-soat", subject },
		select: { id: true },
	});
	if (da) return false;
	return db.$transaction(async (tx) => {
		await lockIdempotencyKey(tx, subject);
		const co = await tx.agentTask.findFirst({
			where: { kind: "ai-doi-soat", subject },
			select: { id: true },
		});
		if (co) return false;
		await tx.agentTask.create({
			data: {
				kind: "ai-doi-soat",
				reason: AI_DOI_SOAT.lyDo,
				subject,
				priority: PRIORITY.aiDoiSoat,
				budget: 0,
				dueAt: now,
				payload: { thang },
			},
		});
		return true;
	});
}
